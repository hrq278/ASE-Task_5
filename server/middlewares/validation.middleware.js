// middleware/validation.middleware.js
import { body, validationResult } from 'express-validator';

export const validateProduct = [
  body('productName')
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('supplier')
    .notEmpty().withMessage('Supplier is required')
    .isMongoId().withMessage('Invalid supplier ID'),
  
  body('purchasePrice')
    .notEmpty().withMessage('Purchase price is required')
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Selling price must be a positive number')
    .custom((value, { req }) => {
      if (value < parseFloat(req.body.purchasePrice)) {
        throw new Error('Selling price cannot be lower than purchase price');
      }
      return true;
    }),
  
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantity cannot be negative'),
  
  body('minimumStockLevel')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum stock level cannot be negative'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];