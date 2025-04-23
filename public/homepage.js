// public/homepage.js - Script untuk halaman beranda (Integrasi Supabase)

// --- KONFIGURASI SUPABASE ---
// Gunakan URL dan Anon Key yang sama dengan di script.js
// !!! PERINGATAN KRITIS: Menyimpan URL dan ANON KEY secara langsung di kode klien yang publik
// TIDAK AMAN untuk aplikasi produksi.
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co'; // GANTI dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDIyOX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // GANTI dengan Anon Key Supabase Anda

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized on homepage.");

// --- Logika Cek Status Login dan Tampilkan Info Pengguna ---
async function checkLoginStatusAndLoadUser() {
    // Coba dapatkan sesi pengguna saat ini
    const {
        data,
        error
    } = await supabaseClient.auth.getSession();
    console.log('Supabase getSession result on homepage:', data, error);

    const loggedInUsernameElement = document.getElementById('loggedInUsername');
    const logoutButton = document.getElementById('logoutButton');
    const userProfilePicElement = document.getElementById('userProfilePic');
    const profilePicInput = document.getElementById('profilePicInput');


    if (error) {
        console.error('Error getting session:', error.message);
        // Jika ada error saat mendapatkan sesi, arahkan ke login
        redirectToLogin();
        return;
    }

    if (!data.session) {
        console.log('No active session found. Redirecting to login.');
        // Jika tidak ada sesi aktif (pengguna belum login atau sesi kadaluarsa), arahkan kembali ke halaman login
        redirectToLogin();
        return;
    }

    // Sesi ditemukan, pengguna login
    console.log('Active session found:', data.session);
    const user = data.session.user;

    // Ambil data tambahan pengguna (metadata) yang disimpan saat pendaftaran
    // Data ini tersimpan di user.user_metadata
    const userMetadata = user.user_metadata;
    let displayName = 'Pengguna'; // Nama default jika metadata tidak ada atau tidak lengkap

    if (userMetadata) {
        console.log('User metadata:', userMetadata);
        // Prioritaskan full_name, lalu username, lalu email (bagian sebelum @) untuk ditampilkan
        if (userMetadata.full_name) {
            displayName = userMetadata.full_name;
        } else if (userMetadata.username) {
            displayName = userMetadata.username;
        } else if (user.email) {
            displayName = user.email.split('@')[0]; // Ambil bagian email sebelum '@'
        }
    } else if (user.email) {
        displayName = user.email.split('@')[0]; // Jika tidak ada metadata, pakai bagian email
    }


    // Tampilkan nama pengguna di elemen dengan ID 'loggedInUsername'
    if (loggedInUsernameElement) {
        loggedInUsernameElement.textContent = displayName;
    } else {
        console.warn("Element with ID 'loggedInUsername' not found.");
    }

    // --- LOGIKA FOTO PROFIL (Belum Implemented - Placeholder) ---
    // Untuk membuat ini berfungsi:
    // 1. Buat bucket di Supabase Storage (misal: 'profile-pictures').
    // 2. Atur Row Level Security (RLS) di Storage agar pengguna hanya bisa baca/tulis file mereka sendiri.
    // 3. Saat login/memuat halaman, ambil URL foto profil pengguna dari Storage atau database.
    // 4. Tampilkan foto profil di userProfilePicElement.
    // 5. Tambahkan listener pada profilePicInput untuk menangani unggah file.
    console.log("Bagian menampilkan dan mengunggah foto profil belum diimplementasikan sepenuhnya.");

    // Contoh (kode ini belum lengkap dan mungkin perlu penyesuaian):
    // async function loadProfilePicture(userId) {
    //    // Logika untuk mengambil URL foto profil dari Storage atau database
    //    const { data, error } = await supabaseClient.storage.from('profile-pictures').getPublicUrl(`public/${userId}/avatar.png`); // Sesuaikan path dan nama file
    //    if (data && data.publicUrl) {
    //        userProfilePicElement.src = data.publicUrl;
    //    } else {
    //        userProfilePicElement.src = 'placeholder-profile-pic.png'; // Placeholder
    //    }
    // }

    // if (user && userProfilePicElement) {
    //    loadProfilePicture(user.id);
    // }

    // if (profilePicInput && user) {
    //     profilePicInput.addEventListener('change', async (e) => {
    //         const file = e.target.files[0];
    //         if (!file) return;
    //         const fileExt = file.name.split('.').pop();
    //         const newFileName = `${user.id}.${fileExt}`; // Contoh nama file berdasarkan user ID
    //         const filePath = `public/${user.id}/${newFileName}`; // Contoh path di bucket
    //
    //         const { error: uploadError } = await supabaseClient.storage
    //             .from('profile-pictures') // Nama bucket Anda
    //             .upload(filePath, file, {
    //                 cacheControl: '3600',
    //                 upsert: true // Timpa file lama jika ada
    //             });
    //
    //         if (uploadError) {
    //             console.error('Error uploading profile picture:', uploadError.message);
    //             alert('Gagal mengunggah foto profil: ' + uploadError.message);
    //         } else {
    //             alert('Foto profil berhasil diunggah!');
    //             loadProfilePicture(user.id); // Muat ulang foto setelah diunggah
    //         }
    //     });
    // }


    // --- Logika Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            console.log('Attempting to log out...');
            // Panggil fungsi signOut dari Supabase Auth
            const {
                error: logoutError
            } = await supabaseClient.auth.signOut();

            if (logoutError) {
                console.error('Error logging out:', logoutError.message);
                alert('Gagal logout: ' + logoutError.message); // Tampilkan notifikasi sederhana jika gagal logout
            } else {
                console.log('Logout successful.');
                // Setelah berhasil logout, Supabase akan menghapus sesi.
                // Redireksi kembali ke halaman login akan ditangani oleh
                // onAuthStateChange listener di script.js (di halaman login)
                // atau Anda bisa tambahkan redirect eksplisit di sini jika perlu:
                redirectToLogin();
            }
        });
    } else {
        console.warn("Logout button with ID 'logoutButton' not found.");
    }

    // --- TODO: Tambahkan logika untuk Bagian Unggah Foto Konten Umum & Galeri di sini ---
    // Ini memerlukan implementasi terpisah untuk menangani pemilihan file,
    // proses unggah ke bucket Supabase Storage, mendapatkan URL file,
    // menyimpan info file (misal: URL, user ID, timestamp) di tabel database,
    // mengambil daftar foto pengguna dari database saat halaman dimuat/di-refresh,
    // dan menampilkannya di grid galeri.
    console.log("Bagian upload foto umum dan galeri belum diimplementasikan.");


}

// --- Fungsi Redirect ke Halaman Login ---
function redirectToLogin() {
    // Gunakan window.location.replace agar halaman login menggantikan halaman saat ini di riwayat
    window.location.replace('/index.html'); // Pastikan '/index.html' adalah path halaman login Anda
}


// Jalankan fungsi utama (cek status login dan tampilkan info) saat seluruh DOM halaman beranda selesai dimuat
document.addEventListener('DOMContentLoaded', checkLoginStatusAndLoadUser);

// Optional: Anda bisa menambahkan listener onAuthStateChange di sini juga
// untuk menangani event seperti 'SIGNED_OUT' jika pengguna logout dari tab lain
// secara bersamaan. Ini akan membuat halaman beranda ini redirect jika sesi berakhir di tempat lain.
// supabaseClient.auth.onAuthStateChange((event, session) => {
//     if (event === 'SIGNED_OUT') {
//         console.log('SIGNED_OUT event detected on homepage. Redirecting to login.');
//         redirectToLogin();
//     }
// });