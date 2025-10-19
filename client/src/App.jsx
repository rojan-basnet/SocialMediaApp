import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import SignIn from './pages/SignIn.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AddFriends from './pages/AddFriends.jsx'
import Friends from './pages/Friends.jsx'
import Messages from './pages/Messages.jsx'
import HomePage from './pages/HomePage.jsx'
import Profile from './pages/Profile.jsx'
import OtherProfile from './pages/OtherProfile.jsx'
import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/:userId/dashboard' element={<Dashboard/>}/>
        <Route path='/signIn' element={<SignIn/>}/>
        <Route path='/logIn' element={<Login/>}/>
        <Route path='/:userId/dashboard/addFriends' element={<AddFriends/>}/>
        <Route path='/:userId/dashboard/friends' element={<Friends/>}/>
        <Route path='/:userId/dashboard/messages' element={<Messages/>}/>
        <Route path='/:userId/dashboard/home' element={<HomePage/>}/>
        <Route path='/:userId/dashboard/profile' element={<Profile/>}/>
        <Route path='/:userId/dashboard/:otherId' element={<OtherProfile/>}/>
      </Routes>
    </>
  )
}

export default App
