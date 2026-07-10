// client/src/components/dashboard/Dashboard.jsx
import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import {
  ShoppingCart as ProductIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  Receipt as OrderIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const stats = {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalSuppliers: 0,
    totalOrders: 0,
    inventoryValue: 0
  };

  const cards = [
    { title: 'Total Products', value: stats.totalProducts, icon: <ProductIcon />, color: '#1976d2' },
    { title: 'Low Stock', value: stats.lowStockCount, icon: <WarningIcon />, color: '#ed6c02' },
    { title: 'Out of Stock', value: stats.outOfStockCount, icon: <InventoryIcon />, color: '#d32f2f' },
    { title: 'Suppliers', value: stats.totalSuppliers, icon: <StoreIcon />, color: '#2e7d32' },
    { title: 'Orders', value: stats.totalOrders, icon: <OrderIcon />, color: '#6f42c1' },
    { title: 'Inventory Value', value: `$${stats.inventoryValue}`, icon: <MoneyIcon />, color: '#00bcd4' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: 0 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 3, p: 3, borderRadius: 0 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Dashboard content coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;