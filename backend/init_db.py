import asyncio
from database import engine, Base, AsyncSessionLocal
from models import user, client, product, invoice, expense, item, timesheet, audit_log, tax_filing
from models.user import User
from utils.password import get_password_hash

async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        admin_emails = ["admin@shnoorinvoice.com", "admin@shnoorinvoce.com"]
        hashed_password = get_password_hash("admin123")
        for email in admin_emails:
            admin_user = User(
                name="Super Admin",
                email=email,
                password=hashed_password,
                role="admin"
            )
            session.add(admin_user)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(init_models())
