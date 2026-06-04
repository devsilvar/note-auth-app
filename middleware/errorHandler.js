const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    // Set default values
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Something went wrong';

    // Log error with context
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        statusCode: err.statusCode,
        user: req.user?._id
    });

    // Validation error from express-validator
    if (err.errors && Array.isArray(err.errors)) {
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation failed',
            errors: err.errors
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation failed',
            errors: messages
        });
    }

    // Duplicate key error (MongoDB)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: `${field} already exists`
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Invalid ID format'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'Invalid token. Please log in again.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'Your session has expired. Please log in again.'
        });
    }

    // CORS error
    if (err.message.includes('Not allowed by CORS')) {
        return res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Access denied by CORS policy'
        });
    }

    // Operational errors — safe to show message
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            statusCode: err.statusCode,
            message: err.message
        });
    }

    // Production — hide error details
    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Something went wrong. Please try again later.'
        });
    }

    // Development — show full error details
    return res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
        stack: err.stack,
        error: err
    });
};

module.exports = errorHandler;