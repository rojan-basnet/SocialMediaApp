import express, { Router } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'
import { connectDb } from './config/db.js'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { User } from './models/User.js'
import cookieParser from 'cookie-parser'
import jwtVerfiy from './middleware/verifyJWT.js'
import Message from './models/Message.js'
import path from 'path'
import { Post } from './models/Posts.js'

dotenv.config()
const __dirname=path.resolve()

const PORT=process.env.PORT|| 5000
const app=express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())


function generateTokens(id,userName){
    const generateAccessToken=jwt.sign({id, username:userName },process.env.JWT_A_SECRET,{expiresIn:"15m"})
    const generateRefreshToken=jwt.sign({id, username: userName },process.env.JWT_R_SECRET,{expiresIn:"7d"})

    return {generateAccessToken,generateRefreshToken}
}
app.post('/sendFrndReq',async  (req,res)=>{
    const {userId,frnId,name}=req.body

    try{
        const sender=await User.findByIdAndUpdate(userId,{$push:{friends:{friendId: frnId, status: "pending",requestType:"sent",frndName:name}}},{new:true})
        const receiver=await User.findByIdAndUpdate(frnId,{$push:{friends:{friendId: userId, status: "pending",requestType:"received",frndName:sender.name}}},{new:true})

        res.status(200).json({message:"request sent",to:receiver.name})
    }catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
})

app.post('/SignUp', async (req,res)=>{
    const data=req.body
    if(data.email && data.password && data.userName){
        const hashed=await bcrypt.hash(data.password,10)
        const newUser={name:data.userName,email:data.email,password:hashed}
        try{
            const createdUser=await User.create(newUser)
            const {generateAccessToken,generateRefreshToken}=generateTokens(createdUser._id,createdUser.name)

            res.cookie("refreshToken",generateRefreshToken,{
                httpOnly: true,
                secure: false, 
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            res.status(201).json({success:true,message:"user created",userObjId:createdUser._id,generateAccessToken})
        }catch(error){
            console.error("error while create user",error);
            res.status(500).json({success:false,message:"Failed to create new user"})
        }
    }
    else{
        res.status(400).json({success:false,message:"empty fields"})
    }
})
app.post('/Login',async (req,res)=>{
    const {userName,password,email}=req.body

    try{
        const thisUser=await User.findOne({email:email})

        if(userName===thisUser.name){
            const isMatch=await bcrypt.compare(password,thisUser.password)
            if(isMatch){
                const {generateAccessToken,generateRefreshToken}=generateTokens(thisUser._id,userName)
                res.cookie("refreshToken",generateRefreshToken,{
                    httpOnly:true,
                    secure:false,
                    sameSite:"lax",
                    maxAge:7 * 24 * 60 * 60 * 1000,
                })
                return res.status(200).json({message:"user loged in",userObjId:thisUser._id,generateAccessToken})
            } 
            return res.status(403).json({message:"incorrectPassword"})
        }else{
            res.status(403).json({message:"invalid fields"})
        }
    }catch(err){
        res.status(404).json({message:"user not found"})
        console.log("there is no such user")
    }
})
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
app.post('/acceptReq',jwtVerfiy,async (req,res)=>{
    const {userId,friendId}=req.body

    try{
        const receiverAccept=await User.updateOne(
            {_id:userId,"friends.friendId":friendId},
            {$set:{ "friends.$.status": "accepted" }})

        const senderAccept=await User.updateOne(
            {_id:friendId,"friends.friendId":userId},
            {$set:{"friends.$.status":"accepted"}}
        )

        res.send(200).json({message:"Request Accepted"})

    }catch(err){
        res.status(500).json({message:"server error"})
    }
})
app.delete('/deleteReq',jwtVerfiy,async (req,res)=>{
    const {userId,friendId}=req.body
    try{
        const receiverDel=await User.updateOne({_id:userId},{$pull:{friends:{friendId:friendId}}})
        const senderDel=await User.updateOne({_id:friendId},{$pull:{friends:{friendId:userId}}})

        res.status(200).json({message:"Canceled Request"})
    }catch(err){
        res.status(500).json({message:"server error"})
    }
})
app.post('/getMsgFrnds' ,jwtVerfiy, async (req,res)=>{
    const {userId}=req.body
    try{
        const userFrnds=await User.findById(userId,{_id:0,friends:1}).populate("friends.friendId","profilePic")
        const trueFrnds=userFrnds.friends.filter(f=>f.status==='accepted')
        res.status(200).json({trueFrnds,message:"fetched friends"})
    }catch(err){
        res.status(500)
    }
})

app.post('/refreshToken',(req,res)=>{
    const refreshToken=req.cookies.refreshToken

    if(!refreshToken){
        return res.status(401).json({message:"noRefreshToken"})
    } 
    try{
        const decoded=jwt.verify(refreshToken,process.env.JWT_R_SECRET)
        const {id,username}=decoded

        const newToken=jwt.sign({id,username},process.env.JWT_A_SECRET,{expiresIn:'15m'})
        res.status(200).json({success:true,message:"new token generated",newToken})
    }catch(err){
        res.status(403).json({message:"invalidOrExpiredRefreshToken"})
    }


})
app.post('/getMessages',jwtVerfiy, async (req,res)=>{
    const {userId,friendId}=req.body

    try{
        const allmessages=await Message.find({$or:[{sender_id:userId,receiver_id:friendId},{sender_id:friendId,receiver_id:userId}]})
        res.status(200).json({message:"fetched message",allmessages})
    }catch(err){
        res.status(500)
    }
})
app.post('/uploadPost',jwtVerfiy,async(req,res)=>{
    const {id,username}=req.user
    const {title,images}=req.body.newPost

    try{
        const newPost=new Post({uploaderName:username,uploaderId:id,title:title,images:images})
        const post=await newPost.save()
        console.log(post)
        res.status(200).json({message:"Posted",post})
    }catch(err){
        console.log(err)
        res.status(500)
    }
})

app.get('/fetchPosts',jwtVerfiy,async (req,res)=>{
    const {id}=req.user
    try{
        const posts=await Post.find({ uploaderId: { $ne: id } }).populate("uploaderId","profilePic")
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
        const post=await Post.findById(postid,{_id:0,comments:1}).populate("comments.commenterId","name")
        res.status(200).json({post})
    }catch(err){
        res.status(500)
    }
})
app.post('/getUserData',jwtVerfiy,async (req,res)=>{
    const {userId}=req.body
    try{
        const user=await User.findById(userId)
        res.status(200).json({user})
    }catch(err){
        console.log(err)
        res.status(500)
    }
})
app.post('/getUserPost',jwtVerfiy,async (req,res)=>{
    const {userId}=req.body
    try{
        const posts=await Post.find({uploaderId:userId}).sort({_id:-1})
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
        console.log("yo you")
        console.log(updatedUser)
        res.status(200).json({updatedUser})
    }catch(err){
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
app.post('/getOhterUserPost',jwtVerfiy,async (req,res)=>{
    const {otherId}=req.body
    try{
        const otherUserPosts=await Post.find({uploaderId:otherId})
        res.status(200).json({otherUserPosts:otherUserPosts})
    }catch(err){
        res.status(500)
    }
})
app.post('/changeUserInfo' ,async (req,res)=>{
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
    console.log("NODE_ENV:", process.env.NODE_ENV)
    console.log(frontendPath)

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
        console.log(userRooms)
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


