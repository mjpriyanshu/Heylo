import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const {login} = useContext(AuthContext);

  const onSubmitHandler = (e) => {
      e.preventDefault();
      if(currState === "Sign up" && !isDataSubmitted) {
        setIsDataSubmitted(true);
        return;
      }

      login(currState === "Sign up" ? "signup" : "login", {fullName, email, password, bio});
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
        {/* ---------left------------- */}
        {/* <img src={assets.Heylo} className='w-[min(30vw, 250px)]' /> */}
        <img src={assets.Heylo} className='w-148' style={{filter: 'drop-shadow(2px 2px 0px black) drop-shadow(-2px -2px 0px black) drop-shadow(2px -2px 0px black) drop-shadow(-2px 2px 0px black)'}} />


        {/* ---------right------------ */}
        <form onSubmit={onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
            <h2 className='font-medium text-2xl flex justify-between items-center'>
              {currState} 
              {isDataSubmitted && <img onClick={()=>setIsDataSubmitted(false)} src={assets.arrow_icon} alt="arrowIcon" className='w-5 cursor-pointer' /> }
              
            </h2>

            {currState === "Sign up" && !isDataSubmitted && (

              <input  onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Full name' required />
            )}

            {!isDataSubmitted && (
              <>
                  <input onChange={(e) => setEmail(e.target.value)} value={email}
                   type="email" placeholder='Email Address' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
                  
                  <input onChange={(e) => setPassword(e.target.value)} value={password}
                   type="password" placeholder='Password' required className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'/>
              </>
            )}


            {currState === "Sign up" && isDataSubmitted && (
                <textarea onChange={(e) => setBio(e.target.value)} value={bio} rows={4} className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500' placeholder='Bio' required ></textarea>
            )}


            <button type='submit' className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'>
              {currState === "Sign up" ? "Create Account" : "Login Now"}
            </button>

            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <input type="checkbox" />
              <p>Agree to terms of use & privacy policy.</p>
            </div>

            <div className='flex flex-col gap-2'>
                {currState === "Sign up" ? (
                  <p className='text-gray-600 text-sm'>
                      Already have an account? 
                      <span onClick={() => {setCurrState("Login"); setIsDataSubmitted(false)}} className='font-medium text-violet-500 cursor-pointer'>Login Here</span>
                  </p>
                ) : (
                  <p className='text-gray-600 text-sm'>
                      Don't have an account?
                      <span onClick={() =>{setCurrState("Sign up")}} className='font-medium text-violet-500 cursor-pointer'>Sign Up Here</span>
                  </p>
                )}
            </div>

        </form>
    </div>
    
  )
}

export default LoginPage