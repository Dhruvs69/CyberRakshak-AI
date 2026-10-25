# ARM-Based Edge Deployment Guide

CyberRakshak AI is engineered to execute completely on-device without relying on paid APIs or mandatory cloud infrastructure. This makes it an ideal cybersecurity agent for edge micro-gateways, Raspberry Pi devices, NVIDIA Jetson modules, and ARM-based laptops.

---

## 1. Hardware Requirements & Resource Footprint

| Metric | Minimum (IoT / SBC) | Recommended (Edge Gateway) |
| :--- | :--- | :--- |
| **Processor** | ARM Cortex-A53 (Quad-Core, 1.2 GHz) | ARM Cortex-A72 / A76 (Quad/Octa-Core) |
| **RAM** | 1 GB LPDDR4 | 2 GB+ LPDDR4/5 |
| **Storage** | 2 GB MicroSD / eMMC | 8 GB+ eMMC or NVMe SSD |
| **OS** | Debian 12 (Bookworm), Ubuntu 22.04/24.04 ARM64 | Raspberry Pi OS 64-bit, JetPack 6.x |
| **Runtime RAM Usage** | ~110 MB - 145 MB | ~160 MB |

---

## 2. Raspberry Pi 4 / 5 Quickstart

### Step 1: Install System Packages
```bash
sudo apt update && sudo apt install -y \
    python3-pip \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    curl
```

### Step 2: Clone and Setup Virtual Environment
```bash
git clone <repository_url> cyberrakshak-ai
cd cyberrakshak-ai

python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### Step 3: Run the Service
```bash
python3 run_cyberrakshak.py
```
Open `http://<raspberry-pi-ip>:8000` in any web browser on your local network.

---

## 3. Systemd Daemon Service Configuration

To run CyberRakshak AI as an automated background service upon boot:

1. Create a unit file:
```bash
sudo nano /etc/systemd/system/cyberrakshak.service
```

2. Insert the following configuration:
```ini
[Unit]
Description=CyberRakshak AI Edge Security Agent
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/cyberrakshak-ai
ExecStart=/home/pi/cyberrakshak-ai/venv/bin/python run_cyberrakshak.py
Restart=always
RestartSec=5
Environment=PORT=8000
Environment=CYBERRAKSHAK_DB_PATH=/home/pi/cyberrakshak-ai/cyberrakshak.db

[Install]
WantedBy=multi-user.target
```

3. Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cyberrakshak.service
sudo systemctl status cyberrakshak.service
```

---

## 4. Docker Deployment on ARM

CyberRakshak AI includes a multi-arch container definition:

```bash
docker compose up -d --build
```
Verify status:
```bash
docker compose ps
docker compose logs -f
```
