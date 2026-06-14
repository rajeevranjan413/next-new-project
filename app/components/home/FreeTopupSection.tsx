import React from 'react';
import './FreeTopupSection.css';

const FreeTopUp = () => {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row-reverse items-center gap-16 overflow-hidden">
      
      {/* Right: Content */}
      <div className="flex-1 space-y-6 z-10 text-left">
        <h2 className="text-5xl md:text-6xl font-bold text-[#1a1c3d] leading-tight">
          Free crypto & <br />
          <span className="text-blue-600">top-up</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-md leading-relaxed">
          Easy top up, Fast processing. 0% commission.
        </p>
      </div>

      {/* Left: Multi-Image Composition with 5 Floating Coins */}
      <div className="flex-1 relative flex justify-center items-center py-20 scale-90 md:scale-100">
        
        {/* Main Mobile Image (QR Code Screen) */}
        <div className="relative z-10 w-[260px] md:w-[300px] drop-shadow-2xl">
          <img 
            src="/assets/phone-5.svg" 
            alt="Trust Wallet Receive Crypto" 
            className="w-full h-auto"
          />
        </div>

        {/* Floating Coin 1: Tether/USDT (Top Right) */}
        <div className="absolute top-0 -right-4 z-20 animate-float">
          <img 
            src="/assets/coin-1.svg" 
            alt="USDT Coin" 
            className="w-24 md:w-28 h-auto drop-shadow-xl transform rotate-12"
          />
        </div>

        {/* Floating Coin 2: TON/Telegram (Middle Left) */}
        <div className="absolute top-1/3 -left-8 z-20 animate-float-slow">
          <img 
            src="/assets/coin-2.svg" 
            alt="TON Coin" 
            className="w-16 md:w-20 h-auto drop-shadow-xl transform -rotate-12"
          />
        </div>

        {/* Floating Coin 3: Dollar/Cash (Middle Right) */}
        <div className="absolute bottom-1/3 -right-6 z-20 animate-float-delayed">
          <img 
            src="/assets/coin-3.svg" 
            alt="Dollar Coin" 
            className="w-20 md:w-24 h-auto drop-shadow-xl transform rotate-6"
          />
        </div>

        {/* Floating Coin 4: Ruble (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 animate-float">
          <img 
            src="/assets/coin-4.svg" 
            alt="Ruble Coin" 
            className="w-20 md:w-24 h-auto drop-shadow-xl transform -rotate-45"
          />
        </div>

        {/* Floating Coin 5: Ethereum (Bottom Center/Right) */}
        <div className="absolute -bottom-8 right-1/4 z-20 animate-float-slow">
          <img 
            src="/assets/coin-5.svg" 
            alt="Ethereum Coin" 
            className="w-24 md:w-28 h-auto drop-shadow-xl transform rotate-12"
          />
        </div>
      </div>
    </section>
  );
};

export default FreeTopUp;