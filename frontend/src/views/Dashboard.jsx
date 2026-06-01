import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

export default function Dashboard({ summary, setView, setActiveTab, onOpenAddOrder, onOpenAddProduct, onOpenAddCustomer }) {
  const { total_products = 0, total_customers = 0, total_orders = 0, low_stock_products = [] } = summary || {};

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="header-title">System Analytics</h1>
          <p className="header-subtitle">Real-time overview of your inventory operations, stock warnings, and business performance.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => { setView('products'); setActiveTab('products'); }}>
          <div className="metric-icon-wrapper products">
            <Package size={28} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Products</span>
            <span className="metric-value">{total_products}</span>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => { setView('customers'); setActiveTab('customers'); }}>
          <div className="metric-icon-wrapper customers">
            <Users size={28} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Customers</span>
            <span className="metric-value">{total_customers}</span>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => { setView('orders'); setActiveTab('orders'); }}>
          <div className="metric-icon-wrapper orders">
            <ShoppingCart size={28} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Orders</span>
            <span className="metric-value">{total_orders}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper low-stock">
            <AlertTriangle size={28} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Low Stock Alerts</span>
            <span className="metric-value">{low_stock_products.length}</span>
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px' }}>
        
        {/* Low Stock Warning Table */}
        <div className="glass-panel" style={{ marginBottom: 0 }}>
          <h2 className="glass-panel-title">
            <AlertTriangle size={22} className="text-warning" style={{ color: 'var(--color-warning)' }} />
            Critical Stock Alert Center
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            The following products have dropped below the safe threshold of 5 units. Please restock immediately.
          </p>

          {low_stock_products.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '0.95rem' }}>✅ All product inventory is currently healthy and fully stocked!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {low_stock_products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-secondary)' }}>{product.sku}</td>
                      <td style={{ fontWeight: 700 }}>{product.quantity_in_stock}</td>
                      <td>
                        {product.quantity_in_stock === 0 ? (
                          <span className="badge badge-danger">Out of stock</span>
                        ) : (
                          <span className="badge badge-warning">Low stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations Portal */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
            <h2 className="glass-panel-title">
              <TrendingUp size={22} style={{ color: 'var(--color-secondary)' }} />
              Quick Operations Portal
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Perform primary operational workflows instantly from this dashboard launcher.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)' }}
                onClick={onOpenAddOrder}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShoppingCart size={18} style={{ color: 'var(--color-success)' }} />
                  Create New Customer Order
                </span>
                <ArrowRight size={16} />
              </div>

              <div 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)' }}
                onClick={onOpenAddProduct}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Package size={18} style={{ color: 'var(--color-primary)' }} />
                  Add New Product to Inventory
                </span>
                <ArrowRight size={16} />
              </div>

              <div 
                className="btn btn-secondary" 
                style={{ width: '100%', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)' }}
                onClick={onOpenAddCustomer}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={18} style={{ color: 'var(--color-secondary)' }} />
                  Register New Client Account
                </span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-glow)', paddingTop: '20px', marginTop: '20px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Powered by Python FastAPI, React JS, & PostgreSQL
          </div>
        </div>

      </div>
    </div>
  );
}
