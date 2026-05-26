import asyncio
from database import engine
from sqlalchemy import text

async def migrate():
    print("Connecting to database to run migrations...")
    async with engine.begin() as conn:
        try:
            print("Adding vendor column...")
            await conn.execute(text("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS vendor VARCHAR"))
        except Exception as e:
            print(f"Vendor column error: {e}")

        try:
            print("Adding payment_method column...")
            await conn.execute(text("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method VARCHAR"))
        except Exception as e:
            print(f"Payment_method column error: {e}")

        try:
            print("Adding notes column...")
            await conn.execute(text("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes VARCHAR"))
        except Exception as e:
            print(f"Notes column error: {e}")

        try:
            print("Adding status column...")
            await conn.execute(text("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'Pending'"))
            await conn.execute(text("UPDATE expenses SET status = 'Pending' WHERE status IS NULL"))
        except Exception as e:
            print(f"Status column error: {e}")

    print("Migration completed successfully.")

if __name__ == "__main__":
    asyncio.run(migrate())

