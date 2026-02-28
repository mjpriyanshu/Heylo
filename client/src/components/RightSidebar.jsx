import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext';
import ImageViewer from './ImageViewer';

const RightSidebar = () => {

  const {selectedUser, messages} = useContext(ChatContext);
  const {logout, onlineUsers} = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [viewingImage, setViewingImage] = useState(null);


  //Get all images from messages and set them to state
  useEffect(()=> {
      setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));
  },[messages])


  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? 'max-md:hidden' : ''}`}>

        <div className='pt-10 md:pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
            <img 
              src={selectedUser?.profilePic || assets.avatar_icon} 
              alt="AvatarIcon" 
              className='w-16 md:w-20 aspect-square rounded-full cursor-pointer hover:opacity-80 transition-opacity' 
              onClick={() => setViewingImage(selectedUser?.profilePic || assets.avatar_icon)}
              title="View profile picture"
            />

            <h1 className='px-6 md:px-10 text-lg md:text-xl font-medium mx-auto flex items-center gap-2'>
                {onlineUsers.includes(selectedUser._id) && 
                <p className='w-2 h-2 rounded-full bg-green-500'></p>
              }
              {selectedUser.fullName}
            </h1>
            <p className='px-6 md:px-10 mx-auto text-center'>{selectedUser.bio}</p>
        </div>

        <hr className='border-[#ffffff50] my-4' />

        <div className='px-4 md:px-5 text-xs'>
            <p>Media</p>
            <div className='mt-2 max-h-[180px] md:max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-2 md:gap-4 opacity-80'>
                {msgImages.map((url, index) => (
                  <div 
                    key={index} 
                    onClick={() => setViewingImage(url)} 
                    className='cursor-pointer rounded hover:opacity-80 transition-opacity'
                  >
                      <img src={url} alt="" className='h-full w-full object-cover rounded-md'/>
                  </div>
                ))}
            </div>
        </div>

        <button onClick={() => logout()}
        className='absolute bottom-4 md:bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-xs md:text-sm font-light py-2 px-12 md:px-20 rounded-full cursor-pointer hover:from-purple-500 hover:to-violet-700 transition-all'>
              Logout
        </button>

        {/* Image Viewer Modal */}
        {viewingImage && <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
    </div>
  )
}

export default RightSidebar