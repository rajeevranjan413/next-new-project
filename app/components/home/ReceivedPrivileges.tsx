const ReceivedPrivileges = () => {
  const privileges = [
    {
      title: "Immediate setup, zero sign-ups",
      description: "Skip the tedious registration process. Begin making purchases the second you authorize the connection.",
      icon: "assets/privileges.png", // Replace with your local image path
    },
    {
      title: "Seamless Trust Wallet integration",
      description: "Your digital card bridges flawlessly with your existing setup, ensuring all transactions pull straight from your primary balance.",
      icon: "assets/privileges-1.png",
    },
    {
      title: "Direct wallet deductions",
      description: "Enjoy immediate purchasing power. Your cryptocurrency is utilized for payments right away, completely eliminating wait times or holding periods.",
      icon: "assets/privileges-2.png",
    },
    {
      title: "Total privacy with no KYC",
      description: "Maintain complete anonymity. Enjoy a virtual card that requires absolutely no identity verification, tethered purely to your decentralized wallet.",
      icon: "assets/privileges-3.png",
    },
    {
      title: "Assets stay under your control",
      description: "Your cryptocurrency never leaves your account until the exact moment of purchase, shielding your capital from external freezes or holds.",
      icon: "assets/privileges-4.png",
    },
    {
      title: "Transparent data and insights",
      description: "Access accurate records detailing our active user base, overall trading volume, and daily processing numbers.",
      icon: "assets/privileges-5.png",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 pb-20 font-sans">
      {/* Header Section */}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1c3d]">
          Exclusive Benefits
        </h2>
        <p className="text-slate-500 text-sm md:text-base">
          Why choose the Trust Wallet virtual card
        </p>
      </div>

      {/* Privileges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {privileges.map((item, index) => (
          <div 
            key={index} 
            className="bg-[#f8f9fc] rounded-[32px] p-8 flex flex-col items-start hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 group"
          >
            {/* 3D Illustration Container */}
            <div className="w-full h-48 mb-8 flex items-center justify-center">
              <img 
                src={item.icon} 
                alt={item.title} 
                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Text Content */}
            <h3 className="text-xl font-bold text-[#1a1c3d] mb-4 leading-snug">
              {item.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReceivedPrivileges;