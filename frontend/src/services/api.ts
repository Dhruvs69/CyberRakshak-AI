import { ScanResult, DashboardStats, SystemHealth } from '../types';

const API_BASE = '/api';

export const api = {
  // 1. URL Scanner
  async scanUrl(url: string): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/scan/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 2. Message Scanner
  async scanMessage(text: string): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/scan/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 3. Screenshot Scanner
  async scanScreenshot(file?: File, manualText?: string): Promise<ScanResult> {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (manualText) formData.append('manual_text', manualText);

    const res = await fetch(`${API_BASE}/scan/screenshot`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 4. QR Code Scanner
  async scanQr(file: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/scan/qr`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 5. Network Monitor
  async scanNetwork(file?: File, csvText?: string): Promise<ScanResult> {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (csvText) formData.append('csv_text', csvText);

    const res = await fetch(`${API_BASE}/scan/network`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 6. Explainable AI Assistant
  async askAssistant(query: string, language: string = 'en') {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 7. Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 8. History
  async getHistory(params?: { limit?: number; offset?: number; search?: string; scan_type?: string; risk_level?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.scan_type) query.set('scan_type', params.scan_type);
    if (params?.risk_level) query.set('risk_level', params.risk_level);

    const res = await fetch(`${API_BASE}/history?${query.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getScanDetails(scanId: string): Promise<ScanResult> {
    const res = await fetch(`${API_BASE}/history/${scanId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteScan(scanId: string) {
    const res = await fetch(`${API_BASE}/history/${scanId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async clearHistory() {
    const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  exportHistoryUrl(format: 'json' | 'csv' = 'json') {
    return `${API_BASE}/history/export?format=${format}`;
  },

  // 9. Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateSettings(settings: Record<string, string>) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 10. System Health & ARM Readiness
  async getSystemHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/system/health`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 11. Run Built-In Test Suite
  async runTests() {
    const res = await fetch(`${API_BASE}/tests/run`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // 12. Sample Data
  async getSampleData() {
    const res = await fetch(`${API_BASE}/sample-data`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
