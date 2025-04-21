// public/script.js - Script untuk halaman login dan daftar (index.html) dengan animasi

document.addEventListener('DOMContentLoaded', () => {
    // Mendapatkan elemen-elemen HTML utama
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormDiv = document.getElementById('loginForm'); // Div kontainer form login/forgot/reset
    const registerFormDiv = document.getElementById('registerForm'); // Div kontainer form daftar
    const switchToRegisterLink = document.getElementById('switchToRegister'); // Link di form login ke daftar
    const switchToLoginLink = document.getElementById('switchToLogin'); // Link di form daftar ke login

    // Dapatkan elemen container utama
    const container = document.querySelector('.container'); // Pastikan ada div .container di index.html


    // --- Logika Ganti Tab (Animasi diset di CSS) ---
    function showLogin() {
        // Tambah/Hapus class hidden akan memicu animasi transisi di CSS
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Hapus hidden dari loginFormDiv, tambahkan ke registerFormDiv
        // Transisi CSS akan menangani animasi fade/slide
        if (loginFormDiv) {
            loginFormDiv.classList.remove('hidden');
            // Opsional: beri sedikit delay sebelum hidden agar animasi keluar terlihat
            // setTimeout(() => { if (registerFormDiv) registerFormDiv.classList.add('hidden'); }, 300); // Sesuaikan delay dengan durasi transisi
            if (registerFormDiv) registerFormDiv.classList.add('hidden'); // Langsung sembunyikan, animasi akan berjalan
        }
        if (registerFormDiv) {
            // Opsional: beri sedikit delay sebelum remove hidden agar animasi masuk terlihat
            // setTimeout(() => { if (loginFormDiv) loginFormDiv.classList.remove('hidden'); }, 300); // Sesuaikan delay
        }


        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegister() {
        // Tambah/Hapus class hidden akan memicu animasi transisi di CSS
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        // Hapus hidden dari registerFormDiv, tambahkan ke loginFormDiv
        if (registerFormDiv) {
            registerFormDiv.classList.remove('hidden');
            // setTimeout(() => { if (loginFormDiv) loginFormDiv.classList.add('hidden'); }, 300); // Delay sembunyi
            if (loginFormDiv) loginFormDiv.classList.add('hidden'); // Langsung sembunyikan
        }
        if (loginFormDiv) {
            // setTimeout(() => { if (registerFormDiv) registerFormDiv.classList.remove('hidden'); }, 300); // Delay tampil
        }

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

    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;

        clearTimeout(notificationTimeout);
        notificationElement.className = 'custom-notification';
        notificationElement.textContent = message;
        notificationElement.classList.add(type);
        notificationElement.style.display = 'block';
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show');
            const handler = () => {
                if (!notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                    notificationElement.removeEventListener('transitionend', handler);
                }
            };
            notificationElement.addEventListener('transitionend', handler, {
                once: true
            });
            setTimeout(() => {
                if (notificationElement.style.display !== 'none' && !notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
            }, 300); // Fallback delay
        }, duration);
    }

    // --- Logika Lihat Password ---
    function setupPasswordToggle(checkboxId, passwordInputId) {
        const checkbox = document.getElementById(checkboxId);
        const passwordInput = document.getElementById(passwordInputId);
        if (checkbox && passwordInput) {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
            checkbox.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        }
    }

    setupPasswordToggle('showLoginPassword', 'loginPassword');
    setupPasswordToggle('showPassword', 'password');
    setupPasswordToggle('showConfirmPassword', 'confirmPassword');


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD ---
    // Link "Lupa Password?" diambil di awal, tapi listener dipasang di attachLoginFormListeners
    const originalLoginFormHTML = loginFormDiv ? loginFormDiv.innerHTML : '';
    let forgotPasswordWhatsappNumber = '';

    // Fungsi handler terpisah untuk SUBMIT form login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        console.log('preventDefault executed for login form. Attempting fetch...');

        const whatsapp = document.getElementById('loginWhatsapp').value;
        const password = document.getElementById('loginPassword').value;

        if (!whatsapp || !password) {
            showNotification('Nomor Whatsapp dan password harus diisi.', 'error');
            return;
        }

        showNotification('Memproses login...', 'info');

        // --- MULAI: Tambahkan Class Submitting ---
        if (container) container.classList.add('submitting');
        // --- AKHIR: Tambahkan Class Submitting ---

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    whatsapp,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message || 'Login berhasil!', 'success');
                console.log("Data dari server setelah login:", data);

                let userIdentifierToSave = '';
                if (data.user && data.user.username) {
                    userIdentifierToSave = data.user.username;
                } else if (data.user && data.user.fullName) {
                    userIdentifierToSave = data.user.fullName;
                } else if (data.user && data.user.whatsapp) {
                    userIdentifierToSave = data.user.whatsapp;
                }

                if (userIdentifierToSave) {
                    localStorage.setItem('loggedInUserIdentifier', userIdentifierToSave);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('loggedInWhatsapp');
                } else {
                    console.warn("Login berhasil tapi API tidak mengembalikan identifier pengguna yang dikenali. Status login diset.");
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUserIdentifier');
                }

                setTimeout(() => {
                    window.location.href = '/homepage.html'; // Redirect ke homepage
                }, 1500);

            } else {
                let errorMessage = 'Login gagal.';
                if (data && data.message) {
                    errorMessage += ' ' + data.message;
                } else {
                    errorMessage += ' Mohon coba lagi.';
                }
                showNotification(errorMessage, 'error');
                console.error('Login failed:', response.status, data);
                const loginPasswordInput = document.getElementById('loginPassword');
                if (loginPasswordInput) loginPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Error saat memanggil API login:', error);
            showNotification('Terjadi kesalahan saat login', 'error');
        } finally {
            // --- MULAI: Hapus Class Submitting ---
            if (container) container.classList.remove('submitting');
            // --- AKHIR: Hapus Class Submitting ---
        }
    };

    // Fungsi handler terpisah untuk SUBMIT form daftar
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        console.log('preventDefault executed for register form. Attempting fetch...');

        const fullName = document.getElementById('fullName').value;
        const username = document.getElementById('username').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showNotification('Password dan konfirmasi password tidak cocok', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }

        showNotification('Memproses pendaftaran...', 'info');

        // --- MULAI: Tambahkan Class Submitting ---
        if (container) container.classList.add('submitting');
        // --- AKHIR: Tambahkan Class Submitting ---


        try {
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
                    showLogin(); // Beralih ke tab/form login
                    const registerForm = document.getElementById('register');
                    if (registerForm) registerForm.reset();
                }, 1500);
            } else {
                let errorMessage = 'Pendaftaran gagal.';
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
        } finally {
            // --- MULAI: Hapus Class Submitting ---
            if (container) container.classList.remove('submitting');
            // --- AKHIR: Hapus Class Submitting ---
        }
    };


    // Fungsi handler terpisah untuk klik link "Lupa Password?"
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault();

        // originalLoginFormHTML sudah diambil saat DOMContentLoaded

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
                    <button type="submit"> Kirim Kode Reset </button>
                    <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                </form>
            `;
        }

        // Pasang event listener untuk link "Masuk Sekarang" di form lupa password
        const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
        if (switchToLoginFromForgot) {
            switchToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                attachLoginFormListeners(); // Pasang kembali listener form login
            });
        }

        // Pasang event listener untuk submit form lupa password
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const whatsapp = document.getElementById('forgotPasswordWhatsapp').value;
                if (!whatsapp) {
                    showNotification('Nomor Whatsapp harus diisi.', 'error');
                    return;
                }
                forgotPasswordWhatsappNumber = whatsapp;

                showNotification('Mengirim kode reset...', 'info');

                // --- MULAI: Tambahkan Class Submitting ---
                if (container) container.classList.add('submitting');
                // --- AKHIR: Tambahkan Class Submitting ---

                try {
                    const response = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            whatsapp: whatsapp
                        }),
                    });
                    const data = await response.json();

                    if (response.ok) {
                        showNotification(data.message || 'Jika nomor terdaftar, instruksi reset akan dikirim.', 'success', 5000);
                        if (loginFormDiv) {
                            loginFormDiv.innerHTML = `
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
                                        <label for="showConfirmPassword"> Lihat Konfirmasi Password </label>
                                    </div>
                                    <button type="submit"> Reset Password </button>
                                     <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromReset"> Masuk Sekarang </a></p>
                                 </form>
                                `;
                            attachResetPasswordFormListener();
                            setupPasswordToggle('showNewPassword', 'newPassword');
                            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

                            const switchToLoginFromReset = document.getElementById('switchToLoginFromReset');
                            if (switchToLoginFromReset) {
                                switchToLoginFromReset.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML;
                                    attachLoginFormListeners();
                                });
                            }
                        } else {
                            console.error("Element loginFormDiv not found.");
                        }
                    } else {
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
                } finally {
                    // --- MULAI: Hapus Class Submitting ---
                    if (container) container.classList.remove('submitting');
                    // --- AKHIR: Hapus Class Submitting ---
                }
            });
        }
    };


    // Fungsi untuk memasang event listener form reset password
    function attachResetPasswordFormListener() {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const whatsapp = forgotPasswordWhatsappNumber;
                const resetCode = document.getElementById('resetPasswordCode').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;

                if (!whatsapp) {
                    showNotification('Nomor WhatsApp tidak ditemukan untuk reset password.', 'error');
                    console.error("forgotPasswordWhatsappNumber is not set.");
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

                // --- MULAI: Tambahkan Class Submitting ---
                if (container) container.classList.add('submitting');
                // --- AKHIR: Tambahkan Class Submitting ---

                try {
                    const response = await fetch('/api/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            whatsapp: whatsapp,
                            token: resetCode,
                            newPassword: newPassword
                        }),
                    });
                    const data = await response.json();

                    if (response.ok) {
                        showNotification(data.message || 'Password berhasil direset! Silakan Login.', 'success');
                        setTimeout(() => {
                            if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML;
                            attachLoginFormListeners();
                        }, 1500);
                    } else {
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
                } finally {
                    // --- MULAI: Hapus Class Submitting ---
                    if (container) container.classList.remove('submitting');
                    // --- AKHIR: Hapus Class Submitting ---
                }
            });

            setupPasswordToggle('showNewPassword', 'newPassword');
            setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');
        }
    }


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    function attachLoginFormListeners() {
        const loginForm = document.getElementById('login');
        const forgotPasswordLinkInForm = document.querySelector('.forgot-password');

        if (loginForm) {
            // Pasang listener submit form login
            loginForm.addEventListener('submit', handleLoginSubmit);
            setupPasswordToggle('showLoginPassword', 'loginPassword'); // Pasang lihat password
        } else {
            console.error("Login form with ID 'login' not found in attachLoginFormListeners.");
        }

        if (forgotPasswordLinkInForm) {
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick); // Pasang listener link lupa password
        } else {
            console.warn("Forgot password link not found in attachLoginFormListeners.");
        }
    }


    // Fungsi handler terpisah untuk SUBMIT form daftar (Dipasang saat initial load)
    const initialRegisterForm = document.getElementById('register');
    if (initialRegisterForm) {
        initialRegisterForm.addEventListener('submit', handleRegisterSubmit);
    } else {
        console.warn("Register form with ID 'register' not found on initial load.");
    }


    // --- INITIAL SETUP saat DOMContentLoaded ---
    // Panggil ini hanya sekali saat halaman dimuat
    function initializePage() {
        // Pasang listener untuk form login awal dan link lupa password di dalamnya
        attachLoginFormListeners();

        // Pastikan form login awal ditampilkan saat halaman pertama kali dimuat
        showLogin();
    }

    // Panggil fungsi inisialisasi
    initializePage();


}); // Akhir DOMContentLoaded