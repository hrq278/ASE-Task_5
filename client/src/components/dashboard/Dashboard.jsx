// client/src/components/dashboard/Dashboard.jsx
import React from 'react';
import { 
  Box, 
  Grid, 
  Container, 
  CircularProgress, 
  Alert, 
  Typography 
} from '@mui/material';
import { useDashboard } from '../../hooks/useDashboard';
import DashboardCards from './DashboardCards';
import StockStatusChart from './StockStatusChart';
import CategoryDistributionChart from './CategoryDistributionChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import TopSellingProducts from './TopSellingProducts';
import RecentOrders from './RecentOrders';
import StockAlertsList from './StockAlertsList';

const Dashboard = () => {
  const { loading, error, data, refresh } = useDashboard();

  if (loading && !data.summary.totalProducts) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Please try refreshing the page or contact support.
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <DashboardCards data={data} loading={loading} onRefresh={refresh} />

      <Grid container spacing={3}>
        {/* Stock Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <StockStatusChart data={data} />
        </Grid>

        {/* Category Distribution Bar Chart */}
        <Grid item xs={12} md={6}>
          <CategoryDistributionChart data={data} />
        </Grid>

        {/* Monthly Trends */}
        <Grid item xs={12}>
          <MonthlyTrendsChart data={data} />
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} md={6}>
          <TopSellingProducts products={data.topSellingProducts} />
        </Grid>

        {/* Stock Alerts */}
        <Grid item xs={12} md={6}>
          <StockAlertsList 
            lowStock={data.lowStockProducts}
            outOfStock={data.outOfStockProducts}
          />
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <RecentOrders orders={data.recentOrders} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;