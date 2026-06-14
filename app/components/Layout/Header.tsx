'use client';

import React from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import { useWalletModal } from '../../context/WalletModalContext';

const Header = () => {
  const { openModal } = useWalletModal();
  const navLinks = [
    { name: 'Home', active: true },
    { name: 'Privileges', active: false },
    { name: 'FAQ', active: false },
    { name: 'Join', active: false },
  ];

  return (
    <nav className="flex items-center justify-between md:px-10 p-4 md:py-6 bg-white">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 ">
        <Shield className="h-6 w-6 md:w-8 md:h-8 text-blue-600" strokeWidth={2} />
        <span className="text-lg md:text-xl font-semibold tracking-tight text-blue-600">TRUST</span>
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-8 ">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={`#${link.name.toLowerCase()}`}
            className={`relative text-sm font-medium transition-colors ${
              link.active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {link.name}
            {link.active && (
              <span className="absolute -bottom-[6px] left-0 w-full h-0.5 bg-blue-600" />
            )}
          </a>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
          <img 
            src="https://flagcdn.com/us.svg" 
            alt="US Flag" 
            className="w-5 h-3.5 object-cover rounded-sm"
          />
          <span className="text-sm font-semibold text-slate-700">EN</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {/* CTA Button */}
        <button 
          onClick={openModal}
          className="py-2 px-4 md:px-6 md:py-3 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg"
        >
          Get Your Card
        </button>
      </div>
    </nav>
  );
};

export default Header;