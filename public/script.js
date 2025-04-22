// public/script.js - Script untuk halaman login/daftar (Simulasi localStorage sebagai Database Pengguna)

document.addEventListener('DOMContentLoaded', async () => {

    // --- Logika Cek Status Login Awal saat DOMContentLoaded (Simulasi localStorage) ---
    // Bagian ini tetap dinonaktifkan agar index.html selalu menjadi entry point
    // saat pertama kali diakses dari URL utama.
    // const isLoggedIn = localStorage.getItem('isLoggedIn');
    // const loggedInUserIdentifier = localStorage.getItem('loggedInUserIdentifier');
    // if (isLoggedIn === 'true' && loggedInUserIdentifier) {
    //     console.log("Status login di localStorage ditemukan, redirect ke homepage.html (Simulasi)");
    //     window.location.replace('/homepage.html');
    //     return;
    // }
    // --- AKHIR Bagian dinonaktifkan ---


    // --- Simulasi Database Pengguna dengan localStorage ---
    const USER_DB_KEY = 'userDatabase'; // Kunci untuk menyimpan database pengguna di localStorage

    // Fungsi untuk mendapatkan database pengguna dari localStorage
    function getUserDatabase() {
        const db = localStorage.getItem(USER_DB_KEY);
        try {
            // Coba parse sebagai JSON. Jika gagal (misal data kosong atau corrupted), kembalikan array kosong.
            return db ? JSON.parse(db) : [];
        } catch (e) {
            console.error("Gagal membaca user database dari localStorage:", e);
            return []; // Kembalikan array kosong jika ada error
        }
    }

    // Fungsi untuk menyimpan database pengguna ke localStorage
    function saveUserDatabase(db) {
        try {
            localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
        } catch (e) {
            console.error("Gagal menyimpan user database ke localStorage:", e);
            // Tampilkan notifikasi jika penyimpanan gagal (misal: quota penuh)
            showNotification('Gagal menyimpan data pengguna. Memori penyimpanan browser mungkin penuh.', 'error', 5000);
        }
    }

    // Fungsi untuk mencari pengguna berdasarkan identifier (misal: whatsapp atau email atau username)
    function findUserByIdentifier(identifier) {
        const db = getUserDatabase();
        // Cari berdasarkan whatsapp, email, atau username
        return db.find(user =>
            user.whatsapp === identifier ||
            user.email === identifier ||
            user.username === identifier
        );
    }
    // --- Akhir Simulasi Database Pengguna ---


    // --- Mendapatkan elemen-elemen HTML utama ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormContainer = document.getElementById('loginForm');
    const registerFormContainer = document.getElementById('registerForm');

    const loginFormElement = document.getElementById('login');
    const registerFormElement = document.getElementById('register');

    // Elemen notifikasi
    const notificationElement = document.getElementById('custom-notification');

    // --- Fungsi Notifikasi Kustom ---
    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        if (notificationElement.timeoutId) {
            clearTimeout(notificationElement.timeoutId);
        }

        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type;
        notificationElement.classList.add('show');

        notificationElement.timeoutId = setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
                notificationElement.removeEventListener('transitionend', handler);
            });
        }, duration);
    }


    // --- Logika Ganti Tab ---
    function showLoginTab() {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        if (registerFormContainer) registerFormContainer.classList.add('hidden');
        if (loginFormContainer) loginFormContainer.classList.remove('hidden');

        if (loginFormElement) loginFormElement.classList.remove('hidden');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const resetForm = document.getElementById('resetPasswordForm');
        if (forgotForm) forgotForm.classList.add('hidden');
        if (resetForm) resetForm.classList.add('hidden');

        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegisterTab() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        if (loginFormContainer) loginFormContainer.classList.add('hidden');
        if (registerFormContainer) registerFormContainer.classList.remove('hidden');

        if (registerFormElement) registerFormElement.classList.remove('hidden');

        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


    // --- Fungsi untuk Mengganti Tampilan Konten Form di Dalam loginFormContainer (#loginForm) ---
    function showFormContent(formToShowId) {
        if (!loginFormContainer) {
            console.error("Login form container not found.");
            return;
        }
        const formContents = loginFormContainer.querySelectorAll('.form-content');
        formContents.forEach(formContent => {
            formContent.classList.add('hidden');
        });

        const formToShow = document.getElementById(formToShowId);
        if (formToShow) {
            formToShow.classList.remove('hidden');
        } else {
            console.error(`Form content with ID "${formToShowId}" not found.`);
        }
        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    if (loginFormElement) loginFormElement.classList.add('form-content');
    if (registerFormElement) registerFormElement.classList.add('form-content');


    // Pasang event listener untuk tab dan link switch form
    if (loginTab) loginTab.addEventListener('click', showLoginTab);
    if (registerTab) registerTab.addEventListener('click', showRegisterTab);
    const switchToRegisterLink = document.getElementById('switchToRegister');
    const switchToLoginLink = document.getElementById('switchToLogin');
    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterTab();
    });
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginTab();
    });


    // --- Logika Lihat Password ---
    function setupPasswordToggle(checkboxId, passwordInputId) {
        const checkbox = document.getElementById(checkboxId);
        const passwordInput = document.getElementById(passwordInputId);
        if (checkbox && passwordInput) {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
            checkbox.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        } else {
            console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}"`);
        }
    }

    setupPasswordToggle('showLoginPassword', 'loginPassword');
    setupPasswordToggle('showPassword', 'password');
    setupPasswordToggle('showConfirmPassword', 'confirmPassword');


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD (Tetap Simulasi dengan innerHTML dan API Palsu) ---
    // Catatan: Alur lupa password di sini masih menggunakan fetch ke endpoint '/api/forgot-password' dan '/api/reset-password'
    // Endpoint ini tidak benar-benar ada atau terhubung ke database simulasi localStorage.
    // Ini hanyalah simulasi respons berhasil/gagal dari server.
    // Implementasi lupa password yang nyata memerlukan backend dan email/WA service.
    const forgotPasswordLink = document.querySelector('#login form .forgot-password');
    if (!forgotPasswordLink) {
        console.warn("Link 'Lupa Password?' (.forgot-password inside form#login) tidak ditemukan di HTML.");
    } else {
        const loginFormElement = document.getElementById('login');
        const originalLoginFormContentHTML = loginFormElement ? loginFormElement.outerHTML : '';

        const handleForgotPasswordClick = async (e) => {
            e.preventDefault();

            if (!loginFormContainer) {
                console.error("Login form container not found for forgot password flow.");
                return;
            }

            if (loginFormElement) loginFormElement.classList.add('hidden');

            loginFormContainer.innerHTML += `
                <div class="form-content" id="forgotPasswordForm">
                    <h2> Lupa Password </h2>
                    <p style="color: #272343; font-style: italic;"> Masukkan identifier akun Anda (misal: email atau whatsapp) untuk memulai proses reset password. </p>
                    <form>
                        <div class="input-group">
                            <label for="forgotPasswordIdentifier"> Email / Whatsapp </label>
                            <input type="text" id="forgotPasswordIdentifier" placeholder="Masukan Email atau Whatsapp" required>
                        </div>
                        <button type="submit"> Kirim Kode Reset </button>
                        <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                    </form>
                 </div>
            `;

            const forgotPasswordFormElement = document.querySelector('#forgotPasswordForm form');

            const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
            if (switchToLoginFromForgot) {
                switchToLoginFromForgot.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (loginFormContainer) {
                        loginFormContainer.innerHTML = originalLoginFormContentHTML;
                        attachLoginFormListeners();
                    }
                });
            }

            if (forgotPasswordFormElement) {
                forgotPasswordFormElement.addEventListener('submit', async (e) => {
                    e.preventDefault();

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
                    let forgotPasswordUserIdentifier = identifier;

                    showNotification('Memproses permintaan lupa password (simulasi API)...', 'info');

                    // --- SIMULASI PANGGILAN API LUPA PASSWORD ---
                    // Tidak benar-benar cek database localStorage di sini, hanya simulasi respons
                    const response = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            identifier: identifier
                        }),
                    });
                    const data = await response.json();
                    // --- AKHIR SIMULASI ---

                    if (response.ok) {
                        showNotification(data.message || 'Jika akun terdaftar (simulasi), instruksi reset akan dikirim.', 'success', 5000);
                        if (loginFormContainer) {
                            loginFormContainer.innerHTML = `
                                <div class="form-content" id="resetPasswordForm">
                                    <h2> Reset Password </h2>
                                    <p style="color: #272343; font-style: italic;"> Masukkan kode reset (simulasi: "123456") dan password baru Anda. </p>
                                    <form>
                                        <div class="input-group">
                                            <label for="resetPasswordCode"> Kode Reset </label>
                                            <input type="text" id="resetPasswordCode" placeholder="Masukan Kode Reset (simulasi: 123456)" required>
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
                                 </div>
                            `;
                            attachResetPasswordFormListener(forgotPasswordUserIdentifier);
                            setupPasswordToggle('showNewPassword', 'newPassword');
                            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

                            const switchToLoginFromReset = document.getElementById('switchToLoginFromReset');
                            if (switchToLoginFromReset) {
                                switchToLoginFromReset.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    if (loginFormContainer) {
                                        loginFormContainer.innerHTML = originalLoginFormContentHTML;
                                        attachLoginFormListeners();
                                    }
                                });
                            }
                        } else {
                            console.error("Element loginFormContainer not found.");
                        }
                    } else {
                        let errorMessage = 'Gagal mengirim kode reset (simulasi API).';
                        if (data && data.message) {
                            errorMessage += ' ' + data.message;
                        } else {
                            errorMessage += ' Mohon coba lagi.';
                        }
                        showNotification(errorMessage, 'error');
                        console.error('Forgot password failed (simulasi API):', response.status, data);
                    }
                });
            } else {
                console.error("Forgot password form element not found after innerHTML replacement.");
            }
        };
    }

    function attachResetPasswordFormListener(identifier) {
        const resetPasswordFormElement = document.querySelector('#resetPasswordForm form');

        if (resetPasswordFormElement) {
            resetPasswordFormElement.addEventListener('submit', async (e) => {
                e.preventDefault();

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
                    showNotification('Identifier pengguna tidak ditemukan untuk reset.', 'error');
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
                // Validasi Kode Reset Simulasi
                if (resetCode !== '123456') { // Kode reset hardcode untuk simulasi
                    showNotification('Kode reset tidak valid (simulasi).', 'error');
                    return;
                }


                showNotification('Memproses reset password (simulasi API)...', 'info');

                // --- SIMULASI PANGGILAN API RESET PASSWORD ---
                // Tidak benar-benar ubah password di database localStorage di sini, hanya simulasi respons
                const response = await fetch('/api/reset-password-confirm', { // Endpoint simulasi beda
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        identifier: identifier,
                        token: resetCode,
                        newPassword: newPassword
                    }),
                });
                const data = await response.json();
                // --- AKHIR SIMULASI ---


                if (response.ok) {
                    showNotification(data.message || 'Password berhasil direset (simulasi)! Silakan Login.', 'success');
                    // Kembali ke form login setelah notifikasi muncul sebentar
                    setTimeout(() => {
                        const loginFormContainer = document.getElementById('loginForm');
                        if (loginFormContainer) {
                            loginFormContainer.innerHTML = originalLoginFormContentHTML;
                            attachLoginFormListeners();
                        }
                    }, 1500);
                } else {
                    let errorMessage = 'Gagal reset password (simulasi API).';
                    if (data && data.message) {
                        errorMessage += ' ' + data.message;
                    } else {
                        errorMessage += ' Mohon coba lagi.';
                    }
                    showNotification(errorMessage, 'error');
                    console.error('Reset password failed (simulasi API):', response.status, data);
                }
            });

            setupPasswordToggle('showNewPassword', 'newPassword');
            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

        } else {
            console.error("Reset password form element not found after innerHTML replacement.");
        }
    }
    // --- Akhir Alur Lupa Password Simulasi ---


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    function attachLoginFormListeners() {
        const loginFormElement = document.getElementById('login');
        const forgotPasswordLink = document.querySelector('#login form .forgot-password');

        if (loginFormElement) {
            loginFormElement.removeEventListener('submit', handleLoginSubmit);
            loginFormElement.addEventListener('submit', handleLoginSubmit);
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.removeEventListener('click', handleForgotPasswordClick);
            forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
        } else {
            console.warn("Forgot password link (.forgot-password inside form#login) not found.");
        }
    }


    if (registerFormElement) {
        registerFormElement.removeEventListener('submit', handleRegisterSubmit); // Hapus listener sebelumnya jika ada
        registerFormElement.addEventListener('submit', handleRegisterSubmit); // Pasang listener daftar

        setupPasswordToggle('showPassword', 'password');
        setupPasswordToggle('showConfirmPassword', 'confirmPassword');

    } else {
        console.warn("Register form element with ID 'register' not found on initial load.");
    }


    // --- Implementasi handleLoginSubmit (Menggunakan localStorage Database) ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        console.log('Memproses login (menggunakan localStorage database)...');

        const identifierInput = document.getElementById('loginWhatsapp');
        const passwordInput = document.getElementById('loginPassword');

        if (!identifierInput || !passwordInput) {
            console.error("Login form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const identifier = identifierInput.value; // Gunakan Whatsapp sebagai identifier di form login
        const password = passwordInput.value;

        if (!identifier || !password) {
            showNotification('Nomor Whatsapp dan password harus diisi.', 'error');
            return;
        }

        // --- Cek Pengguna di localStorage Database ---
        const user = findUserByIdentifier(identifier); // Cari pengguna berdasarkan Whatsapp, Email, atau Username

        if (!user) {
            // Pengguna tidak ditemukan
            showNotification('Login gagal. Pengguna tidak ditemukan.', 'error');
            console.warn(`Percobaan login gagal: Pengguna dengan identifier "${identifier}" tidak ditemukan.`);
            // Opsional: kosongkan input password
            passwordInput.value = '';
            return;
        }

        // Pengguna ditemukan, verifikasi password (dalam simulasi, cek string biasa)
        if (user.password === password) {
            // Password cocok - Login Berhasil!

            showNotification(`Login berhasil! Selamat datang, ${user.fullName || user.username || identifier}!`, 'success');
            console.log("Login berhasil (menggunakan localStorage database) untuk:", user);

            // --- Simpan Status Login dan Identifier Pengguna untuk Homepage (localStorage Simulasi) ---
            // Simpan identifier yang jelas untuk ditampilkan di homepage
            const userIdentifierForHomepage = user.username || user.whatsapp || user.email || 'Pengguna'; // Pilih identifier terbaik
            localStorage.setItem('loggedInUserIdentifier', userIdentifierForHomepage);
            localStorage.setItem('isLoggedIn', 'true');

            // Hapus kunci lama jika ada
            localStorage.removeItem('loggedInUsername');
            localStorage.removeItem('loggedInWhatsapp');
            localStorage.removeItem('loggedInEmail');
            // Simpan identifier asli (whatsapp, email, atau username) untuk keperluan lain jika perlu
            localStorage.setItem('currentUserDataIdentifier', identifier); // Simpan identifier yang digunakan saat login


            // Redirect ke homepage setelah notifikasi muncul sebentar
            setTimeout(() => {
                window.location.replace('/homepage.html');
            }, 1500);

        } else {
            // Password tidak cocok - Login Gagal
            showNotification('Login gagal. Password salah.', 'error');
            console.warn(`Percobaan login gagal: Password salah untuk identifier "${identifier}".`);
            // Kosongkan input password
            passwordInput.value = '';
        }
    };


    // --- Implementasi handleRegisterSubmit (Menggunakan localStorage Database) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        console.log('Memproses pendaftaran (menggunakan localStorage database)...');

        const fullNameInput = document.getElementById('fullName');
        const usernameInput = document.getElementById('username');
        const whatsappInput = document.getElementById('whatsapp');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (!fullNameInput || !usernameInput || !whatsappInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error("Register form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const fullName = fullNameInput.value.trim(); // Gunakan trim() untuk menghapus spasi di awal/akhir
        const username = usernameInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validasi dasar frontend
        if (!fullName || !username || !whatsapp || !email || !password || !confirmPassword) {
            showNotification('Semua field harus diisi.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Password dan konfirmasi password tidak cocok.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }
        // Tambahkan validasi format email/whatsapp jika perlu

        // --- Cek Duplikasi Pengguna di localStorage Database ---
        const db = getUserDatabase();
        const isDuplicate = db.some(user =>
            user.username === username ||
            user.whatsapp === whatsapp ||
            user.email === email
        );

        if (isDuplicate) {
            showNotification('Pendaftaran gagal. Username, Whatsapp, atau Email sudah terdaftar.', 'error');
            console.warn(`Percobaan pendaftaran gagal: Duplikasi data untuk Username: ${username}, Whatsapp: ${whatsapp}, Email: ${email}`);
            return;
        }

        // --- Tambahkan Pengguna Baru ke localStorage Database ---
        const newUser = {
            id: Date.now(), // ID sederhana berbasis timestamp
            fullName: fullName,
            username: username,
            whatsapp: whatsapp, // Gunakan whatsapp sebagai identifier utama
            email: email,
            password: password, // Dalam simulasi, simpan plain text password
            createdAt: new Date().toISOString()
        };

        db.push(newUser); // Tambahkan pengguna baru ke array
        saveUserDatabase(db); // Simpan array yang diperbarui ke localStorage

        showNotification('Pendaftaran berhasil! Silakan Login.', 'success');
        console.log("Pengguna baru terdaftar:", newUser);

        // Beralih ke form login setelah notifikasi muncul sebentar
        setTimeout(() => {
            showLoginTab();
            // Opsional: kosongkan form pendaftaran setelah berhasil
            const registerForm = document.getElementById('register');
            if (registerForm) registerForm.reset();
        }, 1500);
    };


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    function attachLoginFormListeners() {
        const loginFormElement = document.getElementById('login');
        const forgotPasswordLink = document.querySelector('#login form .forgot-password');

        if (loginFormElement) {
            loginFormElement.removeEventListener('submit', handleLoginSubmit);
            loginFormElement.addEventListener('submit', handleLoginSubmit);
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.removeEventListener('click', handleForgotPasswordClick);
            forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
        } else {
            console.warn("Forgot password link (.forgot-password inside form#login) not found.");
        }
    }


    if (registerFormElement) {
        registerFormElement.removeEventListener('submit', handleRegisterSubmit); // Hapus listener sebelumnya jika ada
        registerFormElement.addEventListener('submit', handleRegisterSubmit); // Pasang listener daftar
        setupPasswordToggle('showPassword', 'password');
        setupPasswordToggle('showConfirmPassword', 'confirmPassword');
    } else {
        console.warn("Register form element with ID 'register' not found on initial load.");
    }


    // --- INITIAL SETUP halaman login/daftar saat DOMContentLoaded (akan selalu dijalankan) ---
    function initializeFormsAndTabs() {
        if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer) {
            console.error("HTML structure for tabs or forms not complete.");
            showNotification('Error: Struktur halaman tidak lengkap.', 'error');
            return;
        }

        attachLoginFormListeners(); // Pasang listener untuk form login awal

        // Atur keadaan awal: sembunyikan form register, tampilkan form login
        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');

        // Pastikan form konten login spesifik juga terlihat
        if (loginFormElement) loginFormElement.classList.remove('hidden');
        const forgotForm = document.getElementById('forgotPasswordForm');
        const resetForm = document.getElementById('resetPasswordForm');
        if (forgotForm) forgotForm.classList.add('hidden');
        if (resetForm) resetForm.classList.add('hidden');

        console.log("Halaman login/daftar diinisialisasi.");
    }

    // Inisialisasi form dan tab akan selalu dijalankan saat DOMContentLoaded
    initializeFormsAndTabs();


}); // Akhir DOMContentLoaded