// routes/product.routes.js
import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  updateStock,
  bulkCreateProducts
} from '../controllers/product.controller.js';
import {
  verifyTokenMiddleware,
  requireRole
} from '../middleware/auth.middleware.js';
import {
  uploadProductImage,
  handleMulterError
} from '../middleware/upload.middleware.js';

const router = express.Router();

// All product routes require authentication
router.use(verifyTokenMiddleware);

// Public routes (accessible to all authenticated users)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin and Manager only routes
router.post(
  '/',
  requireRole('admin', 'manager'),
  uploadProductImage,
  handleMulterError,
  createProduct
);

router.put(
  '/:id',
  requireRole('admin', 'manager'),
  uploadProductImage,
  handleMulterError,
  updateProduct
);

router.patch(
  '/:id/stock',
  requireRole('admin', 'manager'),
  updateStock
);

// Admin only routes
router.patch(
  '/:id/deactivate',
  requireRole('admin'),
  deleteProduct
);

router.delete(
  '/:id/permanent',
  requireRole('admin'),
  hardDeleteProduct
);

router.post(
  '/bulk',
  requireRole('admin', 'manager'),
  bulkCreateProducts
);

export default router;