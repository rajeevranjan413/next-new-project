'use client';

import React from 'react';
import './CardTodaySection.css'; // You can remove this import if it only contained the animation keyframes

const CardToday = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 pb-24 pt-12 flex flex-col md:flex-row items-center gap-16 overflow-hidden">
      
      {/* Left: Content */}
      <div className="flex-1 space-y-6 z-10">
        <h2 className="text-5xl md:text-6xl font-bold text-[#1a1c3d] leading-tight">
          Unlock your card <br />
          <span className="text-blue-600">Instantly</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-md leading-relaxed">
          Create a digital or physical Visa card in moments and enjoy seamless global transactions wherever you go.
        </p>
      </div>

      {/* Right: Single Image Composition */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative z-10 w-[280px] md:w-[400px]">
          <img 
            src="/assets/phone-combined.png" /* Replace with your actual single image path */
            alt="Mobile Wallet Interface Showcasing Payment Integration" 
            className="w-full h-auto"
          />
        </div>
      </div>
      
    </section>
  );
};

export default CardToday;