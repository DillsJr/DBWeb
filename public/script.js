// public/script.js - Script untuk halaman login/daftar (Integrasi Supabase Authentication)

// --- KONFIGURASI SUPABASE ---
// !!! GANTI placeholder berikut dengan URL dan ANON KEY Supabase Project Anda !!!
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co'; // Contoh: 'https://abcdefg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // Contoh: 'eyJhbGciOiJIUzI...'

// Inisialisasi klien Supabase
// Pastikan Anda sudah menambahkan tag script Supabase JS Library di index.html HEAD:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized."); // Log untuk verifikasi inisialisasi

// --- Logika Cek Status Login dengan Supabase saat DOMContentLoaded ---
// Menggunakan onAuthStateChange untuk mendeteksi perubahan status login
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth State Change:', event, session);

    // Jika ada sesi aktif (pengguna sudah login), redirect ke homepage
    if (session) {
        console.log("Sesi Supabase ditemukan, redirect ke homepage.html");
        // Menggunakan window.location.replace agar tidak bisa kembali pakai tombol back
        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
        // Tidak perlu return di sini, redirect akan menghentikan eksekusi
    } else {
        // Jika tidak ada sesi (pengguna logout atau belum login)
        console.log("Tidak ada sesi Supabase, tetap di halaman login/daftar.");
        // Lanjutkan inisialisasi form jika belum login (ini sudah di handle di bawah di luar listener ini)
        // initializeFormsAndTabs(); // Akan dipanggil setelah listener ini selesai jika tidak ada sesi
    }
});
// --- Akhir Logika Cek Status Login Supabase ---


document.addEventListener('DOMContentLoaded', async () => {

    // Karena onAuthStateChange sudah menangani redirect jika ada sesi,
    // sisa dari script ini akan dijalankan HANYA JIKA tidak ada sesi aktif saat DOMContentLoaded.

    // --- Mendapatkan elemen-elemen HTML utama ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormContainer = document.getElementById('loginForm'); // Kontainer untuk form login/forgot/reset
    const registerFormContainer = document.getElementById('registerForm'); // Kontainer untuk form daftar

    const loginFormElement = document.getElementById('login'); // Form login spesifik
    const registerFormElement = document.getElementById('register'); // Form daftar spesifik

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

        // Setelah beralih ke tab login, pastikan form login spesifik terlihat
        if (loginFormElement) loginFormElement.classList.remove('hidden');
        // Sembunyikan form forgot/reset jika ada di dalam kontainer login
        const forgotForm = document.getElementById('forgotPasswordForm'); // Ini adalah div form-content, bukan form tag
        // const resetForm = document.getElementById('resetPasswordForm'); // Form reset dihilangkan dari innerHTML
        if (forgotForm) forgotForm.classList.add('hidden');
        // if (resetForm) resetForm.classList.add('hidden');


        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegisterTab() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        if (loginFormContainer) loginFormContainer.classList.add('hidden');
        if (registerFormContainer) registerFormContainer.classList.remove('hidden');

        // Setelah beralih ke tab register, pastikan form register spesifik terlihat
        if (registerFormElement) registerFormElement.classList.remove('hidden');


        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


    // --- Fungsi untuk Mengganti Tampilan Konten Form di Dalam loginFormContainer (#loginForm) ---
    // Tetap dipertahankan untuk transisi antara form login utama dan form lupa password
    function showFormContent(formToShowId) {
        if (!loginFormContainer) {
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
        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    // Tambahkan class 'form-content' ke form login dan daftar awal
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

    // Pasang lihat password untuk form login (input email dan password)
    setupPasswordToggle('showLoginPassword', 'loginPassword'); // ID password login

    // Pasang lihat password untuk form daftar (input password dan konfirmasi password)
    setupPasswordToggle('showPassword', 'password'); // ID password daftar
    setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // ID konfirmasi password daftar


    // --- ALUR LUPA PASSWORD (Menggunakan Supabase Authentication) ---
    const forgotPasswordLink = document.querySelector('#login form .forgot-password');
    if (!forgotPasswordLink) {
        console.warn("Link 'Lupa Password?' (.forgot-password inside form#login) tidak ditemukan di HTML.");
    } else {
        const loginFormElement = document.getElementById('login');
        const originalLoginFormContentHTML = loginFormElement ? loginFormElement.outerHTML : '';

        // Fungsi handler terpisah untuk klik link "Lupa Password?"
        const handleForgotPasswordClick = (e) => { // Tidak perlu async di sini
            e.preventDefault();

            if (!loginFormContainer) {
                console.error("Login form container not found for forgot password flow.");
                return;
            }

            // Simpan HTML form login awal sebelum diganti
            // originalLoginFormContentHTML = loginFormElement ? loginFormElement.outerHTML : ''; // Sudah diambil di luar

            // Sembunyikan form login awal
            if (loginFormElement) loginFormElement.classList.add('hidden');

            // Ganti konten kontainer login dengan form lupa password
            // Pastikan div yang ditambahkan punya class="form-content" dan ID yang unik (#forgotPasswordForm)
            loginFormContainer.innerHTML = `
                <div class="form-content" id="forgotPasswordForm">
                    <h2> Lupa Password </h2>
                    <p style="color: #272343; font-style: italic;"> Masukkan Email akun Anda untuk memulai proses reset password. </p>
                    <form id="forgotPasswordFormElement"> <div class="input-group">
                            <label for="forgotPasswordEmail"> Email </label> <input type="email" id="forgotPasswordEmail" placeholder="Masukan Email" required>
                        </div>
                        <button type="submit"> Kirim Link Reset </button> <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                    </form>
                 </div>
            `;
            // Catatan: Form reset password (memasukkan kode/password baru) biasanya di handle
            // DI HALAMAN LAIN yang dituju setelah user klik link di email Supabase.
            // Kode untuk halaman itu akan menggunakan supabase.auth.updateUser() setelah memverifikasi token di URL.
            // Jadi, kita tidak membuat form reset di sini.


            // Dapatkan elemen form lupa password yang baru dibuat
            const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement'); // Gunakan ID tag form

            // Pasang event listener untuk link "Masuk Sekarang" di form lupa password (setelah HTML diganti)
            const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
            if (switchToLoginFromForgot) {
                switchToLoginFromForgot.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Kembalikan ke konten form login awal
                    if (loginFormContainer) {
                        loginFormContainer.innerHTML = originalLoginFormContentHTML; // Kembali ke HTML form login awal
                        // Pasang kembali event listener untuk form login dan link lupa password di dalamnya
                        attachLoginFormListeners(); // Memasang listener submit form login dan link lupa password
                    }
                });
            }

            // Pasang event listener untuk submit form lupa password (setelah HTML diganti)
            if (forgotPasswordFormElement) {
                forgotPasswordFormElement.addEventListener('submit', async (e) => { // Gunakan ID tag form
                    e.preventDefault();

                    const emailInput = document.getElementById('forgotPasswordEmail'); // ID input diubah
                    if (!emailInput) {
                        console.error("Forgot password email input not found.");
                        showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
                        return;
                    }
                    const email = emailInput.value;

                    if (!email) {
                        showNotification('Email harus diisi.', 'error');
                        return;
                    }

                    showNotification('Mengirim link reset password...', 'info');

                    // --- PANGGILAN SUPABASE UNTUK RESET PASSWORD ---
                    // Supabase akan mengirim email berisi link reset
                    const {
                        data,
                        error
                    } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: window.location.origin + '/reset-password.html' // !!! GANTI URL INI !!!
                        // Ganti '/reset-password.html' dengan path halaman di mana user akan memasukkan password baru
                        // Halaman ini harus ada dan mengandung script untuk memanggil supabase.auth.updateUser()
                        // dengan password baru setelah mengambil token dari URL.
                    });
                    // --- AKHIR PANGGILAN SUPABASE ---

                    if (error) {
                        console.error('Error reset password Supabase:', error.message);
                        showNotification(`Gagal mengirim link reset: ${error.message}`, 'error');
                    } else {
                        // Supabase mengembalikan data null jika sukses, tapi akan mengirim email
                        console.log('Link reset password dikirim (cek email).', data);
                        showNotification('Jika email terdaftar, link reset telah dikirim. Cek inbox Anda.', 'success', 5000);
                        // Opsional: Kembali ke form login setelah beberapa saat
                        setTimeout(() => {
                            const loginFormContainer = document.getElementById('loginForm');
                            if (loginFormContainer) {
                                loginFormContainer.innerHTML = originalLoginFormContentHTML;
                                attachLoginFormListeners();
                            }
                        }, 2000); // Delay 2 detik
                    }
                });
            } else {
                console.error("Forgot password form element not found after innerHTML replacement.");
            }
        }; // Akhir handleForgotPasswordClick

        // Pasang listener ke link "Lupa Password?" di form login awal
        forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
    }
    // --- Akhir Alur Lupa Password Supabase (Initiasi) ---


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    function attachLoginFormListeners() {
        // Dapatkan kembali elemen form login spesifik (tag <form>) yang ada di HTML
        const loginFormElement = document.getElementById('login');
        // Dapatkan kembali elemen link "Lupa Password?"
        const forgotPasswordLink = document.querySelector('#login form .forgot-password');

        // Pastikan elemen form login ditemukan
        if (loginFormElement) {
            // Pasang event listener submit untuk form login HANYA SATU KALI
            // Hapus listener sebelumnya jika ada untuk mencegah double-binding
            loginFormElement.removeEventListener('submit', handleLoginSubmit); // Pastikan handler sama
            loginFormElement.addEventListener('submit', handleLoginSubmit); // Pasang listener submit form login

            // Pasang kembali event listener lihat password untuk form login
            // ID input login sekarang adalah 'loginEmail' dan 'loginPassword'
            setupPasswordToggle('showLoginPassword', 'loginPassword'); // ID password login
        } else {
            console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
        }

        // Pasang kembali event listener link "Lupa Password?"
        if (forgotPasswordLink) {
            forgotPasswordLink.removeEventListener('click', handleForgotPasswordClick); // Pastikan handler sama
            forgotPasswordLink.addEventListener('click', handleForgotPasswordClick); // Pasang listener link lupa password
        } else {
            console.warn("Forgot password link (.forgot-password inside form#login) not found.");
        }
    }


    // Pasang event listener submit untuk form daftar HANYA SATU KALI DI SINI
    // Menggunakan fungsi handler terpisah.
    if (registerFormElement) {
        registerFormElement.removeEventListener('submit', handleRegisterSubmit); // Hapus listener sebelumnya jika ada
        registerFormElement.addEventListener('submit', handleRegisterSubmit); // Gunakan handler terpisah

        // Pasang lihat password untuk form daftar
        setupPasswordToggle('showPassword', 'password'); // ID password daftar
        setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // ID konfirmasi password daftar

    } else {
        console.warn("Register form element with ID 'register' not found on initial load.");
    }


    // --- Implementasi handleLoginSubmit (Menggunakan Supabase Authentication) ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        console.log('Memproses login (menggunakan Supabase Authentication)...');

        // ID input login sekarang adalah 'loginEmail' dan 'loginPassword'
        const emailInput = document.getElementById('loginEmail'); // GANTI ID INPUT
        const passwordInput = document.getElementById('loginPassword');

        if (!emailInput || !passwordInput) {
            console.error("Login form inputs not found (Email or Password).");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const email = emailInput.value.trim(); // Gunakan email
        const password = passwordInput.value;

        if (!email || !password) {
            showNotification('Email dan password harus diisi.', 'error'); // Sesuaikan pesan
            return;
        }

        showNotification('Memproses login...', 'info');

        // --- PANGGILAN SUPABASE UNTUK LOGIN ---
        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({
            email: email, // Login menggunakan email
            password: password,
        });
        // --- AKHIR PANGGILAN SUPABASE ---

        if (error) {
            console.error('Error login Supabase:', error.message);
            let errorMessage = 'Login gagal.';
            if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Email belum dikonfirmasi. Cek inbox Anda.';
            } else if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah.';
            } else {
                errorMessage += ' ' + error.message;
            }
            showNotification(errorMessage, 'error');
            // Opsional: kosongkan input password jika login gagal
            passwordInput.value = '';

        } else {
            // Login berhasil! Supabase akan menyimpan sesi dan onAuthStateChange akan terpicu
            console.log('Login berhasil via Supabase Auth:', data);
            // Redirect akan ditangani oleh onAuthStateChange listener di bagian atas file.
            // showNotification('Login berhasil!', 'success'); // Notifikasi bisa dihilangkan karena redirect cepat
            // Redirect otomatis via onAuthStateChange
        }
    };


    // --- Implementasi handleRegisterSubmit (Menggunakan Supabase Authentication) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        console.log('Memproses pendaftaran (menggunakan Supabase Authentication)...');

        // Ambil semua data dari form pendaftaran
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

        const fullName = fullNameInput.value.trim();
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
        if (password.length < 6) { // Supabase mensyaratkan minimal 6 karakter
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }
        // Tambahkan validasi format email/whatsapp jika perlu

        showNotification('Memproses pendaftaran...', 'info');

        // --- PANGGILAN SUPABASE UNTUK DAFTAR ---
        // Supabase memerlukan email dan password.
        // data (fullName, username, whatsapp) bisa disimpan sebagai user_metadata jika diinginkan,
        // tetapi lebih baik disimpan di tabel 'profiles' setelah pendaftaran/konfirmasi email.
        const {
            data,
            error
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Anda bisa menyimpan metadata dasar di sini,
                // tapi data profil lengkap (username, nama, dll.)
                // sebaiknya disimpan di tabel database terpisah ('profiles')
                // setelah pengguna terdaftar dan email dikonfirmasi.
                data: {
                    // Contoh menyimpan username atau nama dasar
                    // username: username // Jika Anda ingin username langsung di objek auth
                    // fullName: fullName // Jika Anda ingin nama lengkap langsung di objek auth
                }
            }
        });
        // --- AKHIR PANGGILAN SUPABASE ---

        if (error) {
            console.error('Error pendaftaran Supabase:', error.message);
            let errorMessage = 'Pendaftaran gagal.';
            if (error.message.includes('already registered')) {
                errorMessage = 'Email atau nomor Whatsapp sudah terdaftar.'; // Sesuaikan pesan tergantung apa yang dicek duplikasi
            } else {
                errorMessage += ' ' + error.message;
            }
            showNotification(errorMessage, 'error');

        } else {
            // Pendaftaran berhasil (email terkirim untuk verifikasi jika diaktifkan)
            console.log('Pendaftaran berhasil via Supabase Auth:', data);

            // Periksa apakah Supabase memerlukan konfirmasi email
            // Supabase secara default memerlukan konfirmasi email.
            if (data && data.user && data.user.identities && data.user.identities.length > 0 && data.user.email_confirmed_at === null) {
                showNotification('Pendaftaran berhasil! Cek email Anda untuk konfirmasi akun.', 'success', 5000);
            } else {
                // Ini mungkin terjadi jika email confirmation dimatikan di Supabase
                showNotification('Pendaftaran berhasil! Silakan Login.', 'success');
            }


            // Beralih ke form login setelah notifikasi muncul sebentar
            setTimeout(() => {
                showLoginTab();
                // Opsional: kosongkan form pendaftaran setelah berhasil
                const registerForm = document.getElementById('register');
                if (registerForm) registerForm.reset();
            }, 1500);
        }
    };


    // Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal)
    function attachLoginFormListeners() {
        const loginFormElement = document.getElementById('login');
        const forgotPasswordLink = document.querySelector('#login form .forgot-password');

        if (loginFormElement) {
            // Pastikan handler submit form login terpasang
            loginFormElement.removeEventListener('submit', handleLoginSubmit);
            loginFormElement.addEventListener('submit', handleLoginSubmit);

            // Pasang kembali listener lihat password untuk input login (Email dan Password)
            setupPasswordToggle('showLoginPassword', 'loginPassword'); // ID password login
            // setupPasswordToggle('showLoginEmail', 'loginEmail'); // Tidak perlu toggle untuk email
        } else {
            console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
        }

        // Pasang kembali event listener link "Lupa Password?"
        if (forgotPasswordLink) {
            forgotPasswordLink.removeEventListener('click', handleForgotPasswordClick);
            forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
        } else {
            console.warn("Forgot password link (.forgot-password inside form#login) not found.");
        }
    }


    // Pasang event listener submit untuk form daftar (Dipasang saat initial load)
    if (registerFormElement) {
        registerFormElement.removeEventListener('submit', handleRegisterSubmit); // Hapus listener sebelumnya jika ada
        registerFormElement.addEventListener('submit', handleRegisterSubmit); // Pasang listener daftar

        // Pasang lihat password untuk form daftar
        setupPasswordToggle('showPassword', 'password'); // ID password daftar
        setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // ID konfirmasi password daftar

    } else {
        console.warn("Register form element with ID 'register' not found on initial load.");
    }


    // --- INITIAL SETUP halaman login/daftar saat DOMContentLoaded ---
    // Fungsi ini dijalankan saat DOMContentLoaded HANYA JIKA onAuthStateChange tidak redirect
    function initializeFormsAndTabs() {
        if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer) {
            console.error("HTML structure for tabs or forms not complete.");
            showNotification('Error: Struktur halaman tidak lengkap.', 'error');
            return;
        }

        // Pasang listener submit form login awal dan link lupa password di dalamnya
        attachLoginFormListeners(); // Ini akan memasang handleLoginSubmit ke form#login awal

        // Atur keadaan awal: sembunyikan form register, tampilkan form login
        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');

        // Pastikan form konten login spesifik juga terlihat
        if (loginFormElement) loginFormElement.classList.remove('hidden');
        // Pastikan form lupa password tidak terlihat di awal
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) forgotForm.classList.add('hidden');


        console.log("Halaman login/daftar diinisialisasi.");
    }

    // Karena onAuthStateChange mungkin asinkron, panggil inisialisasi ini setelah
    // event listener onAuthStateChange selesai dievaluasi (ini adalah pendekatan sederhana).
    // Atau, panggil setelah onAuthStateChange mendeteksi 'SIGNED_OUT'.
    // Untuk menyederhanakan, kita panggil inisialisasi ini langsung.
    // Jika onAuthStateChange me-redirect, kode setelah redirect tidak akan jalan.
    // Jika tidak me-redirect (karena tidak ada sesi), inisialisasi akan berjalan.
    initializeFormsAndTabs();


}); // Akhir DOMContentLoaded