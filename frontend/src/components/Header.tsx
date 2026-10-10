'use client';

import React from 'react';
import { Lock, FileText, CheckCircle2, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onOpenSowModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSowModal }) => {
  return (
    <header className="border-b border-[#1E293B] bg-[#111726]/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-wide">MilestonePay AI</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-semibold border border-[#10B981]/40">
                ORACLE ESCROW PROTOCOL
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Automated Deliverable Verification • GitHub PR &amp; Vercel Oracles • 72-Hour Auto-Release
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-[#0A0D14] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-[#94A3B8]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Stripe Connect Escrow:</span>
            <span className="font-mono text-[#10B981] font-semibold">SECURED</span>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-[#0A0D14] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-[#94A3B8]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#06B6D4]" />
            <span>GitHub / Vercel Oracles:</span>
            <span className="font-semibold text-white">LISTENING</span>
          </div>

          <button
            onClick={onOpenSowModal}
            className="flex items-center space-x-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-[#10B981]/20 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate AI SOW Contract</span>
          </button>
        </div>
      </div>
    </header>
  );
};
