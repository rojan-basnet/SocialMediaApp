import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import './Messages.css'
import api from "../api/axios.js"
import NavBar from "./Components/NavBar.jsx"
import TypingBubble from "./Components/TypingBubble.jsx"
import { SendHorizonal,ArrowLeft,X,UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../globalStates/socket.jsx"
import {toast,Toaster} from 'sonner'
import CallSection from "./Components/CallPage.jsx"
import Call from './Components/Call.jsx'
import { startCamera,stopCamera } from "./Components/heplerFunctions/startCam.js"
import { startPeerConnection } from "./Components/heplerFunctions/peerConnection.js"

const Messages = () => {
const {userId}=useParams()
const [friends,setFriends]=useState([])
const [selectedChat,setSelectedChat]=useState('')
const [message,setMessage]=useState("")
const [allMessages,setAllMessages]=useState([]) 
const [isTyping,setIsTyping]=useState(false)
const socketRef=useRef()
const [showMobileSideBar,setShowMobileSideBar]=useState(false)
const navigate=useNavigate()
const socket=useSocket();
const messagesEndRef = useRef(null)
const [callState,setCallState]=useState("pending")
const [isCalling,setIsCalling]=useState(false)
const [callReceiver,setCallReceiver]=useState(null)
const [lclStreamReady,setLclStreamReady]=useState(false)
const streamRef=useRef(null)


const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}

useEffect(() => {
    scrollToBottom()
}, [allMessages])


function handleFriendsFetch(){
    api.post('/getMsgFrnds',{userId})
    .then(res=>{
            const frndsArr=res.data.trueFrnds.filter((ele)=>{
                return ele.friendId!==null
            })
            setFriends(frndsArr)
            setSelectedChat(frndsArr[0])
            handleFriendsClick(frndsArr[0])
            socketRef.current.emit('joinRoom',{userId,friendId:frndsArr[0]?.friendId._id})
    })
    .catch(err=>{
        console.error(err)
    })
}

useEffect(()=>{

    if(socket){
    handleFriendsFetch()

        socketRef.current=socket
        socket.on("message",(msg)=>{setAllMessages(prev=>[...prev,msg]);setIsTyping(false)})
        socket.on("typing",()=>{setIsTyping(true)})
        socket.on("typingStop",()=>{setIsTyping(false)})

        socket.on("callReceiverStatus",(data)=>{
            const {status}=data

            if(status=="online"){
                setIsCalling(true)
                const {pp,id,name}=data
                setCallReceiver({pp,id,name})

                startPeerConnection(socketRef.current) 
                .then(stream=>{
                    streamRef.current=stream
                    setLclStreamReady(true)

                })
                .catch(err=>{
                    console.log(err)
                })

            }else if(status=="offline"){
                setIsCalling(false)
                toast.info("User is offline");
            }


        })
          socket.on("callAccepted",()=>{
                console.log("the call was accepted")
                setCallState("accepted")
               // handleMineVidSend(streamRef.current)

            })

            socket.on("callRejected",()=>{
                console.log("the call was rejected")

                setCallState("rejected")
                setTimeout(()=>{
                    setIsCalling(false)
                },1000)

                handleCallEnd("fromReceiver")

            })
            
        return () => {
            socket.off("message");
            socket.off("typing");
            socket.off("typingStop");
            socket.off("callReceived");
            socket.off("callReceiverStatus");
            socket.off("c")
        };
        
    } 



},[socket])

function handleMsgSent(e){
    e.preventDefault();
    if(message.trim()==="" || !selectedChat) return

    const msgToSend={sender_id:userId,receiver_id:selectedChat.friendId._id,message:message}
    socketRef.current.emit("message",msgToSend)
    setMessage("")
    api.post('/send-notification',{toSend:selectedChat.friendId._id,message,userId})
    .then(res=>{

    })
    .catch(err=>console.log(err))
}
function handleFriendsClick(ele){
    setSelectedChat(ele)
    socketRef.current.emit("typingStop")
    socketRef.current.emit('joinRoom',{userId,friendId:ele.friendId._id})

    api.get(`/getMessages?friendId=${ele.friendId._id}`)
    .then(res=>{
        setAllMessages(res.data.allmessages)
    })
    .catch(err=>{
        console.log(err)
    })
}
function handleMessageTyping(typingText){
    setMessage(typingText)
    if(typingText.trim("")!==""){
        socketRef.current.emit("typing")
    }else if(typingText.trim("")==""){
        socketRef.current.emit("typingStop")
    }

}
function handleCallEnd(from){

    if(!from=="fromReceiver"){
        socket.emit("callCancel",{from:userId,to:selectedChat.friendId._id})
    }
        setIsCalling(false)
        setCallState("pending")
        stopCamera(streamRef)
        setLclStreamReady(false)


}
function handleCall(type,otherId){
    if(type=="audio"){
        socketRef.current.emit("callIntilized",{from:userId,to:otherId})
        console.log("audio call initilized",{from:userId,to:otherId})

    }else if(type=="video"){
        socketRef.current.emit("callIntilized",{from:userId,to:otherId})
    }
}

  return (
    <>
        <Toaster/>
        <NavBar/>
        {
            isCalling && callReceiver && lclStreamReady&&
            <CallSection onEndCall={handleCallEnd} 
            name={callReceiver.name} img={callReceiver.pp} 
            status={callState} mineVid={streamRef}/>
        }
        <div className="mainContainerMSG">
            <div className="friendsDisplay">
                <ul>
                { friends.length!==0  &&
                    friends.map((ele,index)=>{
                        return <li key={index} 
                                    className={selectedChat?.friendId?._id==ele.friendId._id?"active":""} 
                                    onClick={()=>handleFriendsClick(ele)}>
                                        <img src={ele.friendId?.profilePic?ele.friendId.profilePic:"/default_pp.jpg"}/>
                                        <div>{ele.frndName}</div>
                                </li>
                    })
                }{ 
                    friends.length==0 &&
                    <li onClick={()=>navigate(`/${userId}/dashboard/addFriends`)}>
                        <div >No Friends</div>
                    </li>
                }
                </ul>
            </div>
            {
                showMobileSideBar &&
            <div className="friendsDisplaymobile" >
                <div className="middleMan" onClick={()=>setShowMobileSideBar(false)}>
                    <div className="friendsDisplay">
                        <div className="headerDisFriends"> <div>Friends</div><div className="closeSide"><X/></div></div>
                        <ul>
                        {
                            friends.map((ele,index)=>{
                                return <li key={index} className={selectedChat?.friendId._id==ele.friendId._id?"active":""} onClick={()=>handleFriendsClick(ele)}><img src={ele.friendId.profilePic?ele.friendId.profilePic:"/default_pp.jpg"}/><div>{ele.frndName}</div></li>
                            })
                        }
                        </ul>
                    </div>
                </div>
            </div>
            }


            <div className="chatBoxMainContainer">
            {
                selectedChat &&
                 <div className="chatBoxMain">
                    <div className="chatBoxTop">

                        <div className="chatInfo">
                            <ArrowLeft className="backIcon" onClick={()=>setShowMobileSideBar(true)}/>
                            <img src={selectedChat.friendId.profilePic?selectedChat.friendId.profilePic:"/default_pp.jpg"}/>
                            <div>{selectedChat.frndName}</div>
                        </div>


                        <div className="callSection">
                            <Call 
                                handleAudioCall={()=>handleCall("audio",selectedChat.friendId._id)}
                                handleVidCall={()=>handleCall("video",selectedChat.friendId._id)}
                                disabled={isCalling}
                            />

                        </div>
                    </div>
 
                    <div className="chatBoxRest"> 
                        { allMessages.length!==0 &&
                            allMessages.map((ele,index)=>{
                                return     <div key={index} className={userId==ele.sender_id?"myMessageWrapper" : "friendMessageWrapper"} >
                                                    <div className="timeStampMessage">
                                                        <div>{new Date(ele.sentAt).toDateString()}</div>
                                                        <div>{new Date(ele.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                                                    </div>
                                                    
                                                    <div className={userId==ele.sender_id?"myMessage bubble" : "friendMessage bubble"} >
                                                        {ele.message}
                                                    </div>
                                            </div>
                                
                            })
                        }{
                            allMessages.length==0 && <div className="noPrevMessages">No messages</div>
                        }{isTyping&&<TypingBubble/>}
                        
                    <div ref={messagesEndRef} />
                    </div>

                    <div className="chatBoxInput">
                        <form onSubmit={handleMsgSent}>
                            <input type="text" value={message} onChange={e=>handleMessageTyping(e.target.value)} placeholder="Message"/>
                            <button type="submit" className='sendBtn'><SendHorizonal/></button>
                        </form>
                    </div>
                 </div>
            }
            {
                friends.length==0 &&
                <div className="chatBoxMain noFrnds">
                    <div>
                        <div>Add friends to chat</div>
                        <button onClick={()=>{navigate(`/${userId}/dashboard/addFriends`)}}>Add Friends <UserPlus/></button>
                    </div>
                </div>
            }
            </div>
        </div>


    </>
  )
}

export default Messages