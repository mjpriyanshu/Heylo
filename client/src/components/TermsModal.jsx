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
                <p>Welcome to Heylo. We are a real-time messaging platform designed to help you communicate and share images securely with your friends. By accessing or using our services, you agree to be bound by these terms.</p>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Account Responsibility</h3>
                <p>You are solely responsible for all activities that occur under your account. You agree to maintain the confidentiality of your account credentials and notify us immediately of any unauthorized use.</p>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Email Requirement</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>You must register using a real, accessible email address that belongs to you.</li>
                    <li>Using fake, temporary, or inaccessible email addresses may result in permanent loss of access to your account.</li>
                    <li>Critical features, such as account recovery and password resets, rely entirely on your ability to access your registered email.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Password & Security</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>Your security is our priority. All passwords are securely hashed and encrypted.</li>
                    <li>We never store or have access to your plain-text passwords.</li>
                    <li>You are expected to choose a strong password and keep it private to prevent unauthorized access.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>OAuth & Third-Party Logins</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>When you sign in using third-party providers (like Google or GitHub), you are authenticating directly through their secure systems.</li>
                    <li>Any password resets or security checks for OAuth accounts must be handled through the respective provider.</li>
                    <li>If you signed up via OAuth, you will not be able to log in using a manual password unless you explicitly configure a password in your Heylo account settings.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Privacy Notice</h3>
                <ul className='list-disc pl-5 space-y-1.5'>
                    <li>We collect only the essential data required to operate your account and provide our services.</li>
                    <li>Any images you share are uploaded and hosted securely through our trusted partner, Cloudinary.</li>
                    <li>Your private messages are strictly intended to remain private between you and your recipients.</li>
                    <li>We respect your privacy—your personal data is never intentionally sold or monetized.</li>
                </ul>
            </section>

            <section>
                <h3 className='text-violet-400 font-medium text-lg md:text-xl mb-2'>Content & Community Rules</h3>
                <p className='mb-2 text-gray-300'>To maintain a safe and welcoming environment, the following activities and content are strictly prohibited:</p>
                <ul className='list-disc pl-5 space-y-1.5 text-gray-400'>
                    <li>Sharing illegal content or engaging in unlawful activities.</li>
                    <li>Harassment, bullying, or targeted abuse of other users.</li>
                    <li>Spreading spam, unsolicited promotions, or malicious links.</li>
                    <li>Distributing malware, viruses, or harmful software.</li>
                    <li>Sharing highly sensitive, NSFW, or extremely abusive content.</li>
                </ul>
                <p className='mt-3 text-red-400 font-medium'>Please be aware that any violation of these rules may result in the immediate suspension or permanent termination of your account without notice.</p>
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
