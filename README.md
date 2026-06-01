# FlowStock: Containerized Inventory & Order Management System

FlowStock is a beautiful, production-ready, fully containerized full-stack **Inventory & Order Management System**. Built with a high-performance **Python FastAPI** backend, a stunning **React.js** frontend styled using premium **Vanilla CSS**, and a robust **PostgreSQL** database, the entire system is orchestrated seamlessly using **Docker Compose** and configured for one-click cloud deployment.

---

## 🌟 Core Features

### 📊 1. System Analytics Dashboard
- **Real-time Metrics**: Visualizes total products, registered customers, total orders, and low-stock alerts.
- **Stock Alert Center**: Color-coded, high-visibility badges highlighting low-stock (≤ 5 units) and out-of-stock items so catalog managers can replenish them immediately.
- **Quick Action Launcher**: Interactive portals to place orders, add products, or register clients instantly from the dashboard.

### 📦 2. Product Catalog Management
- **Full CRUD Support**: Add, list, view, edit, and delete inventory profiles.
- **Relational Constraints**: Enforces unique SKU codes and strictly forbids negative price or stock values.
- **Availability Tags**: Dynamic tags showing in-stock, low-stock, and out-of-stock indicators.

### 👥 3. Customer Account Registry
- **Client Listing**: Register and list client accounts detailing full names, email addresses, and phone numbers.
- **Email Validation**: Enforces database-level email address format validation and strict email address uniqueness.

### 🛒 4. Atomic Order Processing & Tracking
- **Auto-Calculated Pricing**: Backend calculates the total order value dynamically based on the unit price and order quantity.
- **Inventory Check & Atomic Transactions**: Verify stock availability before checkout. The stock decrement and order record are executed in an atomic transaction; if stock is insufficient, the system rejects the request and rolls back the database.
- **Automatic Restocking**: When an order is cancelled or deleted, the items are automatically returned back to the product's catalog stock.

### 🎨 5. Premium Visual Design System
- **Glassmorphism UI**: High-end styling featuring translucent backdrops, harmonized glowing gradient borders, pulsing notification banners, and modern typography (`Outfit` & `Inter`).
- **Fluid Layout**: Collapsible sidebars and fluid responsive grids designed for desktop, tablet, and mobile screens.

---

## 🛠️ Technology Stack

- **Backend API**: Python 3.11, FastAPI (Asynchronous framework), SQLAlchemy ORM, Pydantic (data validations).
- **Frontend SPA**: React.js (JavaScript), Vite (bundler & compiler), Lucide React (UI icons), Vanilla CSS.
- **Database**: PostgreSQL 15 (Production), SQLite (local automated testing fallback).
- **Orchestration**: Docker, Docker Compose, Nginx alpine-slim (SPA static server).

---

## 📂 Repository Structure

```text
/
├── backend/
│   ├── app/
│   │   ├── main.py          # Application entrypoint & CORS middleware
│   │   ├── config.py        # Settings loader (Pydantic BaseSettings)
│   │   ├── db.py            # SQLAlchemy engine & session factory
│   │   ├── models.py        # Database relational schemas & constraints
│   │   ├── schemas.py       # Pydantic data serialization schemas
│   │   ├── crud.py          # Transactional business logic & CRUD processors
│   │   ├── test_main.py     # Automated integration & unit tests
│   │   └── routers/         # API controllers (/products, /customers, /orders, /dashboard)
│   ├── Dockerfile           # Optimized python-slim runner
│   ├── requirements.txt     # Python backend dependencies
│   └── .env.example         # Template for environment configurations
├── frontend/
│   ├── src/
│   │   ├── views/           # SPA view pages (Dashboard, Products, Customers, Orders)
│   │   ├── api.js           # Central network fetch helper with error parsers
│   │   ├── index.css        # Premium style sheets (Glassmorphic variables, animations)
│   │   ├── App.jsx          # Coordinate state, views, and Toast overlays
│   │   └── main.jsx         # App bootstrapping
│   ├── Dockerfile           # Two-stage build: node compile & Nginx server
│   ├── nginx.conf           # SPA fallback routing handler for Nginx
│   └── .env.example         # Template for client api configuration
├── docker-compose.yml       # Complete multi-service system orchestrator
├── render.yaml              # Render blueprint deployment specification
└── README.md                # Comprehensive documentation
```

---

## 🚀 Local Deployment with Docker Compose (Recommended)

To run the entire containerized application stack (PostgreSQL, FastAPI, and React Frontend) locally, all you need is **Docker** and **Docker Compose** installed.

1. **Clone the Repository**:
   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. **Spin Up the Containers**:
   Execute the following command in the root folder:
   ```bash
   docker-compose up --build
   ```
   Docker Compose will:
   - Boot up PostgreSQL, persist database data into a named volume `flowstock_postgres_data`, and wait for a healthy connection status.
   - Build and start the Python FastAPI container, automatically executing database table creation.
   - Build, compile, and expose the React SPA through Nginx on the local system.

3. **Access the Services**:
   - **Frontend Application**: [https://frontend-wine-iota-37.vercel.app](https://frontend-wine-iota-37.vercel.app)
   - **Backend API Server**: [http://localhost:8000](http://localhost:8000)
   - **Interactive OpenAPI (Swagger) Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

4. **Shutdown Containers**:
   ```bash
   docker-compose down -v
   ```

---

## 💻 Manual Local Development (Without Docker)

You can run both services natively on your local machine for rapid development.

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment configuration and run uvicorn:
   ```bash
   copy .env.example .env
   uvicorn app.main:app --reload
   ```
   *Note: If no PostgreSQL `DATABASE_URL` is set in your `.env`, FlowStock automatically falls back to an isolated SQLite file (`./inventory.db`) inside the directory, allowing it to run instantly!*

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Copy environment configuration and start Vite development server:
   ```bash
   copy .env.example .env
   npm run dev
   ```
4. Access the React app at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Automated Tests

FlowStock includes a comprehensive integration test suite that tests API endpoints, relational validations, stock decrement logic, atomic rollbacks, and order cancellation restocking.

To run the tests:
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run the unittest runner:
   ```bash
   python -m unittest app/test_main.py
   ```
   *The test suite automatically overrides the database engine on startup to run in an isolated in-memory SQLite database, making it 100% safe, portable, and fast.*

---

## ☁️ Production Deployment on Free Cloud Platforms

### 1. One-Click Backend & DB Deployment on Render
FlowStock is pre-configured with a Render Blueprint Spec (`render.yaml`).
1. Push this codebase to a private/public **GitHub repository**.
2. Log into your **Render Account** (https://render.com).
3. Navigate to **Blueprints** on the dashboard and click **New Blueprint Instance**.
4. Link your GitHub repository. Render will automatically detect `render.yaml` and provision:
   - A managed PostgreSQL instance.
   - The FastAPI backend service.
   - Connect them securely using database environment variable injection.
5. Click **Apply**. Once built, copy your public backend URL (e.g., `https://flowstock-backend.onrender.com`).

### 2. Frontend Deployment on Vercel
Vercel is the ultimate free hosting platform for Vite React compiled sites.
1. Log into your **Vercel Account** (https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure the following project parameters:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variables**: Add a new environment variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://<your-render-backend-url>.onrender.com/api` (Ensure `/api` suffix is added!)
4. Click **Deploy**. Vercel will compile and host your frontend on a fast global CDN, returning your public frontend URL (e.g., `https://flowstock-frontend.vercel.app`).
