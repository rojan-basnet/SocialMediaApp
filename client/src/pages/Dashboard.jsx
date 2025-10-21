import {useState,useEffect} from 'react'
import './Dashboard.css'
import api from '../api/axios.js'
import { data, useParams } from 'react-router-dom'
import NavBar from './Components/NavBar.jsx'
import { Camera } from 'lucide-react'
import { supabase } from '../supabase/client.js'
import {toast,Toaster} from 'sonner'

const Dashboard = () => {
const [file,setFile]=useState(null)
const [user,setUser]=useState({})
const [newUserInfo,setNewUserInfo]=useState({
  name:"",
  profession:"",
  bio:"",
  hobbies:""
})
const [squareFile,setSquareFile]=useState(null)
const {userId}=useParams()

  useEffect(()=>{
    getUserData()
  },[])

  function getUserData(){
      api.post("/getUserData",{userId})
      .then(res=>{
        const data=res.data.user
        setUser(data);
        setNewUserInfo({name:data.name,
          profession:data.profession||"",
          bio:data.bio||"",
          hobbies:data.hobbies||""})})

      .catch(err=>{console.log(err)})
  }
  async function handleFileChange(e){
    setFile(e.target.files[0])
    const newFile=await makeProfilePicture(e.target.files[0]) 
    setSquareFile(newFile)
  }
  async function makeProfilePicture(file) {
    const img = await loadImage(URL.createObjectURL(file));
    const size = Math.min(img.width, img.height);
    
    // Create canvas for 256x256 profile picture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const targetSize = 256;

    canvas.width = targetSize;
    canvas.height = targetSize;

    // Draw square crop then resize
    ctx.drawImage(
      img,
      (img.width - size) / 2,
      (img.height - size) / 2,
      size,
      size,
      0,
      0,
      targetSize,
      targetSize
    );

    // Compress to JPEG (quality 0.8)
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.8)
    );

    return new File([blob], 'profile.jpg', { type: 'image/jpeg' });
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }
  async function handleDataSubmit(e){
    e.preventDefault()
    if(!squareFile) return 

    const {data:dataImg,error:dataImgErr}=await supabase.storage
    .from("ProfilePics")
    .upload(`pics/${Date.now()}_${userId}`,squareFile)
    if(dataImgErr) {return console.error(data)}
    else{
      const {data:ppURL,error:URLerr}=supabase.storage
      .from("ProfilePics")
      .getPublicUrl(`${dataImg.path}`)
      if(URLerr){return console.error(URLerr)}
      else{
        api.post('/profilePicSetUp',{userId,ppURL:ppURL.publicUrl})
        .then(res=>{console.log(res.data.updatedUser)})
        .catch(err=>{console.error(err)})
      }
    }
  }
  function getPPURl(){
    if(user.profilePic){
      return user.profilePic
    }else{
      return '/default_pp.jpg'
    }
  } 
  function handleUserInfoChange(e){
    e.preventDefault()
    console.log(newUserInfo)
    const newToast=toast.loading("Updating profile")
    if(newUserInfo.name.trim()!==""){
      api.post('/changeUserInfo',{userId,newUserInfo})
      .then(res=>{
        console.log(res.data)
        toast.success("Profile Updated",{id:newToast})

      })
      .catch(err=>{
        console.log(err)
      })

    }else{
      toast.error("Empty name field",{id:newToast})
    }
  }
  return (
    <>
      <Toaster richColors={true}/>
      <NavBar/>
      <div className='profileEditFrom'>
        <div className='profileEditFromInner'>
          <form onSubmit={handleDataSubmit} >
            <div className='ppChangeBox'>
              <div className='profilePicPreview'><img src={squareFile?URL.createObjectURL(squareFile) :getPPURl()} />          
                <label htmlFor="iamgeInput" className='cameraIcon'><Camera/></label>
                <input type="file" accept='image/*' id='iamgeInput' onChange={handleFileChange} hidden/>
              </div>
              <button type='submit'>Save</button>
            </div>
          </form>

          <form className='userInfoEditForm' onSubmit={handleUserInfoChange}>
            <div>
            <label htmlFor="name">Name: </label>
            <input type="text" value={newUserInfo.name} id="name" onChange={e=>setNewUserInfo({...newUserInfo,name:e.target.value})}/>
            </div>
            <div>
            <label htmlFor="bio">Bio: </label>
            <input type="text"  id="bio" value={newUserInfo.bio} onChange={e=>setNewUserInfo({...newUserInfo,bio:e.target.value})}/>
            </div>
            <div>
            <label htmlFor="hobby">Hobbies: </label>
            <input type="text"  id="hobby" value={newUserInfo.hobbies} onChange={e=>setNewUserInfo({...newUserInfo,hobbies:e.target.value})}/>
            </div>
            <div>
            <label htmlFor="proffession">Profession / study field: </label>
            <input type="text"  id="proffession" value={newUserInfo.profession} onChange={e=>setNewUserInfo({...newUserInfo,profession:e.target.value})}/>
            </div>

            <button type='submit'> Save</button>
          </form>
        </div>
      </div> 

    </>
  )
}

export default Dashboard