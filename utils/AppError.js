// Custom error class for operational errors
// These are expected errors that can be safely sent to clients (e.g., validation errors)
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Used by errorHandler to determine if safe to show

        // Capture stack trace excluding constructor
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = AppError;