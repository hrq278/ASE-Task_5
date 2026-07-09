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
    }
});

const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        uppercase: true,
        default: function() {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
            return `ORD-${year}${month}${day}-${random}`;
        }
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
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
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
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate total amount
OrderSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
    next();
});

// Method to update inventory after order placement
OrderSchema.methods.updateInventory = async function() {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw new Error(`Product ${item.productName} not found`);
        }
        
        if (product.quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.productName}. Available: ${product.quantity}`);
        }
        
        product.quantity -= item.quantity;
        await product.save();
    }
};

// Method to cancel order and restore inventory
OrderSchema.methods.cancelOrder = async function() {
    if (this.status === 'cancelled') {
        throw new Error('Order is already cancelled');
    }
    
    if (this.status === 'delivered') {
        throw new Error('Cannot cancel a delivered order');
    }
    
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (product) {
            product.quantity += item.quantity;
            await product.save();
        }
    }
    
    this.status = 'cancelled';
    await this.save();
};

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });

module.exports = mongoose.model('Order', OrderSchema);