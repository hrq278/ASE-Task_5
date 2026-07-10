// client/src/components/dashboard/StockStatusChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const StockStatusChart = ({ data }) => {
  const chartData = [
    { 
      name: 'In Stock', 
      value: data.summary.totalProducts - data.summary.lowStockCount - data.summary.outOfStockCount,
      color: '#4caf50'
    },
    { 
      name: 'Low Stock', 
      value: data.summary.lowStockCount,
      color: '#ed6c02'
    },
    { 
      name: 'Out of Stock', 
      value: data.summary.outOfStockCount,
      color: '#d32f2f'
    }
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Stock Status Distribution
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={true}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} products`, 'Quantity']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total Products: {total}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StockStatusChart;