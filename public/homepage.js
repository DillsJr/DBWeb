// public/homepage.js - Script untuk halaman beranda (Integrasi Supabase & Storage)

// --- KONFIGURASI SUPABASE ---\
// Gunakan URL dan Anon Key yang sama dengan di script.js
// !!! PERINGATAN KRITIS: Menyimpan URL dan ANON KEY secara langsung di kode klien yang publik
// TIDAK AMAN untuk aplikasi produksi. Gunakan environment variables atau server-side logic.\
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co'; // GANTI dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // !!! GANTI DENGAN ANON KEY SUPABASE YANG BENAR !!!

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized on homepage.");

// --- Elemen UI Notifikasi (Harus ada di homepage.html) ---\
const notification = document.getElementById('custom-notification');

// --- Elemen UI Header ---\
const logoutButton = document.getElementById('logoutButton');
const profileIcon = document.getElementById('profileIcon'); // Ambil elemen ikon profil

// --- Elemen UI Konten Utama ---\
const loggedInUsernameSpan = document.getElementById('loggedInUsername');
const userProfilePicImg = document.getElementById('userProfilePic');
const profilePicInput = document.getElementById('profilePicInput');
const generalPhotoInput = document.getElementById('generalPhotoInput');
const userPhotosGalleryDiv = document.getElementById('userPhotosGallery');


// --- Fungsi Notifikasi (Salin dari script.js) ---\
function showNotification(message, type = 'info') {
    if (!notification) {
        console.error("Notification element with ID 'custom-notification' not found.");
        return;
    }
    notification.textContent = message;
    notification.className = 'custom-notification ' + type; // Tambahkan kelas 'info', 'success', atau 'error'
    notification.style.display = 'block';

    setTimeout(() => {
        hideNotification();
    }, 5000); // Notifikasi tampil selama 5 detik
}

function hideNotification() {
    if (!notification) {
        console.warn("Notification element with ID 'custom-notification' not found for hiding.");
        return;
    }
    notification.style.display = 'none'; // Penting: Menyembunyikan elemen notifikasi
}


// --- Fungsi Redirect ke Halaman Login ---\
function redirectToLogin() {
    console.log("Redirecting to login page...");
    // Gunakan window.location.replace agar halaman login menggantikan halaman saat ini di riwayat
    window.location.replace('/index.html'); // Pastikan '/index.html' adalah path halaman login Anda
}

// --- Fungsi untuk Logout ---\
async function handleLogout() {
    console.log("Memproses logout...");
    showNotification('Logging out...', 'info');
    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Error logging out:', error.message);
        showNotification('Logout failed: ' + error.message, 'error');
    } else {
        console.log("Logout successful.");
        showNotification('Logout successful!', 'success');
        // Redirect ke halaman login setelah logout berhasil
        setTimeout(redirectToLogin, 500); // Beri sedikit delay agar notifikasi sempat terlihat
    }
}

// --- Fungsi untuk Mengunggah Foto Profil ---\
// Anda perlu MENGIMPLEMENTASIKAN fungsi ini. Contoh dasarnya ada di bawah komentar.
// Fungsi ini akan mengunggah file ke Supabase Storage bucket 'profile-pictures'.
// Anda perlu membuat bucket ini dan mengatur RLS-nya.
async function uploadProfilePicture(file, userId) {
    if (!file || !userId) {
        console.error("File atau User ID tidak ada untuk upload.");
        showNotification("Gagal mengunggah foto: File tidak valid atau pengguna tidak dikenali.", "error");
        return null; // Mengembalikan null jika gagal
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`; // Beri nama file berdasarkan user ID
    const filePath = `${fileName}`; // Path di dalam bucket (di root bucket)

    try {
        showNotification('Mengunggah foto profil...', 'info');
        const {
            data,
            error
        } = await supabaseClient.storage
            .from('profile-pictures') // GANTI dengan nama bucket Storage untuk foto profil Anda
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // Timpa file jika sudah ada dengan nama yang sama
            });

        if (error) {
            console.error('Error mengunggah foto profil ke Storage:', error);
            showNotification('Gagal mengunggah foto profil: ' + error.message, 'error');
            return null;
        }

        console.log("Foto profil berhasil diunggah:", data);

        // Setelah berhasil diunggah, dapatkan URL publiknya
        const {
            data: publicUrlData
        } = supabaseClient.storage
            .from('profile-pictures') // GANTI dengan nama bucket Storage untuk foto profil Anda
            .getPublicUrl(filePath);

        const publicUrl = publicUrlData ? publicUrlData.publicUrl : null;

        if (publicUrl) {
            console.log("URL publik foto profil:", publicUrl);
            // Opsional: Update URL foto profil di database pengguna atau metadata Auth
            // await updateUserProfileDatabase(userId, publicUrl); // Implementasikan fungsi ini jika perlu

            // Tampilkan foto yang baru diunggah
            if (userProfilePicImg) {
                userProfilePicImg.src = publicUrl;
                showNotification('Foto profil berhasil diunggah!', 'success');
            }

            return publicUrl; // Mengembalikan URL publik
        } else {
            console.warn("Gagal mendapatkan URL publik setelah upload.");
            showNotification('Foto profil berhasil diunggah, tetapi gagal mendapatkan URL publik.', 'warning');
            return null;
        }


    } catch (e) {
        console.error('Error tidak terduga saat upload foto profil:', e);
        showNotification('Terjadi error tidak terduga saat mengunggah foto profil.', 'error');
        return null;
    }
}


// --- Fungsi untuk Mengambil dan Menampilkan Foto Profil ---\
// Anda perlu MENGIMPLEMENTASIKAN fungsi ini. Contoh dasarnya ada di bawah komentar.
// Fungsi ini akan mengambil URL foto profil (dari Storage atau database)
async function loadProfilePicture(userId) {
    if (!userId) {
        console.error("User ID tidak ada untuk memuat foto profil.");
        return;
    }

    console.log("Memuat foto profil untuk user ID:", userId);

    // Cara 1: Jika URL foto profil disimpan di metadata Auth atau tabel 'profiles'
    // const { data: profileData, error: profileError } = await supabaseClient
    //     .from('profiles') // GANTI dengan nama tabel profil Anda jika ada
    //     .select('avatar_url') // GANTI dengan nama kolom URL foto profil
    //     .eq('id', userId) // GANTI dengan nama kolom User ID di tabel profil
    //     .single();

    // if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = data tidak ditemukan
    //     console.error('Error memuat data profil:', profileError);
    //     // Mungkin tampilkan placeholder jika error
    //     if (userProfilePicImg) userProfilePicImg.src = 'placeholder-profile-pic.png';
    //     return;
    // }

    // const profilePicUrl = profileData ? profileData.avatar_url : null;


    // Cara 2: Mendapatkan URL publik langsung dari Storage (jika nama file berdasarkan User ID)
    // Ini lebih sederhana jika Anda menamai file foto profil persis sesuai user ID
    try {
        // Coba mendapatkan URL publik untuk beberapa ekstensi umum (misal: .png, .jpg, .jpeg)
        const possibleExtensions = ['png', 'jpg', 'jpeg', 'gif'];
        let publicUrl = null;

        for (const ext of possibleExtensions) {
            const filePath = `${userId}.${ext}`;
            const {
                data
            } = supabaseClient.storage
                .from('profile-pictures') // GANTI dengan nama bucket Storage foto profil Anda
                .getPublicUrl(filePath);

            // Cek apakah URL valid (Supabase getPublicUrl akan selalu mengembalikan URL,
            // tapi file-nya mungkin tidak ada, jadi kita perlu cara cek lain jika perlu)
            // Untuk sederhana, kita asumsikan URL publik valid jika tidak ada error dari getPublicUrl itu sendiri.
            if (data && data.publicUrl) {
                // Di lingkungan browser, GET request ke URL yang tidak ada akan mengembalikan 404.
                // Supabase storage getPublicUrl TIDAK memberitahu apakah file ada atau tidak.
                // Cara lebih robust adalah cek file existence atau simpan URL di database.
                // Salah satu cara (tidak ditampilkan di sini) adalah membuat HEAD request.

                // Untuk sederhana, mari kita coba tampilkan URLnya saja dan browser akan handle 404.
                publicUrl = data.publicUrl;
                break; // Berhenti setelah menemukan ekstensi yang memungkinkan
            }
        }


        if (publicUrl && userProfilePicImg) {
            console.log("Ditemukan URL foto profil di Storage:", publicUrl);
            userProfilePicImg.src = publicUrl;
        } else {
            console.log("Foto profil tidak ditemukan di Storage untuk user ID:", userId);
            // Tampilkan gambar placeholder jika foto profil tidak ditemukan
            if (userProfilePicImg) userProfilePicImg.src = 'placeholder-profile-pic.png';
        }

    } catch (e) {
        console.error('Error memuat foto profil dari Storage:', e);
        // Tampilkan gambar placeholder jika error
        if (userProfilePicImg) userProfilePicImg.src = 'placeholder-profile-pic.png';
    }

}


// --- Fungsi untuk Menampilkan Nama Pengguna ---\
// Mengambil nama dari metadata Auth atau tabel 'profiles'
async function displayUserName(userId) {
    if (!userId) {
        console.error("User ID tidak ada untuk menampilkan nama.");
        return;
    }

    console.log("Memuat nama pengguna untuk user ID:", userId);

    // Cara 1: Ambil dari metadata Auth (jika disimpan saat daftar)
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError) {
        console.error('Error memuat data pengguna dari Auth:', userError.message);
        if (loggedInUsernameSpan) loggedInUsernameSpan.textContent = 'Pengguna!'; // Tampilkan placeholder
        return;
    }

    const usernameFromMetadata = user && user.user_metadata ? user.user_metadata.username : null;
    const fullNameFromMetadata = user && user.user_metadata ? user.user_metadata.full_name : null;


    // Cara 2: Ambil dari tabel 'profiles' (jika disimpan di sana)
    // Anda perlu tabel 'profiles' di database dengan kolom 'id' (UUID), 'username', 'full_name', dll.
    // Pastikan 'id' adalah FK ke auth.users(id) dan ada Row Level Security (RLS) yang tepat.
    // const { data: profileData, error: profileError } = await supabaseClient
    //     .from('profiles') // GANTI dengan nama tabel profil Anda jika ada
    //     .select('username, full_name') // GANTI dengan nama kolom username & full_name
    //     .eq('id', userId) // GANTI dengan nama kolom User ID di tabel profil
    //     .single();

    // if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = data tidak ditemukan
    //     console.error('Error memuat data profil dari database:', profileError);
    // }

    // const usernameFromDb = profileData ? profileData.username : null;
    // const fullNameFromDb = profileData ? profileData.full_name : null;


    // Tentukan nama mana yang akan ditampilkan (metadata Auth atau database)
    const displayUsername = usernameFromMetadata || fullNameFromMetadata || 'Pengguna!';
    // Atau jika menggunakan database:
    // const displayUsername = usernameFromDb || fullNameFromDb || usernameFromMetadata || fullNameFromMetadata || 'Pengguna!';


    if (loggedInUsernameSpan) {
        loggedInUsernameSpan.textContent = displayUsername;
    }

}


// --- Fungsi untuk Menangani Event File Input Foto Profil ---\
// Dipanggil saat pengguna memilih file foto profil
async function handleProfilePicChange(event) {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) {
        console.log("Tidak ada file yang dipilih.");
        return;
    }

    console.log("File foto profil dipilih:", file);

    // Dapatkan pengguna yang sedang login
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.error('Error mendapatkan pengguna saat upload foto profil:', userError ? userError.message : 'Pengguna tidak ditemukan.');
        showNotification('Gagal mengunggah foto profil: Pengguna tidak dikenali.', 'error');
        return;
    }

    // Panggil fungsi upload
    await uploadProfilePicture(file, user.id);

    // Opsional: Reset input file agar event 'change' terpicu lagi jika file yang sama dipilih
    // event.target.value = '';
}


// --- Fungsi Utama untuk Mengecek Status Login dan Memuat Data Pengguna ---\
async function checkLoginStatusAndLoadUser() {
    console.log("Mengecek status login dan memuat data pengguna...");

    // Dapatkan sesi pengguna yang sedang login
    const {
        data: {
            session
        },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Error getting session:', error.message);
        // Jika terjadi error saat mendapatkan sesi, asumsikan pengguna tidak login
        redirectToLogin();
        return; // Hentikan eksekusi lebih lanjut
    }

    if (!session) {
        console.log('No active session found. Redirecting to login page.');
        // Jika tidak ada sesi, arahkan pengguna kembali ke halaman login
        redirectToLogin();
        return; // Hentikan eksekusi lebih lanjut
    }

    // Jika sesi ditemukan, artinya pengguna sudah login
    console.log('Active session found:', session);
    console.log('Logged in user:', session.user);

    // Dapatkan user ID
    const userId = session.user.id;
    console.log('Logged in user ID:', userId);

    // Tampilkan info pengguna (username/nama)
    displayUserName(userId); // Panggil fungsi untuk menampilkan nama

    // Muat dan tampilkan foto profil
    loadProfilePicture(userId); // Panggil fungsi untuk memuat foto profil

    // Setup listener untuk tombol logout
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        console.log("Event listener untuk tombol logout terpasang.");
    } else {
        console.warn("Tombol logout dengan ID 'logoutButton' tidak ditemukan.");
    }

    // Setup listener untuk ikon profil (opsional, untuk navigasi atau aksi lain)
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            console.log("Ikon profil diklik.");
            // TODO: Tambahkan logika saat ikon profil diklik (misal: redirect ke halaman profil terpisah, buka modal, dll.)
            showNotification('Fitur profil akan datang!', 'info');
        });
        console.log("Event listener untuk ikon profil terpasang.");
    } else {
        console.warn("Ikon profil dengan ID 'profileIcon' tidak ditemukan.");
    }


    // Setup listener untuk input file foto profil
    if (profilePicInput) {
        profilePicInput.addEventListener('change', handleProfilePicChange);
        console.log("Event listener untuk input foto profil terpasang.");
    } else {
        console.warn("Input file foto profil dengan ID 'profilePicInput' tidak ditemukan.");
    }


    // --- TODO: Implementasi Fitur Upload Foto Umum & Galeri ---\
    // Bagian ini memerlukan implementasi tambahan untuk:
    // 1. Buat bucket Supabase Storage terpisah (misal: 'general-photos').
    // 2. Atur RLS untuk bucket general-photos.
    // 3. Logika JavaScript untuk menangani event 'change' atau 'drop' pada area upload umum (#generalPhotoInput).
    // 4. Fungsi untuk mengunggah file-file umum ke bucket storage.
    // 5. Logika untuk menyimpan metadata foto (user_id, url file, timestamp) di tabel database (misal: 'photos').
    // 6. Fungsi untuk mengambil daftar foto pengguna dari tabel 'photos' saat halaman dimuat.
    // 7. Logika untuk menampilkan daftar foto tersebut dalam grid galeri (#userPhotosGallery).
    // 8. Opsional: fungsi untuk menghapus foto.
    console.log("Bagian upload foto umum dan galeri belum diimplementasikan.");


}


// Jalankan fungsi utama (cek status login dan tampilkan info, setup listener) saat seluruh DOM halaman beranda selesai dimuat
document.addEventListener('DOMContentLoaded', checkLoginStatusAndLoadUser);

// Optional: Anda bisa menambahkan listener onAuthStateChange di sini juga
// untuk menangani event seperti 'SIGNED_OUT' jika pengguna logout dari tab lain
// secara bersamaan. Ini akan membuat halaman beranda ini redirect jika sesi berakhir di tempat lain.
// supabaseClient.auth.onAuthStateChange((event, session) => {
//     if (event === 'SIGNED_OUT') {
//         console.log('SIGNED_OUT event detected on homepage. Redirecting to login.');
//         redirectToLogin();
//     }
//     // Optional: Anda bisa menangani event 'SIGNED_IN' atau 'USER_UPDATED' di sini
//     // jika perlu memperbarui UI secara real-time saat pengguna melakukan aksi di tab lain.
// });