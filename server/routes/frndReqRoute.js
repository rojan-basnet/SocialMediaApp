import express from 'express'
import { sendfrndReq,acptFrndsReq,delFrndReq } from '../controllers/frndReqcontroller.js'
import jwtVerfiy from '../middleware/verifyJWT.js'
const router=express.Router()

router.post('/sendFrndReq',jwtVerfiy,sendfrndReq)

router.post('/acceptReq',jwtVerfiy,acptFrndsReq)

router.delete('/deleteReq',jwtVerfiy,delFrndReq)

export default router