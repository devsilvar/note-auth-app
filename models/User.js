const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs');


const UserSchema = new mongoose.Schema({
firstName:{
    type:String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
},
lastName:{
    type:String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
},
email:{
    type:String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already exists'],
    trim: true,
    lowercase: true,
     match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
password:{
    type:String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
},
isActive:{
    type:Boolean,
    required: [true, 'Status is required'],
    default:true, 
}
},{
    timestamps:true,
    collection:"Users"
})


// so the password will be re hashed in the cause of any form of chnage ege hnaging password etc
UserSchema.pre('save' , async function(next){
    // if the password chnaged or is modified 
    if(!this.isModified('password')) return next();
    //hash th epassword with a cost factor 12
    this.password = await bcrypt.hash(this.password , 12)   
    
})

/// function to check if the plain password mathces the hased one
UserSchema.methods.checkPassword = async function(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
}


const UserModel = mongoose.model("User" , UserSchema)

module.exports = UserModel;