import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Defaulting second item to open as per image

  const questions = [
    {
      question: "What does issuance without KYC mean?",
      answer: "Issuance without KYC means you can get your crypto card without providing personal identification documents, ensuring complete privacy and anonymity for your transactions."
    },
    {
      question: "Which wallets and networks are supported?",
      answer: "You can use any non-custodial wallet. Currently, we support TRON (TRC-20) and Ethereum (ERC-20) networks."
    },
    {
      question: "Do I need to top up the card balance?",
      answer: "No separate top-up is needed. The card pulls funds directly from your connected Trust Wallet as you spend."
    },
    {
      question: "How long does card issuance take?",
      answer: "Card issuance is near-instant. Once you connect your wallet and approve the transaction, your virtual card is ready to use in just 2 minutes."
    },
    {
      question: "Are there any monthly fees?",
      answer: "We offer transparent pricing with no hidden monthly maintenance fees. You only pay for issuance and standard transaction processing."
    },
    {
      question: "Is it safe to connect my wallet?",
      answer: "Yes. Connection is handled through secure protocols. We never have access to your private keys; we only request permission to execute transactions you authorize."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-24 font-sans">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-5xl font-bold text-[#1a1c3d]">FAQ</h2>
        <p className="text-slate-500">Find answers to some of the most common questions</p>
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