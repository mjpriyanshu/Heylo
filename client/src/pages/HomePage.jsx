import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {

    const {selectedUser} = useContext(ChatContext);

  return (
    <div className='w-full h-screen px-2 py-2 sm:px-[10%] sm:py-[3%] md:px-[12%] md:py-[4%] lg:px-[15%] lg:py-[5%]'>
        
        <div className={`backdrop-blur-xl border-2 border-gray-600/50 rounded-2xl overflow-hidden h-full grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]'}`}>
            <Sidebar/>
            <ChatContainer/>
            <RightSidebar/>
        </div>
    
    </div>
  )
}

export default HomePage