'use client';

import React from 'react';
import { FileText, CheckCircle2, Clock, Lock, ArrowRight } from 'lucide-react';
import { Contract } from '@/types';

interface ContractVaultListProps {
  contracts: Contract[];
  selectedContractId: string | null;
  onSelectContract: (id: string) => void;
}

export const ContractVaultList: React.FC<ContractVaultListProps> = ({
  contracts,
  selectedContractId,
  onSelectContract,
}) => {
  return (
    <div className="bg-[#111726] border border-[#1E293B] rounded-xl flex flex-col h-[750px]">
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-[#10B981]" />
          <h2 className="text-sm font-semibold text-white">Active Contracts</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E293B] text-[#94A3B8] font-mono">
            {contracts.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#1E293B] p-2 space-y-1">
        {contracts.map((c) => {
          const isSelected = c.id === selectedContractId;
          const completedMilestones = c.milestones.filter((m) => m.status === 'RELEASED').length;

          return (
            <div
              key={c.id}
              onClick={() => onSelectContract(c.id)}
              className={`p-3.5 rounded-lg cursor-pointer transition border text-left ${
                isSelected
                  ? 'bg-[#0A0D14] border-[#10B981]/50 shadow-md'
                  : 'bg-[#111726] hover:bg-[#0A0D14]/60 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-xs text-white truncate max-w-[190px]">
                  {c.title}
                </span>
                <span className="font-mono text-xs font-bold text-[#10B981]">
                  ${c.total_value_usd.toLocaleString()}
                </span>
              </div>

              <p className="text-[11px] text-[#94A3B8] line-clamp-2 mb-2.5">
                {c.raw_scope_summary}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
                <div className="flex items-center space-x-1 text-[#06B6D4]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>
                    {completedMilestones}/{c.milestones.length} Milestones
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#1E293B] text-[10px] text-white">
                  {c.contract_status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
