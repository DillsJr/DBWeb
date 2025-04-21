// public/homepage.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const usernameSpan = document.getElementById('loggedInUsername');
    const logoutButton = document.getElementById('logoutButton');
    const profilePicElement = document.getElementById('userProfilePic');
    const profileUploadArea = document.getElementById('profileUploadArea');
    const profilePicInput = document.getElementById('profilePicInput');
    const notificationElement = document.getElementById('custom-notification'); // Asumsi elemen notifikasi ada

    // --- Data Pengguna (dari localStorage - Simulasi) ---
    const loggedInUserIdentifier = localStorage.getItem('loggedInUserIdentifier'); // Identifier yang disimpan saat login
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // --- Logika Redirect jika Belum Login (Simulasi localStorage) ---
    if (!isLoggedIn || isLoggedIn !== 'true' || !loggedInUserIdentifier) {
        console.log("Belum login atau identifier pengguna tidak ditemukan di localStorage, redirect ke index.html");
        window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
        return; // Hentikan eksekusi script jika belum login
    }
    // --- Akhir Logika Redirect ---

    // Tampilkan username di halaman
    if (usernameSpan) {
        usernameSpan.textContent = loggedInUserIdentifier; // Tampilkan identifier dari localStorage
    } else {
        console.warn("Elemen span untuk username (ID 'loggedInUsername') tidak ditemukan di homepage.");
    }

    // --- Logika Tombol Logout (Simulasi localStorage) ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Hapus status login dan data pengguna dari localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUserIdentifier');
            // Hapus juga foto profil dari localStorage saat logout
            // Ini akan menghapus foto di browser ini, tapi tidak di browser lain (karena hanya localStorage)
            localStorage.removeItem('profilePic_' + loggedInUserIdentifier); // Hapus foto berdasarkan identifier pengguna

            // Opsional: Hapus kunci login lama jika pernah pakai
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInWhatsapp');
            localStorage.removeItem('loggedInEmail'); // Hapus jika email disimpan terpisah


            // Redirect kembali ke halaman login/daftar
            console.log("Logout berhasil (simulasi localStorage), redirect ke index.html");
            window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
        });
    } else {
        console.warn("Tombol logout (ID 'logoutButton') tidak ditemukan di homepage.");
    }
    // --- Akhir Logika Tombol Logout ---


    // --- Logika Foto Profil dan Upload (Menggunakan localStorage) ---

    // Fungsi untuk menampilkan notifikasi kustom
    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        // Clear any existing timeout
        if (notificationElement.timeoutId) {
            clearTimeout(notificationElement.timeoutId);
        }

        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type;
        notificationElement.classList.add('show');

        // Atur timeout untuk menyembunyikan
        notificationElement.timeoutId = setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) { // Pastikan class 'show' sudah dihapus
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                }
                notificationElement.removeEventListener('transitionend', handler);
            });
        }, duration);
    }


    // Fungsi untuk memuat dan menampilkan foto profil dari localStorage
    function loadProfilePicture(userIdentifier) {
        const savedPicUrl = localStorage.getItem('profilePic_' + userIdentifier);

        if (savedPicUrl && profilePicElement && profileUploadArea) {
            // Jika ada foto di localStorage, tampilkan foto dan sembunyikan area upload
            profilePicElement.src = savedPicUrl;
            profilePicElement.style.display = 'block'; // Atau atur via class CSS
            profileUploadArea.style.display = 'none'; // Atau atur via class CSS
            profilePicElement.alt = `Foto Profil ${userIdentifier}`; // Update alt text
        } else if (profilePicElement && profileUploadArea) {
            // Jika tidak ada foto, sembunyikan img dan tampilkan area upload
            profilePicElement.style.display = 'none'; // Atau atur via class CSS
            profileUploadArea.style.display = 'flex'; // Atau atur via class CSS
            // Tetap set src placeholder jika img terlihat (walaupun display none)
            profilePicElement.src = 'placeholder-profile-pic.png';
            profilePicElement.alt = 'Unggah Foto Profil'; // Update alt text
        } else {
            console.warn("Elemen foto profil atau area upload tidak ditemukan.");
        }
    }

    // Muat foto profil saat halaman pertama kali dimuat berdasarkan identifier pengguna
    loadProfilePicture(loggedInUserIdentifier);


    // Event listener saat file dipilih di input file
    if (profilePicInput) {
        profilePicInput.addEventListener('change', (event) => {
            const file = event.target.files[0]; // Ambil file yang dipilih

            if (file) {
                // --- Validasi File (Opsional tapi disarankan) ---
                if (!file.type.startsWith('image/')) {
                    showNotification("Pilih file gambar!", "error");
                    // Reset input agar event 'change' bisa terpicu lagi jika file yg sama dipilih
                    event.target.value = '';
                    return; // Hentikan jika bukan gambar
                }
                // Anda bisa tambahkan cek ukuran file di sini
                // if (file.size > 1024 * 1024) { // Contoh 1MB
                //      showNotification("Ukuran foto terlalu besar (maks 1MB).", "error");
                //      event.target.value = '';
                //      return;
                // }
                // --- Akhir Validasi ---

                const reader = new FileReader(); // Buat objek FileReader

                reader.onloadend = () => {
                    // reader.result berisi Data URL setelah file dibaca
                    const dataUrl = reader.result;

                    // --- Simpan Data URL ke localStorage ---
                    // !!! PENTING: Ingat batasan ukuran localStorage (biasanya 5-10 MB total) dan Data URL bisa sangat besar !!!
                    try {
                        localStorage.setItem('profilePic_' + loggedInUserIdentifier, dataUrl);

                        // Tampilkan foto baru dan sembunyikan area upload
                        if (profilePicElement && profileUploadArea) {
                            profilePicElement.src = dataUrl; // Set src img ke Data URL
                            profilePicElement.style.display = 'block'; // Tampilkan img
                            profileUploadArea.style.display = 'none'; // Sembunyikan area upload
                            profilePicElement.alt = `Foto Profil ${loggedInUserIdentifier}`; // Update alt text
                            showNotification("Foto profil berhasil diunggah!", "success");
                        }

                    } catch (e) {
                        console.error("Gagal menyimpan foto ke localStorage:", e);
                        // Error seringkali karena ukuran terlalu besar
                        showNotification("Gagal menyimpan foto profil. Ukuran mungkin terlalu besar.", "error");
                        // Reset tampilan ke tanpa foto jika gagal
                        if (profilePicElement && profileUploadArea) {
                            profilePicElement.style.display = 'none';
                            profileUploadArea.style.display = 'flex';
                            profilePicElement.alt = 'Unggah Foto Profil'; // Update alt text
                        }
                    }
                    // --- Akhir Simpan ---
                    event.target.value = ''; // Reset input file setelah proses
                };

                // Baca file sebagai Data URL
                reader.readAsDataURL(file);

            } // Akhir if file
        }); // Akhir listener 'change'
    } // Akhir if profilePicInput

    // Jika area upload diklik, picu klik pada input file yang tersembunyi
    // Ini membuat seluruh area upload bisa diklik untuk memilih file
    if (profileUploadArea && profilePicInput) {
        profileUploadArea.addEventListener('click', (event) => {
            // Hanya picu klik jika area upload sedang terlihat
            if (window.getComputedStyle(profileUploadArea).display !== 'none') {
                profilePicInput.click();
            }
            event.stopPropagation(); // Hentikan event propagation dari area
        });
        // Hentikan event propagation dari input file agar tidak double click
        profilePicInput.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        // Opsional: Jika elemen foto profil juga diklik, picu klik pada input file (untuk mengganti)
        if (profilePicElement) {
            profilePicElement.addEventListener('click', (event) => {
                // Hanya picu klik jika elemen foto profil sedang terlihat
                if (window.getComputedStyle(profilePicElement).display !== 'none') {
                    profilePicInput.click();
                }
                event.stopPropagation(); // Hentikan event propagation dari img
            });
        }
    }


    // --- Akhir Logika Foto Profil ---


    // --- Logika Lain untuk Homepage ---
    // Tambahkan skrip lain yang spesifik untuk fitur homepage di sini

}); // Akhir DOMContentLoaded