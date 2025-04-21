// public/script.js 

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
        // Atur kelas 'active' pada tab
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Tambahkan class 'hidden' ke form Daftar (menyembunyikan)
        if (registerFormDiv) registerFormDiv.classList.add('hidden');
        // Hapus class 'hidden' dari form Login (menampilkan)
        if (loginFormDiv) loginFormDiv.classList.remove('hidden');

        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegister() {
        // Atur kelas 'active' pada tab
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        // Tambahkan class 'hidden' ke form Login (menyembunyikan)
        if (loginFormDiv) loginFormDiv.classList.add('hidden');
        // Hapus class 'hidden' dari form Daftar (menampilkan)
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

    // Pasang lihat password untuk form login
    setupPasswordToggle('showLoginPassword', 'loginPassword');
    // Pasang lihat password untuk form daftar
    setupPasswordToggle('showPassword', 'password');
    setupPasswordToggle('showConfirmPassword', 'confirmPassword');


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD ---
    // Simpan HTML form login awal untuk kembali nanti
    const originalLoginFormHTML = loginFormDiv ? loginFormDiv.innerHTML : '';
    // Variabel untuk menyimpan nomor WhatsApp saat lupa password
    let forgotPasswordWhatsappNumber = '';

    // Fungsi handler terpisah untuk SUBMIT form login
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit form bawaan browser
        console.log('preventDefault executed for login form. Attempting fetch...'); // Log untuk debugging

        const whatsapp = document.getElementById('loginWhatsapp').value;
        const password = document.getElementById('loginPassword').value;

        // Validasi dasar di frontend
        if (!whatsapp || !password) {
            showNotification('Nomor Whatsapp dan password harus diisi.', 'error');
            return;
        }

        showNotification('Memproses login...', 'info'); // Tampilkan pesan loading

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

            if (response.ok) { // Cek status code 200-299 (Login Berhasil)
                showNotification(data.message || 'Login berhasil!', 'success');
                console.log("Data dari server setelah login:", data);

                // --- Simpan Status Login dan Identifier Pengguna untuk Homepage ---
                let userIdentifierToSave = '';
                // Tentukan identifier terbaik yang dikembalikan API login
                if (data.user && data.user.username) {
                    userIdentifierToSave = data.user.username;
                } else if (data.user && data.user.fullName) {
                    userIdentifierToSave = data.user.fullName;
                } else if (data.user && data.user.whatsapp) {
                    userIdentifierToSave = data.user.whatsapp;
                }

                // Setel kunci di localStorage yang akan dibaca homepage.js
                if (userIdentifierToSave) {
                    localStorage.setItem('loggedInUserIdentifier', userIdentifierToSave); // Kunci utama konsisten
                    localStorage.setItem('isLoggedIn', 'true'); // Set flag status login
                    // Opsional: Bersihkan kunci lama jika pernah pakai
                    localStorage.removeItem('loggedInUsername');
                    localStorage.removeItem('loggedInWhatsapp');
                } else {
                    console.warn("Login berhasil tapi API tidak mengembalikan identifier pengguna. Status login diset.");
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.removeItem('loggedInUserIdentifier'); // Pastikan kunci kosong jika tidak ada identifier
                }
                // --- Akhir Simpan Status Login ---


                // Redirect ke homepage setelah notifikasi muncul sebentar
                setTimeout(() => {
                    // Menggunakan window.location.href untuk navigasi KE halaman lain OK.
                    window.location.href = '/homepage.html'; // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
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
        } finally {
            // Hapus penambahan class submitting jika tidak pakai animasi submit
            // if (container) container.classList.remove('submitting');
        }
    }; // Akhir handleLoginSubmit


    // Fungsi handler terpisah untuk SUBMIT form daftar
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit form bawaan browser
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
        } finally {
            // Hapus penambahan class submitting jika tidak pakai animasi submit
            // if (container) container.classList.remove('submitting');
        }
    }; // Akhir handleRegisterSubmit


    // Fungsi handler terpisah untuk klik link "Lupa Password?"
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault(); // Mencegah navigasi link bawaan

        // originalLoginFormHTML sudah diambil saat DOMContentLoaded

        // Ganti konten form login dengan form lupa password menggunakan innerHTML
        // Tidak ada animasi fade/slide saat menggunakan innerHTML
        if (loginFormDiv) {
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

        // Pasang event listener untuk link "Masuk Sekarang" di form lupa password (setelah HTML diganti)
        const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
        if (switchToLoginFromForgot) {
            switchToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginFormDiv) {
                    loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                    attachLoginFormListeners(); // Pasang kembali listener form login (submit dan link forgot password)
                }
            });
        }

        // Pasang event listener untuk submit form lupa password (setelah HTML diganti)
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Mencegah submit form bawaan

                const whatsapp = document.getElementById('forgotPasswordWhatsapp').value;

                if (!whatsapp) {
                    showNotification('Nomor Whatsapp harus diisi.', 'error');
                    return;
                }
                forgotPasswordWhatsappNumber = whatsapp; // Simpan nomor WhatsApp untuk langkah reset

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

                    if (response.ok) { // Status kode 200-299 (Permintaan Kode Berhasil)
                        showNotification(data.message || 'Jika nomor terdaftar, instruksi reset akan dikirim.', 'success', 5000); // Tampilkan lebih lama

                        // Ganti konten form dengan form reset password setelah sukses (menggunakan innerHTML)
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
                                    if (loginFormDiv) {
                                        loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login awal
                                        attachLoginFormListeners(); // Pasang kembali listener form login
                                    }
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
                } finally {
                    // Hapus penambahan class submitting
                    // if (container) container.classList.remove('submitting');
                }
            });
        }
    }; // Akhir handleForgotPasswordClick


    // Fungsi untuk memasang event listener form reset password
    // Dipanggil setelah form reset password ditambahkan ke DOM via innerHTML
    function attachResetPasswordFormListener() {
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Mencegah submit form bawaan

                // Nomor WhatsApp diambil dari variabel forgotPasswordWhatsappNumber
                const whatsapp = forgotPasswordWhatsappNumber;
                const resetCode = document.getElementById('resetPasswordCode').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;

                // Validasi frontend
                if (!whatsapp) {
                    showNotification('Nomor WhatsApp tidak ditemukan.', 'error');
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

                    if (response.ok) { // Status kode 200-299 (Reset Berhasil)
                        showNotification(data.message || 'Password berhasil direset! Silakan Login.', 'success');
                        // Kembali ke form login setelah notifikasi muncul sebentar
                        setTimeout(() => {
                            if (loginFormDiv) {
                                loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login
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
                } finally {
                    // Hapus penambahan class submitting
                    // if (container) container.classList.remove('submitting');
                }
            });

            // Pasang listener lihat password untuk input di form reset (setelah HTML diganti)
            setupPasswordToggle('showNewPassword', 'newPassword');
            setupPasswordToggle('showConfirmNewPassword', 'confirmPassword');

            // Link "Masuk Sekarang" di form reset sudah punya listener yang dipasang saat HTML dibuat.
        } else {
            console.error("Reset password form not found after innerHTML replacement.");
        }
    }


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
    // dan saat halaman pertama kali dimuat
    function attachLoginFormListeners() {
        // Dapatkan kembali elemen form login yang baru ditambahkan ke DOM (setelah innerHTML)
        const loginForm = document.getElementById('login');
        const forgotPasswordLinkInForm = document.querySelector('.forgot-password'); // Dapatkan kembali link lupa password

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
        if (forgotPasswordLinkInForm) {
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick); // Pasang listener link lupa password
        } else {
            console.warn("Forgot password link not found in attachLoginFormListeners.");
        }
    }


    // Fungsi handler terpisah untuk SUBMIT form daftar (Dipasang saat initial load)
    // Dapatkan elemen form daftar awal saat DOMContentLoaded
    const initialRegisterForm = document.getElementById('register');
    if (initialRegisterForm) {
        // Pasang event listener submit untuk form daftar HANYA SATU KALI DI SINI
        // Menggunakan fungsi handler terpisah.
        initialRegisterForm.addEventListener('submit', handleRegisterSubmit); // Gunakan handler terpisah
    } else {
        console.warn("Register form with ID 'register' not found on initial load.");
    }


    // --- INITIAL SETUP saat DOMContentLoaded ---
    // Fungsi ini dijalankan saat DOMContentLoaded
    function initializePage() {
        // Pasang listener submit form login awal dan link lupa password di dalamnya
        // Panggil ini di sini untuk memasang listener saat halaman pertama dimuat
        attachLoginFormListeners(); // Ini akan memasang handleLoginSubmit ke form#login awal

        // --- PENTING: Atur keadaan awal saat halaman dimuat ---
        // Sembunyikan form register dan tampilkan form login menggunakan class 'hidden'
        if (registerFormDiv) {
            registerFormDiv.classList.add('hidden');
            // Pastikan display: none; diatur oleh class hidden
            // registerFormDiv.style.display = 'none'; // Tidak perlu inline style jika CSS .hidden {display:none}
        }
        if (loginFormDiv) {
            // Pastikan class hidden dihapus dari form login
            loginFormDiv.classList.remove('hidden');
            // Pastikan display: block; diatur oleh CSS secara default atau .form:not(.hidden)
            // loginFormDiv.style.display = 'block'; // Tidak perlu inline style jika CSS menangani
        }
        // --- Akhir pengaturan keadaan awal ---


        // Pastikan tab login aktif secara visual
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Catatan:showLogin() tidak perlu dipanggil di sini karena pengaturan display/hidden
        // dan kelas 'active' pada tab sudah diatur di atas.
    }

    // Panggil fungsi inisialisasi saat DOM selesai dimuat
    initializePage();


}); // Akhir DOMContentLoaded