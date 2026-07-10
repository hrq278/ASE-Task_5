// routes/dashboard.routes.js
import express from 'express';
import {
  getDashboardSummary,
  getQuickStats,
  getInventoryTrend,
  getStockAlerts
} from '../controllers/dashboard.controller.js';
import {
  verifyTokenMiddleware,
  requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyTokenMiddleware);

// Main dashboard summary (access to all authenticated users)
router.get('/summary', getDashboardSummary);

// Quick stats (lightweight for dashboard cards)
router.get('/quick-stats', getQuickStats);

// Inventory trend
router.get('/inventory-trend', getInventoryTrend);

// Stock alerts
router.get('/stock-alerts', getStockAlerts);

// Optional: Admin-only detailed analytics
router.get(
  '/analytics',
  requireRole('admin', 'manager'),
  getDashboardSummary
);

export default router;