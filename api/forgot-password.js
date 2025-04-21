// api/forgot-password.js
// Serverless Function untuk menangani permintaan lupa password

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Mengambil data dari body permintaan
        const {
            whatsapp, // Asumsi pengguna memasukkan nomor WA
            // atau email, username, dll. tergantung desain
        } = req.body;

        // --- LOGIKA LUPA PASSWORD SESUNGGUHNYA ADA DI SINI ---
        // GANTI BAGIAN INI dengan logika backend sesungguhnya:
        // 1. Cari pengguna di database berdasarkan 'whatsapp'.
        // 2. Jika pengguna ditemukan:
        //    a. Hasilkan kode reset password yang unik (misalnya, angka acak atau token JWT pendek).
        //    b. Simpan kode reset ini di database terkait pengguna tersebut, beserta waktu kedaluwarsa.
        //    c. Kirimkan kode reset ini ke pengguna (misalnya, melalui SMS ke nomor WhatsApp, memerlukan integrasi dengan layanan SMS API).
        // 3. Tangani jika pengguna tidak ditemukan (PENTING: Jangan berikan pesan yang terlalu spesifik ke frontend demi keamanan).
        // ----------------------------------------------------

        console.log("Simulasi menerima permintaan lupa password untuk WA:", whatsapp); // Log data

        // --- SIMULASI RESPON LUPA PASSWORD ---
        // GANTI dengan respons NYATA setelah logika dijalankan
        const simulasiUserDitemukan = whatsapp === '081234567890'; // Contoh simulasi pengguna ditemukan

        if (simulasiUserDitemukan) {
            // Simulasi berhasil mengirim kode (kode tidak benar-benar dikirim)
            res.status(200).json({
                message: 'Kode reset telah dikirim ke WhatsApp Anda.'
            });
        } else {
            // Simulasi pengguna tidak ditemukan atau gagal kirim (pesan umum demi keamanan)
            res.status(404).json({ // Status 404 Not Found atau 400 Bad Request
                message: 'Nomor Whatsapp tidak terdaftar atau terjadi kesalahan.'
            });
        }
        // --------------------------------------

    } else {
        res.status(405).json({
            message: 'Metode Tidak Diizinkan. Gunakan POST.'
        });
    }
}