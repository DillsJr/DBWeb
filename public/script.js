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
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginFormDiv.classList.remove('hidden');
        registerFormDiv.classList.add('hidden');
        // Optional: sembunyikan notifikasi saat ganti tab
        const notificationElement = document.getElementById('custom-notification');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegister() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerFormDiv.classList.remove('hidden');
        loginFormDiv.classList.add('hidden');
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
        // Memberi sedikit delay agar transisi berjalan
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);


        // Atur timeout untuk menyembunyikan notifikasi
        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show'); // Mulai transisi sembunyi
            // Setelah transisi selesai, set display none
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                    notificationElement.removeEventListener('transitionend', handler); // Hapus listener
                }
            });
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
        }
    }

    // Pasang lihat password untuk form login (pada saat halaman dimuat)
    setupPasswordToggle('showLoginPassword', 'loginPassword');

    // Pasang lihat password untuk form daftar (pada saat halaman dimuat)
    setupPasswordToggle('showPassword', 'password');
    setupPasswordToggle('showConfirmPassword', 'confirmPassword');


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD ---
    const forgotPasswordLink = document.querySelector('.forgot-password'); // Link "Lupa Password?"
    // Simpan HTML form login awal untuk kembali nanti
    const originalLoginFormHTML = loginFormDiv ? loginFormDiv.innerHTML : '';
    let forgotPasswordWhatsappNumber = ''; // Variabel untuk menyimpan nomor WhatsApp saat lupa password

    // Fungsi untuk memasang kembali event listener form login setelah konten diubah
    // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
    function attachLoginFormListeners() {
        // Dapatkan kembali elemen form login yang baru ditambahkan ke DOM
        const loginForm = document.getElementById('login');
        const showLoginPasswordCheckbox = document.getElementById('showLoginPassword');
        const forgotPasswordLink = document.querySelector('.forgot-password'); // Dapatkan kembali link lupa password

        if (loginForm) {
            // Pasang kembali event listener submit untuk form login
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const whatsapp = document.getElementById('loginWhatsapp').value;
                const password = document.getElementById('loginPassword').value;

                showNotification('Memproses login...', 'info'); // Tampilkan pesan loading

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
                        showNotification(data.message || 'Login berhasil!', 'success');
                        console.log("Data dari server setelah login:", data);

                        // Pastikan Anda menyimpan data yang benar di localStorage
                        if (data.user && data.user.username) {
                            localStorage.setItem('loggedInUsername', data.user.username); // Simpan username jika ada
                        } else if (data.user && data.user.fullName) { // Coba simpan full name jika ada username kosong
                            localStorage.setItem('loggedInUsername', data.user.fullName); // Bisa juga simpan sebagai loggedInFullName
                        } else if (data.user && data.user.whatsapp) { // Fallback simpan whatsapp jika keduanya tidak ada
                            localStorage.setItem('loggedInUsername', data.user.whatsapp); // Atau gunakan kunci loggedInWhatsapp
                        } else {
                            // Jika data.user kosong atau tidak punya identifier, mungkin ada masalah di API login
                            console.error("API login tidak mengembalikan identifier pengguna.");
                            // Tetap redirect atau beri pesan error? Tergantung alur aplikasi
                        }

                        // Redirect ke homepage
                        setTimeout(() => {
                            window.location.href = '/homepage.html'; // Pastikan path ini benar
                        }, 1500);

                    }

                    // Perbaiki kondisi pengecekan respon
                    if (response.ok) { // Cek status code 200-299
                        showNotification(data.message || 'Login berhasil!', 'success');
                        console.log("Data dari server setelah login:", data);
                        // Simpan username/data pengguna di local storage atau session storage
                        if (data.user && data.user.username) {
                            localStorage.setItem('loggedInUsername', data.user.username); // Sesuaikan jika API kembalikan field lain
                        } else if (data.user && data.user.whatsapp) {
                            localStorage.setItem('loggedInWhatsapp', data.user.whatsapp);
                        }
                        // Redirect ke homepage setelah notifikasi muncul sebentar
                        setTimeout(() => {
                            window.location.href = '/homepage.html'; // Pastikan homepage.html ada di public/
                        }, 1500); // Delay 1.5 detik

                    } else { // Status code 400-599
                        // Perbaiki penanganan pesan error dari backend
                        let errorMessage = 'Login gagal.';
                        if (data && data.message) {
                            errorMessage += ' ' + data.message;
                        } else {
                            errorMessage += ' Mohon coba lagi.';
                        }
                        showNotification(errorMessage, 'error');
                        console.error('Login failed:', response.status, data);
                    }
                } catch (error) {
                    console.error('Error saat memanggil API login:', error);
                    showNotification('Terjadi kesalahan saat login', 'error');
                }
            });

            // Pasang kembali event listener lihat password untuk form login
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        }

        // Pasang kembali event listener link "Lupa Password?"
        if (forgotPasswordLink) {
            // Pastikan tidak memasang listener ganda jika attachLoginFormListeners dipanggil lebih dari sekali
            forgotPasswordLink.removeEventListener('click', handleForgotPasswordClick); // Hapus listener lama jika ada
            forgotPasswordLink.addEventListener('click', handleForgotPasswordClick); // Pasang listener baru
        }
    }

    // Fungsi handler terpisah untuk klik lupa password
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault();

        // Simpan HTML form login awal sebelum diganti
        if (!originalLoginFormHTML && loginFormDiv) {
            originalLoginFormHTML = loginFormDiv.innerHTML;
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

                    if (response.ok) { // Status kode 200-299
                        showNotification(data.message || 'Kode reset berhasil dikirim.', 'success');
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
                                    <div class="checkbox-group"> // Tambahkan checkbox untuk Password Baru
                                        <input type="checkbox" id="showNewPassword">
                                        <label for="showNewPassword" style="color: #888; font-style: italic;"> Lihat Password </label>
                                    </div>
                                    <div class="input-group">
                                        <label for="confirmNewPassword" style="color: #121629;"> Konfirmasi Password Baru </label>
                                        <input type="password" id="confirmNewPassword" placeholder="Masukan Konfirmasi Password Baru" required autocomplete="new-password">
                                    </div>
                                    <div class="checkbox-group"> // Tambahkan checkbox untuk Konfirmasi Password Baru
                                        <input type="checkbox" id="showConfirmNewPassword">
                                        <label for="showConfirmPassword" style="color: #888; font-style: italic;"> Lihat Konfirmasi Password </label>
                                    </div>
                                    <button type="submit" style="width: 100%; padding: 10px; background-color: #eebbc3; color: #121629; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 10px;"> Reset Password </button>
                                     <p class="switch-form" style="text-align: center; color: #121629; margin-top: 20px; font-size: 14px;"> Ingat password? <a href="#" id="switchToLoginFromReset" style="color: #eebbc3; text-decoration: none; font-weight: bold;"> Masuk Sekarang </a></p> </form>
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
                                    attachLoginFormListeners(); // Pasang kembali listener form login
                                });
                            }

                        } else {
                            console.error("Element loginFormDiv not found.");
                        }

                    } else { // Status kode 400-599
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
                e.preventDefault();
                // Nomor WhatsApp diambil dari variabel forgotPasswordWhatsappNumber
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

                    if (response.ok) { // Status kode 200-299
                        showNotification(data.message || 'Password berhasil direset!', 'success');
                        // Kembali ke form login setelah notifikasi muncul sebentar
                        setTimeout(() => {
                            if (loginFormDiv) loginFormDiv.innerHTML = originalLoginFormHTML; // Kembali ke form login
                            attachLoginFormListeners(); // Pasang kembali listener form login
                        }, 1500); // Delay 1.5 detik
                    } else { // Status kode 400-599
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

            // Catatan: Link "Masuk Sekarang" di form reset dipasang saat form dibuat,
            // jadi tidak perlu dipasang ulang di sini jika sudah dipasang di HTML string.
        }
    }


    // --- INITIAL SETUP ---
    // Pasang listener submit untuk form login & daftar saat halaman pertama dimuat
    const initialLoginForm = document.getElementById('login');
    const initialRegisterForm = document.getElementById('register');

    if (initialLoginForm) {
        initialLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const whatsapp = document.getElementById('loginWhatsapp').value;
            const password = document.getElementById('loginPassword').value;

            showNotification('Memproses login...', 'info'); // Tampilkan pesan loading

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

                if (response.ok) { // Cek status code 200-299
                    showNotification(data.message || 'Login berhasil!', 'success');
                    console.log("Data dari server setelah login:", data);
                    if (data.user && data.user.username) {
                        localStorage.setItem('loggedInUsername', data.user.username);
                    } else if (data.user && data.user.whatsapp) {
                        localStorage.setItem('loggedInWhatsapp', data.user.whatsapp);
                    }
                    setTimeout(() => {
                        window.location.href = '/homepage.html'; // Pastikan homepage.html ada di public/
                    }, 1500); // Delay 1.5 detik

                } else { // Status code 400-500an
                    let errorMessage = 'Login gagal.';
                    if (data && data.message) {
                        errorMessage += ' ' + data.message;
                    } else {
                        errorMessage += ' Mohon coba lagi.';
                    }
                    showNotification(errorMessage, 'error');
                    console.error('Login failed:', response.status, data);
                }
            } catch (error) {
                console.error('Error saat memanggil API login:', error);
                showNotification('Terjadi kesalahan saat login', 'error');
            }
        });
    }


    if (initialRegisterForm) {
        initialRegisterForm.addEventListener('submit', async (e) => {
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
            // Tambahkan validasi minimal panjang password
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

                if (response.ok) { // Status kode 200-299
                    showNotification(data.message || 'Pendaftaran berhasil!', 'success');
                    // Beralih ke form login setelah notifikasi muncul sebentar
                    setTimeout(() => {
                        showLogin(); // Beralih ke tab/form login
                        // Opsional: kosongkan form pendaftaran
                        registerForm.reset();
                    }, 1500); // Delay 1.5 detik
                } else { // Status kode 400-500an
                    let errorMessage = 'Pendaftaran gagal.';
                    // Tangani penanganan khusus jika nomor WhatsApp atau email sudah terdaftar dari pesan backend
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
        });
    }


    // Pasang event listener untuk link "Lupa Password?" saat halaman dimuat
    if (forgotPasswordLink) {
        // Gunakan handler terpisah
        forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
    }


    // Pastikan form login awal ditampilkan saat halaman pertama kali dimuat
    showLogin(); // Panggil ini untuk memastikan tab login aktif saat dimuat


}); // Akhir DOMContentLoaded