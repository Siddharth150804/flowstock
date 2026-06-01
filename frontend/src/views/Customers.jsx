import React, { useState } from 'react';
import { Plus, Search, Trash2, X, User } from 'lucide-react';

export default function Customers({ customers, onAdd, onDelete, isFormOpen, setIsFormOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Handle opening add form
  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPhone('');
    setError('');
    setIsFormOpen(true);
  };

  // Handle closing form
  const handleClose = () => {
    setIsFormOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setError('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Input Validation
    if (!name.trim()) return setError('Customer full name is required.');
    if (!email.trim()) return setError('Customer email address is required.');

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() ? phone.trim() : null
    };

    try {
      await onAdd(payload);
      handleClose();
    } catch (err) {
      setError(err.message || 'An error occurred while registering the customer.');
    }
  };

  // Filter customers by search query
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="header-section">
        <div>
          <h1 className="header-title">Customer Registry</h1>
          <p className="header-subtitle">Manage client profiles, email directory channels, phone indexes, and purchase accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Register Customer
        </button>
      </div>

      {/* Action and Search Row */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div className="action-row" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              className="form-input search-input"
              style={{ paddingLeft: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>
      </div>

      {/* Customers Table Glass Panel */}
      <div className="glass-panel">
        {filteredCustomers.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No customers found</p>
            <p style={{ fontSize: '0.85rem' }}>Create a new customer profile or adjust your search.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Registered On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
                          <User size={16} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{customer.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      {customer.email}
                    </td>
                    <td>{customer.phone || <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>—</span>}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {new Date(customer.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-danger-outline"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This will also purge all their order histories.`)) {
                            onDelete(customer.id);
                          }
                        }}
                      >
                        <Trash2 size={12} />
                        Delete Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Overlay Panel (Register Customer Form) */}
      <div className={`overlay-backdrop ${isFormOpen ? 'active' : ''}`} onClick={handleClose}>
        <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-header">
            <h2 className="glass-panel-title" style={{ marginBottom: 0 }}>
              Register Client Account
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
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Siddhartha Malhotra"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="e.g. siddhartha@example.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Each customer email address must be unique within the database system.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-glow)' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                Register Customer
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
