import mongoose from "mongoose";


const UserSchema= mongoose.Schema({
   username: {
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,

    },
    name:{
        type:String
    },
blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})


export const User= mongoose.model('User', UserSchema)