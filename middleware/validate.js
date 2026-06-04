const { validationResult } = require('express-validator');

// Middleware to validate request using express-validator
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errorMessages;
        return next(error);
    }
    next();
};

module.exports = validate;