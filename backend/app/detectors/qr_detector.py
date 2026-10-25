import cv2
import numpy as np
import io
import urllib.parse
from PIL import Image
from typing import Dict, Any, Optional
from .url_detector import analyze_url
from .message_detector import analyze_message

def decode_qr_image(image_bytes: bytes) -> Dict[str, Any]:
    # Validate file size (10 MB limit)
    if len(image_bytes) > 10 * 1024 * 1024:
        return {
            "success": False,
            "error": "Image file exceeds 10 MB limit.",
            "decoded_text": ""
        }

    try:
        # Convert bytes to OpenCV image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {
                "success": False,
                "error": "Failed to decode image data. Ensure the file is a valid image.",
                "decoded_text": ""
            }
            
        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(img)
        
        # Fallback 1: Grayscale & Otsu threshold
        if not data or bbox is None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
            data, bbox, _ = detector.detectAndDecode(thresh)
            
        # Fallback 2: Upscale 2x for small QR codes
        if not data or bbox is None:
            h, w = img.shape[:2]
            if h < 800 or w < 800:
                upscaled = cv2.resize(img, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
                data, bbox, _ = detector.detectAndDecode(upscaled)

        # Fallback 3: Inverted threshold for dark mode QR codes
        if not data or bbox is None:
            if 'thresh' in locals():
                inv = cv2.bitwise_not(thresh)
                data, bbox, _ = detector.detectAndDecode(inv)
            
        if not data:
            return {
                "success": False,
                "error": "No QR code detected or image was unreadable. Please ensure the QR code is clear and well-lit.",
                "decoded_text": ""
            }
            
        return {
            "success": True,
            "decoded_text": data.strip()
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error decoding QR image: {str(e)}",
            "decoded_text": ""
        }

def analyze_qr_payload(payload: str) -> Dict[str, Any]:
    text = payload.strip()
    if not text:
        return {
            "risk_score": 0,
            "classification": "Low Risk",
            "payload_type": "unknown",
            "decoded_text": "",
            "indicators": ["Empty QR payload."],
            "evidence": {},
            "explanation": "Insufficient information to determine risk confidently.",
            "recommendations": ["Scan or upload a valid QR code image."]
        }

    # 1. Check for UPI Payment Protocol: upi://pay?...
    if text.lower().startswith("upi://pay"):
        parsed = urllib.parse.urlparse(text)
        params = urllib.parse.parse_qs(parsed.query)
        
        pa = params.get("pa", [""])[0]  # Payee Address (VPA)
        pn = params.get("pn", [""])[0]  # Payee Name
        am = params.get("am", [""])[0]  # Amount
        tn = params.get("tn", [""])[0]  # Transaction Note
        
        indicators = ["Payload is a UPI (Unified Payments Interface) deep link."]
        recommendations = [
            "Never scan a QR code to 'receive' money. Scanning a QR code only SENDS money from your bank account.",
            "Verify the recipient name and VPA before approving any payment in your UPI app.",
            "Never share or enter your UPI PIN on unsolicited payment links."
        ]
        
        score = 20
        # Check suspicious VPA patterns
        suspicious_vpa_keywords = ["refund", "cashback", "lottery", "support", "helpdesk", "reward", "sbi-kyc", "customer-care"]
        for kw in suspicious_vpa_keywords:
            if kw in pa.lower() or kw in pn.lower():
                score += 35
                indicators.append(f"UPI recipient uses deceptive keyword '{kw}' commonly associated with payment scams.")
                
        # Zero amount or open amount requests
        if not am or am == "0" or am == "0.00":
            indicators.append("Open-amount transaction: allows arbitrary debit amount to be entered.")
            
        final_score = min(score, 100)
        classification = "High Risk" if final_score >= 70 else ("Suspicious" if final_score >= 30 else "Low Risk")
        
        return {
            "risk_score": final_score,
            "classification": classification,
            "payload_type": "upi_payment",
            "decoded_text": text,
            "upi_details": {
                "payee_vpa": pa,
                "payee_name": pn,
                "amount": am if am else "Open (User specified)",
                "note": tn
            },
            "indicators": indicators,
            "evidence": {"is_upi": True, "vpa": pa, "payee_name": pn},
            "explanation": (
                f"UPI Payment QR code detected. Payee: '{pn or 'Unknown'}' ({pa}). "
                "Warning: Scanning a QR code in banking apps authorizes outgoing debit of funds. Do not proceed if someone claimed this was to credit your account."
            ),
            "recommendations": recommendations
        }

    # 2. Check if Payload is a Web URL
    if text.startswith("http://") or text.startswith("https://") or "www." in text or (len(text.split("/")) > 1 and "." in text.split("/")[0]):
        url_res = analyze_url(text)
        url_res["payload_type"] = "url"
        url_res["decoded_text"] = text
        url_res["recommendations"].insert(0, "DO NOT scan or automatically open external links from untrusted posters or stickers.")
        return url_res

    # 3. Otherwise treat as Plain Text
    msg_res = analyze_message(text)
    msg_res["payload_type"] = "text"
    msg_res["decoded_text"] = text
    return msg_res

def generate_sample_qr(data: str) -> bytes:
    import qrcode
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()
