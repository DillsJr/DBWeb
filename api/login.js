// Serverless Function untuk menangani permintaan login
export default function handler(req, res) {
    if (req.method === 'POST') {
        // Asumsikan body permintaan sudah di-parse oleh Vercel
        // Untuk aplikasi nyata, gunakan body-parser atau framework yang relevan
        const {
            username,
            password
        } = req.body;

        // --- SIMULASI VALIDASI LOGIN (INI TIDAK AMAN!) ---
        // Di aplikasi nyata, kamu akan:
        // 1. Terhubung ke database (PostgreSQL, MongoDB, dll.)
        // 2. Cari pengguna berdasarkan username
        // 3. Bandingkan password yang dimasukkan dengan password yang di-hash di database
        // 4. Hasilkan token otentikasi jika kredensial cocok
        // -------------------------------------------------

        if (username === 'testuser' && password === 'password123') { // Kredensial hardcode (TIDAK AMAN!)
            // Login berhasil (simulasi)
            res.status(200).json({
                message: 'Login successful!',
                user: {
                    username: 'testuser'
                }
            });
        } else {
            // Login gagal (simulasi)
            res.status(401).json({
                message: 'Invalid username or password'
            });
        }
    } else {
        // Metode HTTP selain POST tidak diizinkan untuk endpoint ini
        res.status(405).json({
            message: 'Method Not Allowed'
        });
    }
}