import React, { useState, useRef } from 'react';
import { 
  QrCode, Upload, Trash2, AlertCircle, RefreshCw, 
  CreditCard, Globe, Sparkles, ExternalLink, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { ScanResult } from '../types';
import { api } from '../services/api';
import { ScanResultCard } from '../components/ScanResultCard';

export const QrScannerPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10 MB limit.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select or upload a QR code image to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.scanQr(selectedFile);
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to decode or inspect QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleQr = async (type: 'upi' | 'phishing' | 'safe') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/scan/qr/sample?sample_type=${type}`);
      const blob = await response.blob();
      const file = new File([blob], `sample_${type}_qr.png`, { type: 'image/png' });
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));

      // Scan the generated sample
      const data = await api.scanQr(file);
      setResult(data);
    } catch (err: any) {
      setError('Failed to load sample QR image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          QR Code Security & Reverse-Payment Inspector
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Local OpenCV decoding • UPI payment trap detection • Phishing redirect inspection • Zero auto-execution
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-10 text-center cursor-pointer bg-navy-950/60 transition group space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-navy-900 border border-slate-700 group-hover:border-cyan-500/40 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center mx-auto transition">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">
                Click to browse or drop QR code image here
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                PNG, JPG or WEBP (Processed 100% on-device via OpenCV)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-64 bg-navy-950 flex items-center justify-center p-4">
              <img src={previewUrl} alt="QR Code Preview" className="max-h-56 object-contain rounded-lg" />
              <button
                onClick={handleClear}
                className="absolute top-3 right-3 p-2 rounded-lg bg-navy-950/80 hover:bg-red-900 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-mono text-center">
              Target Image: {selectedFile?.name}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Sample Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Samples:
            </span>
            <button
              onClick={() => handleLoadSampleQr('upi')}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-amber-400 font-mono"
            >
              UPI Scam QR
            </button>
            <button
              onClick={() => handleLoadSampleQr('phishing')}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-red-400 font-mono"
            >
              Phishing URL QR
            </button>
            <button
              onClick={() => handleLoadSampleQr('safe')}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-emerald-400 font-mono"
            >
              Legitimate QR
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={loading || !selectedFile}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            <span>{loading ? 'Decoding Locally...' : 'Inspect QR Payload'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Decoded Content Banner */}
          <div className="bg-navy-950/90 rounded-xl p-4 border border-cyan-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                Decoded Raw Payload ({result.payload_type?.toUpperCase()})
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Safely Isolated • Never Auto-Opened
              </span>
            </div>
            <p className="text-xs font-mono text-slate-200 bg-navy-900 p-3 rounded-lg border border-slate-800 break-all select-all">
              {result.decoded_text || result.target_content}
            </p>
          </div>

          <ScanResultCard result={result} onReset={handleClear} />
        </div>
      )}
    </div>
  );
};
