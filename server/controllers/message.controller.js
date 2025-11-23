import Message from "../models/Message.js"

export const getFrndMessages=async (req,res)=>{
    const {userId,friendId}=req.query
    try{
        const allmessages=await Message.find({$or:[{sender_id:userId,receiver_id:friendId},{sender_id:friendId,receiver_id:userId}]})
        res.status(200).json({message:"fetched message",allmessages})
    }catch(err){
        res.status(500)
    }
}

export const getMsgFrnds=async (req,res)=>{ 
    const {userId}=req.body
    try{
        const userFrnds=await User.findById(userId,{_id:0,friends:1}).populate("friends.friendId","profilePic")
        const trueFrnds=userFrnds.friends.filter(f=>f.status==='accepted')
        res.status(200).json({trueFrnds,message:"fetched friends"})
    }catch(err){
        res.status(500)
    }
}