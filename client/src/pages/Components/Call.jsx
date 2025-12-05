import { Video,Phone } from "lucide-react"


const Call = () => {

    function handleAudioCall(){
        
        return; 
    }
    function handleVidCall(){
        return ;
    }
  return (
    <div>
        <Video strokeWidth="1px" className="videoCallIcon" onClick={handleVidCall}/>
        <Phone strokeWidth="1px" className="audioCallIcon" onClick={handleAudioCall}/>
    </div>
  )
}

export default Call