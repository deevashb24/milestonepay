'use client';

import React from 'react';
import { Lock, CheckCircle2, Clock, ShieldAlert, Award, FileCode2 } from 'lucide-react';
import { EscrowMetrics } from '@/types';

interface EscrowMetricsBarProps {
  metrics: EscrowMetrics;
}

export const EscrowMetricsBar: React.FC<EscrowMetricsBarProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
      <div className="bg-[#111726] border border-[#1E293B] rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
          <span>Escrow Locked</span>
          <Lock className="h-3.5 w-3.5 text-[#10B981]" />
        </div>
        <div className="text-xl font-bold font-mono text-[#10B981]">
          ${metrics.total_escrow_locked_usd.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">Stripe vault balance</div>
      </div>

      <div className="bg-[#111726] border border-[#1E293B] rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
          <span>Total Released</span>
          <Award className="h-3.5 w-3.5 text-cyan-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          ${metrics.total_released_usd.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">Verified payouts</div>
      </div>

      <div className="bg-[#111726] border border-[#1E293B] rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
          <span>Active Contracts</span>
          <FileCode2 className="h-3.5 w-3.5 text-purple-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {metrics.active_contracts_count} Active
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">Engineering scopes</div>
      </div>

      <div className="bg-[#111726] border border-[#1E293B] rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
          <span>Auto-Released</span>
          <Clock className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-400">
          {metrics.auto_released_milestones_count} Tasks
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">72-hour guarantee</div>
      </div>

      <div className="bg-[#111726] border border-[#1E293B] rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
          <span>Oracle Pass Rate</span>
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {metrics.oracle_verification_rate}%
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">GitHub &amp; Vercel</div>
      </div>

      <div className="bg-[#111726] border border-[#1E293B] rounded-xl p-3.5">
        <div className="flex items-center justify-between text-[#94A3B8] text-xs mb-1">
          <span>Dispute Rate</span>
          <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {metrics.dispute_rate}%
        </div>
        <div className="text-[10px] text-[#94A3B8] mt-0.5">&lt; 0.5% industry low</div>
      </div>
    </div>
  );
};
