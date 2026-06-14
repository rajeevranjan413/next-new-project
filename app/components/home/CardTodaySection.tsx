import React from 'react';
import './CardTodaySection.css';

const CardToday = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center gap-16 overflow-hidden">
      
      {/* Left: Content */}
      <div className="flex-1 space-y-6 z-10">
        <h2 className="text-5xl md:text-6xl font-bold text-[#1a1c3d] leading-tight">
          Get your card <br />
          <span className="text-blue-600">Today</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-md leading-relaxed">
          Issue a virtual or metal Visa card in minute and start spending worldwide.
        </p>
      </div>

      {/* Right: Multi-Image Composition */}
      <div className="flex-1 relative flex justify-center items-center py-20">
        
        {/* Main Mobile Image */}
        <div className="relative z-10 w-[280px] md:w-[320px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]">
          <img 
            src="/assets/phone-4.svg" 
            alt="Trust Wallet Mobile App" 
            className="w-full h-auto"
          />
        </div>

        {/* Floating Logo 1: Google Pay (Top Left) */}
        <div className="absolute top-10 left-0 md:left-10 z-20 animate-float-slow">
          <img 
            src="/assets/badge-gpay.svg" 
            alt="Google Pay" 
            className="w-20 md:w-24 h-auto drop-shadow-lg transform -rotate-12"
          />
        </div>

        {/* Floating Logo 2: ATM/Visa (Top Right) */}
        <div className="absolute top-0 right-0 md:right-10 z-20 animate-float">
          <img 
            src="/assets/badge-atm.svg" 
            alt="ATM Visa" 
            className="w-20 md:w-24 h-auto drop-shadow-lg transform rotate-12"
          />
        </div>

        {/* Floating Logo 3: Apple Pay (Bottom Right) */}
        <div className="absolute bottom-20 right-0 md:-right-4 z-20 animate-float-delayed">
          <img 
            src="/assets/badge-applepay.svg" 
            alt="Apple Pay" 
            className="w-20 md:w-24 h-auto drop-shadow-lg transform rotate-6"
          />
        </div>
      </div>
    </section>
  );
};

export default CardToday;