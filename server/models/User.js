import mongoose from "mongoose";
import { friendSchema } from "./Friends.js";

const userSchema=new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic:{type:String,default:null},
  friends: [friendSchema] ,
  profession:{type:String},
  bio:{type:String},
  hobbies:{type:String}

})

export const User=mongoose.model('User',userSchema)