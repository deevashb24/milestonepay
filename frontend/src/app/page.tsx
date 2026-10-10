'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { EscrowMetricsBar } from '@/components/EscrowMetricsBar';
import { ContractVaultList } from '@/components/ContractVaultList';
import { MilestoneOracleView } from '@/components/MilestoneOracleView';
import { ScopeGeneratorModal } from '@/components/ScopeGeneratorModal';
import { Contract, EscrowMetrics } from '@/types';

const API_BASE = 'http://localhost:8015/api/v1';

const initialMetrics: EscrowMetrics = {
  total_escrow_locked_usd: 26000.0,
  total_released_usd: 54500.0,
  active_contracts_count: 2,
  auto_released_milestones_count: 22,
  avg_review_hours: 38.4,
  oracle_verification_rate: 98.5,
  dispute_rate: 0.4,
};

const initialContracts: Contract[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    freelancer_id: 'a0000000-0000-0000-0000-000000000001',
    client_id: 'a0000000-0000-0000-0000-000000000002',
    title: 'HyperGrowth AI Platform Architecture & Pipeline',
    total_value_usd: 18500.0,
    contract_status: 'IN_PROGRESS',
    raw_scope_summary:
      'Full-stack AI SaaS platform with Supabase backend, streaming vector RAG, and admin billing.',
    legal_agreement_text:
      'This Milestone Escrow Agreement is entered between StrataForge Agency and HyperGrowth Ventures. Funds are held in isolated Stripe Connect escrow with a 72-hour auto-release guarantee post-oracle check.',
    milestones: [
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        contract_id: 'c0000000-0000-0000-0000-000000000001',
        title: 'Phase 1: Supabase DB Architecture & Auth Middleware',
        description:
          'PostgreSQL Drizzle schema, RLS policies, and Google/GitHub OAuth2 authentication.',
        amount_usd: 5500.0,
        status: 'RELEASED',
        verification_type: 'GITHUB_PR',
        verification_criteria: { repo: 'hypergrowth/platform', pr_number: 42 },
        created_at: new Date().toISOString(),
      },
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        contract_id: 'c0000000-0000-0000-0000-000000000001',
        title: 'Phase 2: Real-Time Vector Ingestion & LLM RAG Pipeline',
        description:
          'FastAPI ingestion pipeline with Pinecone/Qdrant vector similarity and streaming SSE endpoints.',
        amount_usd: 7500.0,
        status: 'IN_REVIEW',
        verification_type: 'VERCEL_DEPLOY',
        verification_criteria: { staging_url: 'https://staging-api.hypergrowth.internal' },
        created_at: new Date().toISOString(),
      },
      {
        id: 'd0000000-0000-0000-0000-000000000003',
        contract_id: 'c0000000-0000-0000-0000-000000000001',
        title: 'Phase 3: Production E2E Telemetry & Admin Console',
        description:
          'Next.js 16 command console with audit logging and Stripe webhook billing.',
        amount_usd: 5500.0,
        status: 'FUNDED_IN_ESCROW',
        verification_type: 'GITHUB_PR',
        verification_criteria: { repo: 'hypergrowth/platform', pr_number: 58 },
        created_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Home() {
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [metrics, setMetrics] = useState<EscrowMetrics>(initialMetrics);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(initialContracts[0].id);
  const [isSowModalOpen, setIsSowModalOpen] = useState(false);

  const refreshData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        fetch(`${API_BASE}/metrics`).catch(() => null),
        fetch(`${API_BASE}/contracts`).catch(() => null),
      ]);

      if (mRes && mRes.ok) setMetrics(await mRes.json());
      if (cRes && cRes.ok) {
        const data: Contract[] = await cRes.json();
        setContracts(data);
        if (data.length > 0 && !selectedContractId) {
          setSelectedContractId(data[0].id);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateSOW = async (payload: {
    project_title: string;
    client_email: string;
    raw_scope_notes: string;
    total_budget_usd: number;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/contracts/generate-sow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newContract = await res.json();
        await refreshData();
        setSelectedContractId(newContract.id);
      }
    } catch {
      // Offline fallback
      refreshData();
    }
  };

  const handleFundMilestone = async (contractId: string, milestoneId: string) => {
    try {
      await fetch(`${API_BASE}/contracts/${contractId}/milestones/${milestoneId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: 'pm_card_visa' }),
      });
      refreshData();
    } catch {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                milestones: c.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, status: 'FUNDED_IN_ESCROW' } : m
                ),
              }
            : c
        )
      );
    }
  };

  const handleVerifyOracle = async (
    contractId: string,
    milestoneId: string,
    proofUrl: string
  ) => {
    try {
      await fetch(`${API_BASE}/contracts/${contractId}/milestones/${milestoneId}/verify-oracle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_url: proofUrl, commit_sha: 'a48fb19' }),
      });
      refreshData();
    } catch {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                milestones: c.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, status: 'IN_REVIEW' } : m
                ),
              }
            : c
        )
      );
    }
  };

  const handleReleaseEscrow = async (contractId: string, milestoneId: string) => {
    try {
      await fetch(`${API_BASE}/contracts/${contractId}/milestones/${milestoneId}/release`, {
        method: 'POST',
      });
      refreshData();
    } catch {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === contractId
            ? {
                ...c,
                milestones: c.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, status: 'RELEASED' } : m
                ),
              }
            : c
        )
      );
    }
  };

  const selectedContract =
    contracts.find((c) => c.id === selectedContractId) || contracts[0] || null;

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col">
      <Header onOpenSowModal={() => setIsSowModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <EscrowMetricsBar metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Contract Vault List (4 cols) */}
          <div className="lg:col-span-4">
            <ContractVaultList
              contracts={contracts}
              selectedContractId={selectedContractId}
              onSelectContract={(id) => setSelectedContractId(id)}
            />
          </div>

          {/* Right Column: Milestone Progression & Delivery Oracle (8 cols) */}
          <div className="lg:col-span-8">
            <MilestoneOracleView
              contract={selectedContract}
              onFundMilestone={handleFundMilestone}
              onVerifyOracle={handleVerifyOracle}
              onReleaseEscrow={handleReleaseEscrow}
            />
          </div>
        </div>
      </main>

      <ScopeGeneratorModal
        isOpen={isSowModalOpen}
        onClose={() => setIsSowModalOpen(false)}
        onGenerate={handleGenerateSOW}
      />
    </div>
  );
}
