import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['FREELANCER', 'AGENCY', 'CLIENT']);

export const contractStatusEnum = pgEnum('contract_status', [
  'DRAFT',
  'AWAITING_DEPOSIT',
  'IN_PROGRESS',
  'COMPLETED',
  'DISPUTED',
]);

export const milestoneStatusEnum = pgEnum('milestone_status', [
  'PENDING_FUNDING',
  'FUNDED_IN_ESCROW',
  'DELIVERABLE_SUBMITTED',
  'IN_REVIEW',
  'RELEASED',
  'DISPUTED',
]);

export const verificationTypeEnum = pgEnum('verification_type', [
  'GITHUB_PR',
  'VERCEL_DEPLOY',
  'FIGMA_APPROVAL',
  'MANUAL_SIGN_OFF',
]);

export const ledgerTxTypeEnum = pgEnum('ledger_tx_type', [
  'ESCROW_DEPOSIT',
  'ORACLE_RELEASE',
  'DISPUTE_REFUND',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('FREELANCER').notNull(),
  stripeAccountId: varchar('stripe_account_id', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  freelancerId: uuid('freelancer_id')
    .references(() => users.id)
    .notNull(),
  clientId: uuid('client_id')
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  totalValueUsd: numeric('total_value_usd', { precision: 10, scale: 2 }).notNull(),
  contractStatus: contractStatusEnum('contract_status').default('DRAFT').notNull(),
  rawScopeSummary: text('raw_scope_summary').notNull(),
  legalAgreementText: text('legal_agreement_text').notNull(),
  freelancerSignedAt: timestamp('freelancer_signed_at', { withTimezone: true }),
  clientSignedAt: timestamp('client_signed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const contractMilestones = pgTable(
  'contract_milestones',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contractId: uuid('contract_id')
      .references(() => contracts.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description').notNull(),
    amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
    status: milestoneStatusEnum('status').default('PENDING_FUNDING').notNull(),
    verificationType: verificationTypeEnum('verification_type').default('GITHUB_PR').notNull(),
    verificationCriteria: jsonb('verification_criteria').notNull(),
    escrowChargeId: varchar('escrow_charge_id', { length: 100 }),
    reviewWindowExpiresAt: timestamp('review_window_expires_at', { withTimezone: true }),
    releasedAt: timestamp('released_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    contractIdx: index('idx_milestones_contract').on(table.contractId),
  })
);

export const deliverableProofs = pgTable('deliverable_proofs', {
  id: uuid('id').defaultRandom().primaryKey(),
  milestoneId: uuid('milestone_id')
    .references(() => contractMilestones.id, { onDelete: 'cascade' })
    .notNull(),
  proofType: verificationTypeEnum('proof_type').notNull(),
  proofUrl: varchar('proof_url', { length: 512 }).notNull(),
  proofMetadata: jsonb('proof_metadata').notNull(),
  verifiedByOracle: boolean('verified_by_oracle').default(false).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  autoReleaseTriggered: boolean('auto_release_triggered').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const escrowLedger = pgTable('escrow_ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  contractId: uuid('contract_id')
    .references(() => contracts.id, { onDelete: 'cascade' })
    .notNull(),
  milestoneId: uuid('milestone_id')
    .references(() => contractMilestones.id, { onDelete: 'cascade' })
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  transactionType: ledgerTxTypeEnum('transaction_type').notNull(),
  stripeTransferId: varchar('stripe_transfer_id', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
