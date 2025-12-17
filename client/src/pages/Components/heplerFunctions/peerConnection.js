let pc;

import { startCamera } from "./startCam";
export const startPeerConnection=async (socket)=>{
    startP2PConn()

    const stream=await startCamera()
    handleMineVidSend(stream)
    // ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("candidate", event.candidate);
        }
    };


    pc.ontrack = (event) => {
        console.log({event},"track from receiver remote vid")
    };

    const offer = await pc.createOffer();
    socket.emit("offer", offer);
    await pc.setLocalDescription(offer);


    return stream;
    
}
function startP2PConn(){
    if(!pc){
        pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });
    }

}


export const handleRemoteVidSend=async (stream)=>{
    console.log("sending receiver vid")
    if(!pc) startP2PConn()
    stream.getTracks().forEach(track=>{
        pc.addTrack(track, stream);
    })
}

export const handleMineVidSend=async (stream)=>{
    console.log("sending caller vid")
    stream.getTracks().forEach(track=>{
        pc.addTrack(track, stream);
    })
}


export const receiveIceCandidate=async (data)=>{
    let pendingCandidate=[];

    const candidate=data.candidate

    if(!pc) startP2PConn()
    if (!candidate) return console.log("no ice candidates");
    try {
        const iceCandidateInit = {
            candidate: data.candidate,
            sdpMid: data.sdpMid,
            sdpMLineIndex: data.sdpMLineIndex
        };
        if(pc.remoteDescription){
            await pc.addIceCandidate(new RTCIceCandidate(iceCandidateInit));

            for (const candidate of pendingCandidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pendingCandidate = [];
        }else pendingCandidate.push(iceCandidateInit)
    } catch (e) {
        console.error("Error adding ICE candidate:", e);
    }


}

export const showCallerVid=(vid)=>{

}

export const handleOffer=async(offer,socket,callerStreamRef)=>{

    startP2PConn()

    pc.onicecandidate = event => {
        if (event.candidate) {
            socket.emit("candidate", event.candidate);
        }
    };

    pc.ontrack = (event) => {
        console.log("Tracks received from caller:", event.streams[0]);
        callerStreamRef.current=event.streams[0]
        //showCallerVid(event.streams[0]);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", answer);
}

export const handleAnswer=async(answer)=>{
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
}