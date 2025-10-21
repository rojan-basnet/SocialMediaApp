import { Settings,LogOut } from "lucide-react"
import { Link,useParams,useNavigate } from "react-router-dom"
import {Toaster,toast} from 'sonner'
import api from '../../api/axios.js'
import './ProfileC.css'

const ProfileC = ({classname}) => {

const {userId}=useParams()
const navigate=useNavigate()

function hanldeLogOut(){
const newToast=toast.loading("Logging out")
  api.delete('/deleteToken')
  .then(res=>{
    toast.success("Logged Out",{id:newToast})
    navigate("/",{replace:true})
    })
  .catch(err=>{
    console.error(err)
    toast.error("Failed to Log out",{id:newToast}) 

  })
}
  return (
    <>
        <Toaster richColors={true} />
      <div className={classname} >
        <div><Link to={`/${userId}/dashboard/profile`}>Account</Link></div>
        <div><i><Settings/></i>  <div>Settings</div> </div>
        <div onClick={hanldeLogOut}><i><LogOut/></i>  <div>Log out</div>   </div>
      </div>
    </>

  )
}

export default ProfileC 