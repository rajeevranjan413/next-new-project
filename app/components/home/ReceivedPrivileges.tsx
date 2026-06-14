
const ReceivedPrivileges = () => {
  const privileges = [
    {
      title: "Instant start, no registration",
      description: "No need to register or create additional accounts. Start using your card immediately after connection.",
      icon: "assets/privileges.svg", // Replace with your local image path
    },
    {
      title: "Direct connection to Trust Wallet",
      description: "Crypto card is directly connected to your Trust Wallet. Payment goes directly from your wallet.",
      icon: "assets/privileges-1.svg",
    },
    {
      title: "Payment directly from Trust Wallet",
      description: "Payment goes directly from your Trust Wallet. Use your crypto funds instantly without delays.",
      icon: "assets/privileges-2.svg",
    },
    {
      title: "KYC-free card — complete anonymity",
      description: "Crypto card from Trust Wallet without KYC, directly linked to your wallet.",
      icon: "assets/privileges-3.svg",
    },
    {
      title: "Funds remain in your wallet",
      description: "Money remains in your Trust Wallet until spent. It cannot be blocked or restricted.",
      icon: "assets/privileges-4.svg",
    },
    {
      title: "Verified statistics and metrics",
      description: "Number of users, total transaction volume, daily transaction count.",
      icon: "assets/privileges-5.svg",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-20 font-sans">
      {/* Header Section */}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1c3d]">
          Received privileges
        </h2>
        <p className="text-slate-500 text-sm md:text-base">
          Benefits of using Crypto Card from Trust Wallet
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