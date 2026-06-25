import React from 'react';
import { Share2, CreditCard, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import SectionLayout from '../Layout/SectionLayout';
import { useWalletModal } from '../../context/WalletModalContext';

const HowItWorks = () => {
    const { openModal } = useWalletModal();
    const steps = [
        {
            id: '01',
            title: 'Link your crypto wallet',
            description: 'Launch the application and authorize the link to Trust Wallet. All transactions will securely pull from your existing balance.',
            icon: <Share2 className="w-5 h-5 text-blue-600" />,
        },
        {
            id: '02',
            title: 'Select and fund your card',
            description: 'Pick your preferred digital card, check the associated limits, and submit the $1 setup fee.',
            icon: <CreditCard className="w-5 h-5 text-blue-600" />,
        },
        {
            id: '03',
            title: 'Enable and begin spending',
            description: 'Integrate your new card with Apple Pay or Google Wallet to effortlessly manage your everyday purchases and recurring subscriptions.',
            icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
        },
    ];

    return (
        <section className="work-section">

            <SectionLayout>
                {/* Header */}
                <div className="py-8">
                    <span className="flow-badge mb-4">
                        Process
                    </span>
                    <h2 className="text-4xl font-bold text-[#1a1c3d] mb-4">The Setup Steps</h2>
                    <p className="text-slate-500 max-w-2xl leading-relaxed">
                        Claiming your digital card is straightforward. Just link your account, cover the $1 creation fee, and you will be ready to shop anywhere in just a couple of minutes.
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
                            <h3 className="text-2xl font-bold text-[#1a1c3d] mb-4">Prepared to launch?</h3>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                                Navigate to our selection page, evaluate the features, and pick the virtual card that aligns with your needs.
                            </p>

                            <div className="flex flex-wrap gap-3 mb-10">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    Instant setup
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-semibold text-slate-700 shadow-sm">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    Protected assets
                                </div>
                            </div>
                        </div>

                        <button 
                          onClick={openModal}
                          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            Create Card
                        </button>
                    </div>
                </div>

            </SectionLayout>

        </section>
    );
};

export default HowItWorks;