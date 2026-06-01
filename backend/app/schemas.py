from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

# ----------------- Product Schemas -----------------
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product display name")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique stock keeping unit code")
    price: float = Field(..., ge=0.0, description="Unit price, must be non-negative")
    quantity_in_stock: int = Field(..., ge=0, description="Available stock units, must be non-negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0.0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)

class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Customer Schemas -----------------
class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Customer's full name")
    email: EmailStr = Field(..., description="Unique and valid email address")
    phone: Optional[str] = Field(None, max_length=50, description="Optional contact phone number")

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------- Order Schemas -----------------
class OrderBase(BaseModel):
    customer_id: int = Field(..., description="ID of the customer placing the order")
    product_id: int = Field(..., description="ID of the product being ordered")
    quantity: int = Field(..., gt=0, description="Quantity ordered, must be greater than 0")

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True

# Detailed response showing full customer and product info
class OrderDetailed(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    total_amount: float
    created_at: datetime
    customer: Customer
    product: Product

    class Config:
        from_attributes = True


# ----------------- Dashboard Summary -----------------
class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[Product]
