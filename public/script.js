// Mendapatkan elemen-elemen HTML
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginFormDiv = document.getElementById('loginForm'); // Div kontainer form login
const registerFormDiv = document.getElementById('registerForm'); // Div kontainer form daftar

const loginForm = document.getElementById('login'); // Form login yang sebenarnya
const registerForm = document.getElementById('register'); // Form daftar yang sebenarnya

const loginWhatsappInput = document.getElementById('loginWhatsapp');
const loginPasswordInput = document.getElementById('loginPassword');

const customNotification = document.getElementById('custom-notification');

// --- Fungsi untuk Menampilkan Notifikasi ---
function showNotification(message, isSuccess = false) {
    customNotification.textContent = message;
    customNotification.className = 'custom-notification'; // Reset class
    if (isSuccess) {
        customNotification.classList.add('success'); // Tambah class jika sukses (kamu perlu style untuk class ini di CSS)
    } else {
        customNotification.classList.add('error'); // Tambah class jika error (kamu perlu style untuk class ini di CSS)
    }
    customNotification.style.display = 'block'; // Tampilkan notifikasi
    // Sembunyikan notifikasi setelah beberapa detik (opsional)
    setTimeout(() => {
        customNotification.style.display = 'none';
        customNotification.textContent = ''; // Kosongkan teks setelah disembunyikan
    }, 5000); // Sembunyikan setelah 5 detik
}

// --- Logika Ganti Tab ---
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginFormDiv.classList.remove('hidden');
    registerFormDiv.classList.add('hidden');
    customNotification.style.display = 'none'; // Sembunyikan notifikasi saat ganti tab
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerFormDiv.classList.remove('hidden');
    loginFormDiv.classList.add('hidden');
    customNotification.style.display = 'none'; // Sembunyikan notifikasi saat ganti tab
});

// --- Logika Lihat Password ---
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
    }
}

setupPasswordToggle('showLoginPassword', 'loginPassword');
setupPasswordToggle('showPassword', 'password');
setupPasswordToggle('showConfirmPassword', 'confirmPassword');


// --- Logika Submit Form Login ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Mencegah refresh halaman

    const whatsapp = loginWhatsappInput.value;
    const password = loginPasswordInput.value;

    // Data yang akan dikirim ke backend untuk login
    const loginData = {
        whatsapp: whatsapp, // Sesuaikan nama field jika di backend pakai 'username' bukan 'whatsapp'
        password: password
    };

    showNotification('Memproses login...', false); // Tampilkan pesan loading

    try {
        // Panggil Serverless Function /api/login
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) { // Status kode 200-299 -> Berhasil
            showNotification(result.message || 'Login berhasil!', true); // Tampilkan pesan sukses dari API
            // Di sini kamu bisa tambahkan logika setelah login berhasil,
            // seperti menyimpan token, redirect halaman, dll.
            loginForm.reset(); // Kosongkan form setelah berhasil (opsional)

        } else { // Status kode 400-599 -> Error
            showNotification(result.message || 'Login gagal. Mohon coba lagi.', false); // Tampilkan pesan error dari API
        }

    } catch (error) {
        console.error('Error saat memanggil API login:', error);
        showNotification('Terjadi kesalahan teknis. Mohon coba lagi nanti.', false);
    }
});

// --- Logika Submit Form Daftar (PLACEHOLDER) ---
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Mencegah refresh halaman

    // Ambil data dari semua input pendaftaran
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Data pendaftaran (contoh)
    const registerData = {
        fullName,
        username,
        whatsapp,
        email,
        password,
        confirmPassword
    };

    console.log("Data Pendaftaran:", registerData); // Tampilkan data di konsol

    // --- INI HANYA PLACEHOLDER ---
    // Di aplikasi nyata, kamu akan mengirim registerData ke Serverless Function /api/register
    // Contoh:
    // try {
    //     const response = await fetch('/api/register', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(registerData)
    //     });
    //     const result = await response.json();
    //     if (response.ok) {
    //         showNotification(result.message || 'Pendaftaran berhasil! Silakan masuk.', true);
    //         // Mungkin langsung alihkan ke tab login atau halaman login
    //     } else {
    //         showNotification(result.message || 'Pendaftaran gagal.', false);
    //     }
    // } catch (error) {
    //     console.error('Error saat memanggil API daftar:', error);
    //     showNotification('Terjadi kesalahan teknis saat pendaftaran.', false);
    // }
    // -------------------------------

    // Tampilkan notifikasi placeholder untuk pendaftaran
    showNotification('Simulasi pendaftaran... (API /api/register belum diimplementasikan)', true);
    // registerForm.reset(); // Kosongkan form setelah simulasi (opsional)
});