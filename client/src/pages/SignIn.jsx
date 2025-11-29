import axios from 'axios'
import {Toaster,toast} from 'sonner'
import {EyeOff,Eye} from 'lucide-react'
import "./Login.css"
import './Home.css'
import {useState} from 'react'
import {useNavigate,Link} from 'react-router-dom'

const SignIn = () => {
const [user,setUser]=useState({userName:"",email:"",password:""})
const [showPSWD,setshowPSWD]=useState(false)
const navigate=useNavigate()
 
function handleUserAuth(e){
    e.preventDefault()

    if(user.email && user.password && user.userName && user.password.length>8){
        const toasT=toast.loading("create account")
        axios.post(`${import.meta.env.VITE_API_FETCH_URL}/SignUp`,user,{withCredentials:true})
        .then(res=>{
          const {generateAccessToken}=res.data
          localStorage.setItem("AccessToken",generateAccessToken)

          toast.success("Account Created",{id:toasT});
          navigate(`/${res.data.userObjId}/dashboard/home`,{replace:true})
        })
        .catch(err=>console.error(err))

    }
    else if (user.password.length <=8) toast.warning("Password must be 8+ chars");
    else if (!user.userName) toast.warning("Please enter your username");
    else if (!user.email) toast.warning("Please enter your email");
    else if (!user.password) toast.warning("Please enter your password");
    
}
  return (
    <>
    <Toaster richColors={true}/>
    <div className='homeSignInForm'>
        <form onSubmit={handleUserAuth}>
            <h3>Create new account</h3>

            <input type="text" placeholder='Username' value={user.userName} onChange={e=>setUser({...user,userName:e.target.value})} name="name"/>
            <input type="email"  placeholder='User1@gmail.com' value={user.email} onChange={e=>setUser({...user,email:e.target.value})} name="email"/>
            <div className='pswdEnterSigin'>
            <input type={showPSWD? "text":"password"} placeholder='password' value={user.password} onChange={e=>setUser({...user,password:e.target.value})}/>
            {
              showPSWD && <Eye onClick={()=>setshowPSWD(false)}/>
            }
            {
              !showPSWD && <EyeOff onClick={()=>setshowPSWD(true)}/>
            }
            </div>
            <button type='submit'  >Create</button>
            <br />
            <Link to={'/logIn'} className='newAccBtn'>Already have Account? </Link>

        </form>
    </div>
    </> 
  )
}

export default SignIn