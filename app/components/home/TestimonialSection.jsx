'use client';

import React, { useRef } from 'react';
import SectionLayout from '../Layout/SectionLayout';

const testimonials = [
    {
        id: 1,
        name: "Alex D.",
        handle: "@alex_crypto",
        text: "Got my card in minutes! Spending my USDT has never been easier. No more waiting days for exchange withdrawals to hit my bank.",
        avatarBg: "bg-blue-100 text-blue-600"
    },
    {
        id: 2,
        name: "Sarah K.",
        handle: "@sarah_trades",
        text: "No KYC hassle, just connected my Trust Wallet and boom. The virtual card works flawlessly with Apple Pay. Highly recommended.",
        avatarBg: "bg-purple-100 text-purple-600"
    },
    {
        id: 3,
        name: "Mike R.",
        handle: "@miker_99",
        text: "Finally, a way to use my crypto for daily groceries without crazy exchange fees. The conversion is seamless and instant.",
        avatarBg: "bg-green-100 text-green-600"
    },
    {
        id: 4,
        name: "Emma W.",
        handle: "@emmainweb3",
        text: "Super clean UI and the transaction speed is amazing. It’s definitely the best crypto card I've used so far.",
        avatarBg: "bg-orange-100 text-orange-600"
    },
    {
        id: 5,
        name: "David L.",
        handle: "@david_defi",
        text: "I travel a lot, and this card saves me from carrying multiple currencies. Crypto on the go wherever Visa/Mastercard is accepted!",
        avatarBg: "bg-teal-100 text-teal-600"
    },
    {
        id: 6,
        name: "Jessica M.",
        handle: "@jess_mint",
        text: "Love the privacy aspect. Spending directly from my self-custody wallet without jumping through hoops feels incredibly freeing.",
        avatarBg: "bg-pink-100 text-pink-600"
    },
    {
        id: 7,
        name: "Chris B.",
        handle: "@chris_blocks",
        text: "Customer support was super helpful when I had a question about limits. Great service to back up an awesome product.",
        avatarBg: "bg-indigo-100 text-indigo-600"
    },
    {
        id: 8,
        name: "Amanda T.",
        handle: "@mandy_hodl",
        text: "The 2-minute setup promise is absolutely real. I was skeptical but it actually worked perfectly right out of the gate.",
        avatarBg: "bg-rose-100 text-rose-600"
    },
    {
        id: 9,
        name: "Ryan G.",
        handle: "@ryang_eth",
        text: "No hidden fees and total control over my funds. This is exactly what the future of payments is supposed to look like.",
        avatarBg: "bg-sky-100 text-sky-600"
    },
    {
        id: 10,
        name: "Olivia H.",
        handle: "@liv_crypto",
        text: "I use it for all my online subscriptions now. Being able to fund it directly from my Trust Wallet gives me incredible peace of mind.",
        avatarBg: "bg-yellow-100 text-yellow-600"
    }
];

const TestimonialSection = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 bg-slate-50 overflow-hidden">
            <SectionLayout>
                
                {/* Header & Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-2xl md:text-3xl font-semibold text-[#1a1c3d]">
                        What Our Users Say
                    </h2>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full bg-white border border-gray-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                            aria-label="Scroll left"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full bg-white border border-gray-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95"
                            aria-label="Scroll right"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
                    <div 
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {testimonials.map((testimonial) => (
                            <div 
                                key={testimonial.id} 
                                className="w-[85vw] md:w-[380px] shrink-0 snap-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                            >
                                <div>
                                    {/* Quote Icon */}
                                    <svg className="w-8 h-8 text-blue-100 mb-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                    
                                    <p className="text-slate-700 leading-relaxed mb-8">
                                        "{testimonial.text}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Avatar Placeholder */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${testimonial.avatarBg}`}>
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[#1a1c3d]">{testimonial.name}</h4>
                                        <p className="text-sm text-slate-500">{testimonial.handle}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
            </SectionLayout>
        </section>
    );
};

export default TestimonialSection;