// client/src/utils/validators.js
export const validateProduct = (data) => {
  const errors = {};

  if (!data.productName || data.productName.trim() === '') {
    errors.productName = 'Product name is required';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.supplier) {
    errors.supplier = 'Supplier is required';
  }

  if (!data.purchasePrice || data.purchasePrice <= 0) {
    errors.purchasePrice = 'Purchase price must be greater than 0';
  }

  if (!data.sellingPrice || data.sellingPrice <= 0) {
    errors.sellingPrice = 'Selling price must be greater than 0';
  } else if (parseFloat(data.sellingPrice) < parseFloat(data.purchasePrice)) {
    errors.sellingPrice = 'Selling price cannot be lower than purchase price';
  }

  if (data.quantity !== undefined && data.quantity !== '') {
    if (parseInt(data.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }
  }

  if (data.minimumStockLevel !== undefined && data.minimumStockLevel !== '') {
    if (parseInt(data.minimumStockLevel) < 0) {
      errors.minimumStockLevel = 'Minimum stock level cannot be negative';
    }
  }

  return errors;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateOrder = (data) => {
  const errors = {};

  if (!data.customerName || data.customerName.trim() === '') {
    errors.customerName = 'Customer name is required';
  }

  if (!data.customerEmail || !validateEmail(data.customerEmail)) {
    errors.customerEmail = 'Valid email is required';
  }

  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one item is required';
  }

  return errors;
};