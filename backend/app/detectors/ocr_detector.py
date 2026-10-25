import os
import re
import io
from typing import Dict, Any, Tuple
from PIL import Image
from .message_detector import analyze_message
from .url_detector import analyze_url

# Check whether Tesseract is installed and executable
def check_tesseract_available() -> Tuple[bool, str]:
    try:
        import pytesseract
        # Check standard installation directories on Windows if not in PATH
        standard_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for p in standard_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                break

        test_img = Image.new("RGB", (30, 30), color="white")
        pytesseract.image_to_string(test_img)
        return True, "Tesseract OCR engine is available locally."
    except Exception as e:
        return False, (
            "Local Tesseract OCR engine binary is not detected on the system PATH. "
            "To enable automated image text extraction on Windows, install Tesseract via: "
            "'winget install UB-Mannheim.TesseractOCR' or on Linux 'sudo apt-get install tesseract-ocr'. "
            "You can also use the manual text paste fallback below to analyze text from any screenshot immediately."
        )

def extract_text_from_image_bytes(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    # Validate file size (10 MB limit)
    if len(image_bytes) > 10 * 1024 * 1024:
        return {
            "success": False,
            "error": "File size exceeds the 10 MB limit.",
            "extracted_text": "",
            "ocr_available": False,
            "install_guide": ""
        }
        
    # Validate format via Pillow
    try:
        img = Image.open(io.BytesIO(image_bytes))
        format_lower = (img.format or "").lower()
        if format_lower not in ["png", "jpeg", "jpg", "webp", "bmp"]:
            return {
                "success": False,
                "error": f"Unsupported image format ({format_lower}). Please upload PNG, JPG, or JPEG.",
                "extracted_text": "",
                "ocr_available": False,
                "install_guide": ""
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"Invalid image file: {str(e)}",
            "extracted_text": "",
            "ocr_available": False,
            "install_guide": ""
        }

    is_available, message = check_tesseract_available()
    if not is_available:
        return {
            "success": False,
            "ocr_available": False,
            "error": "OCR engine not detected on system.",
            "install_guide": message,
            "extracted_text": ""
        }

    try:
        import pytesseract
        text = pytesseract.image_to_string(img).strip()
        return {
            "success": True,
            "ocr_available": True,
            "extracted_text": text,
            "install_guide": ""
        }
    except Exception as e:
        return {
            "success": False,
            "ocr_available": False,
            "error": f"Failed to extract text from image: {str(e)}",
            "install_guide": message,
            "extracted_text": ""
        }

def analyze_screenshot_content(text: str, filename: str = "screenshot.png") -> Dict[str, Any]:
    # Analyze extracted or manually supplied text
    msg_analysis = analyze_message(text)
    
    # Check for extracted URLs inside text
    url_regex = r"(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|org|net|in|me|xyz|top|info|site)/[^\s]*)"
    extracted_urls = re.findall(url_regex, text)
    
    url_analyses = []
    for u in extracted_urls[:3]:
        url_res = analyze_url(u)
        url_analyses.append({
            "url": u,
            "risk_score": url_res["risk_score"],
            "classification": url_res["classification"],
            "explanation": url_res["explanation"]
        })
        
    # If any extracted URL is High Risk, adjust overall score
    if any(ua["classification"] == "High Risk" for ua in url_analyses):
        msg_analysis["risk_score"] = max(msg_analysis["risk_score"], 85)
        msg_analysis["classification"] = "High Risk"
        msg_analysis["indicators"].append("Contains embedded high-risk phishing URL detected in screenshot text.")

    msg_analysis["extracted_urls"] = url_analyses
    msg_analysis["filename"] = filename
    return msg_analysis
