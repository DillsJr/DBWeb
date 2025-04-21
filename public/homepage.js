// public/homepage.js 

document.addEventListener('DOMContentLoaded', () => {

    // --- Awal: Cek Status Login Saat Halaman Dimuat ---
    // Baca status login flag dan identifier utama dari localStorage
    // Kunci ini harus SAMA dengan yang disimpan di script.js saat login berhasil
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loggedInUserIdentifier = localStorage.getItem('loggedInUserIdentifier');

    // Jika status login TIDAK 'true' ATAU identifier pengguna utama TIDAK ada, alihkan ke halaman login
    // Ini adalah cek pertama yang sangat penting untuk mencegah akses langsung atau via back button
    if (isLoggedIn !== 'true' || !loggedInUserIdentifier) {
        console.warn("User is not logged in or session expired. Redirecting to login.");
        // **PENTING:** Gunakan window.location.replace()
        // ini mencegah pengguna menekan tombol 'Back' di browser dan kembali ke halaman home
        window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login Anda !!!
        return; // Hentikan eksekusi script selanjutnya di halaman ini karena pengguna belum login
    }
    // --- Akhir: Cek Status Login (Hanya kode di bawah ini yang akan jalan jika user LOGIN) ---


    // Kode di bawah ini HANYA akan dijalankan jika user dianggap sudah login berdasarkan localStorage

    // Dapatkan elemen tempat nama pengguna akan ditampilkan
    const welcomeElement = document.getElementById('welcomeUsername'); // Pastikan ID elemen ini ada di homepage.html
    const logoutButton = document.getElementById('logoutButton'); // Dapatkan tombol logout (Pastikan ID ini ada di homepage.html)


    // Jika elemen sapaan ditemukan, perbarui teksnya dengan identifier pengguna
    if (welcomeElement) {
        // Tampilkan identifier pengguna yang diambil dari localStorage (kita tahu 'loggedInUserIdentifier' ada karena cek di atas)
        welcomeElement.textContent = loggedInUserIdentifier;
    } else {
        console.error("Elemen dengan ID 'welcomeUsername' tidak ditemukan di homepage.html. Sapaan tidak tampil.");
        // Lanjutkan saja jika elemen tidak ditemukan, halaman tetap dipertahankan karena user login
    }


    // --- Logika Tombol Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Logging out...");
            // Hapus semua data login yang relevan dari localStorage
            localStorage.removeItem('loggedInUserIdentifier'); // Hapus identifier utama
            localStorage.removeItem('isLoggedIn'); // Hapus flag status login

            // Bersihkan juga kunci lama jika pernah pakai (opsional, untuk kebersihan)
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInWhatsapp');

            // Hapus token otentikasi atau data sesi lainnya jika ada
            // localStorage.removeItem('authToken');
            // sessionStorage.clear(); // Membersihkan seluruh sessionStorage jika digunakan


            // Alihkan kembali ke halaman login
            // **PENTING:** Gunakan window.location.replace() untuk logout juga
            // ini mencegah pengguna menekan tombol 'Back' di halaman login dan kembali ke halaman home
            window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login Anda !!!
        });
    } else {
        console.warn("Logout button with ID 'logoutButton' not found on homepage.html");
    }
    // --- Akhir Logika Logout ---

    // --- Konten Lain Homepage Anda (Jika Ada Script Terkait) ---
    // Tambahkan kode JavaScript lain yang khusus untuk fungsionalitas homepage di sini,
    // seperti memuat data tambahan, mengatur elemen UI lain, dll.
    // Kode di bagian ini aman, karena hanya berjalan jika user sudah terverifikasi login di bagian paling atas skrip ini.
    // ...

});