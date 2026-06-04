const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const validateEnv = require("./config/validateEnv");
const morganMiddleware = require("./config/morgan");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./config/logger");
const corsOption = require("./config/cors")

const userRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");


// Validate environment variables before starting
validateEnv();

const app = express();

// Security headers
app.use(helmet());

// Request logging
app.use(morganMiddleware);

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS configuration
app.use(cors(corsOption));

// API routes
app.use("/auth", userRoutes);
app.use("/notes", notesRoutes);


app.get("/health" , (req, res)=>{
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })

})

// 404 handler for undefined routes
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});

// Global error handler
app.use(errorHandler);

module.exports = app;