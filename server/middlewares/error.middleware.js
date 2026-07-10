// middleware/error.middleware.js
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists. Please use a different value.`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired. Please login again.';
    }

    console.error(`❌ Error: ${statusCode} - ${message}`, err);

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err
        })
    });
};

// 404 Not Found Handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};