import { Settings,LogOut } from "lucide-react"
import { Link,useParams } from "react-router-dom"
import './ProfileC.css'

const ProfileC = ({classname}) => {

const {userId}=useParams()

  return (
    <div className={classname}>
        <div><Link to={`/${userId}/dashboard/profile`}>Account</Link></div>
        <div><i><Settings/></i>  <div>Settings</div> </div>
        <div><i><LogOut/></i>  <div>Log out</div>   </div>
    </div>
  )
}

export default ProfileC 