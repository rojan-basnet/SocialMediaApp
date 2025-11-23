import { User } from "../models/User.js"
import { NotifiSub } from "../models/NotifiSubscribe.js"
import webpush from "web-push";

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.NOTI_PUBLIC_KEYS,
  process.env.NOTI_PRIVATE_KEYS
);


export const sendNotifi=async (req, res) => {
    const {toSend,message,userId}=req.body
    try{
        const subscribers= await NotifiSub.find({subsId:toSend})
        const notiSender= await User.findById(userId,{_id:0,profilePic:1,name:1})

        if(subscribers && notiSender){
            const payload = JSON.stringify({title: notiSender.name,body: message,icon:notiSender.profilePic|| `${process.env.FRONTEND}/default_pp.jpg`});
            subscribers.forEach(async (subscriber)=>{
                await webpush.sendNotification(subscriber.subscription, payload)
            })
            res.status(200).json({message:"message sent",payload})

        }else{
            console.log("User is not subscirbed")
            res.status(200).json({data:"not subscribed"})
        }

    }catch(err){
        console.log(err)
        res.status(500).json({message:"server error"})
    }

}

export const subscribeToNoti=async (req,res)=>{
    const {subscription,userId}=req.body

    if(subscription && userId){
    try{
        const alreadyExists=await NotifiSub.find({subsId:userId})
        if(alreadyExists.length==0){
            const newNotiSub=new  NotifiSub({subsId:userId,subscription})
            await newNotiSub.save()
            return res.status(200).json({message:"Subscribed to Notifications"})
        }else {
            const same=alreadyExists.some((ele)=>{
                return ele.subscription.endpoint==subscription.endpoint
            })
            if(!same){
                const newNotiSub=new  NotifiSub({subsId:userId,subscription})
                await newNotiSub.save()
                return res.status(200).json({message:"newly subscribed"})
            }
            return res.status(200).json({message:"already subscribed"})
        }
    }catch(err){
        console.log(err)
        res.status(500)
    }
    }
    return res.status(400)

}