import { MessageCircle, UserRoundPen, BellRing, Gamepad2, House, Users, UserPlus, Menu, X } from 'lucide-react'
import { Link, useParams, useLocation, NavLink } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import ProfileC from './ProfileC'
import api from '../../api/axios.js'
import './NavBar.css'
import { toast, Toaster } from 'sonner'
import { useGlobalState } from '../../globalStates/tabs.jsx'
import CallPopUp from './CallPopUp.jsx'
import { useSocket } from '../../globalStates/socket.jsx'
import CallSection from './CallPage.jsx'
import { startCamera, stopCamera } from './heplerFunctions/startCam.js'
import { navlinks } from '../../constants/index.js'
import { receiveIceCandidate, handleOffer, handleAnswer, handleRemoteVidSend } from './heplerFunctions/peerConnection.js'

const NavBar = () => {
  const [isProfileIconClicked, setIsProfileIconClicked] = useState(false)
  const [showMobileSideBar, setShowMobileSideBar] = useState(false)
  const [showNotifiBox, setShowNotifiBox] = useState(false)
  const [isReceivingCall, setIsReceivingCall] = useState(false)
  const [pathname, setPathname] = useState()
  const { userId } = useParams()
  const { selectedTab, setSelectedTab } = useGlobalState()
  const [lclStreamReady, setLclStreamReady] = useState(false)
  const location = useLocation()
  const socket = useSocket()
  const [caller, setCaller] = useState(null)
  const [onCall, setOnCall] = useState(false)
  const streamRef = useRef()
  const callerStreamRef = useRef()


  useEffect(() => {
    localStorage.setItem("userId", userId)
    setPathname(location.pathname)

    if ('serviceWorker' in navigator && 'PushManager' in window) {

      navigator.serviceWorker.getRegistration('/sw.js')
        .then(registration => {
          if (!registration) {
            console.log("Service Worker not registered");
            navigator.serviceWorker.register('/sw.js')
          }
        });
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.auth = { userId: userId }
      socket.connect()

      socket.on("callReceived", (data) => {
        setCaller(data)
        setIsReceivingCall(true)
        socket.emit("joinSignallingServer", { from: userId, to: data.id })
      })

      socket.on("callCancel", () => {
        setIsReceivingCall(false)
      })
      socket.on("candidate", (data) => {
        receiveIceCandidate(data)
      })
      socket.on("offer", (offer) => {
        handleOffer(offer, socket, callerStreamRef)
      })
      socket.on("answer", (ans) => {
        handleAnswer(ans)
      })
    }
  }, [socket])

  function handleAnswerCall(ans) {
    socket.emit("callAnswer", { from: caller.id, to: userId, ans })
    setIsReceivingCall(false)

    if (ans == "rejected") {
      stopCamera(streamRef)
      if (onCall) setOnCall(false)
    }
    else if (ans == "accepted") {
      setOnCall(true)

      startCamera()
        .then(stream => {
          streamRef.current = stream
          handleRemoteVidSend(stream)
          setLclStreamReady(true)
        })
        .catch(err => {
          console.log(err)
        })

    }
  }

  async function handleNotifiSubs() {

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return toast.warning("Notifications Are Disabled");
    toast.success("Notifications Are Enabled")
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_NOTI_PUBLIC_KEYS
    });

    api.post('/subscribe', { subscription, userId })
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        console.error(err)
      })

  }

  function handleCallEnd() {
    handleAnswerCall("rejected")
  }
  return (
    <>
      {
        onCall && lclStreamReady &&
        <CallSection name={caller.name} img={caller.pp} onEndCall={handleCallEnd} mineVid={streamRef} otherVid={callerStreamRef} />
      }
      {isReceivingCall && caller &&
        <CallPopUp img={caller.pp}
          name={caller.name} callAns={handleAnswerCall} />
      }
      <div className='navBar'>


        <Toaster richColors={true} />

        <Link to={`/${userId}/dashboard/home`} onClick={() => setSelectedTab('home')}
          className='h-full bg-amber-50 '>
          <img src="/logo.png" alt="logo" className='h-full w-auto'/>
        </Link>

        <ul className='center'>
          {
            navlinks.middle.map((ele, index) => {
              return <li key={index}>
                <NavLink to={`/${userId}/${ele.path}`}
                  className={({ isActive }) => (isActive ? 'active' : '')} end>
                  <ele.icon />
                </NavLink>
              </li>


            })
          }
        </ul >

        <ul className='end'>
          {
            navlinks.end.map((ele, index) => {
              return <li key={index}>{
                ele.path !== '' && <NavLink to={`/${userId}/${ele.path}`}
                  className={({ isActive }) => (isActive ? 'active' : '')} end>
                  <ele.icon />
                </NavLink>
              }{
                  ele.path === '' && <div
                    onClick={() => ele.id == "notifications" ? handleNotifiSubs() : setIsProfileIconClicked(prev => !prev)}
                  >
                    <ele.icon />
                    {isProfileIconClicked && <div><ProfileC classname='profileCMain' /></div>}
                  </div>
                }

              </li>


            })
          }

        </ul>

        <ul className='fourth' onClick={() => { setShowMobileSideBar(true) }}>
          <Menu />
        </ul>
        {
          showMobileSideBar && <div className='mobileSideNav'>
            <div className='middleMan' onClick={() => { setShowMobileSideBar(false); setIsProfileIconClicked(false) }}>
              <ul onClick={(e) => e.stopPropagation()}>
                <div className='backBtn' onClick={() => { setShowMobileSideBar(false) }}> <X /></div>
                <li className={selectedTab == 'home' ? 'active' : ""}>
                  <Link to={`/${userId}/dashboard/home`} onClick={() => { setSelectedTab('home') }}>
                    <House /> <div>Home</div>
                  </Link>
                </li>
                <li className={selectedTab == 'addFrnds' ? 'active' : ""}>
                  <Link to={`/${userId}/dashboard/addFriends`} onClick={() => { setSelectedTab('addFrnds') }} >
                    <UserPlus /> <div>Suggestions</div>
                  </Link>
                </li>
                <li className={selectedTab == 'game' ? 'active' : ""}>
                  <Link to={`/${userId}/dashboard/game`} onClick={() => { setSelectedTab('game') }}>
                    <Gamepad2 /><div>Games</div>
                  </Link>
                </li>
                <li className={selectedTab == 'frnds' ? 'active' : ""}>
                  <Link to={`/${userId}/dashboard/friends`} onClick={() => { setSelectedTab('frnds') }}>
                    <Users /> <div>Friends / Requests</div>
                  </Link>
                </li>
                <li >
                  <Link onClick={() => { setSelectedTab('notifications'); handleNotifiSubs() }}>
                    <BellRing /> <div>Notifications</div>
                  </Link>
                </li>
                <li className={selectedTab == 'chats' ? 'active' : ""}>
                  <Link to={`/${userId}/dashboard/messages`} onClick={() => { setSelectedTab('chats') }}>
                    <MessageCircle /> <div>Chats</div>
                  </Link>
                </li>
                <li onClick={() => { setIsProfileIconClicked(!isProfileIconClicked); setSelectedTab('Account') }} className={selectedTab == 'Account' ? 'active' : ""}>
                  <Link>
                    <div className='profilCHeader'>
                      <UserRoundPen />
                      <div>Profile</div>
                    </div>
                    {isProfileIconClicked && <ProfileC classname='profileCMainMbl' />}
                  </Link>

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