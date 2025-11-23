import mongoose  from "mongoose";

const reactsSchemaMsg=new mongoose.Schema({
    reacterId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required: true},
    reactEmoji:{type:String,enum:["👍", "❤️", "😂", "😢", "😡", "🔥"]},
}) 
const messageSchema=new mongoose.Schema({
    sender_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref: 'User'},
    receiver_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref: 'User'},
    reacts:[reactsSchemaMsg],
    message:{type:String,required:true},
    sentAt:{type:Date,default:()=>new Date()} 
})

const Message=mongoose.model("Message",messageSchema) 
export default Message 