'use client';

import React, { useState, useEffect } from 'react';
import { useWalletModal } from '../../context/WalletModalContext';

const VoucherPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const { openModal } = useWalletModal();

    // Show popup shortly after the user visits the page
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000); 
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        // Wait for the exit animation to finish before removing from DOM
        setTimeout(() => setIsVisible(false), 300); 
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'bg-transparent backdrop-blur-none' : 'bg-[#0b101b]/80 backdrop-blur-md'}`}>
            
            {/* Modal Container */}
            <div className={`relative w-full max-w-[28rem] bg-gradient-to-br from-[#1a233a] to-[#0f1626] rounded-3xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)] transition-all duration-300 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                
                {/* Subtle outer glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl -z-10"></div>

                {/* Floating Premium Badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 px-6 py-1.5 rounded-full text-xs sm:text-sm font-extrabold tracking-widest uppercase border-4 border-[#1a233a] shadow-lg shadow-amber-500/20 whitespace-nowrap z-20">
                    Voucher Alert
                </div>

                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all p-1.5 rounded-full backdrop-blur-sm z-20"
                    aria-label="Close popup"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="flex flex-col sm:flex-row items-center p-8 pt-12 gap-8 relative overflow-hidden rounded-3xl">
                    
                    {/* Decorative interior glow */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Left Side: The Voucher Graphic */}
                    <div className="flex-shrink-0 relative w-36 flex flex-col items-center drop-shadow-2xl hover:-translate-y-1 transition-transform duration-300 z-10">
                        
                        {/* Ambient glow behind ticket */}
                        <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"></div>
                        
                        {/* Top half of ticket */}
                        <div className="w-full bg-gradient-to-b from-[#f8f9fa] to-[#e9ecef] rounded-t-2xl p-5 flex flex-col items-center text-center relative overflow-hidden border-x border-t border-white shadow-inner">
                            {/* Gold Shield */}
                            <div className="text-amber-500 mb-3 drop-shadow-md">
                                <svg width="46" height="46" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M12 11l-3 3h2v4h2v-4h2l-3-3z" fill="#1e293b" />
                                </svg>
                            </div>
                            <span className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-1">100</span>
                            <span className="text-sm font-bold text-slate-500 tracking-widest">USDT</span>
                        </div>
                        
                        {/* Ticket Divider */}
                        <div className="w-full h-0 border-t-[3px] border-dashed border-slate-300 relative bg-[#e9ecef]">
                            <div className="absolute -left-3 -top-2.5 w-5 h-5 bg-[#1a233a] rounded-full shadow-inner border-r border-white/10"></div>
                            <div className="absolute -right-3 -top-2.5 w-5 h-5 bg-[#1a233a] rounded-full shadow-inner border-l border-white/10"></div>
                        </div>

                        {/* Bottom half of ticket */}
                        <div className="w-full bg-gradient-to-b from-blue-600 to-blue-700 rounded-b-2xl py-3.5 px-2 flex items-center justify-center gap-2 text-white border-x border-b border-blue-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span className="text-xs font-bold tracking-wider uppercase">Trust Wallet</span>
                        </div>
                    </div>

                    {/* Right Side: Text Content */}
                    <div className="flex-1 text-center sm:text-left space-y-4 relative z-10">
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300 leading-tight mb-2">
                                Exclusive <br className="hidden sm:block" />100 USDT
                            </h3>
                            <p className="text-blue-400 font-medium text-sm tracking-wide uppercase">Welcome Voucher</p>
                        </div>
                        
                        <p className="text-slate-400 text-sm leading-relaxed font-light">
                            Claim your bonus automatically upon successful card activation.
                        </p>
                        
                        {/* Premium CTA Button */}
                        <button 
                            onClick={() => {
                                handleClose();
                                setTimeout(() => openModal(), 300); // Open wallet modal after popup closes
                            }}
                            className="group relative w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] overflow-hidden"
                        >
                            {/* Button Hover Shine Effect */}
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                            
                            <span className="relative z-10">Claim Now</span>
                            <svg className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoucherPopup;