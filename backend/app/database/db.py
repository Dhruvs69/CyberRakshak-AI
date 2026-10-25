import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_PATH = os.environ.get("CYBERRAKSHAK_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "..", "cyberrakshak.db"))
DB_PATH = os.path.abspath(DB_PATH)

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id TEXT UNIQUE NOT NULL,
        scan_type TEXT NOT NULL,
        target_content TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        classification TEXT NOT NULL,
        explanation TEXT NOT NULL,
        indicators TEXT NOT NULL,
        evidence TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_offline BOOLEAN DEFAULT 1
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)
    
    # Default settings
    default_settings = {
        "save_history": "true",
        "low_risk_max": "29",
        "suspicious_max": "69",
        "offline_mode": "true",
        "language_default": "en"
    }
    
    for key, val in default_settings.items():
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, val))
        
    conn.commit()
    conn.close()

def get_setting(key: str, default: str = "") -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
    row = cursor.fetchone()
    conn.close()
    return row["value"] if row else default

def set_setting(key: str, value: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def get_all_settings() -> Dict[str, str]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    rows = cursor.fetchall()
    conn.close()
    return {row["key"]: row["value"] for row in rows}

def save_scan(
    scan_type: str,
    target_content: str,
    risk_score: int,
    classification: str,
    explanation: str,
    indicators: List[str],
    evidence: Any,
    recommendations: List[str],
    is_offline: bool = True
) -> Dict[str, Any]:
    save_history_enabled = get_setting("save_history", "true").lower() == "true"
    
    now = datetime.now(timezone.utc)
    scan_id = f"CR-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    timestamp = now.isoformat().replace("+00:00", "Z")
    
    # Sanitize content if it looks like it might contain raw passwords/OTPs (replace 4-6 digit numeric OTPs)
    sanitized_content = target_content[:300]
    
    scan_dict = {
        "scan_id": scan_id,
        "scan_type": scan_type,
        "target_content": sanitized_content,
        "risk_score": risk_score,
        "classification": classification,
        "explanation": explanation,
        "indicators": indicators,
        "evidence": evidence,
        "recommendations": recommendations,
        "timestamp": timestamp,
        "is_offline": is_offline
    }
    
    if save_history_enabled:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO scans (
            scan_id, scan_type, target_content, risk_score, classification,
            explanation, indicators, evidence, recommendations, timestamp, is_offline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            scan_id,
            scan_type,
            sanitized_content,
            risk_score,
            classification,
            explanation,
            json.dumps(indicators),
            json.dumps(evidence),
            json.dumps(recommendations),
            timestamp,
            1 if is_offline else 0
        ))
        conn.commit()
        conn.close()
        
    return scan_dict

def get_scans(
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None,
    scan_type: Optional[str] = None,
    risk_level: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM scans WHERE 1=1"
    params = []
    
    if search:
        query += " AND (target_content LIKE ? OR explanation LIKE ?)"
        search_param = f"%{search}%"
        params.extend([search_param, search_param])
        
    if scan_type and scan_type.lower() != "all":
        query += " AND scan_type = ?"
        params.append(scan_type.lower())
        
    if risk_level and risk_level.lower() != "all":
        query += " AND classification = ?"
        params.append(risk_level)
        
    # Count total
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]
    
    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    items = []
    for row in rows:
        items.append({
            "id": row["id"],
            "scan_id": row["scan_id"],
            "scan_type": row["scan_type"],
            "target_content": row["target_content"],
            "risk_score": row["risk_score"],
            "classification": row["classification"],
            "explanation": row["explanation"],
            "indicators": json.loads(row["indicators"]) if row["indicators"] else [],
            "evidence": json.loads(row["evidence"]) if row["evidence"] else {},
            "recommendations": json.loads(row["recommendations"]) if row["recommendations"] else [],
            "timestamp": row["timestamp"],
            "is_offline": bool(row["is_offline"])
        })
        
    conn.close()
    return {"total": total, "items": items}

def get_scan_by_id(scan_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE scan_id = ?", (scan_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "id": row["id"],
        "scan_id": row["scan_id"],
        "scan_type": row["scan_type"],
        "target_content": row["target_content"],
        "risk_score": row["risk_score"],
        "classification": row["classification"],
        "explanation": row["explanation"],
        "indicators": json.loads(row["indicators"]) if row["indicators"] else [],
        "evidence": json.loads(row["evidence"]) if row["evidence"] else {},
        "recommendations": json.loads(row["recommendations"]) if row["recommendations"] else [],
        "timestamp": row["timestamp"],
        "is_offline": bool(row["is_offline"])
    }

def delete_scan(scan_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans WHERE scan_id = ?", (scan_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def clear_all_scans():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scans")
    conn.commit()
    conn.close()

def get_dashboard_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM scans")
    total_scans = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE classification = 'High Risk'")
    threats_detected = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE scan_type = 'url' AND classification IN ('Suspicious', 'High Risk')")
    suspicious_urls = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE scan_type IN ('message', 'screenshot') AND classification IN ('Suspicious', 'High Risk')")
    scam_messages = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE scan_type = 'qr' AND classification IN ('Suspicious', 'High Risk')")
    suspicious_qr = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM scans WHERE scan_type = 'network' AND classification IN ('Suspicious', 'High Risk')")
    network_anomalies = cursor.fetchone()[0]
    
    # Risk distribution
    cursor.execute("SELECT classification, COUNT(*) as count FROM scans GROUP BY classification")
    dist_rows = cursor.fetchall()
    risk_distribution = {
        "Low Risk": 0,
        "Suspicious": 0,
        "High Risk": 0
    }
    for r in dist_rows:
        if r["classification"] in risk_distribution:
            risk_distribution[r["classification"]] = r["count"]
            
    # Category counts
    cursor.execute("SELECT scan_type, COUNT(*) as count FROM scans GROUP BY scan_type")
    cat_rows = cursor.fetchall()
    category_counts = {r["scan_type"]: r["count"] for r in cat_rows}
    
    # Recent scans (limit 5)
    cursor.execute("SELECT scan_id, scan_type, target_content, risk_score, classification, timestamp FROM scans ORDER BY id DESC LIMIT 5")
    recent_rows = cursor.fetchall()
    recent_scans = [
        {
            "scan_id": r["scan_id"],
            "scan_type": r["scan_type"],
            "target_content": r["target_content"],
            "risk_score": r["risk_score"],
            "classification": r["classification"],
            "timestamp": r["timestamp"]
        }
        for r in recent_rows
    ]
    
    # Recent high risk alerts
    cursor.execute("SELECT scan_id, scan_type, target_content, risk_score, explanation, timestamp FROM scans WHERE classification = 'High Risk' ORDER BY id DESC LIMIT 4")
    alert_rows = cursor.fetchall()
    recent_alerts = [
        {
            "scan_id": r["scan_id"],
            "scan_type": r["scan_type"],
            "target_content": r["target_content"],
            "risk_score": r["risk_score"],
            "explanation": r["explanation"],
            "timestamp": r["timestamp"]
        }
        for r in alert_rows
    ]
    
    # Activity time-series trend (by date)
    cursor.execute("SELECT SUBSTR(timestamp, 1, 10) as scan_date, COUNT(*) as count FROM scans GROUP BY scan_date ORDER BY scan_date DESC LIMIT 7")
    trend_rows = cursor.fetchall()
    activity_trend = [{"date": r["scan_date"], "scans": r["count"]} for r in reversed(trend_rows)]
    
    # Determine security status
    if total_scans == 0:
        security_status = "System Ready (No Scans Analyzed Yet)"
        status_level = "optimal"
    elif threats_detected > 3:
        security_status = "Elevated Threat Activity Detected"
        status_level = "critical"
    elif threats_detected > 0:
        security_status = "Monitoring Active – Threats Flagged"
        status_level = "warning"
    else:
        security_status = "Normal – No Active Threats"
        status_level = "optimal"
        
    conn.close()
    
    return {
        "total_scans": total_scans,
        "threats_detected": threats_detected,
        "suspicious_urls": suspicious_urls,
        "scam_messages": scam_messages,
        "suspicious_qr": suspicious_qr,
        "network_anomalies": network_anomalies,
        "security_status": security_status,
        "status_level": status_level,
        "risk_distribution": risk_distribution,
        "category_counts": category_counts,
        "recent_scans": recent_scans,
        "recent_alerts": recent_alerts,
        "activity_trend": activity_trend
    }
