import { useContext,createContext,useState } from "react";
const TabsGlobalState=createContext()

export const GlobalProvider=(({children})=>{
    const [selectedTab,setSelectedTab]=useState('home')

  return (
    <TabsGlobalState.Provider value={{ selectedTab, setSelectedTab }}>
      {children}
    </TabsGlobalState.Provider>
  );
})
export const useGlobalState=()=>useContext(TabsGlobalState)