const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const UserModel = require("../models/User");
const createToken = require("../utils/createToken");
const protect = require('../middleware/protect');
const validate = require('../middleware/validate');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(authLimiter);

// Validation rules for user registration
const registerValidation = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName')
        .trim()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
];

// Validation rules for login
const loginValidation = [
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .exists().withMessage('Password is required'),
];

// Register a new user
router.post("/register", registerValidation, validate, async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        return next(error);
    }

    // Create a new user with the data from the request body
    const newUser = await UserModel.create({ email, password, firstName, lastName });

    // Generate a JWT token for the new user
    const userToken = createToken(newUser._id);

    res.status(201).json({
        message: "User registered successfully",
        token: userToken,
        data: { id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email }
    });
});


// Login a user
router.post("/login", loginValidation, validate, async (req, res, next) => {
    const { email, password } = req.body;

    // Find the user by email (unique field)
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password))) {
        const error = new Error('Incorrect email or password');
        error.statusCode = 401;
        return next(error);
    }

    // Generate a signed JWT token
    const userToken = createToken(user._id);

    res.status(200).json({
        message: "Successfully logged in",
        token: userToken,
        data: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    });
});


// Get current user profile (protected route)
router.get("/me", protect, async (req, res, next) => {
    res.status(200).json({
        userId: req.user._id,
        email: req.user.email,
        name: req.user.firstName + " " + req.user.lastName
    });
});

module.exports = router;