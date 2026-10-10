# MilestonePay AI 🛡️
> **Autonomous Scope-of-Work Generator & Deliverable-Verified Milestone Escrow Protocol**

MilestonePay AI protects software freelancers, design studios, and engineering agencies from non-paying clients and endless scope creep. It transforms informal Slack threads and PRD notes into binding milestone agreements, locks client funds in isolated Stripe Connect escrow vaults, and automatically releases payouts upon cryptographic verification by delivery oracles (GitHub PR merge, Vercel staging HTTP 200 check, Figma review), backed by an unconditional 72-hour auto-release guarantee.

---

## ⚡ Core Features
- **AI SOW Generator**: Decomposes messy notes into 3 phased technical milestones with objective acceptance criteria.
- **Automated Delivery Oracles**: Listens to GitHub PR merges and Vercel staging deploys to verify technical delivery without manual client nagging.
- **Fail-Safe 72-Hour Auto-Release**: Initiates a 72-hour dispute window upon oracle verification. If no dispute is filed, funds release to contractor automatically.
- **Stripe Connect Escrow Vaults**: True escrow protection holding funds isolated until deliverables pass.

---

## 🚀 Local Deployment

### Backend Server (FastAPI)
```bash
cd backend
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8015 --reload
```
- API Docs: [http://localhost:8015/docs](http://localhost:8015/docs)
- Health Check: [http://localhost:8015/api/v1/health](http://localhost:8015/api/v1/health)

### Frontend Console (Next.js 16)
```bash
cd frontend
npm run dev -- -p 3015
```
- Web Application: [http://localhost:3015](http://localhost:3015)

---

## 🧪 Testing Suite
```bash
pytest backend/test_main.py -v
```
All 8 unit, integration, and oracle verification tests pass with 100% success rate.
