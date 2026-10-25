# Offline & Air-Gapped Verification Protocol

A primary requirement of CyberRakshak AI is **100% On-Device, Offline Operation**.
This document outlines how evaluators, hackathon judges, and security engineers can verify that detection capabilities function when network connectivity is severed.

---

## 1. Disconnect Internet Connectivity

You can verify offline capabilities using any of the following methods:
1. **Physical**: Disconnect the Ethernet cable and toggle Wi-Fi OFF on your machine.
2. **Software**: Disable network adapter via settings or terminal.
3. **Simulated**: Toggle "Simulated Disconnected Operation Mode" in CyberRakshak's Settings page.

---

## 2. Execute Detection Tests in Disconnected State

### Test 1: AI Phishing URL Scanner
1. Open `http://localhost:8000` in your web browser.
2. Navigate to **URL Scanner**.
3. Input or click sample:
   ```
   http://paypa1-security-verification.xyz/account/login
   ```
4. Click **Scan URL**.
5. **Expected Outcome**:
   - Analysis executes in < 30ms.
   - Classification: **High Risk** (Score 70+).
   - Flagged indicators: Deceptive brand impersonation (`PAYPAL`), suspicious TLD (`.xyz`), credential harvesting path.
   - Evidence confirms: No outbound HTTP/DNS requests were dispatched.

---

### Test 2: AI SMS / Scam Message Scanner
1. Navigate to **SMS & Email Scam**.
2. Input test message:
   ```
   Your bank account will be blocked today. Click the link to update your KYC immediately.
   ```
3. Click **Inspect Message**.
4. **Expected Outcome**:
   - Classification: **High Risk** (Score 75+).
   - Deceptive and urgent phrases highlighted (`blocked today`, `update your kyc`).
   - Action recommendation: Contact bank through official app; never share OTP.

---

### Test 3: QR Code Decoder & UPI Inspector
1. Navigate to **QR Code Scanner**.
2. Click sample **UPI Scam QR** or upload any test QR image.
3. Click **Inspect QR Payload**.
4. **Expected Outcome**:
   - OpenCV `QRCodeDetector` decodes the payload completely locally in RAM.
   - Identifies `upi://pay` protocol and extracts Payee VPA and Merchant name.
   - Highlights safety warning: "Never enter a UPI PIN to receive money."

---

### Test 4: Network Flow Anomaly Monitor
1. Navigate to **Network Monitor**.
2. Click **Port-Scan & C2 Attack** sample or upload a flow CSV.
3. Click **Analyze Network Flow**.
4. **Expected Outcome**:
   - Flags reconnaissance sweep across 10+ ports.
   - Visualizes packet timeline via Recharts without cloud charting dependencies.

---

### Test 5: Built-in Unit Test Harness
1. Navigate to **Settings & Edge**.
2. Click **Run Test Suite**.
3. All 15 unit tests execute and pass 100% on-device.
