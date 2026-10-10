# Running MilestonePay AI Locally

### Backend Server (FastAPI)
```bash
cd /Users/deevash/.gemini/antigravity/scratch/milestonepay
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8015 --reload
```
- API Docs: http://localhost:8015/docs
- Health Check: http://localhost:8015/api/v1/health

### Frontend Console (Next.js 16)
```bash
cd /Users/deevash/.gemini/antigravity/scratch/milestonepay/frontend
npm run dev -- -p 3015
```
- Web Application: http://localhost:3015
