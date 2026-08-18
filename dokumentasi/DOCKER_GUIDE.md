# 🐳 PANDUAN DOCKER - Sistem Prediksi Saham BBRI

## 📋 Daftar Isi

1. [Prasyarat](#prasyarat)
2. [Cara Menjalankan dengan Docker](#cara-menjalankan)
3. [Perintah Docker yang Berguna](#perintah-berguna)
4. [Troubleshooting](#troubleshooting)
5. [Arsitektur Docker](#arsitektur-docker)

---

## 🔧 Prasyarat

Pastikan sistem Anda sudah terinstall:

### 1. Docker Desktop

- **Windows/Mac:** [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** Install Docker Engine + Docker Compose

### 2. Verifikasi Instalasi

Buka terminal/command prompt dan jalankan:

```bash
docker --version
# Output: Docker version 24.x.x atau lebih baru

docker-compose --version
# Output: Docker Compose version v2.x.x atau lebih baru
```

---

## 🚀 Cara Menjalankan dengan Docker

### Method 1: First Time Setup (Build & Run)

Untuk menjalankan sistem **pertama kali** atau setelah perubahan Dockerfile:

```bash
docker-compose up --build
```

**Penjelasan:**

- `--build` memaksa Docker untuk rebuild images
- Proses akan download dependencies dan build containers
- Waktu pertama kali: ±3-5 menit (tergantung internet)

### Method 2: Normal Run (Setelah Build)

Jika images sudah di-build sebelumnya:

```bash
docker-compose up
```

Atau jalankan di **background (detached mode)**:

```bash
docker-compose up -d
```

---

### Verifikasi Sistem Berjalan

Setelah `docker-compose up`, Anda akan melihat output:

```
✔ Network bbri-network          Created
✔ Container bbri-prediction-backend   Started
✔ Container bbri-prediction-frontend  Started
```

**Backend log akan menampilkan:**

```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Frontend log akan menampilkan:**

```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
➜  Network: http://172.x.x.x:3000/
```

---

### Akses Aplikasi

Buka browser dan akses:

| Service      | URL                        | Keterangan |
| ------------ | -------------------------- | ---------- |
| **Frontend** | http://localhost:3000      | React App  |
| **Backend**  | http://localhost:8000      | FastAPI    |
| **API Docs** | http://localhost:8000/docs | Swagger UI |

---

## 🛠️ Perintah Docker yang Berguna

### 1. Menghentikan Containers

**Soft stop (graceful shutdown):**

```bash
docker-compose down
```

**Stop + hapus volumes:**

```bash
docker-compose down -v
```

---

### 2. Melihat Status Containers

```bash
docker-compose ps
```

Output:

```
NAME                           STATUS
bbri-prediction-backend        Up 2 minutes
bbri-prediction-frontend       Up 2 minutes
```

---

### 3. Melihat Logs

**Semua services:**

```bash
docker-compose logs -f
```

**Backend saja:**

```bash
docker-compose logs -f backend
```

**Frontend saja:**

```bash
docker-compose logs -f frontend
```

`-f` = follow (real-time logs)

---

### 4. Restart Specific Service

**Restart backend:**

```bash
docker-compose restart backend
```

**Restart frontend:**

```bash
docker-compose restart frontend
```

---

### 5. Rebuild Setelah Perubahan Code

Jika Anda mengubah `Dockerfile` atau `requirements.txt`/`package.json`:

```bash
docker-compose up --build
```

Atau rebuild tanpa cache (clean build):

```bash
docker-compose build --no-cache
docker-compose up
```

---

### 6. Masuk ke dalam Container (Debugging)

**Masuk ke backend container:**

```bash
docker exec -it bbri-prediction-backend /bin/bash
```

**Masuk ke frontend container:**

```bash
docker exec -it bbri-prediction-frontend /bin/sh
```

_(Note: Alpine Linux menggunakan `sh` bukan `bash`)_

---

### 7. Membersihkan Docker (Free up space)

**Hapus containers yang tidak digunakan:**

```bash
docker system prune
```

**Hapus semua (containers, images, volumes):**

```bash
docker system prune -a --volumes
```

⚠️ **Warning:** Ini akan menghapus SEMUA images dan volumes!

---

## 🐞 Troubleshooting

### Masalah 1: Port Already in Use

**Gejala:**

```
Error: bind: address already in use
```

**Penyebab:** Ada aplikasi lain yang menggunakan port 3000 atau 8000.

**Solusi 1 - Hentikan aplikasi yang menggunakan port:**

**Windows:**

```bash
# Cari process di port 3000
netstat -ano | findstr :3000

# Kill process (ganti PID)
taskkill /PID <PID> /F
```

**Linux/Mac:**

```bash
# Cari process di port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Solusi 2 - Ubah port di docker-compose.yml:**

```yaml
ports:
  - "3001:3000" # Gunakan 3001 di host, 3000 di container
```

---

### Masalah 2: Build Gagal (Dependencies Error)

**Gejala:**

```
ERROR: failed to solve: process "/bin/sh -c pip install..." did not complete
```

**Solusi:**

1. **Clean rebuild:**

   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

2. **Cek requirements.txt/package.json** - pastikan tidak ada typo

---

### Masalah 3: Frontend Tidak Bisa Akses Backend

**Gejala:**

- Frontend error: "Failed to fetch"
- CORS error di browser console

**Solusi:**

1. **Cek DataContext.jsx** - pastikan API URL benar:

   ```javascript
   const API_BASE_URL = "http://localhost:8000";
   ```

2. **Cek backend CORS settings** di `main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

### Masalah 4: Code Changes Tidak Terdeteksi

**Gejala:** Edit code tapi perubahan tidak muncul di browser.

**Solusi:**

**Backend:** Auto-reload sudah aktif (uvicorn `--reload`)

**Frontend:**

1. Vite sudah dikonfigurasi dengan `usePolling: true`
2. Jika masih tidak reload, restart container:
   ```bash
   docker-compose restart frontend
   ```

---

### Masalah 5: Container Terus Restart

**Gejala:**

```bash
docker-compose ps
# Status: Restarting
```

**Solusi:**

1. **Cek logs untuk error:**

   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Common issues:**
   - Syntax error di code Python/JavaScript
   - Missing dependencies
   - Port conflict

---

### Masalah 6: Slow Performance di Windows

**Gejala:** Docker sangat lambat di Windows.

**Solusi:**

1. **Enable WSL 2 backend** di Docker Desktop settings
2. **Pindahkan project ke WSL filesystem:**
   ```bash
   \\wsl$\Ubuntu\home\user\project
   ```
3. **Tingkatkan resource allocation:**
   - Docker Desktop → Settings → Resources
   - Naikkan CPU dan Memory allocation

---

## 🏗️ Arsitektur Docker

### Container Network

```
┌─────────────────────────────────────────────────┐
│  Host Machine (Your Computer)                   │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Docker Network: bbri-network            │  │
│  │                                           │  │
│  │  ┌─────────────────────────────────┐    │  │
│  │  │  Backend Container               │    │  │
│  │  │  - FastAPI + ML Pipeline         │    │  │
│  │  │  - Port: 8000                    │    │  │
│  │  │  - Volume: ./backend mounted     │    │  │
│  │  └─────────────────────────────────┘    │  │
│  │              ↑                            │  │
│  │              │ API Calls                 │  │
│  │              │                            │  │
│  │  ┌─────────────────────────────────┐    │  │
│  │  │  Frontend Container              │    │  │
│  │  │  - React + Vite                  │    │  │
│  │  │  - Port: 3000                    │    │  │
│  │  │  - Volume: ./frontend mounted    │    │  │
│  │  └─────────────────────────────────┘    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Browser: http://localhost:3000                 │
└─────────────────────────────────────────────────┘
```

---

### Volume Mounting (Live Editing)

```
Host Filesystem          →          Container Filesystem

./backend/main.py        →          /app/main.py
./backend/requirements   →          /app/requirements.txt
./frontend/src/          →          /app/src/
./frontend/package.json  →          /app/package.json

Changes on host = Changes in container (auto-reload!)
```

---

## 📝 Best Practices

### 1. Development Workflow

```bash
# Morning: Start containers
docker-compose up -d

# Work: Edit code normally (changes auto-reload)

# Evening: Stop containers
docker-compose down
```

---

### 2. Before Sharing with Team

```bash
# Test clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up

# If everything works, commit & push
git add .
git commit -m "Add Docker support"
git push
```

---

### 3. Team Member Setup (First Time)

```bash
# 1. Clone repository
git clone <repo-url>
cd <project-folder>

# 2. Run with Docker
docker-compose up --build

# 3. Access at http://localhost:3000
```

**No need to install Python or Node.js!** ✨

---

## 🎯 Keuntungan Menggunakan Docker

✅ **Consistent Environment**

- Semua developer menggunakan Python, Node.js, dan dependencies versi yang sama
- "Works on my machine" problem = SOLVED!

✅ **Easy Setup**

- New team member hanya perlu: Docker + `docker-compose up`
- No manual installation Python/Node.js/libraries

✅ **Isolation**

- Dependencies tidak conflict dengan sistem lokal
- Multiple projects bisa berjalan tanpa bentrok

✅ **Production-Ready**

- Development environment = Production environment
- Easy deployment ke cloud (AWS, Azure, GCP)

---

## 📞 Dukungan

Jika mengalami masalah yang tidak tercantum di sini:

1. Cek logs: `docker-compose logs -f`
2. Cek container status: `docker-compose ps`
3. Restart: `docker-compose restart`
4. Rebuild: `docker-compose up --build`
5. Clean start: `docker-compose down -v && docker-compose up --build`

---

**Happy Dockering! 🐳🚀**

_Dokumen ini dibuat: 29 Juli 2026_  
_Versi: 1.0_
