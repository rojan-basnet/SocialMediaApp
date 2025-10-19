import mongoose from "mongoose";

export const friendSchema=new mongoose.Schema({
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  frndName:{type:String,required:true},
  status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
  requestType:{type:String,enum:['sent','received']}
})