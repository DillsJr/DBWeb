// api/register.js
import {
    Pool
} from 'pg'; // Import library pg
import bcrypt from 'bcrypt'; // Import library bcrypt

// Buat koneksi pool ke database menggunakan URL dari Environment Variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Tambahkan konfigurasi SSL jika database provider Anda memerlukannya (misalnya, di Supabase)
    // ssl: {
    //   rejectUnauthorized: false // Hanya jika Anda tahu database Anda mengizinkan ini
    // }
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {
            fullName,
            username,
            whatsapp,
            email,
            password, // Password yang diterima dari frontend (akan di-hash)
            // confirmPassword (sudah divalidasi di frontend)
        } = req.body;

        // --- LOGIKA PENDAFTARAN SESUNGGUHNYA ---
        // Lakukan validasi dasar di backend juga (meskipun sudah di frontend)
        if (!whatsapp || !password) {
            return res.status(400).json({
                message: 'Nomor Whatsapp dan password harus diisi.'
            });
        }
        // Tambahkan validasi lain (format email, dll)

        let client; // Variabel untuk klien database
        try {
            // 1. Hash Password
            const saltRounds = 10; // Jumlah putaran untuk hashing (semakin tinggi semakin aman tapi lambat)
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 2. Terhubung ke Database
            client = await pool.connect();

            // 3. Query SQL untuk Menyimpan Pengguna Baru
            const query = `
                INSERT INTO users (whatsapp, username, email, full_name, password_hash)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id; -- Mengembalikan ID pengguna yang baru dibuat
            `;
            const values = [whatsapp, username, email, fullName, passwordHash];

            const result = await client.query(query, values);
            const newUserId = result.rows[0].id;

            // 4. Kirim Respons Sukses
            res.status(201).json({ // Status 201 Created
                message: 'Pendaftaran berhasil!',
                userId: newUserId
            });

        } catch (error) {
            console.error('Error saat pendaftaran:', error);

            // Tangani error spesifik (misalnya, data duplikat)
            if (error.code === '23505') { // Kode error PostgreSQL untuk unique violation
                let errorMessage = 'Pendaftaran gagal. Data sudah terdaftar: ';
                if (error.constraint === 'users_whatsapp_key') {
                    errorMessage += 'Nomor Whatsapp sudah terdaftar.';
                } else if (error.constraint === 'users_username_key') {
                    errorMessage += 'Username sudah terdaftar.';
                } else if (error.constraint === 'users_email_key') {
                    errorMessage += 'Email sudah terdaftar.';
                } else {
                    errorMessage = 'Pendaftaran gagal. Data duplikat.'; // Error duplikat umum
                }
                return res.status(409).json({
                    message: errorMessage
                }); // Status 409 Conflict
            }

            // Tangani error lainnya
            res.status(500).json({
                message: 'Pendaftaran gagal. Terjadi kesalahan internal.'
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