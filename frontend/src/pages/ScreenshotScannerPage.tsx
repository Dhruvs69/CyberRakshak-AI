import React, { useState, useRef } from 'react';
import { 
  FileSearch, Upload, Trash2, AlertCircle, RefreshCw, 
  CheckCircle2, Type, Image as ImageIcon, ShieldAlert 
} from 'lucide-react';
import { ScanResult } from '../types';
import { api } from '../services/api';
import { ScanResultCard } from '../components/ScanResultCard';

export const ScreenshotScannerPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrGuide, setOcrGuide] = useState<string | null>(null);
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
      setOcrGuide(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setOcrGuide(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    setError(null);
    setOcrGuide(null);
    setLoading(true);

    try {
      if (activeTab === 'upload') {
        if (!selectedFile) {
          setError('Please select a screenshot image to upload.');
          setLoading(false);
          return;
        }
        const data = await api.scanScreenshot(selectedFile);
        if (!data.ocr_available && data.install_guide) {
          setOcrGuide(data.install_guide);
        }
        setResult(data);
      } else {
        if (!manualText.trim()) {
          setError('Please enter or paste the text from your screenshot.');
          setLoading(false);
          return;
        }
        const data = await api.scanScreenshot(undefined, manualText.trim());
        setResult(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze screenshot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-cyan-400" />
          Screenshot Scam & Fraud Inspector
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Local OCR text extraction • Embedded URL detection • Banking fraud analysis • Zero cloud uploads
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'upload' 
              ? 'text-cyan-400 border-cyan-400' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Upload (Local OCR)</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'manual' 
              ? 'text-cyan-400 border-cyan-400' 
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Manual Text Extraction Mode</span>
        </button>
      </div>

      {/* Upload View */}
      {activeTab === 'upload' && (
        <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-10 text-center cursor-pointer bg-navy-950/60 transition group space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-navy-900 border border-slate-700 group-hover:border-cyan-500/40 text-slate-400 group-hover:text-cyan-400 flex items-center justify-center mx-auto transition">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">
                  Click to browse or drop screenshot here
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  PNG, JPG or JPEG up to 10 MB (Processed 100% on-device in memory)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-72 bg-black flex items-center justify-center">
                <img src={previewUrl} alt="Screenshot Preview" className="max-h-72 object-contain" />
                <button
                  onClick={handleClearImage}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-navy-950/80 hover:bg-red-900 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Remove and Purge Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Selected: {selectedFile?.name} ({(selectedFile?.size! / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {previewUrl && (
              <button
                onClick={handleClearImage}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-navy-950 border border-slate-800 transition"
              >
                Delete Image
              </button>
            )}
            <button
              onClick={handleScan}
              disabled={loading || !selectedFile}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
              <span>{loading ? 'Processing OCR & Threat Models...' : 'Analyze Screenshot'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Manual Paste View */}
      {activeTab === 'manual' && (
        <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <label className="block text-xs uppercase font-mono tracking-wider text-slate-300 font-semibold">
            Paste Screenshot Text Manually
          </label>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={5}
            placeholder="Type or paste the words visible in the screenshot (e.g. text from banking popups, scam WhatsApp chats, or payment receipts)..."
            className="w-full bg-navy-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl p-3.5 text-xs font-mono text-white placeholder-slate-600 outline-none transition resize-y"
          />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleScan}
              disabled={loading || !manualText.trim()}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
              <span>{loading ? 'Evaluating...' : 'Inspect Text'}</span>
            </button>
          </div>
        </div>
      )}

      {/* OCR Missing Guidance Alert (if applicable) */}
      {ocrGuide && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2 font-mono">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span>Tesseract Local OCR Binary Not Detected</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-300/80">{ocrGuide}</p>
          <p className="text-[11px] text-cyan-300">
            Tip: You can switch to the "Manual Text Extraction Mode" tab above to paste the text from your screenshot immediately.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {result.extracted_text && (
            <div className="bg-navy-950/80 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-1">
              <span className="text-cyan-400 font-semibold block uppercase text-[10px]">
                Extracted Text from Image ({result.ocr_used ? 'Local OCR Engine' : 'Manual Paste'})
              </span>
              <p className="text-slate-300 whitespace-pre-wrap">{result.extracted_text}</p>
            </div>
          )}

          <ScanResultCard result={result} onReset={() => { setResult(null); handleClearImage(); }} />
        </div>
      )}
    </div>
  );
};
