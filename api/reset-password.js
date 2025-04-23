// api/reset-password.js
import {
    Pool
} from 'pg'; // Import library pg
import bcrypt from 'bcrypt'; // Import library bcrypt

// Gunakan pool koneksi yang sama
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Sesuaikan jika perlu SSL
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {
            whatsapp, // Identitas pengguna
            token, // Kode reset dari pengguna
            newPassword, // Password baru (akan di-hash)
            // confirmNewPassword (sudah divalidasi di frontend)
        } = req.body;

        // Validasi input dasar
        if (!whatsapp || !token || !newPassword) {
            return res.status(400).json({
                message: 'Nomor Whatsapp, kode reset, dan password baru harus diisi.'
            });
        }
        // Tambahkan validasi kekuatan password baru jika perlu

        let client;
        try {
            client = await pool.connect();

            // 1. Cari Pengguna Berdasarkan Whatsapp
            const userQuery = 'SELECT id FROM users WHERE whatsapp = $1;';
            const userResult = await client.query(userQuery, [whatsapp]);
            const user = userResult.rows[0];

            if (!user) {
                // Pengguna tidak ditemukan (pesan umum)
                return res.status(400).json({
                    message: 'Kode reset tidak valid atau sudah kedaluwarsa.'
                });
            }

            const userId = user.id;

            // 2. Cari Token Reset untuk Pengguna dan Token yang Diberikan
            const tokenQuery = `
                SELECT token_id, expires_at
                FROM password_reset_tokens
                WHERE user_id = $1 AND token = $2;
            `;
            const tokenResult = await client.query(tokenQuery, [userId, token]);
            const resetTokenData = tokenResult.rows[0];

            // 3. Verifikasi Token Valid dan Belum Kedaluwarsa
            if (!resetTokenData || new Date() > new Date(resetTokenData.expires_at)) {
                // Token tidak ditemukan, atau sudah kedaluwarsa
                // Penting: Hapus token yang sudah kedaluwarsa/tidak valid untuk keamanan
                if (resetTokenData) { // Jika token ditemukan tapi kedaluwarsa
                    await client.query('DELETE FROM password_reset_tokens WHERE token_id = $1;', [resetTokenData.token_id]);
                }
                return res.status(400).json({
                    message: 'Kode reset tidak valid atau sudah kedaluwarsa.'
                });
            }

            // 4. Jika Token Valid: Hash Password Baru
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // 5. Perbarui Password Pengguna di Tabel users
            const updatePasswordQuery = `
                UPDATE users
                SET password_hash = $1
                WHERE id = $2;
            `;
            await client.query(updatePasswordQuery, [newPasswordHash, userId]);

            // 6. Hapus Token Reset Setelah Berhasil Digunakan
            const deleteTokenQuery = 'DELETE FROM password_reset_tokens WHERE token_id = $1;';
            await client.query(deleteTokenQuery, [resetTokenData.token_id]);


            // 7. Kirim Respons Sukses
            res.status(200).json({
                message: 'Password Anda berhasil direset. Silahkan login dengan password baru Anda.'
            });

        } catch (error) {
            console.error('Error saat reset password:', error);
            res.status(500).json({
                message: 'Terjadi kesalahan internal saat reset password.'
            });

        } finally {
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