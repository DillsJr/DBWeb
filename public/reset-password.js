// public/reset-password.js - Script untuk halaman reset password

// --- KONFIGURASI SUPABASE ---
// Gunakan URL dan Anon Key yang sama
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co'; // GANTI dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // !!! GANTI DENGAN ANON KEY SUPABASE YANG BENAR !!!

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized on reset password page.");

// --- Elemen UI Notifikasi (Harus ada di reset-password.html) ---
const notification = document.getElementById('custom-notification');
const resetPasswordFormElement = document.getElementById('resetPasswordFormElement'); // Ambil form element
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
const switchToLoginFromResetLink = document.getElementById('switchToLoginFromReset');


// --- Fungsi Notifikasi ---
function showNotification(message, type = 'info') {
    if (!notification) {
        console.error("Notification element with ID 'custom-notification' not found.");
        return;
    }
    notification.textContent = message;
    notification.className = 'custom-notification ' + type;
    notification.style.display = 'block';

    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    if (!notification) {
        console.warn("Notification element with ID 'custom-notification' not found for hiding.");
        return;
    }
    notification.style.display = 'none';
}

// --- Fungsi Redirect ke Halaman Login ---
function redirectToLogin() {
    console.log("Redirecting to login page...");
    // Gunakan window.location.replace agar halaman login menggantikan halaman saat ini di riwayat
    window.location.replace('/index.html'); // Pastikan '/index.html' adalah path halaman login Anda
}


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


// --- Logika Reset Password ---
async function handleResetPasswordSubmit(event) {
    event.preventDefault(); // Mencegah reload halaman
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    const newPassword = newPasswordInput ? newPasswordInput.value : '';
    const confirmNewPassword = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';


    if (!newPassword || !confirmNewPassword) {
        showNotification('Password baru dan konfirmasi password harus diisi.', 'error');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showNotification('Password baru dan konfirmasi password tidak cocok.', 'error');
        return;
    }

    console.log('Memproses reset password (menggunakan Supabase Authentication)...');
    showNotification('Meriset password Anda...', 'info');

    try {
        // --- PENTING: Supabase Auth menangani verifikasi token dari URL secara internal
        // saat Anda menggunakan fungsi update(). Supabase client akan membaca token
        // dari fragment URL (#access_token=...) SAAT PENGGUNA MENGKLIK LINK DI EMAIL.

        const {
            data,
            error
        } = await supabaseClient.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            console.error('Error reset password Supabase:', error.message);
            // Jika error terkait token (misal: token expired, token invalid),
            // Supabase akan menanganinya dan update akan gagal.
            showNotification('Gagal meriset password: ' + error.message, 'error');
            // Jika token expired atau invalid, mungkin redirect ke login setelah delay
            // setTimeout(redirectToLogin, 3000); // Opsional: Redirect ke login
        } else {
            console.log('Password berhasil direset:', data);
            showNotification('Password berhasil direset! Silahkan login.', 'success');

            // Setelah berhasil meriset password, arahkan pengguna ke halaman login
            console.log("Password reset berhasil. Redirect ke login page.");
            setTimeout(() => {
                redirectToLogin(); // Panggil fungsi redirect ke login
            }, 2000); // Beri waktu notifikasi sukses terlihat
        }
    } catch (e) {
        console.error('Error tidak terduga saat verifikasi kode atau reset password:', e);
        showNotification('Terjadi error tidak terduga saat meriset password.', 'error');
    }
}

// --- Memasang Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing reset password page...");

    // Pastikan elemen-elemen utama ditemukan sebelum digunakan
    if (!resetPasswordFormElement || !newPasswordInput || !confirmNewPasswordInput || !switchToLoginFromResetLink) {
        console.error("HTML structure for reset password form is not complete. Cannot initialize.");
        showNotification('Error: Struktur halaman reset password tidak lengkap.', 'error');
        return;
    }


    // Pasang listener submit ke form reset password
    resetPasswordFormElement.addEventListener('submit', handleResetPasswordSubmit);

    // Setup toggle password
    setupPasswordToggle('showNewPassword', 'newPassword');
    setupPasswordToggle('showConfirmNewPassword', 'confirmNewPassword');

    // Listener untuk link kembali ke login
    switchToLoginFromResetLink.addEventListener('click', (event) => {
        event.preventDefault();
        redirectToLogin();
    });


    console.log("Halaman reset password diinisialisasi lengkap.");

    // Optional: Tambahkan cek awal apakah pengguna sudah memiliki sesi reset password sementara
    // Supabase menangani ini secara internal setelah klik link,
    // tapi Anda bisa cek state awal jika perlu alur yang berbeda.
    supabaseClient.auth.getSession().then(({
        data,
        error
    }) => {
        console.log('Initial session check on reset password page:', data, error);
        // Biasanya, di halaman ini akan ada sesi pengguna TAPI BELUM TERVERIFIKASI
        // sampai pengguna berhasil update password.
        // Jika tidak ada sesi sama sekali, mungkin link expired atau salah.
        if (error || !data.session) {
            console.warn("No active session found on reset password page. Link might be invalid or expired.");
            // Jika mau otomatis redirect jika sesi tidak ada, bisa tambahkan di sini:
            // showNotification('Link reset password tidak valid atau sudah kadaluwarsa. Mengalihkan ke halaman login...', 'error');
            // setTimeout(redirectToLogin, 3000); // Redirect ke login
        } else {
            console.log('Sesi sementara ditemukan, siap untuk reset password.');
            // Opsional: Tampilkan pesan ke pengguna untuk memasukkan password baru
            // showNotification('Silahkan masukan password baru Anda.', 'info');
        }
    });

}); // Akhir DOMContentLoaded