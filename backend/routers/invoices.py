from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import date
from database import get_db
from models.invoice import Invoice
from models.user import User
from models.invoice_payment import InvoicePayment
from models.invoice_log import InvoiceLog
from schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse, InvoiceDetailResponse
from schemas.invoice_payment import InvoicePaymentCreate, InvoicePaymentResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

async def check_and_update_overdue(db: AsyncSession, invoice: Invoice):
    if invoice.status not in ["Paid", "Overdue"]:
        if invoice.due_date and invoice.due_date < date.today() and invoice.remaining_amount > 0:
            invoice.status = "Overdue"
            await db.commit()
            await db.refresh(invoice)
    return invoice

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(invoice: InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Initialize remaining_amount to total if not set
    invoice_dict = invoice.model_dump()
    if 'remaining_amount' not in invoice_dict or invoice_dict['remaining_amount'] == 0.0:
        invoice_dict['remaining_amount'] = invoice_dict.get('total', 0.0)
    
    new_invoice = Invoice(**invoice_dict, user_id=current_user.id)
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)
    
    # Check overdue status immediately upon creation
    await check_and_update_overdue(db, new_invoice)
    
    return new_invoice

@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.user_id == current_user.id))
    invoices = result.scalars().all()
    
    # Check for overdue dynamically
    for inv in invoices:
        await check_and_update_overdue(db, inv)
        
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceDetailResponse)
async def get_invoice(invoice_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Invoice).options(
            selectinload(Invoice.payments),
            selectinload(Invoice.logs)
        ).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id)
    )
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await check_and_update_overdue(db, invoice)
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(invoice_id: int, invoice_update: InvoiceUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice_update.model_dump(exclude_unset=True)
    
    log_action = "Invoice Updated"
    
    for key, value in update_data.items():
        setattr(invoice, key, value)
        
    await check_and_update_overdue(db, invoice) # In case due_date changed
        
    db.add(InvoiceLog(invoice_id=invoice.id, user_id=current_user.id, action=log_action))
    
    await db.commit()
    await db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invoice(invoice_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    await db.delete(invoice)
    await db.commit()

@router.post("/{invoice_id}/payments", response_model=InvoicePaymentResponse)
async def record_payment(invoice_id: int, payment: InvoicePaymentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if payment.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")
        
    if payment.amount > invoice.remaining_amount:
        raise HTTPException(status_code=400, detail="Payment amount exceeds remaining balance")
        
    # Create Payment
    new_payment = InvoicePayment(**payment.model_dump(), invoice_id=invoice.id)
    db.add(new_payment)
    
    # Update Invoice amounts
    invoice.amount_paid += payment.amount
    invoice.remaining_amount -= payment.amount
    
    # Auto update status
    old_status = invoice.status
    if invoice.remaining_amount == 0:
        invoice.status = "Paid"
    else:
        # Check if it should be Overdue instead of Partial Paid
        if invoice.due_date and invoice.due_date < date.today():
            invoice.status = "Overdue"
        elif invoice.amount_paid > 0:
            invoice.status = "Partial Paid"

    # Create Audit Log
    db.add(InvoiceLog(
        invoice_id=invoice.id, 
        user_id=current_user.id, 
        action=f"Payment Recorded: {payment.amount}",
        old_value=f"Status: {old_status}, Remaining: {invoice.remaining_amount + payment.amount}",
        new_value=f"Status: {invoice.status}, Remaining: {invoice.remaining_amount}"
    ))
    
    await db.commit()
    await db.refresh(new_payment)
    return new_payment

@router.put("/{invoice_id}/extend-due-date", response_model=InvoiceResponse)
async def extend_due_date(invoice_id: int, new_due_date: date, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can extend due dates")
        
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id)) # Admins can access any
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    old_date = invoice.due_date
    invoice.due_date = new_due_date
    
    # Re-evaluate overdue status
    if invoice.remaining_amount == 0:
        invoice.status = "Paid"
    elif new_due_date < date.today():
        invoice.status = "Overdue"
    else:
        if invoice.amount_paid > 0:
            invoice.status = "Partial Paid"
        else:
            invoice.status = "Pending"
            
    db.add(InvoiceLog(
        invoice_id=invoice.id,
        user_id=current_user.id,
        action="Due Date Extended",
        old_value=str(old_date),
        new_value=str(new_due_date)
    ))
    
    await db.commit()
    await db.refresh(invoice)
    return invoice

@router.put("/{invoice_id}/override-status", response_model=InvoiceResponse)
async def override_status(invoice_id: int, new_status: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can override status")
        
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    old_status = invoice.status
    invoice.status = new_status
    
    db.add(InvoiceLog(
        invoice_id=invoice.id,
        user_id=current_user.id,
        action="Status Overridden",
        old_value=old_status,
        new_value=new_status
    ))
    
    await db.commit()
    await db.refresh(invoice)
    return invoice
