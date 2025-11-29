import axios from 'axios'
import {Toaster,toast} from 'sonner'
import './Home.css'
import "./Login.css"
import {useState} from 'react'
import {EyeOff,Eye} from 'lucide-react'
import {useNavigate,Link} from 'react-router-dom'

const Login = () => {
const [user,setUser]=useState({userName:"",email:"",password:""})
const [showPSWD,setshowPSWD]=useState(false)
const navigate=useNavigate()

function handleUserAuth(e){
    e.preventDefault()

    if(user.email && user.password && user.userName){
        const toasT=toast.loading("logging in")
        axios.post(`${import.meta.env.VITE_API_FETCH_URL}/Login`,user,{withCredentials:true})
        .then(res=>{
          const {generateAccessToken} =res.data
          localStorage.setItem("AccessToken",generateAccessToken)
          toast.success("Logged in",{id:toasT});
          navigate(`/${res.data.userObjId}/dashboard/home`,{replace:true})
        })
        .catch(err=>{
          if(err.status==404) return toast.error("Invaild email",{id:toasT})
          else if(err.response.data.message=='invalid fields'){
            return toast.error("No such user found",{id:toasT})
          }
          else if(err.response.data.message=='incorrectPassword'){
            return toast.error("Incorrect password",{id:toasT})
          }else{
            console.log(err.response)
          }
        })

    }
    else if (!user.userName) toast.warning("Please enter your username");
    else if (!user.email) toast.warning("Please enter your email");
    else if (!user.password) toast.warning("Please enter your password");
    
}

  return (
    <>
    <Toaster richColors={true}/>
    <div className='homeSignInForm'>
        <form onSubmit={handleUserAuth}>
            <h3>Log in</h3>

            <input type="text" placeholder='Username' value={user.userName} onChange={e=>setUser({...user,userName:e.target.value})} name="name"/>
            <input type="email"  placeholder='User1@gmail.com' value={user.email} onChange={e=>setUser({...user,email:e.target.value})} name="email" />
            <div className='pswdEnterSigin'>
            <input type={showPSWD? "text":"password"} placeholder='password' value={user.password} onChange={e=>setUser({...user,password:e.target.value})} />
            {
              showPSWD && <Eye onClick={()=>setshowPSWD(false)}/>
            }
            {
              !showPSWD && <EyeOff onClick={()=>setshowPSWD(true)}/>
            }
            </div>
            <button type='submit'  >Log in</button>
            <br />
            <Link to={'/signIn'} className='newAccBtn'>Create new account</Link>

        </form>
    </div>
    </>
  )
}

export default Login