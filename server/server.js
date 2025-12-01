import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDb } from './config/db.js'
import { Server } from 'socket.io'
import { User } from './models/User.js'
import cookieParser from 'cookie-parser'
import jwtVerfiy from './middleware/verifyJWT.js'
import Message from './models/Message.js'
import path from 'path'
import { Post } from './models/Posts.js'
import authRouter from './routes/auth.route.js'
import reqRouter from './routes/frndReqRoute.js'
import notifiRouter from './routes/notification.route.js'
import messageRouter from './routes/messages.route.js'

const __dirname=path.resolve()
dotenv.config();

const PORT=process.env.PORT|| 5000
const app=express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())




app.use('/',authRouter)
app.use('/',reqRouter)
app.use('/',notifiRouter)
app.use('/',messageRouter)

app.post('/allUsers',jwtVerfiy, async (req,res)=>{
    const id=req.body.userId
    
    try{
        const allUsers=await User.find({_id:{$ne:id},friends:{$not:{$elemMatch:{friendId:id}}}}, { _id: 1, name: 1 ,profilePic:1})
        res.status(200).json({success:true,message:"Users Found",allUsers})
    }catch(err){
        res.status(500).json({success:false,message:"Server Error"})
    }
})

app.get("/searchUsers",jwtVerfiy,async (req,res)=>{
    const {id}=req.query
    try{
        const allUser=await User.find({_id:{$ne:id}}, { _id: 1, name: 1 ,profilePic:1})
        res.status(200).json({allUser})
    }catch(err){
        res.status(500)
    }
})

app.post('/friends',jwtVerfiy, async (req,res)=>{
    const userId=req.body.userId

    try{
        const friends=await User.findById(userId,{friends:1}).populate("friends.friendId","profilePic")
        res.status(200).json({friends:friends.friends,message:"fetched friends data"})
    }catch(err){
        res.status(500).json({message:"server error",data:"while fetching friends"})
    }
})





app.post('/uploadPost',jwtVerfiy,async(req,res)=>{
    const {id,username}=req.user
    const {title,video,images}=req.body.newPost
    console.log(req.body)

    try{
        const newPost=new Post({uploaderName:username,uploaderId:id,title:title,images:images,video:video})
        const post=await newPost.save()
        res.status(200).json({message:"Posted",post})
    }catch(err){
        console.log(err)
        res.status(500)
    }
})

app.get('/fetchPosts',jwtVerfiy,async (req,res)=>{ 
    const {id}=req.user
    try{
        const posts=await Post.find().populate("uploaderId","profilePic name")
        res.status(200).json({posts})
    }catch(err){
        res.status(500)
    }
})
app.post('/postLike',jwtVerfiy,async (req,res)=>{
    const {userId,postId}=req.body
    try{
        const post=await Post.findById(postId)

        const alreadyLike=post.reacts.find(r=>r.reacterId.toString()===userId)
        
            if(alreadyLike){
                await Post.updateOne({_id:postId},{$pull:{reacts:{reacterId:userId}}})
                res.status(200).json({message:"like removed"})

            }else{
                await Post.updateOne({_id:postId},{$push:{reacts:{reacterId:userId,reactEmoji:"👍"}}})
                res.status(200).json({message:"liked"})

            }
        
    }catch(err){
        console.log(err)
        res.status(500)
    }
})

app.post('/postComment',jwtVerfiy,async (req,res)=>{
    const {userId,postID,comment}=req.body
    if(!userId || !postID|| !comment) return res.status(400)
    try{
        const newComment=await Post.findByIdAndUpdate(postID,{$push:{comments:{commenterId:userId,comment:comment}}})
        res.status(200).json({newComment})
    }catch(err){
        console.log(err)
        res.status(500)
    }
    
})
app.post('/getComments',jwtVerfiy,async (req,res)=>{
    const {postid}=req.body
    try{
        const post=await Post.findById(postid,{_id:0,comments:1}).populate("comments.commenterId","name profilePic _id")
        res.status(200).json({post})
    }catch(err){
        res.status(500)
    }
})
app.get('/getUserData',jwtVerfiy,async (req,res)=>{
    const {userId}=req.query
    try{
        const user=await User.findById(userId)
        res.status(200).json({user})
    }catch(err){
        console.log(err)
        res.status(500)
    }
})
app.post('/getUserPost',jwtVerfiy,async (req,res)=>{
    const {postFrom}=req.body
    try{
        const posts=await Post.find({uploaderId:postFrom}).populate("uploaderId","name").sort({_id:-1})
        res.status(200).json({posts})
    }catch(err){
        console.log(err)
        res.status(500)
    }
})

app.post('/profilePicSetUp',jwtVerfiy,async (req,res)=>{
    const {userId,ppURL}=req.body

    try{
        const updatedUser=await User.findByIdAndUpdate(userId,{profilePic:ppURL},{new:true})
        res.status(200).json({updatedUser})
    }catch(err){
        console.log(err)
        res.status(500)
    }
})

app.post('/getOtherUserData',jwtVerfiy,async (req,res)=>{
    const {userId,otherId}=req.body
    try{
        const theOtherUser=await User.findById(otherId,{email:0,password:0})
        const friends=theOtherUser?.friends
        if(friends){
            const isFrnd=friends.find(f=>f.friendId.toString()===userId.toString())
            res.status(200).json({theOtherUser,isFrnd:isFrnd})
        }else{
            res.status(200).json({theOtherUser,isFrnd:false})

        }

    }catch(err){
        console.log(err)
        res.status(500)
    }
})

app.post('/changeUserInfo' ,jwtVerfiy,async (req,res)=>{
    const {userId,newUserInfo}=req.body
    const {name,bio,profession,hobbies}=newUserInfo
    try{
        const updated=await User.findByIdAndUpdate(userId,{name:name,bio:bio,profession:profession,hobbies:hobbies},{new:true})
        res.status(200).json({updated})
    }catch(err){
        console.log(err)
        res.status(500) 
    }
})


if(process.env.NODE_ENV=="production"){
    const frontendPath = path.join(__dirname, 'client', 'dist');

    app.use(express.static(frontendPath))

    app.use((req,res)=>{
        res.sendFile(path.join(frontendPath,"index.html"))
    })
}

const server=app.listen(PORT, ()=>{
    connectDb()
    console.log("server on ",PORT)
})


const io=new Server(server,{cors:{origin:'http://localhost:5173'}})
const userRooms=new Map()
io.on('connection',async (socket)=>{
    console.log("new Client",socket.id)

    socket.on('message',async (msg)=>{
        const {sender_id,receiver_id,message}=msg
        const roomName=[sender_id,receiver_id].sort().join("_")

        if(sender_id && receiver_id && message){
            try{
                const newMessage=new Message({sender_id,receiver_id,message})
                const savedMessage=await newMessage.save()
                io.to(roomName).emit('message',savedMessage)
            }catch(err){
                socket.emit('error',{message:'error whle saving'})
            }
        }
        else{
            socket.emit('error',{message:"bad request"})
        }

    })
    socket.on("joinRoom",({userId,friendId})=>{
        const roomName=[userId,friendId].sort().join("_")
        socket.join(roomName)
        userRooms.set(socket.id,roomName)
    })
    socket.on("typing",()=>{
        const room=userRooms.get(socket.id)
        socket.to(room).emit("typing")
    })
    socket.on("typingStop",()=>{
        const room=userRooms.get(socket.id)
        socket.to(room).emit("typingStop")
    })

    socket.on('disconnect',()=>{
        const room=userRooms.get(socket.id)
        userRooms.delete(socket.id)
        socket.to(room).emit("typingStop")
        console.log("client left",socket.id)
    })
})


