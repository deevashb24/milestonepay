"""
MilestonePay AI - Strict Pydantic v2 Models & API Data Contracts
Autonomous Scope-of-Work Generator & Deliverable-Verified Milestone Escrow
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class UserRole(str, Enum):
    FREELANCER = "FREELANCER"
    AGENCY = "AGENCY"
    CLIENT = "CLIENT"


class ContractStatus(str, Enum):
    DRAFT = "DRAFT"
    AWAITING_DEPOSIT = "AWAITING_DEPOSIT"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DISPUTED = "DISPUTED"


class MilestoneStatus(str, Enum):
    PENDING_FUNDING = "PENDING_FUNDING"
    FUNDED_IN_ESCROW = "FUNDED_IN_ESCROW"
    DELIVERABLE_SUBMITTED = "DELIVERABLE_SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    RELEASED = "RELEASED"
    DISPUTED = "DISPUTED"


class VerificationType(str, Enum):
    GITHUB_PR = "GITHUB_PR"
    VERCEL_DEPLOY = "VERCEL_DEPLOY"
    FIGMA_APPROVAL = "FIGMA_APPROVAL"
    MANUAL_SIGN_OFF = "MANUAL_SIGN_OFF"


class LedgerTxType(str, Enum):
    ESCROW_DEPOSIT = "ESCROW_DEPOSIT"
    ORACLE_RELEASE = "ORACLE_RELEASE"
    DISPUTE_REFUND = "DISPUTE_REFUND"


# ============================================================================
# User & Contract Models
# ============================================================================

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    role: UserRole
    stripe_account_id: Optional[str] = None
    created_at: datetime


class MilestoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    title: str
    description: str
    amount_usd: float
    status: MilestoneStatus
    verification_type: VerificationType
    verification_criteria: Dict[str, Any]
    escrow_charge_id: Optional[str] = None
    review_window_expires_at: Optional[datetime] = None
    released_at: Optional[datetime] = None
    created_at: datetime


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    freelancer_id: UUID
    client_id: UUID
    title: str
    total_value_usd: float
    contract_status: ContractStatus
    raw_scope_summary: str
    legal_agreement_text: str
    freelancer_signed_at: Optional[datetime] = None
    client_signed_at: Optional[datetime] = None
    milestones: List[MilestoneResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


# ============================================================================
# Deliverable Proofs & Escrow Ledger
# ============================================================================

class DeliverableProofResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    milestone_id: UUID
    proof_type: VerificationType
    proof_url: str
    proof_metadata: Dict[str, Any]
    verified_by_oracle: bool = False
    verified_at: Optional[datetime] = None
    auto_release_triggered: bool = False
    created_at: datetime


class EscrowLedgerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    contract_id: UUID
    milestone_id: UUID
    amount: float
    transaction_type: LedgerTxType
    stripe_transfer_id: str
    created_at: datetime


# ============================================================================
# AI Scope Generation & Oracle Payloads
# ============================================================================

class GenerateSOWPayload(BaseModel):
    project_title: str
    client_email: str = "client@acme.inc"
    raw_scope_notes: str = Field(..., min_length=20)
    total_budget_usd: Optional[float] = None


class SOWGenerationResult(BaseModel):
    title: str
    total_value_usd: float
    suggested_milestones: List[Dict[str, Any]]
    legal_clauses: List[str]


class FundMilestonePayload(BaseModel):
    payment_method_id: str = "pm_card_visa"


class SubmitDeliverablePayload(BaseModel):
    proof_url: str
    commit_sha: Optional[str] = "a948fb1"
    deploy_url: Optional[str] = None


class OracleVerificationResult(BaseModel):
    milestone_id: UUID
    status: MilestoneStatus
    verified: bool
    review_window_hours: int = 72
    review_window_expires_at: Optional[datetime] = None
    auto_release_status: str
    message: str


# ============================================================================
# Platform Metrics
# ============================================================================

class EscrowMetricsResponse(BaseModel):
    total_escrow_locked_usd: float
    total_released_usd: float
    active_contracts_count: int
    auto_released_milestones_count: int
    avg_review_hours: float
    oracle_verification_rate: float
    dispute_rate: float
