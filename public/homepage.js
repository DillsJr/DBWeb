// public/homepage.js

// --- INISIALISASI SUPABASE (Ganti dengan URL dan Anon Key Proyek Anda) ---
const SUPABASE_URL = 'https://gdhetudsmvypfpksggqp.supabase.co'; // Ganti dengan URL proyek Supabase Anda
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // Ganti dengan Anon Key proyek Supabase Anda

const { createClient } = supabase; // Asumsi Supabase SDK dimuat di homepage.html atau di sini
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
    // Mendapatkan tombol simpan (pastikan ID ini ada di homepage.html)
    const saveUploadedPhotosButton = document.getElementById('saveUploadedPhotosButton');


    // --- Variabel Pengguna dari Supabase ---
    let currentUser = null; // Objek user dari Supabase Auth
    let currentUserId = null; // ID user dari Supabase Auth (UUID)
    let currentUserIdentifier = 'Pengguna!'; // Identifier untuk ditampilkan di UI (akan diambil dari profiles)

    // --- Array untuk Menyimpan Foto yang Sudah Diupload ke Storage Sementara Menunggu Konfirmasi ---
    let tempUploadedPhotos = [];


    // --- Fungsi Notifikasi Kustom ---
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
    // Fungsi untuk melakukan cek sesi dan memuat data awal
    async function initializeHomepage() {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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
        await loadUserProfile(currentUserId);

        // Muat juga foto konten umum yang sudah ada di database
        await fetchAndDisplayUserPhotos(currentUserId);

         // Tambahkan event listener yang memerlukan currentUserId di sini
         attachEventListeners();
    }

    // Fungsi untuk memuat data profil dari tabel profiles
    async function loadUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles') // Ambil dari tabel profiles
            .select('username, full_name, avatar_url') // Pilih kolom yang dibutuhkan
            .eq('id', userId) // Filter berdasarkan ID user
            .single(); // Ambil satu baris karena ID user unik

        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
            console.error('Error loading user profile:', error);
            showNotification('Gagal memuat data profil.', 'error');
            // Lanjutkan meskipun profil gagal dimuat, mungkin user hanya punya Auth entry
            currentUserIdentifier = currentUser.email || currentUser.phone || 'Pengguna!'; // Gunakan email/phone sebagai fallback
        } else if (data) {
            // Data profil berhasil dimuat
            console.log('User profile data:', data);
            // Gunakan username jika ada, fallback ke nama lengkap, email, phone, atau default
            currentUserIdentifier = data.username || data.full_name || currentUser.email || currentUser.phone || 'Pengguna!';
            // Tampilkan foto profil dari data yang diambil
            if (data.avatar_url) { // Cek apakah ada avatar_url di DB
                 await loadProfilePicture(data.avatar_url); // Panggil fungsi load foto profil dengan URL/path dari DB
            } else {
                 // Jika tidak ada avatar_url di DB, pastikan area upload foto profil terlihat
                 console.log('No avatar_url found in profile, showing profile upload area.');
                 await loadProfilePicture(null); // Panggil dengan null untuk menampilkan area upload
            }
        } else {
            // Tidak ada baris profil untuk user ini (mungkin user baru daftar dan profil belum dibuat)
             console.warn(`No profile data found for user ID: ${userId}. User might need to create a profile.`);
             currentUserIdentifier = currentUser.email || currentUser.phone || 'Pengguna Baru!';
             // Pastikan area upload foto profil terlihat jika tidak ada profil/avatar_url
             await loadProfilePicture(null); // Panggil dengan null untuk menampilkan area upload
        }

        // Tampilkan identifier di UI setelah dimuat
        if (usernameSpan) {
            usernameSpan.textContent = currentUserIdentifier;
        }
    }

    // Jalankan inisialisasi saat DOM selesai dimuat
    initializeHomepage();
    // --- Akhir Logika Cek Login & Muat Data Pengguna ---


    // --- Logika Tombol Logout (Menggunakan Supabase Auth) ---
    // Event listener logout dipasang di fungsi attachEventListeners
    async function performLogout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error);
            showNotification('Gagal logout. Mohon coba lagi.', 'error');
        } else {
            console.log('Logout berhasil (Supabase Auth), redirect ke index.html');
            // Hapus data localStorage yang mungkin masih ada dari simulasi (optional tapi baik)
            localStorage.clear();
            // Redirect ke halaman login/daftar
            window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login/daftar Anda !!!
        }
    }
    // --- Akhir Logika Tombol Logout ---


    // --- Logika Foto Profil dan Upload (Menggunakan Supabase Storage & Database) ---

    // Fungsi untuk memuat dan menampilkan foto profil (dari URL atau path Storage)
    // Fungsi ini sekarang menerima URL langsung atau path Storage
    async function loadProfilePicture(urlOrPath) {
         if (!profilePicElement || !profileUploadArea) {
             console.warn("Elemen foto profil atau area upload tidak ditemukan.");
             return;
         }

         if (!urlOrPath) {
             // Jika tidak ada URL/Path (atau null), tampilkan area upload
             profilePicElement.style.display = 'none';
             profilePicElement.src = 'placeholder-profile-pic.png'; // Reset src img
             profilePicElement.alt = 'Unggah Foto Profil'; // Reset alt text
             profileUploadArea.style.display = 'flex';
             return;
         }

         // Cek apakah ini path Storage atau URL lengkap (Data URL lama atau Supabase Public URL)
         let imageUrl = urlOrPath;
         if (urlOrPath.startsWith('avatars/')) { // Asumsi path storage dimulai dengan bucket_name/
              // Jika ini path Storage, dapatkan URL publik dari Supabase
              const { data } = supabase
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
         // Jika urlOrPath bukan path storage (misal: Data URL lama dari localStorage jika masih pakai), langsung gunakan

         profilePicElement.src = imageUrl;
         profilePicElement.alt = `Foto Profil ${currentUserIdentifier}`; // Update alt text
         profilePicElement.style.display = 'block'; // Tampilkan img
         profileUploadArea.style.display = 'none'; // Sembunyikan area upload
    }


    // Event listener saat file foto profil dipilih di input file (dipasang di attachEventListeners)
    async function handleProfilePicUpload(event) {
        const file = event.target.files[0]; // Ambil file yang dipilih

        if (!file) {
            event.target.value = ''; // Reset input
            return;
        }

        // Pastikan user ID ada sebelum upload
        if (!currentUserId) {
             showNotification("Error: User ID tidak tersedia untuk upload foto profil.", "error");
             event.target.value = '';
             return;
        }

        // --- Validasi File (Opsional tapi disarankan) ---
        if (!file.type.startsWith('image/')) {
            showNotification("Pilih file gambar!", "error");
            event.target.value = '';
            return;
        }
        // Anda bisa tambahkan cek ukuran file di sini (misal < 1MB)
        if (file.size > 1 * 1024 * 1024) { // Contoh 1MB
             showNotification("Ukuran foto profil terlalu besar (maks 1MB).", "error");
             event.target.value = '';
             return;
        }
        // --- Akhir Validasi ---

        showNotification('Mengunggah foto profil...', 'info');
        // Path di Storage: bucket/user_id/timestamp_filename
        const fileExtension = file.name.split('.').pop();
        const filePath = `avatars/${currentUserId}/${Date.now()}.${fileExtension}`;

        // --- Unggah File ke Supabase Storage ---
        const { data: uploadData, error: uploadError } = await supabase
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
             // Pastikan baris profil untuk user ini sudah ada sebelum diupdate
             // Idealnya, baris profil dibuat otomatis saat user mendaftar (trigger di DB)
             // Jika tidak ada baris profil, update akan gagal.
             const { error: updateError } = await supabase
                .from('profiles') // Update tabel profiles
                .update({ avatar_url: uploadData.path, updated_at: new Date() }) // Simpan path file
                .eq('id', currentUserId); // Untuk baris user yang sedang login

            if (updateError) {
                 console.error('Error updating profile avatar_url in database:', updateError);
                 showNotification(`Foto profil terunggah, tapi gagal menyimpan ke database: ${updateError.message}. Pastikan baris profil Anda ada.`, 'error', 5000);
                 // Opsional: Coba hapus file dari storage jika update DB gagal? Tergantung kebijakan Anda.
                 // await supabase.storage.from('avatars').remove([uploadData.path]);
            } else {
                 console.log('Profile avatar_url updated in database.');
                // Load dan tampilkan foto dari path baru
                await loadProfilePicture(uploadData.path); // Panggil loadProfilePicture dengan path storage
                showNotification("Foto profil berhasil diunggah!", "success");
            }
        }
        event.target.value = ''; // Reset input file
    }

    // Event listener click pada area upload foto profil (dipasang di attachEventListeners)
    function handleProfileUploadAreaClick(event) {
         // Hanya picu klik jika area upload sedang terlihat
         if (profileUploadArea && window.getComputedStyle(profileUploadArea).display !== 'none') {
             profilePicInput.click();
         }
         event.stopPropagation(); // Hentikan event propagation
    }

    // Event listener click pada elemen img foto profil (untuk mengganti) (dipasang di attachEventListeners)
     function handleProfilePicClick(event) {
         // Hanya picu klik jika elemen foto profil sedang terlihat
          if (profilePicElement && window.getComputedStyle(profilePicElement).display !== 'none') {
              profilePicInput.click();
          }
          event.stopPropagation();
     }

     // Hentikan event propagation dari input file foto profil agar tidak double click (dipasang di attachEventListeners)
     function handleProfilePicInputClick(event) {
         event.stopPropagation();
     }

    // --- Akhir Logika Foto Profil ---


    // --- BAGIAN BARU: Logika Unggah & Tampil Foto Konten Umum (Menggunakan Supabase) ---

     // Event listener saat file foto konten umum dipilih (dipasang di attachEventListeners)
     async function handleGeneralPhotoInputChange(event) {
         const files = event.target.files; // Ambil file(file) yang dipilih

         if (!files || files.length === 0) {
             event.target.value = ''; // Reset input
             return;
         }

         // Pastikan user ID ada sebelum upload
         if (!currentUserId) {
              showNotification("Error: User ID tidak tersedia untuk upload foto konten.", "error");
              event.target.value = '';
              return;
         }

         // Opsional: Kosongkan area preview dan array sementara setiap kali pilih file baru
         // uploadPreviewArea.innerHTML = '';
         // tempUploadedPhotos = [];

         // Sembunyikan pesan "Belum ada foto diunggah" di area preview jika muncul
         const previewNoPhotosMessage = uploadPreviewArea.querySelector('.info-message');
         if (previewNoPhotosMessage) previewNoPhotosMessage.style.display = 'none';


         // Proses setiap file yang dipilih
         for (const file of files) {
             // --- Validasi File ---
             if (!file.type.startsWith('image/')) {
                 showNotification(`File "${file.name}" bukan file gambar dan akan diabaikan.`, 'error');
                 continue; // Lanjutkan ke file berikutnya
             }
             // Tambahkan cek ukuran file jika perlu (misal < 5MB)
             if (file.size > 5 * 1024 * 1024) { // Contoh 5MB
                 showNotification(`File "${file.name}" terlalu besar (maks 5MB) dan akan diabaikan.`, 'error');
                 continue; // Lanjutkan ke file berikutnya
             }
             // --- Akhir Validasi ---

             showNotification(`Mengunggah file "${file.name}" ke Storage...`, 'info');

             // Buat path unik di Storage: user-content/[user_id]/[timestamp]_[nama_file].[ext]
             const fileExtension = file.name.split('.').pop();
             // Bersihkan nama file dari karakter yang tidak diinginkan
             const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
             const filePath = `user-content/${currentUserId}/${Date.now()}_${cleanFileName}`;

             // --- Unggah File ke Supabase Storage (Bucket 'user-content') ---
             const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('user-content') // Ganti 'user-content' dengan nama bucket Anda
                .upload(filePath, file, {
                    cacheControl: '3600', // Cache selama 1 jam
                    upsert: false // Jangan timpa jika nama file sudah ada (atau true jika ingin menimpa)
                });

             if (uploadError) {
                 console.error(`Error uploading file "${file.name}":`, uploadError);
                 showNotification(`Gagal mengunggah file "${file.name}": ${uploadError.message}`, 'error');
             } else {
                 console.log(`File "${file.name}" uploaded successfully to Storage:`, uploadData);

                 // File berhasil diupload ke Storage, TAPI BELUM masuk database user_photos
                 // Simpan data sementara dan tampilkan preview
                 tempUploadedPhotos.push({
                     fileName: file.name,
                     storagePath: uploadData.path,
                     // Ambil URL publik untuk preview
                     publicUrl: supabase.storage.from('user-content').getPublicUrl(uploadData.path).data.publicUrl,
                     // file: file // Opsional: Simpan juga objek file jika perlu (misal untuk preview Data URL)
                 });

                 // Tampilkan preview foto yang baru diupload ke Storage
                 displayTemporaryPreview(tempUploadedPhotos[tempUploadedPhotos.length - 1]);

                 // Tampilkan tombol "Simpan" jika ada file menunggu konfirmasi
                 if (saveUploadedPhotosButton) {
                     saveUploadedPhotosButton.style.display = 'block';
                 }

                 showNotification(`File "${file.name}" siap disimpan. Klik "Simpan" di bawah.`, "info");

             }
         } // Akhir loop file

         event.target.value = ''; // Reset input file setelah semua file diproses
     }

     // Fungsi untuk menampilkan preview foto yang sudah diupload ke Storage (sementara)
     function displayTemporaryPreview(photoData) {
         if (!uploadPreviewArea) {
              console.warn("Elemen upload preview area tidak ditemukan.");
              return;
         }

         const previewElement = document.createElement('div');
         previewElement.classList.add('upload-preview-item'); // Tambahkan class untuk styling
         // Tambahkan HTML yang lebih kompleks di sini (misal: img, nama file, tombol hapus preview)
         previewElement.innerHTML = `
             <img src="${photoData.publicUrl}" alt="Preview ${photoData.fileName}" style="width: 100px; height: 100px; object-fit: cover; margin-right: 10px; border-radius: 4px;">
             <span>${photoData.fileName}</span>
             <button class="remove-preview-button" data-storage-path="${photoData.storagePath}">X</button>
         `;
         uploadPreviewArea.appendChild(previewElement);

         // Tambahkan listener untuk tombol hapus preview (opsional)
         const removeButton = previewElement.querySelector('.remove-preview-button');
         if(removeButton) {
              removeButton.addEventListener('click', async () => {
                  // Hapus file dari Storage
                  const pathToRemove = removeButton.dataset.storagePath;
                  showNotification(`Menghapus file "${photoData.fileName}" dari Storage...`, 'info');
                  const { error: removeError } = await supabase.storage.from('user-content').remove([pathToRemove]);

                  if(removeError) {
                       console.error(`Error removing file "${photoData.fileName}" from storage:`, removeError);
                       showNotification(`Gagal menghapus file "${photoData.fileName}" dari Storage.`, 'error');
                  } else {
                       console.log(`File "${photoData.fileName}" removed from Storage.`);
                       showNotification(`File "${photoData.fileName}" dihapus dari Storage dan preview.`, 'success');
                       // Hapus preview dari DOM
                       previewElement.remove();
                       // Hapus dari array sementara
                       tempUploadedPhotos = tempUploadedPhotos.filter(p => p.storagePath !== pathToRemove);
                       // Sembunyikan tombol simpan jika sudah tidak ada file menunggu
                       if (saveUploadedPhotosButton && tempUploadedPhotos.length === 0) {
                           saveUploadedPhotosButton.style.display = 'none';
                            // Jika preview area kosong dan ada pesan "Belum ada foto", tampilkan kembali
                            if (uploadPreviewArea.innerHTML === '') {
                                 const previewNoPhotosMessage = uploadPreviewArea.querySelector('.info-message');
                                if (previewNoPhotosMessage) previewNoPhotosMessage.style.display = 'block';
                            }
                       }
                  }
              });
         }
          // Jika preview area kosong, sembunyikan pesan "Belum ada foto" (jika ada)
          const previewNoPhotosMessage = uploadPreviewArea.querySelector('.info-message');
          if (previewNoPhotosMessage) previewNoPhotosMessage.style.display = 'none';
     }

     // Event listener untuk tombol "Simpan" foto konten umum (dipasang di attachEventListeners)
     async function handleSaveUploadedPhotos() {
         if (tempUploadedPhotos.length === 0) {
              showNotification("Tidak ada foto untuk disimpan.", "info");
              return;
         }

         if (!currentUserId) {
             showNotification("Error: User ID tidak tersedia untuk menyimpan foto.", "error");
             return;
         }

         showNotification(`Menyimpan ${tempUploadedPhotos.length} foto ke database...`, 'info');

         // Siapkan data untuk dimasukkan ke tabel user_photos
         const photosToInsert = tempUploadedPhotos.map(photo => ({
             user_id: currentUserId,
             storage_path: photo.storagePath,
             // caption: '' // Jika ada input caption per preview, ambil nilainya di sini
             // uploaded_at otomatis diisi oleh default di DB
         }));

         // --- Insert Metadata File ke Database (Tabel 'user_photos') ---
         const { data: insertData, error: insertError } = await supabase
            .from('user_photos') // Insert ke tabel user_photos
            .insert(photosToInsert) // Masukkan array objek foto
            .select('id, storage_path, caption, uploaded_at'); // Select data yang baru diinsert (termasuk ID, dll)

         if (insertError) {
             console.error(`Error inserting photo metadata into database:`, insertError);
             showNotification(`Gagal menyimpan foto ke database: ${insertError.message}`, 'error');
              // Opsional: Biarkan preview dan tombol simpan tetap ada agar user bisa coba lagi?
         } else {
             console.log('Photo metadata inserted successfully:', insertData);
             showNotification(`${insertData.length} foto berhasil disimpan!`, "success");

             // Kosongkan area preview dan array sementara setelah berhasil disimpan ke DB
             if (uploadPreviewArea) uploadPreviewArea.innerHTML = '';
             tempUploadedPhotos = [];
             if (saveUploadedPhotosButton) saveUploadedPhotosButton.style.display = 'none';

              // Setelah preview area kosong, tampilkan kembali pesan "Belum ada foto" jika diperlukan
            if (uploadPreviewArea && uploadPreviewArea.innerHTML === '') {
                 const previewNoPhotosMessage = uploadPreviewArea.querySelector('.info-message');
                 if (previewNoPhotosMessage) previewNoPhotosMessage.style.display = 'block';
             }


             // Refresh tampilan galeri utama untuk menampilkan foto-foto yang baru disimpan
             await fetchAndDisplayUserPhotos(currentUserId);
         }
     }


     // --- Logika Drag and Drop (Opsional) - Dipasang di attachEventListeners ---
     function handleDragEnter(e) { preventDefaults(e); generalUploadArea.classList.add('dragover'); }
     function handleDragOver(e) { preventDefaults(e); generalUploadArea.classList.add('dragover'); }
     function handleDragLeave(e) { preventDefaults(e); generalUploadArea.classList.remove('dragover'); }
     function handleDrop(e) {
         preventDefaults(e);
         generalUploadArea.classList.remove('dragover');
         const dt = e.dataTransfer;
         const files = dt.files;

         // Arahkan file yang di-drop ke input file
         generalPhotoInput.files = files;
         // Picu event 'change' pada input file secara manual agar listener terpicu
         const changeEvent = new Event('change');
         generalPhotoInput.dispatchEvent(changeEvent);
     }

      function preventDefaults(e) {
          e.preventDefault();
          e.stopPropagation();
      }
     // --- Akhir Logika Drag and Drop ---


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
        const { data: photos, error: fetchError } = await supabase
            .from('user_photos')
            .select('id, storage_path, caption, uploaded_at') // Pilih kolom yang dibutuhkan
            .order('uploaded_at', { ascending: false }); // Urutkan berdasarkan waktu unggah terbaru di atas
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
                const { data: { publicUrl } } = supabase
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
            console.log('No photos found.');
            userPhotosGallery.innerHTML = ''; // Kosongkan galeri jika tidak ada foto
            noPhotosMessage.style.display = 'block'; // Tampilkan pesan 'Belum ada foto'
            noPhotosMessage.textContent = 'Belum ada foto diunggah.';
        }
    }


    // --- Fungsi untuk Memasang Semua Event Listener Setelah User ID Ada ---
     function attachEventListeners() {
        // Pastikan user ID ada sebelum memasang listener yang memerlukannya
        if (!currentUserId) {
            console.warn("User ID tidak tersedia, sebagian event listener tidak dipasang.");
            return;
        }

        // Tombol Logout
        if (logoutButton) {
             // Hapus listener sebelumnya jika ada
             logoutButton.removeEventListener('click', performLogout);
             logoutButton.addEventListener('click', performLogout);
        }


        // Foto Profil Upload
        if (profilePicInput) {
            profilePicInput.removeEventListener('change', handleProfilePicUpload);
            profilePicInput.addEventListener('change', handleProfilePicUpload);
        }
        if (profileUploadArea) {
            profileUploadArea.removeEventListener('click', handleProfileUploadAreaClick);
            profileUploadArea.addEventListener('click', handleProfileUploadAreaClick);
        }
        if (profilePicElement) {
            profilePicElement.removeEventListener('click', handleProfilePicClick);
            profilePicElement.addEventListener('click', handleProfilePicClick);
        }
        // Menghentikan propagation pada input file itu sendiri
        if(profilePicInput) {
            profilePicInput.removeEventListener('click', handleProfilePicInputClick);
            profilePicInput.addEventListener('click', handleProfilePicInputClick);
        }


        // Foto Konten Umum Upload
        if (generalPhotoInput) {
            generalPhotoInput.removeEventListener('change', handleGeneralPhotoInputChange);
            generalPhotoInput.addEventListener('change', handleGeneralPhotoInputChange);
        }

        // Drag and Drop Listener (Opsional)
        if (generalUploadArea) {
             ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                 generalUploadArea.removeEventListener(eventName, preventDefaults, false); // Hapus jika ada
             });
             ['dragenter', 'dragover'].forEach(eventName => {
                generalUploadArea.removeEventListener(eventName, handleDragEnter, false); // Hapus jika ada
                generalUploadArea.addEventListener(eventName, handleDragEnter, false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                generalUploadArea.removeEventListener(eventName, handleDragLeave, false); // Hapus jika ada
                generalUploadArea.addEventListener(eventName, handleDragLeave, false);
            });
             generalUploadArea.removeEventListener('drop', handleDrop, false); // Hapus jika ada
             generalUploadArea.addEventListener('drop', handleDrop, false);

             // Event listener click pada area upload umum untuk memicu input file
             generalUploadArea.removeEventListener('click', handleProfileUploadAreaClick); // Hapus jika ada
             generalUploadArea.addEventListener('click', () => generalPhotoInput.click()); // Picu input umum
        }

         // Tombol Simpan Foto Konten Umum (Pastikan ID ini ada di homepage.html)
         const saveBtn = document.getElementById('saveUploadedPhotosButton');
         if (saveBtn) {
             // Hapus listener sebelumnya jika ada
             saveBtn.removeEventListener('click', handleSaveUploadedPhotos);
             // Pasang listener
             saveBtn.addEventListener('click', handleSaveUploadedPhotos);
             saveBtn.style.display = 'none'; // Sembunyikan secara default
         } else {
             console.warn("Tombol 'saveUploadedPhotosButton' tidak ditemukan di HTML.");
             // Jika tombol tidak ada, fungsionalitas "Simpan" tidak akan bekerja.
             // Jika Anda TIDAK menambahkan tombol, pindahkan logika insert DB dari handleGeneralPhotoInputChange
             // kembali ke dalam loop setelah upload Storage berhasil.
         }

     }
     // --- Akhir Fungsi attachEventListeners ---


}); // Akhir DOMContentLoaded