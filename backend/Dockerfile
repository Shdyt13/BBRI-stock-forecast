# Gunakan image Python yang ringan
FROM python:3.10-slim

# Set zona waktu (penting untuk perhitungan data saham)
ENV TZ="Asia/Jakarta"

# Set direktori kerja di dalam kontainer
WORKDIR /app

# Salin file requirements dan install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode aplikasi
COPY . .

# Ekspos port yang akan digunakan FastAPI
EXPOSE 8000

# Perintah untuk menjalankan Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]