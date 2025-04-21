// public/script.js - Script untuk halaman login dan daftar (index.html)

document.addEventListener('DOMContentLoaded', () => {
    // Mendapatkan elemen-elemen HTML utama
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormDiv = document.getElementById('loginForm'); // Div kontainer form login/forgot/reset
    const registerFormDiv = document.getElementById('registerForm'); // Div kontainer form daftar
    const switchToRegisterLink = document.getElementById('switchToRegister'); // Link di form login ke daftar
    const switchToLoginLink = document.getElementById('switchToLogin'); // Link di form daftar ke login

    // --- Logika Ganti Tab ---
    function showLogin() {
        // Pastikan elemen ada sebelum mengakses classList
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');
        if (loginFormDiv) loginFormDiv.classList.remove('hidden');
        if (registerFormDiv) registerFormDiv.classList.add('hidden');
        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegister() {
        // Pastikan elemen ada sebelum mengakses classList
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');
        if (registerFormDiv) registerFormDiv.classList.remove('hidden');
        if (loginFormDiv) loginFormDiv.classList.add('hidden');
        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    // Pasang event listener untuk tab dan link switch form
    if (loginTab) loginTab.addEventListener('click', showLogin);
    if (registerTab) registerTab.addEventListener('click', showRegister);
    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', showRegister);
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', showLogin);

    // --- Fungsi Notifikasi Kustom ---
    const notificationElement = document.getElementById('custom-notification');
    let notificationTimeout;

    // Sesuaikan agar notifikasi menghilang dengan transisi show/hide
    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;

        // Bersihkan timeout sebelumnya jika ada
        clearTimeout(notificationTimeout);

        // Reset kelas notifikasi
        notificationElement.className = 'custom-notification';

        // Tambahkan kelas tipe notifikasi (success, error, info)
        notificationElement.textContent = message;
        notificationElement.classList.add(type);
        // Mengatur display block dulu sebelum menambah class 'show'
        notificationElement.style.display = 'block';
        // Memberi sedikit delay agar transisi berjalan (memastikan elemen sudah 'display: block')
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);


        // Atur timeout untuk menyembunyikan notifikasi
        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show'); // Mulai transisi sembunyi
            // Tunggu hingga transisi opacity selesai sebelum set display none
            const handler = () => {
                if (!notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                    notificationElement.removeEventListener('transitionend', handler); // Hapus listener ini setelah selesai
                }
            };
            notificationElement.addEventListener('transitionend', handler, {
                once: true
            }); // { once: true } menghapus listener otomatis
            // Fallback jika transisi tidak terdeteksi
            setTimeout(() => {
                if (notificationElement.style.display !== 'none' && !notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
            }, 300); // Sesuaikan dengan durasi transisi CSS jika ada


        }, duration);
    }
    // --- Akhir Fungsi Notifikasi Kustom ---


    // --- Logika Lihat Password ---
    // Reusable function to setup password visibility toggle
    function setupPasswordToggle(checkboxId, passwordInputId) {
        const checkbox = document.getElementById(checkboxId);
        const passwordInput = document.getElementById(passwordInputId);

        // Pastikan kedua elemen ditemukan sebelum menambahkan event listener
        if (checkbox && passwordInput) {
            // Setel tipe input awal berdasarkan status checkbox (jika refresh)
            passwordInput.type = checkbox.checked ? 'text' : 'password';

            checkbox.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        } else {
            // console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}"`);
        }
    }

    // Pasang lihat password untuk form login (pada saat halaman dimuat)
    setupPasswordToggle('showLoginPassword', 'loginPassword');

    // Pasang lihat password untuk form daftar (pada saat halaman dimuat)
    setupPasswordToggle('showPassword', 'password');
    setupPasswordToggle('showConfirmPassword', 'confirmPassword');


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD ---
    // Link "Lupa Password?" diambil di awal, tapi listener dipasang di attachLoginFormListeners
    // Simpan HTML form login awal untuk kembali nanti
    const originalLoginFormHTML = loginFormDiv ? loginFormDiv.innerHTML : '';
    let forgotPasswordWhatsappNumber = ''; // Variabel untuk menyimpan nomor WhatsApp saat lupa password

    // Fungsi handler terpisah untuk SUBMIT form login
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // <-- PENTING: Mencegah submit form bawaan browser
        console.log('preventDefault executed for login form. Attempting fetch...'); // Log untuk debugging

        const whatsapp = document.getElementById('loginWhatsapp').value;
        const password = document.getElementById('loginPassword').value;

        // Validasi dasar di frontend
        if (!whatsapp || !password) {
            showNotification('Nomor Whatsapp dan password harus diisi.', 'error');
            return;
        }

        showNotification('Memproses login...', 'info'); // Tampilkan pesan loading

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatsapp, // Kirim whatsapp
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) { // Cek status code 200-299 (Login Berhasil)
                showNotification(data.message || 'Login berhasil!', 'success');
                console.log("Data dari server setelah login:", data);

                // --- MULAI: Simpan Status Login dan Identifier Pengguna untuk Homepage ---
                let userIdentifierToSave = '';
                // Tentukan identifier terbaik yang dikembalikan API login
                if (data.user && data.user.username) {
                    userIdentifierToSave = data.user.username; // Coba username
                } else if (data.user && data.user.fullName) {
                    userIdentifierToSave = data.user.fullName; // Coba full name
                } else if (data.user && data.user.whatsapp) {
                    userIdentifierToSave = data.user.whatsapp; // Fallback whatsapp
                }
                // Atur kunci di localStorage yang akan dibaca homepage.js
                if (userIdentifierToSave) {
                    localStorage.setItem('loggedInUserIdentifier', userIdentifierToSave); // Simpan identifier utama dengan kunci konsisten
                    localStorage.setItem('isLoggedIn', 'true'); // Set flag status login
                    // Opsional: Bersihkan kunci lama jika pernah pakai, untuk kebersihan
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('loggedInWhatsapp');
                } else {
                    console.warn("Login berhasil tapi API tidak mengembalikan identifier pengguna yang dikenali. Homepage mungkin tidak menampilkan sapaan, tapi status login diset.");
                    // Tetap set isLoggedIn agar homepage tidak redirect balik meskipun sapaan mungkin kosong
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUserIdentifier'); // Pastikan kunci kosong jika tidak ada identifier
                }
                // --- AKHIR: Simpan Status Login dan Identifier Pengguna ---


                // Redirect ke homepage setelah notifikasi muncul sebentar
                setTimeout(() => {
                    // Menggunakan window.location.href untuk navigasi KE halaman lain itu normal
                    window.location.href = '/homepage.html'; // !!! Pastikan '/homepage.html' adalah path homepage Anda di folder public !!!
                }, 1500); // Delay 1.5 detik

            } else { // Status code 400-599 (Login Gagal)
                let errorMessage = 'Login gagal.';
                // Tangani pesan error dari backend
                if (data && data.message) {
                    errorMessage += ' ' + data.message;
                } else {
                    errorMessage += ' Mohon coba lagi.';
                }
                showNotification(errorMessage, 'error');
                console.error('Login failed:', response.status, data);
                // Opsional: reset form password jika login gagal
                const loginPasswordInput = document.getElementById('loginPassword');
                if (loginPasswordInput) loginPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Error saat memanggil API login:', error);
            showNotification('Terjadi kesalahan saat login', 'error');
        }
    }; // Akhir handleLoginSubmit


    // Fungsi handler terpisah untuk SUBMIT form daftar
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // <-- PENTING: Mencegah submit form bawaan browser
        console.log('preventDefault executed for register form. Attempting fetch...'); // Log untuk debugging

        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validasi di frontend
        if (password !== confirmPassword) {
            showNotification('Password dan konfirmasi password tidak cocok', 'error');
            return;
        }
        // Tambahkan validasi minimal panjang password (sesuaikan jika perlu)
        if (password.length < 6) { // Contoh validasi minimal 6 karakter
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }

        showNotification('Memproses pendaftaran...', 'info'); // Pesan loading

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    username,
                    whatsapp,
                    email,
                    password // Kirim password plaintext, backend akan menghash
                }),
            });

            const data = await response.json();

            if (response.ok) { // Status kode 200-299 (Daftar Berhasil)
                showNotification(data.message || 'Pendaftaran berhasil! Silakan Login.', 'success');
                // Beralih ke form login setelah notifikasi muncul sebentar
                setTimeout(() => {
                    showLogin(); // Beralih ke tab/form login
                    // Opsional: kosongkan form pendaftaran
                    const registerForm = document.getElementById('register');
                    if (registerForm) registerForm.reset();
                }, 1500); // Delay 1.5 detik
            } else { // Status code 400-500an (Daftar Gagal)
                let errorMessage = 'Pendaftaran gagal.';
                // Tangani penanganan khusus error dari backend (misal: sudah terdaftar)
                if (data && data.message) {
                    errorMessage += ' ' + data.message;
                } else {
                    errorMessage += ' Mohon coba lagi.';
                }
                showNotification(errorMessage, 'error');
                console.error('Registration failed:', response.status, data);
            }
        } catch (error) {
            console.error('Error saat memanggil API daftar:', error);
            showNotification('Terjadi kesalahan saat mendaftar', 'error');
        }
    }; // Akhir handleRegisterSubmit


    // Fungsi handler terpisah untuk klik link "Lupa Password?"
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault(); // <-- PENTING: Mencegah navigasi link bawaan

        // Simpan HTML form login awal sebelum diganti (jika belum tersimpan)
        if (!originalLoginFormHTML && loginFormDiv) {
            // Hanya simpan jika belum ada isinya, agar tidak menimpa form lupa password jika diklik lagi
            // Note: originalLoginFormHTML didefinisikan dengan nilai awal saat DOMContentLoaded
            // Jika form div diganti, originalLoginFormHTML tidak update otomatis,
            // jadi simpan nilai *sebelum* innerHTML diganti.
            // Alternatif yang lebih aman adalah simpan template HTML di variabel terpisah
            // Tapi dengan innerHTML = originalLoginFormHTML, ini sudah cukup.
            // Pastikan originalLoginFormHTML hanya diambil 1x di awal.
            // Logika pengambilan originalLoginFormHTML di luar fungsi sudah benar.
        }

        // Ganti konten form login dengan form lupa password
        if (loginFormDiv) {
            loginFormDiv.innerHTML = `
                <h2> Lupa Password </h2>
                <p style="color: #272343; font-style: italic;"> Masukkan nomor WhatsApp Anda untuk memulai proses reset password. </p>
                <form id="forgotPasswordForm">
                    <div class="input-group">
                        <label for="forgotPasswordWhatsapp" style="color: #121629;"> Nomor Whatsapp </label>
                        <input type="tel" id="forgotPasswordWhatsapp" placeholder="Masukan Nomor Whatsapp" required autocomplete="tel">
                    </div>
                    <button type="submit" style="width: 100%; padding: 10px; background-color: #eebbc3; color: #121629; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px;"> Kirim Kode Reset </button>
                    <p class="switch-form" style="text-align: center; color: #121629; margin-top: 20px; font-size: 14px;"> Ingat password? <a href="#" id="switchToLoginFromForgot" style="color: #eebbc3; text-decoration: none; font-weight: bold;"> Masuk Sekarang </a></p>
                </form>
            `;
        }

        // Pasang event listener untuk link "Masuk Sekarang" di form lupa password
        const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
        if (switchToLoginFromForgot) {
            switchToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                attachLoginFormListeners(); // Pasang kembali listener form login (submit dan link forgot password)
            });
        }

        // Pasang event listener untuk submit form lupa password
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // <-- PENTING: Mencegah submit form bawaan

                const whatsapp = document.getElementById('forgotPasswordWhatsapp').value;

                if (!whatsapp) {
                    showNotification('Nomor Whatsapp harus diisi.', 'error');
                    return;
                }

                forgotPasswordWhatsappNumber = whatsapp; // Simpan nomor WhatsApp untuk langkah reset selanjutnya

                showNotification('Mengirim kode reset...', 'info'); // Pesan loading

                try {
                    const response = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            whatsapp: whatsapp
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) { // Status kode 200-299 (Permintaan Kode Berhasil)
                        showNotification(data.message || 'Jika nomor terdaftar, instruksi reset akan dikirim.', 'success', 5000); // Tampilkan lebih lama

                        // Ganti konten form dengan form reset password setelah sukses
                        if (loginFormDiv) {
                            loginFormDiv.innerHTML = `
                                <h2> Reset Password </h2>
                                <p style="color: #272343; font-style: italic;"> Masukkan kode reset yang telah dikirimkan dan password baru Anda. </p>
                                <form id="resetPasswordForm">
                                    <div class="input-group">
                                        <label for="resetPasswordCode" style="color: #121629;"> Kode Reset </label>
                                        <input type="text" id="resetPasswordCode" placeholder="Masukan Kode Reset" required>
                                    </div>
                                    <div class="input-group">
                                        <label for="newPassword" style="color: #121629;"> Password Baru </label>
                                        <input type="password" id="newPassword" placeholder="Masukan Password Baru" required autocomplete="new-password">
                                    </div>
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="showNewPassword">
                                        <label for="showNewPassword" style="color: #888; font-style: italic;"> Lihat Password </label>
                                    </div>
                                    <div class="input-group">
                                        <label for="confirmNewPassword" style="color: #121629;"> Konfirmasi Password Baru </label>
                                        <input type="password" id="confirmNewPassword" placeholder="Masukan Konfirmasi Password Baru" required autocomplete="new-password">
                                    </div>
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="showConfirmNewPassword">
                                        <label for="showConfirmPassword" style="color: #888; font-style: italic;"> Lihat Konfirmasi Password </label>
                                    </div>
                                    <button type="submit" style="width: 100%; padding: 10px; background-color: #eebbc3; color: #121629; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px;"> Reset Password </button>
                                     <p class="switch-form" style="text-align: center; color: #121629; margin-top: 20px; font-size: 14px;"> Ingat password? <a href="#" id="switchToLoginFromReset" style="color: #eebbc3; text-decoration: none; font-weight: bold;"> Masuk Sekarang </a></p>
                                 </form>
                                `;
                            // Setelah HTML form reset dimuat, pasang listener untuknya
                            attachResetPasswordFormListener();
                            // Pasang listener lihat password untuk input baru
                            setupPasswordToggle('showNewPassword', 'newPassword');
                            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

                            // Pasang event listener untuk link kembali ke login dari form reset
                            const switchToLoginFromReset = document.getElementById('switchToLoginFromReset');
                            if (switchToLoginFromReset) {
                                switchToLoginFromReset.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                                    attachLoginFormListeners(); // Pasang kembali listener form login (submit dan link forgot password)
                                });
                            }

                        } else {
                            console.error("Element loginFormDiv not found.");
                        }

                    } else { // Status kode 400-599 (Gagal Mengirim Kode)
                        let errorMessage = 'Gagal mengirim kode reset.';
                        if (data && data.message) {
                            errorMessage += ' ' + data.message;
                        } else {
                            errorMessage += ' Mohon coba lagi.';
                        }
                        showNotification(errorMessage, 'error');
                        console.error('Forgot password failed:', response.status, data);
                    }
                } catch (error) {
                    console.error('Error saat memanggil API forgot password:', error);
                    showNotification('Terjadi kesalahan saat memproses lupa password.', 'error');
                }
            });
        }
    }; // Akhir handleForgotPasswordClick


    // Fungsi untuk memasang event listener form reset password
    // Dipanggil setelah form reset password ditambahkan ke DOM
    function attachResetPasswordFormListener() {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // <-- PENTING: Mencegah submit form bawaan

                // Nomor WhatsApp diambil dari variabel forgotPasswordWhatsappNumber
                const whatsapp = forgotPasswordWhatsappNumber;
                const resetCode = document.getElementById('resetPasswordCode').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;

                // Validasi frontend
                if (!whatsapp) {
                    showNotification('Nomor WhatsApp tidak ditemukan untuk reset password.', 'error');
                    console.error("forgotPasswordWhatsappNumber is not set.");
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showNotification('Password baru dan konfirmasi password tidak cocok.', 'error');
                    return;
                }
                // Tambahkan validasi minimal panjang password baru
                if (newPassword.length < 6) { // Contoh validasi minimal 6 karakter
                    showNotification('Password baru minimal 6 karakter.', 'error');
                    return;
                }

                showNotification('Memproses reset password...', 'info'); // Pesan loading

                try {
                    const response = await fetch('/api/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            whatsapp: whatsapp,
                            token: resetCode,
                            newPassword: newPassword
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) { // Status kode 200-299 (Reset Berhasil)
                        showNotification(data.message || 'Password berhasil direset! Silakan Login.', 'success');
                        // Kembali ke form login setelah notifikasi muncul sebentar
                        setTimeout(() => {
                            if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login
                            attachLoginFormListeners(); // Pasang kembali listener form login (submit dan link forgot password)
                        }, 1500); // Delay 1.5 detik
                    } else { // Status kode 400-599 (Reset Gagal)
                        let errorMessage = 'Gagal reset password.';
                        if (data && data.message) {
                            errorMessage += ' ' + data.message;
                        } else {
                            errorMessage += ' Mohon coba lagi.';
                        }
                        showNotification(errorMessage, 'error');
                        console.error('Reset password failed:', response.status, data);
                    }
                } catch (error) {
                    console.error('Error saat memanggil API reset password:', error);
                    showNotification('Terjadi kesalahan saat mereset password.', 'error');
                }
            });

            // Pasang listener lihat password untuk input di form reset
            setupPasswordToggle('showNewPassword', 'newPassword');
            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

            // Link "Masuk Sekarang" di form reset sudah punya listener yang dipasang saat HTML dibuat.
        }
    }


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
    // dan saat halaman pertama kali dimuat
    function attachLoginFormListeners() {
        // Dapatkan kembali elemen form login yang baru ditambahkan ke DOM
        const loginForm = document.getElementById('login');
        // const showLoginPasswordCheckbox = document.getElementById('showLoginPassword'); // Handled by setupPasswordToggle
        const forgotPasswordLinkInForm = document.querySelector('.forgot-password'); // Dapatkan kembali link lupa password di dalam form

        if (loginForm) {
            // Pasang KEMBALI event listener submit untuk form login HANYA SATU KALI DI SINI
            // Menggunakan fungsi handler terpisah.
            // Jika sebelumnya sudah ada listener pada elemen ini (misal dari initial setup),
            // ini akan memasang listener lagi. Untuk menghindari duplikasi total jika attachLoginFormListeners
            // dipanggil berkali-kali pada elemen form yang SAMA, bisa tambahkan removeEventListener
            // sebelum addEventListener, TAPI karena kita mengganti innerHTML, elemen form SAMA sekali baru,
            // jadi memasang addEventListener saja sudah cukup dan benar.
            loginForm.addEventListener('submit', handleLoginSubmit); // Pasang listener submit form login

            // Pasang kembali event listener lihat password untuk form login
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form with ID 'login' not found in attachLoginFormListeners.");
        }


        // Pasang kembali event listener link "Lupa Password?" di dalam form
        if (forgotPasswordLinkInForm) {
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick); // Pasang listener link lupa password
        } else {
            console.warn("Forgot password link not found in attachLoginFormListeners.");
        }
    }


    // --- INITIAL SETUP ---
    // Fungsi ini dijalankan saat DOMContentLoaded
    function initializePage() {
        // Pasang listener submit untuk form daftar saat halaman pertama dimuat
        const initialRegisterForm = document.getElementById('register');
        if (initialRegisterForm) {
            initialRegisterForm.addEventListener('submit', handleRegisterSubmit); // Gunakan handler terpisah
        } else {
            console.warn("Register form with ID 'register' not found on initial load.");
        }

        // Pasang listener submit form login awal dan link lupa password di dalamnya
        // Panggil ini di sini untuk memasang listener saat halaman pertama dimuat
        attachLoginFormListeners(); // Ini akan memasang handleLoginSubmit ke form#login awal

        // Pastikan form login awal ditampilkan saat halaman pertama kali dimuat
        showLogin(); // Panggil ini untuk memastikan tab login aktif saat dimuat
    }

    // Panggil fungsi inisialisasi saat DOM selesai dimuat
    initializePage();


}); // Akhir DOMContentLoaded