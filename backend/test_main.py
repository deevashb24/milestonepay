"""
MilestonePay AI - Unit, Integration & Adversarial Stress Tests
Validates Health, Metrics, AI Scope Generation, Escrow Deposit Locking, Oracle Verification & Auto-Release
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.store import (
    CONTRACT_1_ID,
    MS_1_1_ID,
    MS_1_2_ID,
    MS_1_3_ID,
    store,
)
from models.schemas import MilestoneStatus

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store_state():
    store.reset()
    yield
    store.reset()


def test_health_check():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["escrow_vault_status"] == "SECURE"
    assert "github_pr_merges" in data["oracle_listeners_active"]


def test_platform_metrics():
    res = client.get("/api/v1/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_escrow_locked_usd"] > 0
    assert data["total_released_usd"] > 0
    assert data["active_contracts_count"] >= 2
    assert data["oracle_verification_rate"] >= 95.0


def test_list_and_get_contract():
    res = client.get("/api/v1/contracts")
    assert res.status_code == 200
    contracts = res.json()
    assert len(contracts) >= 2

    c_res = client.get(f"/api/v1/contracts/{CONTRACT_1_ID}")
    assert c_res.status_code == 200
    contract = c_res.json()
    assert contract["title"] == "HyperGrowth AI Platform Architecture & Pipeline"
    assert len(contract["milestones"]) == 3


def test_generate_sow_from_unstructured_notes():
    payload = {
        "project_title": "Fintech Mobile Wallet MVP",
        "client_email": "founder@payneo.io",
        "raw_scope_notes": "We need user KYC onboarding with Persona API, Plaid ACH bank account linking, and a clean mobile dashboard in React Native with unit tests.",
        "total_budget_usd": 15000.0,
    }
    res = client.post("/api/v1/contracts/generate-sow", json=payload)
    assert res.status_code == 201
    contract = res.json()

    assert contract["title"] == "Fintech Mobile Wallet MVP"
    assert contract["total_value_usd"] == 15000.0
    assert len(contract["milestones"]) == 3
    # Milestones sum to total
    m_sum = sum(m["amount_usd"] for m in contract["milestones"])
    assert m_sum == 15000.0


def test_fund_milestone_in_escrow():
    # Fund Milestone 3 (initially FUNDED_IN_ESCROW or PENDING_FUNDING)
    res = client.post(
        f"/api/v1/contracts/{CONTRACT_1_ID}/milestones/{MS_1_3_ID}/fund",
        json={"payment_method_id": "pm_card_mastercard"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "FUNDED_IN_ESCROW"
    assert data["escrow_charge_id"] is not None


def test_trigger_oracle_verification_and_72h_clock():
    # Submit deliverable for Milestone 3
    payload = {
        "proof_url": "https://github.com/hypergrowth/platform/pull/58",
        "commit_sha": "d38f192",
    }
    res = client.post(
        f"/api/v1/contracts/{CONTRACT_1_ID}/milestones/{MS_1_3_ID}/verify-oracle",
        json=payload,
    )
    assert res.status_code == 200
    data = res.json()

    assert data["verified"] is True
    assert data["status"] == "IN_REVIEW"
    assert data["review_window_hours"] == 72
    assert data["review_window_expires_at"] is not None

    # Check proofs
    proofs_res = client.get(f"/api/v1/contracts/{CONTRACT_1_ID}/milestones/{MS_1_3_ID}/proofs")
    assert proofs_res.status_code == 200
    proofs = proofs_res.json()
    assert len(proofs) == 1
    assert proofs[0]["verified_by_oracle"] is True


def test_release_escrow_funds():
    # Milestone 2 is currently IN_REVIEW
    res = client.post(f"/api/v1/contracts/{CONTRACT_1_ID}/milestones/{MS_1_2_ID}/release")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "RELEASED"
    assert data["released_at"] is not None


def test_adversarial_invalid_contract_or_milestone():
    from uuid import uuid4
    fake_id = uuid4()
    res = client.get(f"/api/v1/contracts/{fake_id}")
    assert res.status_code == 404

    fund_res = client.post(
        f"/api/v1/contracts/{CONTRACT_1_ID}/milestones/{fake_id}/fund",
        json={"payment_method_id": "pm_card_visa"},
    )
    assert fund_res.status_code == 404
