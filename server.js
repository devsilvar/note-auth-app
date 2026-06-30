require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const app = require('./app.js');

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION - shutting down gracefully');
    logger.error({
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION - shutting down gracefully');
    logger.error({
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    process.exit(1);
});

// Start server
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
        });

        // Graceful shutdown handler
        const gracefulShutdown = (signal) => {
            logger.info(`${signal} received - shutting down gracefully`);

            server.close(async () => {
                logger.info('HTTP server closed');
                try {
                    await mongoose.connection.close();
                    logger.info('Database connection closed');
                    process.exit(0);
                } catch (err) {
                    logger.error('Error closing database:', err.message);
                    process.exit(1);
                }
            });

            // Force shutdown after timeout
            setTimeout(() => {
                logger.error('Force shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (err) {
        logger.error('Failed to start server:', err.message);
        process.exit(1);
    }
};


startServer();











