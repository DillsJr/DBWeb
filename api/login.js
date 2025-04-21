// Serverless Function untuk menangani permintaan login
export default function handler(req, res) {
    // Memastikan permintaan menggunakan metode POST
    if (req.method === 'POST') {
        // Mengambil data dari body permintaan
        // Vercel secara otomatis mem-parse body JSON untuk fungsi Node.js
        const {
            whatsapp, // Mengambil field 'whatsapp'
            password
        } = req.body;

        // --- SIMULASI VALIDASI LOGIN (INI TIDAK AMAN DAN HANYA CONTOH!) ---
        // Di aplikasi nyata yang aman dan fungsional, kamu akan:
        // 1. Menggunakan library Node.js untuk terhubung ke database (PostgreSQL, MongoDB, MySQL, dll.)
        // 2. Mencari data pengguna di database berdasarkan 'whatsapp' (atau username unik lainnya).
        // 3. Membandingkan password yang dimasukkan dengan password yang tersimpan dalam bentuk HASH (BUKAN plaintext) di database menggunakan library hashing seperti bcrypt.
        // 4. Jika password cocok, membuat dan mengirimkan token otentikasi (seperti JWT) atau mengatur sesi.
        // -------------------------------------------------------------------

        // Contoh validasi simulasi dengan hardcode (TIDAK AMAN!)
        // Menggunakan nomor whatsapp simulasi dan password simulasi
        if (whatsapp === '081234567890' && password === 'password123') { // Ubah sesuai data simulasi jika perlu
            // Login berhasil (simulasi)
            res.status(200).json({
                message: 'Login berhasil!',
                user: { // Contoh data pengguna yang dikembalikan
                    whatsapp: whatsapp,
                    // Info pengguna lain dari database bisa ditambahkan di sini
                }
            });
        } else {
            // Login gagal (simulasi)
            // Penting: Pesan error tidak boleh terlalu spesifik (misalnya, jangan bilang "Nomor Whatsapp tidak ditemukan" atau "Password salah"), cukup umum seperti ini demi keamanan.
            res.status(401).json({
                message: 'Nomor Whatsapp atau password salah.'
            });
        }
    } else {
        // Jika metode HTTP bukan POST
        res.status(405).json({
            message: 'Metode Tidak Diizinkan. Gunakan POST.'
        });
    }
}