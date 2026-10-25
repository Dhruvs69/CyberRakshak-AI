# Multi-stage Dockerfile optimized for x86_64 and ARM64/ARMv7 edge devices
# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --prefer-offline --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Edge Runtime
FROM python:3.11-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CYBERRAKSHAK_DB_PATH=/app/cyberrakshak.db

WORKDIR /app

# Install system dependencies including libgl for opencv, tesseract-ocr, and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ /app/backend/
COPY data/ /app/data/

# Copy built frontend production dist from builder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000

WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
