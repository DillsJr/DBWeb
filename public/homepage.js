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
// const generalPhotoInput = document.getElementById('generalPhotoInput'); // Dihapus
const userPhotosGalleryDiv = document.getElementById('userPhotosGallery');

// --- Elemen UI Profil (Overlay/Modal) ---\
const profileOverlay = document.getElementById('profileOverlay');
const profileSection = document.getElementById('profileSection'); // Container form/data profil
const closeProfileButton = document.getElementById('closeProfile'); // Tombol tutup profil
const profileForm = document.getElementById('profileForm'); // Form elemen <form> profil
const profileFullNameInput = document.getElementById('profileFullName'); // Input Nama Lengkap
const profileUsernameInput = document.getElementById('profileUsername'); // Input Username
const profileWhatsappInput = document.getElementById('profileWhatsapp'); // Input Whatsapp
const profileEmailInput = document.getElementById('profileEmail'); // Input Email (disabled)
const saveProfileButton = document.getElementById('saveProfileButton'); // Tombol Simpan Perubahan


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

// --- Event handler untuk input foto profil ---\
async function handleProfilePicChange(event) {
    const file = event.target.files[0]; // Ambil file pertama yang dipilih
    if (!file) {
        console.log("Tidak ada file foto profil yang dipilih.");
        return;
    }

    // Dapatkan user yang sedang login
    const {
        data: {
            user
        },
        error: getUserError
    } = await supabaseClient.auth.getUser();

    if (getUserError || !user) {
        console.error('Error mendapatkan pengguna saat upload foto profil:', getUserError ? getUserError.message : 'Pengguna tidak ditemukan.');
        showNotification('Gagal mengunggah foto: Pengguna tidak dikenali.', 'error');
        redirectToLogin(); // Redirect jika pengguna tidak valid
        return;
    }

    const userId = user.id;

    // Panggil fungsi unggah foto profil
    uploadProfilePicture(file, userId);
}


// --- Fungsi untuk Mengambil dan Menampilkan Foto Profil (saat halaman dimuat) ---\
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


// --- Fungsi untuk Memuat Data Profil Pengguna dan Mengisi Form Profil (Dipanggil saat modal dibuka) ---\
// Memanggil Supabase Auth dan mengisi input form profil
async function loadUserProfileData() {
    console.log("Mencoba memuat data profil pengguna untuk form...");
    // Dapatkan pengguna yang sedang login
    const {
        data: {
            user
        },
        error: getUserError
    } = await supabaseClient.auth.getUser();

    if (getUserError) {
        console.error('Error memuat data pengguna dari Auth:', getUserError.message);
        showNotification('Gagal memuat data pengguna.', 'error');
        // Redirect ke login jika error (kemungkinan sesi habis)
        redirectToLogin();
        // Opsional: Kosongkan form jika gagal memuat data
        if (profileForm) profileForm.reset();
        return;
    }

    if (!user) {
        console.log('Pengguna tidak ditemukan saat memuat data profil untuk form. Mungkin sesi habis.');
        // Redirect ke login jika pengguna tidak ada
        redirectToLogin();
        // Opsional: Kosongkan form
        if (profileForm) profileForm.reset();
        return;
    }

    console.log('Pengguna login:', user);

    // Ambil data dari user_metadata
    // Gunakan objek kosong {} sebagai fallback jika user_metadata null/undefined
    const userMetadata = user.user_metadata || {};
    const fullName = userMetadata.full_name || ''; // Default ke string kosong jika tidak ada
    const username = userMetadata.username || ''; // Default ke string kosong jika tidak ada
    const whatsapp = userMetadata.whatsapp || ''; // Default ke string kosong jika tidak ada
    const email = user.email || ''; // Email bisa diakses langsung dari user object


    console.log("Data metadata pengguna:", userMetadata);

    // --- Isi Form Profil ---
    // Pastikan elemen input ada sebelum mencoba mengisi nilainya
    if (profileFullNameInput) {
        profileFullNameInput.value = fullName;
        console.log("Form profil: Full Name diisi:", fullName);
    } else {
        console.warn("Input profileFullName tidak ditemukan.");
    }

    if (profileUsernameInput) {
        profileUsernameInput.value = username;
        console.log("Form profil: Username diisi:", username);
    } else {
        console.warn("Input profileUsername tidak ditemukan.");
    }

    if (profileWhatsappInput) {
        profileWhatsappInput.value = whatsapp;
        console.log("Form profil: Whatsapp diisi:", whatsapp);
    } else {
        console.warn("Input profileWhatsapp tidak ditemukan.");
    }

    // Email ditampilkan (disabled)
    if (profileEmailInput) {
        profileEmailInput.value = email;
        console.log("Form profil: Email diisi (disabled):", email);
    } else {
        console.warn("Input profileEmail tidak ditemukan.");
    }

    // Setelah mengisi form, kita bisa tampilkan nama di header (jika belum terisi atau perlu update)
    const displayUsername = username || fullName || 'Pengguna!'; // Tampilkan username, fallback ke nama lengkap, fallback ke 'Pengguna!'
    if (loggedInUsernameSpan && loggedInUsernameSpan.textContent !== displayUsername) {
        loggedInUsernameSpan.textContent = displayUsername;
        console.log("Username di header diperbarui:", displayUsername);
    }


    // Foto profil dimuat saat halaman awal dimuat di checkLoginStatusAndLoadBasicUser,
    // tidak perlu dipanggil lagi di sini kecuali jika ada fitur ganti foto profil dari modal.
    // loadProfilePicture(user.id);


    console.log("Data profil pengguna dimuat dan ditampilkan di form.");
}


// --- Fungsi untuk Mengupdate Profil Pengguna (Menangani Submit Form) ---\
async function handleProfileUpdate(event) {
    event.preventDefault(); // Mencegah reload halaman
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    // Dapatkan pengguna yang sedang login
    const {
        data: {
            user
        },
        error: getUserError
    } = await supabaseClient.auth.getUser();

    if (getUserError || !user) {
        console.error('Error mendapatkan pengguna saat update profil:', getUserError ? getUserError.message : 'Pengguna tidak ditemukan.');
        showNotification('Gagal memperbarui profil: Pengguna tidak dikenali.', 'error');
        redirectToLogin(); // Redirect jika pengguna tidak valid
        return;
    }

    const userId = user.id;

    // Ambil nilai baru dari form
    const newFullName = profileFullNameInput ? profileFullNameInput.value.trim() : '';
    const newUsername = profileUsernameInput ? profileUsernameInput.value.trim() : '';
    const newWhatsapp = profileWhatsappInput ? profileWhatsappInput.value.trim() : '';

    // Validasi dasar (opsional, sesuaikan kebutuhan)
    // Anda bisa tambahkan validasi yang lebih spesifik (misal: format whatsapp, username unik di database)
    if (!newFullName && !newUsername && !newWhatsapp) {
        console.log("Semua field profil kosong.");
        // showNotification('Setidaknya salah satu field (Nama Lengkap, Username, Whatsapp) harus diisi.', 'warning');
        // return;
        // Membiarkan kosong juga bisa, tergantung desain aplikasi
    }

    console.log('Memproses update profil untuk user ID:', userId);
    showNotification('Menyimpan perubahan profil...', 'info');

    // Disable the button to prevent multiple clicks
    if (saveProfileButton) saveProfileButton.disabled = true;


    try {
        // Panggil fungsi updateUser dari Supabase Auth
        const {
            data,
            error
        } = await supabaseClient.auth.updateUser({
            data: { // Metadata baru yang ingin disimpan
                full_name: newFullName,
                username: newUsername,
                whatsapp: newWhatsapp,
            }
        });

        if (error) {
            console.error('Error update profil Supabase:', error.message);
            showNotification('Error update profil: ' + error.message, 'error');
        } else {
            console.log('Profil Supabase berhasil diperbarui:', data);
            showNotification('Profil berhasil diperbarui!', 'success');

            // --- KRITIS: Perbarui tampilan UI dan tutup modal setelah sukses ---

            // 1. Perbarui data yang ditampilkan di header dan muat ulang data di form
            // Ini penting agar data terbaru tampil di halaman setelah save
            loadUserProfileData(); // Memuat ulang data profil dan mengisi form

            // 2. Tutup modal profil setelah sukses dengan sedikit delay
            setTimeout(hideProfileSection, 1500); // Beri sedikit waktu agar notifikasi sukses terlihat

            // Jika Anda *benar-benar* ingin full page refresh, ganti dua baris di atas dengan:
            // setTimeout(() => { window.location.reload(); }, 1500); // Beri sedikit waktu agar notifikasi terlihat sebelum reload
        }
    } catch (e) {
        console.error('Error tidak terduga saat update profil:', e);
        showNotification('Terjadi error tidak terduga saat update profil.', 'error');
    } finally {
        // Re-enable the button after the process is complete
        if (saveProfileButton) saveProfileButton.disabled = false;
    }
}


// --- Fungsi untuk Menampilkan/Menyembunyikan Overlay Profil ---
function showProfileSection() {
    // Saat menampilkan, muat data profil dulu
    loadUserProfileData(); // Panggil fungsi untuk memuat data dan mengisi form

    if (profileOverlay) {
        profileOverlay.classList.remove('hidden-overlay');
        console.log("Overlay profil ditampilkan.");
        // Opsional: Tambahkan kelas ke body untuk mencegah scrolling di belakang overlay
        document.body.classList.add('no-scroll');
    } else {
        console.warn("Elemen overlay profil tidak ditemukan.");
    }
}

function hideProfileSection() {
    if (profileOverlay) {
        profileOverlay.classList.add('hidden-overlay');
        console.log("Overlay profil disembunyikan.");
        // Opsional: Hapus kelas dari body
        document.body.classList.remove('no-scroll');
    } else {
        console.warn("Elemen overlay profil tidak ditemukan.");
    }
}


// --- Fungsi Utama untuk Mengecek Status Login dan Memuat Data Pengguna Awal ---\
// Hanya cek login dan muat data dasar yang ditampilkan langsung di halaman utama
async function checkLoginStatusAndLoadBasicUser() {
    console.log("Mengecek status login...");

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
    console.log('Logged in user ID:', session.user.id);

    // Muat dan tampilkan foto profil saat halaman dimuat
    loadProfilePicture(session.user.id);

    // Muat dan tampilkan username/nama di header saat halaman dimuat
    // Ambil data pengguna (username/nama) untuk ditampilkan di header
    // Panggil loadUserProfileData dengan async/await
    const {
        data: {
            user: loggedInUser
        },
        error: getUserErrorForHeader
    } = await supabaseClient.auth.getUser();

    if (loggedInUser) {
        const userMetadata = loggedInUser.user_metadata || {};
        const username = userMetadata.username || '';
        const fullName = userMetadata.full_name || '';
        const displayUsername = username || fullName || 'Pengguna!';
        if (loggedInUsernameSpan) {
            loggedInUsernameSpan.textContent = displayUsername;
            console.log("Username di header diperbarui (on load):", displayUsername);
        }
    } else {
        console.warn("Pengguna tidak ditemukan saat mencoba menampilkan nama di header.");
        if (loggedInUsernameSpan) loggedInUsernameSpan.textContent = 'Pengguna!';
    }


    console.log("Status login dicek. Pengguna terotentikasi.");

    // TODO: Implementasi Fitur Galeri Foto (Menampilkan foto pengguna)
    // Bagian galeri foto umum masih ada di HTML tapi belum ada logika JS
    // generalPhotoInput dan logika terkaitnya sudah dihapus sebelumnya.
    console.log("Bagian galeri foto pengguna belum diimplementasikan.");

}


// --- Event Listener Utama (saat DOM siap) ---\
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing homepage...");

    // --- Cek Kelengkapan Struktur HTML KRITIS ---\
    // Melakukan cek dasar apakah semua elemen yang dibutuhkan ditemukan di DOM
    // Daftar elemen yang dicek disesuaikan dengan elemen yang kita gunakan di script ini.
    // Menghapus cek untuk generalPhotoInput
    if (!notification || !logoutButton || !profileIcon || !loggedInUsernameSpan || !userProfilePicImg || !profilePicInput || !userPhotosGalleryDiv || !profileOverlay || !profileSection || !closeProfileButton || !profileForm || !profileFullNameInput || !profileUsernameInput || !profileWhatsappInput || !profileEmailInput || !saveProfileButton) {
        console.error("HTML structure for homepage elements is not complete. Cannot initialize some features.");
        showNotification('Error: Struktur halaman beranda tidak lengkap. Cek console.', 'error');
        // Lanjutkan eksekusi agar fitur yang elemennya ditemukan tetap bisa bekerja
    } else {
        console.log("HTML structure check passed. All required homepage elements found. Attaching listeners...");

        // Jalankan fungsi utama: cek login, muat data pengguna dasar (untuk header/foto profil)
        checkLoginStatusAndLoadBasicUser();

        // Listener untuk tombol logout
        logoutButton.addEventListener('click', handleLogout);
        console.log("Event listener untuk tombol logout terpasang.");

        // Listener untuk input file foto profil
        profilePicInput.addEventListener('change', handleProfilePicChange);
        console.log("Event listener untuk input foto profil terpasang.");

        // Listener untuk membuka section profil saat ikon diklik
        profileIcon.addEventListener('click', showProfileSection);
        console.log("Event listener untuk ikon profil terpasang.");

        // Listener untuk menutup section profil saat tombol tutup diklik
        closeProfileButton.addEventListener('click', hideProfileSection);
        console.log("Event listener untuk tombol tutup profil terpasang.");

        // Listener untuk menutup section profil saat mengklik di luar profile-section (pada overlay)
        profileOverlay.addEventListener('click', (event) => {
            // Cek jika target klik adalah overlay itu sendiri, BUKAN di dalam profile-section
            if (event.target === profileOverlay) {
                hideProfileSection();
            }
        });
        console.log("Event listener overlay profil terpasang.");


        // Listener submit untuk form profil (Update)
        profileForm.addEventListener('submit', handleProfileUpdate);
        console.log("Event listener untuk form profil terpasang.");


        // --- TODO: Implementasi Fitur Galeri Foto ---
        // Bagian ini memerlukan implementasi tambahan untuk:
        // 1. Buat bucket Supabase Storage terpisah (misal: 'user-gallery').
        // 2. Atur RLS untuk bucket user-gallery.
        // 3. Logika JavaScript untuk menangani unggah foto ke galeri (jika ada tombol/area unggah terpisah).
        // 4. Logika untuk menyimpan metadata foto (user_id, url file, timestamp) di tabel database (misal: 'user_photos').
        // 5. Fungsi untuk mengambil daftar foto pengguna dari tabel 'user_photos' saat halaman dimuat.
        // 6. Logika untuk menampilkan daftar foto tersebut dalam grid galeri (#userPhotosGallery).
        // 7. Opsional: fungsi untuk menghapus foto dari galeri.
        // Catatan: Input generalPhotoInput dan logic unggah umum sudah dihapus sebelumnya.
        console.log("Bagian galeri foto pengguna belum diimplementasikan.");
    }

}); // Akhir DOMContentLoaded

// Optional: Listener onAuthStateChange jika perlu menangani event seperti 'SIGNED_OUT' atau 'USER_UPDATED' secara real-time
// supabaseClient.auth.onAuthStateChange((event, session) => {
//     if (event === 'SIGNED_OUT') {
//         console.log('SIGNED_OUT event detected on homepage. Redirecting to login.');
//         redirectToLogin();
//     }
//     // Menangani USER_UPDATED event: Jika profil diupdate di tab lain,
//     // kita bisa memuat ulang data di tab ini.
//     if (event === 'USER_UPDATED' && session && session.user) {
//          console.log('USER_UPDATED event detected. Reloading profile data if modal is open.');
//          // Jika modal profil sedang terbuka, muat ulang datanya.
//          if (profileOverlay && !profileOverlay.classList.contains('hidden-overlay')) {
//              loadUserProfileData(); // Muat ulang data profil
//          }
//     }
// });