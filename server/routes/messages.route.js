import express from 'express'
const router=express.Router()
import jwtVerfiy from '../middleware/verifyJWT.js'
import { getFrndMessages,getMsgFrnds } from '../controllers/message.controller.js'

router.get('/getMessages',jwtVerfiy,getFrndMessages)

router.post('/getMsgFrnds',jwtVerfiy,getMsgFrnds)


export default router