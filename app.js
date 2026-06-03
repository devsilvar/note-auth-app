const cors = require('cors')
const express = require('express')
const mongoose = require("mongoose")

const app = express()
const helmet = require('helmet')
const validateEnv =  require("./config/validateEnv")
const morganMiddleware = require("./config/morgan")
const errorHandler = require("./middleware/errorHandler")
const logger = require("./config/logger")

const userRoutes = require("./routes/auth")
const notesRoutes = require("./routes/notes")


const allowedOrigins= [
    "http://localhost:5173",
    "http://www.frontedn.com"
]


validateEnv()
app.use(helmet())
app.use(morganMiddleware)
app.use(express.json())
app.use(cors({
     origin:function(origin, callback){
        //potsman , insomnia
        if(!origin) return callback(null , true)

        if(allowedOrigins.includes(origin)){
            return callback(null , true)
        }else{
            return callback(new Error(`${origin} Not allowed by CORS`))
        }    
     }
}))
app.use(express.urlencoded({extended:true , limit:'20kb'}))
// ── HEALTH CHECK ───────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1
    ? 'connected'
    : 'disconnected';

  const health = {
    status:      dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp:   new Date().toISOString(),
    uptime:      `${Math.floor(process.uptime())} seconds`,
    environment: process.env.NODE_ENV,
    database:    dbStatus,
    memory: {
      used:  `${Math.round(process.memoryUsage().heapUsed  / 1024 / 1024)} MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
    }
  };

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

app.use("/auth" , userRoutes)
app.use("/notes" , notesRoutes)


app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message    = err.message    || 'Something went wrong';

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      status: 'error', statusCode: 400,
      message: 'Validation failed', errors: messages
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    logger.error(err)
    return res.status(400).json({
      status: 'error', statusCode: 400,
      message: `${field} already exists`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error', statusCode: 400,
      message: 'Invalid ID format'
    });
  }

  res.status(err.statusCode).json({
    status:     'error',
    statusCode: err.statusCode,
    message:    err.message
  });
});


module.exports = app


