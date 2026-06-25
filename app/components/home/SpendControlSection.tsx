'use client';

import React from 'react';

const SpendControlSection = () => {
    return (
        <section className="max-w-7xl mx-auto px-8 pb-24 flex flex-col md:flex-row items-center gap-16 overflow-visible font-sans">
            
            {/* Left Content Area */}
            <div className="flex-1 space-y-6 z-10">
                <h2 className="text-5xl md:text-6xl font-bold text-[#1a1c3d] leading-tight">
                    Pay with <br />
                    <span className="text-blue-600">Total oversight</span>
                </h2>
                <p className="text-slate-500 text-lg max-w-md leading-relaxed">
                    Make purchases digitally, at physical retailers, or internationally while monitoring each payment instantly.
                </p>
            </div>

            {/* Right: Single Image Composition */}
            <div className="flex-1 flex justify-center items-center">
                
                {/* Main Combined Image */}
                <div className="relative z-10 w-[320px] md:w-[450px]">
                    <img 
                        src="assets/phone-6-combined.png" /* Replace with your actual single image path */
                        alt="Expense Management and Transaction Tracking Interface" 
                        className="w-full h-auto"
                    />
                </div>

            </div>
        </section>
    );
};

export default SpendControlSection;