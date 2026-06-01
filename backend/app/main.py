from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import engine, Base
from app.routers import products, customers, orders, dashboard

# Automatically create tables in the database on startup
# This guarantees that the SQLite or PostgreSQL schema is instantiated instantly.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-Ready API for managing products, customers, orders, and real-time stock levels.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configurations
# Allow standard localhost development ports and wildcard for seamless hosting deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router, prefix=settings.API_PREFIX)
app.include_router(customers.router, prefix=settings.API_PREFIX)
app.include_router(orders.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "message": f"Welcome to the {settings.PROJECT_NAME} API!",
        "documentation": "/docs"
    }
