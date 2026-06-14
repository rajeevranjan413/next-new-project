
'use client';

import { useWalletModal } from '../../context/WalletModalContext';
import SectionLayout from '../Layout/SectionLayout';
import './HeroSection.css';

const HeroSection = () => {
    const { openModal } = useWalletModal();
    return (
        <section className="py-6">
            <SectionLayout>

                <div className='flex flex-col md:flex-row items-center gap-4'>

                    {/* Left Content */}
                    <div className="flex-1 space-y-8">
                        <h1 className="text-3xl md:text-5xl font-semibold text-[#1a1c3d] leading-[1.1]">
                            Issue Your Crypto <br />
                            <span className="text-blue-600">Card</span> <br />
                            from Trust Wallet <br />
                            <span className="text-blue-600">Right Now</span>
                        </h1>

                        <p className="text-slate-500 text-lg leading-relaxed max-w-lg">
                            Payment goes directly from your Trust Wallet. Spend directly
                            from your wallet without account top-ups or verification.
                            Connect your wallet and download the app — your card will be
                            ready in just 2 minutes.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={openModal}
                                className="py-2 px-4 md:px-6 md:py-3 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg">
                                Get Your Card
                            </button>
                            <button className="py-2 px-4 md:px-6 md:py-3 bg-white text-slate-900 font-semibold border border-gray-200 rounded-full hover:bg-gray-50 transition-all active:scale-95">
                                Learn More
                            </button>
                        </div>
                    </div>

                    {/* Right Content: Image */}
                    <div className="flex-1 relative flex items-center justify-center">
                        <div className="relative w-full max-w-xl">
                            {/* Replace 'path-to-your-local-image.png' with your actual file name */}
                            <img
                                src="/assets/heroimage.jpg"
                                alt="Trust Wallet Crypto Card Illustration"
                                className="w-full h-auto hero-float"
                            />
                        </div>
                    </div>

                </div>


            </SectionLayout>
        </section>
    );
};

export default HeroSection;