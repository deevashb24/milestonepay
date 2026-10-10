'use client';

import React, { useState } from 'react';
import {
  Lock,
  GitPullRequest,
  Globe,
  Palette,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Contract, ContractMilestone, DeliverableProof } from '@/types';

interface MilestoneOracleViewProps {
  contract: Contract | null;
  onFundMilestone: (contractId: string, milestoneId: string) => Promise<void>;
  onVerifyOracle: (contractId: string, milestoneId: string, proofUrl: string) => Promise<void>;
  onReleaseEscrow: (contractId: string, milestoneId: string) => Promise<void>;
}

export const MilestoneOracleView: React.FC<MilestoneOracleViewProps> = ({
  contract,
  onFundMilestone,
  onVerifyOracle,
  onReleaseEscrow,
}) => {
  const [activeProofUrl, setActiveProofUrl] = useState('https://github.com/hypergrowth/platform/pull/62');
  const [submittingMid, setSubmittingMid] = useState<string | null>(null);

  if (!contract) {
    return (
      <div className="bg-[#111726] border border-[#1E293B] rounded-xl flex items-center justify-center h-[750px] p-6 text-center text-[#94A3B8]">
        <div>
          <Lock className="h-10 w-10 mx-auto mb-3 text-[#1E293B]" />
          <p className="text-sm">Select a contract to inspect milestones and deliverable oracles.</p>
        </div>
      </div>
    );
  }

  const handleVerify = async (mid: string) => {
    setSubmittingMid(mid);
    await onVerifyOracle(contract.id, mid, activeProofUrl);
    setSubmittingMid(null);
  };

  const handleFund = async (mid: string) => {
    setSubmittingMid(mid);
    await onFundMilestone(contract.id, mid);
    setSubmittingMid(null);
  };

  const handleRelease = async (mid: string) => {
    setSubmittingMid(mid);
    await onReleaseEscrow(contract.id, mid);
    setSubmittingMid(null);
  };

  return (
    <div className="bg-[#111726] border border-[#1E293B] rounded-xl flex flex-col h-[750px]">
      {/* Header */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">{contract.title}</h2>
          <div className="flex items-center space-x-2 text-xs text-[#94A3B8] mt-0.5">
            <span>Contract Total: <strong className="font-mono text-[#10B981]">${contract.total_value_usd.toLocaleString()}</strong></span>
            <span>•</span>
            <span className="font-mono">{contract.milestones.length} Milestones</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 rounded bg-[#0A0D14] border border-[#1E293B] font-mono text-[#10B981] flex items-center space-x-1">
            <Lock className="h-3 w-3 inline" />
            <span>Vault Active</span>
          </span>
        </div>
      </div>

      {/* Legal SOW Summary Box */}
      <div className="p-3.5 bg-[#0A0D14] border-b border-[#1E293B] text-xs">
        <span className="text-[#94A3B8] font-semibold uppercase text-[10px] tracking-wide block mb-1">
          Binding Escrow Agreement &amp; 72h Auto-Release Guarantee
        </span>
        <p className="text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-2">
          {contract.legal_agreement_text}
        </p>
      </div>

      {/* Milestones Progression List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {contract.milestones.map((m, index) => {
          const isReleased = m.status === 'RELEASED';
          const isInReview = m.status === 'IN_REVIEW';
          const isFunded = m.status === 'FUNDED_IN_ESCROW';
          const isPending = m.status === 'PENDING_FUNDING';

          return (
            <div
              key={m.id}
              className={`p-4 rounded-xl border text-left transition ${
                isReleased
                  ? 'bg-[#0A0D14]/60 border-emerald-500/30'
                  : isInReview
                  ? 'bg-[#0A0D14] border-amber-500/40 glow-escrow'
                  : 'bg-[#0A0D14] border-[#1E293B]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="h-6 w-6 rounded-full bg-[#1E293B] text-xs font-mono font-bold flex items-center justify-center text-white">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-sm text-white">{m.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-[#10B981]">
                    ${m.amount_usd.toLocaleString()}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isReleased
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                        : isInReview
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : isFunded
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-700/30 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {m.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] mb-3">{m.description}</p>

              {/* Oracle Criteria Card */}
              <div className="bg-[#111726] border border-[#1E293B] rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {m.verification_type === 'GITHUB_PR' ? (
                    <GitPullRequest className="h-4 w-4 text-[#06B6D4]" />
                  ) : m.verification_type === 'VERCEL_DEPLOY' ? (
                    <Globe className="h-4 w-4 text-purple-400" />
                  ) : (
                    <Palette className="h-4 w-4 text-pink-400" />
                  )}
                  <span className="font-mono text-[#94A3B8]">
                    Verification Oracle: <strong className="text-white">{m.verification_type}</strong>
                  </span>
                </div>

                {isInReview && (
                  <div className="flex items-center space-x-1.5 text-amber-400 font-mono text-[11px]">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    <span>Auto-Release in 48h 00m</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1E293B]">
                {isPending && (
                  <button
                    onClick={() => handleFund(m.id)}
                    disabled={submittingMid === m.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Fund ${m.amount_usd.toLocaleString()} in Escrow</span>
                  </button>
                )}

                {isFunded && (
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="text"
                      value={activeProofUrl}
                      onChange={(e) => setActiveProofUrl(e.target.value)}
                      placeholder="https://github.com/client/repo/pull/42"
                      className="flex-1 bg-[#111726] border border-[#1E293B] rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                    <button
                      onClick={() => handleVerify(m.id)}
                      disabled={submittingMid === m.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Trigger Oracle Check</span>
                    </button>
                  </div>
                )}

                {isInReview && (
                  <button
                    onClick={() => handleRelease(m.id)}
                    disabled={submittingMid === m.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Instant Release Payout</span>
                  </button>
                )}

                {isReleased && (
                  <span className="text-xs font-mono text-[#10B981] flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Funds Released &amp; Settled via Stripe</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
