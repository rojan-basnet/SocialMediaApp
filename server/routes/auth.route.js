import express from 'express'
const router=express.Router()
import { delToken,signUp,login ,refreshTkn} from '../controllers/auth.controller.js'



router.delete('/deleteToken',delToken)

router.post('/SignUp',signUp)

router.post('/Login',login)

router.get('/refreshToken',refreshTkn)

export default router