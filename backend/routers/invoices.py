from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models.invoice import Invoice
from models.user import User
from schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(invoice: InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_invoice = Invoice(**invoice.model_dump(), user_id=current_user.id)
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)
    return new_invoice

@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.user_id == current_user.id))
    return result.scalars().all()

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(invoice_id: int, invoice_update: InvoiceUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == current_user.id))
    invoice = result.scalars().first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    update_data = invoice_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(invoice, key, value)
        
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
