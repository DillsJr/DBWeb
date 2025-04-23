# DBWeb Project

Sebuah proyek contoh website statis sederhana yang mengintegrasikan autentikasi pengguna (Login, Daftar, Lupa/Reset
Password) dan penyimpanan file (Unggah/Tampil Foto Profil) menggunakan Supabase sebagai backend.

## Fitur

* **Autentikasi Pengguna:**
* Login
* Daftar Pengguna Baru (dengan verifikasi email)
* Lupa Password (mengirim link reset via email)
* Reset Password
* **Profil Pengguna:**
* Menampilkan data profil dasar pengguna.
* Mengunggah dan menampilkan foto profil pengguna (tersimpan di Supabase Storage).
* Memperbarui data profil teks (Nama Lengkap, Username, Whatsapp) melalui modal.
* **Navigasi Halaman:**
* Halaman Login/Daftar (`index.html`).
* Halaman Beranda (Homepage) setelah login (`homepage.html`).
* Halaman Reset Password (`reset-password.html`) - diakses dari link email reset.
* **UI/UX Sederhana:**
* Tampilan form yang berganti (Login/Daftar/Lupa Password) di `index.html`.
* Notifikasi feedback pengguna.
* Modal profil pengguna di homepage.
* Header halaman beranda yang tetap (fixed).
* (Opsional) Placeholder untuk fitur Galeri Foto.

## Teknologi

* **Frontend:**
* HTML5
* CSS3 (`styles.css`, `homestyle.css`)
* JavaScript (Vanilla JS)
* **Backend:**
* [Supabase](https://supabase.com/) (untuk Autentikasi dan Storage)
* Supabase JavaScript Client Library v2
* **Hosting/Pengembangan Lokal (Opsional):**
* [Vercel CLI](https://vercel.com/cli)

## Struktur Proyek
DBWeb/
├── index.html # Halaman Login, Daftar, Lupa Password
├── homepage.html # Halaman Beranda setelah Login
├── reset-password.html # Halaman untuk Reset Password
├── script.js # Logic JavaScript untuk index.html (Login, Daftar, Lupa Password, Navigasi Form)
├── homepage.js # Logic JavaScript untuk homepage.html (Cek Auth, Logout, Profil, Upload/Tampil Foto Profil)
├── reset-password.js # Logic JavaScript untuk reset-password.html (Reset Password)
├── styles.css # Gaya CSS umum untuk semua halaman (form, notifikasi)
├── homestyle.css # Gaya CSS spesifik untuk homepage (layout, header, profil)
├── package.json # Konfigurasi proyek (termasuk script build untuk Vercel)
└── README.md # File ini
└── users.png # (atau nama lain) Placeholder foto profil lokal

## Persiapan (Setup)

1. **Buat Proyek Supabase:**
* Daftar atau masuk ke [dashboard Supabase](https://supabase.com/).
* Buat proyek baru. Catat **Project URL** dan **Anon Public Key** Anda dari pengaturan proyek (Settings -> API).
2. **Konfigurasi Autentikasi di Supabase:**
* Di dashboard Supabase, masuk ke menu **Authentication**.
* Pergi ke **Settings** (ikon roda gigi).
* Di bagian **Site URL**, masukkan URL deployment Anda (misal, jika Anda deploy ke Vercel, URL Vercel Anda). Untuk
pengembangan lokal dengan Vercel CLI, Anda mungkin perlu menambahkan `http://localhost:3000` atau port lain yang Vercel
gunakan.
* Di bagian **Redirect URLs**, tambahkan URL berikut (sesuaikan dengan URL deployment atau lokal Anda):
* URL halaman beranda setelah verifikasi email: `[URL_SITUS_ANDA]/homepage.html` (misal:
`http://localhost:3000/homepage.html`)
* URL halaman reset password: `[URL_SITUS_ANDA]/reset-password.html` (misal:
`http://localhost:3000/reset-password.html`)
3. **Konfigurasi Storage di Supabase:**
* Di dashboard Supabase, masuk ke menu **Storage**.
* Buat bucket baru dengan nama persis **`avatars`**.
* Klik bucket `avatars`, pergi ke tab **Policies**.
* Aktifkan **Row Level Security (RLS)** jika belum aktif.
* Buat kebijakan RLS untuk mengizinkan pengguna terautentikasi mengunggah/memperbarui file dengan nama yang diawali ID
mereka, dan mengizinkan siapa saja untuk melihat file (jika foto profil publik). Contoh kebijakan SQL (bisa dijalankan
di SQL Editor Supabase):
```sql
-- Enable RLS for the bucket
alter table storage.objects enable row level security;

-- Policy to allow authenticated users to INSERT (upload) their profile pic
create policy "Allow authenticated upload"
on storage.objects for insert to authenticated
with check (
bucket_id = 'avatars' AND
name LIKE (auth.uid()::text || '.%')
);

-- Policy to allow authenticated users to UPDATE their profile pic
create policy "Allow authenticated update"
on storage.objects for update to authenticated
using (
bucket_id = 'avatars' AND
name LIKE (auth.uid()::text || '.%')
);

-- Policy to allow public SELECT (view) of profile pics
create policy "Allow public view"
on storage.objects for select to anon, authenticated -- 'public' role can also be used
using (bucket_id = 'avatars');
```
4. **Unduh Kode Proyek:**
* Pastikan Anda memiliki semua file HTML (`index.html`, `homepage.html`, `reset-password.html`), CSS (`styles.css`,
`homestyle.css`), JavaScript (`script.js`, `homepage.js`, `reset-password.js`), dan `package.json` di folder yang sama.
5. **Konfigurasi Kredensial Supabase di Kode:**
* Buka file `script.js` dan `reset-password.js`.
* Ganti nilai `supabaseUrl` dan `supabaseKey` dengan **Project URL** dan **Anon Public Key** Supabase Anda yang
sebenarnya.
6. **Siapkan File Placeholder:**
* Pastikan ada file gambar dengan nama `users.png` (atau sesuai dengan `src` di `<img id="userProfilePic">` di
`homepage.html`) di folder yang sama dengan `homepage.html`. File ini digunakan sebagai gambar default jika foto profil
pengguna belum diunggah.

## Cara Menjalankan Secara Lokal (Menggunakan Vercel CLI)

1. Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/).
2. Instal Vercel CLI secara global: `npm install -g vercel`
3. Buka Command Prompt atau Terminal, navigasikan ke folder utama proyek Anda (`C:\XamppMI\htdocs\DBWeb`).
4. Jalankan perintah: `vercel dev`
5. Vercel CLI akan memulai server pengembangan lokal, biasanya di `http://localhost:3000`. Buka alamat ini di browser
Anda.

## Cara Menjalankan Secara Lokal (Menggunakan Simple Web Server)

Jika Anda tidak ingin menggunakan Vercel CLI secara lokal:

1. Pastikan Anda memiliki simple web server terinstal atau gunakan fitur live server di editor seperti VS Code.
2. Jika menggunakan Python 3: Buka Command Prompt/Terminal di folder proyek, jalankan `python -m http.server 8000`. Lalu
buka `http://localhost:8000/index.html` di browser.
3. Jika menggunakan Node.js: Instal paket `serve` (`npm install -g serve`), lalu jalankan `serve .` di folder proyek,
dan buka alamat yang diberikan (biasanya `http://localhost:3000`).

## Deployment (Menggunakan Vercel)

1. Pastikan Anda sudah login ke Vercel melalui CLI: `vercel login`
2. Buka Command Prompt atau Terminal, navigasikan ke folder utama proyek Anda.
3. Jalankan perintah: `vercel`
4. Ikuti instruksi di terminal. Vercel akan mendeteksi bahwa ini adalah proyek statis.
5. Setelah deployment selesai, Vercel akan memberikan URL publik untuk situs Anda.
6. **PENTING:** Setelah deploy, perbarui **Site URL** dan **Redirect URLs** di pengaturan Authentication Supabase Anda
agar sesuai dengan URL publik dari Vercel.

## Kontribusi

Proyek ini adalah contoh dasar. Anda bisa mengembangkannya dengan:
* Menambahkan validasi form yang lebih ketat.
* Mengimplementasikan fitur galeri foto (upload/tampil banyak foto).
* Menyimpan metadata profil tambahan di tabel database terpisah.
* Menambahkan fitur ganti password dari halaman profil.
* Meningkatkan tampilan UI/UX.

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](https://opensource.org/licenses/MIT).

---

Selamat mengembangkan! Jika ada pertanyaan atau kendala, jangan ragu untuk bertanya.