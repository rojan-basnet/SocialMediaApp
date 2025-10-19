import NavBar from "./Components/NavBar.jsx"
import { UserPlus } from "lucide-react"
import { Toaster,toast } from "sonner"
import api from "../api/axios.js"
import { useEffect, useState } from "react"
import {useParams,useNavigate} from 'react-router-dom'
import './Addfriends.css'

const AddFriends = () => {
const { userId } = useParams()
const navigate=useNavigate()
const [allUser,setAllUser]=useState([])

async function handleUsersFetch(){
  await api.post('/allUsers',{userId})
  .then(res=>{setAllUser(res.data.allUsers);console.log(res.data.allUsers)})
  .catch(err=>{console.error(err);toast.error("There was an error")})
}   

useEffect(()=>{

  handleUsersFetch()
},[])

async function handleFrndRequestSend(frnId,name){
const sendToast=toast.loading("Sending Request")
     api.post('/sendFrndReq',{userId,frnId,name})
    .then(res=>{console.log("friend request sent");
        toast.success("Request sent",{id:sendToast,duration:2000});
        handleUsersFetch();}) 
    .catch(err=>{
        toast.error("Error")
        console.log(err)
    })
}

  return (
    <>
    <Toaster richColors={true}/> 
    <NavBar/>
    <h2 className="allUsersheader">New People</h2>

      <div className='showAllUsersMain'>
            {allUser.length==0 &&
              <div className='showAllUsers'>
                <div>There are no Users</div>
              </div>
            }
            {
              allUser.length>0 &&
              <div className='showAllUsers '>
                {
                  allUser.map((ele,index)=>{
                    return <div key={index} >
                              <div>
                                <img src={ele.profilePic ? ele.profilePic : "/default_pp.jpg"} className="ppOfFriends" onClick={()=>{navigate(`/${userId}/dashboard/${ele._id}`)}}/>
                                <div>{ele.name}</div>
                              </div> 
                              <i onClick={()=>handleFrndRequestSend(ele._id,ele.name)}><UserPlus/></i>
                          </div>   
                  })
                }
              </div>  
            }
      </div>
    </>

  )
}

export default AddFriends