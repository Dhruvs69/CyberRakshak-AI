import re
from typing import Dict, Any, List

# Knowledge base of cybersecurity concepts, attack vectors, and remedies
KNOWLEDGE_BASE = {
    "phishing": {
        "en": (
            "Phishing is a deceptive cyber technique where attackers disguise themselves as trustworthy entities "
            "(such as your bank, courier company, or tech provider) to trick you into revealing sensitive credentials, "
            "passwords, credit card numbers, or OTPs. Phishing websites often use lookalike domain names and mimic official designs."
        ),
        "hi": (
            "फ़िशिंग (Phishing) एक ऐसी धोखाधड़ी तकनीक है जहाँ साइबर अपराधी किसी भरोसेमंद संस्था (जैसे आपका बैंक, कूरियर कंपनी या सरकारी विभाग) "
            "का रूप धारण करके आपको फ़र्ज़ी लिंक भेजते हैं ताकि आपका पासवर्ड, ओटीपी या बैंक विवरण चुरा सकें। कभी भी ऐसे लिंक पर जानकारी न दें।"
        ),
        "gu": (
            "ફિશિંગ (Phishing) એ છેતરપિંડીની પદ્ધતિ છે જેમાં સાયબર ગુનેગારો બેંક, સરકારી કચેરી કે જાણીતી કંપની હોવાનો ઢોંગ કરીને "
            "નકલી લિંક્સ મોકલે છે અને તમારો પાસવર્ડ, OTP કે બેંક વિગતો મેળવવાનો પ્રયાસ કરે છે. આવી શંકાસ્પદ લિંક્સ પર ક્યારેય ક્લિક કરશો નહીં."
        )
    },
    "upi_scam": {
        "en": (
            "In a UPI 'Reverse Charge' or QR scam, fraudsters claim you have won cashback, a refund, or lottery prize, and "
            "instruct you to scan a QR code or enter your UPI PIN to 'receive' the funds. Critical rule: You NEVER enter your "
            "UPI PIN to receive money. Entering your PIN always deducts money from your account."
        ),
        "hi": (
            "यूपीआई (UPI) रिवर्स स्कैम में जालसाज़ कहते हैं कि आपको कैशबैक या लॉटरी मिली है और पैसे 'प्राप्त' करने के लिए "
            "क्यूआर कोड स्कैन करें या यूपीआई पिन दर्ज करें। याद रखें: पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन दर्ज नहीं करना पड़ता। "
            "पिन डालने से आपके खाते से पैसे कटते हैं।"
        ),
        "gu": (
            "UPI કૌભાંડમાં છેતરપિંડી કરનારાઓ દાવો કરે છે કે તમને કેશબેક કે ઇનામ મળ્યું છે અને પૈસા 'મેળવવા' માટે UPI PIN નાખવા કહે છે. "
            "નિયમ યાદ રાખો: પૈસા મેળવવા માટે ક્યારેય UPI PIN નાખવાની જરૂર નથી. PIN નાખવાથી તમારા ખાતામાંથી પૈસા કપાઈ જાય છે."
        )
    },
    "kyc_fraud": {
        "en": (
            "Fake KYC scams typically send SMS messages claiming 'Your bank account/SIM card will be suspended today due to pending KYC'. "
            "They push you to click a link or call a fraudulent phone number. Real banks will never deactivate your account within hours "
            "or ask you to update KYC via third-party web forms or WhatsApp."
        ),
        "hi": (
            "फ़र्ज़ी केवाईसी (KYC) संदेशों में दावा किया जाता है कि 'आपका बैंक खाता या सिम कार्ड आज ही ब्लॉक हो जाएगा'। "
            "वे आपको किसी लिंक पर क्लिक करने को कहते हैं। असली बैंक कभी भी ऐसे अनधिकृत लिंक या व्हाट्सएप के माध्यम से केवाईसी अपडेट करने को नहीं कहते।"
        ),
        "gu": (
            "નકલી KYC કૌભાંડમાં મેસેજ આવે છે કે 'તમારું બેંક ખાતું કે સિમ કાર્ડ આજે જ બંધ થઈ જશે'. "
            "તેઓ લિંક પર ક્લિક કરવાનું દબાણ કરે છે. સાચી બેંક ક્યારેય થોડા કલાકોમાં ખાતું બ્લોક કરવાની ધમકી આપીને બહારની લિંક પર KYC અપડેટ કરવાનું કહેતી નથી."
        )
    },
    "typosquatting": {
        "en": (
            "Typosquatting (URL hijacking) is when attackers register misspelled versions of popular brand domains "
            "(e.g., paypa1.com, g00gle.com, or sbi-online-kyc.com) hoping users won't notice subtle character differences."
        ),
        "hi": (
            "टाइपोस्कवैटिंग (Typosquatting) में धोखेबाज़ मशहूर वेबसाइटों के नामों में हल्का सा बदलाव करके मिलते-जुलते नाम (जैसे paypa1.com) "
            "का इस्तेमाल करते हैं ताकि लोग ध्यान न दें और असली समझकर अपनी जानकारी भर दें।"
        ),
        "gu": (
            "ટાઇપોસ્ક્વોટિંગ (Typosquatting) માં ગઠિયાઓ જાણીતી બ્રાન્ડના નામો જેવા જ મળતા આવતા નકલી ડોમેન બનાવે છે (દા.ત. paypa1.com) "
            "જેથી યુઝર ભૂલથી તેને સાચી વેબસાઇટ માનીને પોતાની અંગત માહિતી આપી દે."
        )
    },
    "https_safety": {
        "en": (
            "Many people mistakenly believe that having HTTPS (the padlock icon) proves a website is safe and legitimate. "
            "This is FALSE. HTTPS only means data in transit is encrypted; anyone, including cyber criminals, can acquire a free SSL certificate. "
            "Always inspect the exact domain name, not just the padlock."
        ),
        "hi": (
            "कई लोग मानते हैं कि यदि वेबसाइट पर 'HTTPS' या ताले का निशान है तो वह पूरी तरह सुरक्षित और असली है। "
            "यह एक भ्रम है! HTTPS का अर्थ केवल इतना है कि डेटा एन्क्रिप्टेड है। आज 80% से अधिक फ़िशिंग वेबसाइटें भी मुफ़्त HTTPS प्रमाणपत्र इस्तेमाल करती हैं।"
        ),
        "gu": (
            "ઘણા લોકો માને છે કે જો વેબસાઇટ પર 'HTTPS' અથવા તાળાનું નિશાન હોય તો તે સુરક્ષિત છે. "
            "આ માન્યતા ખોટી છે. HTTPS ફક્ત ડેટા એન્ક્રિપ્શન દર્શાવે છે; સાયબર અપરાધીઓ પણ મફત SSL સર્ટિફિકેટ મેળવી શકે છે. હંમેશા સાચું ડોમેન નામ તપાસો."
        )
    },
    "incident_help": {
        "en": (
            "Immediate steps if you shared sensitive information or clicked a suspicious link:\n"
            "1. Immediately block your debit/credit card and freeze NetBanking via your bank's official toll-free number or mobile app.\n"
            "2. Change your banking, email, and social media passwords from another secure device.\n"
            "3. In India, immediately call the National Cyber Crime Helpline at 1930 or report at cybercrime.gov.in.\n"
            "4. File a complaint with your nearest Cyber Police Station with screenshots as evidence."
        ),
        "hi": (
            "यदि आपने गलती से ओटीपी या पासवर्ड साझा कर दिया है, तो तुरंत ये कदम उठाएं:\n"
            "1. तुरंत अपने बैंक के आधिकारिक टोल-फ्री नंबर या मोबाइल ऐप से अपने कार्ड और नेटबैंकिंग को ब्लॉक/फ़्रीज़ करें।\n"
            "2. किसी अन्य सुरक्षित फ़ोन या कंप्यूटर से अपने सभी मुख्य पासवर्ड बदलें।\n"
            "3. भारत में तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट दर्ज करें।\n"
            "4. अपने स्थानीय साइबर सेल में स्क्रीनशॉट और सबूतों के साथ शिकायत दर्ज कराएं।"
        ),
        "gu": (
            "જો તમે ભૂલથી શંકાસ્પદ લિંક પર વિગતો આપી દીધી હોય, તો તરત જ આ પગલાં લો:\n"
            "1. તમારી બેંકના ઓફિશિયલ એપ અથવા હેલ્પલાઇન દ્વારા તરત કાર્ડ અને નેટબેંકિંગ બ્લોક કરો.\n"
            "2. અન્ય સુરક્ષિત ઉપકરણ પરથી તમારા પાસવર્ડ બદલી નાખો.\n"
            "3. ભારતમાં તરત જ રાષ્ટ્રીય સાયબર હેલ્પલાઇન 1930 પર કોલ કરો અથવા cybercrime.gov.in પર ફરિયાદ નોંધાવો.\n"
            "4. પુરાવા સાથે નજીકના સાયબર ક્રાઈમ પોલીસ સ્ટેશનમાં ફરિયાદ દાખલ કરો."
        )
    }
}

def ask_security_assistant(query: str, language: str = "en") -> Dict[str, Any]:
    text = query.strip()
    lang = language.lower() if language.lower() in ["en", "hi", "gu"] else "en"
    q_lower = text.lower()
    
    # 1. Incident response / shared OTP emergency
    if any(k in q_lower for k in ["i clicked", "shared otp", "lost money", "cheated", "hacked", "पैसे कट गए", "ओटीपी दे दिया", "હેક થઈ ગયું"]):
        response = KNOWLEDGE_BASE["incident_help"].get(lang, KNOWLEDGE_BASE["incident_help"]["en"])
        intent = "incident_response"
    # 2. Phishing definition
    elif any(k in q_lower for k in ["what is phishing", "phishing kya hai", "फिशिंग क्या है", "ફિશિંગ શું છે", "define phishing", "explain phishing"]):
        response = KNOWLEDGE_BASE["phishing"].get(lang, KNOWLEDGE_BASE["phishing"]["en"])
        intent = "phishing_definition"
    # 3. UPI / QR query
    elif any(k in q_lower for k in ["upi", "qr", "cashback", "receive money", "पिन", "पैसे मिले"]):
        response = KNOWLEDGE_BASE["upi_scam"].get(lang, KNOWLEDGE_BASE["upi_scam"]["en"])
        intent = "upi_scam_explanation"
    # 4. KYC / Bank block query
    elif any(k in q_lower for k in ["kyc", "bank blocked", "pan", "aadhaar", "account suspend", "खाता ब्लॉक"]):
        response = KNOWLEDGE_BASE["kyc_fraud"].get(lang, KNOWLEDGE_BASE["kyc_fraud"]["en"])
        intent = "kyc_fraud_explanation"
    # 5. HTTPS / padlock query
    elif any(k in q_lower for k in ["https", "ssl", "padlock", "secure site", "ताला"]):
        response = KNOWLEDGE_BASE["https_safety"].get(lang, KNOWLEDGE_BASE["https_safety"]["en"])
        intent = "https_explanation"
    # 6. Typosquatting / domain query
    elif any(k in q_lower for k in ["typosquatting", "fake url", "spelling", "domain", "डोमेन"]):
        response = KNOWLEDGE_BASE["typosquatting"].get(lang, KNOWLEDGE_BASE["typosquatting"]["en"])
        intent = "typosquatting_explanation"
    # 7. General explanation on why a message/URL is suspicious
    elif any(k in q_lower for k in ["why is this", "why is", "suspicious", "explain", "phishing", "क्यूं", "शंकास्पद", "શંકાસ્પદ"]):
        if lang == "hi":
            response = (
                "साइबर संदेशों में मुख्य रूप से कृत्रिम जल्दबाज़ी ('खाता आज ही ब्लॉक होगा'), अज्ञात लिंक, "
                "और गोपनीय जानकारी (ओटीपी, पिन, पासवर्ड) मांगने के कारण उन्हें शंकास्पद माना जाता है। "
                "असली बैंक या सरकारी संस्थान कभी भी एसएमएस या व्हाट्सएप लिंक द्वारा तत्काल पासवर्ड या ओटीपी दर्ज करने को नहीं कहते। "
                "सुरक्षा के लिए हमेशा आधिकारिक ऐप का ही उपयोग करें।"
            )
        elif lang == "gu":
            response = (
                "મેસેજ કે લિંક શંકાસ્પદ હોવાના મુખ્ય કારણોમાં: કૃત્રિમ તાકીદ ('ખાતું આજે જ બંધ થશે'), અજાણી લિંક્સ, "
                "અને ગુપ્ત માહિતી (OTP, UPI PIN, પાસવર્ડ) માંગવી શામેલ છે. "
                "સત્તાવાર સંસ્થાઓ ક્યારેય એસએમએસ લિંક દ્વારા પાસવર્ડ અપડેટ કરવાનું કહેતી નથી. હંમેશા સત્તાવાર વેબસાઇટ તપાસો."
            )
        else:
            response = (
                "Messages and links are flagged as phishing or suspicious when they exhibit common social engineering indicators: "
                "artificial urgency (e.g. 'account blocked today'), requests for sensitive credentials (PINs, OTPs, passwords), "
                "lookalike unverified URLs, or unexpected monetary prizes requiring upfront steps. "
                "Always verify directly through official banking applications or independently verified phone numbers."
            )
        intent = "general_phishing_explanation"
    else:
        # Default helpful explanation
        if lang == "hi":
            response = (
                f"साइबररक्षक एआई (CyberRakshak AI) एक ऑन-डिवाइस सुरक्षा सहायक है। "
                f"आपके प्रश्न '{text[:60]}' के संबंध में मुख्य सलाह: किसी भी अनचाहे संदेश में दिए गए लिंक पर क्लिक न करें, "
                f"कभी भी ओटीपी या यूपीआई पिन किसी के साथ साझा न करें, और किसी भी दावे की पुष्टि संस्था के आधिकारिक ऐप से करें। "
                f"आप मुझसे फ़िशिंग, यूपीआई स्कैम, फ़र्ज़ी केवाईसी या आपातकालीन सहायता के बारे में पूछ सकते हैं।"
            )
        elif lang == "gu":
            response = (
                f"સાયબરરક્ષક AI (CyberRakshak AI) એક ઓન-ડિવાઇસ સુરક્ષા સહાયક છે. "
                f"તમારા પ્રશ્ન માટે સામાન્ય સલાહ: કોઈપણ અજાણી લિંક પર ક્લિક ન કરો, ક્યારેય OTP કે UPI PIN કોઈને ન આપો, "
                f"અને સત્તાવાર એપ દ્વારા જ ચકાસણી કરો. "
                f"તમે ફિશિંગ, UPI કૌભાંડ, KYC ફ્રોડ કે હેલ્પલાઇન 1930 વિશે પૂછી શકો છો."
            )
        else:
            response = (
                f"CyberRakshak AI Assistant guidance on: '{text[:60]}':\n"
                "Core security principles:\n"
                "• Never share OTPs, banking passwords, or UPI PINs with anyone under any circumstance.\n"
                "• Avoid clicking links in unrequested SMS, WhatsApp, or emails claiming account deactivations.\n"
                "• To verify account issues, manually launch the official banking app or contact your branch.\n"
                "• In case of financial cyber fraud in India, dial 1930 immediately or visit cybercrime.gov.in."
            )
        intent = "general_security_guidance"

    return {
        "query": text,
        "language": lang,
        "intent": intent,
        "response": response,
        "engine": "On-Device Rule-Based Knowledge Engine (Privacy Preserving)",
        "disclaimer": "This assistant provides advisory guidance based on cybersecurity best practices. It never requests or stores your private passwords or financial PINs."
    }
