import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null)
  const [socket,setSocket]=useState(null)

  useEffect(() => {
    const userId=localStorage.getItem("userId")
    if(userId){
      socketRef.current = io(`${import.meta.env.VITE_API_FETCH_URL}`,{autoConnect: false});
      setSocket(socketRef.current)
    return () => {
      //socketRef.current.removeAllListeners();
      socketRef.current.disconnect(); 
    };
    }
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
