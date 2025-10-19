
import mongoose from "mongoose";
const reactsSchema=new mongoose.Schema({
    reacterId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required: true},
    reactEmoji:{type:String,enum:["👍", "❤️", "😂", "😢", "😡", "🔥"],default:"👍"},
})
const commentSchema= new mongoose.Schema({
    commenterId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
    comment:{type:String,required:true}
})
const postSchema=new mongoose.Schema({
    uploaderName:{type:String,required:true},
    uploaderId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User" },
    title:{type:String},
    images:[{type:String}],
    postedAt:{type:Date,default:()=>new Date()},
    reacts:[reactsSchema],
    comments:[commentSchema]
})

export const Post=mongoose.model("Post",postSchema)