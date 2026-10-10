'use client';

import React, { useState } from 'react';
import { X, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface ScopeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payload: {
    project_title: string;
    client_email: string;
    raw_scope_notes: string;
    total_budget_usd: number;
  }) => Promise<void>;
}

export const ScopeGeneratorModal: React.FC<ScopeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [projectTitle, setProjectTitle] = useState('Autonomous B2B Billing Portal');
  const [clientEmail, setClientEmail] = useState('vp-eng@fintechscale.com');
  const [budget, setBudget] = useState(14000);
  const [rawNotes, setRawNotes] = useState(
    'Client wants a Next.js 16 app with Stripe Connect multi-tenant billing, automated invoices, Supabase auth, and end-to-end Cypress tests passing on staging.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onGenerate({
      project_title: projectTitle,
      client_email: clientEmail,
      raw_scope_notes: rawNotes,
      total_budget_usd: Number(budget),
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111726] border border-[#1E293B] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#10B981]" />
            <h3 className="font-bold text-white text-base">Generate AI Scope-of-Work &amp; Escrow Vault</h3>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
              Project / Contract Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-lg p-2 text-xs text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1">Total Agreed Budget ($ USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-lg p-2 text-xs text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#94A3B8]">
                Informal Scope Notes, Slack DMs or PRD Summary
              </label>
              <span className="text-[10px] text-[#10B981] font-mono">AI Decomposes into 3 Phases</span>
            </div>
            <textarea
              rows={4}
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              className="w-full bg-[#0A0D14] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white font-mono"
              required
            />
          </div>

          <div className="bg-[#0A0D14] border border-[#1E293B] rounded-lg p-3 text-xs space-y-1 text-[#94A3B8]">
            <div className="text-white font-semibold text-[11px] mb-1">Automated Escrow Guarantees:</div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
              <span>Phase 1 (30%): GitHub PR merge verification</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
              <span>Phase 2 (45%): Vercel staging deploy HTTP 200 check</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
              <span>Phase 3 (25%): Production sign-off &amp; 72h auto-release</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E293B] flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded-lg text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#10B981] hover:bg-[#059669] text-white shadow transition cursor-pointer"
            >
              {isSubmitting ? 'Synthesizing Contract...' : 'Decompose & Lock Escrow Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
