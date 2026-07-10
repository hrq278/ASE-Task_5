// client/src/services/dashboard.service.js
import api from './api';

export const dashboardService = {
  // Get complete dashboard summary
  getDashboardSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // Get quick stats for cards
  getQuickStats: async () => {
    const response = await api.get('/dashboard/quick-stats');
    return response.data;
  },

  // Get inventory trend
  getInventoryTrend: async () => {
    const response = await api.get('/dashboard/inventory-trend');
    return response.data;
  },

  // Get stock alerts
  getStockAlerts: async () => {
    const response = await api.get('/dashboard/stock-alerts');
    return response.data;
  }
};