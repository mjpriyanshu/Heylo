import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'

const FriendManager = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('search'); // 'search', 'requests', 'sent'
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState('');
    
    const {
        searchUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        getFriendRequests,
        getSentRequests,
        friendRequests,
        sentRequests
    } = useContext(ChatContext);

    useEffect(() => {
        if(activeTab === 'requests') {
            getFriendRequests();
        } else if(activeTab === 'sent') {
            getSentRequests();
        }
    }, [activeTab]);

    const handleSearch = async () => {
        if(searchQuery.trim()) {
            setSearchError('');
            setSearchResults([]);
            
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/friends/search?query=${searchQuery}`, {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                });
                const data = await response.json();
                
                if(data.success) {
                    setSearchResults(data.users);
                    setSearchError('');
                } else {
                    setSearchResults([]);
                    setSearchError(data.message || 'No users found');
                }
            } catch (error) {
                setSearchError('Error searching users');
            }
        }
    };

    const handleKeyPress = (e) => {
        if(e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className='fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4'>
            <div className='bg-[#1a1429] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-2 border-gray-600'>
                {/* Header */}
                <div className='flex justify-between items-center p-4 border-b border-gray-600'>
                    <h2 className='text-xl font-semibold text-white'>Friend Manager</h2>
                    <button onClick={onClose} className='text-gray-400 hover:text-white text-2xl'>×</button>
                </div>

                {/* Tabs */}
                <div className='flex border-b border-gray-600'>
                    <button 
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'search' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400'}`}
                    >
                        Search Users
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'requests' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400'}`}
                    >
                        Requests ({friendRequests.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'sent' ? 'text-violet-500 border-b-2 border-violet-500' : 'text-gray-400'}`}
                    >
                        Sent ({sentRequests.length})
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4'>
                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div>
                            <div className='flex gap-2 mb-4'>
                                <input
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder='Search by username or name...'
                                    className='flex-1 bg-[#282142] text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500'
                                />
                                <button 
                                    onClick={handleSearch}
                                    className='bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg'
                                >
                                    Search
                                </button>
                            </div>

                            <div className='space-y-2'>
                                {searchResults.length === 0 && !searchError && (
                                    <div className='text-gray-400 text-center py-8'>
                                        <p>Search for users by:</p>
                                        <p className='text-sm mt-2'>• Exact username (e.g., @alex123)</p>
                                        <p className='text-sm'>• Name (public accounts only)</p>
                                    </div>
                                )}
                                
                                {searchError && (
                                    <p className='text-red-400 text-center py-8'>{searchError}</p>
                                )}
                                
                                {searchResults.map((user) => (
                                    <div key={user._id} className='flex items-center justify-between bg-[#282142] p-3 rounded-lg'>
                                        <div className='flex items-center gap-3'>
                                            <img 
                                                src={user.profilePic || assets.avatar_icon} 
                                                alt={user.fullName} 
                                                className='w-10 h-10 rounded-full'
                                            />
                                            <div>
                                                <p className='text-white font-medium'>{user.fullName}</p>
                                                <p className='text-violet-400 text-sm'>@{user.username}</p>
                                                {!user.isPublic && (
                                                    <p className='text-gray-500 text-xs'>🔒 Private</p>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                sendFriendRequest(user._id);
                                            }}
                                            className='bg-violet-600 hover:bg-violet-700 text-white px-4 py-1 rounded text-sm'
                                            disabled={sentRequests.some(req => req._id === user._id)}
                                        >
                                            {sentRequests.some(req => req._id === user._id) ? 'Sent' : 'Add Friend'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Received Requests Tab */}
                    {activeTab === 'requests' && (
                        <div className='space-y-2'>
                            {friendRequests.length === 0 ? (
                                <p className='text-gray-400 text-center py-8'>No pending friend requests</p>
                            ) : (
                                friendRequests.map((user) => (
                                    <div key={user._id} className='flex items-center justify-between bg-[#282142] p-3 rounded-lg'>
                                        <div className='flex items-center gap-3'>
                                            <img 
                                                src={user.profilePic || assets.avatar_icon} 
                                                alt={user.fullName} 
                                                className='w-10 h-10 rounded-full'
                                            />
                                            <div>
                                                <p className='text-white font-medium'>{user.fullName}</p>
                                                <p className='text-violet-400 text-sm'>@{user.username}</p>
                                                <p className='text-gray-400 text-xs'>{user.email}</p>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <button 
                                                onClick={() => acceptFriendRequest(user._id)}
                                                className='bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm'
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => rejectFriendRequest(user._id)}
                                                className='bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm'
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Sent Requests Tab */}
                    {activeTab === 'sent' && (
                        <div className='space-y-2'>
                            {sentRequests.length === 0 ? (
                                <p className='text-gray-400 text-center py-8'>No sent friend requests</p>
                            ) : (
                                sentRequests.map((user) => (
                                    <div key={user._id} className='flex items-center justify-between bg-[#282142] p-3 rounded-lg'>
                                        <div className='flex items-center gap-3'>
                                            <img 
                                                src={user.profilePic || assets.avatar_icon} 
                                                alt={user.fullName} 
                                                className='w-10 h-10 rounded-full'
                                            />
                                            <div>
                                                <p className='text-white font-medium'>{user.fullName}</p>
                                                <p className='text-violet-400 text-sm'>@{user.username}</p>
                                                <p className='text-gray-400 text-xs'>{user.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => cancelFriendRequest(user._id)}
                                            className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-sm'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FriendManager
