const express = require('express')
const router = express.Router()
const jwt = require("jsonwebtoken")
const UserModel = require("../models/User")
const createToken = require("../utils/createToken")
const protect = require('../middleware/protect')



//helper function to create a signed jwt for a user
// each user need to have a signed jwt so they can use it as a token for request after they login etc




router.post("/register" , async(req, res , next)=>{
    try{
        const {email, password , firstName , lastName} = req.body

        if( !password || !email || !firstName || !lastName){
            const error = new Error("all fields are required")
            error.statusCode = 404;
            return next(error)
        }
        const existingUser = await UserModel.findOne({email})

        if(existingUser){
            const error = new Error("User already exists")
            error.statusCode = 409;
            
            res.status(409).json({error: error.message})
        }

         //create a new user with teh json in teh body coing from the request
        const newUser = await UserModel.create({email, password, firstName, lastName})

         
        //create a token for the new user
        const newUserToken = createToken(newUser._id)

        //return the token along with teh data
        res.status(200).json({
            message:"User registered successfully",
            newUserToken,
            data:{id:newUser._id,  firstName:newUser.firstName , lastName:newUser.lastName , email:newUser.email}
        })
    }catch(err){
         res.status(500).json({sucess:false, error: err.message})
        next(err)
    }
})



//login a user
router.post("/login", async (req, res, next) => {
    try{
        const {email , password} = req.body

        if(!email || !password){
            const error =  new Error("Email and password are required")
            error.statusCode = 404
            return next(error)
        }
     
        //find the user based on condition i.e teh email sicne itis unique
        const user = await UserModel.findOne({email: req.body.email})

        if(!user || !(await user.checkPassword(password))){
             const error = new Error('Incorrect email or password');
           error.statusCode = 401;
            return next(error);
        }

         //create a signed token since the user is logging in 
         const userToken = createToken(user._id)

         res.status(200).json({
            message:"sucessfully logged in",
            userToken,
            data:{id:user._id,  firstName:user.firstName , lastName:user.lastName , email:user.email}
         })


    }catch(err){
      res.status(400).json({sucess:false, error: err.message})
    }

})




router.get("/me" ,protect, async(req, res, next)=>{

    return res.status(200).json({
      userId: req.user._id,
      email: req.user.email,
      name : req.user.firstName + " " + req.user.lastName
    })
})
module.exports = router;

