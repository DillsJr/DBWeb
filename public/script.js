// public/script.js - Script untuk halaman login/daftar (Integrasi Supabase Authentication)

// --- KONFIGURASI SUPABASE ---
// !!! PERINGATAN KRITIS: Menyimpan URL dan ANON KEY secara langsung di kode klien yang publik
// TIDAK AMAN untuk aplikasi produksi. Kunci ini hanya boleh memiliki akses terbatas
// (misalnya, hanya untuk Supabase Auth). Untuk operasi database yang sensitif,
// gunakan Row Level Security (RLS) dan/atau Edge Functions.
// Idealnya, gunakan environment variables yang diinjeksikan saat build atau
// server-side logic untuk mengelola kredensial ini, terutama service_role key.
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co'; // GANTI dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // !!! GANTI DENGAN ANON KEY SUPABASE YANG BENAR !!!

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized.");

// --- Logika Cek Status Login dengan Supabase ---
// Listener ini akan berjalan setiap kali status autentikasi berubah (login, logout, dll.)
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth State Change:', event, session);

    // Tangani redirect saat login berhasil atau sesi ditemukan
    // Ini adalah cara standar dan disarankan untuk menangani redirect
    if (event === 'SIGNED_IN' && session) { // Memeriksa event SIGNED_IN
        console.log("Supabase event: SIGNED_IN. Redirect ke homepage.html");
        // Pastikan '/homepage.html' adalah path homepage Anda yang benar
        window.location.replace('/homepage.html'); // Ini baris yang melakukan redireksi
    } else if (event === 'SIGNED_OUT') {
        // Tangani notifikasi saat pengguna logout dan kembali ke halaman ini
        console.log("Supabase event: SIGNED_OUT. Pengguna telah logout.");
        // showNotification('Anda telah berhasil logout.', 'success', 3000); // Notifikasi logout bisa diaktifkan jika perlu
        // Tidak perlu redirect di sini karena logout biasanya memuat ulang halaman login
        // atau pengguna memang diarahkan kembali ke sini.
    } else {
        console.log("Tidak ada sesi Supabase atau event lain yang memicu redirect.");
    }
});


document.addEventListener('DOMContentLoaded', async () => {

    // Mendapatkan elemen UI yang dibutuhkan
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormContainer = document.getElementById('loginForm');
    const registerFormContainer = document.getElementById('registerForm');

    const loginFormElement = document.getElementById('login');
    const registerFormElement = document.getElementById('register');

    const notificationElement = document.getElementById('custom-notification');

    // Variabel untuk menyimpan HTML asli form login sebelum diganti form lupa password
    let originalLoginFormContentHTML = '';
    if (loginFormElement) {
        originalLoginFormContentHTML = loginFormElement.outerHTML;
    } else {
        console.error("Login form element with ID 'login' not found on initial load.");
        // Jika form login tidak ditemukan, simpan konten kontainer sebagai fallback
        if (loginFormContainer) {
            originalLoginFormContentHTML = loginFormContainer.innerHTML;
        }
    }


    // --- Fungsi untuk Menampilkan Notifikasi Kustom ---
    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) {
            console.error("Notification element not found!");
            return;
        }
        // Hapus timeout notifikasi sebelumnya jika ada
        if (notificationElement.timeoutId) {
            clearTimeout(notificationElement.timeoutId);
        }

        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type; // Set kelas tipe (success, error, info)
        notificationElement.classList.add('show'); // Tampilkan notifikasi dengan transisi

        // Set timeout untuk menyembunyikan notifikasi
        notificationElement.timeoutId = setTimeout(() => {
            notificationElement.classList.remove('show');
            // Tambahkan event listener untuk menyembunyikan elemen setelah transisi selesai
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) {
                    // Sembunyikan elemen secara fisik (display: none) setelah transisi
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks setelah disembunyikan
                }
                // Hapus listener setelah digunakan
                notificationElement.removeEventListener('transitionend', handler);
            });
        }, duration);
        // Pastikan elemen terlihat saat class 'show' ditambahkan
        notificationElement.style.display = ''; // Reset display agar transisi opacity/visibility berfungsi
    }


    // --- Fungsi untuk Menampilkan Tab Login ---
    function showLoginTab() {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        // Pastikan kontainer form login/register ditemukan sebelum mencoba mengganti kelas
        if (loginFormContainer && registerFormContainer) {
            registerFormContainer.classList.add('hidden');
            loginFormContainer.classList.remove('hidden');

            // Pastikan form login asli ditampilkan dan form lupa password disembunyikan
            const currentLoginFormElement = document.getElementById('login');
            const forgotPasswordForm = document.getElementById('forgotPasswordForm');

            if (currentLoginFormElement) currentLoginFormElement.classList.remove('hidden');
            if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden'); // Sembunyikan form lupa password jika ada

            // Pasang kembali listener form login setelah form ditampilkan
            attachLoginFormListeners();

        } else {
            console.error("Login or Register form container not found for showLoginTab.");
        }

        showNotification(''); // Sembunyikan notifikasi saat beralih tab/form
    }

    // --- Fungsi untuk Menampilkan Tab Daftar ---
    function showRegisterTab() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        // Pastikan kontainer form login/register ditemukan
        if (loginFormContainer && registerFormContainer) {
            loginFormContainer.classList.add('hidden');
            registerFormContainer.classList.remove('hidden');

            // Pastikan form daftar asli ditampilkan
            const currentRegisterFormElement = document.getElementById('register');
            if (currentRegisterFormElement) currentRegisterFormElement.classList.remove('hidden');


        } else {
            console.error("Login or Register form container not found for showRegisterTab.");
        }

        showNotification(''); // Sembunyikan notifikasi saat beralih tab/form
    }


    // --- Menambahkan Event Listener untuk Tab dan Link Switch Form ---
    if (loginTab) loginTab.addEventListener('click', showLoginTab);
    if (registerTab) registerTab.addEventListener('click', showRegisterTab);

    const switchToRegisterLink = document.getElementById('switchToRegister');
    const switchToLoginLink = document.getElementById('switchToLogin');

    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah aksi default link
        showRegisterTab();
    });

    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah aksi default link
        showLoginTab();
    });


    // --- Fungsi untuk Mengatur Toggle Password ---
    function setupPasswordToggle(checkboxId, passwordInputId) {
        const checkbox = document.getElementById(checkboxId);
        const passwordInput = document.getElementById(passwordInputId);

        if (checkbox && passwordInput) {
            // Atur tipe input saat halaman dimuat berdasarkan status awal checkbox
            passwordInput.type = checkbox.checked ? 'text' : 'password';

            // Tambahkan listener untuk mengubah tipe input saat checkbox berubah
            // Gunakan handler terpisah agar bisa dihapus dan dipasang kembali
            checkbox.removeEventListener('change', passwordToggleHandler);
            checkbox.addEventListener('change', passwordToggleHandler);
        } else {
            console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}".`);
        }
    }

    // Handler terpisah untuk toggle password agar bisa dihapus dan dipasang kembali
    function passwordToggleHandler() {
        const passwordInputId = this.id === 'showLoginPassword' ? 'loginPassword' :
            this.id === 'showPassword' ? 'password' : 'confirmPassword';
        const passwordInput = document.getElementById(passwordInputId);
        if (passwordInput) {
            passwordInput.type = this.checked ? 'text' : 'password';
        }
    }


    // --- Fungsi untuk Menangani Klik Link Lupa Password ---
    const handleForgotPasswordClick = (e) => {
        e.preventDefault(); // Mencegah aksi default link

        if (!loginFormContainer) {
            console.error("Login form container not found for forgot password flow.");
            showNotification('Terjadi kesalahan UI. Silakan refresh.', 'error');
            return;
        }

        // Sembunyikan form login asli
        const loginFormElement = document.getElementById('login');
        if (loginFormElement) {
            originalLoginFormContentHTML = loginFormElement.outerHTML; // Simpan HTML asli sebelum dihapus
            loginFormElement.classList.add('hidden');
        } else {
            console.warn("Login form element not found when clicking Forgot Password. Using container innerHTML as fallback.");
            // Jika form login tidak ditemukan, gunakan innerHTML kontainer sebagai fallback
            originalLoginFormContentHTML = loginFormContainer.innerHTML;
        }


        // Ganti konten loginFormContainer dengan form lupa password
        loginFormContainer.innerHTML = `
            <div class="form-content" id="forgotPasswordForm">
                <h2> Lupa Password </h2>
                <p style="color: #272343; font-style: italic;"> Masukkan Email akun Anda untuk memulai proses reset password. </p>
                <form id="forgotPasswordFormElement">
                    <div class="input-group">
                        <label for="forgotPasswordEmail"> Email </label>
                        <input type="email" id="forgotPasswordEmail" placeholder="Masukan Email" required autocomplete="email">
                    </div>
                    <button type="submit"> Kirim Link Reset </button>
                    <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                </form>
             </div>
        `;

        // Dapatkan elemen form lupa password dan link kembali ke login yang baru dibuat
        const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
        const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');

        // Tambahkan listener untuk link kembali ke login
        if (switchToLoginFromForgot) {
            switchToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginFormContainer && originalLoginFormContentHTML) {
                    loginFormContainer.innerHTML = originalLoginFormContentHTML; // Kembalikan konten asli
                    attachLoginFormListeners(); // Pasang kembali listener form login
                    showNotification(''); // Sembunyikan notifikasi
                } else {
                    console.error("Failed to restore original login form content. Cannot switch back to login.");
                    showNotification('Gagal memuat form login. Silakan refresh halaman.', 'error');
                    // Alternatif: muat ulang halaman jika pengembalian konten gagal
                    // window.location.reload();
                }
            });
        } else {
            console.error("Link 'switchToLoginFromForgot' not found after injecting forgot password form.");
        }


        // Tambahkan listener untuk submit form lupa password
        if (forgotPasswordFormElement) {
            forgotPasswordFormElement.addEventListener('submit', async (e) => {
                e.preventDefault(); // Mencegah submit default

                const emailInput = document.getElementById('forgotPasswordEmail');
                if (!emailInput) {
                    console.error("Forgot password email input not found after form inject.");
                    showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
                    return;
                }
                const email = emailInput.value.trim();

                if (!email) {
                    showNotification('Email harus diisi.', 'error');
                    return;
                }

                showNotification('Mengirim link reset password...', 'info');

                // Panggil fungsi resetPasswordForEmail dari Supabase Auth
                const {
                    data,
                    error
                } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    // !!! GANTI URL INI dengan URL halaman tempat pengguna akan me-reset password mereka !!!
                    // Ini adalah halaman TERPISAH di aplikasi Anda yang akan menangani proses reset password
                    redirectTo: window.location.origin + '/reset-password.html' // Contoh: URL ke halaman reset password Anda
                });

                if (error) {
                    console.error('Error reset password Supabase:', error.message);
                    let errorMessage = 'Gagal mengirim link reset.';
                    if (error.message.includes('user not found')) {
                        errorMessage = 'Email tidak terdaftar.';
                    } else {
                        errorMessage = `Gagal mengirim link reset: ${error.message}`;
                    }
                    showNotification(errorMessage, 'error');
                } else {
                    console.log('Link reset password dikirim (cek email).', data);
                    showNotification('Jika email terdaftar, link reset telah dikirim. Cek inbox Anda.', 'success', 7000); // Notifikasi lebih lama

                    // Setelah sukses, kembali ke form login setelah jeda
                    setTimeout(() => {
                        if (loginFormContainer && originalLoginFormContentHTML) {
                            loginFormContainer.innerHTML = originalLoginFormContentHTML;
                            attachLoginFormListeners(); // Pasang kembali listener form login
                        } else {
                            console.error("Failed to restore login form after forgot password success.");
                            showNotification('Gagal memuat form login setelah reset link terkirim. Silakan refresh halaman.', 'error');
                            // window.location.reload(); // Alternatif: muat ulang halaman
                        }
                    }, 2000); // Jeda 2 detik sebelum kembali ke form login
                }
            });
        } else {
            console.error("Forgot password form element with ID 'forgotPasswordFormElement' not found after inject.");
            showNotification('Terjadi kesalahan UI. Silakan coba lagi.', 'error');
        }
    };


    // --- Fungsi untuk Menangani Submit Form Login ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit default
        console.log('Memproses login (menggunakan Supabase Authentication)...');

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (!emailInput || !passwordInput) {
            console.error("Login form inputs not found (Email or Password).");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value; // Password tidak perlu di-trim

        if (!email || !password) {
            showNotification('Email dan password harus diisi.', 'error');
            return;
        }

        showNotification('Memproses login...', 'info');

        // Panggil fungsi signInWithPassword dari Supabase Auth
        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Error login Supabase:', error.message);
            let errorMessage = 'Login gagal.';
            if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Email belum dikonfirmasi. Cek inbox Anda untuk mengaktifkan akun.';
            } else if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah.';
            } else {
                errorMessage = `Login gagal: ${error.message}`;
            }
            showNotification(errorMessage, 'error');
            // passwordInput.value = ''; // Mengosongkan field password setelah gagal login

        } else {
            console.log('Login berhasil via Supabase Auth:', data);
            showNotification('Login berhasil!', 'success', 1000);

            // Redirect akan ditangani oleh onAuthStateChange listener,
            // tetapi redirect langsung di sini bisa menjadi fallback cepat jika onAuthStateChange lambat
            window.location.replace('/homepage.html'); // !!! PASTIKAN PATH INI BENAR !!!
        }
    };


    // --- Fungsi untuk Menangani Submit Form Daftar ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault(); // Mencegah submit default
        console.log('Memproses pendaftaran (menggunakan Supabase Authentication)...');

        // Mendapatkan semua input form pendaftaran
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

        // Mengambil nilai input dan membersihkan whitespace di awal/akhir
        const fullName = fullNameInput.value.trim();
        const username = usernameInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value; // Password tidak perlu di-trim
        const confirmPassword = confirmPasswordInput.value; // Tidak perlu di-trim

        // Validasi input
        if (!fullName || !username || !whatsapp || !email || !password || !confirmPassword) {
            showNotification('Semua field harus diisi.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Password dan konfirmasi password tidak cocok.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }
        // Tambahkan validasi format email jika diperlukan (bisa menggunakan regex)
        // Contoh sederhana:
        // if (!/\S+@\S+\.\S+/.test(email)) {
        //     showNotification('Format email tidak valid.', 'error');
        //     return;
        // }


        showNotification('Memproses pendaftaran...', 'info');

        // Panggil fungsi signUp dari Supabase Auth
        const {
            data,
            error
        } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                // Menyimpan data tambahan pengguna sebagai metadata
                data: {
                    full_name: fullName,
                    username: username,
                    whatsapp: whatsapp
                    // Tambahkan field lain jika ada di tabel users Anda
                }
            }
        });

        if (error) {
            console.error('Error pendaftaran Supabase:', error.message);
            let errorMessage = 'Pendaftaran gagal.';
            if (error.message.includes('already registered')) {
                errorMessage = 'Email sudah terdaftar.';
            } else {
                errorMessage = `Pendaftaran gagal: ${error.message}`;
            }
            showNotification(errorMessage, 'error');

        } else {
            console.log('Pendaftaran berhasil via Supabase Auth:', data);

            // Cek apakah email confirmation diperlukan
            if (data && data.user && data.user.identities && data.user.identities.length > 0 && data.user.email_confirmed_at === null) {
                // Jika email confirmation aktif dan email belum dikonfirmasi
                showNotification('Pendaftaran berhasil! Cek email Anda untuk mengaktifkan akun sebelum login.', 'success', 7000);
                // Arahkan ke tab login setelah pendaftaran berhasil
                setTimeout(() => {
                    showLoginTab(); // Beralih ke form login
                    const registerForm = document.getElementById('register');
                    if (registerForm) registerForm.reset(); // Reset form daftar
                }, 1500);
            } else if (data && data.user && data.session) {
                // Skenario jika email confirmation mati (user langsung login)
                showNotification('Pendaftaran berhasil dan Anda langsung login!', 'success');
                console.log("User langsung login setelah daftar (email confirmation mati). Redirect akan ditangani.");
                // Redirect langsung jika user langsung login
                window.location.replace('/homepage.html'); // !!! OPSIONAL REDIRECT LANGSUNG SETELAH DAFTAR & LANGSUNG LOGIN !!!
            } else {
                // Skenario lain, misalnya pendaftaran berhasil tapi tidak langsung login dan tidak butuh konfirmasi email
                showNotification('Pendaftaran berhasil. Silakan coba login.', 'success');
                setTimeout(() => {
                    showLoginTab();
                    const registerForm = document.getElementById('register');
                    if (registerForm) registerForm.reset();
                }, 1500);
            }
        }
    };


    // --- Fungsi untuk Memasang Kembali Listener ke Form Login ---
    // Fungsi ini penting dipanggil setelah konten loginFormContainer diubah (misalnya setelah dari flow lupa password)
    function attachLoginFormListeners() {
        const loginFormElement = document.getElementById('login');
        // const forgotPasswordLink = document.querySelector('#login form .forgot-password'); // Query selector lama yang salah

        if (loginFormElement) {
            // Pasang kembali listener submit form login
            loginFormElement.removeEventListener('submit', handleLoginSubmit); // Hapus listener lama jika ada
            loginFormElement.addEventListener('submit', handleLoginSubmit);

            // Pasang kembali listener password toggle untuk form login
            setupPasswordToggle('showLoginPassword', 'loginPassword');

            // Pasang kembali listener untuk link lupa password
            // Cari link di dalam form login yang baru dipasang
            // BARIS PERBAIKAN: Gunakan querySelector PADA loginFormElement
            const currentForgotPasswordLink = loginFormElement.querySelector('.forgot-password');
            if (currentForgotPasswordLink) {
                currentForgotPasswordLink.removeEventListener('click', handleForgotPasswordClick); // Hapus listener lama jika ada
                currentForgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
            } else {
                console.warn("Forgot password link not found in attachLoginFormListeners.");
            }
        } else {
            console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
        }
    }


    // --- Memasang Listener Submit dan Toggle Password untuk Form Register (Dipanggil Sekali Saat DOM Loaded) ---
    if (registerFormElement) {
        registerFormElement.removeEventListener('submit', handleRegisterSubmit);
        registerFormElement.addEventListener('submit', handleRegisterSubmit);
        setupPasswordToggle('showPassword', 'password');
        setupPasswordToggle('showConfirmPassword', 'confirmPassword');
    } else {
        console.warn("Register form element with ID 'register' not found on initial load. Register functionality might not work.");
    }


    // --- Fungsi Inisialisasi Awal Halaman ---
    function initializeFormsAndTabs() {
        // Pastikan semua elemen UI utama ditemukan
        if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer) {
            console.error("HTML structure for tabs or forms not complete. Cannot initialize.");
            showNotification('Error: Struktur halaman tidak lengkap.', 'error');
            return; // Hentikan inisialisasi jika elemen utama tidak ditemukan
        }

        // Pasang listener awal untuk form login
        attachLoginFormListeners(); // Ini akan memasang submit listener dan password toggle listener untuk form login

        // Pastikan form register disembunyikan dan form login ditampilkan saat halaman pertama dimuat
        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');

        // Pastikan form login asli tidak memiliki kelas hidden (jika sebelumnya ada)
        const currentLoginFormElement = document.getElementById('login');
        if (currentLoginFormElement) currentLoginFormElement.classList.remove('hidden');

        // Pastikan form lupa password disembunyikan saat inisialisasi (jika ada di HTML awal - yang mana seharusnya tidak)
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) forgotForm.classList.add('hidden');


        console.log("Halaman login/daftar diinisialisasi.");
    }

    // Jalankan fungsi inisialisasi saat DOMContentLoaded
    initializeFormsAndTabs();


}); // Akhir DOMContentLoaded