// client/src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    summary: {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalSuppliers: 0,
      totalOrders: 0,
      inventoryValue: 0,
      lowStockPercentage: 0,
      outOfStockPercentage: 0,
      averageStockLevel: 0
    },
    categoryDistribution: [],
    lowStockProducts: [],
    outOfStockProducts: [],
    topSellingProducts: [],
    recentOrders: [],
    monthlyTrends: [],
    orderStatusDistribution: []
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardSummary();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    // Refresh every 60 seconds
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const refresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { loading, error, data, refresh };
};