// client/src/components/products/ProductList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { productService } from '../../services/product.service';
import ProductForm from './ProductForm';
import { useAuth } from '../../context/AuthContext';

const ProductList = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplier: '',
    stockStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchFiltersData();
  }, [page, rowsPerPage, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProducts({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      setProducts(response.data.products);
      setTotal(response.data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        productService.getCategories(),
        productService.getSuppliers()
      ]);
      setCategories(categoriesRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch filter data:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      supplier: '',
      stockStatus: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPage(0);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await productService.deleteProduct(productToDelete._id);
      fetchProducts();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const getStockStatusChip = (product) => {
    const status = product.stockStatus || 'Unknown';
    const colorMap = {
      'In Stock': 'success',
      'Low Stock': 'warning',
      'Out of Stock': 'error'
    };
    return (
      <Chip
        label={status}
        color={colorMap[status] || 'default'}
        size="small"
        sx={{ borderRadius: 0 }}
      />
    );
  };

  const canEdit = hasRole(['admin', 'manager']);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedProduct(null);
              setFormOpen(true);
            }}
            sx={{ borderRadius: 0 }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, borderRadius: 0 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={filters.stockStatus}
                  onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                  label="Stock Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Date Created</MenuItem>
                  <MenuItem value="productName">Name</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="sellingPrice">Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                fullWidth
                sx={{ borderRadius: 0 }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 0 }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f7fa' }}>
              <TableRow>
                <TableCell>Product Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No products found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {product.productCode}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.category?.name || 'N/A'}</TableCell>
                    <TableCell>${product.sellingPrice}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{getStockStatusChip(product)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(product)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(product)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={handleFormSuccess}
        categories={categories}
        suppliers={suppliers}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{productToDelete?.productName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 0 }}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ borderRadius: 0 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;