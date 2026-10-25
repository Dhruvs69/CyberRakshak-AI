#!/usr/bin/env python3
"""
CyberRakshak AI – Unified Application Entrypoint
On-Device Threat, Phishing & Scam Detection
Runs the FastAPI backend and serves the compiled React dashboard at http://localhost:8000.
"""

import sys
import os
import webbrowser
import subprocess
import time

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    
    # Add backend to python path
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
        
    print("=" * 65)
    print("  [+] CYBERRAKSHAK AI - ON-DEVICE THREAT & SCAM DETECTION")
    print("=" * 65)
    print("  • Mode: 100% Offline / Zero Cloud Data Egress")
    print("  • Architecture: Edge & ARM Compatible (Local NLP + OpenCV)")
    print("  • Database: Local SQLite (cyberrakshak.db)")
    print("  • Dashboard: http://localhost:8000")
    print("=" * 65)
    print("\nStarting CyberRakshak AI server...")

    try:
        import uvicorn
        from app.database import db
        
        # Initialize SQLite database
        db.init_db()
        print("✓ Local SQLite database initialized.")
        
        # Optionally open browser after a brief pause
        def open_browser():
            time.sleep(1.5)
            try:
                webbrowser.open("http://localhost:8000")
            except Exception:
                pass

        import threading
        threading.Thread(target=open_browser, daemon=True).start()

        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, app_dir=backend_dir)
    except KeyboardInterrupt:
        print("\nCyberRakshak AI shutdown gracefully.")
    except Exception as e:
        print(f"\n❌ Error launching application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
