const express = require('express');
const Joi = require('joi');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const UserModel = require("../models/User");
const createToken = require("../utils/createToken");
const protect = require('../middleware/protect');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(authLimiter);

const registerValidationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Valid email is required',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'string.empty': 'Password is required'
    }),
    firstName: Joi.string().min(2).trim().required().messages({
        'string.min': 'First name must be at least 2 characters',
        'string.empty': 'First name is required'
    }),
    lastName: Joi.string().min(2).trim().required().messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.empty': 'Last name is required'
    })
});

const loginValidationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Valid email is required',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});

router.post("/register", async (req, res)=>{
    const { email, password, firstName, lastName } = req.body;
    try{
        const { error } = registerValidationSchema.validate({ email, password, firstName, lastName });
        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser = await UserModel.create({ email, password, firstName, lastName });

        const userToken = createToken(newUser._id);

        res.status(201).json({
            message: "User registered successfully",
            token: userToken,
            data: { id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email }
        });
    }catch(err){
        console.log(err);
    }
});

router.post("/login", async (req, res)=>{
    const { email, password } = req.body;
    try{
        const { error } = loginValidationSchema.validate({ email, password });
        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const user = await UserModel.findOne({ email }).select('+password');

        if (!user || !(await user.checkPassword(password))) {
            return res.status(401).json({
                message: 'Incorrect email or password'
            });
        }

        const userToken = createToken(user._id);

        res.status(200).json({
            message: "Successfully logged in",
            token: userToken,
            data: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    }catch(err){
        console.log(err);
    }
});

router.get("/me", protect, async (req, res)=>{
    try{
        res.status(200).json({
            userId: req.user._id,
            email: req.user.email,
            name: req.user.firstName + " " + req.user.lastName
        });
    }catch(err){
        console.log(err);
    }
});

module.exports = router;