// models/Supplier.model.js
import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
    supplierCode: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
        default: function() {
            return `ASE-SUP-${String(this._id).slice(-4).toUpperCase()}`;
        }
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    contactPerson: {
        type: String,
        required: [true, 'Contact person is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
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
    taxId: {
        type: String,
        trim: true
    },
    paymentTerms: {
        type: String,
        enum: ['Net 15', 'Net 30', 'Net 60', 'COD', 'Prepaid'],
        default: 'Net 30'
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be below 0'],
        max: [5, 'Rating cannot exceed 5'],
        default: 3
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
SupplierSchema.index(true);

const Supplier = mongoose.model('Supplier', SupplierSchema);

export default Supplier;