import React from 'react'

const TermsModal = ({ onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
      <div className='bg-[#1a142c] border border-gray-600 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden'>
        
        {/* Header */}
        <div className='p-4 md:p-5 border-b border-gray-600 flex justify-between items-center bg-[#140f23]'>
            <h2 className='text-xl md:text-2xl font-semibold text-white'>Terms of Use & Privacy Policy</h2>
            <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors text-3xl leading-none'>&times;</button>
        </div>

        {/* Content */}
        <div className='p-4 md:p-6 overflow-y-auto text-gray-300 space-y-6 text-sm md:text-base'>
            
            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Introduction</h3>
                <p>Explain that Heylo is a real-time messaging platform where users can communicate and share images securely.</p>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Account Responsibility</h3>
                <p>Tell users they are responsible for activities performed using their account.</p>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Real Email Requirement</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>Users should register using a real and accessible email address.</li>
                    <li>Fake or inaccessible emails may prevent account recovery.</li>
                    <li>Features like password reset depend on email access.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Password & Security</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>Passwords are encrypted/hashed securely.</li>
                    <li>The platform does not store plain-text passwords.</li>
                    <li>Users should keep credentials private.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>OAuth Login Notice</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>Users signing in with Google/GitHub authenticate through those providers.</li>
                    <li>Password reset for OAuth accounts is handled by the provider itself.</li>
                    <li>OAuth users may not be able to login using manual password authentication unless they separately create a password.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Privacy Notice</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>Only basic account data is stored.</li>
                    <li>Shared images are uploaded securely using Cloudinary.</li>
                    <li>Private messages are intended to remain private.</li>
                    <li>User data is never intentionally sold.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Content & Community Rules</h3>
                <p className='mb-2 text-gray-400'>Disallow:</p>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>Illegal content</li>
                    <li>Harassment</li>
                    <li>Spam</li>
                    <li>Malware</li>
                    <li>NSFW/extreme abusive content</li>
                </ul>
                <p className='mt-3 text-red-400 font-medium'>Mention accounts may be suspended for misuse.</p>
            </section>

        </div>

        {/* Footer */}
        <div className='p-4 md:p-5 border-t border-gray-600 bg-[#140f23] text-center'>
            <p className='text-gray-400 italic mb-4 font-medium'>By creating an account, you agree to follow these rules and use Heylo responsibly.</p>
            <button 
                onClick={onClose}
                className='px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors'
            >
                Close
            </button>
        </div>

      </div>
    </div>
  )
}

export default TermsModal
