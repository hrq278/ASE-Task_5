// client/src/components/products/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { productService } from '../../services/product.service.js';
import { validateProduct } from '../../utils/validators.js';

const ProductForm = ({ open, onClose, product, onSuccess, categories, suppliers }) => {
  const isEdit = !!product;
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    supplier: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    minimumStockLevel: '',
    description: '',
    productImage: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        category: product.category?._id || product.category || '',
        supplier: product.supplier?._id || product.supplier || '',
        purchasePrice: product.purchasePrice || '',
        sellingPrice: product.sellingPrice || '',
        quantity: product.quantity || '',
        minimumStockLevel: product.minimumStockLevel || '',
        description: product.description || '',
        productImage: null
      });
      if (product.productImage) {
        setImagePreview(product.productImage);
      }
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setFormData({
      productName: '',
      category: '',
      supplier: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      minimumStockLevel: '',
      description: '',
      productImage: null
    });
    setImagePreview(null);
    setErrors({});
    setSubmitError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, productImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const validationErrors = validateProduct(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (isEdit) {
        response = await productService.updateProduct(product._id, formDataToSend);
      } else {
        response = await productService.createProduct(formDataToSend);
      }

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setSubmitError(response.message || 'Failed to save product');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              error={!!errors.productName}
              helperText={errors.productName}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category *"
              >
                <MenuItem value="">Select Category</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error">{errors.category}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.supplier}>
              <InputLabel>Supplier *</InputLabel>
              <Select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                label="Supplier *"
              >
                <MenuItem value="">Select Supplier</MenuItem>
                {suppliers.map(sup => (
                  <MenuItem key={sup._id} value={sup._id}>{sup.companyName}</MenuItem>
                ))}
              </Select>
              {errors.supplier && (
                <Typography variant="caption" color="error">{errors.supplier}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Price"
              name="purchasePrice"
              type="number"
              value={formData.purchasePrice}
              onChange={handleChange}
              error={!!errors.purchasePrice}
              helperText={errors.purchasePrice}
              required
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Selling Price"
              name="sellingPrice"
              type="number"
              value={formData.sellingPrice}
              onChange={handleChange}
              error={!!errors.sellingPrice}
              helperText={errors.sellingPrice}
              required
              InputProps={{ startAdornment: '$' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Minimum Stock Level"
              name="minimumStockLevel"
              type="number"
              value={formData.minimumStockLevel}
              onChange={handleChange}
              error={!!errors.minimumStockLevel}
              helperText={errors.minimumStockLevel}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              sx={{ borderRadius: 0 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {imagePreview && (
              <Box sx={{ mt: 1 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} 
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ borderRadius: 0 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ borderRadius: 0 }}
        >
          {loading ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;