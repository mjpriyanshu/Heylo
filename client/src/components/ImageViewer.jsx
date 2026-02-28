import React from 'react'
import assets from '../assets/assets'

const ImageViewer = ({ imageUrl, onClose }) => {
  return (
    <div 
      className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div className='relative max-w-[90vw] max-h-[90vh]'>
        <img 
          src={imageUrl} 
          alt="Full view" 
          className='max-w-full max-h-[90vh] object-contain rounded-lg'
          onClick={(e) => e.stopPropagation()}
        />
        <button 
          onClick={onClose}
          className='absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all'
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default ImageViewer
