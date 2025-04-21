// api/login.js
// Serverless Function untuk menangani permintaan login

export default function handler(req, res) {
    // Memastikan permintaan menggunakan metode POST
    if (req.method === 'POST') {
        // Mengambil data dari body permintaan (diasumsikan sudah di-parse Vercel)
        const {
            whatsapp, // Mengambil field 'whatsapp'
            password
        } = req.body;

        // --- SIMULASI VALIDASI LOGIN (INI TIDAK AMAN DAN HANYA CONTOH!) ---
        // GANTI BAGIAN INI dengan logika backend sesungguhnya:
        // 1. Terhubung ke database.
        // 2. Cari pengguna di database berdasarkan 'whatsapp' (atau identitas unik).
        // 3. Bandingkan password yang dimasukkan dengan password ter-hash dari database (gunakan library seperti bcrypt).
        // 4. Jika cocok, hasilkan token otentikasi (misalnya JWT) atau atur sesi.
        // -------------------------------------------------------------------

        // Contoh validasi simulasi dengan hardcode (TIDAK AMAN! GANTI!)
        const SIMULASI_WHATSAPP = '081234567890'; // Ganti dengan nomor simulasi
        const SIMULASI_PASSWORD = 'password123'; // Ganti dengan password simulasi (di aplikasi nyata, JANGAN SIMPAN PLAINTEXT)

        if (whatsapp === SIMULASI_WHATSAPP && password === SIMULASI_PASSWORD) {
            // Login berhasil (simulasi)
            res.status(200).json({
                message: 'Login berhasil!',
                user: {
                    // Di sini kamu akan mengembalikan data pengguna dari database, BUKAN password!
                    whatsapp: whatsapp,
                    username: 'simulasi_user', // Contoh username simulasi
                    // data lain seperti nama, email, dll.
                }
            });
        } else {
            // Login gagal (simulasi)
            // Pesan error umum untuk keamanan
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