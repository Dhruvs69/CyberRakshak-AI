import pytest
import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.detectors.url_detector import analyze_url
from app.detectors.message_detector import analyze_message
from app.detectors.qr_detector import analyze_qr_payload
from app.detectors.network_detector import analyze_network_flow_csv
from app.detectors.ocr_detector import analyze_screenshot_content
from app.services.assistant_service import ask_security_assistant
from app.database import db

def test_valid_legitimate_url():
    result = analyze_url("https://www.google.com")
    assert result["classification"] == "Low Risk"
    assert result["risk_score"] < 30
    assert "google" not in result["evidence"].get("impersonated_brands", [])

def test_ip_address_url():
    result = analyze_url("http://192.168.1.1/login.php")
    assert result["risk_score"] >= 30
    assert result["evidence"]["is_ip_address"] is True
    assert any("numerical IP" in ind for ind in result["indicators"])

def test_brand_typosquatting_url():
    result = analyze_url("http://paypa1-security-update.xyz/login")
    assert result["classification"] == "High Risk"
    assert result["risk_score"] >= 70
    assert result["evidence"]["suspicious_tld"] is True

def test_url_shortener():
    result = analyze_url("https://bit.ly/3FakeBankLink")
    assert result["risk_score"] >= 25
    assert result["evidence"]["is_shortener"] is True

def test_empty_url():
    result = analyze_url("")
    assert result["risk_score"] == 0
    assert "Insufficient information" in result["explanation"]

def test_malformed_url():
    result = analyze_url("http://:::invalid-url:::")
    assert "Malformed" in result["indicators"][0] or result["risk_score"] >= 30

def test_legitimate_sms_message():
    legit_msg = "Your order #89283 has been delivered by BlueDart. Have a nice day!"
    result = analyze_message(legit_msg)
    assert result["classification"] == "Low Risk"
    assert result["risk_score"] < 30

def test_bank_kyc_phishing_message():
    phish_msg = "Your bank account will be blocked today. Click the link to update your KYC immediately."
    result = analyze_message(phish_msg)
    assert result["classification"] == "High Risk"
    assert result["risk_score"] >= 70
    assert len(result["highlighted_phrases"]) > 0
    assert any("Urgency" in ind or "KYC" in ind for ind in result["indicators"])

def test_lottery_prize_message():
    scam_msg = "Congratulations! You have won Rs 50,00,000 in Kaun Banega Crorepati lucky draw. Call 9876543210 to claim."
    result = analyze_message(scam_msg)
    assert result["classification"] == "High Risk"
    assert result["risk_score"] >= 70

def test_upi_qr_payload():
    upi_payload = "upi://pay?pa=cashback-bonus-reward@fakebank&pn=Reward%20Office&am=0&tn=Scan%20to%20receive"
    result = analyze_qr_payload(upi_payload)
    assert result["payload_type"] == "upi_payment"
    assert result["risk_score"] >= 30
    assert "upi_details" in result
    assert result["upi_details"]["payee_vpa"] == "cashback-bonus-reward@fakebank"

def test_network_flow_normal():
    csv_data = (
        "timestamp,src_ip,dst_ip,dst_port,protocol,bytes,packets,flags\n"
        "10:00:01,192.168.1.10,8.8.8.8,53,UDP,64,1,\n"
        "10:00:02,192.168.1.10,142.250.190.46,443,TCP,1200,4,ACK\n"
    )
    result = analyze_network_flow_csv(csv_data)
    assert result["classification"] == "Low Risk"
    assert result["total_records"] == 2
    assert len(result["anomalies"]) == 0

def test_network_flow_port_scan():
    rows = ["timestamp,src_ip,dst_ip,dst_port,protocol,bytes,packets,flags"]
    for p in range(20, 35):
        rows.append(f"10:00:01,192.168.1.99,10.0.0.1,{p},TCP,64,1,SYN")
    csv_data = "\n".join(rows)
    result = analyze_network_flow_csv(csv_data)
    assert result["risk_score"] >= 30
    assert any("Port Scan" in a["type"] for a in result["anomalies"])

def test_network_flow_malformed_csv():
    result = analyze_network_flow_csv("")
    assert result["total_records"] == 0
    assert "Insufficient information" in result["explanation"]

def test_assistant_multilingual():
    en_res = ask_security_assistant("What is phishing?", language="en")
    assert "phishing" in en_res["response"].lower()
    
    hi_res = ask_security_assistant("फिशिंग क्या है?", language="hi")
    assert "फ़िशिंग" in hi_res["response"]
    
    gu_res = ask_security_assistant("ફિશિંગ શું છે?", language="gu")
    assert "ફિશિંગ" in gu_res["response"]

def test_database_operations():
    db.init_db()
    scan = db.save_scan(
        scan_type="url",
        target_content="https://test-check.com",
        risk_score=15,
        classification="Low Risk",
        explanation="Test explanation",
        indicators=["Indicator 1"],
        evidence={"test": True},
        recommendations=["Keep safe"],
        is_offline=True
    )
    assert "scan_id" in scan
    
    # Retrieve
    fetched = db.get_scan_by_id(scan["scan_id"])
    assert fetched is not None
    assert fetched["risk_score"] == 15
    
    # Stats
    stats = db.get_dashboard_stats()
    assert stats["total_scans"] >= 1
    
    # Cleanup test entry
    db.delete_scan(scan["scan_id"])
    assert db.get_scan_by_id(scan["scan_id"]) is None
