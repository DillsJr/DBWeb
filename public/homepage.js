// public/homepage.js

document.addEventListener('DOMContentLoaded', () => {
    // Dapatkan elemen tempat nama pengguna akan ditampilkan
    const welcomeElement = document.getElementById('welcomeUsername');
    const logoutButton = document.getElementById('logoutButton'); // Dapatkan tombol logout jika ada

    // Ambil data pengguna dari localStorage
    // Coba ambil username dulu, jika tidak ada coba ambil whatsapp atau full name
    const loggedInUsername = localStorage.getItem('loggedInUsername'); // Sesuai kunci saat menyimpan di script.js login
    const loggedInWhatsapp = localStorage.getItem('loggedInWhatsapp'); // Kunci lain jika disimpan

    let userIdentifier = '';

    // Tentukan identifier mana yang akan ditampilkan
    if (loggedInUsername) {
        userIdentifier = loggedInUsername;
    } else if (loggedInWhatsapp) {
        userIdentifier = loggedInWhatsapp;
    } else {
        // Jika tidak ada identifier di localStorage, berarti pengguna mungkin belum login
        // Redirect kembali ke halaman login atau tampilkan pesan error
        console.warn("Tidak ada data login di localStorage. Mengalihkan ke halaman login.");
        // Redirect ke halaman login
        window.location.href = '/index.html'; // Arahkan ke halaman login Anda
        return; // Hentikan eksekusi skrip selanjutnya
    }

    // Jika elemen sapaan ditemukan, perbarui teksnya
    if (welcomeElement) {
        welcomeElement.textContent = userIdentifier; // Set teks elemen dengan identifier pengguna
    } else {
        console.error("Elemen dengan ID 'welcomeUsername' tidak ditemukan di homepage.html");
        // Lanjutkan saja jika elemen tidak ditemukan, redirect sudah dilakukan jika tidak login
    }


    // --- Optional: Tambahkan event listener untuk tombol logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Hapus semua data login dari localStorage
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInWhatsapp');
            // Hapus token otentikasi jika Anda menggunakannya (disimpan di localStorage/sessionStorage)
            // localStorage.removeItem('authToken'); // Contoh
            // sessionStorage.clear(); // Contoh hapus semua dari sessionStorage

            // Alihkan kembali ke halaman login
            window.location.href = '/index.html'; // Arahkan ke halaman login Anda
        });
    }
    // --- Akhir Optional: Logout ---

});