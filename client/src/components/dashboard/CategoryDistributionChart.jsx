// client/src/components/dashboard/CategoryDistributionChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const CategoryDistributionChart = ({ data }) => {
  // Sort and limit to top 10 categories
  const chartData = data.categoryDistribution
    ?.slice(0, 10)
    .map(item => ({
      name: item.categoryName || 'Uncategorized',
      products: item.productCount,
      value: item.totalValue
    })) || [];

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Category Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#1976d2" />
          <YAxis yAxisId="right" orientation="right" stroke="#ed6c02" />
          <Tooltip />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="products" 
            fill="#1976d2" 
            name="Number of Products"
          />
          <Bar 
            yAxisId="right" 
            dataKey="value" 
            fill="#ed6c02" 
            name="Total Value ($)"
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CategoryDistributionChart;