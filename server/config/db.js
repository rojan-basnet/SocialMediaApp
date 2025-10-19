import mongoose from 'mongoose'

export const connectDb=()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log("mongoDb Connected"))
    .catch((err)=>console.error("error while connecting to DB",err))
}