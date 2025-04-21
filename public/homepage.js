// public/homepage.js

// --- INISIALISASI SUPABASE (Ganti dengan URL dan Anon Key Proyek Anda) ---
const SUPABASE_URL = 'https://gdhetudsmvypfpksggqp.supabase.co'; // Ganti dengan URL proyek Supabase Anda
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // Ganti dengan Anon Key proyek Supabase Anda

const {
    createClient
} = supabase; // Asumsi Supabase SDK dimuat di homepage.html atau di sini
// Jika Supabase SDK tidak dimuat di HTML, uncomment baris berikut dan pastikan Anda memiliki file supabase.js lokal atau gunakan CDN di HTML
// import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// --- AKHIR INISIALISASI SUPABASE ---


document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements ---
    const usernameSpan = document.getElementById('loggedInUsername');
    const logoutButton = document.getElementById('logoutButton');
    const profilePicElement = document.getElementById('userProfilePic');
    const profileUploadArea = document.getElementById('profileUploadArea'); // Area/Tombol upload foto profil
    const profilePicInput = document.getElementById('profilePicInput'); // Input file foto profil
    const notificationElement = document.getElementById('custom-notification'); // Elemen untuk notifikasi

    // --- Elemen Baru untuk Foto Konten Umum ---
    const generalPhotoInput = document.getElementById('generalPhotoInput'); // Input file foto konten umum
    const generalUploadArea = document.getElementById('generalUploadArea'); // Area/Tombol upload foto konten umum
    const uploadPreviewArea = document.getElementById('uploadPreviewArea'); // Area untuk menampilkan preview/status upload
    const userPhotosGallery = document.getElementById('userPhotosGallery'); // Kontainer untuk menampilkan foto galeri
    const noPhotosMessage = document.getElementById('noPhotosMessage'); // Pesan jika belum ada foto


    // --- Variabel Pengguna dari Supabase ---
    let currentUser = null; // Objek user dari Supabase Auth
    let currentUserId = null; // ID user dari Supabase Auth (UUID)
    let currentUserIdentifier = 'Pengguna!'; // Identifier untuk ditampilkan di UI (akan diambil dari profiles)


    // --- Fungsi Notifikasi Kustom (Tetap Sama) ---
    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        // Clear any existing timeout
        if (notificationElement.timeoutId) {
            clearTimeout(notificationElement.timeoutId);
        }

        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type;
        notificationElement.classList.add('show');

        // Atur timeout untuk menyembunyikan
        notificationElement.timeoutId = setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) { // Pastikan class 'show' sudah dihapus
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = ''; // Kosongkan teks
                }
                notificationElement.removeEventListener('transitionend', handler);
            });
        }, duration);
    }


    // --- Logika Cek Status Login Awal & Muat Data Pengguna (Menggunakan Supabase Auth) ---
    const {
        data: {
            session
        },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
        console.error('Error getting Supabase session:', sessionError);
        showNotification('Gagal memuat sesi pengguna. Mohon coba lagi.', 'error');
        // Redirect meskipun ada error sesi, karena tidak bisa pastikan login atau tidak
        window.location.replace('/index.html');
        return;
    }

    if (!session) {
        // Jika tidak ada sesi aktif Supabase, redirect ke halaman login
        console.log("Tidak ada sesi Supabase aktif, redirect ke index.html");
        window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
        return; // Hentikan eksekusi script
    }

    // Jika ada sesi, dapatkan data user
    currentUser = session.user;
    currentUserId = currentUser.id;
    console.log("Sesi Supabase aktif, user ID:", currentUserId);

    // Muat data profil pengguna dari tabel 'profiles'
    async function loadUserProfile(userId) {
        const {
            data,
            error
        } = await supabase
            .from('profiles') // Ambil dari tabel profiles
            .select('username, full_name, avatar_url') // Pilih kolom yang dibutuhkan
            .eq('id', userId) // Filter berdasarkan ID user
            .single(); // Ambil satu baris karena ID user unik

        if (error) {
            console.error('Error loading user profile:', error);
            showNotification('Gagal memuat data profil.', 'error');
            // Lanjutkan meskipun profil gagal dimuat, mungkin user hanya punya Auth entry
            currentUserIdentifier = currentUser.email || currentUser.phone || 'Pengguna!'; // Gunakan email/phone sebagai fallback
        } else if (data) {
            // Data profil berhasil dimuat
            console.log('User profile data:', data);
            currentUserIdentifier = data.username || data.full_name || currentUser.email || currentUser.phone || 'Pengguna!'; // Gunakan username/nama/email/phone sebagai identifier
            // Tampilkan foto profil dari data yang diambil
            if (data.avatar_url && profilePicElement) {
                loadProfilePicture(data.avatar_url); // Panggil fungsi load foto profil dengan URL dari DB
            } else {
                // Jika tidak ada avatar_url di DB, pastikan area upload foto profil terlihat
                if (profilePicElement && profileUploadArea) {
                    profilePicElement.style.display = 'none';
                    profilePicElement.src = 'placeholder-profile-pic.png'; // Reset src img
                    profilePicElement.alt = 'Unggah Foto Profil'; // Reset alt text
                    profileUploadArea.style.display = 'flex'; // Tampilkan area upload
                }
            }
        } else {
            // Tidak ada baris profil untuk user ini (mungkin user baru daftar dan profil belum dibuat)
            console.warn(`No profile data found for user ID: ${userId}. User might need to create a profile.`);
            currentUserIdentifier = currentUser.email || currentUser.phone || 'Pengguna Baru!';
            // Pastikan area upload foto profil terlihat jika tidak ada profil/avatar_url
            if (profilePicElement && profileUploadArea) {
                profilePicElement.style.display = 'none';
                profilePicElement.src = 'placeholder-profile-pic.png'; // Reset src img
                profilePicElement.alt = 'Unggah Foto Profil'; // Reset alt text
                profileUploadArea.style.display = 'flex'; // Tampilkan area upload
            }
        }

        // Tampilkan identifier di UI setelah dimuat
        if (usernameSpan) {
            usernameSpan.textContent = currentUserIdentifier;
        }
    }

    // Muat profil dan data pengguna saat halaman dimuat
    if (currentUserId) {
        await loadUserProfile(currentUserId);
        // Setelah profil dimuat, muat juga foto konten umum
        await fetchAndDisplayUserPhotos(currentUserId);
    }
    // --- Akhir Logika Cek Login & Muat Data Pengguna ---


    // --- Logika Tombol Logout (Menggunakan Supabase Auth) ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const {
                error
            } = await supabase.auth.signOut();

            if (error) {
                console.error('Error signing out:', error);
                showNotification('Gagal logout. Mohon coba lagi.', 'error');
            } else {
                console.log('Logout berhasil (Supabase Auth), redirect ke index.html');
                // Hapus data localStorage yang mungkin masih ada dari simulasi
                localStorage.clear();
                // Redirect ke halaman login/daftar
                window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
            }
        });
    } else {
        console.warn("Tombol logout (ID 'logoutButton') tidak ditemukan di homepage.");
    }
    // --- Akhir Logika Tombol Logout ---


    // --- Logika Foto Profil dan Upload (Menggunakan Supabase Storage & Database) ---

    // Fungsi untuk memuat dan menampilkan foto profil (dari URL, bisa Storage atau Data URL lama)
    // Fungsi ini sekarang menerima URL langsung atau path Storage
    async function loadProfilePicture(urlOrPath) {
        if (!profilePicElement || !profileUploadArea) {
            console.warn("Elemen foto profil atau area upload tidak ditemukan.");
            return;
        }

        if (!urlOrPath) {
            // Jika tidak ada URL/Path, tampilkan area upload
            profilePicElement.style.display = 'none';
            profilePicElement.src = 'placeholder-profile-pic.png'; // Reset src img
            profilePicElement.alt = 'Unggah Foto Profil'; // Reset alt text
            profileUploadArea.style.display = 'flex';
            return;
        }

        // Cek apakah ini path Storage atau URL lengkap (Data URL atau Supabase Public URL)
        let imageUrl = urlOrPath;
        if (urlOrPath.startsWith('avatars/')) { // Asumsi path storage dimulai dengan bucket_name/
            // Jika ini path Storage, dapatkan URL publik dari Supabase
            const {
                data
            } = supabase
                .storage
                .from('avatars') // Ganti 'avatars' dengan nama bucket foto profil Anda
                .getPublicUrl(urlOrPath);

            if (data && data.publicUrl) {
                imageUrl = data.publicUrl;
            } else {
                console.error('Failed to get public URL for avatar path:', urlOrPath);
                showNotification('Gagal memuat foto profil.', 'error');
                // Tampilkan placeholder jika gagal mendapatkan URL publik
                profilePicElement.style.display = 'none';
                profilePicElement.src = 'placeholder-profile-pic.png';
                profilePicElement.alt = 'Unggah Foto Profil Gagal';
                profileUploadArea.style.display = 'flex'; // Mungkin tetap tampilkan area upload
                return;
            }
        }
        // Jika urlOrPath bukan path storage (misal: Data URL lama dari localStorage), langsung gunakan

        profilePicElement.src = imageUrl;
        profilePicElement.alt = `Foto Profil ${currentUserIdentifier}`; // Update alt text
        profilePicElement.style.display = 'block'; // Tampilkan img
        profileUploadArea.style.display = 'none'; // Sembunyikan area upload
    }


    // Event listener saat file foto profil dipilih di input file
    if (profilePicInput && currentUserId) { // Pastikan user ID ada sebelum pasang listener
        profilePicInput.addEventListener('change', async (event) => {
            const file = event.target.files[0]; // Ambil file yang dipilih

            if (!file) {
                event.target.value = ''; // Reset input
                return;
            }

            // --- Validasi File (Opsional tapi disarankan) ---
            if (!file.type.startsWith('image/')) {
                showNotification("Pilih file gambar!", "error");
                event.target.value = '';
                return;
            }
            // Anda bisa tambahkan cek ukuran file di sini (misal < 1MB)
            // if (file.size > 1024 * 1024) {
            //      showNotification("Ukuran foto profil terlalu besar (maks 1MB).", "error");
            //      event.target.value = '';
            //      return;
            // }
            // --- Akhir Validasi ---

            showNotification('Mengunggah foto profil...', 'info');
            const filePath = `avatars/${currentUserId}/${Date.now()}_${file.name}`; // Path di Storage (bucket/user_id/timestamp_filename)

            // --- Unggah File ke Supabase Storage ---
            const {
                data: uploadData,
                error: uploadError
            } = await supabase
                .storage
                .from('avatars') // Ganti 'avatars' dengan nama bucket foto profil Anda
                .upload(filePath, file, {
                    cacheControl: '3600', // Cache selama 1 jam
                    upsert: true // Timpa jika nama file sudah ada
                });

            if (uploadError) {
                console.error('Error uploading profile picture:', uploadError);
                showNotification(`Gagal mengunggah foto profil: ${uploadError.message}`, 'error');
            } else {
                console.log('Profile picture uploaded successfully:', uploadData);

                // --- Simpan Path File ke Database (Tabel 'profiles') ---
                const {
                    error: updateError
                } = await supabase
                    .from('profiles') // Update tabel profiles
                    .update({
                        avatar_url: uploadData.path,
                        updated_at: new Date()
                    }) // Simpan path file
                    .eq('id', currentUserId); // Untuk baris user yang sedang login

                if (updateError) {
                    console.error('Error updating profile avatar_url in database:', updateError);
                    showNotification(`Foto profil terunggah, tapi gagal menyimpan ke database: ${updateError.message}`, 'error');
                    // Opsional: Coba hapus file dari storage jika update DB gagal? Tergantung kebijakan Anda.
                } else {
                    console.log('Profile avatar_url updated in database.');
                    // Load dan tampilkan foto dari path baru
                    await loadProfilePicture(uploadData.path); // Panggil loadProfilePicture dengan path storage
                    showNotification("Foto profil berhasil diunggah!", "success");
                }
            }
            event.target.value = ''; // Reset input file
        });
    } else if (!currentUserId) {
        console.warn("User ID tidak tersedia, event listener upload foto profil tidak dipasang.");
    }


    // Jika area upload diklik, picu klik pada input file yang tersembunyi (untuk foto profil)
    if (profileUploadArea && profilePicInput) {
        profileUploadArea.addEventListener('click', (event) => {
            // Hanya picu klik jika area upload sedang terlihat
            if (window.getComputedStyle(profileUploadArea).display !== 'none') {
                profilePicInput.click();
            }
            event.stopPropagation(); // Hentikan event propagation
        });
        // Hentikan event propagation dari input file agar tidak double click
        profilePicInput.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        // Opsional: Jika elemen foto profil juga diklik, picu klik pada input file (untuk mengganti)
        // Pastikan ini hanya aktif jika profilePicElement terlihat
        if (profilePicElement) {
            profilePicElement.addEventListener('click', (event) => {
                if (window.getComputedStyle(profilePicElement).display !== 'none') {
                    profilePicInput.click();
                }
                event.stopPropagation();
            });
        }
    }
    // --- Akhir Logika Foto Profil ---


    // --- BAGIAN BARU: Logika Unggah Foto Konten Umum (Menggunakan Supabase Storage & Database) ---

    // Event listener saat file foto konten umum dipilih
    if (generalPhotoInput && currentUserId) {
        generalPhotoInput.addEventListener('change', async (event) => {
            const files = event.target.files; // Ambil file(file) yang dipilih

            if (!files || files.length === 0) {
                event.target.value = ''; // Reset input
                return;
            }

            // Proses setiap file yang dipilih
            for (const file of files) {
                // --- Validasi File ---
                if (!file.type.startsWith('image/')) {
                    showNotification(`File "${file.name}" bukan file gambar dan akan diabaikan.`, 'error');
                    continue; // Lanjutkan ke file berikutnya
                }
                // Tambahkan cek ukuran file jika perlu (misal < 5MB)
                // if (file.size > 5 * 1024 * 1024) {
                //     showNotification(`File "${file.name}" terlalu besar (maks 5MB) dan akan diabaikan.`, 'error');
                //     continue; // Lanjutkan ke file berikutnya
                // }
                // --- Akhir Validasi ---

                showNotification(`Mengunggah file "${file.name}"...`, 'info');

                // Buat path unik di Storage: user-content/[user_id]/[timestamp]_[nama_file]
                const filePath = `user-content/${currentUserId}/${Date.now()}_${file.name}`;

                // --- Unggah File ke Supabase Storage (Bucket 'user-content') ---
                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase
                    .storage
                    .from('user-content') // Ganti 'user-content' dengan nama bucket Anda
                    .upload(filePath, file, {
                        cacheControl: '3600', // Cache selama 1 jam
                        upsert: false // Jangan timpa jika nama file sudah ada
                    });

                if (uploadError) {
                    console.error(`Error uploading file "${file.name}":`, uploadError);
                    showNotification(`Gagal mengunggah file "${file.name}": ${uploadError.message}`, 'error');
                } else {
                    console.log(`File "${file.name}" uploaded successfully:`, uploadData);

                    // --- Simpan Metadata File ke Database (Tabel 'user_photos') ---
                    const {
                        data: insertData,
                        error: insertError
                    } = await supabase
                        .from('user_photos') // Insert ke tabel user_photos
                        .insert([{
                            user_id: currentUserId,
                            storage_path: uploadData.path, // Simpan path di Storage
                            caption: '' // Default caption kosong, bisa ditambahkan input caption nanti
                            // uploaded_at otomatis diisi oleh default di DB
                        }]).select().single(); // Select data yang baru diinsert (termasuk ID)

                    if (insertError) {
                        console.error(`Error inserting photo metadata for "${file.name}" into database:`, insertError);
                        showNotification(`File "${file.name}" terunggah, tapi gagal menyimpan metadata ke database: ${insertError.message}`, 'error');
                        // Opsional: Coba hapus file dari storage jika insert DB gagal?
                    } else {
                        console.log('Photo metadata inserted successfully:', insertData);
                        showNotification(`File "${file.name}" berhasil diunggah dan disimpan!`, "success");
                        // Refresh tampilan galeri setelah sukses upload dan simpan data
                        await fetchAndDisplayUserPhotos(currentUserId); // Panggil ulang fungsi display
                    }
                }
            } // Akhir loop file

            event.target.value = ''; // Reset input file setelah semua file diproses
        });
    } else if (!currentUserId) {
        console.warn("User ID tidak tersedia, event listener upload foto konten umum tidak dipasang.");
    }


    // --- Logika Drag and Drop (Opsional) ---
    if (generalUploadArea && generalPhotoInput) {
        // Mencegah perilaku default untuk event drag (agar drop bisa bekerja)
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            generalUploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Memberikan visual feedback saat drag file masuk/keluar area
        ['dragenter', 'dragover'].forEach(eventName => {
            generalUploadArea.addEventListener(eventName, () => {
                generalUploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            generalUploadArea.addEventListener(eventName, () => {
                generalUploadArea.classList.remove('dragover');
            }, false);
        });

        // Menangani file yang di-drop
        generalUploadArea.addEventListener('drop', (event) => {
            const dt = event.dataTransfer;
            const files = dt.files;

            // Arahkan file yang di-drop ke input file
            generalPhotoInput.files = files;
            // Picu event 'change' pada input file secara manual agar listener terpicu
            const changeEvent = new Event('change');
            generalPhotoInput.dispatchEvent(changeEvent);

        }, false);

        // Jika area upload diklik, picu klik pada input file yang tersembunyi
        generalUploadArea.addEventListener('click', (event) => {
            // Hanya picu klik jika area upload sedang terlihat
            if (window.getComputedStyle(generalUploadArea).display !== 'none') {
                generalPhotoInput.click();
            }
            event.stopPropagation();
        });
        // Hentikan event propagation dari input file agar tidak double click
        generalPhotoInput.addEventListener('click', (event) => {
            event.stopPropagation();
        });

    }
    // --- Akhir Logika Drag and Drop ---


    // --- BAGIAN BARU: Logika Menampilkan Foto Konten Umum ---

    // Fungsi untuk mengambil dan menampilkan foto-foto pengguna dari database
    async function fetchAndDisplayUserPhotos(userId) {
        if (!userPhotosGallery || !noPhotosMessage) {
            console.warn("Elemen galeri foto atau pesan 'no photos' tidak ditemukan.");
            return;
        }

        // Kosongkan galeri dan tampilkan pesan loading/default
        userPhotosGallery.innerHTML = '';
        noPhotosMessage.style.display = 'block';
        noPhotosMessage.textContent = 'Memuat foto...';


        // --- Ambil Data Foto dari Database (Tabel 'user_photos') ---
        // Pilih kolom yang relevan (id, storage_path, caption, dll.)
        // Tambahkan .eq('user_id', userId) jika Anda hanya ingin menampilkan foto milik user yang login (sesuai RLS)
        // Hapus .eq() jika kebijakan RLS SELECT Anda mengizinkan melihat semua foto (misal: public)
        const {
            data: photos,
            error: fetchError
        } = await supabase
            .from('user_photos')
            .select('id, storage_path, caption, uploaded_at'); // Pilih kolom yang dibutuhkan
        // .eq('user_id', userId); // UNCOMMENT ini jika kebijakan RLS SELECT Anda hanya mengizinkan pemilik melihat datanya

        if (fetchError) {
            console.error('Error fetching user photos:', fetchError);
            showNotification('Gagal memuat galeri foto.', 'error');
            noPhotosMessage.textContent = 'Gagal memuat foto.';
        } else if (photos && photos.length > 0) {
            // Foto berhasil diambil
            console.log('Fetched photos:', photos);

            noPhotosMessage.style.display = 'none'; // Sembunyikan pesan 'Memuat foto' atau 'Belum ada'

            // --- Tampilkan Foto-foto di Galeri ---
            photos.forEach(photo => {
                // Dapatkan URL publik dari path storage
                const {
                    data: {
                        publicUrl
                    }
                } = supabase
                    .storage
                    .from('user-content') // Ganti 'user-content' dengan nama bucket Anda
                    .getPublicUrl(photo.storage_path);

                if (publicUrl) {
                    const imgElement = document.createElement('img');
                    imgElement.src = publicUrl;
                    imgElement.alt = photo.caption || `Foto Pengguna ${photo.id}`; // Gunakan caption atau ID sebagai alt
                    imgElement.dataset.photoId = photo.id; // Simpan ID foto di dataset elemen img (berguna untuk delete/edit)
                    imgElement.dataset.storagePath = photo.storage_path; // Simpan path storage (berguna untuk delete file)
                    imgElement.classList.add('gallery-photo'); // Tambahkan class untuk styling
                    // Tambahkan event listener jika ingin melakukan sesuatu saat foto galeri diklik
                    // imgElement.addEventListener('click', () => {
                    //      console.log('Photo clicked:', photo.id);
                    //      // Tambahkan logika view, edit, atau delete di sini
                    // });

                    userPhotosGallery.appendChild(imgElement); // Tambahkan gambar ke galeri
                } else {
                    console.error('Failed to get public URL for photo:', photo.storage_path);
                }
            });
        } else {
            // Tidak ada foto di database untuk user ini
            console.log('No photos found for user ID:', userId);
            noPhotosMessage.style.display = 'block'; // Tampilkan pesan 'Belum ada foto'
            noPhotosMessage.textContent = 'Belum ada foto diunggah.';
        }
    }

    // Fungsi fetchAndDisplayUserPhotos dipanggil di bagian login check setelah user ID didapatkan.

}); // Akhir DOMContentLoaded