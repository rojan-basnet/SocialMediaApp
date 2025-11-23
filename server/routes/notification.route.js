import express from "express"
import jwtVerfiy from "../middleware/verifyJWT.js"
const router=express.Router()
import { sendNotifi,subscribeToNoti } from "../controllers/notification.controller.js"

router.post('/subscribe',jwtVerfiy,subscribeToNoti)
router.post('/send-notification', jwtVerfiy,sendNotifi);

export default router