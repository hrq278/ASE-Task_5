// client/src/components/dashboard/DashboardStats.jsx
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  ShoppingCart as ProductIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  Receipt as OrderIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons/material';

const DashboardStats = ({ stats = {}, loading = false, onRefresh }) => {
  const {
    totalProducts = 0,
    lowStockCount = 0,
    outOfStockCount = 0,
    totalSuppliers = 0,
    totalOrders = 0,
    inventoryValue = 0,
    lowStockPercentage = 0,
    outOfStockPercentage = 0,
    averageStockLevel = 0,
    totalQuantity = 0,
    inStockCount = 0,
    monthlyRevenue = 0,
    monthlyGrowth = 0
  } = stats;

  const statCards = [
    {
      id: 'total-products',
      title: 'Total Products',
      value: totalProducts,
      icon: <ProductIcon />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      subtitle: `${totalQuantity} units total`,
      tooltip: 'Total number of products in inventory'
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: <WarningIcon />,
      color: '#ed6c02',
      bgColor: '#fff3e0',
      subtitle: `${lowStockPercentage}% of inventory`,
      tooltip: 'Products with quantity below minimum stock level',
      warning: lowStockCount > 5
    },
    {
      id: 'out-of-stock',
      title: 'Out of Stock',
      value: outOfStockCount,
      icon: <InventoryIcon />,
      color: '#d32f2f',
      bgColor: '#ffebee',
      subtitle: `${outOfStockPercentage}% of inventory`,
      tooltip: 'Products with zero quantity',
      warning: outOfStockCount > 0
    },
    {
      id: 'in-stock',
      title: 'In Stock Products',
      value: inStockCount,
      icon: <InventoryIcon />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      subtitle: `${((inStockCount / totalProducts) * 100).toFixed(1) || 0}% of inventory`,
      tooltip: 'Products with sufficient stock'
    },
    {
      id: 'suppliers',
      title: 'Total Suppliers',
      value: totalSuppliers,
      icon: <StoreIcon />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      tooltip: 'Active suppliers in the system'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: totalOrders,
      icon: <OrderIcon />,
      color: '#6f42c1',
      bgColor: '#f3e5f5',
      tooltip: 'Total orders processed'
    },
    {
      id: 'inventory-value',
      title: 'Inventory Value',
      value: `$${inventoryValue.toLocaleString() || 0}`,
      icon: <MoneyIcon />,
      color: '#00bcd4',
      bgColor: '#e0f7fa',
      subtitle: `Avg: $${averageStockLevel.toFixed(2) || 0} per product`,
      tooltip: 'Total value of inventory (quantity × purchase price)'
    },
    {
      id: 'monthly-revenue',
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString() || 0}`,
      icon: <TrendingUpIcon />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      subtitle: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}% vs last month`,
      tooltip: 'Revenue generated this month',
      trend: monthlyGrowth >= 0 ? 'up' : 'down'
    }
  ];

  // Show only top 6 cards (or all based on preference)
  const displayCards = statCards.slice(0, 6);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time inventory and order statistics
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={onRefresh} disabled={loading} sx={{ borderRadius: 0 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {displayCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
            <Card
              sx={{
                borderRadius: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  transform: 'translateY(-2px)'
                },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* Top bar with color accent */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    bgcolor: card.color
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontWeight: 500,
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {card.title}
                      </Typography>
                      {card.tooltip && (
                        <Tooltip title={card.tooltip}>
                          <IconButton size="small" sx={{ p: 0.5 }}>
                            <InfoIcon fontSize="small" sx={{ fontSize: '14px', color: '#999' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: card.color,
                          fontSize: { xs: '1.5rem', sm: '1.75rem' }
                        }}
                      >
                        {loading ? '-' : card.value}
                      </Typography>

                      {card.trend && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: card.trend === 'up' ? '#2e7d32' : '#d32f2f'
                          }}
                        >
                          {card.trend === 'up' ? (
                            <TrendingUpIcon sx={{ fontSize: '16px' }} />
                          ) : (
                            <TrendingDownIcon sx={{ fontSize: '16px' }} />
                          )}
                        </Box>
                      )}
                    </Box>

                    {card.subtitle && (
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                          display: 'block',
                          mt: 0.25,
                          fontSize: '12px'
                        }}
                      >
                        {card.subtitle}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: card.bgColor,
                      color: card.color,
                      flexShrink: 0,
                      ml: 1
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>

                {card.warning && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 4,
                        borderRadius: 0,
                        bgcolor: '#ffcdd2',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#d32f2f'
                        }
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        fontWeight: 600,
                        fontSize: '10px',
                        textTransform: 'uppercase'
                      }}
                    >
                      Attention Required
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;