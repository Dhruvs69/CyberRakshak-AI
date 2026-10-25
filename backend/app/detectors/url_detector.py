import re
import ipaddress
import urllib.parse
from typing import Dict, Any, List

SUSPICIOUS_TLDS = {
    "xyz", "top", "buzz", "club", "tk", "ml", "ga", "cf", "gq", 
    "icu", "monster", "cam", "fit", "surf", "work", "bid", "loan", 
    "racing", "stream", "date", "faith", "review", "accountant", "download",
    "network", "live", "online", "site", "vip", "click", "link", "rest",
    "fail", "uno", "pro", "store", "party", "space"
}

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", 
    "ow.ly", "rb.gy", "cutt.ly", "v.gd", "clck.ru", "qr.ae", "shorte.st"
}

TARGETED_BRANDS = [
    "paypal", "google", "apple", "microsoft", "amazon", "netflix", "facebook",
    "instagram", "whatsapp", "telegram", "sbi", "hdfc", "icici", "axis",
    "punjabnational", "pnb", "paytm", "phonepe", "gpay", "bhim", "uidai",
    "incometax", "aadhaar", "gov", "chase", "wellsfargo", "bankofamerica"
]

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "security", "update",
    "kyc", "account", "recover", "banking", "wallet", "authenticate", "confirm",
    "password", "credential", "suspend", "free", "bonus", "reward", "refund",
    "gift", "offer", "prize", "claim"
]

PIRACY_MALWARE_KEYWORDS = [
    "movie", "movies", "torrent", "stream", "warez", "crack", "modapk",
    "apkdownload", "free-download", "vegamo", "1337x", "filmy"
]

def analyze_url(raw_url: str) -> Dict[str, Any]:
    url = raw_url.strip()
    indicators: List[str] = []
    evidence: Dict[str, Any] = {}
    recommendations: List[str] = []
    
    if not url:
        return {
            "risk_score": 0,
            "classification": "Low Risk",
            "indicators": ["Empty URL input provided."],
            "evidence": {"input_empty": True},
            "explanation": "Insufficient information to determine risk confidently.",
            "recommendations": ["Enter a valid URL to analyze."]
        }

    # Ensure url has scheme for parsing
    has_scheme = bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url))
    parsed_candidate = url if has_scheme else f"http://{url}"
    
    try:
        parsed = urllib.parse.urlparse(parsed_candidate)
        hostname = (parsed.hostname or "").lower()
        path = parsed.path
        query = parsed.query
    except Exception as e:
        return {
            "risk_score": 50,
            "classification": "Suspicious",
            "indicators": ["Malformed URL syntax that fails RFC parsing."],
            "evidence": {"error": str(e)},
            "explanation": "The URL structure is syntactically invalid or purposely malformed to bypass URL filters.",
            "recommendations": ["Do not attempt to open this link in any browser."]
        }
        
    if not hostname:
        return {
            "risk_score": 40,
            "classification": "Suspicious",
            "indicators": ["URL lacks a valid domain name or hostname."],
            "evidence": {"raw_url": url},
            "explanation": "Insufficient information to determine risk confidently. The input does not contain a discernible hostname.",
            "recommendations": ["Verify the complete URL before proceeding."]
        }

    score = 0
    evidence["hostname"] = hostname
    evidence["scheme"] = parsed.scheme.lower()
    evidence["path_length"] = len(path)
    evidence["query_length"] = len(query)

    # 1. IP Address based URL
    is_ip = False
    try:
        ipaddress.ip_address(hostname)
        is_ip = True
        score += 45
        indicators.append("Host is a raw numerical IP address instead of a registered domain name.")
        evidence["is_ip_address"] = True
    except ValueError:
        evidence["is_ip_address"] = False

    # Check for hex or octal encoded IPs (e.g., 0x7f.0.0.1 or dword)
    if re.match(r"^0x[0-9a-fA-F.]+$", hostname) or (hostname.replace(".", "").isdigit() and not is_ip):
        score += 45
        indicators.append("Hostname utilizes obfuscated hex/decimal/octal IP notation.")
        evidence["obfuscated_ip"] = True

    # 2. URL Shortener detection
    if hostname in KNOWN_SHORTENERS:
        score += 35
        indicators.append(f"Known URL shortener service used ({hostname}), masking the true final destination.")
        evidence["is_shortener"] = True
        recommendations.append("Do not open shortened links from unknown senders; inspect the unshortened destination first.")

    # 3. Suspicious TLD check
    tld = hostname.split(".")[-1] if "." in hostname else ""
    evidence["tld"] = tld
    if tld in SUSPICIOUS_TLDS:
        score += 25
        indicators.append(f"Domain uses high-abuse top-level domain '.{tld}', frequently leveraged in automated phishing and piracy campaigns.")
        evidence["suspicious_tld"] = True

    # 4. Misleading Subdomain & Excessive Subdomains
    subdomain_parts = hostname.split(".")
    evidence["subdomain_count"] = len(subdomain_parts)
    if len(subdomain_parts) > 3 and not is_ip:
        score += 20
        indicators.append(f"Excessive subdomain depth ({len(subdomain_parts)} segments), often used to bury fraudulent hostnames.")
        evidence["excessive_subdomains"] = True

    # 5. Brand Impersonation / Typosquatting in Hostname or Path
    detected_brands = []
    registered_domain = ".".join(subdomain_parts[-2:]) if len(subdomain_parts) >= 2 else hostname
    
    for brand in TARGETED_BRANDS:
        if brand in hostname:
            if registered_domain not in [f"{brand}.com", f"{brand}.in", f"{brand}.org", f"{brand}.net", f"{brand}.co.in", f"{brand}.gov.in"]:
                detected_brands.append(brand)
    
    if detected_brands:
        score += 35
        indicators.append(f"Deceptive brand impersonation detected for: {', '.join(detected_brands).upper()}. The domain name is not the brand's official property.")
        evidence["impersonated_brands"] = detected_brands
        recommendations.append(f"Navigate to {detected_brands[0]}.com or the brand's official mobile application directly instead of using this link.")

    # 6. Sensitive keywords in Subdomain or Path
    found_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in hostname or kw in path.lower()]
    if found_keywords:
        score += min(len(found_keywords) * 15, 30)
        indicators.append(f"Urgent or credential-related security keywords found: {', '.join(found_keywords)}.")
        evidence["suspicious_keywords"] = found_keywords

    # 7. Piracy, Warez & Rogue Streaming Hubs (e.g. vegamovies, torrents)
    found_piracy = [pw for pw in PIRACY_MALWARE_KEYWORDS if pw in hostname or pw in path.lower()]
    if found_piracy:
        score += 35
        indicators.append(f"Domain contains high-risk streaming/piracy indicators: {', '.join(found_piracy)}. Unofficial media hubs frequently distribute deceptive adware, malware downloads, and malicious browser notifications.")
        evidence["piracy_adware_risk"] = True
        recommendations.append("Do not download APKs, executables, or allow browser notification prompts from unverified media portals.")

    # 8. Suspicious Characters & Obfuscation
    if "@" in url:
        score += 35
        indicators.append("URL contains '@' symbol, which may trick the browser into ignoring everything before the '@' sign.")
        evidence["contains_at_symbol"] = True
        
    if "xn--" in hostname:
        score += 30
        indicators.append("Punycode (xn--) domain detected, which can be an IDN homograph attack mimicking Latin characters.")
        evidence["punycode_homograph"] = True

    hyphen_count = hostname.count("-")
    evidence["hyphen_count"] = hyphen_count
    if hyphen_count >= 2:
        score += 15
        indicators.append(f"Unusually high number of hyphens ({hyphen_count}) in domain name, typical in fake brand clones.")

    percent_count = url.count("%")
    evidence["percent_encoding_count"] = percent_count
    if percent_count > 3:
        score += 15
        indicators.append(f"Multiple percent-encoded characters ({percent_count}) used to obscure destination text.")

    if parsed.port and parsed.port not in [80, 443]:
        score += 25
        indicators.append(f"Uses non-standard web service port ({parsed.port}), anomalous for legitimate public consumer portals.")
        evidence["non_standard_port"] = parsed.port

    # 9. Protocol Check: HTTPS is NOT proof of safety
    is_https = parsed.scheme.lower() == "https"
    evidence["is_https"] = is_https
    if not is_https:
        score += 15
        indicators.append("Unencrypted HTTP protocol used; credentials and transmitted data can be intercepted.")
    else:
        evidence["https_note"] = "HTTPS is present. Note that modern phishing websites also obtain free SSL certificates; HTTPS encrypts transmission but does not prove the website is authentic."

    # Clamp score to [0, 100]
    final_score = min(max(score, 0), 100)
    
    # Classification
    if final_score >= 70:
        classification = "High Risk"
        explanation = (
            f"This URL shows strong phishing characteristics (score {final_score}/100) with "
            f"{len(indicators)} detected warning indicators including brand or domain deception. "
            "High probability of malicious intent or credential harvesting."
        )
        recommendations.extend([
            "DO NOT click, open, or submit passwords/OTP on this page.",
            "Verify the service independently by typing the official address directly into your browser.",
            "Report this URL to your organization's security team or national cybercrime portal."
        ])
    elif final_score >= 30:
        classification = "Suspicious"
        explanation = (
            f"This URL exhibits anomalies and suspicious traits (score {final_score}/100). "
            "While not definitively confirmed as an attack, it diverges significantly from standard legitimate web architecture."
        )
        recommendations.extend([
            "Proceed with heightened caution and verify the source before interacting.",
            "Check that the domain truly matches the authentic organization.",
            "Never provide banking PINs, UPI details, or passwords on unverified sites."
        ])
    else:
        classification = "Low Risk"
        explanation = (
            f"No prominent structural anomalies or deceptive brand indicators were flagged (score {final_score}/100). "
            "The URL appears structurally standard. However, automated pattern detection cannot guarantee safety with 100% certainty."
        )
        recommendations.extend([
            "Ensure the domain matches your intended destination.",
            "Always inspect URLs carefully before entering private login credentials."
        ])

    return {
        "risk_score": final_score,
        "classification": classification,
        "indicators": indicators if indicators else ["No structural anomalies or phishing flags detected."],
        "evidence": evidence,
        "explanation": explanation,
        "recommendations": list(dict.fromkeys(recommendations))
    }
