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
            // Ini penting agar animasi berjalan lancar
            const handler = () => {
                if (!notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                    notificationElement.removeEventListener('transitionend', handler); // Hapus listener ini setelah selesai
                }
            };
            // Tambahkan event listener untuk event transitionend pada properti opacity
            notificationElement.addEventListener('transitionend', handler, {
                once: true
            }); // { once: true } akan menghapus listener otomatis
            // Fallback jika transisi tidak terdeteksi (jarang terjadi, tapi baik untuk jaga-jaga)
            setTimeout(() => {
                if (notificationElement.classList.contains('show')) { // Jika masih visible setelah timeout fallback
                    notificationElement.classList.remove('show'); // Paksa sembunyi
                }
                // Jika elemen masih display: block setelah waktu transisi + delay, sembunyikan
                if (notificationElement.style.display !== 'none' && !notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
            }, duration + 300); // Delay sedikit lebih lama dari durasi transisi (misal transisi 0.3s)


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
            // (Opsional, mungkin tidak relevan saat form dibuat dinamis, tapi tidak ada salahnya)
            // passwordInput.type = checkbox.checked ? 'text' : 'password';

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
    const forgotPasswordLink = document.querySelector('.forgot-password'); // Link "Lupa Password?"
    // Simpan HTML form login awal untuk kembali nanti
    const originalLoginFormHTML = loginFormDiv ? loginFormDiv.innerHTML : '';
    let forgotPasswordWhatsappNumber = ''; // Variabel untuk menyimpan nomor WhatsApp saat lupa password

    // Fungsi untuk memasang kembali event listener form login setelah konten diubah
    // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
    function attachLoginFormListeners() {
        // Dapatkan kembali elemen form login yang baru ditambahkan ke DOM
        const loginForm = document.getElementById('login');
        // const showLoginPasswordCheckbox = document.getElementById('showLoginPassword'); // Element ini dihandle oleh setupPasswordToggle
        const forgotPasswordLinkInForm = document.querySelector('.forgot-password'); // Dapatkan kembali link lupa password di dalam form

        if (loginForm) {
            // PASANG KEMBALI event listener submit untuk form login HANYA SATU KALI DI SINI
            // Menggunakan fungsi handler terpisah
            loginForm.addEventListener('submit', handleLoginSubmit); // <-- Pastikan ini dipasang di sini


            // Pasang kembali event listener lihat password untuk form login
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        }

        // Pasang kembali event listener link "Lupa Password?" di dalam form
        if (forgotPasswordLinkInForm) {
            // Pasang listener hanya jika belum ada, atau hapus yang lama dulu jika attachLoginFormListeners dipanggil ganda
            // Karena kita akan panggil attachLoginFormListeners setelah innerHTML diganti,
            // elemen link lupa password baru yang dibuat oleh innerHTML belum punya listener, jadi langsung pasang
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick); // Menggunakan fungsi handler terpisah
        }
    }

    // Fungsi handler terpisah untuk SUBMIT form login
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // <-- Pastikan ini ada dan tereksekusi
        console.log('preventDefault executed. Attempting login via fetch.'); // Tambahkan log ini untuk verifikasi

        const whatsapp = document.getElementById('loginWhatsapp').value;
        const password = document.getElementById('loginPassword').value;

        // Validasi dasar di frontend (seperti yang sudah ada)
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

            if (response.ok) { // Cek status code 200-299
                showNotification(data.message || 'Login berhasil!', 'success');
                console.log("Data dari server setelah login:", data);

                // Simpan identifier pengguna di localStorage (sesuaikan dengan field yang dikembalikan API login)
                let userIdentifier = '';
                if (data.user && data.user.username) {
                    userIdentifier = data.user.username; // Coba username
                } else if (data.user && data.user.fullName) {
                    userIdentifier = data.user.fullName; // Coba full name
                } else if (data.user && data.user.whatsapp) {
                    userIdentifier = data.user.whatsapp; // Fallback whatsapp
                }

                if (userIdentifier) {
                    localStorage.setItem('loggedInUserIdentifier', userIdentifier); // Simpan dengan satu kunci konsisten
                    localStorage.setItem('isLoggedIn', 'true'); // Simpan status login
                } else {
                    console.warn("API login berhasil tapi tidak mengembalikan identifier pengguna.");
                    // Anda bisa memilih untuk tetap mengalihkan atau beri pesan error
                    localStorage.removeItem('loggedInUserIdentifier'); // Pastikan kunci dihapus jika tidak ada identifier
                    localStorage.removeItem('isLoggedIn');
                }


                // Redirect ke homepage setelah notifikasi muncul sebentar
                setTimeout(() => {
                    window.location.href = '/homepage.html'; // Pastikan path ini benar
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
                // Opsional: reset form password jika login gagal
                const loginPasswordInput = document.getElementById('loginPassword');
                if (loginPasswordInput) loginPasswordInput.value = '';
            }
        } catch (error) {
            console.error('Error saat memanggil API login:', error);
            showNotification('Terjadi kesalahan saat login', 'error');
        }
    }; // Akhir handleLoginSubmit


    // Fungsi handler terpisah untuk klik link "Lupa Password?"
    const handleForgotPasswordClick = async (e) => {
        e.preventDefault(); // <-- Pastikan ini ada dan tereksekusi

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
                e.preventDefault(); // <-- Pastikan ini ada dan tereksekusi

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
                e.preventDefault(); // <-- Pastikan ini ada dan tereksekusi

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

            // Catatan: Link "Masuk Sekarang" di form reset dipasang saat form dibuat di HTML string,
            // dan event listener untuk link tersebut dipasang saat form reset dibuat.
            // attachLoginFormListeners dipanggil saat kembali ke form login.
        }
    }


    // --- INITIAL SETUP ---
    // Fungsi ini dijalankan saat DOMContentLoaded
    function initializePage() {
        // Pasang listener submit untuk form daftar saat halaman pertama dimuat
        const initialRegisterForm = document.getElementById('register');
        if (initialRegisterForm) {
            initialRegisterForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // <-- Pastikan ini ada dan tereksekusi
                console.log('preventDefault executed. Attempting registration via fetch.'); // Tambahkan log ini

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
                            if (initialRegisterForm) initialRegisterForm.reset();
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

        // Pasang listener submit form login awal dan link lupa password di dalamnya
        // Panggil ini di sini untuk memasang listener saat halaman pertama dimuat
        attachLoginFormListeners();

        // Pastikan form login awal ditampilkan saat halaman pertama kali dimuat
        showLogin();
    }

    // Panggil fungsi inisialisasi saat DOM selesai dimuat
    initializePage();


}); // Akhir DOMContentLoaded