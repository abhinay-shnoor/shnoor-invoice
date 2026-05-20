from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models.client import Client
from models.user import User
from schemas.client import ClientCreate, ClientUpdate, ClientResponse
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(client: ClientCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_client = Client(**client.model_dump(), user_id=current_user.id)
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    return new_client

@router.get("/", response_model=List[ClientResponse])
async def get_clients(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Client).filter(Client.user_id == current_user.id))
    return result.scalars().all()

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Client).filter(Client.id == client_id, Client.user_id == current_user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(client_id: int, client_update: ClientUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Client).filter(Client.id == client_id, Client.user_id == current_user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = client_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
        
    await db.commit()
    await db.refresh(client)
    return client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Client).filter(Client.id == client_id, Client.user_id == current_user.id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    await db.delete(client)
    await db.commit()
