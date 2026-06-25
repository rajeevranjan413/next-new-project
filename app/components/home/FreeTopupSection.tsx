'use client';

import React from 'react';
// import './FreeTopupSection.css'; // You can remove this if it only contained the float animations

const FreeTopUp = () => {
    return (
        <section className="max-w-7xl mx-auto px-8 pb-24 flex flex-col md:flex-row-reverse items-center gap-16 overflow-hidden">
            
            {/* Right: Content */}
            <div className="flex-1 space-y-6 z-10 text-left">
                <h2 className="text-5xl md:text-6xl font-bold text-[#1a1c3d] leading-tight">
                    Zero-fee crypto & <br />
                    <span className="text-blue-600">reloads</span>
                </h2>
                <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                    Add funds effortlessly with rapid transaction speeds and entirely fee-free transfers.
                </p>
            </div>

            {/* Left: Single Image Composition */}
            <div className="flex-1 flex justify-center items-center scale-90 md:scale-100">
                
                {/* Main Combined Image */}
                <div className="relative z-10 w-[320px] md:w-[450px]">
                    <img 
                        src="/assets/phone-5-combined.png" /* Replace with your actual single image path */
                        alt="Zero Fee Cryptocurrency Deposit Interface" 
                        className="w-full h-auto"
                    />
                </div>

            </div>
        </section>
    );
};

export default FreeTopUp;