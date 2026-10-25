from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UrlScanRequest(BaseModel):
    url: str = Field(..., description="The URL to be analyzed for phishing indicators")

class MessageScanRequest(BaseModel):
    text: str = Field(..., description="The message body (SMS, email, WhatsApp) to inspect for fraud/scams")

class AssistantChatRequest(BaseModel):
    query: str = Field(..., description="User question or query about cybersecurity")
    language: str = Field("en", description="Language code: 'en', 'hi', or 'gu'")

class SettingsUpdateRequest(BaseModel):
    save_history: Optional[str] = None
    low_risk_max: Optional[str] = None
    suspicious_max: Optional[str] = None
    offline_mode: Optional[str] = None
    language_default: Optional[str] = None

class NetworkScanRequest(BaseModel):
    csv_text: str = Field(..., description="CSV string containing network flow records")
    filename: Optional[str] = "network_flow.csv"

class ScanResponse(BaseModel):
    scan_id: Optional[str] = None
    scan_type: str
    target_content: str
    risk_score: int
    classification: str
    explanation: str
    indicators: List[str]
    evidence: Any
    recommendations: List[str]
    timestamp: Optional[str] = None
    is_offline: bool = True
