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

// Menginisialisasi Supabase Client dengan konfigurasi DEFAULT (sesi persisten menggunakan localStorage)
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey); // Menghapus blok { auth: {...} }

console.log("Supabase client initialized with DEFAULT (persistent) session.");


// --- Elemen UI ---
const notification = document.getElementById('custom-notification');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginFormContainer = document.getElementById('loginForm'); // Container form login
const registerFormContainer = document.getElementById('registerForm'); // Container form register

// Elemen untuk alur Lupa Password (Email + Link)
const forgotPasswordFormContainer = document.getElementById('forgotPasswordForm'); // Container utama form lupa password
const forgotPasswordEmailForm = document.getElementById('forgotPasswordEmailForm'); // Form elemen <form> lupa password

const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // Link "Lupa Password?" di form login
const switchToLoginFromForgotLink = document.getElementById('switchToLoginFromForgot'); // Link Kembali ke Login dari form lupa password
const switchToLoginLink = document.getElementById('switchToLogin'); // Link Kembali ke Login dari form Register
const switchToRegisterLink = document.getElementById('switchToRegister'); // Link Daftar Sekarang dari form Login

// Input field spesifik untuk alur reset
const forgotEmailInput = document.getElementById('forgotEmail'); // Input email di form lupa password


// --- Fungsi Notifikasi ---
function showNotification(message, type = 'info') {
    // Pastikan elemen notifikasi ditemukan sebelum digunakan
    if (!notification) {
        console.error("Notification element with ID 'custom-notification' not found.");
        return;
    }
    notification.textContent = message;
    notification.className = 'custom-notification ' + type; // Tambahkan kelas 'info', 'success', atau 'error'
    notification.style.display = 'block'; // Penting: Menampilkan elemen notifikasi

    setTimeout(() => {
        hideNotification();
    }, 5000); // Notifikasi tampil selama 5 detik
}

function hideNotification() {
    // Pastikan elemen notifikasi ditemukan sebelum digunakan
    if (!notification) {
        console.warn("Notification element with ID 'custom-notification' not found for hiding.");
        return;
    }
    notification.style.display = 'none'; // Penting: Menyembunyikan elemen notifikasi
}


// --- Fungsi Redirect ke Halaman Login/Homepage (Digunakan di berbagai handler) ---
function redirectToLogin() {
    console.log("Redirecting to login page...");
    window.location.replace('/index.html'); // Ganti dengan path halaman login Anda
}

function redirectToHomepage() {
    console.log("Redirecting to homepage...");
    window.location.replace('/homepage.html'); // Ganti dengan path halaman homepage Anda
}


// --- Logika Cek Status Login Awal (Saat Halaman Dimuat) ---
// Listener onAuthStateChange tetap ada, tetapi TIDAK akan melakukan redirect otomatis
// saat event SIGNED_IN ditemukan secara pasif di halaman login (index.html).
// Redireksi HANYA terjadi setelah submit form login/daftar berhasil.
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth State Change:', event, session);

    // Logika tambahan untuk SIGNED_OUT (opsional, homepage.js juga menangani ini)
    if (event === 'SIGNED_OUT') {
        console.log('Supabase event: SIGNED_OUT.');
        // Pastikan pengguna ada di halaman login/daftar setelah logout
        if (window.location.pathname !== '/index.html') { // Hanya redirect jika tidak di index.html
            console.log('Redirecting back to index.html after SIGNED_OUT event.');
            redirectToLogin();
        }
    }
});


// --- Logika Toggle Password ---
function setupPasswordToggle(checkboxId, passwordInputId) {
    const checkbox = document.getElementById(checkboxId);
    const passwordInput = document.getElementById(passwordInputId);

    if (checkbox && passwordInput) {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                passwordInput.type = 'text';
            } else {
                passwordInput.type = 'password';
            }
        });
    } else {
        console.warn(`Checkbox (${checkboxId}) or password input (${passwordInputId}) not found for toggle.`);
    }
}


// --- Logika Login ---
async function handleLoginSubmit(event) {
    event.preventDefault(); // Mencegah reload halaman
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
        showNotification('Email dan password harus diisi.', 'error');
        return;
    }

    console.log('Memproses login (menggunakan Supabase Authentication)...');
    showNotification('Memproses login...', 'info');

    try {
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
            showNotification('Error login: ' + error.message, 'error');
        } else { // <--- Ini blok yang dijalankan saat login berhasil
            console.log('Login Supabase berhasil:', data);
            showNotification('Login berhasil!', 'success');

            // REDIREKSI EKSPLISIT SETELAH LOGIN BERHASIL
            console.log("Login berhasil. Redirect ke homepage.html");
            // Beri sedikit delay agar notifikasi sukses sempat terlihat (opsional)
            setTimeout(() => {
                redirectToHomepage(); // Panggil fungsi redirect ke homepage
            }, 50); // Delay 50ms
        }
    } catch (e) {
        console.error('Error tidak terduga saat login:', e);
        showNotification('Terjadi error tidak terduga saat login.', 'error');
    }
}


// --- Logika Pendaftaran (Register) ---
async function handleRegisterSubmit(event) {
    event.preventDefault(); // Mencegah reload halaman
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const fullNameInput = document.getElementById('fullName'); // Ambil fullName
    const usernameInput = document.getElementById('username'); // Ambil username
    const whatsappInput = document.getElementById('whatsapp'); // Ambil whatsapp

    const email = emailInput ? emailInput.value : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
    const fullName = fullNameInput ? fullNameInput.value : '';
    const username = usernameInput ? usernameInput.value : '';
    const whatsapp = whatsappInput ? whatsappInput.value : '';


    if (!email || !password || !confirmPassword || !fullName || !username || !whatsapp) {
        showNotification('Semua field harus diisi.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Password dan konfirmasi password tidak cocok.', 'error');
        return;
    }

    console.log('Memproses pendaftaran (menggunakan Supabase Authentication)...');
    showNotification('Memproses pendaftaran...', 'info');

    try {
        // Panggil fungsi signUp dari Supabase Auth
        const {
            data,
            error
        } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: { // Tambahkan metadata pengguna di sini
                data: {
                    full_name: fullName,
                    username: username,
                    whatsapp: whatsapp,
                    // Anda bisa tambahkan field metadata lain di sini
                },
                // Jika email confirmation diaktifkan di Supabase, tambahkan:
                // emailRedirectTo: 'URL_HALAMAN_VERIFIKASI_EMAIL_ANDA'
                // (misal: URL homepage Anda)
            }
        });

        if (error) {
            console.error('Error pendaftaran Supabase:', error.message);
            showNotification('Error pendaftaran: ' + error.message, 'error');
        } else {
            console.log('Pendaftaran Supabase berhasil:', data);
            // Pesan sukses umum untuk keamanan (tidak memberitahu apakah email terdaftar atau tidak)
            showNotification('Pendaftaran berhasil! Silahkan cek email/nomor Anda untuk verifikasi jika diperlukan.', 'success');

            // Reset form setelah berhasil
            const registerFormElement = document.getElementById('register'); // Ambil elemen form
            if (registerFormElement) registerFormElement.reset();
        }
    } catch (e) {
        console.error('Error tidak terduga saat pendaftaran:', e);
        showNotification('Terjadi error tidak terduga saat pendaftaran.', 'error');
    }
}

// --- Logika Lupa Password (Email + Link) ---
async function handleForgotPasswordSubmit(event) { // Nama fungsi kembali seperti semula
    event.preventDefault(); // Mencegah reload halaman
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    const email = forgotEmailInput ? forgotEmailInput.value : '';

    if (!email) {
        showNotification('Email harus diisi.', 'error');
        return;
    }

    console.log('Memproses permintaan reset password (menggunakan Supabase Authentication)...');
    showNotification('Mengirim link reset password...', 'info');

    try {
        // URL yang akan dituju pengguna setelah mengklik link di email
        // KRITIS: PASTIKAN URL INI TERDAFTAR DI SUPABASE AUTH SETTINGS > Redirect URLs
        // Gunakan window.location.origin untuk mendapatkan http://localhost atau https://nama-anda.vercel.app
        // Saat deploy, Anda MUNGKIN PERLU mengganti window.location.origin
        // dengan string URL publik domain Anda (misal: 'https://aplikasi-saya.com')
        // Pastikan '/reset-password.html' adalah path yang benar ke halaman reset password Anda
        const redirectUrl = window.location.origin + '/reset-password.html';

        console.log("Mengirim link reset dengan Redirect URL:", redirectUrl); // Log URL yang dikirim

        // Panggil fungsi resetPasswordForEmail dari Supabase Auth
        const {
            error
        } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        if (error) {
            console.error('Error reset password Supabase:', error.message);
            showNotification('Error: ' + error.message, 'error');
        } else {
            console.log('Link reset password berhasil dikirim.');
            // Pesan sukses umum untuk keamanan (tidak memberitahu apakah email terdaftar atau tidak)
            showNotification('Jika email terdaftar, instruksi reset telah dikirim.', 'success');
            // Opsional: Kembali ke form login setelah sukses
            // switchFormView('login'); // Asumsi ada fungsi switchFormView
        }
    } catch (e) {
        console.error('Error tidak terduga saat reset password:', e);
        showNotification('Terjadi error tidak terduga saat reset password.', 'error');
    }
}


// --- Logika Ganti Tab dan Tampilkan Form (Disesuaikan untuk Email + Link Flow) ---

// Fungsi helper untuk beralih ke tab/form tertentu
function switchFormView(viewId) {
    const views = {
        login: {
            tab: loginTab,
            formContainer: loginFormContainer
        },
        register: {
            tab: registerTab,
            formContainer: registerFormContainer
        },
        forgotPassword: {
            tab: null,
            formContainer: forgotPasswordFormContainer
        } // Hanya satu tampilan untuk lupa password (email)
    };

    // Pastikan elemen-elemen utama ditemukan sebelum digunakan
    if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer || !forgotPasswordFormContainer) {
        console.error("Gagal beralih tampilan form: Elemen UI utama tidak ditemukan.");
        showNotification('Error: Struktur halaman tidak lengkap untuk beralih tampilan. Cek console.', 'error');
        return;
    }

    hideNotification(); // Sembunyikan notifikasi saat beralih tampilan

    for (const id in views) {
        const view = views[id];
        const isActive = id === viewId;

        // Atur status active pada tab (hanya untuk Login dan Register)
        if (view.tab) {
            if (isActive) view.tab.classList.add('active');
            else view.tab.classList.remove('active');
        }

        // Atur visibilitas container form utama
        if (view.formContainer) {
            if (isActive) {
                view.formContainer.classList.remove('hidden-abs');
                view.formContainer.style.display = 'flex'; // Tampilkan container utama dengan flex (sesuai styles.css)
            } else {
                view.formContainer.classList.add('hidden-abs');
                // Delay display: none agar transisi (jika ada) selesai
                setTimeout(() => {
                    view.formContainer.style.display = 'none';
                }, 300); // Sesuaikan delay dengan durasi transisi CSS
            }
        }
    }
    console.log(`Beralih tampilan ke: ${viewId}.`);

    // Opsional: fokuskan input pertama di form yang ditampilkan
    // Tambahkan logika fokus di sini jika diinginkan
}


// --- Memasang Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing login/register page...");

    // Mendapatkan referensi elemen-elemen UI utama (Pastikan ID ada di HTML)
    const loginTabElement = document.getElementById('loginTab');
    const registerTabElement = document.getElementById('registerTab');
    const loginFormContainerElement = document.getElementById('loginForm');
    const registerFormContainerElement = document.getElementById('registerForm');

    // Elemen lupa password
    const forgotPasswordFormContainerElement = document.getElementById('forgotPasswordForm'); // Container utama form lupa password
    const forgotPasswordEmailFormElement = document.getElementById('forgotPasswordEmailForm'); // Form elemen <form> lupa password

    const forgotPasswordLinkElement = document.getElementById('forgotPasswordLink');
    const switchToLoginFromForgotLinkElement = document.getElementById('switchToLoginFromForgot');
    const switchToLoginLinkElement = document.getElementById('switchToLogin');
    const switchToRegisterLinkElement = document.getElementById('switchToRegister');

    // Input field spesifik
    const forgotEmailInputElement = document.getElementById('forgotEmail');


    // --- Cek Kelengkapan Struktur HTML KRITIS ---
    // Melakukan cek dasar apakah semua elemen yang dibutuhkan ditemukan di DOM
    if (!loginTabElement || !registerTabElement || !loginFormContainerElement || !registerFormContainerElement || !forgotPasswordLinkElement || !forgotPasswordFormContainerElement || !forgotPasswordEmailFormElement || !switchToLoginFromForgotLinkElement || !switchToLoginLinkElement || !switchToRegisterLinkElement || !forgotEmailInputElement) {
        console.error("HTML structure for forms, tabs, or links is not complete. Cannot initialize.");
        showNotification('Error: Struktur halaman tidak lengkap untuk inisialisasi. Cek console.', 'error');
        // Tidak melempar error atau return di sini agar pesan error lain di konsol bisa muncul,
        // tapi fungsi utama mungkin tidak berjalan.
    } else {
        console.log("HTML structure check passed. All required elements found. Attaching listeners...");

        // Pasang listener untuk ganti tab / form view
        loginTabElement.addEventListener('click', () => switchFormView('login'));
        registerTabElement.addEventListener('click', () => switchFormView('register'));

        // Listener untuk link Lupa Password (beralih ke form email)
        forgotPasswordLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('forgotPassword'); // Beralih ke tampilan lupa password
        });

        // Listener untuk link Kembali ke Login
        switchToLoginFromForgotLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('login');
        });
        switchToLoginLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('login');
        });
        switchToRegisterLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('register');
        });


        // Pasang listener submit untuk form login dan register
        const loginFormElement = loginFormContainerElement.querySelector('form'); // Ambil form elemen <form> di dalam container
        const registerFormElement = registerFormContainerElement.querySelector('form'); // Ambil form elemen <form> di dalam container

        if (loginFormElement) loginFormElement.addEventListener('submit', handleLoginSubmit);
        if (registerFormElement) registerFormElement.addEventListener('submit', handleRegisterSubmit);

        // Pasang listener submit untuk form email lupa password
        if (forgotPasswordEmailFormElement) forgotPasswordEmailFormElement.addEventListener('submit', handleForgotPasswordSubmit);


        // Setup toggle password
        setupPasswordToggle('showLoginPassword', 'loginPassword'); // Login
        setupPasswordToggle('showPassword', 'password'); // Register Password
        setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // Register Confirm Password


        // Logika inisialisasi tampilan form (default ke login)
        switchFormView('login'); // Mulai dengan menampilkan tab login


        console.log("Halaman login/daftar diinisialisasi lengkap.");
    }
});

// Optional: Listener onAuthStateChange jika perlu redirect otomatis saat sesi ditemukan di index.html
/*
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session);
    if (event === 'INITIAL_SESSION' && session) {
         console.log('Initial session found, redirecting to homepage...');
         redirectToHomepage();
    }
     if (event === 'SIGNED_IN' && session && window.location.pathname === '/index.html') {
          console.log('Signed in event detected on login page, redirecting...');
          redirectToHomepage();
     }
     // Logika SIGNED_OUT sudah ditangani di atas
});
*/