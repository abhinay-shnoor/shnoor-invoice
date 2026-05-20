from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models.expense import Expense
from models.user import User
from schemas.expense import ExpenseCreate, ExpenseResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(expense: ExpenseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_expense = Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Expense).filter(Expense.user_id == current_user.id))
    return result.scalars().all()
