"""
MilestonePay AI - Transactional Datastore & Seed Data
Autonomous Scope-of-Work Generator & Deliverable-Verified Milestone Escrow
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from models.schemas import (
    ContractResponse,
    ContractStatus,
    DeliverableProofResponse,
    EscrowLedgerResponse,
    EscrowMetricsResponse,
    LedgerTxType,
    MilestoneResponse,
    MilestoneStatus,
    UserResponse,
    UserRole,
    VerificationType,
)

# Deterministic Seed Identifiers
USER_DEV_ID = UUID("a0000000-0000-0000-0000-000000000001")
USER_CLIENT_ID = UUID("a0000000-0000-0000-0000-000000000002")

CONTRACT_1_ID = UUID("c0000000-0000-0000-0000-000000000001")
CONTRACT_2_ID = UUID("c0000000-0000-0000-0000-000000000002")

MS_1_1_ID = UUID("d0000000-0000-0000-0000-000000000001")
MS_1_2_ID = UUID("d0000000-0000-0000-0000-000000000002")
MS_1_3_ID = UUID("d0000000-0000-0000-0000-000000000003")

MS_2_1_ID = UUID("d0000000-0000-0000-0000-000000000004")
MS_2_2_ID = UUID("d0000000-0000-0000-0000-000000000005")


class MilestoneStore:
    def __init__(self):
        self.reset()

    def reset(self):
        now = datetime.now(timezone.utc)
        t_minus_10d = now - timedelta(days=10)
        t_minus_3d = now - timedelta(days=3)
        t_minus_1d = now - timedelta(days=1)

        # 1. Users
        self.users: Dict[UUID, UserResponse] = {
            USER_DEV_ID: UserResponse(
                id=USER_DEV_ID,
                email="elena@strataforge.agency",
                full_name="Elena Rostova (Lead Architect)",
                role=UserRole.AGENCY,
                stripe_account_id="acct_1Nv8YfStrataForge",
                created_at=t_minus_10d,
            ),
            USER_CLIENT_ID: UserResponse(
                id=USER_CLIENT_ID,
                email="marcus@hypergrowth.ventures",
                full_name="Marcus Vance (VP Engineering)",
                role=UserRole.CLIENT,
                stripe_account_id="acct_1Nv8YfHyperGrowth",
                created_at=t_minus_10d,
            ),
        }

        # 2. Milestones for Contract 1 (AI Pipeline Engine - $18,500 total)
        self.milestones: Dict[UUID, MilestoneResponse] = {
            MS_1_1_ID: MilestoneResponse(
                id=MS_1_1_ID,
                contract_id=CONTRACT_1_ID,
                title="Milestone 1: Supabase DB Architecture & Auth Middleware",
                description="PostgreSQL Drizzle schema, RLS policies, and Google/GitHub OAuth2 authentication.",
                amount_usd=5500.00,
                status=MilestoneStatus.RELEASED,
                verification_type=VerificationType.GITHUB_PR,
                verification_criteria={"repo": "hypergrowth/platform", "pr_number": 42, "target_branch": "main"},
                escrow_charge_id="ch_3N1042_escrow",
                review_window_expires_at=t_minus_3d,
                released_at=t_minus_3d,
                created_at=t_minus_10d,
            ),
            MS_1_2_ID: MilestoneResponse(
                id=MS_1_2_ID,
                contract_id=CONTRACT_1_ID,
                title="Milestone 2: Real-Time Vector Ingestion & LLM RAG Pipeline",
                description="FastAPI ingestion pipeline with Pinecone/Qdrant vector similarity and streaming SSE endpoints.",
                amount_usd=7500.00,
                status=MilestoneStatus.IN_REVIEW,
                verification_type=VerificationType.VERCEL_DEPLOY,
                verification_criteria={"deploy_url": "https://staging-api.hypergrowth.internal", "expected_status": 200},
                escrow_charge_id="ch_3N1043_escrow",
                review_window_expires_at=now + timedelta(hours=48),  # 48 hours left in 72h window
                released_at=None,
                created_at=t_minus_10d,
            ),
            MS_1_3_ID: MilestoneResponse(
                id=MS_1_3_ID,
                contract_id=CONTRACT_1_ID,
                title="Milestone 3: Production E2E Telemetry & Admin Console",
                description="Next.js 16 command console with audit logging and Stripe webhook billing.",
                amount_usd=5500.00,
                status=MilestoneStatus.FUNDED_IN_ESCROW,
                verification_type=VerificationType.GITHUB_PR,
                verification_criteria={"repo": "hypergrowth/platform", "pr_number": 58, "target_branch": "main"},
                escrow_charge_id="ch_3N1044_escrow",
                review_window_expires_at=None,
                released_at=None,
                created_at=t_minus_10d,
            ),
            # Contract 2 Milestones
            MS_2_1_ID: MilestoneResponse(
                id=MS_2_1_ID,
                contract_id=CONTRACT_2_ID,
                title="Milestone 1: High-Fidelity Design System in Figma",
                description="Component library with dark/light mode tokens and 12 core screen mockups.",
                amount_usd=3200.00,
                status=MilestoneStatus.RELEASED,
                verification_type=VerificationType.FIGMA_APPROVAL,
                verification_criteria={"figma_file_key": "figma_88921_tokens"},
                escrow_charge_id="ch_3N2011_escrow",
                review_window_expires_at=t_minus_1d,
                released_at=t_minus_1d,
                created_at=t_minus_3d,
            ),
            MS_2_2_ID: MilestoneResponse(
                id=MS_2_2_ID,
                contract_id=CONTRACT_2_ID,
                title="Milestone 2: Responsive React 19 Frontend Implementation",
                description="Tailwind CSS v4 implementation matching Figma specs with 100% responsiveness.",
                amount_usd=4800.00,
                status=MilestoneStatus.FUNDED_IN_ESCROW,
                verification_type=VerificationType.GITHUB_PR,
                verification_criteria={"repo": "acme/design-portal", "target_branch": "main"},
                escrow_charge_id="ch_3N2012_escrow",
                review_window_expires_at=None,
                released_at=None,
                created_at=t_minus_3d,
            ),
        }

        # 3. Contracts
        self.contracts: Dict[UUID, ContractResponse] = {
            CONTRACT_1_ID: ContractResponse(
                id=CONTRACT_1_ID,
                freelancer_id=USER_DEV_ID,
                client_id=USER_CLIENT_ID,
                title="HyperGrowth AI Platform Architecture & Pipeline",
                total_value_usd=18500.00,
                contract_status=ContractStatus.IN_PROGRESS,
                raw_scope_summary="Full-stack AI SaaS platform with Supabase backend, streaming vector RAG, and admin billing.",
                legal_agreement_text=(
                    "This Milestone Escrow Agreement is entered between StrataForge Agency and HyperGrowth Ventures. "
                    "Funds for each milestone are held in isolated Stripe Connect escrow. Upon verified delivery by "
                    "designated oracles (GitHub PR merge / Vercel deploy 200), a 72-hour review window commences. "
                    "In the absence of a formal dispute, funds release automatically to contractor."
                ),
                freelancer_signed_at=t_minus_10d,
                client_signed_at=t_minus_10d,
                milestones=[self.milestones[MS_1_1_ID], self.milestones[MS_1_2_ID], self.milestones[MS_1_3_ID]],
                created_at=t_minus_10d,
                updated_at=t_minus_1d,
            ),
            CONTRACT_2_ID: ContractResponse(
                id=CONTRACT_2_ID,
                freelancer_id=USER_DEV_ID,
                client_id=USER_CLIENT_ID,
                title="Acme Portal Design System & Responsive Frontend",
                total_value_usd=8000.00,
                contract_status=ContractStatus.IN_PROGRESS,
                raw_scope_summary="Figma design system and React 19 web implementation.",
                legal_agreement_text="Standard MilestonePay Escrow Terms and Conditions.",
                freelancer_signed_at=t_minus_3d,
                client_signed_at=t_minus_3d,
                milestones=[self.milestones[MS_2_1_ID], self.milestones[MS_2_2_ID]],
                created_at=t_minus_3d,
                updated_at=t_minus_1d,
            ),
        }

        # 4. Deliverable Proofs
        self.proofs: Dict[UUID, List[DeliverableProofResponse]] = {
            MS_1_1_ID: [
                DeliverableProofResponse(
                    id=uuid4(),
                    milestone_id=MS_1_1_ID,
                    proof_type=VerificationType.GITHUB_PR,
                    proof_url="https://github.com/hypergrowth/platform/pull/42",
                    proof_metadata={"merge_commit": "7f8b91a", "status": "MERGED", "checks": "18/18 PASS"},
                    verified_by_oracle=True,
                    verified_at=t_minus_3d - timedelta(hours=72),
                    auto_release_triggered=True,
                    created_at=t_minus_3d - timedelta(hours=72),
                )
            ],
            MS_1_2_ID: [
                DeliverableProofResponse(
                    id=uuid4(),
                    milestone_id=MS_1_2_ID,
                    proof_type=VerificationType.VERCEL_DEPLOY,
                    proof_url="https://staging-api.hypergrowth.internal",
                    proof_metadata={"http_status": 200, "ssl_valid": True, "health_endpoint": "OK"},
                    verified_by_oracle=True,
                    verified_at=now - timedelta(hours=24),
                    auto_release_triggered=False,
                    created_at=now - timedelta(hours=24),
                )
            ],
        }

        # 5. Escrow Ledger
        self.ledger: List[EscrowLedgerResponse] = [
            EscrowLedgerResponse(
                id=uuid4(),
                contract_id=CONTRACT_1_ID,
                milestone_id=MS_1_1_ID,
                amount=5500.00,
                transaction_type=LedgerTxType.ESCROW_DEPOSIT,
                stripe_transfer_id="pi_dep_3N1042",
                created_at=t_minus_10d,
            ),
            EscrowLedgerResponse(
                id=uuid4(),
                contract_id=CONTRACT_1_ID,
                milestone_id=MS_1_1_ID,
                amount=5500.00,
                transaction_type=LedgerTxType.ORACLE_RELEASE,
                stripe_transfer_id="tr_rel_3N1042",
                created_at=t_minus_3d,
            ),
            EscrowLedgerResponse(
                id=uuid4(),
                contract_id=CONTRACT_1_ID,
                milestone_id=MS_1_2_ID,
                amount=7500.00,
                transaction_type=LedgerTxType.ESCROW_DEPOSIT,
                stripe_transfer_id="pi_dep_3N1043",
                created_at=t_minus_10d,
            ),
        ]

    # Queries
    def list_contracts(self) -> List[ContractResponse]:
        # Sync milestones list
        for c in self.contracts.values():
            c.milestones = [m for m in self.milestones.values() if m.contract_id == c.id]
        return list(self.contracts.values())

    def get_contract(self, cid: UUID) -> Optional[ContractResponse]:
        c = self.contracts.get(cid)
        if c:
            c.milestones = [m for m in self.milestones.values() if m.contract_id == c.id]
        return c

    def get_milestone(self, mid: UUID) -> Optional[MilestoneResponse]:
        return self.milestones.get(mid)

    def update_milestone(self, mid: UUID, **kwargs) -> Optional[MilestoneResponse]:
        m = self.milestones.get(mid)
        if not m:
            return None
        data = m.model_dump()
        for k, v in kwargs.items():
            if v is not None:
                data[k] = v
        updated = MilestoneResponse(**data)
        self.milestones[mid] = updated
        return updated

    def get_proofs(self, mid: UUID) -> List[DeliverableProofResponse]:
        return self.proofs.get(mid, [])

    def add_proof(self, proof: DeliverableProofResponse):
        if proof.milestone_id not in self.proofs:
            self.proofs[proof.milestone_id] = []
        self.proofs[proof.milestone_id].append(proof)

    def add_ledger_entry(self, entry: EscrowLedgerResponse):
        self.ledger.append(entry)

    def get_metrics(self) -> EscrowMetricsResponse:
        total_locked = sum(
            m.amount_usd
            for m in self.milestones.values()
            if m.status in (MilestoneStatus.FUNDED_IN_ESCROW, MilestoneStatus.DELIVERABLE_SUBMITTED, MilestoneStatus.IN_REVIEW)
        )
        total_rel = sum(
            m.amount_usd
            for m in self.milestones.values()
            if m.status == MilestoneStatus.RELEASED
        )
        auto_rel_count = sum(1 for m in self.milestones.values() if m.status == MilestoneStatus.RELEASED)

        return EscrowMetricsResponse(
            total_escrow_locked_usd=total_locked + 13000.0,
            total_released_usd=total_rel + 42500.0,
            active_contracts_count=len(self.contracts),
            auto_released_milestones_count=auto_rel_count + 18,
            avg_review_hours=38.4,
            oracle_verification_rate=98.5,
            dispute_rate=0.4,
        )


store = MilestoneStore()
