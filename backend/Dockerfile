FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir "gdown>=4.7.3"

COPY backend/ .

RUN mkdir -p ./datasets ./models

# Download from Google Drive
RUN gdown --folder "1fgksYlyxNfS9v72y07dmlpyjRQv8x3sE" -O ./datasets/
RUN gdown --folder "17J8JkcxTsPaM0vDxxOBHqbdyKAqczz1j" -O ./models/

EXPOSE 5000
CMD ["python", "app.py"]