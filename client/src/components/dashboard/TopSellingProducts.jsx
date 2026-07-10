// client/src/components/dashboard/TopSellingProducts.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box
} from '@mui/material';

const TopSellingProducts = ({ products = [] }) => {
  if (products.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Top Selling Products
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No sales data available yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Top Selling Products
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Units Sold</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {product.productName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.productCode}
                  </Typography>
                </TableCell>
                <TableCell align="right">{product.totalSold}</TableCell>
                <TableCell align="right">
                  ${product.totalRevenue.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${product.quantity} units`}
                    size="small"
                    color={product.quantity === 0 ? 'error' : 'default'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TopSellingProducts;