// client/src/components/dashboard/StockAlertsList.jsx
import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Box
} from '@mui/material';
import {
  Warning as WarningIcon,
  Dangerous as DangerousIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const StockAlertsList = ({ lowStock = [], outOfStock = [] }) => {
  const totalAlerts = lowStock.length + outOfStock.length;

  if (totalAlerts === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Stock Alerts
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All products are well stocked!
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%', maxHeight: 400, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Stock Alerts
        <Chip 
          label={`${totalAlerts} alerts`} 
          color="error" 
          size="small" 
          sx={{ ml: 1 }} 
        />
      </Typography>

      <List dense>
        {outOfStock.map((product) => (
          <ListItem key={product._id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#d32f2f' }}>
                <DangerousIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={product.productName}
              secondary={`${product.productCode} - Out of Stock`}
            />
            <Chip label="URGENT" color="error" size="small" />
          </ListItem>
        ))}
        {outOfStock.length > 0 && lowStock.length > 0 && <Divider />}
        {lowStock.map((product) => (
          <ListItem key={product._id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: '#ed6c02' }}>
                <WarningIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={product.productName}
              secondary={`${product.productCode} - ${product.quantity} units left (Min: ${product.minimumStockLevel})`}
            />
            <Chip label="Low Stock" color="warning" size="small" />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default StockAlertsList;