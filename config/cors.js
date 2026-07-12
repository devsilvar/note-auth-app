const allowedOrigins = [
    "http://localhost:5173",
    "https://notelynew.netlify.app",
     process.env.FRONTEND_URL,
].filter(Boolean)

const corsOption = {
    origin:function(origin , callback){

        if(!origin) return callback(null , true)

        if(allowedOrigins.includes(origin)){
            return callback(null , true)
        }else{
            return callback(new Error("Not allowed by CORS"))
        }    

    },
};



module.exports = corsOption;