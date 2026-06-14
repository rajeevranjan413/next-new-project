'use client';

import React, { useState, useEffect } from 'react';
import { useWalletModal } from '../../context/WalletModalContext';

const StickyBanner = () => {
  const { openModal } = useWalletModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure the site has loaded before the slide-in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 transition-all duration-700 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-3xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Text Content */}
        <div className="flex flex-col">
          <h4 className="text-lg font-bold text-slate-900">Get your card</h4>
          <p className="text-sm text-slate-500 whitespace-nowrap">
            Issuance $1 • Instant payments
          </p>
        </div>

        {/* Center: Badges (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-3">
          <span className="px-4 py-2 bg-gray-100 text-slate-600 text-xs font-semibold rounded-full">
            Easy issuance
          </span>
          <span className="px-4 py-2 bg-gray-100 text-slate-600 text-xs font-semibold rounded-full">
            No KYC
          </span>
        </div>

        {/* Right: Action Button */}
        <button 
          onClick={openModal}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Get card
        </button>
      </div>
    </div>
  );
};

export default StickyBanner;