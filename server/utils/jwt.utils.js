// utils/jwt.utils.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate Access Token (short expiry)
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(
        { 
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );
};

/**
 * Generate Refresh Token (longer expiry)
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(
        { 
            userId: payload.userId,
            email: payload.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Decode Token without verification
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};

/**
 * Generate both tokens
 */
export const generateTokens = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
};