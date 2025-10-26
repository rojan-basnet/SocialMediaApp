import mongoose from "mongoose";

const notifiSubSchema=new mongoose.Schema({
    subsId:{type:String ,required:true},
    subscription:{      
        endpoint: { type: String, required: true },
        expirationTime: { type: Date, default: null },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
      },
    }
})
export const NotifiSub=mongoose.model("NotifiSubs",notifiSubSchema)