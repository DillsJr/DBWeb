// api/login.js
import {
    Pool
} from 'pg'; // Import library pg
import bcrypt from 'bcrypt'; // Import library bcrypt

// Gunakan pool koneksi yang sama seperti di register.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Sesuaikan jika perlu SSL
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {
            whatsapp, // Nomor WA atau username/email yang digunakan untuk login
            password // Password yang dimasukkan pengguna
        } = req.body;

        // Validasi input dasar
        if (!whatsapp || !password) {
            return res.status(400).json({
                message: 'Nomor Whatsapp dan password harus diisi.'
            });
        }


        let client; // Variabel untuk klien database
        try {
            // 1. Terhubung ke Database
            client = await pool.connect();

            // 2. Cari Pengguna Berdasarkan Whatsapp (atau username/email)
            const query = `
                SELECT id, whatsapp, username, full_name, password_hash
                FROM users
                WHERE whatsapp = $1; -- Cari berdasarkan nomor WA
                -- ATAU WHERE username = $1;
                -- ATAU WHERE email = $1;
            `;
            const values = [whatsapp]; // Gunakan whatsapp sebagai nilai pencarian

            const result = await client.query(query, values);
            const user = result.rows[0]; // Ambil baris pertama (jika ada)

            // 3. Verifikasi Pengguna Ditemukan dan Password
            if (user) {
                // Bandingkan password yang dimasukkan dengan password hash dari database
                const passwordMatch = await bcrypt.compare(password, user.password_hash);

                if (passwordMatch) {
                    // Login berhasil
                    // PENTING: Jangan kembalikan password_hash ke frontend!
                    res.status(200).json({
                        message: 'Login berhasil!',
                        user: { // Kembalikan data pengguna (tanpa password hash)
                            id: user.id,
                            whatsapp: user.whatsapp,
                            username: user.username,
                            fullName: user.full_name,
                            // Anda bisa tambahkan data lain dari DB di sini
                        }
                        // Di sini Anda juga akan menghasilkan token otentikasi (JWT) untuk sesi
                    });
                } else {
                    // Password tidak cocok
                    res.status(401).json({
                        message: 'Nomor Whatsapp atau password salah.'
                    }); // Pesan umum
                }
            } else {
                // Pengguna tidak ditemukan
                res.status(401).json({
                    message: 'Nomor Whatsapp atau password salah.'
                }); // Pesan umum
            }

        } catch (error) {
            console.error('Error saat login:', error);
            res.status(500).json({
                message: 'Terjadi kesalahan internal saat login.'
            });

        } finally {
            // Penting: Lepaskan koneksi klien kembali ke pool
            if (client) {
                client.release();
            }
        }

    } else {
        res.status(405).json({
            message: 'Metode Tidak Diizinkan. Gunakan POST.'
        });
    }
}