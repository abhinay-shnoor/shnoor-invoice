import asyncio
import sys
from database import engine, Base, AsyncSessionLocal
from models import user, client, product, invoice, expense, item, timesheet, audit_log, tax_filing, invoice_payment, invoice_log
from models.user import User
from utils.password import get_password_hash

async def init_models():
    async with engine.begin() as conn:
        # Only drop tables if explicitly requested via command line parameter to prevent production data loss
        if "--drop" in sys.argv:
            print("Dropping all existing database tables...")
            await conn.run_sync(Base.metadata.drop_all)
        
        print("Creating database tables if they do not exist...")
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Check if users already exist to avoid duplicate admin creation
        from sqlalchemy import select
        result = await session.execute(select(User).limit(1))
        existing_user = result.scalars().first()
        
        if not existing_user:
            print("No users found. Creating default Super Admin accounts...")
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
            print("Default admin accounts created successfully.")
        else:
            print("Users already exist in database. Skipping default admin account creation.")

if __name__ == "__main__":
    asyncio.run(init_models())
