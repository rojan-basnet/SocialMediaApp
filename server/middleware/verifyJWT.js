import jwt from 'jsonwebtoken'
const jwtVerfiy=(req,res,next)=>{
    const authHeader=req.headers["authorization"];
    const token=authHeader && authHeader.split(" ")[1]

    if(!token) return res.status(401).json({message:"noToken"})
    else{
        try{
            const decoded=jwt.verify(token,process.env.JWT_A_SECRET)
            req.user=decoded
            next()
        }catch(err){
            res.status(403).json({message:"invalidOrExpired"})
        }

    }
}
export default jwtVerfiy