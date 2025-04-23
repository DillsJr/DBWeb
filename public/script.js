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
// const loginFormElement = document.getElementById('login'); // Form elemen <form> login
// const registerFormElement = document.getElementById('register'); // Form elemen <form> register
const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // Link "Lupa Password?"
const forgotPasswordFormContainer = document.getElementById('forgotPasswordForm'); // Container form Lupa Password
const switchToLoginFromForgotLink = document.getElementById('switchToLoginFromForgot'); // Link Kembali ke Login dari form Lupa Password
const switchToLoginLink = document.getElementById('switchToLogin'); // Link Kembali ke Login dari form Register
const switchToRegisterLink = document.getElementById('switchToRegister'); // Link Daftar Sekarang dari form Login


// --- Fungsi Notifikasi ---
function showNotification(message, type = 'info') {
    // Pastikan elemen notifikasi ditemukan sebelum digunakan
    if (!notification) {
        console.error("Notification element with ID 'custom-notification' not found.");
        // Fallback ke alert jika elemen tidak ada (opsional)
        // alert(message);
        return;
    }
    notification.textContent = message;
    notification.className = 'custom-notification ' + type; // Tambahkan kelas 'info', 'success', atau 'error'
    notification.style.display = 'block'; // Penting: Menampilkan elemen notifikasi
    // Jika Anda ingin animasi fade-in/slide-down, di sini Anda akan menambah/menghapus kelas CSS
    // yang mengontrol opacity dan top (misal: notification.classList.add('show');)
    // Tapi dengan perubahan CSS di styles.css, display: block sudah cukup untuk membuatnya terlihat.


    // Sembunyikan notifikasi setelah beberapa detik
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
    // Jika Anda menggunakan kelas CSS untuk animasi, di sini Anda akan menghapus kelas tersebut
    // (misal: notification.classList.remove('show');)
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
        // (Ini berguna jika logout terjadi karena sesi expired atau dari tab lain saat di homepage)
        if (window.location.pathname !== '/index.html') { // Hanya redirect jika tidak di index.html
            console.log('Redirecting back to index.html after SIGNED_OUT event.');
            // Gunakan window.location.replace agar tidak bisa kembali ke homepage via tombol back
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
            // Ini menggantikan redireksi otomatis di onAuthStateChange di halaman login
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

            // OPSIONAL: REDIREKSI SETELAH DAFTAR BERHASIL
            // Saat ini tidak redirect otomatis setelah daftar. Biarkan user baca notifikasi.
            // Anda bisa aktifkan baris di bawah jika ingin langsung redirect:
            /*
            console.log("Pendaftaran berhasil. Redirect ke homepage.html");
             setTimeout(() => { // Beri sedikit delay agar notifikasi sempat terlihat (opsional)
                 redirectToHomepage(); // Panggil fungsi redirect ke homepage
             }, 50); // Delay 50ms
             */

            // Reset form setelah berhasil
            const registerFormElement = document.getElementById('register'); // Ambil elemen form
            if (registerFormElement) registerFormElement.reset();
            // hideNotification(); // Jangan sembunyikan notifikasi sukses secara instan

            // Opsional: alihkan kembali ke tab login
            // switchFormView('login'); // Asumsi ada fungsi switchFormView
        }
    } catch (e) {
        console.error('Error tidak terduga saat pendaftaran:', e);
        showNotification('Terjadi error tidak terduga saat pendaftaran.', 'error');
    }
}

// --- Logika Lupa Password (Form terpisah) ---
async function handleForgotPasswordSubmit(event) {
    event.preventDefault(); // Mencegah reload halaman
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    const emailInput = document.getElementById('forgotEmail'); // Ambil email dari form lupa password
    const email = emailInput ? emailInput.value : '';

    if (!email) {
        showNotification('Email harus diisi.', 'error');
        return;
    }

    console.log('Memproses permintaan reset password (menggunakan Supabase Authentication)...');
    showNotification('Mengirim link reset password...', 'info');

    try {
        // URL yang akan dituju pengguna setelah mengklik link di email
        // PASTIKAN URL INI TERDAFTAR DI SUPABASE AUTH SETTINGS > Redirect URLs
        // Gunakan window.location.origin untuk mendapatkan http://localhost atau https://nama-anda.vercel.app
        const redirectUrl = window.location.origin + '/reset-password.html'; // Sesuaikan path jika perlu (misal: /DBWeb/public/reset-password.html)

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


// --- Logika Ganti Tab dan Tampilkan Form (Disesuaikan untuk Absolute Positioning) ---

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
        }
    };

    // Pastikan elemen-elemen utama ada
    if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer || !forgotPasswordFormContainer) {
        console.error("Gagal beralih tampilan form: Elemen UI utama tidak ditemukan.");
        showNotification('Error: Struktur halaman tidak lengkap untuk beralih tampilan. Cek console.', 'error');
        return;
    }

    hideNotification(); // Sembunyikan notifikasi saat beralih tampilan

    for (const id in views) {
        const view = views[id];
        const isActive = id === viewId;

        // Atur status active pada tab
        if (view.tab) {
            if (isActive) view.tab.classList.add('active');
            else view.tab.classList.remove('active');
        }

        // Atur visibilitas container form menggunakan kelas hidden-abs
        if (view.formContainer) {
            if (isActive) {
                view.formContainer.classList.remove('hidden-abs');
                // Jika pakai transisi di CSS dengan opacity/transform, bisa tambahkan kelas 'show' di sini
                // view.formContainer.classList.add('show');
                view.formContainer.style.display = 'block'; // Pastikan display block untuk absolute positioning
            } else {
                view.formContainer.classList.add('hidden-abs');
                // Jika pakai transisi, hapus kelas 'show' di sini
                // view.formContainer.classList.remove('show');
                // Beri sedikit waktu untuk transisi (jika ada) sebelum set display: none
                setTimeout(() => {
                    view.formContainer.style.display = 'none'; // Sembunyikan setelah transisi
                }, 300); // Sesuaikan delay dengan durasi transisi CSS
            }
        }
    }
    console.log(`Beralih tampilan ke: ${viewId}.`);

    // Opsional: fokuskan input pertama di form yang ditampilkan
    // const firstInput = document.querySelector(`#${viewId} input:not([type="hidden"])`);
    // if(firstInput) firstInput.focus();
}


// --- Memasang Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing login/register page...");

    // Mendapatkan referensi elemen-elemen UI utama (Pastikan ID ada di HTML)
    const loginTabElement = document.getElementById('loginTab');
    const registerTabElement = document.getElementById('registerTab');
    const loginFormContainerElement = document.getElementById('loginForm');
    const registerFormContainerElement = document.getElementById('registerForm');
    const forgotPasswordLinkElement = document.getElementById('forgotPasswordLink');
    const forgotPasswordFormContainerElement = document.getElementById('forgotPasswordForm'); // Ganti ke container
    const switchToLoginFromForgotLinkElement = document.getElementById('switchToLoginFromForgot');
    const switchToLoginLinkElement = document.getElementById('switchToLogin');
    const switchToRegisterLinkElement = document.getElementById('switchToRegister');

    // Ambil form elemen <form> di dalam container
    const loginFormElement = loginFormContainerElement ? loginFormContainerElement.querySelector('form') : null;
    const registerFormElement = registerFormContainerElement ? registerFormContainerElement.querySelector('form') : null;
    const forgotPasswordFormElement = forgotPasswordFormContainerElement ? forgotPasswordFormContainerElement.querySelector('form') : null;


    // --- Cek Kelengkapan Struktur HTML KRITIS ---
    // Memeriksa apakah semua elemen utama yang dicari oleh script DITEMUKAN di DOM.
    // Jika ada yang tidak ditemukan, script tidak bisa berjalan dengan benar.
    // Jika cek ini gagal, log error akan muncul di console.
    if (!loginTabElement || !registerTabElement || !loginFormContainerElement || !registerFormContainerElement || !forgotPasswordLinkElement || !forgotPasswordFormContainerElement || !switchToLoginFromForgotLinkElement || !switchToLoginLinkElement || !switchToRegisterLinkElement || !loginFormElement || !registerFormElement || !forgotPasswordFormElement) {
        console.error("HTML structure for forms, tabs, or links is not complete. Cannot initialize.");
        showNotification('Error: Struktur halaman tidak lengkap untuk inisialisasi. Cek console.', 'error');
        // Jangan return; di sini agar log lain (seperti Supabase init) bisa muncul
    } else {
        console.log("HTML structure check passed. All required elements found. Attaching listeners...");


        // Pasang listener untuk ganti tab / form view
        loginTabElement.addEventListener('click', () => switchFormView('login'));
        registerTabElement.addEventListener('click', () => switchFormView('register'));
        forgotPasswordLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('forgotPassword');
        });
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


        // Pasang listener submit untuk form login, register, dan lupa password
        loginFormElement.addEventListener('submit', handleLoginSubmit);
        registerFormElement.addEventListener('submit', handleRegisterSubmit);
        forgotPasswordFormElement.addEventListener('submit', handleForgotPasswordSubmit);


        // Setup toggle password untuk form login dan register
        setupPasswordToggle('showLoginPassword', 'loginPassword');
        setupPasswordToggle('showPassword', 'password');
        setupPasswordToggle('showConfirmPassword', 'confirmPassword');
        // Setup toggle password untuk form lupa password jika ada input password baru di sana (biasanya tidak)
        // setupPasswordToggle('showForgotNewPassword', 'forgotNewPassword');


        // Logika inisialisasi tampilan form (default ke login)
        switchFormView('login'); // Mulai dengan menampilkan tab login


        console.log("Halaman login/daftar diinisialisasi lengkap.");
    }


}); // Akhir DOMContentLoaded

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