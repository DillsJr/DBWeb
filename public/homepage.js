// public/homepage.js - Script untuk halaman homepage (dengan logika foto profil dasar)

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const usernameSpan = document.getElementById('loggedInUsername');
    const logoutButton = document.getElementById('logoutButton');
    const profilePicElement = document.getElementById('userProfilePic');
    const profileUploadArea = document.getElementById('profileUploadArea');
    const profilePicInput = document.getElementById('profilePicInput');
    const notificationElement = document.getElementById('custom-notification'); // Asumsi elemen notifikasi ada

    // --- Data Pengguna ---
    const loggedInUsername = localStorage.getItem('loggedInUserIdentifier');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // --- Logika Redirect jika Belum Login ---
    if (!isLoggedIn || isLoggedIn !== 'true' || !loggedInUsername) {
        console.log("Belum login atau username tidak ditemukan, redirect ke index.html");
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
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Hapus status login dan data pengguna dari localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUserIdentifier');
            // Hapus juga foto profil dari localStorage saat logout
            localStorage.removeItem('profilePic_' + loggedInUsername);
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


    // --- Logika Foto Profil dan Upload (Menggunakan localStorage) ---

    // Fungsi untuk menampilkan notifikasi kustom
    function showNotification(message, type = 'info') {
        if (!notificationElement) return;
        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type;
        notificationElement.classList.add('show');
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000); // Notifikasi hilang setelah 3 detik
    }


    // Fungsi untuk memuat dan menampilkan foto profil
    function loadProfilePicture(username) {
        const savedPicUrl = localStorage.getItem('profilePic_' + username);

        if (savedPicUrl && profilePicElement && profileUploadArea) {
            // Jika ada foto di localStorage, tampilkan foto dan sembunyikan area upload
            profilePicElement.src = savedPicUrl;
            profilePicElement.style.display = 'block'; // Atau atur via class CSS
            profileUploadArea.style.display = 'none'; // Atau atur via class CSS
        } else if (profilePicElement && profileUploadArea) {
            // Jika tidak ada foto, sembunyikan img dan tampilkan area upload
            profilePicElement.style.display = 'none'; // Atau atur via class CSS
            profileUploadArea.style.display = 'flex'; // Atau atur via class CSS
            profilePicElement.src = 'placeholder-profile-pic.png'; // Set placeholder default jika img terlihat
        } else {
            console.warn("Elemen foto profil atau area upload tidak ditemukan.");
        }
    }

    // Muat foto profil saat halaman pertama kali dimuat
    loadProfilePicture(loggedInUsername);


    // Event listener saat file dipilih di input file
    if (profilePicInput) {
        profilePicInput.addEventListener('change', (event) => {
            const file = event.target.files[0]; // Ambil file yang dipilih

            if (file) {
                // --- Validasi File (Opsional tapi disarankan) ---
                if (!file.type.startsWith('image/')) {
                    showNotification("Pilih file gambar!", "error");
                    return; // Hentikan jika bukan gambar
                }
                // Anda bisa tambahkan cek ukuran file di sini
                // if (file.size > 1024 * 1024) { // Contoh 1MB
                //      showNotification("Ukuran foto terlalu besar (maks 1MB).", "error");
                //      return;
                // }
                // --- Akhir Validasi ---

                const reader = new FileReader(); // Buat objek FileReader

                reader.onloadend = () => {
                    // reader.result berisi Data URL setelah file dibaca
                    const dataUrl = reader.result;

                    // --- Simpan Data URL ke localStorage ---
                    // !!! PENTING: Ingat batasan ukuran localStorage dan Data URL !!!
                    try {
                        localStorage.setItem('profilePic_' + loggedInUsername, dataUrl);

                        // Tampilkan foto baru dan sembunyikan area upload
                        if (profilePicElement && profileUploadArea) {
                            profilePicElement.src = dataUrl; // Set src img ke Data URL
                            profilePicElement.style.display = 'block'; // Tampilkan img
                            profileUploadArea.style.display = 'none'; // Sembunyikan area upload
                            showNotification("Foto profil berhasil diunggah!", "success");
                        }

                    } catch (e) {
                        console.error("Gagal menyimpan foto ke localStorage:", e);
                        showNotification("Gagal menyimpan foto profil. Ukuran mungkin terlalu besar.", "error");
                        // Reset tampilan ke tanpa foto jika gagal
                        if (profilePicElement && profileUploadArea) {
                            profilePicElement.style.display = 'none';
                            profileUploadArea.style.display = 'flex';
                        }
                    }
                    // --- Akhir Simpan ---
                };

                // Baca file sebagai Data URL
                reader.readAsDataURL(file);

            } // Akhir if file
        }); // Akhir listener 'change'
    } // Akhir if profilePicInput

    // Jika area upload diklik, picu klik pada input file yang tersembunyi
    // Ini membuat seluruh area upload bisa diklik untuk memilih file
    if (profileUploadArea && profilePicInput) {
        profileUploadArea.addEventListener('click', () => {
            profilePicInput.click();
        });
        // Hentikan event propagation dari input file agar tidak double click
        profilePicInput.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }


    // --- Akhir Logika Foto Profil ---


    // --- Logika Lain untuk Homepage ---
    // Tambahkan skrip lain yang spesifik untuk fitur homepage di sini

}); // Akhir DOMContentLoaded