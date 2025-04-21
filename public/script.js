// public/script.js

// --- INISIALISASI SUPABASE (Ganti dengan URL dan Anon Key Proyek Anda) ---
const SUPABASE_URL = 'https://gdhetudsmvypfpksggqp.supabase.co'; // Ganti dengan URL proyek Supabase Anda
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // Ganti dengan Anon Key proyek Supabase Anda

const {
    createClient
} = supabase; // Asumsi Supabase SDK dimuat di index.html atau di sini
// Jika Supabase SDK tidak dimuat di HTML, uncomment baris berikut dan pastikan Anda memiliki file supabase.js lokal atau gunakan CDN di HTML
// import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- AKHIR INISIALISASI SUPABASE ---


document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements Utama ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    // Menggunakan ID yang sesuai dengan struktur HTML simulasi sebelumnya
    const loginFormDiv = document.getElementById('loginFormDiv'); // Div kontainer form login/forgot/reset
    const registerFormDiv = document.getElementById('registerFormDiv'); // Div kontainer form daftar
    // Dapatkan elemen container utama (masih diperlukan untuk notifikasi)
    const container = document.querySelector('.container');

    // --- Fungsi Notifikasi Kustom ---
    const notificationElement = document.getElementById('custom-notification');
    let notificationTimeout;

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


    // --- Logika Cek Sesi Supabase Saat Halaman Login/Daftar Dimuat ---
    const {
        data: {
            session
        },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error('Error getting Supabase session:', sessionError);
        // Tidak redirect, tapi tampilkan notifikasi error jika sesi gagal dimuat
        showNotification('Gagal memuat sesi pengguna. Silakan refresh halaman.', 'error', 5000);
        // Tetap biarkan form login/daftar terlihat
    }

    if (session) {
        // Jika ada sesi aktif (user sudah login), arahkan ke halaman homepage
        console.log("Sesi Supabase aktif, redirect ke homepage.html");
        // Menggunakan window.location.replace agar tidak bisa kembali pakai tombol back
        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
        return; // Hentikan eksekusi script lebih lanjut di halaman login
    }
    // --- Akhir Cek Sesi ---


    // --- Logika Ganti Tab (Show/Hide Kontainer Form Utama Menggunakan Class 'hidden') ---
    // Menggunakan ID kontainer div utama (#loginFormDiv, #registerFormDiv)
    function showLoginTab() {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        if (registerFormDiv) registerFormDiv.classList.add('hidden');
        if (loginFormDiv) loginFormDiv.classList.remove('hidden');

        // Setelah beralih ke tab login, pastikan form login spesifik yang ditampilkan di dalamnya
        showFormContent('loginForm'); // Tampilkan form login spesifik (div dengan ID="loginForm")

        // Optional: sembunyikan notifikasi saat ganti tab
        // showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegisterTab() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        if (loginFormDiv) loginFormDiv.classList.add('hidden');
        if (registerFormDiv) registerFormDiv.classList.remove('hidden');

        // Setelah beralih ke tab register, pastikan form register spesifik yang ditampilkan di dalamnya
        showFormContent('registerForm'); // Tampilkan form register spesifik (div dengan ID="registerForm")

        // Optional: sembunyikan notifikasi saat ganti tab
        // showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }
    // --- Akhir Logika Ganti Tab ---


    // --- Fungsi untuk Mengganti Tampilan Konten Form di Dalam loginFormDiv ---
    // Digunakan untuk berpindah antara form login, lupa password, dan reset password di dalam #loginFormDiv
    function showFormContent(formToShowId) {
        if (!loginFormDiv) {
            console.error("Container loginFormDiv not found.");
            return;
        }
        // Dapatkan semua div dengan class="form-content" di dalam loginFormDiv
        const formContents = loginFormDiv.querySelectorAll('.form-content');
        formContents.forEach(formContent => {
            formContent.classList.add('hidden'); // Sembunyikan semua form konten spesifik
        });

        // Dapatkan div form konten spesifik yang ingin ditampilkan berdasarkan ID
        const formToShow = document.getElementById(formToShowId);
        if (formToShow) {
            formToShow.classList.remove('hidden'); // Tampilkan yang diinginkan
        } else {
            console.error(`Form content with ID "${formToShowId}" not found.`);
        }
        // Sembunyikan notifikasi saat ganti form
        // showNotification(''); // Kosongkan pesan
        if (notificationElement) notificationElement.style.display = 'none';
    }


    // Pasang event listener untuk tab dan link switch form
    // Pastikan elemennya ada sebelum menambahkan listener
    if (loginTab) loginTab.addEventListener('click', showLoginTab); // REVISI: Menggunakan showLoginTab
    if (registerTab) registerTab.addEventListener('click', showRegisterTab); // REVISI: Menggunakan showRegisterTab
    // Tambahkan preventDefault pada link switch form agar halaman tidak reload
    const switchToRegisterLink = document.getElementById('switchToRegister');
    const switchToLoginLink = document.getElementById('switchToLogin');
    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterTab(); // REVISI: Menggunakan showRegisterTab
    });
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginTab(); // REVISI: Menggunakan showLoginTab
    });


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

    // Pasang lihat password untuk form login (input awal)
    setupPasswordToggle('showLoginPassword', 'loginPassword');
    // Pasang lihat password untuk form daftar (input awal)
    setupPasswordToggle('showRegisterPassword', 'registerPassword'); // ID dari HTML asli
    setupPasswordToggle('showRegisterConfirmPassword', 'registerConfirmPassword'); // ID dari HTML asli


    // --- VARIABEL DAN FUNGSI UNTUK ALUR LUPA PASSWORD (Menggunakan Supabase Auth Flow) ---
    // Dapatkan elemen link "Lupa Password?"
    const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // Pastikan ID ini ada di HTML form login Anda
    if (!forgotPasswordLink) {
        console.warn("Link 'Lupa Password?' (ID forgotPasswordLink) tidak ditemukan di HTML.");
    } else {
        // Simpan HTML form login spesifik awal untuk kembali nanti
        const loginFormContentDiv = document.getElementById('loginForm');
        const originalLoginFormContentHTML = loginFormContentDiv ? loginFormContentDiv.innerHTML : '';

        // Fungsi handler terpisah untuk klik link "Lupa Password?"
        const handleForgotPasswordClick = async (e) => {
            e.preventDefault(); // Mencegah navigasi link bawaan

            if (!loginFormContentDiv) {
                console.error("Login form content div not found for forgot password flow.");
                return;
            }

            // Ganti konten form login dengan form lupa password
            loginFormContentDiv.innerHTML = `
                <h2> Lupa Password </h2>
                <p style="color: #272343; font-style: italic;"> Masukkan email Anda untuk menerima instruksi reset password. </p>
                <form id="forgotPasswordRequestForm">
                     <div class="input-group">
                         <label for="forgotPasswordEmail"> Email </label>
                         <input type="email" id="forgotPasswordEmail" placeholder="Masukan Email Terdaftar" required autocomplete="email">
                     </div>
                     <button type="submit"> Kirim Link Reset </button>
                     <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                </form>
            `;

            // Pasang event listener untuk link "Masuk Sekarang" di form lupa password (setelah HTML diganti)
            const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
            if (switchToLoginFromForgot) {
                switchToLoginFromForgot.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Kembalikan ke konten form login awal
                    if (loginFormContentDiv) {
                        loginFormContentDiv.innerHTML = originalLoginFormContentHTML;
                        // Pasang kembali event listener untuk form login dan link lupa password di dalamnya
                        attachLoginFormListeners();
                    }
                });
            }

            // Pasang event listener untuk submit form lupa password (setelah HTML diganti)
            const forgotPasswordRequestForm = document.getElementById('forgotPasswordRequestForm');
            if (forgotPasswordRequestForm) {
                forgotPasswordRequestForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const emailInput = document.getElementById('forgotPasswordEmail');
                    if (!emailInput) {
                        showNotification('Internal error: Email input not found.', 'error');
                        return;
                    }
                    const email = emailInput.value;

                    if (!email) {
                        showNotification('Email harus diisi.', 'error');
                        return;
                    }

                    showNotification('Mengirim instruksi reset password...', 'info');

                    // --- Panggil Supabase Auth untuk Mengirim Email Reset ---
                    const {
                        data,
                        error
                    } = await supabase.auth.resetPasswordForEmail(email, {
                        // Redirect URL setelah user mengklik link di email
                        // Ganti ini dengan URL halaman untuk input password baru (misal: '/reset-password.html')
                        // Atau biarkan kosong jika ingin menggunakan halaman default Supabase
                        redirectTo: 'YOUR_RESET_PASSWORD_URL', // !!! GANTI INI DENGAN URL HALAMAN RESET PASSWORD ANDA !!!
                    });

                    if (error) {
                        console.error('Error sending password reset email:', error);
                        showNotification(`Gagal mengirim link reset: ${error.message}`, 'error');
                    } else {
                        console.log('Password reset email sent:', data);
                        showNotification('Instruksi reset password telah dikirim ke email Anda.', 'success', 5000);
                        // Opsional: Arahkan pengguna ke halaman info setelah email terkirim
                        // window.location.href = '/email-sent-info.html';
                    }
                });
            }
        }; // Akhir handleForgotPasswordClick

        // Pasang listener ke link "Lupa Password?" di form login awal (setelah DOMContentLoaded)
        forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
    }


    // --- Fungsi handler terpisah untuk SUBMIT form login (Menggunakan Supabase Auth) ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit form bawaan browser
        console.log('preventDefault executed for login form. Attempting Supabase login...');

        // Dapatkan nilai input sesuai form login simulasi Anda (gunakan ID dari HTML terbaru)
        const emailInput = document.getElementById('loginEmail'); // Menggunakan ID yang sesuai dengan HTML terbaru (Email)
        const passwordInput = document.getElementById('loginPassword');

        // Pastikan elemen ditemukan
        if (!emailInput || !passwordInput) {
            console.error("Login form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        // Validasi dasar di frontend
        if (!email || !password) {
            showNotification('Email dan password harus diisi.', 'error'); // Sesuaikan pesan validasi
            return;
        }

        showNotification('Memproses login...', 'info'); // Tampilkan pesan loading

        // --- Panggil Supabase Auth untuk Login ---
        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });


        if (error) {
            console.error('Supabase login error:', error);
            showNotification(`Login gagal: ${error.message}`, 'error');
            // Opsional: reset form password jika login gagal
            if (passwordInput) passwordInput.value = '';
        } else if (data && data.user) {
            console.log('Supabase login successful:', data);
            showNotification('Login berhasil!', 'success');

            // --- Simpan Identifier Pengguna untuk Homepage (Tidak perlu lagi localStorage) ---
            // Identifier akan diambil dari tabel profiles di homepage.js

            // Redirect ke homepage setelah notifikasi muncul sebentar
            setTimeout(() => {
                // Menggunakan window.location.replace agar tidak bisa kembali ke halaman login pakai tombol back
                window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
            }, 1500); // Delay 1.5 detik

        } else {
            // Kasus ini seharusnya jarang terjadi jika tidak ada error, tapi baik ditangani
            console.error('Login failed: No user data returned from Supabase Auth.', data);
            showNotification('Login gagal: Tidak ada data pengguna.', 'error');
            if (passwordInput) passwordInput.value = '';
        }
    }; // Akhir handleLoginSubmit


    // --- Fungsi handler terpisah untuk SUBMIT form daftar (Menggunakan Supabase Auth) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit form bawaan browser
        console.log('preventDefault executed for register form. Attempting Supabase registration...');

        // Dapatkan nilai input sesuai form daftar simulasi Anda (gunakan ID dari HTML terbaru)
        const fullNameInput = document.getElementById('fullName');
        const usernameInput = document.getElementById('username');
        const whatsappInput = document.getElementById('whatsapp');
        const emailInput = document.getElementById('registerEmail'); // Menggunakan ID 'registerEmail' dari HTML terbaru
        const passwordInput = document.getElementById('registerPassword'); // Menggunakan ID 'registerPassword'
        const confirmPasswordInput = document.getElementById('registerConfirmPassword'); // Menggunakan ID 'registerConfirmPassword'

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

        showNotification('Memproses pendaftaran...', 'info'); // Pesan loading

        // --- Panggil Supabase Auth untuk Mendaftar ---
        const {
            data,
            error
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { // Metadata tambahan yang disimpan di auth.users.user_metadata
                    full_name: fullName, // Simpan juga di metadata Auth sebagai cadangan
                    username: username,
                    whatsapp: whatsapp,
                },
                // Anda juga bisa tambahkan emailRedirectTo jika ingin konfirmasi email
                // emailRedirectTo: 'YOUR_CONFIRMATION_URL', // Ganti dengan URL halaman konfirmasi email Anda
            },
        });

        if (error) {
            console.error('Supabase registration error:', error);
            // Tangani penanganan khusus error dari backend (misal: email sudah terdaftar)
            let errorMessage = 'Pendaftaran gagal.';
            if (error.message) {
                errorMessage += ' ' + error.message;
            }
            showNotification(errorMessage, 'error');
        } else if (data && data.user) {
            console.log('Supabase registration successful:', data);
            // Jika email confirmation diperlukan, pesan sukses akan berbeda
            if (data.session) {
                // User otomatis login setelah daftar (jika email confirmation tidak aktif atau sudah dikonfirmasi)
                showNotification('Pendaftaran berhasil dan Anda sudah login!', 'success');
                // Redirect ke homepage setelah notifikasi muncul sebentar
                setTimeout(() => {
                    window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
                }, 1500); // Delay 1.5 detik
            } else {
                // Email confirmation diperlukan
                showNotification('Pendaftaran berhasil! Mohon cek email Anda untuk konfirmasi.', 'success', 5000);
                // Beralih ke form login setelah notifikasi muncul sebentar
                setTimeout(() => {
                    showLoginTab(); // Beralih ke tab/form login
                    // Opsional: kosongkan form pendaftaran
                    const registerForm = document.getElementById('register');
                    if (registerForm) registerForm.reset();
                }, 1500); // Delay 1.5 detik
            }

            // Opsional: Trigger pembuatan baris profil di tabel public.profiles di sini
            // Atau lebih baik menggunakan Database Trigger di Supabase saat row auth.users dibuat
            if (data.user && data.user.id) {
                createProfileEntry(data.user.id, fullName, username, whatsapp); // Panggil fungsi untuk membuat entri profil
            }


        } else {
            // Kasus ini seharusnya jarang terjadi jika tidak ada error
            console.error('Registration failed: No user data returned from Supabase Auth.', data);
            showNotification('Pendaftaran gagal: Tidak ada data pengguna.', 'error');
        }
    }; // Akhir handleRegisterSubmit

    // Fungsi bantu untuk membuat entri di tabel profiles setelah daftar (opsional jika pakai DB Trigger)
    async function createProfileEntry(userId, fullName, username, whatsapp) {
        try {
            const {
                data,
                error
            } = await supabase
                .from('profiles')
                .insert([{
                    id: userId, // ID profiles = ID auth.users
                    full_name: fullName,
                    username: username,
                    whatsapp: whatsapp,
                    // avatar_url dan updated_at bisa null awalnya
                }]);
            if (error) {
                console.error('Error creating profile entry:', error);
                // Tampilkan notifikasi error, tapi jangan hentikan proses pendaftaran jika pendaftaran Auth berhasil
                showNotification('Pendaftaran berhasil, tapi gagal membuat data profil awal.', 'warning', 5000);
            } else {
                console.log('Profile entry created successfully:', data);
            }
        } catch (e) {
            console.error('Exception while creating profile entry:', e);
            showNotification('Pendaftaran berhasil, tapi terjadi error saat membuat data profil awal.', 'warning', 5000);
        }
    }


    // --- Fungsi untuk memasang kembali event listener form login setelah konten diubah (atau saat setup awal) ---
    // Dipanggil saat kembali dari form lupa password/reset password ke form login awal
    // dan saat halaman pertama kali dimuat JIKA BELUM LOGIN
    function attachLoginFormListeners() {
        // Dapatkan elemen form login awal yang ada di HTML
        const loginForm = document.getElementById('login');
        // Dapatkan elemen link "Lupa Password?" di dalam form login
        const forgotPasswordLinkInForm = document.querySelector('#loginForm .forgot-password'); // Menggunakan selector spesifik

        // Pasang event listener submit untuk form login HANYA SATU KALI
        if (loginForm) {
            // Hapus listener sebelumnya jika ada untuk mencegah double-binding
            loginForm.removeEventListener('submit', handleLoginSubmit); // Pastikan handler sama
            loginForm.addEventListener('submit', handleLoginSubmit); // Pasang handler submit form login

            // Pasang kembali event listener lihat password untuk form login
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form with ID 'login' not found in attachLoginFormListeners.");
        }

        // Pasang kembali event listener link "Lupa Password?" di dalam form
        if (forgotPasswordLinkInForm) {
            // Hapus listener sebelumnya jika ada
            forgotPasswordLinkInForm.removeEventListener('click', handleForgotPasswordClick); // Pastikan handler sama
            forgotPasswordLinkInForm.addEventListener('click', handleForgotPasswordClick); // Pasang handler link lupa password
        } else {
            console.warn("Forgot password link with class 'forgot-password' not found inside #loginForm.");
        }
    }

    // Fungsi handler terpisah untuk SUBMIT form daftar (Dipasang saat initial load JIKA BELUM LOGIN)
    // Dapatkan elemen form daftar awal saat DOMContentLoaded
    const initialRegisterForm = document.getElementById('register');
    if (initialRegisterForm) {
        // Pasang event listener submit untuk form daftar HANYA SATU KALI
        // Hapus listener sebelumnya jika ada
        initialRegisterForm.removeEventListener('submit', handleRegisterSubmit); // Pastikan handler sama
        initialRegisterForm.addEventListener('submit', handleRegisterSubmit); // Gunakan handler terpisah

        // Pasang lihat password untuk form daftar (input awal)
        setupPasswordToggle('showRegisterPassword', 'registerPassword');
        setupPasswordToggle('showRegisterConfirmPassword', 'registerConfirmPassword');

    } else {
        console.warn("Register form with ID 'register' not found on initial load.");
    }

    // --- INITIAL SETUP saat DOMContentLoaded (Jika Belum Login) ---
    // Fungsi ini dijalankan hanya jika cek sesi Supabase di awal tidak menemukan sesi aktif
    function initializeFormsAndTabs() {
        // Pastikan elemen tab dan kontainer form ada
        if (!loginTab || !registerTab || !loginFormDiv || !registerFormDiv) {
            console.error("HTML structure for tabs or forms not complete.");
            // Tampilkan notifikasi atau pesan error di UI jika elemen penting tidak ditemukan
            showNotification('Error: Struktur halaman tidak lengkap.', 'error');
            return;
        }

        // Pasang listener submit form login awal dan link lupa password di dalamnya
        attachLoginFormListeners();

        // Sembunyikan form register dan tampilkan form login menggunakan class 'hidden'
        registerFormDiv.classList.add('hidden');
        loginFormDiv.classList.remove('hidden');

        // Pastikan tab login aktif secara visual
        loginTab.classList.add('active');
        registerTab.classList.remove('active');

        // Pastikan form konten login spesifik juga terlihat
        showFormContent('loginForm');

        console.log("Halaman login/daftar diinisialisasi.");
    }

    // Panggil fungsi inisialisasi form dan tab HANYA JIKA tidak ada sesi aktif (ini dilakukan di awal script)
    // if (!session) initializeFormsAndTabs(); // <-- Sudah diimplementasikan di awal script setelah cek sesi

}); // Akhir DOMContentLoaded