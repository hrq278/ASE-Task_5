// controllers/order.controller.js
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import {
  createOrderWithStockUpdate,
  updateOrderStatus,
  getOrdersWithFilters,
  validateStockAvailability
} from '../services/order.service.js';

/**
 * Create Order
 * POST /api/orders
 * Checks stock availability, calculates total server-side, decrements stock atomically
 */
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const userId = req.user._id;

    // Validate items exist
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Create order with atomic stock update
    const order = await createOrderWithStockUpdate(orderData, userId);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle specific errors
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create order due to insufficient stock',
        error: error.message
      });
    }

    if (error.message.includes('Price mismatch')) {
      return res.status(400).json({
        success: false,
        message: 'Product price mismatch. Please refresh and try again.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * Get All Orders
 * GET /api/orders
 */
export const getOrders = async (req, res) => {
  try {
    const filters = req.query;
    const result = await getOrdersWithFilters(filters);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * Get Single Order
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('items.product', 'productName productCode sellingPrice purchasePrice quantity')
      .populate('processedBy', 'firstName lastName email')
      .populate('statusHistory.changedBy', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

/**
 * Update Order Status
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, processing, delivered, or cancelled'
      });
    }

    const order = await updateOrderStatus(id, status, userId, notes);

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Cannot cancel a delivered order')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * Cancel Order
 * POST /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order'
      });
    }

    // Cancel order and restock
    await order.cancelOrder(userId);

    // Add cancellation reason to notes
    if (reason) {
      order.notes = order.notes 
        ? `${order.notes} [Cancelled: ${reason}]` 
        : `[Cancelled: ${reason}]`;
      await order.save();
    }

    const populatedOrder = await Order.findById(id)
      .populate('items.product', 'productName productCode sellingPrice')
      .populate('processedBy', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

/**
 * Get Order Statistics
 * GET /api/orders/statistics
 */
export const getOrderStatistics = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
                averageOrderValue: { $avg: '$totalAmount' },
                totalItemsSold: { $sum: { $size: '$items' } }
              }
            }
          ],
          statusStats: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
              }
            }
          ],
          dailyStats: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalStats: [],
        statusStats: [],
        dailyStats: []
      }
    });

  } catch (error) {
    console.error('Order statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

/**
 * Validate Order Items (for frontend real-time validation)
 * POST /api/orders/validate-items
 */
export const validateOrderItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required for validation'
      });
    }

    const productIds = items.map(item => item.product);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true
    });

    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = {
        _id: p._id,
        productName: p.productName,
        productCode: p.productCode,
        sellingPrice: p.sellingPrice,
        purchasePrice: p.purchasePrice,
        quantity: p.quantity,
        minimumStockLevel: p.minimumStockLevel,
        stockStatus: p.stockStatus
      };
    });

    const validationResults = items.map(item => {
      const product = productMap[item.product.toString()];
      
      if (!product) {
        return {
          ...item,
          valid: false,
          error: 'Product not found or inactive'
        };
      }

      const errors = [];
      if (product.quantity < item.quantity) {
        errors.push(`Only ${product.quantity} units available`);
      }
      if (item.unitPrice !== product.sellingPrice) {
        errors.push(`Price mismatch. Expected: ${product.sellingPrice}`);
      }

      return {
        ...item,
        product,
        valid: errors.length === 0,
        errors,
        availableQuantity: product.quantity,
        price: product.sellingPrice,
        stockStatus: product.stockStatus
      };
    });

    res.status(200).json({
      success: true,
      data: {
        items: validationResults,
        allValid: validationResults.every(item => item.valid),
        invalidCount: validationResults.filter(item => !item.valid).length
      }
    });

  } catch (error) {
    console.error('Validate items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate items',
      error: error.message
    });
  }
};