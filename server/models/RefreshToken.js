import mongoose  from "mongoose";

const refreshTokenSchema=new mongoose.Schema({
    rToken:{type:String,required:true}
})

export const RefreshTokenM=mongoose.model("R_Token",refreshTokenSchema)