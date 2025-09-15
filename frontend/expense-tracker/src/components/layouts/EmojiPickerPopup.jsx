import EmojiPicker from 'emoji-picker-react';
import React, { useState } from 'react'
import { LuImage, LuX } from 'react-icons/lu';

function EmojiPickerPopup({icon, onSelect}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji) => {
    // Prefer imageUrl if provided by library; fallback to empty string
    onSelect(emoji?.imageUrl || "");
    setIsOpen(false);
  };

  return (
    <div className='flex flex-col md:flex-row items-start gap-5 mb-6'>
      {/* Trigger and popup are positioned relative to this wrapper to avoid layout shift */}
      <div className='relative'>
        <div
          className='flex items-center gap-4 cursor-pointer'
          onClick={() => setIsOpen(true)}
        >
          <div className='w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg'>
            {icon ? (
              <img src={icon} alt="Icon" className='w-12 h-12' />
            ) : (
              <LuImage />
            )}
          </div>
          <p>
            {icon ? "Change Icon" : "Pick Icon"}
          </p>
        </div>

        {isOpen && (
          <div className='absolute z-50 top-full left-0 mt-2 shadow-lg rounded-lg bg-white'>
            <button
              className='w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute top-2 right-2 z-10 cursor-pointer'
              onClick={() => setIsOpen(false)}
              aria-label='Close emoji picker'
              type='button'
            >
              <LuX />
            </button>
            <div className='max-h-[60vh] overflow-auto p-2'>
              <EmojiPicker
                open={isOpen}
                onEmojiClick={handleEmojiClick}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmojiPickerPopup
