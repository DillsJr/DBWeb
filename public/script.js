// public/script.js - Script untuk halaman login/daftar (Simulasi localStorage dan API Calls)

document.addEventListener('DOMContentLoaded', async () => { // Menjadikan async

    // --- Logika Cek Status Login Awal saat DOMContentLoaded (Simulasi localStorage) ---
    // BARIS-BARIS BERIKUT DINONAKTIFKAN untuk mencegah redirect otomatis
    // saat pengguna pertama kali membuka halaman login/daftar dari URL utama
    // jika mereka sebelumnya sudah login.
    // Logika cek login dan redirect KE HOMEPAGE jika user berhasil login akan tetap berjalan.
    // const isLoggedIn = localStorage.getItem('isLoggedIn');
    // const loggedInUserIdentifier = localStorage.getItem('loggedInUserIdentifier');

    // if (isLoggedIn === 'true' && loggedInUserIdentifier) {
    //     console.log("Status login di localStorage ditemukan, redirect ke homepage.html (Simulasi)");
    //     window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
    //     return; // Hentikan eksekusi script jika sudah login
    // }
    // --- AKHIR BARIS DINONAKTIFKAN ---


    // --- Lanjutkan Inisialisasi Halaman Login/Daftar (akan selalu dijalankan sekarang) ---

    // --- Mendapatkan elemen-elemen HTML utama (Disuaikan dengan HTML Anda) ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    // Menggunakan ID kontainer form utama sesuai dengan HTML Anda (#loginForm, #registerForm)
    const loginFormContainer = document.getElementById('loginForm'); // Kontainer untuk form login/forgot/reset
    const registerFormContainer = document.getElementById('registerForm'); // Kontainer untuk form daftar

    // Dapatkan elemen form spesifik di dalam kontainer (ID pada tag <form>)
    const loginFormElement = document.getElementById('login'); // Form login spesifik
    const registerFormElement = document.getElementById('register'); // Form daftar spesifik


    // Dapatkan elemen container utama (masih diperlukan untuk notifikasi)
    const container = document.querySelector('.container');


    // --- Fungsi Notifikasi Kustom ---
    const notificationElement = document.getElementById('custom-notification');

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


    // --- Logika Ganti Tab (Show/Hide Kontainer Form Utama Menggunakan Class 'hidden') ---
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


    // --- Logika Lihat Password (Disuaikan dengan ID di HTML Anda) ---
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


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD (Simulasi API Calls dengan innerHTML) ---
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

                    showNotification('Memproses permintaan lupa password (simulasi)...', 'info');

                    try {
                        // --- SIMULASI PANGGILAN API LUPA PASSWORD ---
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
                            showNotification(data.message || 'Jika akun terdaftar, instruksi reset akan dikirim.', 'success', 5000);

                            if (loginFormContainer) {
                                loginFormContainer.innerHTML = `
                                    <div class="form-content" id="resetPasswordForm">
                                        <h2> Reset Password </h2>
                                        <p style="color: #272343; font-style: italic;"> Masukkan kode reset yang telah dikirimkan dan password baru Anda. </p>
                                        <form>
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
                            let errorMessage = 'Gagal mengirim kode reset (simulasi).';
                            if (data && data.message) {
                                errorMessage += ' ' + data.message;
                            } else {
                                errorMessage += ' Mohon coba lagi.';
                            }
                            showNotification(errorMessage, 'error');
                            console.error('Forgot password failed (simulasi):', response.status, data);
                        }
                    } catch (error) {
                        console.error('Error saat memanggil API forgot password (simulasi):', error);
                        showNotification('Terjadi kesalahan saat memproses lupa password (simulasi).', 'error');
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

                showNotification('Memproses reset password (simulasi)...', 'info');

                try {
                    // --- SIMULASI PANGGILAN API RESET PASSWORD ---
                    const response = await fetch('/api/reset-password', {
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

                    if (response.ok) {
                        showNotification(data.message || 'Password berhasil direset! Silakan Login.', 'success');
                        setTimeout(() => {
                            const loginFormContainer = document.getElementById('loginForm');
                            if (loginFormContainer) {
                                loginFormContainer.innerHTML = originalLoginFormContentHTML;
                                attachLoginFormListeners();
                            }
                        }, 1500);
                    } else {
                        let errorMessage = 'Gagal reset password (simulasi).';
                        if (data && data.message) {
                            errorMessage += ' ' + data.message;
                        } else {
                            errorMessage += ' Mohon coba lagi.';
                        }
                        showNotification(errorMessage, 'error');
                        console.error('Reset password failed (simulasi):', response.status, data);
                    }
                } catch (error) {
                    console.error('Error saat memanggil API reset password (simulasi):', error);
                    showNotification('Terjadi kesalahan saat mereset password (simulasi).', 'error');
                }
            });

            setupPasswordToggle('showNewPassword', 'newPassword');
            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

        } else {
            console.error("Reset password form element not found after innerHTML replacement.");
        }
    }


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        console.log('preventDefault executed for login form. Attempting fetch...');

        const identifierInput = document.getElementById('loginWhatsapp');
        const passwordInput = document.getElementById('loginPassword');

        if (!identifierInput || !passwordInput) {
            console.error("Login form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const identifier = identifierInput.value;
        const password = passwordInput.value;

        if (!identifier || !password) {
            showNotification('Nomor Whatsapp dan password harus diisi.', 'error');
            return;
        }

        showNotification('Memproses login (simulasi)...', 'info');

        try {
            // --- SIMULASI PANGGILAN API LOGIN ---
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: identifier,
                    password: password
                }),
            });
            const data = await response.json();

            if (response.ok) {
                showNotification(data.message || 'Login berhasil!', 'success');
                console.log("Data dari server setelah login (simulasi):", data);

                // --- Simpan Status Login dan Identifier Pengguna untuk Homepage (localStorage Simulasi) ---
                let userIdentifierToSave = identifier;
                if (data.user && data.user.username) {
                    userIdentifierToSave = data.user.username;
                } else if (data.user && data.user.fullName) {
                    userIdentifierToSave = data.user.fullName;
                } else if (data.user && data.user.email) {
                    userIdentifierToSave = data.user.email;
                } else if (data.user && data.user.whatsapp) {
                    userIdentifierToSave = data.user.whatsapp;
                } else {
                    userIdentifierToSave = identifier;
                }

                if (userIdentifierToSave) {
                    localStorage.setItem('loggedInUserIdentifier', userIdentifierToSave);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('loggedInWhatsapp');
                    localStorage.removeItem('loggedInEmail');

                } else {
                    console.warn("Login berhasil (simulasi) tapi tidak dapat menentukan identifier pengguna. Status login diset.");
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUserIdentifier');
                }
                // --- Akhir Simpan Status Login (localStorage Simulasi) ---

                // Redirect ke homepage setelah notifikasi muncul sebentar
                setTimeout(() => {
                    window.location.replace('/homepage.html');
                }, 1500);

            } else {
                let errorMessage = 'Login gagal (simulasi).';
                if (data && data.message) {
                    errorMessage += ' ' + data.message;
                } else {
                    errorMessage += ' Mohon coba lagi.';
                }
                showNotification(errorMessage, 'error');
                console.error('Login failed (simulasi):', response.status, data);
                const loginPasswordInput = document.getElementById('loginPassword');
                if (loginPasswordInput) loginPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Error saat memanggil API login (simulasi):', error);
            showNotification('Terjadi kesalahan saat login (simulasi).', 'error');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        console.log('preventDefault executed for register form. Attempting fetch...');

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

        const fullName = fullNameInput.value;
        const username = usernameInput.value;
        const whatsapp = whatsappInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            showNotification('Password dan konfirmasi password tidak cocok', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }

        showNotification('Memproses pendaftaran (simulasi)...', 'info');

        try {
            // --- SIMULASI PANGGILAN API DAFTAR ---
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName,
                    username,
                    whatsapp,
                    email,
                    password
                }),
            });
            const data = await response.json();

            if (response.ok) {
                showNotification(data.message || 'Pendaftaran berhasil! Silakan Login.', 'success');
                setTimeout(() => {
                    showLoginTab();
                    const registerForm = document.getElementById('register');
                    if (registerForm) registerForm.reset();
                }, 1500);
            } else {
                let errorMessage = 'Pendaftaran gagal (simulasi).';
                if (data && data.message) {
                    errorMessage += ' ' + data.message;
                } else {
                    errorMessage += ' Mohon coba lagi.';
                }
                showNotification(errorMessage, 'error');
                console.error('Registration failed (simulasi):', response.status, data);
            }
        } catch (error) {
            console.error('Error saat memanggil API daftar (simulasi):', error);
            showNotification('Terjadi kesalahan saat mendaftar (simulasi).', 'error');
        }
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
        registerFormElement.removeEventListener('submit', handleRegisterSubmit);
        registerFormElement.addEventListener('submit', handleRegisterSubmit);

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
    // (Karena cek login otomatis di awal sudah dihapus)
    initializeFormsAndTabs();


}); // Akhir DOMContentLoaded