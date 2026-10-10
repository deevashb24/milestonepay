"""
MilestonePay AI - FastAPI Main Server
Port 8015 - Autonomous Scope-of-Work Generator & Deliverable-Verified Milestone Escrow
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from fastapi import Body, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from backend.oracle import (
    generate_sow_from_notes,
    release_escrow_funds,
    verify_deliverable_proof,
)
from backend.store import (
    CONTRACT_1_ID,
    USER_CLIENT_ID,
    USER_DEV_ID,
    store,
)
from models.schemas import (
    ContractResponse,
    ContractStatus,
    DeliverableProofResponse,
    EscrowLedgerResponse,
    EscrowMetricsResponse,
    FundMilestonePayload,
    GenerateSOWPayload,
    LedgerTxType,
    MilestoneResponse,
    MilestoneStatus,
    OracleVerificationResult,
    SOWGenerationResult,
    SubmitDeliverablePayload,
    VerificationType,
)

app = FastAPI(
    title="MilestonePay AI",
    description="Autonomous Scope-of-Work Generator & Deliverable-Verified Milestone Escrow Protocol",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "MilestonePay AI",
        "escrow_vault_status": "SECURE",
        "stripe_connect_ready": True,
        "oracle_listeners_active": ["github_pr_merges", "vercel_deployments", "figma_reviews"],
    }


@app.get("/api/v1/metrics", response_model=EscrowMetricsResponse, tags=["Analytics"])
def get_escrow_metrics() -> EscrowMetricsResponse:
    return store.get_metrics()


# ============================================================================
# Contracts & AI SOW
# ============================================================================

@app.get("/api/v1/contracts", response_model=List[ContractResponse], tags=["Contracts"])
def list_contracts() -> List[ContractResponse]:
    return store.list_contracts()


@app.get("/api/v1/contracts/{id}", response_model=ContractResponse, tags=["Contracts"])
def get_contract(id: UUID) -> ContractResponse:
    contract = store.get_contract(id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")
    return contract


@app.post("/api/v1/contracts/generate-sow", response_model=ContractResponse, status_code=status.HTTP_201_CREATED, tags=["Contracts"])
def create_contract_from_sow(payload: GenerateSOWPayload) -> ContractResponse:
    now = datetime.now(timezone.utc)
    sow_result = generate_sow_from_notes(
        project_title=payload.project_title,
        raw_notes=payload.raw_scope_notes,
        total_budget=payload.total_budget_usd,
    )

    contract_id = uuid4()
    new_milestones: List[MilestoneResponse] = []

    for m_data in sow_result.suggested_milestones:
        mid = uuid4()
        m_obj = MilestoneResponse(
            id=mid,
            contract_id=contract_id,
            title=m_data["title"],
            description=m_data["description"],
            amount_usd=m_data["amount_usd"],
            status=MilestoneStatus.PENDING_FUNDING,
            verification_type=VerificationType(m_data["verification_type"]),
            verification_criteria=m_data["verification_criteria"],
            escrow_charge_id=None,
            review_window_expires_at=None,
            released_at=None,
            created_at=now,
        )
        store.milestones[mid] = m_obj
        new_milestones.append(m_obj)

    contract = ContractResponse(
        id=contract_id,
        freelancer_id=USER_DEV_ID,
        client_id=USER_CLIENT_ID,
        title=payload.project_title,
        total_value_usd=sow_result.total_value_usd,
        contract_status=ContractStatus.AWAITING_DEPOSIT,
        raw_scope_summary=payload.raw_scope_notes[:200],
        legal_agreement_text="\n".join(sow_result.legal_clauses),
        freelancer_signed_at=now,
        client_signed_at=None,
        milestones=new_milestones,
        created_at=now,
        updated_at=now,
    )
    store.contracts[contract_id] = contract
    return contract


# ============================================================================
# Milestones & Escrow Operations
# ============================================================================

@app.post("/api/v1/contracts/{id}/milestones/{milestone_id}/fund", response_model=MilestoneResponse, tags=["Escrow"])
def fund_milestone_escrow(id: UUID, milestone_id: UUID, payload: FundMilestonePayload) -> MilestoneResponse:
    now = datetime.now(timezone.utc)
    milestone = store.get_milestone(milestone_id)
    if not milestone or milestone.contract_id != id:
        raise HTTPException(status_code=404, detail="Milestone not found for this contract.")

    charge_id = f"ch_escrow_{uuid4().hex[:10]}"
    store.add_ledger_entry(
        EscrowLedgerResponse(
            id=uuid4(),
            contract_id=id,
            milestone_id=milestone_id,
            amount=milestone.amount_usd,
            transaction_type=LedgerTxType.ESCROW_DEPOSIT,
            stripe_transfer_id=charge_id,
            created_at=now,
        )
    )

    updated = store.update_milestone(
        milestone_id,
        status=MilestoneStatus.FUNDED_IN_ESCROW,
        escrow_charge_id=charge_id,
    )
    return updated or milestone


@app.post("/api/v1/contracts/{id}/milestones/{milestone_id}/verify-oracle", response_model=OracleVerificationResult, tags=["Oracle"])
def trigger_oracle_verification(id: UUID, milestone_id: UUID, payload: SubmitDeliverablePayload) -> OracleVerificationResult:
    milestone = store.get_milestone(milestone_id)
    if not milestone or milestone.contract_id != id:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    try:
        result = verify_deliverable_proof(
            milestone_id=milestone_id,
            proof_url=payload.proof_url,
            commit_sha=payload.commit_sha,
            deploy_url=payload.deploy_url,
            ds=store,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/contracts/{id}/milestones/{milestone_id}/release", response_model=MilestoneResponse, tags=["Escrow"])
def release_milestone_escrow(id: UUID, milestone_id: UUID) -> MilestoneResponse:
    milestone = store.get_milestone(milestone_id)
    if not milestone or milestone.contract_id != id:
        raise HTTPException(status_code=404, detail="Milestone not found.")

    try:
        released = release_escrow_funds(milestone_id=milestone_id, ds=store)
        return released
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/contracts/{id}/milestones/{milestone_id}/proofs", response_model=List[DeliverableProofResponse], tags=["Oracle"])
def get_milestone_proofs(id: UUID, milestone_id: UUID) -> List[DeliverableProofResponse]:
    return store.get_proofs(milestone_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8015, reload=True)
