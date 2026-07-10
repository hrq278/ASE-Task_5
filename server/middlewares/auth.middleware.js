// middleware/auth.middleware.js
import { verifyToken } from '../utils/jwt.utils.js';
import User from '../models/User.model.js';

/**
 * Verify JWT Token Middleware
 * Reads Authorization header, verifies JWT, attaches req.user
 */
export const verifyTokenMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided or invalid format. Use: Bearer <token>'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Check if user exists
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Invalid token.'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact admin.'
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: `Authentication error: ${error.message}`
        });
    }
};

/**
 * Role-based Access Control Middleware
 * @param {...string} allowedRoles - Array of roles that are allowed
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role;
            
            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`,
                    requiredRoles: allowedRoles,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Authorization error: ${error.message}`
            });
        }
    };
};

/**
 * Optional: Check if user has at least one of the allowed roles
 */
export const requireAnyRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role;
            
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your role (${userRole}) does not have permission.`,
                    requiredRoles: allowedRoles
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Authorization error: ${error.message}`
            });
        }
    };
};