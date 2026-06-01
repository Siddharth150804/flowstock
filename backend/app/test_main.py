import os
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set up test database url
TEST_DATABASE_URL = "sqlite:///./test_inventory.db"

# Override the database dependency
from app.db import Base, get_db
from app.main import app

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

class TestInventoryAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create the tables in the test SQLite DB
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        # Drop the tables and clean up database file
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_inventory.db"):
            os.remove("./test_inventory.db")

    def setUp(self):
        # Clean up database tables between tests to keep them isolated
        db = TestingSessionLocal()
        for table in reversed(Base.metadata.sorted_tables):
            db.execute(table.delete())
        db.commit()
        db.close()

    def test_root_health_check(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "online")

    def test_product_lifecycle_and_sku_uniqueness(self):
        # 1. Create a product
        payload = {
            "name": "Gaming Keyboard Alpha",
            "sku": "KB-ALPHA",
            "price": 89.99,
            "quantity_in_stock": 25
        }
        response = self.client.post("/api/products", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["name"], payload["name"])
        self.assertEqual(data["sku"], payload["sku"])
        self.assertEqual(data["price"], payload["price"])
        self.assertEqual(data["quantity_in_stock"], payload["quantity_in_stock"])
        product_id = data["id"]

        # 2. Try to create duplicate SKU - should fail (Business Rule)
        response_dup = self.client.post("/api/products", json=payload)
        self.assertEqual(response_dup.status_code, 400)
        self.assertIn("already exists", response_dup.json()["detail"])

        # 3. Retrieve product by ID
        response_get = self.client.get(f"/api/products/{product_id}")
        self.assertEqual(response_get.status_code, 200)
        self.assertEqual(response_get.json()["sku"], "KB-ALPHA")

        # 4. Update product details
        payload_update = {
            "name": "Gaming Keyboard Alpha Pro",
            "price": 99.99,
            "quantity_in_stock": 20
        }
        response_put = self.client.put(f"/api/products/{product_id}", json=payload_update)
        self.assertEqual(response_put.status_code, 200)
        self.assertEqual(response_put.json()["name"], "Gaming Keyboard Alpha Pro")
        self.assertEqual(response_put.json()["price"], 99.99)
        self.assertEqual(response_put.json()["quantity_in_stock"], 20)

    def test_customer_lifecycle_and_email_uniqueness(self):
        # 1. Create a customer
        payload = {
            "name": "Siddharth Malhotra",
            "email": "sidd@example.com",
            "phone": "+91 9876543210"
        }
        response = self.client.post("/api/customers", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["name"], payload["name"])
        self.assertEqual(data["email"], payload["email"])
        self.assertEqual(data["phone"], payload["phone"])
        customer_id = data["id"]

        # 2. Try duplicate email registration - should fail (Business Rule)
        response_dup = self.client.post("/api/customers", json=payload)
        self.assertEqual(response_dup.status_code, 400)
        self.assertIn("already registered", response_dup.json()["detail"])

        # 3. Get all customers
        response_list = self.client.get("/api/customers")
        self.assertEqual(response_list.status_code, 200)
        self.assertEqual(len(response_list.json()), 1)

    def test_order_creation_auto_pricing_and_stock_deduction(self):
        # Setup product
        prod_payload = {
            "name": "Studio Microphone X",
            "sku": "MIC-STUDIO-X",
            "price": 150.00,
            "quantity_in_stock": 10
        }
        prod_res = self.client.post("/api/products", json=prod_payload)
        self.assertEqual(prod_res.status_code, 201)
        product_id = prod_res.json()["id"]

        # Setup customer
        cust_payload = {
            "name": "Jane Doe",
            "email": "jane@example.com"
        }
        cust_res = self.client.post("/api/customers", json=cust_payload)
        self.assertEqual(cust_res.status_code, 201)
        customer_id = cust_res.json()["id"]

        # 1. Place order (Business Rules: stock reduction, auto-price total)
        order_payload = {
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 3
        }
        order_res = self.client.post("/api/orders", json=order_payload)
        self.assertEqual(order_res.status_code, 201)
        order_data = order_res.json()
        
        # Verify auto price calculation: 3 * 150.00 = 450.00
        self.assertEqual(order_data["total_amount"], 450.00)
        self.assertEqual(order_data["quantity"], 3)
        order_id = order_data["id"]

        # Verify stock has decreased: 10 - 3 = 7
        prod_check = self.client.get(f"/api/products/{product_id}")
        self.assertEqual(prod_check.json()["quantity_in_stock"], 7)

        # 2. Place order exceeding remaining stock - should fail (Business Rule)
        bad_order_payload = {
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": 8  # Only 7 left
        }
        bad_order_res = self.client.post("/api/orders", json=bad_order_payload)
        self.assertEqual(bad_order_res.status_code, 400)
        self.assertIn("Insufficient inventory", bad_order_res.json()["detail"])

        # Verify stock has NOT changed after failed order (Atomicity)
        prod_check_fail = self.client.get(f"/api/products/{product_id}")
        self.assertEqual(prod_check_fail.json()["quantity_in_stock"], 7)

        # 3. Cancel order - should restock product (Premium Business Rule)
        cancel_res = self.client.delete(f"/api/orders/{order_id}")
        self.assertEqual(cancel_res.status_code, 200)

        # Verify stock restored: 7 + 3 = 10
        prod_check_cancel = self.client.get(f"/api/products/{product_id}")
        self.assertEqual(prod_check_cancel.json()["quantity_in_stock"], 10)


if __name__ == "__main__":
    unittest.main()
