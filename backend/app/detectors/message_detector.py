import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# Synthetic training dataset of common phishing / scam SMS & legitimate messages
TRAINING_SAMPLES = [
    # Phishing / Scams
    ("Your SBI account has been suspended today. Click http://sbi-kyc-verify.net to update KYC immediately.", 1),
    ("Dear customer, your electricity power will be disconnected tonight at 9:30 PM. Call electricity officer at 9876543210 immediately.", 1),
    ("Congratulations! You have won Rs 25,00,000 in Kaun Banega Crorepati lucky draw lottery. Send WhatsApp to claim.", 1),
    ("Part-time job offer! Earn Rs 2,000 to 8,000 daily by liking YouTube videos. Contact HR on Telegram @EarnDailyNow.", 1),
    ("Your HDFC credit card reward points worth Rs 9,850 are expiring today. Redeem cash directly to your bank account at http://hdfc-rewards-redeem.com", 1),
    ("Income Tax Department Notice: Refund of Rs 15,490 approved. Submit your bank account number and UPI PIN at http://it-refund.in to receive.", 1),
    ("Alert: Unusual login detected from Russia. Send the 6-digit OTP code to verify your Google account or it will be locked.", 1),
    ("Send the 6-digit OTP code to verify your Google account or it will be locked.", 1),
    ("India Post: Your package cannot be delivered due to incomplete address. Update your address and pay re-delivery fee of Rs 25 at link.", 1),
    ("Your SIM card will be deactivated within 24 hours due to non-verification of Aadhaar. Call customer care 8887776655.", 1),
    ("Dear user, cashback of Rs 3,000 is waiting in your PhonePe wallet. Click link and enter your UPI PIN to receive money in bank account.", 1),
    ("URGENT: Install AnyDesk app on your mobile and share 9-digit code for remote technical support from Bank manager.", 1),
    ("Police notice: Arrest warrant issued for money laundering. Contact CBI officer on WhatsApp immediately to avoid arrest.", 1),
    ("Loan approved without CIBIL score! Get Rs 5 Lakh instantly. Download and install quick-loan.apk from this link.", 1),
    ("Your Netflix membership is on hold because your payment failed. Update payment details immediately at http://netflix-billing-update.com", 1),
    ("Your bank account will be blocked today. Click the link to update your KYC immediately.", 1),
    ("Congratulations! You have won Rs 50,00,000 in Kaun Banega Crorepati lucky draw. Call 9876543210 to claim.", 1),

    # Legitimate Messages
    ("Your OTP for HDFC Bank NetBanking transaction of INR 450.00 is 839201. Valid for 10 minutes. Do not share with anyone.", 0),
    ("Your order #8928374 has been shipped via BlueDart. Track delivery at https://www.amazon.in/orders", 0),
    ("Your order #89283 has been delivered by BlueDart. Have a nice day!", 0),
    ("Dear Customer, your account XX1209 has been credited with INR 5,200.00 on 24-Oct-2026. Avail Bal: INR 34,210.00 - State Bank of India.", 0),
    ("Hi Rohit, are we still meeting for lunch at 1 PM today near the office?", 0),
    ("Hey Rohit, let us meet for lunch at 1 PM today near the office.", 0),
    ("Your appointment with Dr. Sharma is confirmed for tomorrow at 4:30 PM at Apollo Clinic.", 0),
    ("Flight 6E-204 from Delhi to Mumbai is on time. Web check-in is open at https://www.goindigo.in", 0),
    ("Dear parent, school will remain closed tomorrow on account of public holiday. Online classes resume Monday.", 0),
    ("Your monthly electricity bill for meter #4928 is INR 1,420. Due date is 05-Nov-2026. Pay via official portal.", 0),
    ("Welcome to GitHub! Please verify your email address to complete your registration.", 0),
    ("Your Swiggy order from Domino's Pizza is being prepared. Estimated delivery time: 25 minutes.", 0)
]

# Train lightweight TF-IDF model on initialization
_vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=500)
_X_train = _vectorizer.fit_transform([text for text, label in TRAINING_SAMPLES])
_y_train = [label for text, label in TRAINING_SAMPLES]
_model = MultinomialNB()
_model.fit(_X_train, _y_train)

# Rule-based scam patterns and categories with robust regex
SCAM_PATTERNS = [
    {
        "category": "Urgency & Fear Tactic",
        "weight": 35,
        "regex": r"(blocked\s+today|suspended\s+today|disconnected\s+tonight|within\s+\d+\s*(hours|hrs|mins)|immediate(ly)?|urgent(ly)?|action\s+required|deactivated|cancelled\s+today|arrest\s+warrant|(?:will\s+be\s+|is\s+)?(?:locked|suspended|blocked|frozen|disabled|deactivated))",
        "explanation": "Creates artificial panic and urgency to rush you into making unverified decisions."
    },
    {
        "category": "Credential & OTP Harvesting",
        "weight": 45,
        "regex": r"((?:share|send|enter|provide|give|submit|reply\s+with)\s+(?:the\s+)?(?:[a-zA-Z0-9-]+\s+)?(?:otp|pin|cvv|password|passcode|code|secret)|enter\s+upi\s+pin\s+to\s+receive|enter\s+pin\s+to\s+credit|(?:6|six|4|four)[- ]digit\s+(?:otp|pin|code)|(?:otp|verification)\s+code)",
        "explanation": "Requests your private OTP, password, or PIN. Remember: You NEVER need to enter a UPI PIN to receive money."
    },
    {
        "category": "Fake KYC / Document Update",
        "weight": 40,
        "regex": r"(update\s+(?:your\s+)?kyc|kyc\s+(?:is\s+)?suspended|pan\s+card\s+blocked|aadhaar\s+verification|kyc\s+expired|link\s+pan|verify\s+(?:your\s+)?kyc)",
        "explanation": "Exploits banking KYC compliance fears to steal identity documents and banking credentials."
    },
    {
        "category": "Prize / Lottery / Cashback Scam",
        "weight": 45,
        "regex": r"(won\s+(?:rs|inr|\$|\d)|lottery|lucky\s+draw|cashback\s+credited|kbc\s+prize|kaun\s+banega\s+crorepati|reward\s+points\s+worth|claim\s+cash)",
        "explanation": "Entices with unexpected financial rewards or prizes requiring upfront fees or banking access."
    },
    {
        "category": "Remote Access / Malicious App",
        "weight": 45,
        "regex": r"(install\s+(anydesk|teamviewer|quicksupport|rustdesk)|\.apk\b|download\s+app\s+from\s+link)",
        "explanation": "Asks you to download dangerous APKs or remote screen-sharing apps that grant attackers full phone control."
    },
    {
        "category": "Work-from-Home / Part-Time Scam",
        "weight": 30,
        "regex": r"(part[- ]time\s+job|like\s+youtube\s+videos|earn\s+rs\s*\d+.*daily|contact\s+on\s+telegram)",
        "explanation": "Common task/pre-payment employment scam operating primarily via unverified messaging channels."
    },
    {
        "category": "Embedded Suspicious Link",
        "weight": 20,
        "regex": r"(https?://[^\s]+|bit\.ly/[^\s]+|tinyurl\.com/[^\s]+)",
        "explanation": "Directs user away from official applications to an unverified external website."
    }
]

def analyze_message(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    indicators: List[str] = []
    highlighted_phrases: List[Dict[str, Any]] = []
    recommendations: List[str] = []
    evidence: Dict[str, Any] = {}
    
    if not text:
        return {
            "risk_score": 0,
            "classification": "Low Risk",
            "highlighted_phrases": [],
            "indicators": ["Empty message text provided."],
            "evidence": {"is_empty": True},
            "explanation": "Insufficient information to determine risk confidently. Please provide text to analyze.",
            "recommendations": ["Paste message text from SMS, WhatsApp, or email."]
        }

    rule_score = 0
    matched_categories = []

    # Apply Rule-Based Pattern Matchers
    for rule in SCAM_PATTERNS:
        matches = list(re.finditer(rule["regex"], text, re.IGNORECASE))
        if matches:
            matched_categories.append(rule["category"])
            rule_score += rule["weight"]
            indicators.append(f"{rule['category']}: {rule['explanation']}")
            for m in matches:
                matched_span = m.group()
                highlighted_phrases.append({
                    "text": matched_span,
                    "category": rule["category"],
                    "start": m.start(),
                    "end": m.end()
                })

    # Machine Learning TF-IDF Inference
    try:
        X_test = _vectorizer.transform([text])
        ml_prob = float(_model.predict_proba(X_test)[0][1])
        evidence["ml_scam_probability"] = round(ml_prob * 100, 1)
        evidence["ml_model"] = "Local TF-IDF + Naive Bayes (On-Device)"
    except Exception:
        ml_prob = 0.0
        evidence["ml_scam_probability"] = 0.0

    # Calculate final score
    if len(matched_categories) == 0:
        # No rules matched: If ML model has high probability, flag as suspicious; otherwise Low Risk
        if ml_prob >= 0.8:
            final_score = int(ml_prob * 60)
        else:
            final_score = int(ml_prob * 20)
    else:
        # High-risk compound patterns
        has_urgency = "Urgency & Fear Tactic" in matched_categories
        has_kyc = "Fake KYC / Document Update" in matched_categories
        has_otp = "Credential & OTP Harvesting" in matched_categories
        has_prize = "Prize / Lottery / Cashback Scam" in matched_categories
        has_remote = "Remote Access / Malicious App" in matched_categories
        
        if (has_urgency and has_kyc) or (has_urgency and has_otp) or has_otp or has_remote or has_prize or rule_score >= 60:
            final_score = max(rule_score, 75)
        else:
            final_score = max(rule_score, int(ml_prob * 60))

    final_score = min(max(final_score, 0), 100)

    # Classify Risk
    if final_score >= 70:
        classification = "High Risk"
        explanation = (
            f"High scam probability (risk score: {final_score}/100). This message exhibits "
            f"{len(matched_categories)} critical scam hallmarks, such as "
            f"{', '.join(matched_categories[:3])}. Automated and social engineering techniques detected."
        )
        recommendations.extend([
            "DO NOT click any link or dial the phone number provided in the message.",
            "NEVER share OTP, CVV, or passwords. Banks and government agencies will never ask for them.",
            "NEVER enter your UPI PIN to 'receive' money or cashback.",
            "Open your bank or organization's official application directly to check your true status.",
            "Report and block the sender in your messaging app."
        ])
    elif final_score >= 30:
        classification = "Suspicious"
        explanation = (
            f"Suspicious indicators detected (risk score: {final_score}/100). The message contains "
            f"traits commonly seen in unsolicited spam or deceptive marketing campaigns."
        )
        recommendations.extend([
            "Verify the sender's identity through official channels before responding.",
            "Do not download attachments or visit shortened links.",
            "Avoid sharing personal details or financial identifiers."
        ])
    else:
        classification = "Low Risk"
        explanation = (
            f"Low scam indicators observed (risk score: {final_score}/100). The text resembles standard "
            "transactional or conversational communication. However, always remain vigilant."
        )
        recommendations.extend([
            "Continue standard security best practices.",
            "Verify sender addresses when receiving unexpected attachments."
        ])

    return {
        "risk_score": final_score,
        "classification": classification,
        "highlighted_phrases": highlighted_phrases,
        "indicators": indicators if indicators else ["No common scam phrases or urgency indicators detected."],
        "evidence": evidence,
        "explanation": explanation,
        "recommendations": list(dict.fromkeys(recommendations)),
        "disclaimer": "Automated security classification runs locally and may produce false positives or false negatives. Always verify unexpected communications through verified official phone numbers or official websites."
    }
