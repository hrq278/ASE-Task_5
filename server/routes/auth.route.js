// routes/auth.routes.js
import express from 'express';
import {
    register,
    login,
    logout,
    refreshToken,
    getMe
} from '../controllers/auth.controller.js';
import { 
    verifyTokenMiddleware 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', verifyTokenMiddleware, logout);
router.get('/me', verifyTokenMiddleware, getMe);

export default router;