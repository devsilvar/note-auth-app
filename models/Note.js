const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  title:{
    type:String,
    required:true,
    trim:true
  },
  content:{
    type:String,
    required:true,
     maxlength: [5000, 'Content is too long']

  },
  status:{
    type:Boolean,
    required:true,
    default:false
  },
},{
    timestamps:true,
    collection:"NoteTaking"
})

// //index to fetch all notes belnging to a user quickl
// NoteSchema.index({user: 1})

const NoteModel = mongoose.model("Note" , NoteSchema)
module.exports = NoteModel;