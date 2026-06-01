import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, Loader2, Bell, CheckCircle2, AlertOctagon } from 'lucide-react';
import { api } from './api';

// Views
import Dashboard from './views/Dashboard';
import Products from './views/Products';
import Customers from './views/Customers';
import Orders from './views/Orders';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [initialError, setInitialError] = useState('');
  
  // Toast notifications array: { id, type, message }
  const [toasts, setToasts] = useState([]);
  
  // Modal Overlays state (open/close) managed centrally to bind dashboard launchers
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  // Load all data from API concurrently
  const reloadData = async () => {
    try {
      const [sumData, prodData, custData, ordData] = await Promise.all([
        api.getDashboardSummary(),
        api.getProducts(),
        api.getCustomers(),
        api.getOrders()
      ]);

      setSummary(sumData);
      setProducts(prodData);
      setCustomers(custData);
      setOrders(ordData);
      setInitialError('');
    } catch (err) {
      console.error("Failed to fetch inventory dataset:", err);
      showToast('error', `Data loading failed: ${err.message}`);
      setInitialError('Unable to connect to the backend API services. Please verify the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Toast trigger helper
  const showToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto purge toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- CRUD API Event Handlers ---
  
  // Products Catalog
  const handleAddProduct = async (payload) => {
    await api.createProduct(payload);
    showToast('success', `Product "${payload.name}" successfully registered in catalog.`);
    await reloadData();
  };

  const handleUpdateProduct = async (id, payload) => {
    await api.updateProduct(id, payload);
    showToast('success', `Product details updated successfully.`);
    await reloadData();
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      showToast('success', `Product removed from inventory.`);
      await reloadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete product.');
    }
  };

  // Customers Registry
  const handleAddCustomer = async (payload) => {
    await api.createCustomer(payload);
    showToast('success', `Customer account registered for "${payload.name}".`);
    await reloadData();
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.deleteCustomer(id);
      showToast('success', `Customer account successfully purged.`);
      await reloadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete customer.');
    }
  };

  // Orders Registry
  const handleCheckoutOrder = async (payload) => {
    await api.createOrder(payload);
    showToast('success', 'Order checkout successful! Stock balance subtracted.');
    await reloadData();
  };

  const handleCancelOrder = async (id) => {
    try {
      await api.deleteOrder(id);
      showToast('success', 'Order cancelled. Ordered quantity returned to stock.');
      await reloadData();
    } catch (err) {
      showToast('error', err.message || 'Failed to cancel order.');
    }
  };

  // Rendering Loader screen
  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-primary)', animation: 'spin 1.5s linear infinite' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-text-main)' }}>
          Connecting to System...
        </h2>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <ShoppingCart size={28} className="logo-icon" />
          <h1 className="logo-text">FlowStock</h1>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="nav-links">
            <li>
              <div 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setView('dashboard'); setActiveTab('dashboard'); }}
              >
                <LayoutDashboard className="nav-icon" />
                <span className="nav-text">Dashboard</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => { setView('products'); setActiveTab('products'); }}
              >
                <Package className="nav-icon" />
                <span className="nav-text">Inventory</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => { setView('customers'); setActiveTab('customers'); }}
              >
                <Users className="nav-icon" />
                <span className="nav-text">Customers</span>
              </div>
            </li>
            <li>
              <div 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => { setView('orders'); setActiveTab('orders'); }}
              >
                <ShoppingCart className="nav-icon" />
                <span className="nav-text">Orders</span>
              </div>
            </li>
          </ul>
        </nav>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--border-glow)', paddingTop: '16px' }}>
          System Version: 1.0.0
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        
        {initialError && (
          <div 
            style={{ 
              background: 'var(--color-danger-glow)', 
              color: 'var(--color-danger)', 
              padding: '16px 20px', 
              borderRadius: '12px', 
              border: '1px solid var(--color-danger)',
              marginBottom: '32px',
              fontSize: '0.95rem' 
            }}
          >
            ⚠️ <strong>Connection Error:</strong> {initialError}
            <button 
              className="btn btn-secondary" 
              style={{ marginLeft: '24px', padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => { setLoading(true); reloadData(); }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* View Router */}
        {view === 'dashboard' && (
          <Dashboard 
            summary={summary} 
            setView={setView} 
            setActiveTab={setActiveTab}
            onOpenAddOrder={() => setIsOrderFormOpen(true)}
            onOpenAddProduct={() => setIsProductFormOpen(true)}
            onOpenAddCustomer={() => setIsCustomerFormOpen(true)}
          />
        )}
        
        {view === 'products' && (
          <Products 
            products={products}
            onAdd={handleAddProduct}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
            isFormOpen={isProductFormOpen}
            setIsFormOpen={setIsProductFormOpen}
          />
        )}

        {view === 'customers' && (
          <Customers 
            customers={customers}
            onAdd={handleAddCustomer}
            onDelete={handleDeleteCustomer}
            isFormOpen={isCustomerFormOpen}
            setIsFormOpen={setIsCustomerFormOpen}
          />
        )}

        {view === 'orders' && (
          <Orders 
            orders={orders}
            products={products}
            customers={customers}
            onCreateOrder={handleCheckoutOrder}
            onDeleteOrder={handleCancelOrder}
            isFormOpen={isOrderFormOpen}
            setIsFormOpen={setIsOrderFormOpen}
          />
        )}

      </main>

      {/* Corners Toast Notifications Portal */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertOctagon size={20} />}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
