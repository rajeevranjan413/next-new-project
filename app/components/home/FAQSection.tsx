import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Defaulting second item to open as per image

  const questions = [
    {
      question: "What does a no-KYC setup entail?",
      answer: "Skipping the KYC process implies you can acquire your digital card without uploading any ID, guaranteeing full confidentiality and untraceable spending."
    },
    {
      question: "What blockchains and wallets do you allow?",
      answer: "Any decentralized wallet is compatible. At present, our system accommodates the Ethereum (ERC-20) and TRON (TRC-20) ecosystems."
    },
    {
      question: "Is it required to manually load funds?",
      answer: "There is no requirement to preload money. Your active Trust Wallet balance covers purchases automatically in real-time."
    },
    {
      question: "What is the wait time for a new card?",
      answer: "Creation is basically instantaneous. After linking your account and confirming the prompt, your new virtual card activates within two minutes."
    },
    {
      question: "Will I be charged recurring monthly costs?",
      answer: "Our fee structure is completely clear with zero surprise monthly charges. You are only billed for the initial creation and standard network operations."
    },
    {
      question: "Is linking my crypto wallet secure?",
      answer: "Absolutely. All links are established via encrypted channels. We never hold your seed phrases; we strictly ask for approval to process the specific transfers you initiate."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-24 font-sans">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-5xl font-bold text-[#1a1c3d]">Frequently Asked Questions</h2>
        <p className="text-slate-500">Explore solutions to our most widely asked inquiries</p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {questions.map((item, index) => (
          <div 
            key={index}
            className={`group border rounded-3xl transition-all duration-300 ${
              openIndex === index 
                ? 'border-blue-200 bg-blue-50/30' 
                : 'border-gray-100 bg-white hover:border-blue-100'
            }`}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <span className="text-lg font-bold text-[#1a1c3d]">
                {item.question}
              </span>
              <div className="text-blue-600 ml-4">
                {openIndex === index ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </button>

            {/* Answer Area */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 text-slate-500 leading-relaxed border-t border-blue-50/50 pt-4 mt-2">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;