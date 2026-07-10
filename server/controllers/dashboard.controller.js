// controllers/dashboard.controller.js
import Product from '../models/Product.model.js';
import Order from '../models/Order.model.js';
import Supplier from '../models/Supplier.model.js';
import Category from '../models/Category.model.js';
import mongoose from 'mongoose';

/**
 * Get Dashboard Summary
 * Uses MongoDB aggregation pipeline with $facet for optimized single-query execution
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const startTime = Date.now();

    // Execute aggregation pipeline
    const [dashboardData] = await Product.aggregate([
      {
        $facet: {
          // Product statistics
          productStats: [
            {
              $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                inventoryValue: { 
                  $sum: { $multiply: ['$quantity', '$purchasePrice'] } 
                },
                totalQuantity: { $sum: '$quantity' }
              }
            }
          ],
          
          // Stock status counts
          stockStatus: [
            {
              $group: {
                _id: null,
                lowStockCount: {
                  $sum: {
                    $cond: [
                      { 
                        $and: [
                          { $gt: ['$quantity', 0] },
                          { $lte: ['$quantity', '$minimumStockLevel'] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                outOfStockCount: {
                  $sum: {
                    $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
                  }
                },
                inStockCount: {
                  $sum: {
                    $cond: [
                      { $gt: ['$quantity', '$minimumStockLevel'] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          
          // Category wise product count
          categoryDistribution: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalValue: { 
                  $sum: { $multiply: ['$quantity', '$purchasePrice'] } 
                }
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails'
              }
            },
            {
              $unwind: {
                path: '$categoryDetails',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                categoryId: '$_id',
                categoryName: '$categoryDetails.name',
                productCount: '$count',
                totalValue: 1,
                _id: 0
              }
            },
            {
              $sort: { productCount: -1 }
            }
          ],
          
          // Low stock products (for warning list)
          lowStockProducts: [
            {
              $match: {
                $and: [
                  { $gt: ['$quantity', 0] },
                  { $lte: ['$quantity', '$minimumStockLevel'] }
                ]
              }
            },
            {
              $sort: { quantity: 1 }
            },
            {
              $limit: 10
            },
            {
              $project: {
                _id: 1,
                productName: 1,
                productCode: 1,
                quantity: 1,
                minimumStockLevel: 1,
                sellingPrice: 1
              }
            }
          ],
          
          // Out of stock products
          outOfStockProducts: [
            {
              $match: {
                quantity: 0
              }
            },
            {
              $limit: 10
            },
            {
              $project: {
                _id: 1,
                productName: 1,
                productCode: 1,
                sellingPrice: 1
              }
            }
          ],
          
          // Top selling products (based on orders)
          topSellingProducts: [
            {
              $lookup: {
                from: 'orders',
                let: { productId: '$_id' },
                pipeline: [
                  {
                    $unwind: '$items'
                  },
                  {
                    $match: {
                      $expr: { 
                        $and: [
                          { $eq: ['$items.product', '$$productId'] },
                          { $in: ['$status', ['delivered', 'processing']] }
                        ]
                      }
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      totalSold: { $sum: '$items.quantity' },
                      totalRevenue: { 
                        $sum: { 
                          $multiply: ['$items.quantity', '$items.unitPrice'] 
                        } 
                      }
                    }
                  }
                ],
                as: 'salesData'
              }
            },
            {
              $addFields: {
                totalSold: { 
                  $ifNull: [{ $arrayElemAt: ['$salesData.totalSold', 0] }, 0] 
                },
                totalRevenue: { 
                  $ifNull: [{ $arrayElemAt: ['$salesData.totalRevenue', 0] }, 0] 
                }
              }
            },
            {
              $match: {
                totalSold: { $gt: 0 }
              }
            },
            {
              $sort: { totalSold: -1 }
            },
            {
              $limit: 10
            },
            {
              $project: {
                _id: 1,
                productName: 1,
                productCode: 1,
                totalSold: 1,
                totalRevenue: 1,
                sellingPrice: 1,
                quantity: 1
              }
            }
          ],
          
          // Recent orders (for activity feed)
          recentOrders: [
            {
              $lookup: {
                from: 'orders',
                let: {},
                pipeline: [
                  {
                    $sort: { createdAt: -1 }
                  },
                  {
                    $limit: 10
                  },
                  {
                    $project: {
                      orderNumber: 1,
                      customerName: 1,
                      totalAmount: 1,
                      status: 1,
                      createdAt: 1
                    }
                  }
                ],
                as: 'orders'
              }
            },
            {
              $unwind: {
                path: '$orders',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $replaceRoot: {
                newRoot: '$orders'
              }
            }
          ]
        }
      },
      {
        $project: {
          summary: {
            totalProducts: { 
              $ifNull: [{ $arrayElemAt: ['$productStats.totalProducts', 0] }, 0] 
            },
            inventoryValue: { 
              $ifNull: [{ $arrayElemAt: ['$productStats.inventoryValue', 0] }, 0] 
            },
            totalQuantity: { 
              $ifNull: [{ $arrayElemAt: ['$productStats.totalQuantity', 0] }, 0] 
            },
            lowStockCount: { 
              $ifNull: [{ $arrayElemAt: ['$stockStatus.lowStockCount', 0] }, 0] 
            },
            outOfStockCount: { 
              $ifNull: [{ $arrayElemAt: ['$stockStatus.outOfStockCount', 0] }, 0] 
            },
            inStockCount: { 
              $ifNull: [{ $arrayElemAt: ['$stockStatus.inStockCount', 0] }, 0] 
            }
          },
          categoryDistribution: 1,
          lowStockProducts: 1,
          outOfStockProducts: 1,
          topSellingProducts: 1,
          recentOrders: 1
        }
      }
    ]);

    // Get total suppliers and orders separately (faster than aggregating with products)
    const [supplierCount, orderCount] = await Promise.all([
      Supplier.countDocuments({ isActive: true }),
      Order.countDocuments()
    ]);

    // Calculate additional metrics
    const summary = {
      ...dashboardData.summary,
      totalSuppliers: supplierCount,
      totalOrders: orderCount,
      lowStockPercentage: dashboardData.summary.totalProducts > 0 
        ? (dashboardData.summary.lowStockCount / dashboardData.summary.totalProducts * 100).toFixed(1)
        : 0,
      outOfStockPercentage: dashboardData.summary.totalProducts > 0
        ? (dashboardData.summary.outOfStockCount / dashboardData.summary.totalProducts * 100).toFixed(1)
        : 0,
      averageStockLevel: dashboardData.summary.totalProducts > 0
        ? (dashboardData.summary.totalQuantity / dashboardData.summary.totalProducts).toFixed(0)
        : 0
    };

    // Get monthly trends (last 6 months)
    const monthlyTrends = await getMonthlyTrends();

    // Get order status distribution
    const orderStatusDistribution = await getOrderStatusDistribution();

    const executionTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      data: {
        summary,
        categoryDistribution: dashboardData.categoryDistribution || [],
        lowStockProducts: dashboardData.lowStockProducts || [],
        outOfStockProducts: dashboardData.outOfStockProducts || [],
        topSellingProducts: dashboardData.topSellingProducts || [],
        recentOrders: dashboardData.recentOrders || [],
        monthlyTrends,
        orderStatusDistribution,
        meta: {
          executionTime: `${executionTime}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message
    });
  }
};

/**
 * Get Monthly Trends (Last 6 Months)
 */
const getMonthlyTrends = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const trends = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ['delivered', 'processing'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
        items: { $sum: { $size: '$items' } }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            { 
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        monthLabel: {
          $let: {
            vars: {
              months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            in: { $arrayElemAt: ['$$months', { $subtract: ['$_id.month', 1] }] }
          }
        },
        orders: 1,
        revenue: 1,
        items: 1
      }
    }
  ]);

  return trends;
};

/**
 * Get Order Status Distribution
 */
const getOrderStatusDistribution = async () => {
  const distribution = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1,
        totalAmount: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return distribution;
};

/**
 * Get Dashboard Quick Stats (Lightweight version)
 */
export const getQuickStats = async (req, res) => {
  try {
    const [productStats, orderStats] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            inventoryValue: { 
              $sum: { $multiply: ['$quantity', '$purchasePrice'] } 
            },
            lowStock: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $gt: ['$quantity', 0] },
                      { $lte: ['$quantity', '$minimumStockLevel'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [{ $eq: ['$quantity', 0] }, 1, 0]
              }
            }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
              }
            },
            todayOrders: {
              $sum: {
                $cond: [
                  { 
                    $eq: [
                      { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                      { $dateToString: { format: '%Y-%m-%d', date: new Date() } }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const stats = {
      products: productStats[0] || {
        totalProducts: 0,
        totalQuantity: 0,
        inventoryValue: 0,
        lowStock: 0,
        outOfStock: 0
      },
      orders: orderStats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        todayOrders: 0
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick stats',
      error: error.message
    });
  }
};

/**
 * Get Inventory Value Trend
 */
export const getInventoryTrend = async (req, res) => {
  try {
    const trend = await Product.aggregate([
      {
        $group: {
          _id: null,
          currentValue: { 
            $sum: { $multiply: ['$quantity', '$purchasePrice'] } 
          },
          byCategory: {
            $push: {
              category: '$category',
              value: { $multiply: ['$quantity', '$purchasePrice'] }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trend[0] || { currentValue: 0, byCategory: [] }
    });

  } catch (error) {
    console.error('Inventory trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory trend',
      error: error.message
    });
  }
};

/**
 * Get Stock Alert Summary
 */
export const getStockAlerts = async (req, res) => {
  try {
    const alerts = await Product.aggregate([
      {
        $facet: {
          lowStock: [
            {
              $match: {
                $and: [
                  { $gt: ['$quantity', 0] },
                  { $lte: ['$quantity', '$minimumStockLevel'] }
                ]
              }
            },
            { $count: 'count' }
          ],
          outOfStock: [
            {
              $match: { quantity: 0 }
            },
            { $count: 'count' }
          ],
          overstocked: [
            {
              $match: {
                $expr: { $gt: ['$quantity', { $multiply: ['$minimumStockLevel', 10] }] }
              }
            },
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          lowStock: { $arrayElemAt: ['$lowStock.count', 0] },
          outOfStock: { $arrayElemAt: ['$outOfStock.count', 0] },
          overstocked: { $arrayElemAt: ['$overstocked.count', 0] },
          totalAlerts: {
            $add: [
              { $arrayElemAt: ['$lowStock.count', 0] },
              { $arrayElemAt: ['$outOfStock.count', 0] }
            ]
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: alerts[0] || { lowStock: 0, outOfStock: 0, overstocked: 0, totalAlerts: 0 }
    });

  } catch (error) {
    console.error('Stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock alerts',
      error: error.message
    });
  }
};