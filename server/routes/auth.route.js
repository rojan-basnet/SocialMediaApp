import express from 'express'
const authRouter=express.Router()
import { delToken,signUp,login ,refreshTkn} from '../controllers/auth.controller.js'



authRouter.delete('/deleteToken',delToken)

authRouter.post('/SignUp',signUp)

authRouter.post('/Login',login)

authRouter.post('/refreshToken',refreshTkn)

export default authRouter