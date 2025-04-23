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
const profileIcon = document.getElementById('profileIcon'); // Ambil elemen ikon profil di header

// --- Elemen UI Konten Utama Homepage ---\
const loggedInUsernameSpan = document.getElementById('loggedInUsername'); // Elemen untuk menampilkan username/nama di welcome message
const userProfilePicImg = document.getElementById('userProfilePic'); // Elemen <img> untuk menampilkan foto profil di halaman utama
const profilePicInput = document.getElementById('profilePicInput'); // Input file untuk memilih foto profil (sekarang di dalam modal)
// generalPhotoInput (input file unggah umum) dihapus karena sectionnya dihilangkan
const userPhotosGalleryDiv = document.getElementById('userPhotosGallery'); // Container untuk galeri foto pengguna

// --- Elemen UI Profil (Overlay/Modal) ---\
const profileOverlay = document.getElementById('profileOverlay'); // Elemen overlay gelap
const profileSection = document.getElementById('profileSection'); // Container utama modal profil
const closeProfileButton = document.getElementById('closeProfile'); // Tombol tutup modal
const profileForm = document.getElementById('profileForm'); // Form elemen <form> di modal
const profileFullNameInput = document.getElementById('profileFullName'); // Input Nama Lengkap di form
const profileUsernameInput = document.getElementById('profileUsername'); // Input Username di form
const profileWhatsappInput = document.getElementById('profileWhatsapp'); // Input Whatsapp di form
const profileEmailInput = document.getElementById('profileEmail'); // Input Email di form (biasanya disabled)
const saveProfileButton = document.getElementById('saveProfileButton'); // Tombol Simpan Perubahan di form


// --- Fungsi Notifikasi (Salin dari script.js, pastikan elemen ada di homepage.html) ---\
function showNotification(message, type = 'info') {
    if (!notification) {
        console.error("Notification element with ID 'custom-notification' not found.");
        return;
    }
    notification.textContent = message;
    notification.className = 'custom-notification ' + type; // Tambahkan kelas 'info', 'success', atau 'error'
    notification.style.display = 'block';

    // Sembunyikan setelah 5 detik
    setTimeout(() => {
        hideNotification();
    }, 5000);
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
// Fungsi ini dipanggil ketika pengguna memilih file di input file foto profil dalam modal.
// Fungsi ini akan mengunggah file ke Supabase Storage bucket 'avatars'.
async function uploadProfilePicture(file, userId) {
    if (!file || !userId) {
        console.error("File atau User ID tidak ada untuk upload.");
        showNotification("Gagal mengunggah foto: File tidak valid atau pengguna tidak dikenali.", "error");
        return null; // Mengembalikan null jika gagal
    }

    const fileExt = file.name.split('.').pop().toLowerCase(); // Get extension and convert to lowercase
    // KRITIS: Beri nama file berdasarkan user ID agar mudah diakses dan dikelola RLS
    // Menggunakan nama seperti `${userId}.${fileExt}` akan menimpa foto lama pengguna DENGAN NAMA DAN EKSTENSI YANG SAMA jika upsert true
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${fileName}`; // File disimpan di root bucket dengan nama UUID.ext

    try {
        showNotification('Memproses unggah foto profil...', 'info');
        // Opsional: Disable input file dan tombol simpan sementara saat upload berlangsung
        // if (profilePicInput) profilePicInput.disabled = true;
        // if (saveProfileButton) saveProfileButton.disabled = true;


        // --- KRITIS: Hapus foto profil lama dengan ekstensi berbeda ---
        console.log(`Mencari foto profil lama untuk user ID: ${userId} dengan ekstensi selain ${fileExt}`);
        // List files in the root directory '' that start with the user ID prefix
        const {
            data: oldFiles,
            error: listError
        } = await supabaseClient.storage
            .from('avatars')
            .list('', {
                prefix: userId,
                search: userId // Menggunakan search atau prefix saja bisa, tergantung struktur Supabase Anda
            });

        if (listError) {
            console.error('Error saat listing file lama:', listError);
            // Lanjutkan proses upload meskipun gagal listing
        } else if (oldFiles && oldFiles.length > 0) {
            console.log("Ditemukan file lama yang dimulai dengan user ID:", oldFiles);
            // Filter file yang namanya dimulai dengan user ID.ekstensi (untuk menghindari folder jika ada)
            // dan ekstensinya berbeda dari file yang baru diunggah.
            const filesToDelete = oldFiles
                .filter(oldFile =>
                    // Cek apakah nama file dimulai persis dengan userId + '.' + ekstensi
                    // DAN ekstensi file lama BUKAN yang sedang diunggah
                    // Pastikan juga itu bukan direktori (direktori punya 'id', objek punya 'name')
                    oldFile.name.startsWith(`${userId}.`) &&
                    oldFile.name.split('.').pop().toLowerCase() !== fileExt &&
                    oldFile.name !== userId // Hindari menghapus folder jika nama folder = userId
                    // Note: Jika Anda menyimpan file di folder seperti 'user_id/file.ext', logika ini perlu disesuaikan
                )
                .map(oldFile => oldFile.name); // Ambil path/nama lengkap file untuk dihapus

            if (filesToDelete.length > 0) {
                console.log("File lama yang akan dihapus:", filesToDelete);
                const {
                    error: deleteError
                } = await supabaseClient.storage
                    .from('avatars')
                    .remove(filesToDelete); // Hapus file menggunakan array of paths

                if (deleteError) {
                    console.error('Error saat menghapus file lama:', deleteError);
                    showNotification('Gagal menghapus foto profil lama: ' + deleteError.message, 'warning');
                    // Lanjutkan proses upload meskipun gagal menghapus
                } else {
                    console.log('File lama berhasil dihapus:', filesToDelete);
                    showNotification('Foto profil lama berhasil dihapus.', 'info');
                }
            } else {
                console.log("Tidak ada file lama dengan ekstensi berbeda yang perlu dihapus.");
            }
        } else {
            console.log("Tidak ada file lama yang ditemukan untuk user ID:", userId);
        }
        // --- END KRITIS: Hapus foto profil lama ---


        // --- Lakukan proses unggah file baru ---
        console.log(`Mengunggah file baru ke path: ${filePath}`);
        const {
            data: uploadData,
            error: uploadError
        } = await supabaseClient.storage
            .from('avatars') // GANTI dengan nama bucket Storage untuk foto profil Anda (harus 'avatars')
            .upload(filePath, file, {
                cacheControl: '3600', // Cache selama 1 jam (bisa disesuaikan)
                upsert: true // Timpa file jika sudah ada dengan nama DAN EKSTENSI YANG SAMA
            });

        if (uploadError) {
            console.error('Error mengunggah foto profil ke Storage:', uploadError);
            showNotification('Gagal mengunggah foto profil: ' + uploadError.message, 'error');
            return null;
        }

        console.log("Respon unggah file baru:", uploadData); // Log data hasil unggah

        // Setelah berhasil diunggah, dapatkan URL publiknya untuk ditampilkan
        const {
            data: publicUrlData
        } = supabaseClient.storage
            .from('avatars') // GANTI dengan nama bucket Storage untuk foto profil Anda (harus 'avatars')
            .getPublicUrl(filePath); // Gunakan filePath yang sama dengan yang diunggah

        const publicUrl = publicUrlData ? publicUrlData.publicUrl : null;

        if (publicUrl) {
            console.log("URL publik foto profil:", publicUrl);
            // Opsional: Update URL foto profil di database pengguna atau metadata Auth jika perlu
            // await updateUserProfileDatabase(userId, publicUrl);

            // Tampilkan foto yang baru diunggah di halaman utama SEGERA
            // Ini akan memperbarui tampilan tanpa harus menunggu modal ditutup
            if (userProfilePicImg) {
                userProfilePicImg.src = publicUrl;
                console.log("Gambar foto profil di halaman utama diperbarui SEGERA setelah unggah.");
            }

            showNotification('Foto profil berhasil diunggah!', 'success');

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
    } finally {
        // Opsional: Re-enable input file dan tombol simpan setelah proses selesai
        // if (profilePicInput) profilePicInput.disabled = false;
        // if (saveProfileButton) saveProfileButton.disabled = false;
    }
}

// --- Event handler untuk input foto profil (Dipanggil saat file dipilih di modal) ---\
// Ini dipasang pada input type="file" di dalam modal profil
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
        console.error('Error mendapatkan pengguna saat memilih foto profil:', getUserError ? getUserError.message : 'Pengguna tidak dikenali.');
        showNotification('Gagal mengunggah foto: Pengguna tidak dikenali.', 'error');
        redirectToLogin(); // Redirect jika pengguna tidak valid
        return;
    }

    const userId = user.id;

    // Panggil fungsi unggah foto profil
    uploadProfilePicture(file, userId);

    // Opsional: Reset input file setelah dipilih (agar event change terpicu lagi jika file yang sama dipilih)
    // Ini penting agar jika pengguna memilih file yang sama lagi, event 'change' tetap aktif.
    event.target.value = ''; // Mengatur ulang nilai input file
}


// --- Fungsi untuk Mengambil dan Menampilkan Foto Profil (saat halaman dimuat & setelah modal ditutup) ---\
// Fungsi ini akan mengambil URL foto profil (dari Storage atau database) dan menampilkannya di elemen <img> di halaman utama.
async function loadProfilePicture(userId) {
    if (!userId) {
        console.error("User ID tidak ada untuk memuat foto profil.");
        // Tampilkan placeholder jika User ID tidak ada
        if (userProfilePicImg) userProfilePicImg.src = 'users.png'; // Menggunakan users.png sebagai placeholder
        return;
    }

    console.log("Memuat foto profil untuk user ID:", userId);

    // KRITIS: Cara Mendapatkan URL publik dari Storage (jika nama file berdasarkan User ID)
    // Ini adalah cara utama kita menampilkan foto profil di halaman utama.
    // URL ini harus sesuai dengan cara file dinamai dan disimpan di bucket 'avatars'.
    // Di fungsi upload, kita menamai file `${userId}.${fileExt}`, jadi kita coba ekstensi umum.
    try {
        const possibleExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp']; // Menambah webp, bisa disesuaikan
        let publicUrl = null;

        // Iterasi mencoba setiap ekstensi yang mungkin
        for (const ext of possibleExtensions) {
            const filePath = `${userId}.${ext}`; // Coba nama file format UUID.ekstensi
            // Menggunakan getPublicUrl untuk mendapatkan URL yang bisa diakses publik
            const {
                data
            } = supabaseClient.storage
                .from('avatars') // GANTI dengan nama bucket Storage untuk foto profil Anda (harus 'avatars')
                .getPublicUrl(filePath);

            // getPublicUrl Supabase akan selalu mengembalikan URL,
            // tetapi URL tersebut akan menghasilkan 404 jika file tidak ada.
            // Browser akan menampilkan gambar placeholder/broken icon jika URL 404.
            // Set src langsung jika URL didapat.
            // Penting: Supabase menambahkan parameter cache busting otomatis ke Public URL.
            // Ini membantu browser memuat ulang gambar saat file di-upsert.
            if (data && data.publicUrl) {
                // Di sini, kita tidak 100% yakin URL ini valid (file ada di Storage),
                // tapi ini cara paling sederhana untuk mendapatkan URL publik.
                // Jika URL ini mengarah ke file yang sudah dihapus atau belum ada,
                // browser akan menampilkan alt text atau icon broken image.
                publicUrl = data.publicUrl;
                // Hentikan loop jika menemukan URL yang valid
                break;
            }
        }

        // Set src gambar foto profil di halaman utama
        if (userProfilePicImg) {
            if (publicUrl) {
                console.log("Ditemukan URL publik foto profil di Storage:", publicUrl);
                userProfilePicImg.src = publicUrl;
            } else {
                console.log("Foto profil tidak ditemukan di Storage untuk user ID:", userId);
                // Tampilkan gambar placeholder jika foto profil tidak ditemukan setelah mencoba semua ekstensi
                userProfilePicImg.src = 'users.png'; // Pastikan file placeholder ini ada
            }
        } else {
            console.warn("Elemen img foto profil (#userProfilePic) tidak ditemukan.");
        }

    } catch (e) {
        console.error('Error memuat foto profil dari Storage:', e);
        // Tampilkan gambar placeholder jika terjadi error
        if (userProfilePicImg) userProfilePicImg.src = 'users.png';
    }

}


// --- Fungsi untuk Memuat Data Profil Pengguna dan Mengisi Form Profil (Dipanggil saat modal dibuka) ---\
// Memanggil Supabase Auth dan mengisi input form profil dengan data dari user_metadata
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
        redirectToLogin();
        if (profileForm) profileForm.reset();
        return;
    }

    if (!user) {
        console.log('Pengguna tidak ditemukan saat memuat data profil untuk form. Mungkin sesi habis.');
        redirectToLogin();
        if (profileForm) profileForm.reset();
        return;
    }

    console.log('Pengguna login:', user);

    // Ambil data dari user_metadata
    const userMetadata = user.user_metadata || {};
    const fullName = userMetadata.full_name || '';
    const username = userMetadata.username || '';
    const whatsapp = userMetadata.whatsapp || '';
    const email = user.email || ''; // Email dari objek user utama, bukan metadata

    console.log("Data metadata pengguna:", userMetadata);
    console.log(`Email: ${email}, Full Name: ${fullName}, Username: ${username}, Whatsapp: ${whatsapp}`);


    // --- Isi Form Profil ---
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

    // Email ditampilkan (disabled) - tidak bisa diubah dari sini
    if (profileEmailInput) {
        profileEmailInput.value = email;
        console.log("Form profil: Email diisi (disabled):", email);
    } else {
        console.warn("Input profileEmail tidak ditemukan.");
    }

    // Catatan: Foto profil dimuat di halaman utama saat load dan setelah modal ditutup.
    // Tidak perlu memuatnya lagi di sini saat modal dibuka.

    console.log("Data profil pengguna dimuat dan ditampilkan di form.");
}


// --- Fungsi untuk Mengupdate Profil Pengguna (Menangani Submit Form di Modal) ---\
// Dipanggil saat form profil disubmit.
async function handleProfileUpdate(event) {
    event.preventDefault(); // Mencegah reload halaman default form
    hideNotification(); // Sembunyikan notifikasi sebelumnya

    const {
        data: {
            user
        },
        error: getUserError
    } = await supabaseClient.auth.getUser();

    if (getUserError || !user) {
        console.error('Error mendapatkan pengguna saat update profil:', getUserError ? getUserError.message : 'Pengguna tidak dikenali.');
        showNotification('Gagal memperbarui profil: Pengguna tidak dikenali.', 'error');
        redirectToLogin();
        return;
    }

    const userId = user.id;

    // Ambil nilai baru dari form
    const newFullName = profileFullNameInput ? profileFullNameInput.value.trim() : '';
    const newUsername = profileUsernameInput ? profileUsernameInput.value.trim() : '';
    const newWhatsapp = profileWhatsappInput ? profileWhatsappInput.value.trim() : '';

    // Validasi dasar (opsional)
    if (!newFullName && !newUsername && !newWhatsapp) {
        console.log("Semua field profil kosong atau hanya spasi.");
        // showNotification('Setidaknya salah satu field (Nama Lengkap, Username, Whatsapp) harus diisi.', 'warning');
        // return; // Batalkan update jika setidaknya satu field kosong/spasi
    }

    console.log('Memproses update profil untuk user ID:', userId);
    showNotification('Menyimpan perubahan profil...', 'info');

    // Disable tombol simpan untuk mencegah klik ganda saat proses berlangsung
    if (saveProfileButton) saveProfileButton.disabled = true;


    try {
        // Panggil fungsi updateUser dari Supabase Auth
        const {
            data,
            error
        } = await supabaseClient.auth.updateUser({
            data: { // Objek 'data' ini akan MERGE dengan metadata yang sudah ada
                full_name: newFullName,
                username: newUsername,
                whatsapp: newWhatsapp,
            }
            // Catatan: Perubahan email atau password menggunakan parameter yang berbeda pada updateUser(),
            // dan seringkali memerlukan alur verifikasi email terpisah.
        });

        if (error) {
            console.error('Error update profil Supabase:', error.message);
            showNotification('Error update profil: ' + error.message, 'error');
        } else {
            console.log('Profil Supabase berhasil diperbarui:', data);
            showNotification('Profil berhasil diperbarui!', 'success');

            // --- KRITIS: Perbarui tampilan UI dan tutup modal setelah sukses ---

            // 1. Muat ulang data profil untuk memperbarui header dan form (jika modal dibuka lagi)
            // Supabase Auth secara otomatis memperbarui sesi setelah updateUser,
            // jadi getuser() berikutnya akan mendapatkan data terbaru.
            loadUserProfileData();

            // 2. Tutup modal profil setelah sukses dengan sedikit delay
            setTimeout(hideProfileSection, 1500); // Beri sedikit waktu agar notifikasi sukses terlihat

            // Jika Anda *benar-benar* ingin full page refresh, ganti dua baris di atas dengan:
            // setTimeout(() => { window.location.reload(); }, 1500); // Beri sedikit waktu agar notifikasi terlihat sebelum reload
        }
    } catch (e) {
        console.error('Error tidak terduga saat update profil.', e);
        showNotification('Terjadi error tidak terduga saat update profil.', 'error');
    } finally {
        // Pastikan tombol simpan kembali aktif setelah proses selesai (baik sukses maupun error)
        if (saveProfileButton) saveProfileButton.disabled = false;
    }
}


// --- Fungsi untuk Menampilkan/Menyembunyikan Overlay Profil ---
function showProfileSection() {
    // Saat menampilkan, muat data profil dulu agar form terisi data terbaru
    loadUserProfileData();

    if (profileOverlay) {
        profileOverlay.classList.remove('hidden-overlay');
        console.log("Overlay profil ditampilkan.");
        // Tambahkan kelas ke body untuk mencegah scrolling halaman di belakang overlay
        document.body.classList.add('no-scroll');
    } else {
        console.warn("Elemen overlay profil (#profileOverlay) tidak ditemukan.");
    }
}

function hideProfileSection() {
    if (profileOverlay) {
        profileOverlay.classList.add('hidden-overlay');
        console.log("Overlay profil disembunyikan.");
        document.body.classList.remove('no-scroll'); // Mengaktifkan kembali scrolling body
        // Opsional: Reset input file agar tidak menampilkan nama file yang dipilih sebelumnya
        if (profilePicInput) profilePicInput.value = '';

        // --- KRITIS: Panggil fungsi untuk memuat ulang foto profil di halaman utama ---
        // Panggil loadProfilePicture setelah modal ditutup untuk memastikan gambar di halaman utama diperbarui.
        // Mendapatkan user ID di sini menggunakan getUser() secara asynchronous.
        supabaseClient.auth.getUser().then(({
            data: {
                user
            }
        }) => {
            if (user) {
                console.log("Memuat ulang foto profil di halaman utama setelah modal ditutup.");
                loadProfilePicture(user.id); // Panggil fungsi muat foto
            } else {
                console.warn("Tidak dapat memuat ulang foto profil di halaman utama: Pengguna tidak ditemukan setelah modal ditutup.");
                // Jika pengguna tidak ada, setel kembali ke placeholder
                if (userProfilePicImg) userProfilePicImg.src = 'users.png'; // Menggunakan users.png sebagai placeholder
            }
        }).catch(e => {
            console.error("Error mendapatkan pengguna untuk memuat ulang foto profil setelah modal ditutup:", e);
            // Jika error, setel kembali ke placeholder
            if (userProfilePicImg) userProfilePicImg.src = 'users.png'; // Menggunakan users.png sebagai placeholder
        });

        // --- END KRITIS ---

    } else {
        console.warn("Elemen overlay profil (#profileOverlay) tidak ditemukan untuk disembunyikan.");
    }
}


// --- Fungsi Utama untuk Mengecek Status Login dan Memuat Data Pengguna Awal (saat halaman dimuat) ---\
// Dipanggil saat DOMContentLoaded. Mengecek sesi, jika ada, memuat foto profil dan nama di header.
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
        redirectToLogin();
        return; // Hentikan eksekusi lebih lanjut
    }

    if (!session) {
        console.log('No active session found. Redirecting to login page.');
        redirectToLogin();
        return; // Hentikan eksekusi lebih lanjut
    }

    // Jika sesi ditemukan, artinya pengguna sudah login
    console.log('Active session found:', session);
    console.log('Logged in user ID:', session.user.id);

    // Muat dan tampilkan foto profil di halaman utama saat halaman dimuat
    loadProfilePicture(session.user.id);

    // Muat dan tampilkan username/nama di header saat halaman dimuat
    // Dapatkan objek user lengkap untuk mengakses metadata
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
        // Tentukan apa yang ditampilkan di header: username jika ada, fallback ke nama lengkap, fallback ke 'Pengguna!'
        const displayUsername = username || fullName || 'Pengguna!';
        if (loggedInUsernameSpan) {
            loggedInUsernameSpan.textContent = displayUsername;
            console.log("Username di header diperbarui (on load):", displayUsername);
        }
    } else {
        console.warn("Pengguna tidak ditemukan saat mencoba menampilkan nama di header saat halaman dimuat.");
        if (loggedInUsernameSpan) loggedInUsernameSpan.textContent = 'Pengguna!';
    }


    console.log("Status login dicek. Pengguna terotentikasi.");

    // TODO: Implementasi Fitur Galeri Foto (Mengambil dan Menampilkan foto-foto lain milik pengguna)
    // Bagian HTML galeri foto pengguna masih ada, tapi belum ada logika JS untuk mengisi/mengelolanya.
    // General photo upload section sudah dihapus di langkah sebelumnya.
    console.log("Bagian galeri foto pengguna belum diimplementasikan.");

}


// --- Event Listener Utama (saat seluruh DOM siap) ---\
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing homepage...");

    // --- Cek Kelengkapan Struktur HTML KRITIS ---\
    // Melakukan cek dasar apakah semua elemen UI yang dibutuhkan oleh script ini ada di DOM.
    // Ini membantu mendeteksi jika ada ID elemen yang salah di HTML.
    if (
        !notification ||
        !logoutButton ||
        !profileIcon ||
        !loggedInUsernameSpan ||
        !userProfilePicImg ||
        !profilePicInput || // Check input file (sekarang di modal)
        !userPhotosGalleryDiv ||
        !profileOverlay ||
        !profileSection ||
        !closeProfileButton ||
        !profileForm ||
        !profileFullNameInput ||
        !profileUsernameInput ||
        !profileWhatsappInput ||
        !profileEmailInput ||
        !saveProfileButton
    ) {
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

        // Listener untuk input file foto profil (sekarang di modal)
        // Event ini terpicu saat pengguna *memilih* file di input file
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
        // Event ini terpicu saat pengguna mengklik tombol 'Simpan Perubahan' dalam form
        profileForm.addEventListener('submit', handleProfileUpdate);
        console.log("Event listener untuk form profil terpasang.");


        // --- TODO: Implementasi Fitur Galeri Foto ---
        // Bagian ini memerlukan implementasi tambahan untuk:
        // 1. Buat bucket Supabase Storage terpisah untuk galeri (misal: 'user-gallery').
        // 2. Atur RLS untuk bucket user-gallery.
        // 3. Logika JavaScript untuk menangani unggah foto ke galeri (jika ada tombol/area unggah terpisah di halaman).
        // 4. Logika untuk menyimpan metadata foto (user_id, url file, timestamp) di tabel database (misal: 'user_photos').
        // 5. Fungsi untuk mengambil daftar foto pengguna dari tabel 'user_photos' saat halaman dimuat.
        // 6. Logika untuk menampilkan daftar foto tersebut dalam grid galeri (#userPhotosGallery).
        // 7. Opsional: fungsi untuk menghapus foto.
        console.log("Bagian galeri foto pengguna belum diimplementasikan.");
    }

}); // Akhir DOMContentLoaded

// Optional: Listener onAuthStateChange
// supabaseClient.auth.onAuthStateChange((event, session) => {
//     // Listener ini berguna jika state otentikasi berubah (misal, pengguna login/logout
//     // di tab lain atau sesi berakhir).
//     console.log('Auth state change:', event, session);
//     if (event === 'SIGNED_OUT') {
//         console.log('SIGNED_OUT event detected on homepage. Redirecting to login.');
//         redirectToLogin(); // Redirect ke halaman login jika pengguna logout
//     }
//     // Anda bisa menambahkan logika di sini untuk menangani event 'SIGNED_IN' atau 'USER_UPDATED'
//     // jika perlu memperbarui UI secara real-time tanpa refresh penuh saat aksi terjadi di tab lain.
//     // Contoh: Jika 'USER_UPDATED' terdeteksi, panggil loadUserProfileData() jika modal profil sedang terbuka.
//     if (event === 'USER_UPDATED' && session && session.user) {
//          console.log('USER_UPDATED event detected. Reloading profile data if modal is open.');
//          if (profileOverlay && !profileOverlay.classList.contains('hidden-overlay')) {
//              loadUserProfileData(); // Muat ulang data profil
//          }
//     }
// });