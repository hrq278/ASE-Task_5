// routes/product.routes.js (Example)
import express from 'express';
import { 
    verifyTokenMiddleware, 
    requireRole 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

// Example: Admin-only route (User Management)
router.get('/admin/users', 
    verifyTokenMiddleware, 
    requireRole('admin'), 
    (req, res) => {
        res.json({ 
            success: true, 
            message: 'Admin-only route accessed',
            user: req.user 
        });
    }
);

// Example: Manager+Admin route (Product Management)
router.post('/products', 
    verifyTokenMiddleware, 
    requireRole('admin', 'manager'), 
    (req, res) => {
        res.json({ 
            success: true, 
            message: 'Product created by manager/admin',
            user: req.user 
        });
    }
);

// Example: Employee route (Orders - read-mostly)
router.get('/orders', 
    verifyTokenMiddleware, 
    requireRole('admin', 'manager', 'employee'), 
    (req, res) => {
        res.json({ 
            success: true, 
            message: 'Orders accessed by employee',
            user: req.user 
        });
    }
);

export default router;