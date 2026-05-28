from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_db
from models.client import Client
from models.user import User
from schemas.client import ClientCreate, ClientUpdate, ClientResponse
from middleware.auth import get_current_user
import httpx
from pydantic import BaseModel
from config import settings
from typing import List, Optional

class EmailRequest(BaseModel):
    subject: str
    body: str
    to_email: str
    outstanding_amount: Optional[str] = None
    overdue_days: Optional[str] = None

router = APIRouter(prefix="/api/clients", tags=["clients"])

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(client: ClientCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_client = Client(**client.model_dump(), user_id=current_user.id)
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    return new_client

@router.post("/send-reminder", status_code=status.HTTP_200_OK)
async def send_reminder(request: EmailRequest, current_user: User = Depends(get_current_user)):
    try:
        if settings.RESEND_API_KEY and settings.RESEND_API_KEY != "":
            html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shnoor Invoice Management</title>
<style>
  body {{
    margin: 0;
    padding: 0;
    background-color: #F8FAFC;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }}
  table {{
    border-spacing: 0;
    border-collapse: collapse;
  }}
  td {{
    padding: 0;
  }}
  img {{
    border: 0;
  }}
  a {{
    text-decoration: none;
  }}
  .apple-link-black a {{ color: #0F172A !important; text-decoration: none !important; }}
  .apple-link-gray a {{ color: #64748B !important; text-decoration: none !important; }}
</style>
</head>
<body style="background-color: #F8FAFC; margin: 0; padding: 0;">
  
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%; margin: 0 auto;">
          
          <!-- Header Top (Logo & Support) -->
          <tr>
            <td style="padding: 24px 40px; border-bottom: 2px solid #F1F5F9;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" valign="middle" width="32" height="32" bgcolor="#4F46E5" style="width: 32px; height: 32px; background-color: #4F46E5; border-radius: 8px; color: #ffffff; font-size: 18px; font-weight: bold; font-family: sans-serif;">
                          S
                        </td>
                        <td style="padding-left: 12px; color: #0F172A; font-size: 18px; font-weight: 800; letter-spacing: -0.5px; font-family: sans-serif;">
                          SHNOOR
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="color: #64748B; font-size: 13px; font-weight: 500; font-family: sans-serif; line-height: 1.4;">
                    Need help?<br>
                    <a href="mailto:support@shnoor.com" style="color: #0F172A; font-weight: 600;">support@shnoor.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td align="center" style="padding: 40px 40px 10px 40px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" valign="middle" width="56" height="56" bgcolor="#EEF2FF" style="width: 56px; height: 56px; background-color: #EEF2FF; border-radius: 50%; border: 1px solid #E0E7FF; color: #4F46E5; font-size: 24px;">
                    💳
                  </td>
                </tr>
              </table>
              <h1 style="margin: 24px 0 8px 0; color: #0F172A; font-size: 24px; font-weight: 700; font-family: sans-serif;">Payment Reminder</h1>
              <p style="margin: 0; color: #64748B; font-size: 15px; font-family: sans-serif;"></p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; color: #334155; font-size: 15px; line-height: 1.6; font-family: sans-serif;">
              {request.body.replace(chr(10), '<br>')}
              
              <!-- Invoice Summary Box -->
              """ + (f"""
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 32px; margin-bottom: 32px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #4F46E5; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-family: sans-serif;">Invoice Summary</h3>
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 12px; color: #64748B; font-size: 14px; font-family: sans-serif;">Due Date:</td>
                        <td align="right" style="padding-bottom: 12px; color: #0F172A; font-size: 14px; font-weight: 500; font-family: sans-serif;">Immediate</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 14px; font-family: sans-serif;">Overdue Status:</td>
                        <td align="right" style="padding-bottom: 16px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 14px; font-weight: 500; font-family: sans-serif;">{request.overdue_days}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px; color: #0F172A; font-size: 15px; font-weight: 700; font-family: sans-serif;">Outstanding Amount:</td>
                        <td align="right" style="padding-top: 16px; color: #EF4444; font-size: 16px; font-weight: 700; font-family: sans-serif;">{request.outstanding_amount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              """ if request.outstanding_amount else "") + f"""
              
              <p style="margin: 24px 0 0 0; color: #334155; font-family: sans-serif;">If you have any questions or need assistance, feel free to contact us.</p>
              
              <!-- Centered CTA Button -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 35px;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#4F46E5" style="border-radius: 6px; background: linear-gradient(to right, #4F46E5, #6366f1);">
                          <a href="mailto:support@shnoor.com" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border: 1px solid #4F46E5; border-radius: 6px;">Contact Support</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Signature -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 1px solid #F1F5F9;">
                <tr>
                  <td align="center" style="padding-top: 30px; color: #64748B; font-size: 14px; line-height: 1.6; font-family: sans-serif;">
                    Thank you,<br>
                    <strong style="color: #0F172A;">Shnoor Invoice Management Team</strong>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" max-width="600" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; margin: 24px auto 0 auto;">
          <tr>
            <td align="center" style="color: #94A3B8; font-size: 12px; line-height: 1.6; font-family: sans-serif;">
              &copy; 2026 Shnoor Invoice Management. All rights reserved.<br>
              UAE and Worldwide; 600001, India<br>
              <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 12px;">
                <tr>
                  <td style="padding: 0 8px;"><a href="https://shnoor-invoice.vercel.app" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Website</a></td>
                  <td style="color: #CBD5E1;">|</td>
                  <td style="padding: 0 8px;"><a href="#" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Privacy Policy</a></td>
                  <td style="color: #CBD5E1;">|</td>
                  <td style="padding: 0 8px;"><a href="#" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Unsubscribe</a></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
"""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": "Shnoor Invoice <onboarding@resend.dev>",
                        "to": [request.to_email],
                        "subject": request.subject,
                        "html": html_content
                    }
                )
                
                if response.status_code >= 400:
                    print(f"Resend API Error: {response.text}")
                    raise HTTPException(status_code=500, detail=f"Resend error: {response.text}")
                    
                return {"message": "Email sent successfully via Resend"}
        else:
            print(f"Mock Email Sent (No RESEND_API_KEY set): To: {request.to_email}, Subject: {request.subject}")
            return {"message": "Email mock sent successfully"}
    except Exception as e:
        print(f"Email Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
