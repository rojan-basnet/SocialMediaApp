import { User } from "../models/User.js"
export const sendfrndReq=async (req,res)=>{
    const {userId,frnId,name}=req.body

    try{
        const sender=await User.findByIdAndUpdate(userId,{$push:{friends:{friendId: frnId, status: "pending",requestType:"sent",frndName:name}}},{new:true})
        const receiver=await User.findByIdAndUpdate(frnId,{$push:{friends:{friendId: userId, status: "pending",requestType:"received",frndName:sender.name}}},{new:true})

        res.status(200).json({message:"request sent",to:receiver.name})
    }catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const acptFrndsReq=async (req,res)=>{
    const {userId,friendId}=req.body

    try{
        const receiverAccept=await User.updateOne(
            {_id:userId,"friends.friendId":friendId},
            {$set:{ "friends.$.status": "accepted" }})

        const senderAccept=await User.updateOne(
            {_id:friendId,"friends.friendId":userId},
            {$set:{"friends.$.status":"accepted"}}
        )

        res.status(200).json({message:"Request Accepted"})

    }catch(err){
        res.status(500).json({message:"server error"})
    }
}

export const delFrndReq=async (req,res)=>{
    const {userId,friendId}=req.body
    try{
        const receiverDel=await User.updateOne({_id:userId},{$pull:{friends:{friendId:friendId}}})
        const senderDel=await User.updateOne({_id:friendId},{$pull:{friends:{friendId:userId}}})

        res.status(200).json({message:"Canceled Request"})
    }catch(err){
        res.status(500).json({message:"server error"})
    }
}