// utils/stock.utils.js
import Product from '../models/Product.model.js';

/**
 * Check stock availability for multiple products
 */
export const checkStockAvailability = async (items) => {
  const productIds = items.map(item => item.product);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true
  });

  const stockStatus = {};
  products.forEach(p => {
    stockStatus[p._id.toString()] = {
      product: p,
      available: p.quantity,
      minimumStock: p.minimumStockLevel,
      status: p.quantity === 0 ? 'out_of_stock' :
              p.quantity <= p.minimumStockLevel ? 'low_stock' : 'in_stock'
    };
  });

  return stockStatus;
};

/**
 * Calculate low stock products
 */
export const getLowStockProducts = async (threshold = null) => {
  const query = {
    isActive: true,
    $expr: {
      $lte: ['$quantity', '$minimumStockLevel']
    }
  };

  if (threshold !== null) {
    query.quantity = { $gt: 0 };
  }

  const products = await Product.find(query)
    .select('productName productCode quantity minimumStockLevel')
    .sort({ quantity: 1 })
    .limit(50);

  return products;
};

/**
 * Get products that need reordering
 */
export const getReorderProducts = async () => {
  const products = await Product.find({
    isActive: true,
    $expr: {
      $lte: ['$quantity', { $divide: ['$minimumStockLevel', 2] }]
    }
  })
  .select('productName productCode quantity minimumStockLevel')
  .sort({ quantity: 1 });

  return products;
};

/**
 * Bulk update stock
 */
export const bulkUpdateStock = async (updates) => {
  const session = await Product.startSession();
  session.startTransaction();

  try {
    const results = [];

    for (const update of updates) {
      const product = await Product.findOneAndUpdate(
        {
          _id: update.productId,
          quantity: { $gte: update.quantity } // Optimistic lock
        },
        { $inc: { quantity: -update.quantity } },
        { new: true, session }
      );

      results.push({
        productId: update.productId,
        success: !!product,
        newQuantity: product?.quantity || 0,
        previousQuantity: product ? product.quantity + update.quantity : 0
      });
    }

    await session.commitTransaction();
    session.endSession();

    return results;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};