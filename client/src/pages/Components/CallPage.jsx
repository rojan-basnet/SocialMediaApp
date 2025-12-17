import { Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import "./CallPage.css";
import { useState,useRef,useEffect } from "react";
import VidSkel from "./VidSkel";

export default function CallSection({ name, img, onEndCall,status,mineVid ,otherVid}) {

  const videoRef=useRef(null)
  const otherVedioRef =useRef(null)
  const [micOn,setMicOn]=useState(true)
  const [videoOn,setVideoON]=useState(false)
  
useEffect(() => {

  if(mineVid?.current && videoRef.current){
    videoRef.current.srcObject = mineVid.current;
  }
  console.log({otherVid,otherVedioRef,videoRef})
  if(otherVid?.current && otherVedioRef.current){

    console.log(otherVid.current)
    otherVedioRef.current.srcObject = otherVid.current;
  }
}, [mineVid,otherVid]);

function showStatusMessage(state){
if(state=="pending"){
  return "Connecting..."
}else if(state=="accepted"){
  return "On Call"
}else if(state=="rejected"){
  return "Call declined !"
}

}
  return (
    <div className="call-section">
      <div className="call-header">
        <div className="caller-avatar">
          <img src={img} alt={`${name}'s avatar`} />
        </div>
        <div className="caller-info">
          <h2>{name}</h2>
          <span>{showStatusMessage(status)}</span>
        </div>
      </div>
      <div className="mineVid">
        {
          mineVid ? <video ref={videoRef} autoPlay playsInline muted />:<VidSkel/>
        }
        
      </div>
      <div className="otherUserVideo">
        {
          otherVid ? <video ref={otherVedioRef} autoPlay playsInline />:<VidSkel/>
        }
      </div>

      <div className="call-controls">
        <button className="control-btn" onClick={()=>setMicOn(prev=>!prev)}>
          {micOn ?<Mic size={24} />:<MicOff size={24} />}
        </button>
        <button className="control-btn" onClick={()=>setVideoON(prev=>!prev)}>
          {videoOn ? <Video size={24} /> :<VideoOff size={24} />}
        </button>
        <button className="control-btn end-call" onClick={onEndCall}>
          <X size={28} />
        </button>
      </div>

    </div>
  );
}
