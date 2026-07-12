const express = require('express');
const Joi = require('joi');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const NotesModel = require("../models/Note");
const protect = require("../middleware/protect");

router.use(protect);

const notesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use(notesLimiter);

const idValidationSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
        'string.length': 'Invalid note ID format',
        'string.hex': 'Invalid note ID format'
    })
});

const createNoteValidationSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
        'string.empty': 'Title is required and must be under 200 characters',
        'string.min': 'Title is required and must be under 200 characters',
        'string.max': 'Title is required and must be under 200 characters'
    }),
    content: Joi.string().trim().min(1).required().messages({
        'string.empty': 'Content is required'
    }),
    status: Joi.boolean().optional().messages({
        'boolean.base': 'Status must be a boolean'
    })
});

const updateNoteValidationSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).optional().messages({
        'string.min': 'Title must be under 200 characters',
        'string.max': 'Title must be under 200 characters'
    }),
    content: Joi.string().trim().min(1).optional().messages({
        'string.min': 'Content cannot be empty'
    }),
    status: Joi.boolean().optional().messages({
        'boolean.base': 'Status must be a boolean'
    })
}).or('title', 'content', 'status');

router.get("/search", async (req, res)=>{
    const { q } = req.query;  //single search term

    try{
        const { error } = Joi.object({
            q: Joi.string().trim().optional()
            }).validate({ q });

        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const filter = { user: req.user._id };

        if ( q ) {
            filter.$or = [
                {title: {$regex : q , $options: 'i' }},
                {content: {$regex: q , $options: 'i'} }
            ];
        }

        const notes = await NotesModel.find(filter);

        res.status(200).json({ count: notes.length, data: notes });
    }catch(err){
        console.log(err);
    }
});

router.post("/", async (req, res)=>{
    const { title, content, status } = req.body;
    try{
        const { error } = createNoteValidationSchema.validate({ title, content, status });
        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

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
    }catch(err){
        console.log(err);
    }
});

router.delete("/:id", async (req, res)=>{
    const { id } = req.params;
    try{
        const { error } = idValidationSchema.validate({ id });
        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const deletedNote = await NotesModel.findOneAndDelete({
            _id: id,
            user: req.user._id
        });

        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found or not authorized to delete" });
        }

        res.status(200).json({ message: "Note deleted successfully" });
    }catch(err){
        console.log(err);
    }
});

router.get("/", async (req, res)=>{
    try{
        const notes = await NotesModel.find({ user: req.user._id }).sort({createdAt: -1});
        res.status(200).json({ count: notes.length, data: notes });
    }catch(err){
        console.log(err);
    }
});

router.get("/:id", async (req, res)=>{
    const { id } = req.params;
    try{
        const { error } = idValidationSchema.validate({ id });
        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const note = await NotesModel.findOne({
            _id: id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({ data: note });
    }catch(err){
        console.log(err);
    }
});

router.put("/:id", async (req, res)=>{
    const { id } = req.params;
    const { title, content, status } = req.body;
    try{
        const { error } = idValidationSchema.validate({ id });
        if(error){
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const { error: bodyError } = updateNoteValidationSchema.validate({ title, content, status });
        if(bodyError){
            return res.status(400).json({
                message: bodyError.details[0].message
            });
        }

        const note = await NotesModel.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { title, content, status },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ message: "Note not found or not authorized to update" });
        }

        res.status(200).json({
            message: "Note updated successfully",
            data: note
        });
    }catch(err){
        console.log(err);
    }
});

module.exports = router;