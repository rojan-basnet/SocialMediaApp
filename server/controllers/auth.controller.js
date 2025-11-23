import { RefreshTokenM } from "../models/RefreshToken.js"
import jwt from 'jsonwebtoken'
import { User } from "../models/User.js";
import bcrypt from 'bcrypt';

function generateTokens(id,userName){
    const generateAccessToken=jwt.sign({id, username:userName },process.env.JWT_A_SECRET,{expiresIn:"10m"})
    const generateRefreshToken=jwt.sign({id, username: userName },process.env.JWT_R_SECRET,{expiresIn:"7d"})
    return {generateAccessToken,generateRefreshToken}
}

export const delToken=async (req,res)=>{ 
    const {refreshToken}=req.cookies

    try{
        const delToken=await RefreshTokenM.findOneAndDelete({rToken:refreshToken})
        if(delToken==null) return res.status(404).json({success:false})
        res.status(200).json({success:true})
    }catch(err){
        res.status(500).json({success:false})
    }
}


export const signUp= async (req,res)=>{
    const data=req.body
    if(data.email && data.password && data.userName){
        const hashed=await bcrypt.hash(data.password,10)
        const newUser={name:data.userName,email:data.email,password:hashed}
        try{
            const createdUser=await User.create(newUser)
            const {generateAccessToken,generateRefreshToken}=generateTokens(createdUser._id,createdUser.name)

            const newR_Token=new RefreshTokenM({rToken:generateRefreshToken})
            await newR_Token.save()
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
}


export const login=async (req,res)=>{
    const {userName,password,email}=req.body
    try{
        const thisUser=await User.findOne({email:email}) 

        if(userName===thisUser.name){
            const isMatch=await bcrypt.compare(password,thisUser.password)
            if(isMatch){
                const {generateAccessToken,generateRefreshToken}=generateTokens(thisUser._id,userName)

                const newR_Token=new RefreshTokenM({rToken:generateRefreshToken})
                await newR_Token.save()

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
}

export const refreshTkn=async (req,res)=>{
    const refreshToken=req.cookies.refreshToken

    if(!refreshToken){
        return res.status(401).json({message:"noRefreshToken"})
    } 
    try{
        const tokenFromDb=await RefreshTokenM.findOne({rToken:refreshToken})
        const decoded=jwt.verify(refreshToken,process.env.JWT_R_SECRET)
        const {id,username}=decoded
        if(tokenFromDb.rToken==refreshToken){
            const newToken=jwt.sign({id,username},process.env.JWT_A_SECRET,{expiresIn:'10m'})
            return res.status(200).json({success:true,message:"new token generated",newToken})
        }
        res.status(404).json({message:"tokenNotFound"})

    }catch(err){
        res.status(403).json({message:"invalidOrExpiredRefreshToken"})
    }


}