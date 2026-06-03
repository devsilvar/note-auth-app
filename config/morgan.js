// config/morgan.js

const morgan = require('morgan');
const logger = require('./logger');

// create a stream that writes morgan output to winston
const stream = {
  write: (message) => logger.http(message.trim())
};

// skip logging in test environment
const skip = () => process.env.NODE_ENV === 'test';

const morganMiddleware = morgan(
  // log format
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;