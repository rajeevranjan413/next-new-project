import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useWalletModal } from '../../context/WalletModalContext';

const JoinUsSection = () => {
  const { openModal } = useWalletModal();
  return (
    <section className="mx-auto px-8 py-12">
      <div className="relative w-full bg-[#1e40ff] rounded-[40px] overflow-hidden min-h-[400px] flex items-center">
        
        {/* Background Illustration Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/join.svg" 
            alt="Join us illustration" 
            className="w-full h-full object-cover object-left md:object-center opacity-90"
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full px-10 md:px-20 py-16 md:ml-auto md:w-1/2">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Join us today
          </h2>
          
          <p className="text-white/80 text-lg md:text-xl max-w-md mb-10 leading-relaxed">
            Crypto Card from Trust Wallet. Payment goes directly from your 
            Trust Wallet. Secure, fast and convenient.
          </p>

          <button 
            onClick={openModal}
            className="group flex items-center gap-3 px-8 py-4 bg-transparent border border-white/30 rounded-full text-white font-bold hover:bg-white hover:text-blue-700 transition-all duration-300">
            Get Your Card
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default JoinUsSection;