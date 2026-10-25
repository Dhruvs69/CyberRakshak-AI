# 🛡️ CyberRakshak AI
### On-Device Threat, Phishing & Scam Detection Engine

> **Privacy-First • Explainable AI • Edge & ARM-Compatible • 100% On-Device (Zero Cloud Data Egress)**

CyberRakshak AI is a modern cybersecurity assistant engineered to detect phishing URLs, scam SMS messages, fraudulent payment requests, suspicious QR codes, and network anomalies entirely on local device hardware.

---

## 🌟 Key Highlights & Architectural Strengths

- **100% On-Device Privacy**: Operates without third-party paid AI APIs or external cloud logging.
- **ARM Edge Optimized**: Designed for lightweight execution on Raspberry Pi 4/5, NVIDIA Jetson, Apple Silicon, and edge micro-servers (typical RAM footprint < 150 MB).
- **Explainable AI (XAI)**: Every risk score (0–100) provides transparent warning indicators, evidence inspection, and practical defensive actions.
- **Multilingual Support**: Interactive security assistant answers queries in **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.
- **Comprehensive Audit Vault**: Persistent local SQLite database with CSV/JSON export and zero storage of passwords or sensitive OTPs.

---

## 🧭 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React icons, Recharts analytics.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Uvicorn.
- **Machine Learning & NLP**: Scikit-learn (TF-IDF Vectorizer + Naive Bayes/Logistic Regression), lexical heuristic rule engines.
- **Computer Vision & Decoding**: OpenCV `QRCodeDetector` (100% local, no external binaries required), Pillow, Tesseract OCR fallback.
- **Storage**: SQLite local database (`cyberrakshak.db`).
- **Containerization**: Multi-stage Docker & Docker Compose with ARM64/AMD64 support.

---

## 🖥️ User Interface Pages

CyberRakshak AI provides 10 dedicated operational pages:

1. **Dashboard**: High-level Security Operations Center (SOC) telemetry, 5 core metric cards, threat breakdown charts, activity timeline, and zero-state validation.
2. **AI Phishing URL Detector**: Lexical structure analysis, punycode/IDN homograph attacks, IP-address URLs, brand typosquatting, and URL shortener detection.
3. **AI SMS & Message Scam Detector**: NLP and rule-based inspection for fake KYC deactivations, electricity disconnection panic threats, lottery fraud, and UPI cashback traps with exact phrase highlighting.
4. **Screenshot Scam Detector**: Local image upload, Tesseract OCR text extraction, embedded URL parsing, and manual text extraction fallback.
5. **QR Code Security Scanner**: On-device OpenCV decoding, payment deep-link (`upi://pay`) analysis, payee VPA inspection, and phishing warnings.
6. **Network Anomaly Monitor**: Ingests network flow CSVs, identifies port scanning sweeps (10+ ports probed), connection floods, and traffic spikes.
7. **Explainable AI Security Assistant**: Conversational cybersecurity advisor explaining attack mechanics and remedies in English, Hindi, and Gujarati.
8. **Threat History**: Persistent audit log with full-text search, multi-factor filtering, detail inspection modals, and CSV/JSON export.
9. **Security Operations Reports**: Executive compliance audit summary with printable PDF-ready formatting.
10. **Settings & Edge Configuration**: Hardware telemetry, custom scoring thresholds, history toggle, and automated on-device test runner.
11. **About CyberRakshak AI**: Technical pillars, Indian National Cyber Crime Helpline (**1930**) integration, and ethical disclosure.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Python 3.10+** (Tested on Python 3.11, 3.12, 3.13)
- **Node.js 18+** & **npm** (for building or customizing the frontend)

---

### Method 1: Unified Quickstart (Recommended)

1. Clone or navigate to the repository directory:
   ```bash
   cd C:\Users\solan\.gemini\antigravity\scratch\Cyber-Citedal
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run the unified launcher:
   ```bash
   python run_cyberrakshak.py
   ```
   *The launcher starts the FastAPI backend, mounts the pre-compiled React dashboard, and automatically opens your browser at:*
   👉 **`http://localhost:8000`**

---

### Method 2: Development Mode (Hot-Reload)

To run backend and frontend independently during active development:

**Terminal 1 — Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** (Vite proxies all `/api` requests to backend at port 8000).

---

### Method 3: Docker Deployment

```bash
docker compose up -d --build
```
Access the application at `http://localhost:8000`.

---

## 🧪 Automated Testing Suite

CyberRakshak AI includes an automated unit test suite covering:
- Legitimate and malicious URLs (punycode, shorteners, IP addresses, empty inputs, malformed URLs).
- Transactional messages vs. urgent fake KYC and lottery scam SMS.
- UPI QR code payment payload analysis.
- Baseline network traffic vs. port scanning sweeps and malformed CSV files.
- Multilingual explanation engines (English, Hindi, Gujarati).
- Database CRUD persistence and telemetry integrity.

To execute tests via CLI:
```bash
cd backend
python -m pytest tests/test_detectors.py -v
```

*Or click **Run Test Suite** directly inside the application's **Settings & Edge** page!*

---

## 📊 Sample Datasets for Evaluation

Synthetic, clearly labeled test datasets are provided in `data/sample_data/`:
- `urls_sample.json`: Safe government portals vs. `.xyz` KYC phishing and IP logins.
- `messages_sample.json`: Bank KYC threats, electricity disconnections, lottery claims, UPI traps, and clean notifications.
- `network_sample.csv`: Port scanning sweeps and exploit port interactions.
- `network_clean.csv`: Clean baseline enterprise traffic flows.

---

## 🔐 Privacy & Security Guarantees

1. **Zero External Data Leakage**: No user-submitted screenshots, messages, or URLs are transmitted across the internet.
2. **Safe Inspection**: Analyzed URLs are parsed lexically and never requested or opened automatically.
3. **Sanitized Storage**: Passwords, banking OTPs, and private identifiers are scrubbed prior to SQLite persistence.

---

## 📞 Emergency Assistance (India)

If you have fallen victim to financial cyber fraud or shared banking OTPs:
- **National Cyber Crime Helpline**: **1930**
- **Official Reporting Portal**: [https://cybercrime.gov.in](https://cybercrime.gov.in)
