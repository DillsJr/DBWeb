// api/register.js
// Serverless Function untuk menangani permintaan pendaftaran

export default function handler(req, res) {
    if (req.method === 'POST') {
        // Mengambil data pendaftaran dari body permintaan
        const {
            fullName,
            username, // Gunakan username untuk login nanti atau whatsapp
            whatsapp,
            email,
            password, // PASSWORD INI PERLU DI-HASH!
            // confirmPassword (biasanya divalidasi di frontend, tapi bisa juga di backend)
        } = req.body;

        // --- LOGIKA PENDAFTARAN SESUNGGUHNYA ADA DI SINI ---
        // GANTI BAGIAN INI dengan logika backend sesungguhnya:
        // 1. Lakukan validasi data (misalnya, format email/nomor WA).
        // 2. Cek apakah username, whatsapp, atau email sudah terdaftar di database.
        // 3. HASH password yang diterima (JANGAN SIMPAN PLAINTEXT!). Gunakan library seperti bcrypt.
        // 4. Simpan data pengguna baru (termasuk password ter-hash) ke database.
        // 5. Tangani error jika penyimpanan gagal (misalnya, koneksi DB, data duplikat).
        // ----------------------------------------------------

        console.log("Simulasi menerima data pendaftaran:", req.body); // Log data yang diterima

        // --- SIMULASI RESPON PENDAFTARAN ---
        // GANTI dengan respons NYATA setelah data disimpan ke DB
        const simulasiSukses = Math.random() > 0.2; // Simulasi 80% sukses

        if (simulasiSukses) {
            // Contoh: Jika username atau email sudah terdaftar, kirim error
            if (username === 'existing_user') { // Contoh kondisi simulasi
                res.status(409).json({
                    message: 'Username sudah terdaftar.'
                });
            } else if (email === 'existing@example.com') { // Contoh kondisi simulasi
                res.status(409).json({
                    message: 'Email sudah terdaftar.'
                });
            }
            // Jika tidak ada duplikasi dan sukses menyimpan
            else {
                res.status(201).json({ // Status 201 Created
                    message: 'Pendaftaran berhasil!',
                    userId: 'simulasi_user_id' // Contoh ID pengguna baru
                });
            }

        } else {
            // Simulasi error pendaftaran
            res.status(500).json({
                message: 'Pendaftaran gagal. Terjadi kesalahan internal simulasi.'
            });
        }
        // ------------------------------------

    } else {
        res.status(405).json({
            message: 'Metode Tidak Diizinkan. Gunakan POST.'
        });
    }
}