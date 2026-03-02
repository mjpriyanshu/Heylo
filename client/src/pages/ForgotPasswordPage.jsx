import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import assets from '../assets/assets';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setEmail('');
        // Redirect to login after showing message
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-6 sm:gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl p-4'>
      {/* Logo */}
      <img 
        src={assets.Heylo} 
        className='w-32 sm:w-40 md:w-48' 
        style={{filter: 'drop-shadow(2px 2px 0px black) drop-shadow(-2px -2px 0px black) drop-shadow(2px -2px 0px black) drop-shadow(-2px 2px 0px black)'}} 
      />

      {/* Form */}
      <form 
        onSubmit={handleSubmit} 
        className='border-2 bg-white/8 text-white border-gray-500 p-5 sm:p-6 flex flex-col gap-4 sm:gap-6 rounded-lg shadow-lg w-full max-w-md'
      >
        <h2 className='font-medium text-xl sm:text-2xl'>Forgot Password</h2>
        
        <p className='text-gray-300 text-sm'>
          Enter your email address and we'll send you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed'
        />

        <button 
          type="submit" 
          disabled={loading}
          className='py-2.5 sm:py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:from-purple-500 hover:to-violet-700 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className='text-gray-300 hover:text-violet-400 text-sm transition-colors'
        >
          ← Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
