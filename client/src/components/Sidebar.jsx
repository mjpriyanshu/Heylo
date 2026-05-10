import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import FriendManager from './FriendManager'

const Sidebar = () => {

  const {getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages, getFriendRequests, friendRequests} = useContext(ChatContext);
  const {logout, onlineUsers, authUser} = useContext(AuthContext);

  
  const [input, setInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFriendManager, setShowFriendManager] = useState(false);
  const filteredUsers = input ? users.filter(user => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

  useEffect(()=> {
    if (!authUser?._id) return;
    getUsers();
    getFriendRequests();
  },[authUser?._id])

  const navigate = useNavigate();


  return (
    <div className={`bg-[#8185B2]/10 h-full p-3 md:p-5 rounded-l-2xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
        <div className='pb-4 md:pb-5'>
            <div className='flex justify-between items-center'>
              {/* Logo */}
              <img src={assets.HeyloLogo} alt="logo" className='w-32 sm:w-36 md:max-w-40' />  
              
              <div className='flex items-center gap-2 md:gap-3'>
                {/* Profile Picture - Click to Edit */}
                <img 
                  src={authUser?.profilePic || assets.avatar_icon} 
                  alt="profile" 
                  onClick={() => navigate('/profile')}
                  className='w-7 h-7 md:w-8 md:h-8 rounded-full cursor-pointer border-2 border-violet-500 hover:border-violet-400 transition-all' 
                  title="Edit Profile"
                />
                
                {/* Menu Icon */}
                <div className='relative py-2 group'>
                    <img 
                      src={assets.menu_icon} 
                      alt="menuIcon" 
                      className='h-4 md:max-h-5 cursor-pointer' 
                      onClick={() => setShowMenu(!showMenu)}
                    />

                    <div className={`absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 ${showMenu ? 'block' : 'hidden group-hover:block'}`}>
                      <p onClick={() => {navigate('/profile'); setShowMenu(false);}} className='cursor-pointer text-sm'>Edit Profile</p>
                      <hr  className='my-2 border-t border-gray-500'/>
                      <p onClick={()=>{logout(); setShowMenu(false);}} className='cursor-pointer text-sm'>Logout</p>
                    </div>
                
                </div>
              </div>
            </div>

            {/* Add Friends Button */}
            <div className='mt-2 md:mt-3 relative'>
              <button 
                onClick={() => setShowFriendManager(true)}
                className='w-full bg-violet-600 hover:bg-violet-700 text-white py-1.5 md:py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-2 transition-all'
              >
                Add Friends
                {friendRequests.length > 0 && (
                  <span className='bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center'>
                    {friendRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search Box */}
            <div className='bg-[#282142] rounded-full flex items-center gap-2 py-2 md:py-3 px-3 md:px-4 mt-3 md:mt-5'>
              <img src={assets.search_icon} alt="searchIcon" className='w-3' />
              <input onChange={(e)=>setInput(e.target.value)}
               type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search Friends...' />
            </div>

        </div>

        {/* To show Users (Friends Only) */}
        <div className='flex flex-col'>
          {filteredUsers.length === 0 ? (
            <div className='text-center py-6 md:py-8'>
              <p className='text-gray-400 text-xs md:text-sm'>No friends yet</p>
              <p className='text-gray-500 text-[10px] md:text-xs mt-2'>Add friends to start chatting!</p>
            </div>
          ) : (
            filteredUsers.map((user,index) => (
              <div onClick={() => {setSelectedUser(user),setUnseenMessages(prev => ({...prev, [user._id]: 0}))}}
              key={index} className={`relative flex items-center gap-2 p-2 pl-3 md:pl-4 rounded cursor-pointer text-sm md:text-base ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
                  <img src={user?.profilePic || assets.avatar_icon} alt="avatarIcon" className='w-8 h-8 md:w-[35px] md:h-[35px] aspect-square rounded-full' />

                  <div className='flex flex-col leading-tight md:leading-5'>
                      <p className='text-sm md:text-base'>{user.fullName}</p>
                      {
                          onlineUsers.includes(user._id)
                          ? <span className='text-green-400 text-[10px] md:text-xs'>Online</span>
                          : <span className='text-neutral-400 text-[10px] md:text-xs'>Offline</span>
                      }
                  </div>

                  {unseenMessages[user._id] > 0 && <p className='absolute top-3 md:top-4 right-3 md:right-4 text-[10px] md:text-xs h-4 w-4 md:h-5 md:w-5 flex justify-center items-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}

              </div>
            ))
          )}
        </div>

        {/* Friend Manager Modal */}
        {showFriendManager && <FriendManager onClose={() => setShowFriendManager(false)} />}

    </div>
  )
}

export default Sidebar