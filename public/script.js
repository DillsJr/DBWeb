// public/script.js - Script tanpa animasi pada form perpindahan (DIKOREKSI)

document.addEventListener('DOMContentLoaded', () => {
    // Mendapatkan elemen-elemen HTML utama
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormDiv = document.getElementById('loginForm'); // Div kontainer form login/forgot/reset
    const registerFormDiv = document.getElementById('registerForm'); // Div kontainer form daftar
    const switchToRegisterLink = document.getElementById('switchToRegister'); // Link di form login ke daftar
    const switchToLoginLink = document.getElementById('switchToLogin'); // Link di form daftar ke login

    // Dapatkan elemen container utama (masih diperlukan untuk notifikasi)
    const container = document.querySelector('.container');


    // --- Logika Ganti Tab (Show/Hide Langsung Menggunakan Class 'hidden') ---
    function showLogin() {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Tambahkan class 'hidden' ke form Daftar
        if (registerFormDiv) registerFormDiv.classList.add('hidden');
        // Hapus class 'hidden' dari form Login
        if (loginFormDiv) loginFormDiv.classList.remove('hidden');

        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegister() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        // Tambahkan class 'hidden' ke form Login
        if (loginFormDiv) loginFormDiv.classList.add('hidden');
        // Hapus class 'hidden' dari form Daftar
        if (registerFormDiv) registerFormDiv.classList.remove('hidden');

        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


    // Pasang event listener untuk tab dan link switch form
    if (loginTab) loginTab.addEventListener('click', showLogin);
    if (registerTab) registerTab.addEventListener('click', showRegister);
    // Tambahkan preventDefault pada link switch form agar halaman tidak reload
    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegister();
    });
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });


    // --- Fungsi Notifikasi Kustom ---
    const notificationElement = document.getElementById('custom-notification');
    let notificationTimeout;

    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        clearTimeout(notificationTimeout);
        notificationElement.className = 'custom-notification';
        notificationElement.textContent = message;
        notificationElement.classList.add(type);
        // Langsung tampilkan dengan display block untuk notifikasi
        notificationElement.style.display = 'block';
        // Picu transisi opacity setelah elemen tampil
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);

        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show');
            // Sembunyikan dengan display none setelah transisi opacity selesai
            setTimeout(() => {
                if (notificationElement.style.display !== 'none' && !notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
            }, 300); // Sesuaikan delay dengan durasi transisi opacity notifikasi

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
        // Hapus penambahan class submitting jika tidak pakai animasi submit
        // if (container) container.classList.add('submitting');

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
                    localStorage.removeItem('loggedInUsername'); // Cleanup old key
                    localStorage.removeItem('loggedInWhatsapp'); // Cleanup old key
                } else {
                    console.warn("Login berhasil tapi API tidak mengembalikan identifier pengguna yang dikenali. Status login diset.");
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUserIdentifier'); // Ensure key is empty
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
                showNotification(errorMessage, 'error'); // Ini baris yang terpotong sebelumnya
                console.error('Login failed:', response.status, data);
                const loginPasswordInput = document.getElementById('loginPassword');
                if (loginPasswordInput) loginPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Error saat memanggil API login:', error);
            showNotification('Terjadi kesalahan saat login', 'error');
        } finally {
            // Hapus penambahan class submitting jika tidak pakai animasi submit
            // if (container) container.classList.remove('submitting');
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
        // Hapus penambahan class submitting jika tidak pakai animasi submit
        // if (container) container.classList.add('submitting');

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
            // Hapus penambahan class submitting jika tidak pakai animasi submit
            // if (container) container.classList.remove('submitting');
        }
    };


    // Fungsi handler terpisah untuk klik link "Lupa Password?"
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault();
        // originalLoginFormHTML sudah diambil saat DOMContentLoaded

        // Ganti konten form login dengan form lupa password
        if (loginFormDiv) {
            // Karena innerHTML diganti, tidak ada animasi fade/slide di sini
            // Elemen baru akan langsung menggantikan konten lama
            loginFormDiv.innerHTML = `
                <h2> Lupa Password </h2>
                <p style="color: #272343; font-style: italic;"> Masukkan nomor WhatsApp Anda untuk memulai proses reset password. </p>
                <form id="forgotPasswordForm">
                    <div class="input-group">
                        <label for="forgotPasswordWhatsapp"> Nomor Whatsapp </label>
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
                if (loginFormDiv) {
                    loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                    attachLoginFormListeners(); // Pasang kembali listener form login
                }
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
                // Hapus penambahan class submitting
                // if (container) container.classList.add('submitting');

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
                            // Mengganti ke form reset
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
                                    if (loginFormDiv) {
                                        loginFormDiv.innerHTML = originalLoginFormHTML;
                                        attachLoginFormListeners();
                                    }
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
                    // Hapus penambahan class submitting
                    // if (container) container.classList.remove('submitting');
                }
            });
        }
    };


    // Fungsi untuk memasang kembali event listener form reset password
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
                // Hapus penambahan class submitting
                // if (container) container.classList.add('submitting');

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
                            if (loginFormDiv) {
                                loginFormDiv.innerHTML = originalLoginFormHTML;
                                attachLoginFormListeners();
                            }
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
                    // Hapus penambahan class submitting
                    // if (container) container.classList.remove('submitting');
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
            loginForm.addEventListener('submit', handleLoginSubmit);
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form with ID 'login' not found in attachLoginFormListeners.");
        }

        if (forgotPasswordLinkInForm) {
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick);
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

        // --- PENTING: Atur keadaan awal saat halaman dimuat ---
        // Sembunyikan form register dan tampilkan form login menggunakan class 'hidden'
        if (registerFormDiv) {
            registerFormDiv.classList.add('hidden');
            // Hapus class animasi visual jika ada dari cache (tidak perlu di versi tanpa animasi)
            // registerFormDiv.classList.remove('form-hidden-visual');
            // Pastikan display: none; diatur
            registerFormDiv.style.display = 'none';
        }
        if (loginFormDiv) {
            loginFormDiv.classList.remove('hidden');
            // Hapus class animasi visual jika ada dari cache (tidak perlu di versi tanpa animasi)
            // loginFormDiv.classList.remove('form-hidden-visual');
            // Pastikan display: block; diatur
            loginFormDiv.style.display = 'block';
            // Hapus juga properti inline style display jika ada dari cache
            loginFormDiv.style.display = ''; // Biarkan CSS yang mengatur display block secara default

        }
        // --- Akhir pengaturan keadaan awal ---

        // Pastikan tab login aktif
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

    }

    // Panggil fungsi inisialisasi
    initializePage();


}); // Akhir DOMContentLoaded