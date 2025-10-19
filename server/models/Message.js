import mongoose  from "mongoose";

const messageSchema=new mongoose.Schema({
    sender_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref: 'User'},
    receiver_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref: 'User'},
    message:{type:String,required:true},
    sentAt:{type:Date,default:()=>new Date()}
})

const Message=mongoose.model("Message",messageSchema)
export default Message 