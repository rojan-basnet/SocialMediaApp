import axios from 'axios'
import {Toaster,toast} from 'sonner'
import './Home.css'
import {useState} from 'react'
import {useNavigate,Link} from 'react-router-dom'

const SignIn = () => {
const [user,setUser]=useState({userName:"",email:"",password:""})
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
            <input type="text" placeholder='Username' value={user.userName} onChange={e=>setUser({...user,userName:e.target.value})}/>
            <input type="email"  placeholder='User1@gmail.com' value={user.email} onChange={e=>setUser({...user,email:e.target.value})} autoComplete="email"/>
            <input type="password" placeholder='password' value={user.password} onChange={e=>setUser({...user,password:e.target.value})}/>
            <button type='submit'  >Create</button>
            <div>Already have Account? <Link to={'/logIn'}>Log In</Link></div>
        </form>
    </div>
    </> 
  )
}

export default SignIn