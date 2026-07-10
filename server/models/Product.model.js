// models/Product.model.js
import mongoose from 'mongoose';
import Counter from './Counter.model.js';

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^ASE-PRD-\d{4}$/, 'Product code must follow format: ASE-PRD-XXXX']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative'],
    validate: {
      validator: function(value) {
        return value >= this.purchasePrice;
      },
      message: 'Selling price cannot be lower than purchase price'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minimumStockLevel: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock level cannot be negative'],
    default: 5
  },
  productImage: {
    type: String,
    default: null
  },
  imagePublicId: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to auto-generate product code
ProductSchema.pre('save', async function(next) {
  if (this.isNew && !this.productCode) {
    try {
      const nextSequence = await Counter.getNextSequence('productCode');
      this.productCode = `ASE-PRD-${String(nextSequence).padStart(4, '0')}`;
    } catch (error) {
      return next(new Error('Failed to generate product code: ' + error.message));
    }
  }
  next();
});

// Pre-update middleware
ProductSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.sellingPrice !== undefined && update.purchasePrice !== undefined) {
    if (update.sellingPrice < update.purchasePrice) {
      return next(new Error('Selling price cannot be lower than purchase price'));
    }
  }
  if (update.quantity !== undefined && update.quantity < 0) {
    return next(new Error('Quantity cannot be negative'));
  }
  next();
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.minimumStockLevel) return 'Low Stock';
  return 'In Stock';
});

// Virtual for inventory value
ProductSchema.virtual('inventoryValue').get(function() {
  return this.quantity * this.purchasePrice;
});

// Virtual for profit margin
ProductSchema.virtual('profitMargin').get(function() {
  if (this.purchasePrice === 0) return 0;
  return ((this.sellingPrice - this.purchasePrice) / this.purchasePrice * 100);
});

// Indexes for performance
ProductSchema.index({ productName: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ productCode: 1 });
ProductSchema.index({ quantity: 1 });
ProductSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', ProductSchema);
export default Product;