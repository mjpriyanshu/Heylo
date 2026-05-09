import React, { useContext, useState } from 'react'
import {useNavigate} from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../lib/cloudinary';

const ProfilePage = () => {

  const {authUser, updateProfile} = useContext(AuthContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [username, setUsername] = useState(authUser.username || '');
  const [bio, setBio] = useState(authUser.bio);
  const [isPublic, setIsPublic] = useState(authUser.isPublic !== false); // Default true

  // Calculate days until username can be changed
  const getDaysUntilUsernameChange = () => {
    if(!authUser.lastUsernameChange) return 0;
    const daysSinceChange = Math.floor((Date.now() - new Date(authUser.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = 30 - daysSinceChange;
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const canChangeUsername = getDaysUntilUsernameChange() === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!selectedImage){
      await updateProfile({fullName: name, username, bio, isPublic});
      navigate('/');
      return;
    }

    const toastId = toast.loading('Uploading profile image...');
    try {
      const imageUrl = await uploadImageToCloudinary(selectedImage);
      await updateProfile({ fullName: name, username, bio, profilePic: imageUrl, isPublic });
      navigate('/');
    } catch (error) {
      toast.error(error?.message || 'Failed to upload profile image');
    } finally {
      toast.dismiss(toastId);
    }

  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4'>

        {/* -----------left--------------- */}
        <div className='w-full max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4 md:gap-5 p-6 md:p-10 flex-1 w-full'>
            <div className='flex items-center gap-3'>
              <img onClick={() => navigate('/')} src={assets.arrow_icon} alt="Back" className='md:hidden w-6 cursor-pointer'/>
              <h3 className='text-base md:text-lg'>Profile Details</h3>
            </div>


            <label htmlFor="avatar" className='flex items-center gap-3 text-sm md:text-base cursor-pointer'>
              <input onChange={(e) => setSelectedImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
              <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} alt="avatarIcon" className={`w-10 h-10 md:w-12 md:h-12 ${selectedImage && 'rounded-full'}`} />
              Upload Profile Image
            </label>

            <input onChange={(e) => setName(e.target.value)} value={name}
             type="text" required placeholder='Your Name (min 3 chars)' minLength={3} maxLength={50} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm md:text-base' />
          
            <div>
              <input 
                onChange={(e) => setUsername(e.target.value)} 
                value={username}
                type="text" 
                required 
                placeholder='Username (3-20 chars)' 
                disabled={!canChangeUsername}
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Only letters, numbers, underscores, and hyphens allowed"
                className={`w-full p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm md:text-base ${!canChangeUsername && 'opacity-50 cursor-not-allowed'}`} 
              />
              {!canChangeUsername && (
                <p className='text-[10px] md:text-xs text-yellow-400 mt-1'>
                  Username can be changed in {getDaysUntilUsernameChange()} days
                </p>
              )}
            </div>

            <textarea
            onChange={(e) => setBio(e.target.value)} value={bio}
            placeholder='Write Profile Bio (max 200 chars)' required maxLength={200} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm md:text-base' rows={4}></textarea>

            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input 
                  type="checkbox" 
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className='w-4 h-4 cursor-pointer'
                />
                <span className='text-xs md:text-sm'>Public Account</span>
              </label>
              <span className='text-[10px] md:text-xs text-gray-400'>
                {isPublic ? '(Searchable by name & username)' : '(Searchable by username only)'}
              </span>
            </div>

            <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-base md:text-lg cursor-pointer hover:from-purple-500 hover:to-violet-700 transition-all'>Save</button>

          </form>
          
          {/* ------------right--------------- */}
          <img className={`w-32 h-32 md:w-44 md:h-44 aspect-square rounded-full mx-6 md:mx-10 my-6 max-sm:mt-10 object-cover ${selectedImage && 'rounded-full'}`} src={authUser?.profilePic || assets.logo_icon} alt="" />
        </div>


       
    </div>
  )
}


export default ProfilePage