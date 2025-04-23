// public/homepage.js - Script untuk halaman beranda (Integrasi Supabase & Storage)

// --- KONFIGURASI SUPABASE ---
// Gunakan URL dan Anon Key yang sama dengan di script.js
// !!! PERINGATAN KRITIS: Menyimpan URL dan ANON KEY secara langsung di kode klien yang publik
// TIDAK AMAN untuk aplikasi produksi. Gunakan environment variables atau server-side logic.
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co'; // GANTI dengan URL Supabase Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // !!! GANTI DENGAN ANON KEY SUPABASE YANG BENAR !!!

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized on homepage.");

// --- Elemen UI Notifikasi (Harus ada di homepage.html) ---
const notification = document.getElementById('custom-notification');


// --- Fungsi Notifikasi (Salin dari script.js) ---
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


// --- Fungsi Redirect ke Halaman Login ---
function redirectToLogin() {
    console.log("Redirecting to login page...");
    // Gunakan window.location.replace agar halaman login menggantikan halaman saat ini di riwayat
    window.location.replace('/index.html'); // Pastikan '/index.html' adalah path halaman login Anda
}


// --- Fungsi untuk Mengunggah Foto Profil ---
async function uploadProfilePicture(file, userId) {
    if (!file || !userId) {
        console.error("File atau User ID tidak ada untuk upload.");
        // Gunakan showNotification
        showNotification("Gagal mengunggah foto: File tidak valid atau pengguna tidak dikenali.", 'error');
        return null;
    }

    const fileExt = file.name.split('.').pop(); // Ambil ekstensi file
    const newFileName = `avatar.${fileExt}`; // Nama file di Storage (misal: avatar.png)
    // Path file di bucket: <user_id>/avatar.<ekstensi>
    const filePath = `${userId}/${newFileName}`; // Contoh path

    console.log(`Uploading file "${file.name}" to path "${filePath}"...`);
    showNotification('Mengunggah foto profil...', 'info'); // Notifikasi proses

    // Panggil fungsi upload dari Supabase Storage
    const {
        data,
        error
    } = await supabaseClient.storage
        .from('profile-pictures') // GANTI dengan NAMA BUCKET Supabase Storage Anda (misal: 'profile-pictures')
        .upload(filePath, file, {
            cacheControl: '3600', // Cache selama 1 jam
            upsert: true // Timpa file yang sudah ada jika nama file sama
        });

    if (error) {
        console.error('Error uploading profile picture:', error.message);
        // Gunakan showNotification
        showNotification('Gagal mengunggah foto profil: ' + error.message, 'error');
        return null;
    } else {
        console.log('Upload profile picture successful:', data);
        // Gunakan showNotification
        showNotification('Foto profil berhasil diunggah!', 'success');
        // Setelah berhasil diunggah, dapatkan URL publik untuk menampilkannya
        const {
            data: publicData
        } = supabaseClient.storage
            .from('profile-pictures') // GANTI dengan NAMA BUCKET Supabase Storage Anda
            .getPublicUrl(filePath); // Dapatkan URL publik file yang baru diunggah

        if (publicData && publicData.publicUrl) {
            console.log('Public URL:', publicData.publicUrl);
            return publicData.publicUrl; // Kembalikan URL publik
        } else {
            console.error('Failed to get public URL after upload.');
            // Gunakan showNotification
            showNotification('Foto profil berhasil diunggah, tetapi gagal mendapatkan URL untuk menampilkannya.', 'warning'); // Pakai warning atau error
            return null;
        }
    }
}

// --- Fungsi untuk Memuat Foto Profil yang Sudah Ada ---
async function loadProfilePicture(userId) {
    const userProfilePicElement = document.getElementById('userProfilePic');
    if (!userProfilePicElement) {
        console.warn("Profile picture element with ID 'userProfilePic' not found.");
        return;
    }

    if (!userId) {
        console.warn("User ID tidak ada untuk memuat foto profil.");
        userProfilePicElement.src = 'placeholder-profile-pic.png'; // Set placeholder jika tidak ada user
        return;
    }

    // Path yang diharapkan untuk foto profil di bucket (misal: 'UUID_USER_ANDA/avatar.png')
    // Kita perlu mencoba beberapa ekstensi umum (png, jpg, jpeg) jika nama file selalu 'avatar'
    const possibleExtensions = ['png', 'jpg', 'jpeg', 'gif']; // Tambahkan ekstensi lain jika diperlukan
    let foundImageUrl = null;

    for (const ext of possibleExtensions) {
        const filePath = `${userId}/avatar.${ext}`; // Coba path dengan ekstensi ini

        // Coba dapatkan daftar file di folder pengguna di bucket storage
        // Ini untuk mengecek apakah ada file avatar di sana sebelum mencoba getPublicUrl
        const {
            data: files,
            error: listError
        } = await supabaseClient.storage
            .from('profile-pictures') // GANTI dengan NAMA BUCKET Supabase Storage Anda
            .list(userId + '/', {
                search: `avatar.${ext}` // Cari file dengan nama 'avatar.<ext>' di folder user
            });

        if (listError) {
            console.error(`Error listing file ${filePath}:`, listError.message);
            continue; // Coba ekstensi berikutnya
        }

        if (files && files.length > 0) {
            // File ditemukan, ambil URL publiknya
            const {
                data: publicData
            } = supabaseClient.storage
                .from('profile-pictures') // GANTI dengan NAMA BUCKET Supabase Storage Anda
                .getPublicUrl(filePath);

            if (publicData && publicData.publicUrl) {
                foundImageUrl = publicData.publicUrl;
                console.log('Profile picture found and loading from URL:', foundImageUrl);
                break; // Hentikan loop setelah menemukan URL
            }
        }
    }


    if (foundImageUrl) {
        userProfilePicElement.src = foundImageUrl; // Set src gambar ke URL publik yang ditemukan
    } else {
        // Jika tidak ada file avatar dengan ekstensi yang dicoba di folder pengguna
        console.log('No profile picture found for user or failed to load.', userId);
        userProfilePicElement.src = 'placeholder-profile-pic.png'; // Set src gambar ke placeholder
    }
}


// --- Logika Utama: Cek Status Login, Tampilkan Info Pengguna, dan Setup Listener ---
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
    const user = data.session.user; // Objek user Supabase

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

    // --- Logika Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            console.log('Attempting to log out...');
            showNotification('Memproses logout...', 'info'); // Notifikasi proses logout
            // Panggil fungsi signOut dari Supabase Auth
            const {
                error: logoutError
            } = await supabaseClient.auth.signOut();

            if (logoutError) {
                console.error('Error logging out:', logoutError.message);
                // Gunakan showNotification
                showNotification('Gagal logout: ' + logoutError.message, 'error'); // Tampilkan notifikasi error
            } else {
                console.log('Logout successful.');
                // Gunakan showNotification (opsional, karena langsung redirect)
                showNotification('Logout berhasil!', 'success'); // Notifikasi sukses (mungkin tidak terlihat jelas karena langsung redirect)
                // Setelah berhasil logout, Supabase akan menghapus sesi.
                // Redireksi kembali ke halaman login
                // Beri sedikit delay agar notifikasi sukses sempat terlihat (opsional)
                setTimeout(() => {
                    redirectToLogin();
                }, 50); // Delay 50ms
            }
        });
    } else {
        console.warn("Logout button with ID 'logoutButton' not found.");
    }

    // --- Logika FOTO PROFIL (Implemented) ---
    // Muat foto profil saat halaman dimuat
    if (user) {
        loadProfilePicture(user.id); // Panggil fungsi untuk memuat foto profil
    } else {
        console.warn("User object not available to load profile picture.");
        if (userProfilePicElement) userProfilePicElement.src = 'placeholder-profile-pic.png';
    }

    // Tambahkan listener untuk input file foto profil
    if (profilePicInput && user) {
        // Hapus listener lama jika ada (penting jika checkLoginStatusAndLoadUser dipanggil lebih dari sekali)
        profilePicInput.removeEventListener('change', handleProfilePicChange);
        // Tambahkan listener baru
        profilePicInput.addEventListener('change', handleProfilePicChange);
    } else {
        if (!profilePicInput) console.warn("Profile picture input with ID 'profilePicInput' not found.");
        if (!user) console.warn("User object not available to set up profile picture upload listener.");
    }

    // Handler terpisah untuk event change pada input foto profil
    async function handleProfilePicChange(e) {
        const file = e.target.files[0]; // Ambil file yang dipilih
        // BARIS PERBAIKAN SINTAKSIS: Dapatkan user lagi jika perlu, pastikan optional chaining benar
        const user = (await supabaseClient.auth.getSession()).data.session?.user;

        if (!file) {
            console.log("Tidak ada file yang dipilih untuk foto profil.");
            return;
        }
        console.log("File dipilih untuk foto profil:", file);

        if (!user) {
            console.error("User not found for profile picture upload.");
            showNotification("Gagal mengunggah foto: Pengguna tidak dikenali.", 'error'); // Gunakan showNotification
            e.target.value = null; // Reset input file
            return;
        }

        // Panggil fungsi untuk mengunggah file
        const publicUrl = await uploadProfilePicture(file, user.id);

        // Jika upload berhasil dan mendapatkan URL publik, tampilkan foto baru
        if (publicUrl && userProfilePicElement) {
            userProfilePicElement.src = publicUrl;
        }

        // Reset input file agar event 'change' terpicu lagi meskipun file yang sama dipilih
        e.target.value = null;
    }


    // --- TODO: Tambahkan logika untuk Bagian Unggah Foto Konten Umum & Galeri di sini ---\
    // Bagian ini memerlukan implementasi tambahan untuk:\
    // 1. Buat bucket Supabase Storage terpisah (misal: 'general-photos').\
    // 2. Atur RLS untuk bucket general-photos.\\\
    // 3. Logika JavaScript untuk menangani event 'change' atau 'drop' pada area upload umum.\\\
    // 4. Fungsi untuk mengunggah file-file umum ke bucket storage.\\\
    // 5. Logika untuk menyimpan metadata foto (user_id, url file, timestamp) di tabel database (misal: 'photos').\\\
    // 6. Fungsi untuk mengambil daftar foto pengguna dari tabel 'photos' saat halaman dimuat.\\\
    // 7. Logika untuk menampilkan daftar foto tersebut dalam grid galeri (#userPhotosGallery).\\\
    // 8. Opsional: fungsi untuk menghapus foto.\\\
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
// });