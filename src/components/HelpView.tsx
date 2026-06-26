import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: 'How do I top up my balance?',
    a: 'You can top up your wallet by clicking on the "[ add funds ]" link in the top header. Select your preferred cryptocurrency (BTC, LTC, ETH) or the simulated card gateway, enter the desired amount, and click "Verification". Your balance will be credited instantly!',
  },
  {
    q: 'Why does my account say "Inactive" in the blue warning banner?',
    a: 'By default, new testing profiles are marked as Inactive. To activate your account and remove the banner, simply top up your balance with any amount using the "[ add funds ]" flow. Active accounts are granted premium capabilities.',
  },
  {
    q: 'What is the "Crab Rating" status?',
    a: 'Your Crab Rating reflects your active participation on the Protocol database. Ratings increase whenever you top up funds (+15 crabs), purchase cards (+10 crabs), activate your account (+20 crabs), or play mini-games.',
  },
  {
    q: 'How does the 15-minute "Only Refundable" refund policy work?',
    a: 'Cards marked with "Only Refundable" are covered by our automatic tester. After purchase, navigate to your "Orders" tab. You will see a "Verify Validity" button on these items. Click it to run a simulated API validity checker. If the card is tested "Dead", your purchase credits are instantly refunded!',
  },
  {
    q: 'How do I open a Support Ticket?',
    a: 'Go to the "Tickets" tab, click the "Open Ticket" button at the top-right of the left column. Fill out your Subject and Message, then click "Submit Thread". You can then select your ticket and chat in real-time with our automated helper agent, who answers immediately!',
  },
];

export default function HelpView() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 mb-4 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0c5460]" /> Help Desk & FAQ Manual
        </h2>
        
        <div className="flex flex-col gap-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded overflow-hidden bg-gray-50/50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200/80 flex justify-between items-center transition-colors font-extrabold text-gray-800 text-xs cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-gray-100 text-gray-600 leading-relaxed font-normal text-xs">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
