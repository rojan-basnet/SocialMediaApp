import {MessageCircle,UserRoundPen,BellRing,Gamepad2,House,Users,UserPlus,Menu,X} from 'lucide-react'
import { Link,useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ProfileC from './ProfileC'
import api from '../../api/axios.js'
import './NavBar.css'
import { useGlobalState } from '../../globalStates/tabs.jsx'

const NavBar = () => {
const [isProfileIconClicked,setIsProfileIconClicked]=useState(false)
const [showMobileSideBar,setShowMobileSideBar]=useState(false)
const [showNotifiBox,setShowNotifiBox]=useState(false)
const {userId}=useParams()
const {selectedTab,setSelectedTab}=useGlobalState()

useEffect(()=>{
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js')
    .then(swReg => {
        console.log('Service Worker Registered', swReg);
    }).catch(err => console.error(err));
}
},[])

async function handleNotifiSubs(){

  const permission = await Notification.requestPermission();
    if (permission !== 'granted') return alert('Permission denied');

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_NOTI_PUBLIC_KEYS
    });

    api.post('/subscribe',{subscription,userId})
    .then((res)=>{
      console.log(res.data)
    })
    .catch((err)=>{
      console.error(err)
    })

}
  return (
    <>
    <div className='navBar'>
          <ul className='logo'>
            <h1 >
              <Link to={`/${userId}/dashboard/home`} onClick={()=>setSelectedTab('home')} >LOGO</Link>
            </h1>
          </ul>

          <ul className='center'>
            <li className={selectedTab =='home'?'active':""} >
              <Link to={`/${userId}/dashboard/home`}  onClick={()=>setSelectedTab('home')}>
                <House/>
              </Link>
            </li>
            <li className={selectedTab =='addFrnds'?'active':""}>
              <Link to={`/${userId}/dashboard/addFriends`} onClick={()=>setSelectedTab('addFrnds')}>
                <UserPlus/>
              </Link>
            </li>
            <li className={selectedTab =='game'?'active':""}>
              <Link onClick={()=>setSelectedTab('game')}>
                <Gamepad2/>
              </Link>
            </li>
            <li className={selectedTab =='frnds'?'active':""}>
              <Link to={`/${userId}/dashboard/friends`} onClick={()=>setSelectedTab('frnds')}>
                <Users/>
              </Link>
            </li>
          </ul >

          <ul className='end'>
            <li className={selectedTab =='notifications'?'active':""}>
              <Link onClick={()=>{setSelectedTab('notifications');handleNotifiSubs}}>
                <BellRing  />
              </Link>
            </li> 
            <li className={selectedTab =='chats'?'active':""}>
              <Link to={`/${userId}/dashboard/messages`} onClick={()=>setSelectedTab('chats')}>
                <MessageCircle/>
              </Link>
            </li>
            <li  className={selectedTab =='Account'?'active':""}>
              <div onClick={()=>{setIsProfileIconClicked(!isProfileIconClicked);setSelectedTab('Account')}}>
                <UserRoundPen />
                {isProfileIconClicked && <div><ProfileC classname='profileCMain'/></div>}
              </div>

            </li>
          </ul>

          <ul className='fourth' onClick={()=>{setShowMobileSideBar(true)}}>
            <Menu/>
          </ul>
          {
            showMobileSideBar && <div className='mobileSideNav'>
              <div className='middleMan' onClick={()=>{setShowMobileSideBar(false);setIsProfileIconClicked(false)}}>
                <ul onClick={(e)=> e.stopPropagation()}>
                  <div className='backBtn' onClick={()=>{setShowMobileSideBar(false)}}> <X/></div>
                  <li  className={selectedTab =='home'?'active':""}>
                    <Link to={`/${userId}/dashboard/home`} onClick={()=>{setSelectedTab('home')}}> 
                      <House/> <div>Home</div>
                    </Link>
                  </li>
                  <li className={selectedTab =='addFrnds'?'active':""}>
                    <Link to={`/${userId}/dashboard/addFriends`} onClick={()=>{setSelectedTab('addFrnds')}} >
                      <UserPlus/> <div>More People</div>
                    </Link>
                  </li>
                  <li className={selectedTab =='game'?'active':""}>
                    <Link onClick={()=>{setSelectedTab('game')}}>
                      <Gamepad2/><div>Games</div> 
                    </Link>
                  </li>
                  <li className={selectedTab =='frnds'?'active':""}>
                    <Link to={`/${userId}/dashboard/friends`} onClick={()=>{setSelectedTab('frnds')}}>
                      <Users/> <div>Friends</div>
                    </Link>
                  </li>
                  <li >
                    <Link onClick={()=>{setSelectedTab('notifications')}}>
                      <BellRing  /> <div>Notifications</div>
                    </Link>
                  </li> 
                  <li className={selectedTab =='chats'?'active':""}>
                    <Link to={`/${userId}/dashboard/messages`} onClick={()=>{setSelectedTab('chats')}}>
                      <MessageCircle/> <div>Chats</div>
                      </Link>
                    </li>
                  <li onClick={()=>{setIsProfileIconClicked(!isProfileIconClicked);setSelectedTab('Account')}} className={selectedTab =='Account'?'active':""}>
                      <div className='profilCHeader'><UserRoundPen /><div>Profile</div></div>
                      {isProfileIconClicked && <div ><ProfileC classname='profileCMainMbl' /></div>} 
                  </li>
                </ul>
              </div>
            </div>
          }
          {
            showNotifiBox && <div>
              <button >Allow noti</button>
            </div>
          }
    </div>
    </>

  )
}

export default NavBar