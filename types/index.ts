export type UserRole = 'FREELANCER' | 'AGENCY' | 'CLIENT';

export type ContractStatus =
  | 'DRAFT'
  | 'AWAITING_DEPOSIT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED';

export type MilestoneStatus =
  | 'PENDING_FUNDING'
  | 'FUNDED_IN_ESCROW'
  | 'DELIVERABLE_SUBMITTED'
  | 'IN_REVIEW'
  | 'RELEASED'
  | 'DISPUTED';

export type VerificationType =
  | 'GITHUB_PR'
  | 'VERCEL_DEPLOY'
  | 'FIGMA_APPROVAL'
  | 'MANUAL_SIGN_OFF';

export type LedgerTxType =
  | 'ESCROW_DEPOSIT'
  | 'ORACLE_RELEASE'
  | 'DISPUTE_REFUND';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  stripe_account_id?: string | null;
  created_at: string;
}

export interface ContractMilestone {
  id: string;
  contract_id: string;
  title: string;
  description: string;
  amount_usd: number;
  status: MilestoneStatus;
  verification_type: VerificationType;
  verification_criteria: Record<string, unknown>;
  escrow_charge_id?: string | null;
  review_window_expires_at?: string | null;
  released_at?: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  freelancer_id: string;
  client_id: string;
  title: string;
  total_value_usd: number;
  contract_status: ContractStatus;
  raw_scope_summary: string;
  legal_agreement_text: string;
  freelancer_signed_at?: string | null;
  client_signed_at?: string | null;
  milestones: ContractMilestone[];
  created_at: string;
  updated_at: string;
}

export interface DeliverableProof {
  id: string;
  milestone_id: string;
  proof_type: VerificationType;
  proof_url: string;
  proof_metadata: Record<string, unknown>;
  verified_by_oracle: boolean;
  verified_at?: string | null;
  auto_release_triggered: boolean;
  created_at: string;
}

export interface EscrowMetrics {
  total_escrow_locked_usd: number;
  total_released_usd: number;
  active_contracts_count: number;
  auto_released_milestones_count: number;
  avg_review_hours: number;
  oracle_verification_rate: number;
  dispute_rate: number;
}
