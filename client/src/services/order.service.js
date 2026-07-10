// client/src/services/order.service.js
import api from './api';

export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get orders with filters
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get single order
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status, notes) => {
    const response = await api.patch(`/orders/${id}/status`, { status, notes });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Validate items before creating order
  validateItems: async (items) => {
    const response = await api.post('/orders/validate-items', { items });
    return response.data;
  },

  // Get order statistics
  getOrderStatistics: async () => {
    const response = await api.get('/orders/statistics');
    return response.data;
  }
};