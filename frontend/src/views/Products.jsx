import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Products({ products, onAdd, onUpdate, onDelete, isFormOpen, setIsFormOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');

  // Handle opening add form
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setError('');
    setIsFormOpen(true);
  };

  // Handle opening edit form
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setPrice(product.price.toString());
    setStock(product.quantity_in_stock.toString());
    setError('');
    setIsFormOpen(true);
  };

  // Handle closing form
  const handleClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setError('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Request Validation
    if (!name.trim()) return setError('Product name is required.');
    if (!sku.trim()) return setError('SKU code is required.');
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return setError('Price must be a positive number.');
    }
    
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return setError('Quantity in stock cannot be negative.');
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price: parsedPrice,
      quantity_in_stock: parsedStock,
    };

    try {
      if (editingProduct) {
        await onUpdate(editingProduct.id, payload);
      } else {
        await onAdd(payload);
      }
      handleClose();
    } catch (err) {
      setError(err.message || 'An error occurred while saving the product.');
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="header-title">Product Catalog</h1>
          <p className="header-subtitle">Manage items, configure pricing structure, SKU registrations, and inventory stock balances.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Action and Search Row */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div className="action-row" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="form-input search-input"
              style={{ paddingLeft: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      {/* Products Table Glass Panel */}
      <div className="glass-panel">
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No products found</p>
            <p style={{ fontSize: '0.85rem' }}>Create a new product or check your filter criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th>Unit Price</th>
                  <th>Stock Quantity</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stock = product.quantity_in_stock;
                  let stockTag = <span className="badge badge-success">In Stock</span>;
                  if (stock === 0) {
                    stockTag = <span className="badge badge-danger">Out of stock</span>;
                  } else if (stock <= 5) {
                    stockTag = <span className="badge badge-warning">Low Stock ({stock})</span>;
                  }

                  return (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                        {product.sku}
                      </td>
                      <td style={{ fontWeight: 500 }}>${product.price.toFixed(2)}</td>
                      <td style={{ fontWeight: 600 }}>{stock}</td>
                      <td>{stockTag}</td>
                      <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger-outline"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
                              onDelete(product.id);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Overlay Panel (Add/Edit Product Form) */}
      <div className={`overlay-backdrop ${isFormOpen ? 'active' : ''}`} onClick={handleClose}>
        <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-header">
            <h2 className="glass-panel-title" style={{ marginBottom: 0 }}>
              {editingProduct ? 'Modify Product Details' : 'Register New Product'}
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
            <div className="form-group">
              <label className="form-label">Product Display Name</label>
              <input
                type="text"
                placeholder="e.g. Mechanical Keyboard G90"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unique SKU / Code</label>
              <input
                type="text"
                placeholder="e.g. KB-MECH-G90"
                className="form-input"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={!!editingProduct} // SKU cannot be edited to maintain catalog integrity
                required
              />
              {editingProduct && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  SKU code is immutable to preserve transactional consistency.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opening Stock Quantity</label>
              <input
                type="number"
                step="1"
                placeholder="0"
                className="form-input"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-glow)' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                {editingProduct ? 'Save Changes' : 'Register Product'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
