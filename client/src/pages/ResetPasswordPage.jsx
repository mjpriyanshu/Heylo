import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import assets from '../assets/assets';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect to login after 2 seconds
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
        <h2 className='font-medium text-xl sm:text-2xl'>Reset Password</h2>
        
        <p className='text-gray-300 text-sm'>
          Enter your new password below.
        </p>

        <input
          type="password"
          placeholder="New password (min 6 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading || !token}
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed'
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading || !token}
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed'
        />

        <button 
          type="submit" 
          disabled={loading || !token}
          className='py-2.5 sm:py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer hover:from-purple-500 hover:to-violet-700 transition-all text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPasswordPage;
