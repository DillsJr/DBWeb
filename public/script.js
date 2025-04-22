// public/script.js - Script untuk halaman login/daftar (Simulasi localStorage dan API Calls)

document.addEventListener('DOMContentLoaded', async () => { // Menjadikan async untuk cek sesi awal

    // --- Logika Cek Status Login Awal saat DOMContentLoaded (Simulasi localStorage) ---
    // Ini adalah simulasi persistensi login sebelum integrasi Supabase Auth
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loggedInUserIdentifier = localStorage.getItem('loggedInUserIdentifier'); // Identifier yang disimpan saat login (simulasi)

    if (isLoggedIn === 'true' && loggedInUserIdentifier) {
        // Jika status login true dan identifier ada di localStorage, arahkan ke homepage
        console.log("Status login di localStorage ditemukan, redirect ke homepage.html (Simulasi)");
        // Menggunakan window.location.replace agar tidak bisa kembali pakai tombol back
        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
        return; // Hentikan eksekusi script jika sudah login
    }
    // --- Akhir Logika Cek Status Login Awal ---


    // --- Jika Belum Login, Lanjutkan Inisialisasi Halaman Login/Daftar ---

    // --- Mendapatkan elemen-elemen HTML utama (Disuaikan dengan HTML Anda) ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    // Menggunakan ID kontainer form utama sesuai dengan HTML Anda (#loginForm, #registerForm)
    const loginFormContainer = document.getElementById('loginForm'); // Kontainer untuk form login/forgot/reset
    const registerFormContainer = document.getElementById('registerForm'); // Kontainer untuk form daftar

    // Dapatkan elemen form spesifik di dalam kontainer (ID pada tag <form>)
    const loginFormElement = document.getElementById('login'); // Form login spesifik
    // DEKLARASI registerFormElement DI SINI (di luar fungsi manapun)
    const registerFormElement = document.getElementById('register'); // Form daftar spesifik


    // Dapatkan elemen container utama (masih diperlukan untuk notifikasi)
    const container = document.querySelector('.container');


    // --- Fungsi Notifikasi Kustom ---
    const notificationElement = document.getElementById('custom-notification');
    // let notificationTimeout; // Variabel ini tidak lagi dibutuhkan karena menggunakan timeoutId di elemen langsung

    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        // Clear any existing timeout
        if (notificationElement.timeoutId) {
            clearTimeout(notificationElement.timeoutId);
        }

        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type;
        notificationElement.classList.add('show');

        // Atur timeout untuk menyembunyikan
        notificationElement.timeoutId = setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) { // Pastikan class 'show' sudah dihapus
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                }
                notificationElement.removeEventListener('transitionend', handler);
            });
        }, duration);
    }


    // --- Logika Ganti Tab (Show/Hide Kontainer Form Utama Menggunakan Class 'hidden') ---
    // Menggunakan ID kontainer div utama sesuai dengan HTML Anda (#loginForm, #registerForm)
    function showLoginTab() {
        // Atur kelas 'active' pada tab
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Tambahkan class 'hidden' ke kontainer form Daftar (menyembunyikan)
        if (registerFormContainer) registerFormContainer.classList.add('hidden');
        // Hapus class 'hidden' dari kontainer form Login (menampilkan)
        if (loginFormContainer) loginFormContainer.classList.remove('hidden');

        // Setelah beralih ke tab login, pastikan form login spesifik terlihat
        // Kita berasumsi form login awal memiliki ID 'login'
        if (loginFormElement) loginFormElement.classList.remove('hidden');
        // Sembunyikan form forgot/reset jika ada di dalam kontainer login
        const forgotForm = document.getElementById('forgotPasswordForm'); // Ini adalah div form-content, bukan form tag
        const resetForm = document.getElementById('resetPasswordForm'); // Ini adalah div form-content, bukan form tag
        if (forgotForm) forgotForm.classList.add('hidden');
        if (resetForm) resetForm.classList.add('hidden');


        // Optional: sembunyikan notifikasi saat ganti tab
        showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegisterTab() {
        // Atur kelas 'active' pada tab
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        // Tambahkan class 'hidden' ke kontainer form Login (menyembunyikan)
        if (loginFormContainer) loginFormContainer.classList.add('hidden');
        // Hapus class 'hidden' dari kontainer form Daftar (menampilkan)
        if (registerFormContainer) registerFormContainer.classList.remove('hidden');

        // Setelah beralih ke tab register, pastikan form register spesifik terlihat
        // Kita berasumsi form register awal memiliki ID 'register'
        if (registerFormElement) registerFormElement.classList.remove('hidden');


        // Optional: sembunyikan notifikasi saat ganti tab
        showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


    // --- Fungsi untuk Mengganti Tampilan Konten Form di Dalam loginFormContainer (#loginForm) ---
    // Digunakan untuk berpindah antara form login, lupa password, dan reset password di dalam #loginForm
    // Elemen form spesifik di sini akan memiliki class="form-content"
    // Catatan: Karena form login dan daftar awal sudah punya ID dan class .form-content di HTML
    // Dan alur lupa/reset mengganti innerHTML kontainer #loginForm
    // Fungsi ini mungkin tidak diperlukan lagi untuk form login/register awal,
    // Tetapi masih relevan untuk menargetkan form lupa/reset setelah innerHTML diganti.
    // Mari kita pertahankan untuk konsistensi dengan alur lupa/reset.
    function showFormContent(formToShowId) {
        if (!loginFormContainer) { // Menggunakan ID kontainer utama #loginForm
            console.error("Login form container not found.");
            return;
        }
        // Dapatkan semua div/form dengan class="form-content" di dalam loginFormContainer
        const formContents = loginFormContainer.querySelectorAll('.form-content');
        formContents.forEach(formContent => {
            formContent.classList.add('hidden'); // Sembunyikan semua form konten spesifik
        });

        // Dapatkan elemen form konten spesifik yang ingin ditampilkan berdasarkan ID
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

    // Tambahkan class 'form-content' ke form login dan daftar awal di HTML
    // Ini perlu dilakukan di HTML atau JS jika belum ada.
    // Berdasarkan index.html Anda, div dengan ID #loginForm dan #registerForm sudah punya class="form"
    // Dan form tag di dalamnya punya ID. Alur lupa/reset menambahkan div with class="form-content" dan ID
    // Mari kita pastikan form#login dan form#register punya class form-content juga agar konsisten dengan selector showFormContent
    if (loginFormElement) loginFormElement.classList.add('form-content');
    if (registerFormElement) registerFormElement.classList.add('form-content');


    // Pasang event listener untuk tab dan link switch form
    // Pastikan elemennya ada sebelum menambahkan listener
    if (loginTab) loginTab.addEventListener('click', showLoginTab);
    if (registerTab) registerTab.addEventListener('click', showRegisterTab);
    // Tambahkan preventDefault pada link switch form agar halaman tidak reload
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
        // Pastikan elemen ditemukan
        if (checkbox && passwordInput) {
            // Setel tipe input awal berdasarkan status checkbox (jika halaman direload)
            // Gunakan checked property untuk membaca status awal checkbox
            passwordInput.type = checkbox.checked ? 'text' : 'password';

            // Tambahkan event listener untuk perubahan status checkbox
            checkbox.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        } else {
            console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}"`);
        }
    }

    // Pasang lihat password untuk form login (input awal)
    // Menggunakan ID sesuai HTML Anda: showLoginPassword dan loginPassword
    setupPasswordToggle('showLoginPassword', 'loginPassword');

    // Pasang lihat password untuk form daftar (input awal)
    // Menggunakan ID sesuai HTML Anda: showPassword, password, showConfirmPassword, confirmPassword
    setupPasswordToggle('showPassword', 'password'); // Password daftar
    setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // Konfirmasi password daftar


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD (Simulasi API Calls dengan innerHTML) ---
    // Dapatkan elemen link "Lupa Password?" (Menggunakan querySelector karena tidak ada ID)
    const forgotPasswordLink = document.querySelector('#login form .forgot-password'); // Cari link dengan class 'forgot-password' di dalam form#login
    if (!forgotPasswordLink) {
        console.warn("Link 'Lupa Password?' (.forgot-password inside form#login) tidak ditemukan di HTML.");
    } else {
        // Dapatkan form login spesifik awal (form#login)
        const loginFormElement = document.getElementById('login');
        const originalLoginFormContentHTML = loginFormElement ? loginFormElement.outerHTML : '';


        // Fungsi handler terpisah untuk klik link "Lupa Password?"
        const handleForgotPasswordClick = async (e) => {
            e.preventDefault(); // Mencegah navigasi link bawaan

            if (!loginFormContainer) { // Menggunakan ID kontainer utama #loginForm
                console.error("Login form container not found for forgot password flow.");
                return;
            }

            // Sembunyikan form login awal
            if (loginFormElement) loginFormElement.classList.add('hidden');

            // Tambahkan form lupa password ke kontainer login
            // Pastikan div yang ditambahkan punya class="form-content" dan ID yang unik (#forgotPasswordForm)
            loginFormContainer.innerHTML += `
                <div class="form-content" id="forgotPasswordForm">
                    <h2> Lupa Password </h2>
                    <p style="color: #272343; font-style: italic;"> Masukkan identifier akun Anda (misal: email atau whatsapp) untuk memulai proses reset password. </p>
                    <form> <div class="input-group">
                            <label for="forgotPasswordIdentifier"> Email / Whatsapp </label>
                            <input type="text" id="forgotPasswordIdentifier" placeholder="Masukan Email atau Whatsapp" required>
                        </div>
                        <button type="submit"> Kirim Kode Reset </button>
                        <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                    </form>
                 </div>
            `;

            // Dapatkan elemen form lupa password yang baru ditambahkan
            const forgotPasswordFormElement = document.querySelector('#forgotPasswordForm form');

            // Pasang event listener untuk link "Masuk Sekarang" di form lupa password (setelah HTML diganti)
            const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
            if (switchToLoginFromForgot) {
                switchToLoginFromForgot.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Kembalikan ke konten form login awal
                    if (loginFormContainer) { // Menggunakan ID kontainer utama #loginForm
                        loginFormContainer.innerHTML = originalLoginFormContentHTML; // Kembali ke HTML form login awal
                        // Pasang kembali event listener untuk form login dan link lupa password di dalamnya
                        attachLoginFormListeners(); // Memasang listener submit form login dan link lupa password
                    }
                });
            }

            // Pasang event listener untuk submit form lupa password (setelah HTML diganti)
            if (forgotPasswordFormElement) {
                forgotPasswordFormElement.addEventListener('submit', async (e) => { // Listener di form element
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
                    // Simpan identifier untuk langkah reset
                    // NOTE: Pada simulasi ini, kita hanya menyimpan nilai di JS.
                    // Pada implementasi nyata, Anda akan mengirim email/WA dengan token reset.
                    let forgotPasswordUserIdentifier = identifier;


                    showNotification('Mengirim kode reset (simulasi)...', 'info');

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


                        if (response.ok) { // Status kode 200-299 (Permintaan Kode Berhasil Simulasi)
                            showNotification(data.message || 'Jika akun terdaftar, instruksi reset akan dikirim.', 'success', 5000); // Tampilkan lebih lama

                            // Ganti konten kontainer login dengan form reset password setelah sukses simulasi
                            if (loginFormContainer) { // Menggunakan ID kontainer utama #loginForm
                                loginFormContainer.innerHTML = `
                                    <div class="form-content" id="resetPasswordForm">
                                        <h2> Reset Password </h2>
                                        <p style="color: #272343; font-style: italic;"> Masukkan kode reset yang telah dikirimkan dan password baru Anda. </p>
                                        <form> <div class="input-group">
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
                                // Setelah HTML form reset dimuat, pasang listener untuknya
                                attachResetPasswordFormListener(forgotPasswordUserIdentifier); // Teruskan identifier
                                // Pasang listener lihat password untuk input baru
                                setupPasswordToggle('showNewPassword', 'newPassword');
                                setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

                                // Pasang event listener untuk link kembali ke login dari form reset (setelah HTML diganti)
                                const switchToLoginFromReset = document.getElementById('switchToLoginFromReset');
                                if (switchToLoginFromReset) {
                                    switchToLoginFromReset.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        if (loginFormContainer) { // Menggunakan ID kontainer utama #loginForm
                                            loginFormContainer.innerHTML = originalLoginFormContentHTML; // Kembali ke HTML form login awal
                                            attachLoginFormListeners(); // Pasang kembali listener form login
                                        }
                                    });
                                }

                            } else {
                                console.error("Element loginFormContainer not found.");
                            }

                        } else { // Status kode 400-500an (Gagal Mengirim Kode Simulasi)
                            let errorMessage = 'Gagal mengirim kode reset (simulasi).';
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
                        showNotification('Terjadi kesalahan saat memproses lupa password (simulasi).', 'error');
                    }
                });
            } else {
                console.error("Reset password form element not found after innerHTML replacement.");
            }
        }; // Akhir handleForgotPasswordClick


        // Fungsi untuk memasang event listener form reset password (Simulasi API Calls dengan innerHTML)
        // Dipanggil setelah form reset password ditambahkan ke DOM via innerHTML
        function attachResetPasswordFormListener(identifier) {
            // Dapatkan elemen form reset password yang baru ditambahkan
            const resetPasswordFormElement = document.querySelector('#resetPasswordForm form');

            if (resetPasswordFormElement) {
                resetPasswordFormElement.addEventListener('submit', async (e) => { // Listener di form element
                    e.preventDefault(); // Mencegah submit form bawaan

                    // Identifier (Email/Whatsapp) diambil dari parameter
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
                        // --- AKHIR SIMULASI ---

                        if (response.ok) { // Status kode 200-299 (Reset Berhasil Simulasi)
                            showNotification(data.message || 'Password berhasil direset! Silakan Login.', 'success');
                            // Kembali ke form login setelah notifikasi muncul sebentar
                            setTimeout(() => {
                                const loginFormContainer = document.getElementById('loginForm'); // Menggunakan ID kontainer utama #loginForm
                                if (loginFormContainer) {
                                    loginFormContainer.innerHTML = originalLoginFormContentHTML; // Kembali ke HTML form login awal
                                    attachLoginFormListeners(); // Pasang kembali listener form login
                                }
                            }, 1500); // Delay 1.5 detik
                        } else { // Status kode 400-500an (Reset Gagal Simulasi)
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

                // Pasang listener lihat password untuk input di form reset (setelah HTML diganti)
                setupPasswordToggle('showNewPassword', 'newPassword');
                setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

                // Link "Masuk Sekarang" di form reset sudah punya listener yang dipasang saat HTML dibuat.
            } else {
                console.error("Reset password form element not found after innerHTML replacement.");
            }
        }


        // Fungsi handler terpisah untuk SUBMIT form login (Simulasi API Call)
        const handleLoginSubmit = async (e) => {
            e.preventDefault(); // Mencegah submit form bawaan browser
            console.log('preventDefault executed for login form. Attempting fetch...'); // Log untuk debugging

            // Dapatkan nilai input sesuai form login simulasi Anda (gunakan ID dari HTML yang Anda berikan)
            const identifierInput = document.getElementById('loginWhatsapp'); // Menggunakan ID 'loginWhatsapp' sesuai HTML Anda
            const passwordInput = document.getElementById('loginPassword'); // Menggunakan ID 'loginPassword' sesuai HTML Anda

            // Pastikan elemen ditemukan
            if (!identifierInput || !passwordInput) {
                console.error("Login form inputs not found.");
                showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
                return;
            }

            const identifier = identifierInput.value; // Menggunakan nilai dari input Whatsapp
            const password = passwordInput.value;

            // Validasi dasar di frontend
            if (!identifier || !password) {
                showNotification('Nomor Whatsapp dan password harus diisi.', 'error'); // Sesuaikan pesan validasi
                return;
            }

            showNotification('Memproses login (simulasi)...', 'info'); // Tampilkan pesan loading

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
                    }), // Kirim identifier (Whatsapp) dan password
                });
                const data = await response.json();
                // --- AKHIR SIMULASI ---

                if (response.ok) { // Cek status code 200-299 (Login Berhasil Simulasi)
                    showNotification(data.message || 'Login berhasil!', 'success');
                    console.log("Data dari server setelah login (simulasi):", data);

                    // --- Simpan Status Login dan Identifier Pengguna untuk Homepage (localStorage Simulasi) ---
                    let userIdentifierToSave = identifier; // Default menggunakan identifier yang diinput (Whatsapp)
                    // Sesuaikan dengan struktur respons API backend Anda jika mengembalikan identifier lain
                    if (data.user && data.user.username) { // Contoh jika API mengembalikan user.username
                        userIdentifierToSave = data.user.username;
                    } else if (data.user && data.user.fullName) { // Contoh jika API mengembalikan user.fullName
                        userIdentifierToSave = data.user.fullName;
                    } else if (data.user && data.user.email) { // Contoh jika API mengembalikan user.email
                        userIdentifierToSave = data.user.email;
                    } else if (data.user && data.user.whatsapp) { // Contoh jika API mengembalikan user.whatsapp
                        userIdentifierToSave = data.user.whatsapp; // Simpan whatsapp jika dikembalikan
                    } else {
                        // Jika tidak ada identifier yang jelas dari API, gunakan identifier yang diinput
                        userIdentifierToSave = identifier; // Gunakan Whatsapp yang diinput
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
                        console.warn("Login berhasil (simulasi) tapi tidak dapat menentukan identifier pengguna. Status login diset.");
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.removeItem('loggedInUserIdentifier'); // Pastikan kunci kosong jika tidak ada identifier
                    }
                    // --- Akhir Simpan Status Login (localStorage Simulasi) ---


                    // Redirect ke homepage setelah notifikasi muncul sebentar
                    setTimeout(() => {
                        // Menggunakan window.location.replace agar tidak bisa kembali ke halaman login pakai tombol back
                        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
                    }, 1500); // Delay 1.5 detik

                } else { // Status code 400-500an (Login Gagal Simulasi)
                    let errorMessage = 'Login gagal (simulasi).';
                    // Tangani pesan error dari backend
                    if (data && data.message) {
                        errorMessage += ' ' + data.message;
                    } else {
                        errorMessage += ' Mohon coba lagi.';
                    }
                    showNotification(errorMessage, 'error');
                    console.error('Login failed (simulasi):', response.status, data);
                    // Opsional: reset form password jika login gagal
                    const loginPasswordInput = document.getElementById('loginPassword');
                    if (loginPasswordInput) loginPasswordInput.value = '';
                }
            } catch (error) {
                console.error('Error saat memanggil API login (simulasi):', error);
                showNotification('Terjadi kesalahan saat login (simulasi).', 'error');
            }
        }; // Akhir handleLoginSubmit


        // Fungsi handler terpisah untuk SUBMIT form daftar (Simulasi API Call)
        const handleRegisterSubmit = async (e) => {
            e.preventDefault(); // Mencegah submit form bawaan browser
            console.log('preventDefault executed for register form. Attempting fetch...'); // Log untuk debugging

            // Dapatkan nilai input sesuai form daftar simulasi Anda (gunakan ID dari HTML yang Anda berikan)
            const fullNameInput = document.getElementById('fullName');
            const usernameInput = document.getElementById('username');
            const whatsappInput = document.getElementById('whatsapp');
            const emailInput = document.getElementById('email'); // Menggunakan ID 'email' sesuai HTML Anda
            const passwordInput = document.getElementById('password'); // Menggunakan ID 'password' sesuai HTML Anda
            const confirmPasswordInput = document.getElementById('confirmPassword'); // Menggunakan ID 'confirmPassword' sesuai HTML Anda

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

            showNotification('Memproses pendaftaran (simulasi)...', 'info'); // Pesan loading

            try {
                // --- SIMULASI PANGGILAN API DAFTAR ---
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
                // --- AKHIR SIMULASI ---

                if (response.ok) { // Status kode 200-299 (Daftar Berhasil Simulasi)
                    showNotification(data.message || 'Pendaftaran berhasil! Silakan Login.', 'success');
                    // Beralih ke form login setelah notifikasi muncul sebentar
                    setTimeout(() => {
                        showLoginTab(); // Beralih ke tab/form login
                        // Opsional: kosongkan form pendaftaran
                        const registerForm = document.getElementById('register');
                        if (registerForm) registerForm.reset();
                    }, 1500); // Delay 1.5 detik
                } else { // Status code 400-500an (Daftar Gagal Simulasi)
                    let errorMessage = 'Pendaftaran gagal (simulasi).';
                    // Tangani penanganan khusus error dari backend (misal: sudah terdaftar)
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
        }; // Akhir handleRegisterSubmit


        // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
        // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
        // dan saat halaman pertama kali dimuat
        function attachLoginFormListeners() {
            // Dapatkan kembali elemen form login spesifik (tag <form>) yang ada di HTML
            const loginFormElement = document.getElementById('login');
            // Dapatkan kembali elemen link "Lupa Password?"
            const forgotPasswordLink = document.querySelector('#login form .forgot-password'); // Cari link dengan class 'forgot-password' di dalam form#login

            // Pastikan elemen form login ditemukan
            if (loginFormElement) {
                // Pasang event listener submit untuk form login HANYA SATU KALI
                // Hapus listener sebelumnya jika ada untuk mencegah double-binding
                loginFormElement.removeEventListener('submit', handleLoginSubmit); // Pastikan handler sama
                loginFormElement.addEventListener('submit', handleLoginSubmit); // Pasang listener submit form login

                // Pasang kembali event listener lihat password untuk form login
                setupPasswordToggle('showLoginPassword', 'loginPassword');
            } else {
                console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
            }

            // Pasang kembali event listener link "Lupa Password?"
            if (forgotPasswordLink) {
                // Hapus listener sebelumnya jika ada
                forgotPasswordLink.removeEventListener('click', handleForgotPasswordClick); // Pastikan handler sama
                forgotPasswordLink.addEventListener('click', handleForgotPasswordClick); // Pasang listener link lupa password
            } else {
                console.warn("Forgot password link (.forgot-password inside form#login) not found.");
            }
        }


        // Fungsi handler terpisah untuk SUBMIT form daftar (Dipasang saat initial load)
        // Dapatkan elemen form daftar spesifik (tag <form>) saat DOMContentLoaded
        // Variabel registerFormElement dideklarasikan di awal DOMContentLoaded.
        if (registerFormElement) { // Menggunakan variabel yang dideklarasikan di atas
            // Pasang event listener submit untuk form daftar HANYA SATU KALI DI SINI
            // Menggunakan fungsi handler terpisah.
            registerFormElement.removeEventListener('submit', handleRegisterSubmit); // Hapus listener sebelumnya jika ada
            registerFormElement.addEventListener('submit', handleRegisterSubmit); // Gunakan handler terpisah

            // Pasang lihat password untuk form daftar (input awal)
            // Menggunakan ID sesuai HTML Anda
            setupPasswordToggle('showPassword', 'password'); // Password daftar
            setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // Konfirmasi password daftar

        } else {
            console.warn("Register form element with ID 'register' not found on initial load.");
        }


        // --- INITIAL SETUP halaman login/daftar saat DOMContentLoaded JIKA BELUM LOGIN ---
        // Fungsi ini dijalankan saat DOMContentLoaded, HANYA JIKA cek sesi di awal tidak menemukan sesi aktif
        function initializeFormsAndTabs() {
            // Pastikan elemen tab dan kontainer form ada
            if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer) { // Menggunakan ID kontainer utama
                console.error("HTML structure for tabs or forms not complete.");
                // Tampilkan notifikasi atau pesan error di UI jika elemen penting tidak ditemukan
                showNotification('Error: Struktur halaman tidak lengkap.', 'error');
                return;
            }

            // Pasang listener submit form login awal dan link lupa password di dalamnya
            // Panggil ini di sini untuk memasang listener saat halaman pertama dimuat JIKA BELUM LOGIN
            attachLoginFormListeners(); // Ini akan memasang handleLoginSubmit ke form#login awal

            // --- PENTING: Atur keadaan awal saat halaman dimuat JIKA BELUM LOGIN ---
            // Sembunyikan kontainer form register dan tampilkan kontainer form login menggunakan class 'hidden'
            // Menggunakan ID kontainer div utama (#loginForm, #registerForm)
            registerFormContainer.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');

            // Pastikan form konten login spesifik juga terlihat (form#login)
            if (loginFormElement) loginFormElement.classList.remove('hidden'); // Pastikan form login awal terlihat
            // Sembunyikan form forgot/reset jika ada (seharusnya belum ada saat load awal)
            const forgotForm = document.getElementById('forgotPasswordForm'); // Ini adalah div form-content, bukan form tag
            const resetForm = document.getElementById('resetPasswordForm'); // Ini adalah div form-content, bukan form tag
            if (forgotForm) forgotForm.classList.add('hidden');
            if (resetForm) resetForm.classList.add('hidden');

            console.log("Halaman login/daftar diinisialisasi.");
        }

        // Panggil fungsi inisialisasi form dan tab HANYA JIKA tidak ada sesi aktif
        if (!(isLoggedIn === 'true' && loggedInUserIdentifier)) {
            initializeFormsAndTabs();
        }
    }
}); // Akhir DOMContentLoaded