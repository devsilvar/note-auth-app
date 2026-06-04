const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const NotesModel = require("../models/Note");
const protect = require("../middleware/protect");
const validate = require('../middleware/validate');

// Apply authentication middleware first, then rate limiting
router.use(protect);

// Rate limiting for notes endpoints
const notesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(notesLimiter);

// Validation rules for creating a note
const createNoteValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Title is required and must be under 200 characters'),
    body('content')
        .trim()
        .isLength({ min: 1 }).withMessage('Content is required'),
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be a boolean'),
];

// Validation rules for updating a note
const updateNoteValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Title must be under 200 characters'),
    body('content')
        .optional()
        .trim()
        .isLength({ min: 1 }).withMessage('Content cannot be empty'),
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be a boolean'),
];

// Validation for MongoDB ID
const idValidation = [
    param('id').isMongoId().withMessage('Invalid note ID format'),
];

// Search notes by title or content
router.get("/search", [
    query('title').optional().trim(),
    query('content').optional().trim(),
], validate, async (req, res, next) => {
    const filter = { user: req.user._id };

    if (req.query.title) {
        filter.title = new RegExp(req.query.title, "i");
    }
    if (req.query.content) {
        filter.content = new RegExp(req.query.content, "i");
    }

    const notes = await NotesModel.find(filter);

    res.status(200).json({ count: notes.length, data: notes });
});


// Create a new note
router.post("/", createNoteValidation, validate, async (req, res, next) => {
    const { title, content, status } = req.body;

    const note = await NotesModel.create({
        title,
        content,
        status,
        user: req.user._id
    });

    res.status(201).json({
        message: "Note created successfully",
        data: note
    });
});


// Delete a note (only by the authenticated user)
router.delete("/:id", idValidation, validate, async (req, res, next) => {
    const deletedNote = await NotesModel.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
    });

    if (!deletedNote) {
        const error = new Error('Note not found or not authorized to delete');
        error.statusCode = 404;
        return next(error);
    }

    res.status(200).json({ message: "Note deleted successfully" });
});


// Get all notes for the authenticated user
router.get("/", async (req, res, next) => {
    const notes = await NotesModel.find({ user: req.user._id });

    res.status(200).json({ count: notes.length, data: notes });
});


// Get a single note by ID
router.get("/:id", idValidation, validate, async (req, res, next) => {
    const note = await NotesModel.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!note) {
        const error = new Error('Note not found');
        error.statusCode = 404;
        return next(error);
    }

    res.status(200).json({ data: note });
});


// Update a note (only by the authenticated user)
router.put("/:id", idValidation, updateNoteValidation, validate, async (req, res, next) => {
    const note = await NotesModel.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!note) {
        const error = new Error('Note not found or not authorized to update');
        error.statusCode = 404;
        return next(error);
    }

    res.status(200).json({
        message: "Note updated successfully",
        data: note
    });
});

module.exports = router;