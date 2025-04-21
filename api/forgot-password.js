// api/forgot-password.js
import {
    Pool
} from 'pg'; // Import library pg
// Import library untuk menghasilkan token unik (misalnya, 'uuid' atau 'crypto')
// import { v4 as uuidv4 } from 'uuid'; // Contoh pakai uuid
import crypto from 'crypto'; // Node.js built-in module

// Gunakan pool koneksi yang sama
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: { rejectUnauthorized: false } // Sesuaikan jika perlu SSL
});

// Fungsi helper untuk menghasilkan token acak sederhana (misalnya, 6 digit angka)
function generateResetCode(length = 6) {
    const characters = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

// Atau gunakan cara yang lebih aman dan unik seperti UUID
// function generateResetToken() {
//     return uuidv4(); // Memerlukan 'uuid' library
// }

// Atau gunakan cara dari crypto Node.js
function generateSecureToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
}


export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {
            whatsapp, // Identitas pengguna dari frontend
            // Jika frontend juga mengirim email/username, sesuaikan di sini
        } = req.body;

        // Validasi input dasar
        if (!whatsapp) {
            return res.status(400).json({
                message: 'Nomor Whatsapp harus diisi.'
            });
        }

        let client;
        try {
            client = await pool.connect();

            // 1. Cari Pengguna Berdasarkan Whatsapp
            const userQuery = 'SELECT id FROM users WHERE whatsapp = $1;';
            const userResult = await client.query(userQuery, [whatsapp]);
            const user = userResult.rows[0];

            if (!user) {
                // PENTING: Kirim pesan umum meskipun pengguna tidak ditemukan demi keamanan
                // Ini mencegah enumerasi pengguna (mencoba nomor WA untuk melihat mana yang terdaftar)
                console.warn(`Attempted password reset for non-existent WA: ${whatsapp}`);
                return res.status(200).json({
                    message: 'Jika nomor terdaftar, instruksi reset akan dikirim.'
                });
            }

            const userId = user.id;

            // 2. Hapus Token Reset yang Lama untuk Pengguna Ini (Bersihkan)
            const deleteOldTokensQuery = 'DELETE FROM password_reset_tokens WHERE user_id = $1;';
            await client.query(deleteOldTokensQuery, [userId]);

            // 3. Hasilkan Token Reset Baru dan Tentukan Waktu Kedaluwarsa
            // const resetToken = generateResetCode(6); // Contoh pakai kode 6 digit
            const resetToken = generateSecureToken(32); // Contoh pakai token hex lebih aman
            const expiresAt = new Date(Date.now() + 3600000); // Contoh kedaluwarsa dalam 1 jam (3600000 ms)

            // 4. Simpan Token Reset Baru di Database
            const insertTokenQuery = `
                INSERT INTO password_reset_tokens (user_id, token, expires_at)
                VALUES ($1, $2, $3);
            `;
            await client.query(insertTokenQuery, [userId, resetToken, expiresAt]);

            // --- TEMPAT UNTUK MENGIRIM TOKEN KE PENGGUNA ---
            // INI ADALAH BAGIAN YANG PALING KOMPLEKS DAN MEMERLUKAN LAYANAN EKSTERNAL!
            // Contoh:
            // try {
            //    // Gunakan Twilio API untuk mengirim SMS:
            //    // const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            //    // await twilioClient.messages.create({
            //    //    body: `Kode reset password Anda: ${resetToken}. Akan kedaluwarsa dalam 1 jam.`,
            //    //    from: process.env.TWILIO_PHONE_NUMBER, // Nomor pengirim Twilio Anda
            //    //    to: whatsapp // Nomor WA pengguna
            //    // });
            //
            //    // Atau gunakan Nodemailer + SMTP service untuk mengirim email:
            //    // const nodemailer = require('nodemailer');
            //    // const transporter = nodemailer.createTransport({ /* Konfigurasi SMTP Anda */ });
            //    // await transporter.sendMail({
            //    //    from: '"Nama Anda" <your_email@example.com>',
            //    //    to: emailPenggunaDariDB, // Ambil email dari data pengguna yang dicari sebelumnya
            //    //    subject: 'Permintaan Reset Password Anda',
            //    //    text: `Kode reset password Anda: ${resetToken}. Akan kedaluwarsa dalam 1 jam.`,
            //    //    html: `<p>Kode reset password Anda: <strong>${resetToken}</strong>.</p><p>Akan kedaluwarsa dalam 1 jam.</p>`
            //    // });
            //
            // } catch (sendError) {
            //    console.error('Gagal mengirim kode reset:', sendError);
            //    // Pertimbangkan apakah Anda ingin memberitahu frontend error pengiriman
            //    // atau tetap menganggap proses reset "dimulai" meskipun pengiriman gagal.
            //    // Untuk keamanan, seringkali lebih baik menganggapnya sukses dari sisi frontend.
            // }
            // -------------------------------------------------


            // 5. Kirim Respons Sukses ke Frontend (Meski pengiriman mungkin gagal)
            // Pesan umum demi keamanan, jangan sebutkan token di sini.
            res.status(200).json({
                message: 'Jika nomor terdaftar, instruksi reset akan dikirim.'
            });

        } catch (error) {
            console.error('Error saat proses lupa password:', error);
            res.status(500).json({
                message: 'Terjadi kesalahan internal saat lupa password.'
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