FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y \
    libgl1 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create model and dataset directories so paths always exist
RUN mkdir -p /app/model /app/dataset

EXPOSE 5000

# ✅ app.py now calls ensure_all_files() itself at startup,
#    so gunicorn --preload handles download + serve in one step.
#    Removed --preload to avoid worker race conditions.
CMD ["gunicorn", "app:app", "--workers", "1", "--threads", "4", "--bind", "0.0.0.0:5000", "--timeout", "300"]