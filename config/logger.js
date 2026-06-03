// config/logger.js

const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;


// custom format for development — readable and colorful
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `${timestamp} [${level}]: ${message}\n${stack}`
      : `${timestamp} [${level}]: ${message}`;
  })
);


// format for production — JSON for log services to parse
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);


const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',

  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,

  transports: [
    // always log to console
    new winston.transports.Console(),

    // in production — also write to files
    ...(process.env.NODE_ENV === 'production'
      ? [
          // info and above → combined.log
          new winston.transports.File({
            filename: 'logs/combined.log',
            level:    'info'
          }),

          // errors only → error.log
          new winston.transports.File({
            filename: 'logs/error.log',
            level:    'error'
          })
        ]
      : []
    )
  ]
});

module.exports = logger;