import React from 'react';

const SpendControlSection = () => {
  // Data for the transaction notification cards using your SVG paths
  const transactions = [
    { 
      id: 1, 
      name: 'Uber', 
      time: '23:42', 
      crypto: '16.40 USDC', 
      fiat: '€15.20', 
      iconPath: 'assets/transaction-1.svg' 
    },
    { 
      id: 2, 
      name: 'Netflix', 
      time: '19:19', 
      crypto: '13.95 USDC', 
      fiat: '£10.99', 
      iconPath: 'assets/transaction-2.svg' 
    },
    { 
      id: 3, 
      name: 'ASOS', 
      time: '11:17', 
      crypto: '89.90 USDC', 
      fiat: '$89.90', 
      iconPath: 'assets/transaction-3.svg' 
    },
    { 
      id: 4, 
      name: 'Starbucks', 
      time: '12:10', 
      crypto: '9.45 USDC', 
      fiat: 'THB 320.00', 
      iconPath: 'assets/transaction-4.svg' 
    },
    { 
      id: 5, 
      name: 'Booking.com', 
      time: '17:45', 
      crypto: '215.40 USDC', 
      fiat: 'IDR 3,450,000.00', 
      iconPath: 'assets/transaction-5.svg',
      wide: true 
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row items-center gap-16 overflow-visible font-sans">
      
      {/* Left Content Area */}
      <div className="flex-1 space-y-6 z-10">
        <h2 className="text-5xl md:text-6xl font-bold text-[#1a1c3d] leading-tight">
          Spend with <br />
          <span className="text-blue-600">Full control</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-md leading-relaxed">
          Shop online, in stores or abroad and track every transaction in real time.
        </p>
      </div>

      {/* Right Composition Area */}
      <div className="flex-1 relative flex justify-center items-center">
        
        {/* Central Phone Mockup (phone-6.svg) */}
        <div className="relative z-10 w-[280px] md:w-[320px]">
          <img 
            src="assets/phone-6.svg" 
            alt="Phone Mockup" 
            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-10 duration-1000"
          />
        </div>

        {/* Transactions Grid Overlay (Positioned over the phone) */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-24 pointer-events-none">
          <div className="flex flex-col gap-3 w-full max-w-[480px]">
            
            {/* Row 1: Uber & Netflix */}
            <div className="flex justify-center gap-3">
              <TransactionCard tx={transactions[0]} delay="delay-[400ms]" />
              <TransactionCard tx={transactions[1]} delay="delay-[500ms]" />
            </div>

            {/* Row 2: ASOS & Starbucks */}
            <div className="flex justify-center gap-3">
              <TransactionCard tx={transactions[2]} delay="delay-[600ms]" />
              <TransactionCard tx={transactions[3]} delay="delay-[700ms]" />
            </div>

            {/* Row 3: Booking.com (Wide) */}
            <div className="flex justify-center">
              <TransactionCard tx={transactions[4]} delay="delay-[800ms]" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Sub-component for individual transaction notification cards
 */
const TransactionCard = ({ tx, delay }: { tx: any; delay: string }) => (
  <div className={`
    bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-2xl
    animate-in fade-in zoom-in duration-700 fill-mode-both ${delay}
    ${tx.wide ? 'w-[280px]' : 'w-[190px] md:w-[210px]'}
  `}>
    {/* SVG Brand Icon */}
    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-black">
      <img 
        src={tx.iconPath} 
        alt={tx.name} 
        className="w-full h-full object-cover"
      />
    </div>

    {/* Transaction Details */}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline">
        <h4 className="text-white text-[10px] font-bold truncate">{tx.name}</h4>
        <span className="text-white/40 text-[8px]">{tx.time}</span>
      </div>
      <div className="flex justify-between items-baseline mt-0.5">
        <p className="text-white text-[10px] font-medium">{tx.crypto}</p>
        <span className="text-white/40 text-[8px] whitespace-nowrap ml-2">{tx.fiat}</span>
      </div>
    </div>
  </div>
);

export default SpendControlSection;