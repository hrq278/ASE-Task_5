// models/Product.model.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    productCode: {
        type: String,
        required: [true, 'Product code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [
            /^ASE-PRD-\d{4}$/,
            'Product code must follow the format: ASE-PRD-XXXX'
        ],
        default: function() {
            // Auto-generate product code: ASE-PRD-0001
            return `ASE-PRD-${String(this._id).slice(-4).toUpperCase()}`;
        }
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
        default: 'default-product.png'
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
        ref: 'User'
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
    return ((this.sellingPrice - this.purchasePrice) / this.purchasePrice * 100).toFixed(2);
});

// Pre-save middleware
ProductSchema.pre('save', function(next) {
    if (!this.productCode || this.productCode === 'ASE-PRD-0000') {
        // Custom auto-generation if needed
        this.productCode = `ASE-PRD-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    }
    next();
});

// Indexes for performance
ProductSchema.index({ productName: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ quantity: 1 });

module.exports = mongoose.model('Product', ProductSchema);