import React from 'react';
import { Share2, CreditCard, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import SectionLayout from '../Layout/SectionLayout';
import { useWalletModal } from '../../context/WalletModalContext';

const HowItWorks = () => {
  const { openModal } = useWalletModal();
    const steps = [
        {
            id: '01',
            title: 'Connect your wallet',
            description: 'Open the app and approve the Trust Wallet connection. Payments will be made directly from your wallet.',
            icon: <Share2 className="w-5 h-5 text-blue-600" />,
        },
        {
            id: '02',
            title: 'Choose your card & pay',
            description: 'Select a card, review limits and fees, and pay $1 for issuance.',
            icon: <CreditCard className="w-5 h-5 text-blue-600" />,
        },
        {
            id: '03',
            title: 'Activate & start paying',
            description: 'Add your card to Google/Apple Pay and use it for subscriptions, shopping, and daily payments.',
            icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        },
    ];

    return (
        <section className="work-section pb-16">

            <SectionLayout>
                {/* Header */}
                <div className="py-8">
                    <span className="flow-badge mb-4">
                        Flow
                    </span>
                    <h2 className="text-4xl font-bold text-[#1a1c3d] mb-4">How it works</h2>
                    <p className="text-slate-500 max-w-2xl leading-relaxed">
                        Getting a card is simple: connect your wallet, pay $1 for issuance, and start using it within 2 minutes for online or physical payments.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Step Cards Container */}
                    <div className="flex-grow flex flex-col md:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-[40px] shadow-sm">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 p-6 border border-gray-100 rounded-[40px] hover:border-gray-100 transition-all work-action-card">
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-blue-600 font-bold text-xl">{step.id}</span>
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        {step.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[#1a1c3d] mb-4 leading-snug">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Card */}
                    <div className="work-section lg:w-[1000px] p-8 bg-gradient-to-br from-white to-blue-50 border border-gray-100 rounded-[40px] shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-[#1a1c3d] mb-4">Ready to get started?</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                Open the cards page, compare available options, and choose the format that suits you best.
                            </p>

                            <div className="flex flex-wrap gap-3 mb-10">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    Fast activation
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    Secure card
                                </div>
                            </div>
                        </div>

                        <button 
                          onClick={openModal}
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            Get Card
                        </button>
                    </div>
                </div>

            </SectionLayout>

        </section>
    );
};

export default HowItWorks;