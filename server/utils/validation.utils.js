// utils/validation.utils.js
export const validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    return password && password.length >= 6;
};

export const validateRequiredFields = (data, fields) => {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
        return {
            isValid: false,
            missingFields: missing,
            message: `Missing required fields: ${missing.join(', ')}`
        };
    }
    return { isValid: true };
};

export const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    const { password, refreshToken, __v, ...sanitized } = userObj;
    return sanitized;
};