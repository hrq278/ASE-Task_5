// services/order.service.js
import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import mongoose from 'mongoose';

/**
 * Validate and prepare order data
 */
export const prepareOrderData = (orderData, userId) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    paymentMethod,
    notes
  } = orderData;

  // Validate required fields
  if (!customerName) throw new Error('Customer name is required');
  if (!customerEmail) throw new Error('Customer email is required');
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }

  return {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress: customerAddress || {},
    items: items.map(item => ({
      product: item.product,
      productCode: item.productCode || 'Unknown',
      productName: item.productName || 'Unknown',
      quantity: parseInt(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || 0,
      totalPrice: (parseInt(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0),
      purchasePrice: parseFloat(item.purchasePrice) || 0
    })),
    paymentMethod: paymentMethod || 'Cash',
    notes: notes || '',
    processedBy: userId,
    status: 'pending',
    paymentStatus: 'pending'
  };
};

/**
 * Validate stock availability for all items
 */
export const validateStockAvailability = async (items) => {
  const productIds = items.map(item => item.product);
  const products = await Product.find({ 
    _id: { $in: productIds },
    isActive: true
  });

  const productMap = {};
  products.forEach(p => {
    productMap[p._id.toString()] = p;
  });

  const errors = [];

  for (const item of items) {
    const product = productMap[item.product.toString()];
    
    if (!product) {
      errors.push(`Product with ID ${item.product} not found or inactive`);
      continue;
    }

    if (product.quantity < item.quantity) {
      errors.push(
        `Insufficient stock for ${product.productName} (${product.productCode}). ` +
        `Available: ${product.quantity}, Requested: ${item.quantity}`
      );
    }

    // Validate price integrity
    if (item.unitPrice !== product.sellingPrice) {
      errors.push(
        `Price mismatch for ${product.productName}. ` +
        `Expected: ${product.sellingPrice}, Received: ${item.unitPrice}`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return products;
};

/**
 * Create order with atomic stock update
 */
export const createOrderWithStockUpdate = async (orderData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Prepare order data
    const preparedData = prepareOrderData(orderData, userId);
    
    // Validate stock availability
    await validateStockAvailability(preparedData.items);

    // Create order
    const order = new Order(preparedData);
    await order.save({ session });

    // Update inventory atomically
    await order.updateInventory();

    await session.commitTransaction();
    session.endSession();

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'productName productCode sellingPrice')
      .populate('processedBy', 'firstName lastName email');

    return populatedOrder;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Update order status with atomic operations
 */
export const updateOrderStatus = async (orderId, newStatus, userId, notes = '') => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // If cancelling, handle restock
    if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      await order.cancelOrder(userId);
    } else {
      await order.transitionStatus(newStatus, userId, notes);
    }

    await session.commitTransaction();
    session.endSession();

    // Populate order details
    const populatedOrder = await Order.findById(orderId)
      .populate('items.product', 'productName productCode sellingPrice')
      .populate('processedBy', 'firstName lastName email')
      .populate('statusHistory.changedBy', 'firstName lastName email');

    return populatedOrder;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get orders with filters and pagination
 */
export const getOrdersWithFilters = async (filters) => {
  const {
    page = 1,
    limit = 10,
    status,
    customerEmail,
    search,
    fromDate,
    toDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  }

  // Customer email filter
  if (customerEmail) {
    query.customerEmail = { $regex: customerEmail, $options: 'i' };
  }

  // Search filter
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { orderNumber: { $regex: search, $options: 'i' } }
    ];
  }

  // Date range filter
  if (fromDate || toDate) {
    query.orderDate = {};
    if (fromDate) query.orderDate.$gte = new Date(fromDate);
    if (toDate) query.orderDate.$lte = new Date(toDate);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with aggregation for additional stats
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('items.product', 'productName productCode sellingPrice')
      .populate('processedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query)
  ]);

  // Get status distribution for filters
  const statusDistribution = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  return {
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    },
    filters: {
      statusDistribution
    }
  };
};