# 🐳 Docker Quick Start - Sistem Prediksi Saham BBRI

## ⚡ Untuk Anggota Tim Baru

Ikuti 3 langkah ini untuk menjalankan sistem:

---

### 1️⃣ Install Docker

**Download & Install Docker Desktop:**

- Windows/Mac: https://www.docker.com/products/docker-desktop/
- Restart komputer setelah instalasi

**Verifikasi instalasi:**

```bash
docker --version
```

---

### 2️⃣ Clone Repository (Jika Belum)

```bash
git clone <repository-url>
cd "prediksi saham BBRI"
```

---

### 3️⃣ Jalankan Sistem

```bash
docker-compose up --build
```

**Tunggu ±3-5 menit** (pertama kali download dependencies)

---

### 4️⃣ Akses Aplikasi

Buka browser:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/docs

---

## 🎯 Selesai!

Sistem sudah berjalan. Anda bisa:

- Edit code di `backend/` atau `frontend/`
- Perubahan akan auto-reload
- Upload CSV dan jalankan prediksi

---

## 🛑 Menghentikan Sistem

```bash
docker-compose down
```

---

## 📚 Dokumentasi Lengkap

Lihat `DOCKER_GUIDE.md` untuk:

- Troubleshooting
- Perintah Docker advanced
- Best practices

---

**Butuh bantuan?** Lihat logs:

```bash
docker-compose logs -f
```
