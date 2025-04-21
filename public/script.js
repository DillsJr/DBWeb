// public/script.js - Script untuk halaman login dan daftar (index.html) dengan animasi dan show/hide diperbaiki

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


    // --- Logika Ganti Tab (Dengan Animasi dan Penanganan Display yang Akurat) ---

    // Durasi transisi di CSS adalah 0.3s (300ms). Gunakan sedikit lebih lama untuk timeout display none.
    const transitionDuration = 300; // ms (sesuaikan dengan durasi transisi di style.css)
    const displayHideDelay = transitionDuration + 10; // Beri buffer 10ms setelah transisi


    function showLogin() {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        const formToHide = registerFormDiv; // Form yang disembunyikan saat pindah ke Login
        const formToShow = loginFormDiv; // Form yang ditampilkan saat pindah ke Login

        // Sembunyikan form yang akan disembunyikan (RegisterForm)
        if (formToHide && !formToHide.classList.contains('form-hidden-visual')) {
            formToHide.classList.add('form-hidden-visual'); // Mulai animasi keluar (fade out, slide/zoom out)
            // Setelah animasi selesai, atur display: none agar benar-benar hilang dari alur dokumen
            // Menggunakan setTimeout dengan delay sesuai durasi transisi + buffer
            setTimeout(() => {
                formToHide.style.display = 'none';
            }, displayHideDelay);
            // Opsional: fallback menggunakan transitionend jika lebih suka event-based
            // formToHide.addEventListener('transitionend', function handler() {
            //      if (formToHide.classList.contains('form-hidden-visual')) { // Pastikan masih dalam kondisi hidden
            //           formToHide.style.display = 'none';
            //           formToHide.removeEventListener('transitionend', handler); // Hapus listener setelah selesai
            //      }
            // }, { once: true }); // { once: true } otomatis menghapus listener setelah dipanggil sekali
        } else if (formToHide && formToHide.classList.contains('form-hidden-visual')) {
            // Jika form yang seharusnya disembunyikan ternyata sudah hidden visual, pastikan display-nya none
            formToHide.style.display = 'none';
        }


        // Tampilkan form Login
        if (formToShow) {
            // Set display: block SEBELUM menghapus class visual hidden
            // Ini penting agar browser menghitung layout dan animasi masuk bisa berjalan
            formToShow.style.display = 'block';
            // Beri sedikit waktu (misalnya 10ms) agar browser bisa menerapkan display: block,
            // lalu hapus class visual hidden untuk memulai animasi masuk
            setTimeout(() => {
                formToShow.classList.remove('form-hidden-visual'); // Mulai animasi masuk (fade in, slide/zoom in)
            }, 10); // Delay kecil, pastikan > 0
        }

        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegister() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        const formToHide = loginFormDiv; // Form yang disembunyikan saat pindah ke Daftar
        const formToShow = registerFormDiv; // Form yang ditampilkan saat pindah ke Daftar


        // Sembunyikan form Login (jika ada)
        if (formToHide && !formToHide.classList.contains('form-hidden-visual')) {
            formToHide.classList.add('form-hidden-visual'); // Mulai animasi keluar
            setTimeout(() => {
                formToHide.style.display = 'none';
            }, displayHideDelay);
            // Opsional: fallback transitionend
            // formToHide.addEventListener('transitionend', function handler() { ... });
        } else if (formToHide && formToHide.classList.contains('form-hidden-visual')) {
            // Jika form yang seharusnya disembunyikan ternyata sudah hidden visual, pastikan display-nya none
            formToHide.style.display = 'none';
        }


        // Tampilkan form Register
        if (formToShow) {
            formToShow.style.display = 'block';
            setTimeout(() => {
                formToShow.classList.remove('form-hidden-visual'); // Mulai animasi masuk
            }, 10); // Delay kecil
        }

        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


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
            // Gunakan setTimeout sebagai fallback jika transitionend tidak yakin bekerja di semua kondisi
            setTimeout(() => {
                if (notificationElement.style.display !== 'none' && !notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
            }, 300); // Sesuaikan delay dengan durasi transisi CSS jika ada
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

        if (container) container.classList.add('submitting');

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
            if (container) container.classList.remove('submitting');
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

        if (container) container.classList.add('submitting');

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
            if (container) container.classList.remove('submitting');
        }
    };


    // Fungsi handler terpisah untuk klik link "Lupa Password?"
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault();

        // originalLoginFormHTML sudah diambil saat DOMContentLoaded

        // Ganti konten form login dengan form lupa password
        if (loginFormDiv) {
            // Saat mengganti innerHTML, elemen baru tidak akan memiliki class visual hidden atau display none
            // Mereka akan langsung terlihat. Tidak ada animasi fade/slide saat ganti innerHTML.
            // Animasi hanya terjadi saat add/remove class visual hidden pada elemen yang sudah ada.
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
                if (container) container.classList.add('submitting');

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
                            // Saat mengganti ke form reset, juga tidak ada animasi fade/slide
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
                    if (container) container.classList.remove('submitting');
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
                if (container) container.classList.add('submitting');

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
                    if (container) container.classList.remove('submitting');
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
        // Sembunyikan form register dan tampilkan form login
        if (registerFormDiv) {
            registerFormDiv.classList.add('form-hidden-visual'); // Tambahkan class visual hidden
            registerFormDiv.style.display = 'none'; // KRITIS: Atur display: none segera
        }
        if (loginFormDiv) {
            loginFormDiv.classList.remove('form-hidden-visual'); // Pastikan form login TIDAK visual hidden
            loginFormDiv.style.display = 'block'; // Pastikan display: block
        }
        // --- Akhir pengaturan keadaan awal ---

        // Pastikan tab login aktif
        // showLogin(); // Tidak perlu panggil ini lagi di sini karena pengaturan display/hidden sudah di atas
        // Pemanggilan ini sebelumnya bisa menyebabkan flicker atau tumpang tindih logika.
        // Cukup pastikan tab 'Masuk' punya class 'active' secara default di HTML atau atur di sini jika perlu.
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

    }

    // Panggil fungsi inisialisasi
    initializePage();


}); // Akhir DOMContentLoaded