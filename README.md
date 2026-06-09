# 📷 Absensi App

Aplikasi kamera absensi dengan timestamp otomatis, notifikasi pengingat, dan riwayat absensi.

## Fitur
- 📷 Kamera dengan timestamp otomatis (tanggal + jam)
- 💾 Simpan foto langsung ke Galeri > Album "Absensi"
- 🔔 Notifikasi pengingat jam masuk & pulang (bisa diatur)
- 📋 Riwayat absensi lengkap

---

## Cara Build APK (GitHub Actions)

### Langkah 1 — Buat akun Expo
1. Buka https://expo.dev
2. Klik **Sign Up** → daftar gratis
3. Setelah login, klik foto profil di pojok kanan atas
4. Pilih **Access Tokens**
5. Klik **Create Token** → beri nama "github-actions"
6. **Salin token-nya** (hanya tampil sekali!)

### Langkah 2 — Upload kode ke GitHub
1. Buka repository GitHub kamu
2. Klik **"uploading an existing file"** atau drag & drop semua file dari folder ini
3. Pastikan struktur foldernya seperti ini:
   ```
   absensi-app/
   ├── .github/
   │   └── workflows/
   │       └── build-apk.yml
   ├── src/
   │   ├── screens/
   │   │   ├── CameraScreen.js
   │   │   ├── HistoryScreen.js
   │   │   └── SettingsScreen.js
   │   └── utils/
   │       ├── notifications.js
   │       └── storage.js
   ├── assets/          ← buat folder kosong ini
   ├── App.js
   ├── app.json
   ├── babel.config.js
   ├── eas.json
   └── package.json
   ```
4. Klik **Commit changes**

### Langkah 3 — Tambah Expo Token ke GitHub Secrets
1. Di repository GitHub, klik **Settings** (tab atas)
2. Di sidebar kiri, klik **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: paste token dari Langkah 1
6. Klik **Add secret**

### Langkah 4 — Jalankan Build
1. Klik tab **Actions** di repository GitHub
2. Klik workflow **"Build Android APK"** di sidebar kiri
3. Klik **"Run workflow"** → **"Run workflow"** (tombol hijau)
4. Tunggu ±15-20 menit ☕

### Langkah 5 — Download APK
1. Setelah selesai (centang hijau ✅), klik nama workflow-nya
2. Di bagian bawah, lihat **Artifacts**
3. Klik **"absensi-app"** → file `.apk` akan ter-download

### Langkah 6 — Install ke HP
1. Transfer file `.apk` ke HP Android (WhatsApp ke diri sendiri / Google Drive)
2. Buka file `.apk` di HP
3. Jika muncul peringatan "Install dari sumber tidak dikenal" → tap **Settings** → aktifkan → balik dan install
4. Selesai! ✅

---

## Penggunaan Aplikasi

### Tab Kamera (📷)
- Buka aplikasi → langsung ke kamera
- Timestamp otomatis muncul di layar
- Status otomatis: **MASUK** (jam 05.00–12.59) / **PULANG** (jam 13.00–23.59)
- Tap tombol bulat putih untuk foto → tersimpan ke Galeri

### Tab Riwayat (📋)
- Lihat semua foto absensi yang pernah diambil
- Dikelompokkan per hari
- Tap ✕ untuk hapus satu record

### Tab Pengaturan (⚙️)
- Atur jam notifikasi masuk & pulang
- Toggle on/off masing-masing notifikasi
- Tap **Simpan** untuk mengaktifkan
