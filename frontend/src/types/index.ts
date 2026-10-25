export * from './deepshield';
export type RiskLevel = 'Low Risk' | 'Suspicious' | 'High Risk';

export interface HighlightedPhrase {
  text: string;
  category: string;
  start: number;
  end: number;
}

export interface UpiDetails {
  payee_vpa: string;
  payee_name: string;
  amount: string;
  note: string;
}

export interface NetworkAnomaly {
  type: string;
  severity: string;
  source: string;
  target: string;
  details: string;
}

export interface ScanResult {
  scan_id?: string;
  scan_type: 'url' | 'message' | 'screenshot' | 'qr' | 'network';
  target_content: string;
  risk_score: number;
  classification: RiskLevel;
  explanation: string;
  indicators: string[];
  evidence?: any;
  recommendations: string[];
  timestamp?: string;
  is_offline?: boolean;
  disclaimer?: string;
  
  // Message / Screenshot specific
  highlighted_phrases?: HighlightedPhrase[];
  ocr_used?: boolean;
  ocr_available?: boolean;
  extracted_text?: string;
  install_guide?: string;
  
  // QR specific
  payload_type?: string;
  decoded_text?: string;
  upi_details?: UpiDetails;
  
  // Network specific
  total_records?: number;
  anomalies?: NetworkAnomaly[];
  traffic_summary?: { time: string; packets: number; bytes: number }[];
  protocol_distribution?: Record<string, number>;
  top_sources?: { ip: string; count: number }[];
  top_destinations?: { ip: string; bytes: number }[];
  is_simulation?: boolean;
}

export interface DashboardStats {
  total_scans: number;
  threats_detected: number;
  suspicious_urls: number;
  scam_messages: number;
  suspicious_qr: number;
  network_anomalies: number;
  security_status: string;
  status_level: 'optimal' | 'warning' | 'critical';
  risk_distribution: {
    'Low Risk': number;
    'Suspicious': number;
    'High Risk': number;
  };
  category_counts: Record<string, number>;
  recent_scans: {
    scan_id: string;
    scan_type: string;
    target_content: string;
    risk_score: number;
    classification: RiskLevel;
    timestamp: string;
  }[];
  recent_alerts: {
    scan_id: string;
    scan_type: string;
    target_content: string;
    risk_score: number;
    explanation: string;
    timestamp: string;
  }[];
  activity_trend: {
    date: string;
    scans: number;
  }[];
}

export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  operating_system: string;
  os_release: string;
  architecture: string;
  is_arm_compatible: boolean;
  is_arm_hardware: boolean;
  offline_ready: boolean;
  zero_cloud_dependency: boolean;
  components: {
    sqlite_database: { available: boolean; path: string };
    scikit_learn_nlp: { available: boolean; engine: string };
    opencv_qr_detector: { available: boolean; engine: string };
    tesseract_ocr: { available: boolean; details: string };
    network_flow_engine: { available: boolean; engine: string };
  };
}

export interface SamplePreset {
  label: string;
  url?: string;
  text?: string;
  type?: string;
  description?: string;
}
