const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for faster user-based queries
    },
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        minlength: [1, 'Title cannot be empty'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        maxlength: [5000, 'Content is too long']
    },
    status: {
        type: Boolean,
        default: false // false = incomplete, true = complete
    }
}, {
    timestamps: true,
    collection: "NoteTaking"
});

// Compound index for user-based note queries
NoteSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Note", NoteSchema);