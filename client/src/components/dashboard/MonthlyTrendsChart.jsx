// client/src/components/dashboard/MonthlyTrendsChart.jsx
import React from 'react';
import { 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Paper, Typography, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState } from 'react';

const MonthlyTrendsChart = ({ data }) => {
  const [viewType, setViewType] = useState('both');

  const chartData = data.monthlyTrends || [];

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Monthly Trends
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewChange}
          size="small"
        >
          <ToggleButton value="orders">Orders</ToggleButton>
          <ToggleButton value="revenue">Revenue</ToggleButton>
          <ToggleButton value="both">Both</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthLabel" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'Revenue') return `$${value.toLocaleString()}`;
              return value;
            }}
          />
          <Legend />
          {(viewType === 'orders' || viewType === 'both') && (
            <Bar 
              yAxisId="left" 
              dataKey="orders" 
              fill="#1976d2" 
              name="Orders"
              barSize={20}
            />
          )}
          {(viewType === 'revenue' || viewType === 'both') && (
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="revenue" 
              stroke="#ed6c02" 
              name="Revenue"
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MonthlyTrendsChart;