const express = require('express')
const router = express.Router();
const NotesModel = require("../models/Note")
const UserModel = require("../models/User")
const protect = require("../middleware/protect")





router.use(protect)
router.get("/search", async (req, res, next) => {
  try {
    const filter = {
      user: req.user._id,
    };

    // search by title if provided
    if (req.query.title) {
      filter.title = new RegExp(req.query.title, "i");
    }
    if(req.query.content){
        filter.content =  new RegExp(req.query.content, "i")
    }

    const notes = await NotesModel.find(filter);

    res.status(200).json({
      count: notes.length,
      data: notes,
    });
    
  } catch (err) {
    return next(err);
  }
});


//crete note
router.post("/"  , async(req, res, next) =>{
    try{
      const {title , content, status} = req.body
      console.log(title , content , status)

      if(!title || !content ){
        const error = new Error("Title , status and content are required")
        error.statusCode = 400
        return next(error)
      }
        const note = await NotesModel.create({title:title , content:content , status:status , user:req.user._id})
        return res.status(201).json({message:"sucessfully created" ,data: note})
    }catch(err){
        console.log(err)
        return next(err)
    }
})


//delete a note  // but only the authticated user can delete
router.delete("/:id"  , async(req, res , next)=>{
    try{
        const deletedNote = await NotesModel.findOneAndDelete({_id:req.params.id, user:req.user._id})
       if(!deletedNote){
           const error = new Error('Cannot find Note to Delete')
           error.statusCode = 404
           return next(error)
       }
       res.status(200).json({
        message:"sucessfully deleted Note"
       })
    }catch(err){
        res.status(400).json({
            error:err.message
        })
    }
})

//get all notes of a user
router.get("/", async (req, res, next) => {
    try{  
        const notes = await NotesModel.find({ user: req.user._id })
        if(notes.length == 0){
            const error = new Error('No notes found for this user')
            error.statusCode = 404
            return next(error)
        }
        res.status(200).json({count: notes.length, data: notes })
    }catch(err){
        next(err)
    }
})



//get a single note for a user
router.get("/:id", async (req, res, next) => {
    try {
        const note = await NotesModel.findOne({_id:req.params.id , user:req.user._id})
        if (!note) {
            const error = new Error('Note not found')
            error.statusCode = 404
            return next(error)
        }
        res.status(200).json({ data: note })
    } catch (err) {
        next(err)
    }
})



//edit a note from a user
router.put("/:id", async(req, res, next)=>{
    try{
        const note = await NotesModel.findOneAndUpdate(
            {_id:req.params.id , user:req.user._id},
            req.body,
            { new: true , runValidators:true }
        )
        if (!note) {
            const error = new Error('Note not found')
            error.statusCode = 404
            return next(error)
        }
        res.status(200).json({ data: note })
    }catch(err){
        return next(err)
    }})


//searchthrough notes bsed on the user own title
// router.get("/search", async(req, res,next)=>{
//     try{
//         const filter = {
//             user:req.user._id
//         }
//         // if the user sends something like a titke in teh request body then inject the title inside filter

//         // filter.title now equals a regex that check tehtitkle for any occurence of wht ////you type in teh title

//         if(req.body.title) {
//             filter.title = new RegExp(req.query.title, 'i') // case-insensitive search
//         }
        
//         const notes = await NotesModel.findOne(filter)
//         res.status(200).json({count: notes.length, data: notes })
    
//     }catch(err){
//         return next(err)
//     }
// })



module.exports = router




