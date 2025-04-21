// public/script.js

// --- Konfigurasi Supabase ---
// GANTI dengan URL dan ANON KEY proyek Supabase Anda (dari dashboard Supabase -> Project Settings -> API)
const SUPABASE_URL = 'https://gdhetudsmvypfpksggqp.supabase.co'; // <--- GANTI INI dengan Project URL Anda
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // <--- GANTI INI dengan Project API Key (anon public) Anda

// Pastikan library Supabase dimuat sebelum membuat client (ini sudah di index.html)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

// Kontainer Divs (menggunakan ID dari HTML yang diperbarui)
const loginFormDiv = document.getElementById('loginFormDiv'); // Kontainer utama untuk login, forgot, reset
const registerFormDiv = document.getElementById('registerFormDiv'); // Kontainer utama untuk register

// Form Spesifik (ID elemen form itu sendiri)
const loginForm = document.getElementById('loginForm'); // Form Login (di dalam loginFormDiv)
const registerForm = document.getElementById('registerForm'); // Form Register (di dalam registerFormDiv)
const forgotPasswordForm = document.getElementById('forgotPasswordForm'); // Form Lupa Password (di dalam loginFormDiv)
const resetPasswordForm = document.getElementById('resetPasswordForm'); // Form Reset Password (di dalam loginFormDiv)


const switchToRegisterLink = document.getElementById('switchToRegister'); // Link di form login ke daftar
const switchToLoginLink = document.getElementById('switchToLogin'); // Link di form daftar ke login
// Link kembali ke login dari form forgot/reset (ID dari HTML yang diperbarui)
const switchToLoginFromForgotLink = document.getElementById('switchToLoginFromForgot');
const switchToLoginFromResetLink = document.getElementById('switchToLoginFromReset');

const notificationElement = document.getElementById('custom-notification');


// --- Fungsi Notifikasi ---
function showNotification(message, type = 'info', duration = 3000) {
    if (!notificationElement) return;
    // Clear any existing timeout
    if (notificationElement.timeoutId) {
        clearTimeout(notificationElement.timeoutId);
    }

    notificationElement.textContent = message;
    // Hapus semua class tipe sebelumnya, tambahkan class custom-notification dan tipe baru
    notificationElement.className = 'custom-notification';
    notificationElement.classList.add(type);

    // Tampilkan elemen (jika sebelumnya hidden oleh display: none)
    notificationElement.style.display = 'block';

    // Atur timeout untuk menyembunyikan
    notificationElement.timeoutId = setTimeout(() => {
        notificationElement.classList.remove('show');
        // Tunggu sampai transisi opacity selesai sebelum set display none
        notificationElement.addEventListener('transitionend', function handler() {
            if (!notificationElement.classList.contains('show')) {
                notificationElement.style.display = 'none';
                notificationElement.textContent = ''; // Kosongkan teks setelah disembunyikan
            }
            notificationElement.removeEventListener('transitionend', handler);
        });
        // Tambahkan class 'show' setelah delay kecil untuk memicu transisi
        setTimeout(() => {
            notificationElement.classList.add('show'); // Tambahkan class show untuk transisi masuk
        }, 50); // Jeda kecil untuk memastikan display: block efektif
    }, duration);

    // Tambahkan class 'show' untuk memicu transisi masuk (jika CSS menggunakan opacity/visibility)
    setTimeout(() => {
        notificationElement.classList.add('show');
    }, 10); // Jeda kecil
}


// --- Fungsi untuk Mengganti Tampilan Form Utama ---
function showFormContent(formToShowId) {
    // Periksa apakah loginFormDiv ditemukan sebelum mencari form-content di dalamnya
    if (!loginFormDiv) {
        console.error("Container loginFormDiv not found.");
        return;
    }
    const formContents = loginFormDiv.querySelectorAll('.form-content'); // Dapatkan semua div form di dalam loginFormDiv
    formContents.forEach(formContent => {
        formContent.classList.add('hidden'); // Sembunyikan semua
    });

    const formToShow = document.getElementById(formToShowId);
    if (formToShow) {
        formToShow.classList.remove('hidden'); // Tampilkan yang diinginkan
    } else {
        console.error(`Form content with ID "${formToShowId}" not found.`);
    }
    // Sembunyikan notifikasi saat ganti form
    showNotification(''); // Kosongkan pesan
    notificationElement.style.display = 'none'; // Sembunyikan langsung
}

// --- Fungsi untuk Mengganti Tab (Login/Register) ---
function showLoginTab() {
    if (loginTab) loginTab.classList.add('active');
    if (registerTab) registerTab.classList.remove('active');
    if (registerFormDiv) registerFormDiv.classList.add('hidden'); // Sembunyikan register container
    if (loginFormDiv) loginFormDiv.classList.remove('hidden'); // Tampilkan login container

    // Setelah beralih ke tab login, tampilkan form login awal secara default
    showFormContent('loginForm'); // Tampilkan form login
}

function showRegisterTab() {
    if (registerTab) registerTab.classList.add('active');
    if (loginTab) loginTab.classList.remove('active');
    if (loginFormDiv) loginFormDiv.classList.add('hidden'); // Sembunyikan login container
    if (registerFormDiv) registerFormDiv.classList.remove('hidden'); // Tampilkan register container

    // Setelah beralih ke tab register, tampilkan form register
    showFormContent('registerForm'); // Tampilkan form register (ID dari HTML)
}


// --- Event Listeners untuk Tab dan Link Switch ---
if (loginTab) loginTab.addEventListener('click', showLoginTab);
if (registerTab) registerTab.addEventListener('click', showRegisterTab);

if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
    e.preventDefault(); // Cegah link default
    showRegisterTab();
});
if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
    e.preventDefault(); // Cegah link default
    showLoginTab();
});

// Link kembali ke login dari form lupa password
if (switchToLoginFromForgotLink) {
    switchToLoginFromForgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFormContent('loginForm'); // Kembali ke form login
    });
}

// Link kembali ke login dari form reset password
if (switchToLoginFromResetLink) {
    switchToLoginFromResetLink.addEventListener('click', (e) => {
        e.preventDefault();
        showFormContent('loginForm'); // Kembali ke form login
    });
}


// --- Logika Show/Hide Password ---
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
        // Console warn dihilangkan agar tidak terlalu banyak log jika elemen opsional tidak ada
        // console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}"`);
    }
}

// Pasang lihat password untuk form login
setupPasswordToggle('showLoginPassword', 'loginPassword');
// Pasang lihat password untuk form daftar
setupPasswordToggle('showRegisterPassword', 'registerPassword'); // ID dari HTML
setupPasswordToggle('showRegisterConfirmPassword', 'registerConfirmPassword'); // ID dari HTML
// Pasang lihat password untuk form reset password (input baru)
setupPasswordToggle('showResetNewPassword', 'resetNewPassword'); // ID dari HTML
setupPasswordToggle('showResetConfirmNewPassword', 'resetConfirmNewPassword'); // ID dari HTML


// --- Logika Supabase Authentication ---

// Fungsi untuk mengecek sesi dan mengarahkan atau menampilkan form yang benar
async function checkSessionAndRenderForm() {
    const {
        data: {
            session
        },
        error
    } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session during page load:', error.message);
        showNotification('Terjadi kesalahan saat memuat sesi.', 'error');
        // Jika ada error sesi, tampilkan form login
        showLoginTab();
        return;
    }

    // Cek apakah ada token reset password di URL (Supabase menambahkannya di hash: #access_token=...&type=recovery)
    const params = new URLSearchParams(window.location.hash.substring(1)); // Ambil dari hash, bukan search params
    const type = params.get('type');
    const accessToken = params.get('access_token');

    if (session) {
        // Jika sudah login (session aktif), arahkan ke homepage
        console.log("Sudah login, redirect ke homepage.html");
        // Simpan identifier pengguna di localStorage (opsional, untuk kompatibilitas)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUserIdentifier', session.user.email); // Menggunakan email

        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!

    } else if (type === 'recovery' && accessToken) {
        // Jika tidak ada session tapi ada token recovery di URL, tampilkan form reset password
        console.log("Ditemukan token recovery, tampilkan form reset password.");
        // Supabase secara otomatis menukar token recovery menjadi sesi sementara saat getSession dipanggil di halaman dengan token
        // Jadi kita tidak perlu manual set session di sini. Tinggal tampilkan form reset.
        showLoginTab(); // Pastikan container login/reset terlihat
        showFormContent('resetPasswordForm'); // Tampilkan form reset password

        // Opsional: Hapus token dari URL agar tidak memicu lagi saat refresh
        // Namun, Supabase biasanya menangani ini setelah reset password berhasil.
        // Untuk keamanan, biarkan saja hash-nya, Supabase SDK akan menggunakannya.
        // window.history.replaceState(null, '', window.location.pathname);


    } else {
        // Jika belum login dan tidak ada token recovery, tampilkan form login secara default
        console.log("Belum ada session dan token recovery, tampilkan form login.");
        showLoginTab(); // Tampilkan form login
    }
}

// Jalankan fungsi cek sesi dan render form saat DOM siap
document.addEventListener('DOMContentLoaded', checkSessionAndRenderForm);


// Listener untuk form Login
if (loginForm) { // Pastikan elemen ditemukan
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        showNotification("Sedang mencoba login...", "info");

        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Login Error:', error.message);
            if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
                showNotification('Email atau password salah, atau email belum diverifikasi.', 'error');
            } else {
                showNotification('Login gagal: ' + error.message, 'error');
            }

        } else {
            console.log('Login Berhasil:', data);
            showNotification('Login berhasil!', 'success');

            // Simpan identifier pengguna di localStorage (opsional, untuk kompatibilitas)
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUserIdentifier', data.user.email); // Menggunakan email sebagai identifier

            // Arahkan ke homepage setelah berhasil login
            setTimeout(() => {
                window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
            }, 1000);
        }
    });
} else {
    console.warn("Login form (ID 'loginForm') not found.");
}


// Listener untuk form Register
if (registerForm) { // Pastikan elemen ditemukan
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            showNotification("Password dan Konfirmasi Password tidak cocok!", "error");
            return;
        }

        if (password.length < 6) { // Validasi minimal panjang password Supabase Auth
            showNotification("Password minimal 6 karakter.", "error");
            return;
        }

        showNotification("Sedang mencoba mendaftar...", "info");

        // Pendaftaran dengan Supabase Auth
        const {
            data,
            error
        } = await supabase.auth.signUp({
            email: email,
            password: password,
            // Jika Anda ingin mengaktifkan verifikasi email, pastikan pengaturannya di dashboard Supabase -> Authentication -> Settings -> Email Templates -> Confirm signup
            // Anda bisa menambahkan data tambahan ke user metadata jika perlu:
            // options: { data: { full_name: '...' } }
            // Atau simpan data tambahan ke tabel profiles SETELAH signup berhasil dan user login pertama kali
        });

        if (error) {
            console.error('Register Error:', error.message);
            if (error.message.includes('User already exists')) {
                showNotification("Email sudah terdaftar.", "error");
            } else {
                showNotification('Pendaftaran gagal: ' + error.message, 'error');
            }

        } else {
            console.log('Pendaftaran Berhasil:', data);
            // Supabase secara default mengirim email verifikasi (jika diaktifkan)
            // Data.user akan null jika verifikasi email diperlukan sebelum session dibuat
            if (data.user) {
                // Jika auto-login setelah signup aktif (tergantung pengaturan Supabase Auth), data.user tidak null
                showNotification('Pendaftaran berhasil! Silakan login.', 'success');
                setTimeout(() => {
                    showLoginTab(); // Beralih ke tab login
                    // Opsional: kosongkan form pendaftaran
                    if (registerForm) registerForm.reset();
                }, 1500);
            } else {
                // Jika verifikasi email diperlukan, data.user akan null
                showNotification('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.', 'success', 5000); // Notifikasi lebih lama
                // Tetap di form register atau pindah ke form login dengan pesan
            }

            // Jika Anda ingin menyimpan data tambahan seperti Nama Lengkap ke tabel profiles:
            // Ini biasanya dilakukan setelah user mengkonfirmasi email dan login pertama kali.
            // Anda bisa menangani ini di homepage.js saat user login.
        }
    });
} else {
    console.warn("Register form (ID 'registerForm') not found.");
}


// Listener untuk form Lupa Password (mengirim email reset)
if (forgotPasswordForm) { // Pastikan elemen ditemukan
    const forgotPasswordSubmitButton = forgotPasswordForm.querySelector('button[type="submit"]'); // Dapatkan tombol submit

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotPasswordEmail').value;

        if (!email) {
            showNotification('Email harus diisi.', 'error');
            return;
        }

        showNotification('Mengirim link reset password...', 'info');
        // Disable tombol sementara
        if (forgotPasswordSubmitButton) {
            forgotPasswordSubmitButton.disabled = true;
            forgotPasswordSubmitButton.textContent = 'Mengirim...';
        }


        // Memanggil fungsi Supabase untuk mengirim email reset password
        const {
            data,
            error
        } = await supabase.auth.sendPasswordResetEmail({
            email: email,
            // Opsional: redirect user ke URL tertentu setelah klik link di email
            // Pastikan URL ini mengarah kembali ke halaman login/daftar Anda (index.html)
            // Supabase akan menambahkan token ke URL ini (di bagian hash: #access_token=...&type=recovery)
            options: {
                redirectTo: window.location.origin + window.location.pathname // Arahkan kembali ke halaman index.html ini
            }
        });

        if (error) {
            console.error('Send Reset Email Error:', error.message);
            showNotification('Gagal mengirim link reset: ' + error.message, 'error');
        } else {
            console.log('Reset Email Berhasil Dikirim:', data);
            // Pesan sukses lebih informatif
            showNotification('Jika email terdaftar, link reset password telah dikirim.', 'success', 5000); // Tampilkan lebih lama

            // Opsional: kembali ke form login setelah beberapa saat
            setTimeout(() => {
                showFormContent('loginForm'); // Kembali ke form login
                // Kosongkan form lupa password
                if (forgotPasswordForm) forgotPasswordForm.reset();
            }, 3000); // Kembali setelah 3 detik
        }

        // Re-enable tombol
        if (forgotPasswordSubmitButton) {
            forgotPasswordSubmitButton.disabled = false;
            forgotPasswordSubmitButton.textContent = 'Kirim Link Reset';
        }
    });

    // Listener untuk link "Lupa Password?" di form login (sudah diatur di awal, hanya pastikan IDnya benar)
    const forgotPasswordLinkInLoginForm = document.querySelector('#loginForm a.forgot-password'); // Gunakan selector yang lebih spesifik
    if (forgotPasswordLinkInLoginForm) {
        forgotPasswordLinkInLoginForm.addEventListener('click', (e) => {
            e.preventDefault();
            showFormContent('forgotPasswordForm'); // Tampilkan form lupa password
        });
    } else {
        console.warn("Forgot password link in login form not found.");
    }


} else {
    console.warn("Forgot password form container (ID 'forgotPasswordForm') not found.");
}


// Listener untuk form Reset Password (mengubah password)
if (resetPasswordForm) { // Pastikan elemen ditemukan
    const resetPasswordSubmitButton = resetPasswordForm.querySelector('button[type="submit"]'); // Dapatkan tombol submit

    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('resetNewPassword').value;
        const confirmNewPassword = document.getElementById('resetConfirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            showNotification('Password baru dan konfirmasi password tidak cocok.', 'error');
            return;
        }
        if (newPassword.length < 6) { // Validasi minimal panjang password Supabase Auth
            showNotification("Password baru minimal 6 karakter.", "error");
            return;
        }


        showNotification('Memproses reset password...', 'info');
        // Disable tombol sementara
        if (resetPasswordSubmitButton) {
            resetPasswordSubmitButton.disabled = true;
            resetPasswordSubmitButton.textContent = 'Memproses...';
        }


        // Memanggil fungsi Supabase untuk update user (terutama password)
        // Supabase secara otomatis menggunakan token recovery dari URL saat getSession() dipanggil di awal,
        // sehingga update user akan berlaku untuk sesi sementara dari token tersebut.
        const {
            data: updateData,
            error: updateError
        } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            console.error('Reset Password Error:', updateError.message);
            // Pesan error spesifik jika token sudah kadaluarsa atau tidak valid
            if (updateError.message.includes('invalid or expired jwt') || updateError.message.includes('Invalid refresh token')) {
                showNotification('Link reset tidak valid atau sudah kadaluarsa. Silakan coba lagi alur lupa password.', 'error');
            } else {
                showNotification('Gagal mereset password: ' + updateError.message, 'error');
            }
        } else {
            console.log('Reset Password Berhasil:', updateData);
            showNotification('Password berhasil direset! Silakan login dengan password baru Anda.', 'success');

            // Kembali ke form login setelah beberapa saat
            setTimeout(() => {
                showFormContent('loginForm'); // Kembali ke form login
                // Kosongkan form reset password
                if (resetPasswordForm) resetPasswordForm.reset();
            }, 3000); // Kembali setelah 3 detik
        }

        // Re-enable tombol
        if (resetPasswordSubmitButton) {
            resetPasswordSubmitButton.disabled = false;
            resetPasswordSubmitButton.textContent = 'Reset Password';
        }
    });

    // Listener untuk link "Masuk Sekarang" di form reset (sudah diatur di awal, hanya pastikan IDnya benar)
    // const switchToLoginFromResetLink = document.getElementById('switchToLoginFromReset'); // Sudah didapatkan di awal

} else {
    console.warn("Reset password form container (ID 'resetPasswordForm') not found.");
}


// --- Logika Lainnya ---
// Logika lain yang berjalan saat halaman dimuat, jika ada

// Note: checkSessionAndRenderForm() dipanggil setelah DOMContentLoaded
// Ini memastikan elemen-elemen form sudah tersedia saat script dijalankan.