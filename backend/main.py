from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, products, clients, expenses, invoices
from database import engine, Base

app = FastAPI(title="SmartInvoice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(clients.router)
app.include_router(expenses.router)
app.include_router(invoices.router)

@app.get("/")
async def root():
    return {"message": "Welcome to SmartInvoice API"}
