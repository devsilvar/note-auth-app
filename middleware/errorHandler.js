// middleware/errorHandler.js

const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message    = err.message    || 'Something went wrong';

  // always log the error
  // errors 500 and above are logged as error — everything else as warn
  if (err.statusCode >= 500) {
    logger.error({
      message:    err.message,
      stack:      err.stack,
      method:     req.method,
      url:        req.originalUrl,
      ip:         req.ip,
      statusCode: err.statusCode
    });
  } else {
    logger.warn({
      message:    err.message,
      method:     req.method,
      url:        req.originalUrl,
      statusCode: err.statusCode
    });
  }


  // ── MONGOOSE VALIDATION ERROR ─────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status:     'error',
      statusCode: 400,
      message:    'Validation failed',
      errors:     messages
    });
  }


  // ── DUPLICATE KEY ERROR ───────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status:     'error',
      statusCode: 400,
      message:    `${field} already exists`
    });
  }


  // ── INVALID OBJECTID ──────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      status:     'error',
      statusCode: 400,
      message:    'Invalid ID format'
    });
  }


  // ── JWT ERRORS ────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status:     'error',
      statusCode: 401,
      message:    'Invalid token. Please log in again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status:     'error',
      statusCode: 401,
      message:    'Your session has expired. Please log in again.'
    });
  }


  // ── DEVELOPMENT — show full error details ─────────────
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status:     'error',
      statusCode: err.statusCode,
      message:    err.message,
      stack:      err.stack,  // show stack trace in development only
      error:      err
    });
  }


  // ── PRODUCTION — hide sensitive details ───────────────
  // operational errors — safe to show the message
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status:     'error',
      statusCode: err.statusCode,
      message:    err.message
    });
  }

  // programming errors — hide details, show generic message
  // the real error is already logged above
  return res.status(500).json({
    status:     'error',
    statusCode: 500,
    message:    'Something went wrong. Please try again later.'
  });
};

module.exports = errorHandler;