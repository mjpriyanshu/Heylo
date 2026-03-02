import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const {login, checkUsername} = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
      e.preventDefault();
      if(currState === "Sign up" && !isDataSubmitted) {
        // Check username availability before moving to bio step
        const isAvailable = await checkUsername(username);
        if(isAvailable) {
          setIsDataSubmitted(true);
        }
        return;
      }

      login(currState === "Sign up" ? "signup" : "login", {fullName, username, email, password, bio, agreedToTerms});
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-6 sm:gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl p-4'>
        {/* ---------left------------- */}
        <img src={assets.Heylo} className='w-32 sm:w-40 md:w-48' style={{filter: 'drop-shadow(2px 2px 0px black) drop-shadow(-2px -2px 0px black) drop-shadow(2px -2px 0px black) drop-shadow(-2px 2px 0px black)'}} />


        {/* ---------right------------ */}
        <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-5 sm:p-6 flex flex-col gap-4 sm:gap-6 rounded-lg shadow-lg w-full max-w-md'>
            <h2 className='font-medium text-xl sm:text-2xl flex justify-between items-center'>
              {currState} 
              {isDataSubmitted && <img onClick={()=>setIsDataSubmitted(false)} src={assets.arrow_icon} alt="arrowIcon" className='w-4 sm:w-5 cursor-pointer' /> }
              
            </h2>

            {currState === "Sign up" && !isDataSubmitted && (
              <>
                <input  onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base' placeholder='Full name (min 3 chars)' required minLength={3} maxLength={50} />
                
                <input  onChange={(e) => setUsername(e.target.value)} value={username} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base' placeholder='Username (3-20 chars, alphanumeric)' required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_-]+" title="Only letters, numbers, underscores, and hyphens allowed" />
              </>
            )}

            {!isDataSubmitted && (
              <>
                  <input onChange={(e) => setEmail(e.target.value)} value={email}
                   type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base'/>
                  
                  <div className='flex flex-col gap-1'>
                    <input onChange={(e) => setPassword(e.target.value)} value={password}
                     type="password" placeholder='Password (min 6 chars)' required minLength={6} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base'/>
                    
                    {currState === "Login" && (
                      <span 
                        onClick={() => navigate('/forgot-password')} 
                        className='text-violet-400 hover:text-violet-300 text-xs cursor-pointer self-end transition-colors'
                      >
                        Forgot Password?
                      </span>
                    )}
                  </div>
              </>
            )}


            {currState === "Sign up" && isDataSubmitted && (
                <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base' placeholder='Bio (max 200 chars)' required maxLength={200}></textarea>
            )}


            <button type='submit' className='py-2.5 sm:py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:from-purple-500 hover:to-violet-700 transition-all text-sm sm:text-base'>
              {currState === "Sign up" ? "Create Account" : "Login Now"}
            </button>

            {currState === "Sign up" && (
              <div className='flex items-start gap-2 text-xs sm:text-sm text-gray-300'>
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  className='cursor-pointer mt-1'
                />
                <p>I agree to the terms of use & privacy policy.</p>
              </div>
            )}

            <div className='flex flex-col gap-2'>
                {currState === "Sign up" ? (
                  <p className='text-gray-600 text-xs sm:text-sm'>
                      Already have an account? 
                      <span onClick={() => {setCurrState("Login"); setIsDataSubmitted(false); setAgreedToTerms(false);}} className='font-medium text-violet-500 cursor-pointer ml-1'>Login Here</span>
                  </p>
                ) : (
                  <p className='text-gray-600 text-xs sm:text-sm'>
                      Don't have an account?
                      <span onClick={() =>{setCurrState("Sign up"); setAgreedToTerms(false);}} className='font-medium text-violet-500 cursor-pointer ml-1'>Sign Up Here</span>
                  </p>
                )}
            </div>

        </form>
    </div>
    
  )
}

export default LoginPage