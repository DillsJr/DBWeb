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
const loginFormContainer = document.getElementById('loginForm');
const registerFormContainer = document.getElementById('registerForm');
const loginFormElement = document.getElementById('login'); // Form dengan ID 'login'
const registerFormElement = document.getElementById('register'); // Form dengan ID 'register'
const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // Link "Lupa Password?"
const forgotPasswordFormElement = document.getElementById('forgotPasswordForm'); // Form Lupa Password dengan ID 'forgotPasswordForm'


// --- Fungsi Notifikasi ---
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = 'custom-notification ' + type; // Tambahkan kelas 'info', 'success', atau 'error'
    notification.style.display = 'block';

    // Sembunyikan notifikasi setelah beberapa detik
    setTimeout(() => {
        hideNotification();
    }, 5000); // Notifikasi tampil selama 5 detik
}

function hideNotification() {
    notification.style.display = 'none';
}


// --- Logika Cek Status Login Awal (Saat Halaman Dimuat) ---
// Listener onAuthStateChange tetap ada, tetapi TIDAK akan melakukan redirect otomatis
// saat event SIGNED_IN ditemukan secara pasif di halaman login.
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
            window.location.replace('/index.html');
        }
    }
});


// --- Logika Toggle Password ---
function setupPasswordToggle(checkboxId, passwordInputId) {
    const checkbox = document.getElementById(checkboxId);
    const passwordInput = document.getElementById(passwordInputId);

    if (checkbox && passwordInput) {
        // Hapus listener lama jika ada
        // checkbox.removeEventListener('change', handleToggleChange); // Tidak perlu remove jika hanya dipasang sekali
        // Tambahkan listener baru
        checkbox.addEventListener('change', () => { // Pakai arrow function agar 'this' tidak berubah
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
            window.location.replace('/homepage.html');
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
            // Jika Anda ingin langsung mengalihkan ke homepage atau halaman lain setelah daftar:
            // console.log("Pendaftaran berhasil. Redirect ke homepage.html");
            // window.location.replace('/homepage.html');

            // Jika email confirmation aktif, biarkan pengguna di halaman ini dan
            // instruksikan mereka untuk cek email.

            // Reset form setelah berhasil
            if (registerFormElement) registerFormElement.reset();
            hideNotification(); // Sembunyikan notifikasi "Memproses pendaftaran"
            // Opsional: alihkan kembali ke tab login
            // switchToLoginTab(); // Asumsi ada fungsi switchToLoginTab
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
            // switchToLoginTab(); // Asumsi ada fungsi switchToLoginTab
        }
    } catch (e) {
        console.error('Error tidak terduga saat reset password:', e);
        showNotification('Terjadi error tidak terduga saat reset password.', 'error');
    }
}


// --- Logika Ganti Tab dan Tampilkan Form ---

// Fungsi helper untuk beralih ke tab/form tertentu
function switchFormView(viewId) {
    const views = {
        login: {
            tab: loginTab,
            form: loginFormContainer,
            formElement: loginFormElement
        },
        register: {
            tab: registerTab,
            form: registerFormContainer,
            formElement: registerFormElement
        },
        forgotPassword: {
            tab: null,
            form: forgotPasswordFormElement,
            formElement: forgotPasswordFormElement
        } // forgottenPasswordFormElement adalah form element itu sendiri
    };

    // Pastikan elemen-elemen utama ada
    if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer || !forgotPasswordFormElement) {
        console.error("Gagal beralih tampilan form: Elemen UI utama tidak ditemukan.");
        showNotification('Error: Struktur halaman tidak lengkap untuk beralih tampilan.', 'error');
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

        // Atur visibilitas container/form utama
        if (view.form) {
            if (isActive) view.form.classList.remove('hidden');
            else view.form.classList.add('hidden');
        }

        // Pastikan form element itu sendiri juga diatur visibilitasnya jika perlu (terutama forgot password form)
        if (view.formElement) {
            if (isActive) view.formElement.classList.remove('hidden');
            else view.formElement.classList.add('hidden');
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

    // Mendapatkan referensi elemen-elemen UI utama
    // Menggunakan const untuk mencegah reassignment
    const loginTabElement = document.getElementById('loginTab');
    const registerTabElement = document.getElementById('registerTab');
    const loginFormContainerElement = document.getElementById('loginForm'); // Ini adalah DIV container form login
    const registerFormContainerElement = document.getElementById('registerForm'); // Ini adalah DIV container form register
    const loginFormElement = document.getElementById('login'); // Ini adalah FORM element login
    const registerFormElement = document.getElementById('register'); // Ini adalah FORM element register
    const forgotPasswordLinkElement = document.getElementById('forgotPasswordLink'); // Ini adalah link Lupa Password
    const forgotPasswordFormElement = document.getElementById('forgotPasswordForm'); // Ini adalah FORM element Lupa Password (pastikan ID ini ada di HTML)
    const switchToLoginFromForgotLinkElement = document.getElementById('switchToLoginFromForgot'); // Link Kembali ke Login dari form Lupa Password
    const switchToLoginLinkElement = document.getElementById('switchToLogin'); // Link Kembali ke Login dari form Register
    const switchToRegisterLinkElement = document.getElementById('switchToRegister'); // Link Daftar Sekarang dari form Login


    // --- Cek Kelengkapan Struktur HTML KRITIS ---
    // Memeriksa apakah semua elemen utama yang dicari oleh script DITEMUKAN di DOM.
    // Jika ada yang tidak ditemukan, script tidak bisa berjalan dengan benar.
    if (!loginTabElement || !registerTabElement || !loginFormContainerElement || !registerFormContainerElement || !loginFormElement || !registerFormElement || !forgotPasswordLinkElement || !forgotPasswordFormElement || !switchToLoginFromForgotLinkElement || !switchToLoginLinkElement || !switchToRegisterLinkElement) {
        console.error("HTML structure for forms, tabs, or links is not complete. Cannot initialize.");
        showNotification('Error: Struktur halaman tidak lengkap untuk inisialisasi.', 'error');
        // Jangan return; di sini agar log lain bisa muncul, tapi jangan pasang listener
    } else {
        console.log("HTML structure check passed. All required elements found.");


        // Pasang listener untuk ganti tab / form view
        loginTabElement.addEventListener('click', () => switchFormView('login'));
        registerTabElement.addEventListener('click', () => switchFormView('register'));
        forgotPasswordLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('forgotPassword');
        });
        // Listener untuk link kembali ke login dari form lupa password
        switchToLoginFromForgotLinkElement.addEventListener('click', (event) => {
            event.preventDefault();
            switchFormView('login');
        });
        // Listener untuk link beralih antara form login dan register
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
        // Pastikan ID checkbox dan input password sesuai dengan HTML Anda
        setupPasswordToggle('showLoginPassword', 'loginPassword'); // Checkbox & Input Password Login
        setupPasswordToggle('showPassword', 'password'); // Checkbox & Input Password Register
        setupPasswordToggle('showConfirmPassword', 'confirmPassword'); // Checkbox & Konfirmasi Password Register


        // Logika inisialisasi tampilan form (default ke login)
        switchFormView('login'); // Mulai dengan menampilkan tab login


        console.log("Halaman login/daftar diinisialisasi lengkap.");
    }


}); // Akhir DOMContentLoaded

// Optional: Tambahkan logika untuk menangani event SIGNED_IN jika Anda ingin
// redirect otomatis saat sesi ditemukan SAAT MEMBUKA index.html.
// Saat ini, script ini TIDAK melakukan redirect otomatis pada sesi awal.
// Jika Anda ingin kembali ke perilaku redirect otomatis saat sesi ditemukan di index.html,
// aktifkan kembali atau tambahkan logika di listener onAuthStateChange di atas.
/*
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session);
    if (event === 'INITIAL_SESSION' && session) {
         console.log('Initial session found, redirecting to homepage...');
         window.location.replace('/homepage.html');
    }
     // Anda mungkin juga ingin menangani 'SIGNED_IN' jika login terjadi dari tab lain
     if (event === 'SIGNED_IN' && session && window.location.pathname === '/index.html') {
          console.log('Signed in event detected on login page, redirecting...');
          window.location.replace('/homepage.html');
     }
     // Logika SIGNED_OUT sudah ditangani di atas
});
*/