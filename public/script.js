// public/script.js 

document.addEventListener('DOMContentLoaded', () => {
    // --- Mendapatkan elemen-elemen HTML utama ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    // Menggunakan ID yang sesuai dengan struktur HTML simulasi sebelumnya
    const loginFormDiv = document.getElementById('loginFormDiv'); // Div kontainer form login/forgot/reset (DIREVISI: Menggunakan ID kontainer div utama)
    const registerFormDiv = document.getElementById('registerFormDiv'); // Div kontainer form daftar (DIREVISI: Menggunakan ID kontainer div utama)

    // Dapatkan elemen container utama (masih diperlukan untuk notifikasi)
    const container = document.querySelector('.container');

    // --- Fungsi Notifikasi Kustom (Tetap di script.js karena umum di halaman index) ---
    const notificationElement = document.getElementById('custom-notification');
    let notificationTimeout;

    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        clearTimeout(notificationTimeout);
        notificationElement.className = 'custom-notification';
        notificationElement.textContent = message;
        notificationElement.classList.add(type);
        // Tampilkan dengan display block
        notificationElement.style.display = 'block';
        // Picu transisi opacity setelah elemen tampil (jeda kecil)
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        // Atur timeout untuk menyembunyikan
        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show');
            // Sembunyikan display none setelah transisi opacity selesai (jeda kecil)
            setTimeout(() => {
                if (!notificationElement.classList.contains('show')) { // Pastikan class 'show' sudah dihapus
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                }
            }, 300); // Sesuaikan delay ini dengan durasi transisi opacity di CSS jika ada

        }, duration);
    }


    // --- Logika Ganti Tab (Show/Hide Kontainer Form Utama Menggunakan Class 'hidden') ---
    // Menggunakan ID kontainer div utama (#loginFormDiv, #registerFormDiv)
    function showLoginTab() {
        // Atur kelas 'active' pada tab
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Tambahkan class 'hidden' ke kontainer form Daftar (menyembunyikan)
        if (registerFormDiv) registerFormDiv.classList.add('hidden');
        // Hapus class 'hidden' dari kontainer form Login (menampilkan)
        if (loginFormDiv) loginFormDiv.classList.remove('hidden');

        // Setelah beralih ke tab login, pastikan form login spesifik yang ditampilkan di dalamnya
        showFormContent('loginForm'); // Tampilkan form login spesifik (div dengan ID="loginForm")

        // Optional: sembunyikan notifikasi saat ganti tab
        // showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegisterTab() {
        // Atur kelas 'active' pada tab
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        // Tambahkan class 'hidden' ke kontainer form Login (menyembunyikan)
        if (loginFormDiv) loginFormDiv.classList.add('hidden');
        // Hapus class 'hidden' dari kontainer form Daftar (menampilkan)
        if (registerFormDiv) registerFormDiv.classList.remove('hidden');

        // Setelah beralih ke tab register, pastikan form register spesifik yang ditampilkan di dalamnya
        showFormContent('registerForm'); // Tampilkan form register spesifik (div dengan ID="registerForm")

        // Optional: sembunyikan notifikasi saat ganti tab
        // showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


    // --- Fungsi untuk Mengganti Tampilan Konten Form di Dalam loginFormDiv ---
    // Digunakan untuk berpindah antara form login, lupa password, dan reset password di dalam #loginFormDiv
    function showFormContent(formToShowId) {
        if (!loginFormDiv) {
            console.error("Container loginFormDiv not found.");
            return;
        }
        // Dapatkan semua div dengan class="form-content" di dalam loginFormDiv
        const formContents = loginFormDiv.querySelectorAll('.form-content');
        formContents.forEach(formContent => {
            formContent.classList.add('hidden'); // Sembunyikan semua form konten spesifik
        });

        // Dapatkan div form konten spesifik yang ingin ditampilkan berdasarkan ID
        const formToShow = document.getElementById(formToShowId);
        if (formToShow) {
            formToShow.classList.remove('hidden'); // Tampilkan yang diinginkan
        } else {
            console.error(`Form content with ID "${formToShowId}" not found.`);
        }
        // Sembunyikan notifikasi saat ganti form
        showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }


    // Pasang event listener untuk tab dan link switch form
    if (loginTab) loginTab.addEventListener('click', showLoginTab); // REVISI: Menggunakan showLoginTab
    if (registerTab) registerTab.addEventListener('click', showRegisterTab); // REVISI: Menggunakan showRegisterTab
    // Tambahkan preventDefault pada link switch form agar halaman tidak reload
    const switchToRegisterLink = document.getElementById('switchToRegister'); // REVISI: Dapatkan kembali elemen
    const switchToLoginLink = document.getElementById('switchToLogin'); // REVISI: Dapatkan kembali elemen
    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterTab(); // REVISI: Menggunakan showRegisterTab
    });
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginTab(); // REVISI: Menggunakan showLoginTab
    });


    // --- Logika Lihat Password ---
    function setupPasswordToggle(checkboxId, passwordInputId) {
        const checkbox = document.getElementById(checkboxId);
        const passwordInput = document.getElementById(passwordInputId);
        // Pastikan elemen ditemukan
        if (checkbox && passwordInput) {
            // Setel tipe input awal berdasarkan status checkbox (jika halaman direload)
            passwordInput.type = checkbox.checked ? 'text' : 'password';
            // Tambahkan event listener untuk perubahan status checkbox
            checkbox.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        } else {
            // console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}"`);
        }
    }

    // Pasang lihat password untuk form login (input awal)
    setupPasswordToggle('showLoginPassword', 'loginPassword');
    // Pasang lihat password untuk form daftar (input awal)
    setupPasswordToggle('showRegisterPassword', 'registerPassword'); // ID dari HTML asli
    setupPasswordToggle('showRegisterConfirmPassword', 'registerConfirmPassword'); // ID dari HTML asli


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD (Simulasi API Calls) ---
    // Simpan HTML form login awal untuk kembali nanti
    // Menggunakan innerHTML dari form spesifik di dalam div kontainer login
    const loginFormOriginalContent = document.getElementById('loginForm') ? document.getElementById('loginForm').innerHTML : '';

    // Variabel untuk menyimpan nomor WhatsApp saat lupa password
    let forgotPasswordUserIdentifier = ''; // Menggunakan nama identifier yang lebih umum

    // Fungsi handler terpisah untuk SUBMIT form login (Simulasi API Call)
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit form bawaan browser
        console.log('preventDefault executed for login form. Attempting fetch...'); // Log untuk debugging

        // Dapatkan nilai input sesuai form login simulasi Anda
        const identifierInput = document.getElementById('loginEmail'); // Menggunakan ID yang sesuai dengan HTML terbaru (Email)
        const passwordInput = document.getElementById('loginPassword');

        // Pastikan elemen ditemukan
        if (!identifierInput || !passwordInput) {
            console.error("Login form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const identifier = identifierInput.value;
        const password = passwordInput.value;

        // Validasi dasar di frontend
        if (!identifier || !password) {
            showNotification('Email/Identifier dan password harus diisi.', 'error'); // Sesuaikan pesan validasi
            return;
        }

        showNotification('Memproses login...', 'info'); // Tampilkan pesan loading

        try {
            // GANTI '/api/login' dengan endpoint login backend Anda jika ada
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: identifier, // Menggunakan key 'identifier' sesuai API simulasi
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) { // Cek status code 200-299 (Login Berhasil)
                showNotification(data.message || 'Login berhasil!', 'success');
                console.log("Data dari server setelah login:", data);

                // --- Simpan Status Login dan Identifier Pengguna untuk Homepage (localStorage Simulasi) ---
                let userIdentifierToSave = identifier; // Default menggunakan identifier yang diinput
                // Sesuaikan dengan struktur respons API backend Anda jika mengembalikan identifier lain
                if (data.user && data.user.username) { // Contoh jika API mengembalikan user.username
                    userIdentifierToSave = data.user.username;
                } else if (data.user && data.user.fullName) { // Contoh jika API mengembalikan user.fullName
                    userIdentifierToSave = data.user.fullName;
                } else if (data.user && data.user.email) { // Contoh jika API mengembalikan user.email
                    userIdentifierToSave = data.user.email;
                } else if (data.user && data.user.whatsapp) { // Contoh jika API mengembalikan user.whatsapp
                    userIdentifierToSave = data.user.whatsapp;
                }


                // Setel kunci di localStorage yang akan dibaca homepage.js (localStorage simulasi)
                if (userIdentifierToSave) {
                    localStorage.setItem('loggedInUserIdentifier', userIdentifierToSave); // Kunci utama konsisten
                    localStorage.setItem('isLoggedIn', 'true'); // Set flag status login
                    // Opsional: Bersihkan kunci lama jika pernah pakai
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('loggedInWhatsapp');
                    localStorage.removeItem('loggedInEmail'); // Hapus jika email sebelumnya disimpan dengan kunci beda

                } else {
                    console.warn("Login berhasil tapi API tidak mengembalikan identifier pengguna yang jelas. Status login diset.");
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUserIdentifier'); // Pastikan kunci kosong jika tidak ada identifier
                }
                // --- Akhir Simpan Status Login (localStorage Simulasi) ---


                // Redirect ke homepage setelah notifikasi muncul sebentar
                setTimeout(() => {
                    // Menggunakan window.location.replace agar tidak bisa kembali ke halaman login pakai tombol back
                    window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
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
                if (passwordInput) passwordInput.value = '';
            }
        } catch (error) {
            console.error('Error saat memanggil API login:', error);
            showNotification('Terjadi kesalahan saat login', 'error');
        }
    }; // Akhir handleLoginSubmit


    // Fungsi handler terpisah untuk SUBMIT form daftar (Simulasi API Call)
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit form bawaan browser
        console.log('preventDefault executed for register form. Attempting fetch...'); // Log untuk debugging

        // Dapatkan nilai input sesuai form daftar simulasi Anda (gunakan ID dari HTML terbaru)
        const fullNameInput = document.getElementById('fullName');
        const usernameInput = document.getElementById('username');
        const whatsappInput = document.getElementById('whatsapp');
        const emailInput = document.getElementById('registerEmail'); // Menggunakan ID 'registerEmail' dari HTML terbaru
        const passwordInput = document.getElementById('registerPassword'); // Menggunakan ID 'registerPassword'
        const confirmPasswordInput = document.getElementById('registerConfirmPassword'); // Menggunakan ID 'registerConfirmPassword'

        // Pastikan elemen ditemukan
        if (!fullNameInput || !usernameInput || !whatsappInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error("Register form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const fullName = fullNameInput.value;
        const username = usernameInput.value;
        const whatsapp = whatsappInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;


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
        // Tambahkan validasi untuk input lain jika diperlukan (misal: format email/whatsapp)

        showNotification('Memproses pendaftaran...', 'info'); // Pesan loading

        try {
            // GANTI '/api/register' dengan endpoint register backend Anda jika ada
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName, // Sesuaikan key sesuai API Anda
                    username,
                    whatsapp,
                    email,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) { // Status kode 200-299 (Daftar Berhasil)
                showNotification(data.message || 'Pendaftaran berhasil! Silakan Login.', 'success');
                // Beralih ke form login setelah notifikasi muncul sebentar
                setTimeout(() => {
                    showLoginTab(); // Beralih ke tab/form login (REVISI: Menggunakan showLoginTab)
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
        e.preventDefault(); // Mencegah navigasi link bawaan

        // originalLoginFormHTML sudah diambil saat DOMContentLoaded

        // Dapatkan div form konten login spesifik
        const loginFormContentDiv = document.getElementById('loginForm');
        if (!loginFormContentDiv) {
            console.error("Login form content div not found.");
            return;
        }

        // Simpan HTML form login konten spesifik untuk kembali nanti
        const originalLoginFormContentHTML = loginFormContentDiv.innerHTML;


        // Ganti konten form login dengan form lupa password menggunakan innerHTML
        // Tidak ada animasi fade/slide saat menggunakan innerHTML
        loginFormContentDiv.innerHTML = `
                <h2> Lupa Password </h2>
                <p style="color: #272343; font-style: italic;"> Masukkan identifier akun Anda (misal: email atau whatsapp) untuk memulai proses reset password. </p>
                <form id="forgotPasswordForm">
                     <div class="input-group">
                         <label for="forgotPasswordIdentifier"> Email / Whatsapp </label>
                         <input type="text" id="forgotPasswordIdentifier" placeholder="Masukan Email atau Whatsapp" required>
                     </div>
                     <button type="submit"> Kirim Kode Reset </button>
                     <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                </form>
            `;


        // Pasang event listener untuk link "Masuk Sekarang" di form lupa password (setelah HTML diganti)
        const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
        if (switchToLoginFromForgot) {
            switchToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                // Kembalikan ke konten form login awal
                if (loginFormContentDiv) {
                    loginFormContentDiv.innerHTML = originalLoginFormContentHTML;
                    attachLoginFormListeners(); // Pasang kembali listener form login (submit dan link forgot password)
                }
            });
        }

        // Pasang event listener untuk submit form lupa password (setelah HTML diganti)
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Mencegah submit form bawaan

                const identifierInput = document.getElementById('forgotPasswordIdentifier');
                if (!identifierInput) {
                    console.error("Forgot password identifier input not found.");
                    showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
                    return;
                }
                const identifier = identifierInput.value;

                if (!identifier) {
                    showNotification('Identifier (Email/Whatsapp) harus diisi.', 'error');
                    return;
                }
                forgotPasswordUserIdentifier = identifier; // Simpan identifier untuk langkah reset

                showNotification('Mengirim kode reset...', 'info');

                try {
                    // GANTI '/api/forgot-password' dengan endpoint forgot password backend Anda jika ada
                    const response = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            identifier: identifier // Sesuaikan key sesuai API Anda
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) { // Status kode 200-299 (Permintaan Kode Berhasil)
                        showNotification(data.message || 'Jika akun terdaftar, instruksi reset akan dikirim.', 'success', 5000); // Tampilkan lebih lama

                        // Ganti konten form dengan form reset password setelah sukses (menggunakan innerHTML)
                        if (loginFormContentDiv) {
                            loginFormContentDiv.innerHTML = `
                                <h2> Reset Password </h2>
                                <p style="color: #272343; font-style: italic;"> Masukkan kode reset yang telah dikirimkan dan password baru Anda. </p>
                                <form id="resetPasswordForm">
                                    <div class="input-group">
                                        <label for="resetPasswordCode"> Kode Reset </label>
                                        <input type="text" id="resetPasswordCode" placeholder="Masukan Kode Reset" required>
                                    </div>
                                    <div class="input-group">
                                        <label for="newPassword"> Password Baru </label>
                                        <input type="password" id="newPassword" placeholder="Masukan Password Baru" required autocomplete="new-password">
                                    </div>
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="showNewPassword">
                                        <label for="showNewPassword"> Lihat Password </label>
                                    </div>
                                    <div class="input-group">
                                        <label for="confirmNewPassword"> Konfirmasi Password Baru </label>
                                        <input type="password" id="confirmNewPassword" placeholder="Masukan Konfirmasi Password Baru" required autocomplete="new-password">
                                    </div>
                                    <div class="checkbox-group">
                                        <input type="checkbox" id="showConfirmNewPassword">
                                        <label for="showConfirmNewPassword"> Lihat Konfirmasi Password </label>
                                    </div>
                                    <button type="submit"> Reset Password </button>
                                       <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromReset"> Masuk Sekarang </a></p>
                                </form>
                                `;
                            // Setelah HTML form reset dimuat, pasang listener untuknya
                            attachResetPasswordFormListener();
                            // Pasang listener lihat password untuk input baru
                            setupPasswordToggle('showNewPassword', 'newPassword');
                            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

                            // Pasang event listener untuk link kembali ke login dari form reset (setelah HTML diganti)
                            const switchToLoginFromReset = document.getElementById('switchToLoginFromReset');
                            if (switchToLoginFromReset) {
                                switchToLoginFromReset.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    // Kembali ke konten form login awal
                                    if (loginFormContentDiv) {
                                        loginFormContentDiv.innerHTML = originalLoginFormContentHTML;
                                        attachLoginFormListeners(); // Pasang kembali listener form login
                                    }
                                });
                            }

                        } else {
                            console.error("Element loginFormContentDiv not found to load reset password form.");
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
        } else {
            console.error("Forgot password form with ID 'forgotPasswordForm' not found after innerHTML replacement.");
        }
    }; // Akhir handleForgotPasswordClick


    // Fungsi untuk memasang event listener form reset password
    // Dipanggil setelah form reset password ditambahkan ke DOM via innerHTML
    function attachResetPasswordFormListener() {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Mencegah submit form bawaan

                // Identifier (Email/Whatsapp) diambil dari variabel forgotPasswordUserIdentifier
                const identifier = forgotPasswordUserIdentifier;
                const resetCodeInput = document.getElementById('resetPasswordCode');
                const newPasswordInput = document.getElementById('newPassword');
                const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

                if (!resetCodeInput || !newPasswordInput || !confirmNewPasswordInput) {
                    console.error("Reset password form inputs not found after innerHTML replacement.");
                    showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
                    return;
                }


                const resetCode = resetCodeInput.value;
                const newPassword = newPasswordInput.value;
                const confirmNewPassword = confirmNewPasswordInput.value;


                // Validasi frontend
                if (!identifier) {
                    showNotification('Identifier pengguna tidak ditemukan.', 'error');
                    console.error("forgotPasswordUserIdentifier is not set for reset.");
                    return;
                }
                if (!resetCode || !newPassword || !confirmNewPassword) {
                    showNotification('Kode reset, password baru, dan konfirmasi harus diisi.', 'error');
                    return;
                }
                if (newPassword !== confirmNewPassword) {
                    showNotification('Password baru dan konfirmasi password tidak cocok.', 'error');
                    return;
                }
                if (newPassword.length < 6) {
                    showNotification('Password baru minimal 6 karakter.', 'error');
                    return;
                }

                showNotification('Memproses reset password...', 'info');

                try {
                    // GANTI '/api/reset-password' dengan endpoint reset password backend Anda jika ada
                    const response = await fetch('/api/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            identifier: identifier, // Sesuaikan key sesuai API Anda
                            token: resetCode,
                            newPassword: newPassword
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) { // Status kode 200-299 (Reset Berhasil)
                        showNotification(data.message || 'Password berhasil direset! Silakan Login.', 'success');
                        // Kembali ke form login setelah notifikasi muncul sebentar
                        setTimeout(() => {
                            const loginFormContentDiv = document.getElementById('loginForm');
                            if (loginFormContentDiv) {
                                loginFormContentDiv.innerHTML = originalLoginFormContentHTML; // Kembali ke form login
                                attachLoginFormListeners(); // Pasang kembali listener form login
                            }
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

            // Pasang listener lihat password untuk input di form reset (setelah HTML diganti)
            setupPasswordToggle('showNewPassword', 'newPassword');
            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

            // Link "Masuk Sekarang" di form reset sudah punya listener yang dipasang saat HTML dibuat.
        } else {
            console.error("Reset password form with ID 'resetPasswordForm' not found after innerHTML replacement.");
        }
    }


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
    // dan saat halaman pertama kali dimuat
    function attachLoginFormListeners() {
        // Dapatkan kembali elemen form login yang baru ditambahkan ke DOM (setelah innerHTML)
        const loginForm = document.getElementById('login');
        const forgotPasswordLinkInForm = document.querySelector('#loginForm .forgot-password'); // Dapatkan kembali link lupa password

        // Pastikan elemen form login ditemukan
        if (loginForm) {
            // Pasang event listener submit untuk form login HANYA SATU KALI DI SINI
            // Menggunakan fungsi handler terpisah.
            loginForm.addEventListener('submit', handleLoginSubmit); // Pasang listener submit form login

            // Pasang kembali event listener lihat password untuk form login
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form with ID 'login' not found in attachLoginFormListeners.");
        }

        // Pasang kembali event listener link "Lupa Password?" di dalam form (setelah innerHTML)
        // Pastikan link lupa password ditemukan di dalam form login
        if (forgotPasswordLinkInForm) {
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick); // Pasang listener link lupa password
        } else {
            console.warn("Forgot password link with class 'forgot-password' not found inside #loginForm.");
        }
    }


    // Fungsi handler terpisah untuk SUBMIT form daftar (Dipasang saat initial load)
    // Dapatkan elemen form daftar awal saat DOMContentLoaded
    const initialRegisterForm = document.getElementById('register');
    if (initialRegisterForm) {
        // Pasang event listener submit untuk form daftar HANYA SATU KALI DI SINI
        // Menggunakan fungsi handler terpisah.
        initialRegisterForm.addEventListener('submit', handleRegisterSubmit); // Gunakan handler terpisah
        // Pasang lihat password untuk form daftar (input awal)
        setupPasswordToggle('showRegisterPassword', 'registerPassword');
        setupPasswordToggle('showRegisterConfirmPassword', 'registerConfirmPassword');

    } else {
        console.warn("Register form with ID 'register' not found on initial load.");
    }


    // --- Logika Cek Status Login Awal saat DOMContentLoaded (Simulasi localStorage) ---
    // Fungsi ini dijalankan saat DOMContentLoaded
    function initializePage() {
        // Pasang listener submit form login awal dan link lupa password di dalamnya
        // Panggil ini di sini untuk memasang listener saat halaman pertama dimuat
        attachLoginFormListeners(); // Ini akan memasang handleLoginSubmit ke form#login awal

        // --- PENTING: Atur keadaan awal saat halaman dimuat ---
        // Sembunyikan form register dan tampilkan form login menggunakan class 'hidden'
        // Menggunakan ID kontainer div utama (#loginFormDiv, #registerFormDiv)
        if (registerFormDiv) {
            registerFormDiv.classList.add('hidden');
        }
        if (loginFormDiv) {
            loginFormDiv.classList.remove('hidden');
        }
        // --- Akhir pengaturan keadaan awal ---


        // Pastikan tab login aktif secara visual
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Catatan:showLoginTab() tidak perlu dipanggil di sini karena pengaturan display/hidden
        // dan kelas 'active' pada tab sudah diatur di atas.
    }

    // Cek status login saat halaman dimuat, dan panggil inisialisasi jika belum login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loggedInUserIdentifier = localStorage.getItem('loggedInUserIdentifier'); // Identifier yang disimpan saat login

    if (isLoggedIn === 'true' && loggedInUserIdentifier) {
        // Jika status login true dan identifier ada, arahkan ke homepage
        console.log("Status login di localStorage ditemukan, redirect ke homepage.html");
        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
    } else {
        // Jika belum login di localStorage, panggil fungsi inisialisasi halaman login/daftar
        console.log("Status login di localStorage tidak ditemukan, tampilkan form login/daftar.");
        initializePage();
    }


}); // Akhir DOMContentLoaded