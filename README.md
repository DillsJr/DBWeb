# Nama Proyek Anda

Deskripsi singkat tentang proyek Anda. Contoh:
Aplikasi web sederhana untuk otentikasi pengguna (Daftar, Masuk, Lupa Password, Reset Password) dan halaman beranda dasar. Dibangun menggunakan HTML, CSS, dan JavaScript untuk frontend, serta Node.js Serverless Functions di Vercel dengan database PostgreSQL (Supabase) sebagai backend.

## Fitur

* **Sistem Otentikasi Pengguna Lengkap:**
    * Pendaftaran Pengguna Baru
    * Login Pengguna (dengan Nomor WhatsApp atau identifier lain)
    * Lupa Password (memerlukan integrasi pengiriman kode reset, misalnya via WhatsApp API - *fitur pengiriman kode reset ini adalah placeholder, implementasi sebenarnya mungkin memerlukan layanan eksternal*)
    * Reset Password menggunakan Kode Reset
* **Homepage:** Halaman beranda sederhana yang menampilkan sapaan nama pengguna yang sedang login.
* **Proteksi Halaman:** Halaman beranda hanya bisa diakses setelah login, dan tidak bisa kembali via tombol 'Back' setelah logout.
* **Lihat Password:** Opsi untuk menampilkan/menyembunyikan input password.
* **Notifikasi Kustom:** Sistem notifikasi pop-up untuk pesan sukses, error, dan info.
* **Teknologi Modern:** Menggunakan Fetch API untuk komunikasi asinkron ke backend API.
* **Database:** Menggunakan PostgreSQL sebagai database (diimplementasikan via Supabase).
* **Deployment:** Siap di-deploy di Vercel.

## Tumpukan Teknologi (Stack)

* **Frontend:**
    * HTML5
    * CSS3
    * JavaScript (Vanilla JS)
* **Backend:**
    * Node.js
    * Vercel Serverless Functions
* **Database:**
    * PostgreSQL
    * Supabase (digunakan sebagai penyedia database PostgreSQL)
* **Deployment:**
    * Vercel

## Struktur Proyek

Struktur direktori proyek ini mengikuti konvensi Vercel untuk aplikasi web statis dengan Serverless Functions:

your-project-root/
├── api/               # Berisi kode Serverless Functions (backend API)
│   ├── login.js
│   ├── register.js
│   ├── forgot-password.js
│   └── reset-password.js
├── public/            # Berisi file statis yang dilayani langsung (frontend)
│   ├── index.html     # Halaman Login & Daftar
│   ├── homepage.html  # Halaman Beranda
│   ├── style.css      # File CSS
│   ├── script.js      # Script JS untuk index.html
│   ├── homepage.js    # Script JS untuk homepage.html
│   └── ... file statis lainnya (gambar, favicon, dll)
├── .env.local         # Environment variables untuk pengembangan lokal (TIDAK di-commit!)
├── .gitignore         # File yang diabaikan oleh Git
├── package.json       # Daftar dependensi Node.js
├── vercel.json        # Konfigurasi deployment Vercel
└── README.md          # File ini


## Instalasi dan Setup

Ikuti langkah-langkah berikut untuk menjalankan proyek ini secara lokal atau mendeploy-nya.

### Prasyarat

* [Node.js dan npm](https://nodejs.org/) (disarankan versi LTS)
* [Git](https://git-scm.com/)
* [Vercel CLI](https://vercel.com/download) (`npm install -g vercel`)
* Akun [Supabase](https://www.supabase.com/) dan database PostgreSQL yang sudah dibuat. Anda memerlukan **Connection String** database Anda.

### Langkah Setup

1.  **Clone Repositori:**
    ```bash
    git clone <URL_repositori_Anda>
    cd <nama_folder_proyek>
    ```

2.  **Install Dependensi Node.js:**
    ```bash
    npm install
    # atau jika Anda menggunakan Yarn
    # yarn install
    ```
    Ini akan menginstal paket-paket seperti `@vercel/postgres`, `bcrypt` (jika digunakan untuk hashing password di backend), dll.

3.  **Setup Environment Variables (Lokal):**
    * Buat file bernama `.env.local` di root folder proyek Anda.
    * Isi file tersebut dengan connection string database Supabase Anda:
        ```env
        DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
        ```
    * Ganti placeholder `[user]`, `[password]`, `[host]`, `[port]`, `[database]` dengan detail database Supabase Anda. Pastikan parameter `?sslmode=require` disertakan jika Anda menggunakan database Supabase.
    * **PENTING:** Pastikan `.env.local` terdaftar di file `.gitignore` Anda agar tidak ter-commit ke repositori publik.

4.  **Setup Environment Variables (Vercel Deployment):**
    * Buka dashboard Vercel proyek Anda.
    * Pergi ke Project Settings -> Environment Variables.
    * Tambahkan variabel baru:
        * Nama: `DATABASE_URL`
        * Value: Masukkan **Connection String database Supabase Anda**.
        * Environment: Pilih `Production`, `Preview`, dan `Development`.
    * Klik "Save".

5.  **Koneksi Database di Kode Backend:**
    * Pastikan Serverless Functions Anda (di folder `api/`) menggunakan `process.env.DATABASE_URL` untuk mendapatkan connection string database. Contoh:
      ```javascript
      import { sql } from '@vercel/postgres'; // atau library DB lain
      // ... di dalam handler function ...
      const client = await sql.connect(); // atau cara koneksi sesuai library Anda
      // ... lakukan query ...
      client.release(); // penting untuk melepaskan koneksi
      ```
    * Jika Anda menggunakan `@vercel/postgres`, koneksi biasanya sudah dihandle, cukup panggil `await sql` langsung.

## Menjalankan Secara Lokal

Setelah menyelesaikan langkah-langkah setup:

1.  Buka Terminal atau Command Prompt di root folder proyek Anda.
2.  Jalankan perintah:
    ```bash
    vercel dev
    ```
3.  Vercel CLI akan membangun proyek Anda dan menjalankannya di server lokal, biasanya di `http://localhost:3000`.
4.  Buka browser Anda dan akses alamat tersebut. Anda sekarang bisa berinteraksi dengan frontend dan backend API di lingkungan lokal.

## Deployment

Proyek ini dikonfigurasi untuk mudah di-deploy di Vercel:

1.  Pastikan proyek Anda terhubung ke repositori Git (GitHub, GitLab, atau Bitbucket).
2.  Setelah melakukan `git push`, Vercel akan secara otomatis mendeteksi proyek ini sebagai "Other" dan menerapkan konfigurasi dari `vercel.json` serta environment variables yang Anda atur di dashboard.
3.  Deployment baru akan dibuat untuk setiap *commit* ke branch utama (misalnya `main`) dan untuk setiap *Pull Request*.

## Penggunaan Aplikasi

1.  Buka halaman login/daftar (akses URL Vercel yang di-deploy, atau `http://localhost:3000` jika menjalankan lokal).
2.  **Daftar:** Pilih tab "Daftar", isi semua informasi yang diperlukan (Nama Lengkap, Username, Whatsapp, Email, Password, Konfirmasi Password), lalu klik tombol Daftar. Jika berhasil, Anda akan melihat notifikasi sukses dan dialihkan ke tab Login.
3.  **Login:** Pilih tab "Masuk", masukkan Nomor Whatsapp dan Password yang sudah terdaftar, lalu klik tombol Masuk. Jika berhasil, Anda akan melihat notifikasi sukses dan dialihkan ke `homepage.html`.
4.  **Homepage:** Di halaman beranda, Anda akan melihat sapaan nama pengguna yang login.
5.  **Logout:** Klik tombol "Logout". Ini akan menghapus status login Anda dari browser dan mengalihkan kembali ke halaman login. Anda tidak akan bisa kembali ke halaman home menggunakan tombol 'Back' browser.
6.  **Lupa Password:** Di halaman login, klik link "Lupa Password?". Masukkan Nomor Whatsapp Anda dan ikuti instruksi (memerlukan implementasi pengiriman kode di backend). Setelah mendapatkan kode, masukkan kode reset dan password baru di form reset password.

## Pengembangan Lanjutan (Opsional)

* Implementasi fitur pengiriman kode reset password (misalnya menggunakan layanan SMS gateway atau WhatsApp API).
* Validasi input frontend yang lebih lengkap (format email, format nomor whatsapp, kekuatan password).
* Penanganan error dan validasi di sisi backend yang lebih detail.
* Menambahkan fitur-fitur lain di homepage.
* Menggunakan library atau framework frontend (React, Vue, Angular) jika aplikasi menjadi lebih kompleks.
* Implementasi sistem sesi atau token (JWT) yang lebih aman daripada hanya mengandalkan `localStorage` untuk status login.

---

Semoga README ini membantu Anda dan orang lain yang mungkin akan melihat proyek Anda! Jangan lupa ganti "[Nama Proyek Anda]", "[Deskripsi singkat tentang proyek Anda]", dan placeholder URL repositori di awal.