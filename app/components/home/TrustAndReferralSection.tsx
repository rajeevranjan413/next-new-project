import React from 'react';
import { Star } from 'lucide-react';
import SectionLayout from '../Layout/SectionLayout';

const TrustAndReferral = () => {
  const stats = [
    { label: 'Chosen by', value: '200M', suffix: 'users' },
    { label: 'Launched in', value: '2017' },
    { label: 'Third-party', value: 'Verified', color: 'text-blue-600' },
    { label: 'Security', value: 'Approved', color: 'text-blue-600' },
  ];

  return (
    <section className="pb-16">
      <SectionLayout>

        <div className='flex flex-col lg:flex-row gap-6 font-sans'>
        {/* Left: Trust Stats Grid */}
      <div className="flex-grow bg-white border border-gray-100 rounded-[40px] p-12 grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${stat.color || 'text-[#1a1c3d]'}`}>
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-slate-500 font-medium">{stat.suffix}</span>
              )}
            </div>
          </div>
        ))}

        {/* Top Reviews Section */}
        <div className="space-y-2">
          <p className="text-slate-400 text-sm font-medium">Excellent feedback</p>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Referral Promo Card */}
      <div className="lg:w-[550px] bg-[#2141ff] rounded-[40px] p-10 relative overflow-hidden flex flex-col justify-between min-h-[320px]">
        
        {/* Content */}
        <div className="relative z-10 space-y-4 max-w-[320px]">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Earn <span className="text-[#36ef9b]">5 USDT</span> per referral
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Loving your new card? Share it with your network and earn crypto rewards instantly.
          </p>
        </div>

        <button className="relative z-10 w-fit mt-8 px-8 py-3 bg-white text-blue-700 font-bold rounded-full hover:bg-gray-50 transition-colors">
          Secure Yours Now
        </button>

        {/* Decorative Illustration (Placeholder for your image) */}
        <div className="absolute right-0 bottom-0 w-64 h-64 opacity-90 pointer-events-none">
          <img 
            src="/assets/referral.png" 
            alt="Friend Invitation Graphic" 
            className="w-full h-full object-contain object-right-bottom"
          />
        </div>
      </div>
        </div>
        
        
      </SectionLayout>
      
    </section>
  );
};

export default TrustAndReferral;