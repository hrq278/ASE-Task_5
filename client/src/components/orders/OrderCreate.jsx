// client/src/components/orders/OrderCreate.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useOrderValidation } from '../../hooks/useOrderValidation';
import { orderService } from '../../services/order.service';
import { useNavigate } from 'react-router-dom';

const OrderCreate = () => {
  const navigate = useNavigate();
  const { validateItems, errors, isValid, validating } = useOrderValidation();
  
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });

  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Load products for dropdown
  useEffect(() => {
    // Fetch products for selection
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products?limit=100&isActive=true');
        setProducts(response.data.data.products);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    if (quantity < 1) return;

    const existingItem = items.find(item => item.product === selectedProduct._id);
    if (existingItem) {
      const newItems = items.map(item => 
        item.product === selectedProduct._id
          ? { ...item, quantity: item.quantity + parseInt(quantity) }
          : item
      );
      setItems(newItems);
    } else {
      setItems([...items, {
        product: selectedProduct._id,
        productCode: selectedProduct.productCode,
        productName: selectedProduct.productName,
        quantity: parseInt(quantity),
        unitPrice: selectedProduct.sellingPrice,
        purchasePrice: selectedProduct.purchasePrice,
        totalPrice: parseInt(quantity) * selectedProduct.sellingPrice
      }]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    const newItems = [...items];
    const item = newItems[index];
    item.quantity = parseInt(newQuantity);
    item.totalPrice = item.quantity * item.unitPrice;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    // Validate items first
    const validation = await validateItems(items);
    if (!validation?.allValid) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError(null);

      const orderData = {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          purchasePrice: item.purchasePrice
        })),
        paymentMethod: 'Cash'
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        navigate(`/orders/${response.data._id}`);
      }
    } catch (error) {
      setSubmissionError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Order
      </Typography>

      {submissionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmissionError(null)}>
          {submissionError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={customer.address.street}
                    onChange={(e) => setCustomer({
                      ...customer,
                      address: { ...customer.address, street: e.target.value }
                    })}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Autocomplete
                  fullWidth
                  options={products}
                  getOptionLabel={(option) => `${option.productCode} - ${option.productName}`}
                  value={selectedProduct}
                  onChange={(_, newValue) => setSelectedProduct(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Product" size="small" />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box>
                        <Typography variant="body1">{option.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.productCode} | Stock: {option.quantity} | Price: ${option.sellingPrice}
                        </Typography>
                      </Box>
                    </li>
                  )}
                />
                <TextField
                  label="Qty"
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  sx={{ width: 80 }}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Items List */}
              {items.map((item, index) => (
                <Paper key={index} sx={{ p: 1, mb: 1, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.productCode} | ${item.unitPrice}/unit
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        sx={{ width: 70 }}
                        inputProps={{ min: 1 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        ${item.totalPrice}
                      </Typography>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${totalAmount.toFixed(2)}</Typography>
              </Box>

              {errors.length > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {errors.map((error, index) => (
                    <div key={index}>{error.productName}: {error.errors.join(', ')}</div>
                  ))}
                </Alert>
              )}

              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={items.length === 0 || validating || submitting || !isValid}
                  onClick={handleSubmit}
                  startIcon={submitting ? <CircularProgress size={20} /> : <CartIcon />}
                >
                  {submitting ? 'Creating Order...' : 'Create Order'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderCreate;