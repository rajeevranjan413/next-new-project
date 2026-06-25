'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { useWalletModal } from '../../context/WalletModalContext';

const Footer = () => {
  const { openModal } = useWalletModal();
  return (
    <footer className="w-full bg-white py-10 px-8 border-t border-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight text-blue-600 uppercase">
            Trust
          </span>
        </div>

        {/* Center: Copyright */}
        <div className="text-slate-400 text-sm font-medium">
          ©2026 TrustCard All Rights Reserved
        </div>

        {/* Right: CTA Button */}
        <button 
          onClick={openModal}
          className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
          Get Your Card
        </button>
        
      </div>
    </footer>
  );
};

export default Footer;