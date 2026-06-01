const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Common request helper with robust error handling for FastAPI responses
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Return empty if 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      // Extract FastAPI detail error structure
      const errorMessage = data && data.detail 
        ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        : `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // --- Dashboard Summary ---
  getDashboardSummary: () => request('/dashboard/summary'),

  // --- Product Management ---
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id, data) => request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id) => request(`/products/${id}`, {
    method: 'DELETE'
  }),

  // --- Customer Management ---
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteCustomer: (id) => request(`/customers/${id}`, {
    method: 'DELETE'
  }),

  // --- Order Management ---
  getOrders: () => request('/orders'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteOrder: (id) => request(`/orders/${id}`, {
    method: 'DELETE'
  })
};
