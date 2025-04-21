document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormElement = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    function showLogin() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginFormElement.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }

    function showRegister() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginFormElement.classList.add('hidden');
    }

    // Pasang event listener untuk tab dan link switch form
    loginTab.addEventListener('click', showLogin);
    registerTab.addEventListener('click', showRegister);
    switchToRegister.addEventListener('click', showRegister);
    switchToLogin.addEventListener('click', showLogin);

    // --- Fungsi Notifikasi Kustom ---
    const notificationElement = document.getElementById('custom-notification');
    let notificationTimeout;

    function showNotification(message, type = 'info', duration = 3000) {
        // Bersihkan timeout sebelumnya jika ada
        clearTimeout(notificationTimeout);

        // Reset kelas notifikasi
        notificationElement.className = 'custom-notification';

        // Tambahkan kelas tipe notifikasi (success, error, atau default info)
        notificationElement.textContent = message;
        notificationElement.classList.add(type);
        notificationElement.classList.add('show'); // Tampilkan notifikasi

        // Atur timeout untuk menyembunyikan notifikasi
        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show'); // Sembunyikan notifikasi
        }, duration);
    }
    // --- Akhir Fungsi Notifikasi Kustom ---


    // Fitur lihat password untuk form login
    const loginPasswordInput = document.getElementById('loginPassword');
    const showLoginPasswordCheckbox = document.getElementById('showLoginPassword');

    if (showLoginPasswordCheckbox) {
        showLoginPasswordCheckbox.addEventListener('change', function () {
            loginPasswordInput.type = this.checked ? 'text' : 'password';
        });
    }

    // Fitur lihat password untuk form daftar (password utama)
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('showPassword');

    if (showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener('change', function () {
            passwordInput.type = this.checked ? 'text' : 'password';
        });
    }

    // Fitur lihat password untuk form daftar (konfirmasi password)
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const showConfirmPasswordCheckbox = document.getElementById('showConfirmPassword');

    if (showConfirmPasswordCheckbox) {
        showConfirmPasswordCheckbox.addEventListener('change', function () {
            confirmPasswordInput.type = this.checked ? 'text' : 'password';
        });
    }

    // Login form submission
    document.getElementById('login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const whatsapp = document.getElementById('loginWhatsapp').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatsapp,
                    password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                showNotification('Login berhasil: ' + data.message, 'success');
                console.log("Data dari server setelah login:", data);
                // Simpan username di local storage saat login berhasil
                localStorage.setItem('loggedInUsername', data.username);
                // Redirect ke homepage setelah notifikasi muncul sebentar (opsional, sesuaikan delay)
                setTimeout(() => {
                    window.location.href = '/homepage.html';
                }, 1000); // Delay 1 detik sebelum redirect
            } else {
                showNotification('Login gagal: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat login', 'error');
        }
    });

    // Register form submission
    document.getElementById('register').addEventListener('submit', async (e) => {
        e.preventDefault();
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
                    password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                showNotification('Pendaftaran berhasil: ' + data.message, 'success');
                // Beralih ke form login setelah notifikasi muncul sebentar
                setTimeout(() => {
                    showLogin();
                }, 1000); // Delay 1 detik
            } else {
                let errorMessage = 'Pendaftaran gagal: ' + data.message;
                // Tambahkan penanganan khusus jika nomor WhatsApp atau email sudah terdaftar
                if (data.message && data.message.includes('sudah terdaftar')) {
                    errorMessage = data.message; // Gunakan pesan error dari server
                }
                showNotification(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat mendaftar', 'error');
        }
    });

    const forgotPasswordLink = document.querySelector('.forgot-password');
    const originalLoginFormHTML = loginFormElement.innerHTML; // Simpan HTML form login awal
    let forgotPasswordWhatsappNumber = ''; // Variabel untuk menyimpan nomor WhatsApp saat lupa password

    // Fungsi untuk memasang kembali event listener form login setelah konten diubah
    function attachLoginFormListeners() {
        const loginForm = document.getElementById('login');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const whatsapp = document.getElementById('loginWhatsapp').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    const response = await fetch('/api/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            whatsapp,
                            password
                        }),
                    });

                    const data = await response.json();
                    if (response.ok) {
                        showNotification('Login berhasil: ' + data.message, 'success');
                        console.log("Data dari server setelah login:", data);
                        localStorage.setItem('loggedInUsername', data.username);
                        setTimeout(() => {
                            window.location.href = '/homepage.html';
                        }, 1000);
                    } else {
                        showNotification('Login gagal: ' + data.message, 'error');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('Terjadi kesalahan saat login', 'error');
                }
            });
        }
    }

    // Fungsi untuk memasang event listener form reset password
    function attachResetPasswordFormListener() {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // Nomor WhatsApp diambil dari variabel forgotPasswordWhatsappNumber
                const whatsapp = forgotPasswordWhatsappNumber;
                const resetCode = document.getElementById('resetPasswordCode').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;

                if (newPassword !== confirmNewPassword) {
                    showNotification('Password baru dan konfirmasi password tidak cocok.', 'error');
                    return;
                }

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
                if (response.ok) {
                    showNotification('Password Anda berhasil direset. Silahkan login dengan password baru Anda.', 'success');
                    setTimeout(() => {
                        loginFormElement.innerHTML = originalLoginFormHTML; // Kembali ke form login
                        attachLoginFormListeners(); // Pasang kembali listener form login
                    }, 1000);
                } else {
                    showNotification('Gagal reset password: ' + data.message, 'error');
                }
            });
        }
    }


    // Event listener untuk link "Lupa Password?"
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Ganti konten form login dengan form lupa password
            loginFormElement.innerHTML = `
                <h2> Lupa Password </h2>
                <p style="color: #b8c1ec;"> Masukkan nomor WhatsApp Anda untuk memulai proses reset password. </p>
                <form id="forgotPasswordForm">
                    <div class="input-group">
                        <label for="forgotPasswordWhatsapp" style="color: #121629;"> Nomor Whatsapp </label>
                        <input type="tel" id="forgotPasswordWhatsapp" placeholder="Masukan Nomor Whatsapp" required autocomplete="tel">
                    </div>
                    <button type="submit" style="width: 100%; padding: 10px; background-color: #eebbc3; color: #121629; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px;"> Kirim Kode Reset </button>
                    <p class="switch-form" style="text-align: center; color: #121629; margin-top: 20px; font-size: 14px;"> Ingat password? <a href="#" id="switchToLoginFromForgot" style="color: #eebbc3; text-decoration: none; font-weight: bold;"> Masuk Sekarang </a></p>
                </form>
            `;

            // Pasang event listener untuk link "Masuk Sekarang" di form lupa password
            const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
            if (switchToLoginFromForgot) {
                switchToLoginFromForgot.addEventListener('click', (e) => {
                    e.preventDefault();
                    loginFormElement.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                    attachLoginFormListeners(); // Pasang kembali listener form login
                });
            }

            // Pasang event listener untuk submit form lupa password
            const forgotPasswordForm = document.getElementById('forgotPasswordForm');
            if (forgotPasswordForm) {
                forgotPasswordForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const whatsapp = document.getElementById('forgotPasswordWhatsapp').value;
                    forgotPasswordWhatsappNumber = whatsapp; // Simpan nomor WhatsApp
                    const response = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            whatsapp
                        }),
                    });

                    const data = await response.json();
                    if (response.ok) {
                        showNotification('Kode reset telah dikirim ke WhatsApp Anda.', 'success');
                        // Ganti konten form dengan form reset password
                        loginFormElement.innerHTML = `
                            <h2> Reset Password </h2>
                            <p style="color: #272343;"> Masukkan kode reset yang telah dikirimkan dan password baru Anda. </p>
                            <form id="resetPasswordForm">
                                <div class="input-group">
                                    <label for="resetPasswordCode" style="color: #121629;"> Kode Reset </label>
                                    <input type="text" id="resetPasswordCode" placeholder="Masukan Kode Reset" required>
                                </div>
                                <div class="input-group">
                                    <label for="newPassword" style="color: #121629;"> Password Baru </label>
                                    <input type="password" id="newPassword" placeholder="Masukan Password Baru" required autocomplete="new-password">
                                </div>
                                <div class="input-group">
                                    <label for="confirmNewPassword" style="color: #121629;"> Konfirmasi Password Baru </label>
                                    <input type="password" id="confirmNewPassword" placeholder="Masukan Konfirmasi Password Baru" required autocomplete="new-password">
                                </div>
                                <button type="submit" style="width: 100%; padding: 10px; background-color: #eebbc3; color: #121629; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px;"> Reset Password </button>
                            </form>
                        `;
                        attachResetPasswordFormListener(); // Pasang event listener untuk form reset password
                    } else {
                        showNotification('Gagal mengirim kode reset: ' + data.message, 'error');
                    }
                });
            }
        });
    }
});