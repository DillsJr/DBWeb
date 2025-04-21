// api/reset-password.js
// Serverless Function untuk menangani permintaan reset password

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Mengambil data dari body permintaan
        const {
            whatsapp, // Identitas pengguna
            token, // Kode reset yang dimasukkan pengguna
            newPassword, // Password baru yang dimasukkan pengguna (PERLU DI-HASH!)
        } = req.body;

        // --- LOGIKA RESET PASSWORD SESUNGGUHNYA ADA DI SINI ---
        // GANTI BAGIAN INI dengan logika backend sesungguhnya:
        // 1. Cari pengguna di database berdasarkan 'whatsapp'.
        // 2. Jika pengguna ditemukan:
        //    a. Verifikasi kode reset ('token') yang dimasukkan pengguna dengan kode reset yang tersimpan di database untuk pengguna tersebut.
        //    b. Cek apakah kode reset tersebut masih berlaku (belum kedaluwarsa).
        //    c. Jika kode valid:
        //       i. HASH `newPassword` yang diterima.
        //       ii. Perbarui password pengguna di database dengan password baru yang sudah di-hash.
        //       iii. Invalidasi atau hapus kode reset dari database agar tidak bisa digunakan lagi.
        //    d. Tangani jika kode tidak valid atau sudah kedaluwarsa.
        // 3. Tangani jika pengguna tidak ditemukan (pesan umum demi keamanan).
        // --------------------------------------------------------

        console.log("Simulasi menerima permintaan reset password:", req.body); // Log data

        // --- SIMULASI RESPON RESET PASSWORD ---
        // GANTI dengan respons NYATA setelah logika dijalankan
        const simulasiTokenValid = token === '123456'; // Contoh simulasi token valid

        if (simulasiTokenValid) {
            // Simulasi berhasil reset password
            res.status(200).json({
                message: 'Password berhasil direset.'
            });
        } else {
            // Simulasi token tidak valid atau error lain
            res.status(400).json({ // Status 400 Bad Request atau 401 Unauthorized
                message: 'Kode reset tidak valid atau sudah kedaluwarsa.'
            });
        }
        // --------------------------------------

    } else {
        res.status(405).json({
            message: 'Metode Tidak Diizinkan. Gunakan POST.'
        });
    }
}