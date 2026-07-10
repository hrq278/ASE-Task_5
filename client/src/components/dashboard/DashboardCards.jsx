// client/src/components/dashboard/DashboardCards.jsx
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
  Refresh as RefreshIcon
} from '@mui/icons-material';

const DashboardCards = ({ data, loading, onRefresh }) => {
  const cards = [
    {
      title: 'Total Products',
      value: data.summary.totalProducts,
      icon: <ProductIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#1976d2',
      subtitle: `${data.summary.totalQuantity} units total`
    },
    {
      title: 'Low Stock Products',
      value: data.summary.lowStockCount,
      icon: <WarningIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#ed6c02',
      subtitle: `${data.summary.lowStockPercentage}% of total`,
      warning: data.summary.lowStockCount > 5
    },
    {
      title: 'Out of Stock',
      value: data.summary.outOfStockCount,
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#d32f2f' }} />,
      color: '#d32f2f',
      subtitle: `${data.summary.outOfStockPercentage}% of total`,
      warning: data.summary.outOfStockCount > 0
    },
    {
      title: 'Total Suppliers',
      value: data.summary.totalSuppliers,
      icon: <StoreIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#2e7d32'
    },
    {
      title: 'Total Orders',
      value: data.summary.totalOrders,
      icon: <OrderIcon sx={{ fontSize: 40, color: '#6f42c1' }} />,
      color: '#6f42c1'
    },
    {
      title: 'Inventory Value',
      value: `$${data.summary.inventoryValue?.toLocaleString() || 0}`,
      icon: <MoneyIcon sx={{ fontSize: 40, color: '#00bcd4' }} />,
      color: '#00bcd4',
      subtitle: `Avg: $${data.summary.averageStockLevel || 0} per product`
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Dashboard Overview
        </Typography>
        <Tooltip title="Refresh Dashboard">
          <IconButton onClick={onRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" component="div" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {loading ? '-' : card.value}
                    </Typography>
                    {card.subtitle && (
                      <Typography variant="body2" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    )}
                  </Box>
                  {card.icon}
                </Box>
                {card.warning && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={100} 
                      sx={{ 
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#ffcdd2',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#d32f2f'
                        }
                      }} 
                    />
                    <Typography variant="caption" color="error">
                      Attention Required!
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

export default DashboardCards;