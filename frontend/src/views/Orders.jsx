import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';

export default function Orders({ orders, products, customers, onCreateOrder, onDeleteOrder, isFormOpen, setIsFormOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  
  // Real-time Prediction State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [projectedTotal, setProjectedTotal] = useState(0);
  const [stockRemaining, setStockRemaining] = useState(0);

  // Update real-time price and stock predictions when selections change
  useEffect(() => {
    const product = products.find(p => p.id === parseInt(productId, 10));
    setSelectedProduct(product || null);

    if (product) {
      const q = parseInt(quantity, 10) || 0;
      setProjectedTotal(product.price * q);
      setStockRemaining(product.quantity_in_stock - q);
    } else {
      setProjectedTotal(0);
      setStockRemaining(0);
    }
  }, [productId, quantity, products]);

  // Handle opening form
  const handleOpenAdd = () => {
    setCustomerId('');
    setProductId('');
    setQuantity('1');
    setError('');
    setIsFormOpen(true);
  };

  // Handle closing form
  const handleClose = () => {
    setIsFormOpen(false);
    setCustomerId('');
    setProductId('');
    setQuantity('1');
    setError('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validations
    if (!customerId) return setError('Please select a customer.');
    if (!productId) return setError('Please select a product.');
    
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return setError('Quantity must be a positive integer greater than 0.');
    }

    if (selectedProduct && selectedProduct.quantity_in_stock < qty) {
      return setError(`Insufficient inventory. Only ${selectedProduct.quantity_in_stock} unit(s) of '${selectedProduct.name}' in stock.`);
    }

    const payload = {
      customer_id: parseInt(customerId, 10),
      product_id: parseInt(productId, 10),
      quantity: qty
    };

    try {
      await onCreateOrder(payload);
      handleClose();
    } catch (err) {
      setError(err.message || 'An error occurred while placing the order.');
    }
  };

  // Filter orders by search criteria
  const filteredOrders = orders.filter((o) => {
    const custName = o.customer?.name || '';
    const prodName = o.product?.name || '';
    const prodSku = o.product?.sku || '';
    const term = searchQuery.toLowerCase();
    return (
      custName.toLowerCase().includes(term) ||
      prodName.toLowerCase().includes(term) ||
      prodSku.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="header-title">Order Transactions</h1>
          <p className="header-subtitle">Create, audit, track customer purchases, check transaction values, and cancel active orders.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenAdd}
          disabled={products.length === 0 || customers.length === 0}
        >
          <Plus size={18} />
          Create Order
        </button>
      </div>

      {/* Warning if catalogs are empty */}
      {(products.length === 0 || customers.length === 0) && (
        <div 
          style={{ 
            background: 'var(--color-warning-glow)', 
            color: 'var(--color-warning)', 
            padding: '16px 20px', 
            borderRadius: '12px', 
            border: '1px solid var(--color-warning)',
            marginBottom: '24px',
            fontSize: '0.9rem' 
          }}
        >
          ⚠️ <strong>Setup Required:</strong> You must register at least one **Product** and one **Customer** in their respective workspaces before you can place orders.
        </div>
      )}

      {/* Action and Search Row */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div className="action-row" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Filter by customer, product, or SKU..."
              className="form-input search-input"
              style={{ paddingLeft: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="glass-panel">
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No orders found</p>
            <p style={{ fontSize: '0.85rem' }}>Generate a new client transaction or change your search filter.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Ordered Product</th>
                  <th>Quantity</th>
                  <th>Transaction Value</th>
                  <th>Ordered At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-secondary)' }}>
                      #ORD-{order.id.toString().padStart(4, '0')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{order.customer?.name || 'Deleted Customer'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customer?.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{order.product?.name || 'Deleted Product'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontFamily: 'monospace' }}>
                          SKU: {order.product?.sku}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{order.quantity}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} />
                        {new Date(order.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger-outline"
                        onClick={() => {
                          if (window.confirm(`Cancel order #ORD-${order.id.toString().padStart(4, '0')}? This will automatically restock the ${order.quantity} item(s) back into active inventory.`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                      >
                        <Trash2 size={12} />
                        Cancel Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Overlay Panel (Create Order Form) */}
      <div className={`overlay-backdrop ${isFormOpen ? 'active' : ''}`} onClick={handleClose}>
        <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-header">
            <h2 className="glass-panel-title" style={{ marginBottom: 0 }}>
              Create Customer Order
            </h2>
            <button className="overlay-close" onClick={handleClose}>
              <X size={24} />
            </button>
          </div>

          {error && (
            <div 
              style={{ 
                background: 'var(--color-danger-glow)', 
                color: 'var(--color-danger)', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '1px solid var(--color-danger)',
                marginBottom: '24px',
                fontSize: '0.9rem' 
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            {/* Customer Dropdown */}
            <div className="form-group">
              <label className="form-label">Customer Placement</label>
              <select
                className="form-input form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose Account --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Product Dropdown */}
            <div className="form-group">
              <label className="form-label">Product to Order</label>
              <select
                className="form-input form-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                <option value="">-- Select Catalog Item --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                    {p.name} - ${p.price.toFixed(2)} ({p.quantity_in_stock === 0 ? 'OUT OF STOCK' : `Stock: ${p.quantity_in_stock}`})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Input */}
            <div className="form-group">
              <label className="form-label">Order Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {/* Real-time Order Summary Panel */}
            {selectedProduct && (
              <div className="price-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600, fontSize: '0.95rem' }}>
                  <ShoppingCart size={16} style={{ color: 'var(--color-secondary)' }} />
                  Real-time Transaction Calculator
                </div>

                <div className="price-row">
                  <span>Unit Catalog Price:</span>
                  <span>${selectedProduct.price.toFixed(2)}</span>
                </div>

                <div className="price-row" style={{ marginTop: '4px' }}>
                  <span>Requested Quantity:</span>
                  <span>× {quantity || 0}</span>
                </div>

                <div className="price-row" style={{ marginTop: '8px', borderTop: '1px dotted var(--border-glow)', paddingTop: '8px' }}>
                  <span>Inventory Stock Before:</span>
                  <span>{selectedProduct.quantity_in_stock} unit(s)</span>
                </div>

                <div className="price-row" style={{ marginTop: '4px' }}>
                  <span>Projected Stock After:</span>
                  {stockRemaining < 0 ? (
                    <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                      INSUFFICIENT STOCK ({stockRemaining})
                    </span>
                  ) : (
                    <span style={{ color: stockRemaining <= 5 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 600 }}>
                      {stockRemaining} unit(s)
                    </span>
                  )}
                </div>

                <div className="price-row total">
                  <span>Total Amount Due:</span>
                  <span style={{ color: 'var(--color-success)' }}>${projectedTotal.toFixed(2)}</span>
                </div>

                {stockRemaining < 0 && (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '12px', fontWeight: 500, textAlign: 'center', background: 'rgba(255, 71, 87, 0.1)', padding: '6px', borderRadius: '4px' }}>
                    ⚠️ Transaction cannot exceed catalog stock level.
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-glow)' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                disabled={selectedProduct && stockRemaining < 0}
              >
                Checkout Order
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
