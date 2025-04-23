// public/homepage.js - Script untuk halaman homepage

// --- KONFIGURASI SUPABASE ---
// Gunakan konfigurasi yang sama seperti di script.js
// !!! PERINGATAN: Menyimpan URL dan ANON KEY secara langsung di kode klien yang publik
// TIDAK AMAN untuk aplikasi produksi. Gunakan environment variables atau server-side logic. !!!
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksZXhwIjoyMDYwODIwMjk5fQ.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE'; // Gunakan Anon Key Anda

// Pastikan Anda juga menambahkan tag script Library Supabase JS di <head> homepage.html!
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Homepage Supabase client initialized.");

// --- Elemen DOM ---
const loggedInUsernameElement = document.getElementById('loggedInUsername');
const logoutButton = document.getElementById('logoutButton');
// Elemen-elemen untuk foto profil (akan diimplementasikan nanti)
// const userProfilePic = document.getElementById('userProfilePic');
// const profilePicInput = document.getElementById('profilePicInput');
// const profileUploadArea = document.getElementById('profileUploadArea');


// --- Fungsi Redirect ke Login ---
function redirectToLogin() {
    console.log("Tidak ada sesi, mengalihkan ke halaman login.");
    // Menggunakan replace agar tidak bisa kembali pakai tombol back
    window.location.replace('/index.html'); // !!! Pastikan '/index.html' adalah path halaman login Anda !!!
}

// --- Fungsi untuk Mendapatkan dan Menampilkan Data Pengguna ---
async function fetchAndDisplayUser() {
    console.log("Mengambil sesi pengguna...");
    // Mendapatkan sesi aktif saat ini
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    // --- Perbaikan Syntax Error di Sini ---
    if (error || !session) {
        // Jika ada error atau tidak ada sesi, alihkan ke halaman login
        console.error("Error fetching session:", error?.message || "No active session ditemukan."); // Perbaiki penulisan dan penempatan }
        redirectToLogin();
    } else {
        // Jika sesi aktif ditemukan
        console.log("Sesi aktif ditemukan:", session);
        const user = session.user;

        // Tampilkan nama pengguna di elemen dengan ID 'loggedInUsername'
        // Coba ambil nama dari user_metadata (jika disimpan saat daftar), fallback ke username, lalu email, atau 'Pengguna'
        // --- Perbaikan Syntax Error di Sini ---
        const userName = user.user_metadata?.full_name || user.user_metadata?.username || user.email || 'Pengguna'; // Pastikan syntax dan semicolon benar
        if (loggedInUsernameElement) {
            loggedInUsernameElement.textContent = userName;
            console.log("Nama pengguna ditampilkan:", userName); // Perbaiki penulisan
        } else {
            console.warn("Element dengan ID 'loggedInUsername' tidak ditemukan di homepage.html."); // Perbaiki penulisan
        }

        // TODO: Tambahkan logika untuk menampilkan foto profil dari Supabase Storage
        // TODO: Tambahkan logika untuk mengunggah foto profil baru
    }
}

// --- Fungsi Logout ---
async function handleLogout() {
    console.log("Melakukan logout...");
    // Memanggil fungsi signOut dari Supabase Auth
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Error logging out:", error.message);
        // Tampilkan notifikasi error logout di homepage jika ada elemen notifikasi
        alert(`Gagal logout: ${error.message}`); // Menggunakan alert sementara
    } else {
        console.log("Logout berhasil.");
        // Redirect ke halaman login setelah logout berhasil
        // onAuthStateChange di index.js akan menampilkan notifikasi "Anda telah logout" setelah redirect
        redirectToLogin();
    }
}


// --- Setup saat DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Homepage DOM fully loaded. Memeriksa sesi..."); // Perbaiki penulisan

    // Periksa sesi dan tampilkan data pengguna saat halaman dimuat
    fetchAndDisplayUser();

    // Pasang event listener untuk tombol logout
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
        console.log("Event listener tombol logout terpasang."); // Perbaiki penulisan
    } else {
        console.warn("Element dengan ID 'logoutButton' tidak ditemukan di homepage.html."); // Perbaiki penulisan
    }

    // TODO: Setup event listener untuk tombol pilih foto/upload
});

// --- Opsional: Listener onAuthStateChange untuk real-time session changes di homepage ---
// Berguna jika sesi bisa berakhir (misalnya, dari tab lain atau di dashboard Supabase)
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Homepage Auth State Change:', event, session);
    if (event === 'SIGNED_OUT') {
        console.log("Sesi berakhir saat berada di homepage, mengalihkan ke login."); // Perbaiki penulisan
        redirectToLogin(); // Redirect jika sesi berakhir
    }
    // Event lain seperti 'SIGNED_IN' atau 'USER_UPDATED' bisa ditangani di sini jika perlu
    // Misalnya, panggil fetchAndDisplayUser() lagi jika event === 'USER_UPDATED'
});