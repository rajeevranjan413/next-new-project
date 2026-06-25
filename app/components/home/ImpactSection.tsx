import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useWalletModal } from '../../context/WalletModalContext';

const ImpactSection = () => {
  const { openModal } = useWalletModal();
  return (
    <section className="relative w-full bg-[#1e40ff] min-h-[600px] flex items-center overflow-hidden py-20 px-8">
      {/* Container for alignment */}
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center relative">
        
        {/* Left: Content Layer (Z-index high to overlap the image) */}
        <div className="relative z-20 w-full md:w-1/2 space-y-6">
          <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Digital Card by <br />
            <span className="text-[#36ef9b]">Trust Wallet</span> <br />
            for everyday use
          </h2>
          
          <p className="text-white/80 text-lg max-w-md leading-relaxed">
            Funds are deducted straight from your Trust Wallet balance. Spend with your 
            virtual card at countless digital and physical retailers.
          </p>

          <button 
            onClick={openModal}
            className="flex items-center gap-2 px-8 py-3 border border-white/30 bg-white/10 text-white font-semibold rounded-full hover:bg-white hover:text-blue-700 transition-all group">
            Claim Your Card
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right: Large 3D Typography Graphic */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full md:w-[70%] h-full flex justify-end items-center z-10 pointer-events-none">
          {/* Replace 'image_0ccb3d.jpg' with your actual local file name */}
          <img 
            src="/assets/trust.png" 
            alt="Trust Wallet 3D Graphic" 
            className="w-full h-auto object-contain scale-110 md:scale-125"
          />
        </div>

    
      </div>
    </section>
  );
};

export default ImpactSection;