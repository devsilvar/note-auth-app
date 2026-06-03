const jwt = require('jsonwebtoken')
const UserModel = require("../models/User")


const protect = async(req, res, next)=>{

    //check if  a token was sent 
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        //get the token from mthe spacing after the Bearer token...
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return res.status(401).json({
            message:"Not authorized to access this route",
            success:false
        })
    }

    //let verify that the token is valid and or not expired
    let decoded;
    try{
          decoded = jwt.verify(token , process.env.JWT_SECRET)
    }catch(err){
        const error = new Error('Invalid or expired token. Please log in again.');
        error.statusCode = 401;
        return next(error);
    }

    console.log(decoded)
    //verify that the user exisists
    //CHECK THT AT THE USER ASSOCIATED WITH THAT TOKEN STILL EXIIST OR NOT

    const user = await UserModel.findById(decoded.userId)

     if (!user) {
    const error = new Error('The user belonging to this token no longer exists.');
    error.statusCode = 401;
    return next(error);


  }

  // now attache the user to every request
  
  
req.user = user
next();
}
module.exports = protect