// models/Order.model.js
import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productCode: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  purchasePrice: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerAddress: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'delivered', 'cancelled'],
      message: 'Status must be pending, processing, delivered, or cancelled'
    },
    default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Bank Transfer', 'Mobile Payment'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const Counter = mongoose.model('Counter');
    const sequence = await Counter.getNextSequence('orderNumber');
    this.orderNumber = `ORD-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate total amount
OrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
  }
  next();
});

// Method to update inventory (atomic operation)
OrderSchema.methods.updateInventory = async function() {
  const Product = mongoose.model('Product');
  const errors = [];

  // Check stock availability for all items first
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      errors.push(`Product ${item.productName} not found`);
      continue;
    }
    if (product.quantity < item.quantity) {
      errors.push(
        `Insufficient stock for ${product.productName}. Available: ${product.quantity}, Requested: ${item.quantity}`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  // Atomic stock update for each item
  for (const item of this.items) {
    const product = await Product.findOneAndUpdate(
      { 
        _id: item.product,
        quantity: { $gte: item.quantity } // Optimistic lock condition
      },
      { $inc: { quantity: -item.quantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error(
        `Failed to update stock for ${item.productName}. Product may have been updated by another transaction.`
      );
    }
  }

  return true;
};

// Method to cancel order and restock
OrderSchema.methods.cancelOrder = async function(userId) {
  if (this.status === 'cancelled') {
    throw new Error('Order is already cancelled');
  }
  
  if (this.status === 'delivered') {
    throw new Error('Cannot cancel a delivered order');
  }

  const Product = mongoose.model('Product');
  const errors = [];

  // Restock items
  for (const item of this.items) {
    const product = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { quantity: item.quantity } },
      { new: true, runValidators: true }
    );

    if (!product) {
      errors.push(`Failed to restock ${item.productName}. Product not found.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Restock errors: ${errors.join('; ')}`);
  }

  // Update order status
  this.status = 'cancelled';
  this.statusHistory.push({
    status: 'cancelled',
    changedBy: userId,
    notes: 'Order cancelled by user'
  });

  await this.save();
  return true;
};

// Method to transition status
OrderSchema.methods.transitionStatus = async function(newStatus, userId, notes = '') {
  const validTransitions = {
    'pending': ['processing', 'cancelled'],
    'processing': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${this.status} to ${newStatus}`
    );
  }

  // If moving to cancelled, restock
  if (newStatus === 'cancelled' && this.status !== 'cancelled') {
    await this.cancelOrder(userId);
    return;
  }

  this.status = newStatus;
  if (newStatus === 'delivered') {
    this.deliveryDate = new Date();
  }

  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    notes
  });

  await this.save();
  return true;
};

// Virtual for order age
OrderSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ 'items.product': 1 });

const Order = mongoose.model('Order', OrderSchema);
export default Order;