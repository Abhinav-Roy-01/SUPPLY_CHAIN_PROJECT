# 🚛 Supply Chain Command
### AI-Powered Logistics Intelligence Platform for Small Indian Transport Companies

> Google Solution Challenge 2026 — Smart Supply Chain Track

---

## 🌐 Live Demo
| | URL |
|---|---|
| **Frontend** | https://supply-chain-project-001.web.app |
| **Backend API** | https://biltybook-backend-758882460816.asia-south1.run.app/docs |
| **GitHub** | https://github.com/Abhinav-Roy-01/SUPPLY_CHAIN_PROJECT |

---

## 🎯 Problem
India has 8 million registered trucks. Small fleet owners (5–20 trucks) manage everything through paper, WhatsApp, and Excel — with zero visibility into trip risks, delay prediction, or route profitability. A single expired E-Way Bill costs ₹10,000+.

---

## 💡 Solution
A smart control tower that digitizes fleet operations and adds an AI layer on top — predicting delays before they happen, detecting cascade risks, and recommending optimal routes in real time.

---

## 🏗️ Architecture

```
Frontend (React + Firebase)
        ↓
Backend (FastAPI + Cloud Run)
        ↓
AI Layer (Gemini 2.0 Flash + ML Models)
        ↓
Data Sources (Weather API + Google Maps + Fastag)
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Trip Delay Predictor** | XGBoost model predicts delay probability before trip starts |
| **Cascade Risk Engine** | NetworkX graph shows how one delay affects 5+ downstream trips |
| **AI Copilot** | Gemini 2.0 Flash answers fleet queries in plain language |
| **Live Risk Dashboard** | Color-coded trip risk: Green → Yellow → Orange → Red |
| **E-Way Bill Tracker** | Alerts at 6hr, 2hr, and expiry — prevents ₹10,000 fines |
| **Route Heatmap** | Google Maps overlay showing profitable vs loss-making routes |
| **Bilty Management** | Digital lorry receipts with auto charge calculation |
| **Challan Generation** | Dispatch documents linked to bilty with truck health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| AI Copilot | Google Gemini 2.0 Flash |
| ML Models | XGBoost + NetworkX + Isolation Forest |
| Optimization | Google OR-Tools |
| Database | Firebase Realtime DB + PostgreSQL |
| Hosting | Firebase Hosting + Google Cloud Run |
| Alerts | WhatsApp Business API |
| OCR | Google Document AI |
| Maps | Google Maps Platform |

---

## 🚀 Local Setup

### Backend
```bash
cd SUPPLY_CHAIN_PROJECT/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd SUPPLY_CHAIN_PROJECT/frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` in `/backend`:
```
GEMINI_API_KEY=your_gemini_key
```

---

## 📦 Deployment

### Backend → Google Cloud Run
```bash
cd backend
gcloud run deploy biltybook-backend --source . --platform managed --region asia-south1 --allow-unauthenticated --port 8080
```

### Frontend → Firebase Hosting
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

---

## 🎬 Demo Flow (4 mins)
1. Create bilty — Delhi to Kanpur, 500kg perishable goods
2. Generate challan — truck health score: 82 ✅
3. Weather API triggers — heavy rain on NH19 in 4 hours
4. Delay predictor fires — **71% delay probability, +3 hours**
5. Cascade engine — **5 downstream deliveries at risk**
6. Rerouting recommended — NH58, saves 2 hours net
7. Operator accepts — consignee auto-notified
8. Trip completes — P&L: ₹8,500 − ₹2,420 = **₹6,080 net profit**

---

## 👥 Team
Built for Google Solution Challenge 2026 — Open Innovation, Smart Supply Chain theme.

---

*"BiltyBook Intelligence digitizes India's 8 million trucks — making every shipment smarter with AI that predicts delays, prevents cascades, and optimizes routes before problems happen."*
