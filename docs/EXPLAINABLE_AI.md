# Explainable AI & Transparent Scoring Architecture

Traditional black-box machine learning classifiers assign opaque threat scores without clarifying why an alert was triggered. CyberRakshak AI utilizes **Explainable AI (XAI)** principles, providing transparent weights, verifiable evidence, and plain-language reasoning.

---

## 1. Risk Scoring Formula

The Risk Score $S \in [0, 100]$ is computed using a composite heuristic scoring engine:

$$S = \min\left(100, \max(S_{\text{rules}}, S_{\text{ml}})\right)$$

Where:
- $S_{\text{rules}}$ is the cumulative weight of matched deterministic attack indicators.
- $S_{\text{ml}}$ is the scaled probability from the on-device TF-IDF classifier.
- Compound conditions (e.g. Urgency + KYC request, or OTP harvesting + Link) enforce a minimum floor of 75-80 (guaranteeing High Risk).

### Classification Tiers
- **0–29: Low Risk** (Green) — Normal structural syntax; standard transactional patterns.
- **30–69: Suspicious** (Amber/Yellow) — Anomalies present (shorteners, unusual ports, unverified senders).
- **70–100: High Risk** (Red) — Critical indicators detected (brand typosquatting, panic tactics, OTP theft).

---

## 2. URL Heuristic Weights

| Indicator | Weight | Description |
| :--- | :---: | :--- |
| **Numerical IP Address** | +45 | Direct IP address host bypassing registered domain DNS. |
| **Obfuscated IP Notation** | +45 | Hexadecimal, octal, or dword IP encoding tricks. |
| **Deceptive Brand Spoofing** | +35 | Targeted brand keyword (e.g. `paypal`, `sbi`) in unauthorized host. |
| **At-Symbol Redirect (`@`)** | +35 | Userinfo trick instructing browsers to redirect destination. |
| **Punycode / Homograph (`xn--`)**| +30 | Internationalized domain homograph spoofing Latin characters. |
| **High-Abuse TLD (`.xyz`, `.top`)** | +25 | TLD frequently automated by phishing toolkits. |
| **URL Shortener Service** | +25 | Conceals final URL destination (`bit.ly`, `tinyurl.com`). |
| **Excessive Subdomain Depth** | +20 | Hostname containing > 3 subdomains burying malicious domain. |
| **Non-Standard Web Port** | +20 | Use of ports other than 80 or 443 (e.g. `:8080`, `:4444`). |
| **Plain HTTP Protocol** | +15 | Unencrypted transmission channel. |

---

## 3. Natural Language Processing (NLP) Pipeline

The on-device message classifier operates via:
1. **Tokenization & N-Gram Extraction**: Extracts unigram and bigram tokens ($1 \le n \le 2$).
2. **TF-IDF Vectorization**: Term Frequency-Inverse Document Frequency matrix with top 400 feature limit.
3. **Multinomial Naive Bayes / Logistic Regression**: Rapid inference (< 5ms) without GPU or cloud dependency.
4. **Exact Span Highlighter**: Regex engine locates the start and end offsets of panic or sensitive phrases so the user can visually see which words triggered the alarm.

---

## 4. Multilingual Knowledge Base

The Explainable AI Security Assistant supports English, Hindi (हिंदी), and Gujarati (ગુજરાતી) using an on-device structured semantic intent matcher.

### Supported Domains:
1. **Phishing & Smishing Concepts**
2. **UPI Reverse Charge Scam Mechanics**
3. **Fake KYC & SIM Deactivation Threats**
4. **Typosquatting & Lookalike Domains**
5. **HTTPS Myths ("Padlock Does Not Mean Authentic")**
6. **Incident Response Protocol & Helpline 1930**
