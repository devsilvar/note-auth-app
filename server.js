require('dotenv').config()
const connectDB = require('./config/db')
const logger = require('./config/logger')
const app = require('./app.js')
const PORT = process.env.PORT || 5000



//uncaoght expression---
process.on('uncaughtException' , (err)=>{
    logger.error('UNCAUGHT EXCEPTION - shutting down')
    logger.error({
        name:err.name,
        message:err.message,
        stack:err.stack
    })
    process.exit(1)
})

process.on('unhandledRejection' , (err)=>{
    logger.error('UNHANDLED REJECTION - shutting down')
     logger.error({
         name:err.name,
        message:err.message,
        stack:err.stack
    })
    server.close(()=>{
        process.exit(1)
    })
})

//start server
const startServer = async() =>{
    try{
      await connectDB();
      const server = app.listen(process.env.PORT, ()=>{
       logger.info(`Server running in ${process.NODE_ENV} at  ${PORT}`)     
      })

    //graceful shutdwon
    const gracefulShutdown = (signal) =>{
    logger.info(`${signal} received - shutting down gracefully`)

    server.close(async()=>{
        logger.info('HTTP server closed')
        try{
          await mongoose.connection.close()
          logger.info(`Database connection closed`)
          process.exit(0)      
        }catch(err){
            logger.error('Error closing database')
            process.exit(1)
        }
    })

    setTimeOut(()=>{
        logger.error('force the shutdown')
        process.exit(1)
      },15000)
    } 

    process.on('SIGTERM' , ()=> gracefulShutdown('SIGTERM'))
    process.on('SIGINT' , ()=> gracefulShutdown('SIGINT'))

    }catch(err){
        logger.error("Failed to start server" , err.message)
        process.exit(1)
    }
}
startServer()

app.listen(PORT, ()=>{
    logger.info(`Server running at : ${PORT}`)
})












