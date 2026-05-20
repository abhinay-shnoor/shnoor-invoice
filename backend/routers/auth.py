from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
from models.audit_log import AuditLog
from schemas import auth as schemas_auth
from schemas.user import UserResponse
from utils.password import verify_password, get_password_hash
from utils.jwt_handler import create_access_token
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: schemas_auth.UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    role = "user"
    if "admin" in user_data.email.lower():
        # Only existing admins can create admins, but for first registration, we might allow it?
        # The prompt says: "Only existing admins can: Create new admins". 
        # But for initial setup we need an admin. Let's strictly follow the rule:
        # Admin emails MUST contain "admin". We will assign role="admin" if "admin" in email for simplicity,
        # but the prompt says "Only existing admins can create new admins". 
        # Let's check if there are any admins. If there are none, we can create the first admin.
        admin_result = await db.execute(select(User).filter(User.role == "admin"))
        first_admin = admin_result.scalars().first()
        
        if first_admin is None:
            role = "admin" # First admin
        else:
            raise HTTPException(status_code=403, detail="Only existing admins can create new admins. Please register without 'admin' in email or contact an administrator.")

    hashed_password = get_password_hash(user_data.password)
    new_user = User(name=user_data.name, email=user_data.email, password=hashed_password, role=role)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login")
async def login(user_data: schemas_auth.UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user_data.email))
    user = result.scalars().first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    # Audit log
    audit_log = AuditLog(user_id=user.id, action="User logged in")
    db.add(audit_log)
    await db.commit()
    
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
