// routes/order.routes.js
import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatusController,
  cancelOrder,
  getOrderStatistics,
  validateOrderItems
} from '../controllers/order.controller.js';
import {
  verifyTokenMiddleware,
  requireRole
} from '../middleware/auth.middleware.js';

const router = express.Router();

// All order routes require authentication
router.use(verifyTokenMiddleware);

// Public routes (accessible to all authenticated users)
router.get('/', getOrders);
router.get('/statistics', requireRole('admin', 'manager'), getOrderStatistics);
router.get('/:id', getOrderById);

// Validation endpoint (for real-time validation)
router.post('/validate-items', validateOrderItems);

// Order creation (accessible to all authenticated users)
router.post('/', createOrder);

// Status management (Admin and Manager only)
router.patch(
  '/:id/status',
  requireRole('admin', 'manager'),
  updateOrderStatusController
);

// Cancel order (Admin and Manager only)
router.post(
  '/:id/cancel',
  requireRole('admin', 'manager'),
  cancelOrder
);

export default router;