import { useEffect, useState } from "react"
import {useParams ,useNavigate} from "react-router-dom"
import {Users,UserRoundPlus, UserCheck, UserSearch} from 'lucide-react'
import api from "../api/axios.js"
import { Toaster,toast } from "sonner"
import NavBar from "./Components/NavBar.jsx"
import './Friends.css'

const Friends = () => {
const [allfriends,setAllFriends]=useState([])
const [friends,setFriends]=useState([])
const [requested,setRequested]=useState([])
const [requests,setRequests]=useState([])
const sideUlElements=["Friends","Requested","Requests"]
const [Selected,setSelected]=useState(sideUlElements[0])
const {userId}=useParams()
const navigate=useNavigate()

useEffect(()=>{
    handleFriendsFetch()
},[])

function handleFriendsFetch(Selected){
      let frnds=[]
      let sent=[]
      let received=[]
        api.post('/friends',{userId})
        .then(res=>{res.data.friends.forEach(element => {
          if(element.status==='accepted'){
            frnds.push(element)
          }
          else if(element.status==='pending' && element.requestType==='sent'){
            sent.push(element)
          }
          else if(element.status==='pending' && element.requestType==='received'){
            received.push(element)
          }

        });

        setFriends(frnds)
        setRequested(sent)
        setRequests(received)
        if(Selected && Selected =="Requested"){
          setAllFriends(sent)
        }else if(Selected && Selected =="Requests"){
          setAllFriends(received)
        }else{
          setAllFriends(frnds)
        }

        })
        .catch(err=>console.error(err))
    }

async function handleReqAccept(friendId){
const newToast=toast.loading("Accepting Request")

 await   api.post("/acceptReq",{userId,friendId})
  .then(res=>{toast.message('Request Accepted',{id:newToast,duration:2000});handleFriendsFetch()})
  .catch(err=>console.log(err))
}
async function handleReqReject(friendId) {
const newToast=toast.loading("Deleting Request")
  await api.delete("/deleteReq",{data:{userId,friendId}})
  .then(res=>{toast.success("Request Deleted",{id:newToast,duration:2000,style: { background: "#f87171", color: "#fff" }});handleFriendsFetch("Requests")})
  .catch(err=>{console.log(err);toast.error("Error",{id:newToast,duration:2000,})} )
}
async function handleSentReqCancel(friendId){
const newToast=toast.loading("Deleting Request")
  await api.delete("/deleteReq",{data:{userId,friendId}})
  .then(res=>{toast.success("Request Deleted",{id:newToast,duration:2000,style: { background: "#f87171", color: "#fff" }});handleFriendsFetch("Requested")})
  .catch(err=>{console.log(err);toast.error("Error",{id:newToast,duration:2000})} )
}

  return (

    <>
    <Toaster richColors={true} />
        <NavBar />
      <div className="mainContainer"> 
 
        <div className="sideBar">
          <ul>
            <li className={Selected=="Friends"?"active":""} onClick={()=>{setAllFriends(friends);setSelected(sideUlElements[0])}} ><i><Users/></i><div>Friends</div></li>
            <li className={Selected=="Requested"?"active":""} onClick={()=>{setAllFriends(requested);setSelected(sideUlElements[1])}}> <i><UserRoundPlus /></i> <div>Requested</div></li>
            <li className={Selected=="Requests"?"active":""} onClick={()=>{setAllFriends(requests);setSelected(sideUlElements[2])}}><i>< UserCheck/></i> <div>Requests</div></li>
          </ul>
        </div>
        
        <div className='showAllFriendsMain'>
              {allfriends.length==0 &&
                <div className='showAllFriends'>
                  <div>There are no friends</div>
                </div>
              }
              <h2 className="showFrndsType">{Selected=="Friends"?'Friends':Selected=="Requested"?"Sent Requests":"Recevied Requests"}</h2>
              {
                allfriends.length!==0 &&
                <div className='showAllFriends '>
                  {
                    allfriends.map((ele,index)=>{
                      return <div key={index} > 

                            <div className="frndProfile">
                              <img src={ele.friendId?.profilePic? ele.friendId.profilePic:"/default_pp.jpg" }  
                              onClick={()=>{navigate(`/${userId}/dashboard/${ele.friendId._id}`)}}/>
                              <div>{ele.frndName}</div>
                            </div>

                            <div>
                              {ele.status=="accepted" && 
                              <div className="btnContaier"><UserSearch onClick={()=>navigate(`/${userId}/dashboard/${ele.friendId._id}`)}/></div>}
                              {ele.status==="pending" && ele.requestType=="sent" && 
                              <div className="btnContaier">
                                <button onClick={()=>handleSentReqCancel(ele.friendId._id)} className="cancelBtn">cancel</button>
                              </div> 
                               }
                              {ele.status==="pending" && ele.requestType=="received" && 
                              <div className="btnsContaier">
                                <button onClick={()=>handleReqAccept(ele.friendId)} className="accept-btn">Confirm</button> 
                                <button onClick={()=>handleReqReject(ele.friendId._id)} className="reject-btn">Delete</button>
                              </div>}
                            </div>   
                          </div>  

                    })
                  }
                </div>
              }
        </div>

      </div>

    </>

  )
}

export default Friends