// public/homepage.js - Script untuk halaman homepage

document.addEventListener('DOMContentLoaded', () => {
    // Dapatkan username dari localStorage
    const loggedInUsername = localStorage.getItem('loggedInUserIdentifier');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Elemen untuk menampilkan username
    const usernameSpan = document.getElementById('loggedInUsername');

    // --- Logika Redirect jika Belum Login ---
    if (!isLoggedIn || isLoggedIn !== 'true' || !loggedInUsername) {
        console.log("Belum login atau username tidak ditemukan, redirect ke index.html");
        // Menggunakan window.location.replace agar pengguna tidak bisa kembali ke homepage dengan tombol 'back'
        window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
        return; // Hentikan eksekusi script jika belum login
    }
    // --- Akhir Logika Redirect ---


    // Tampilkan username di halaman
    if (usernameSpan) {
        usernameSpan.textContent = loggedInUsername;
    } else {
        console.warn("Elemen span untuk username (ID 'loggedInUsername') tidak ditemukan di homepage.");
    }

    // --- Logika Tombol Logout ---
    // Dapatkan tombol logout berdasarkan ID-nya
    const logoutButton = document.getElementById('logoutButton');

    // Pasang event listener untuk tombol logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Hapus status login dari localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUserIdentifier');
            // Opsional: Hapus kunci login lama jika pernah pakai
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInWhatsapp');

            // Redirect kembali ke halaman login/daftar
            console.log("Logout berhasil, redirect ke index.html");
            window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
        });
    } else {
        console.warn("Tombol logout (ID 'logoutButton') tidak ditemukan di homepage.");
    }
    // --- Akhir Logika Tombol Logout ---


    // --- Logika Lain untuk Homepage ---
    // Tambahkan skrip lain yang spesifik untuk fitur homepage di sini
    // Contoh: logika untuk menampilkan/mengubah gambar profil jika ada fitur itu
    // const profilePicElement = document.getElementById('userProfilePic');
    // if (profilePicElement && dataPengguna.urlFotoProfil) {
    //      profilePicElement.src = dataPengguna.urlFotoProfil;
    // }

}); // Akhir DOMContentLoaded