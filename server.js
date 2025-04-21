const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./database'); // Import koneksi database
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rute untuk login
app.post('/api/login', (req, res) => {
    const {
        whatsapp,
        password
    } = req.body;
    console.log("Mencoba login dengan WhatsApp:", whatsapp);

    db.get("SELECT * FROM users WHERE whatsapp = ?", [whatsapp], async (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat login'
            });
        }
        if (!row) {
            console.log("Pengguna dengan WhatsApp", whatsapp, "tidak ditemukan");
            return res.status(401).json({
                message: 'Nomor WhatsApp atau password salah'
            });
        }
        console.log("Pengguna ditemukan:", row);
        try {
            const passwordMatch = await bcrypt.compare(password, row.password);
            console.log("Hasil perbandingan password:", passwordMatch);
            if (passwordMatch) {
                res.json({
                    message: 'Login berhasil',
                    username: row.username
                });
            } else {
                res.status(401).json({
                    message: 'Nomor WhatsApp atau password salah'
                });
            }
        } catch (error) {
            console.error("Gagal membandingkan password", error);
            res.status(500).json({
                message: 'Terjadi kesalahan saat login'
            });
        }
    });
});

// Rute untuk registrasi
app.post('/api/register', async (req, res) => {
    const {
        fullName,
        username,
        whatsapp,
        email,
        password
    } = req.body;

    db.get("SELECT * FROM users WHERE whatsapp = ? OR email = ?", [whatsapp, email], async (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                message: 'Terjadi kesalahan saat pendaftaran'
            });
        }
        if (row) {
            return res.status(400).json({
                message: 'Nomor WhatsApp atau email sudah terdaftar'
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(`
                INSERT INTO users (fullName, username, whatsapp, email, password)
                VALUES (?, ?, ?, ?, ?)
            `, [fullName, username, whatsapp, email, hashedPassword], function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({
                        message: 'Terjadi kesalahan saat menyimpan data'
                    });
                }
                res.json({
                    message: 'Pendaftaran berhasil'
                });
            });
        } catch (error) {
            console.error("Gagal mengenkripsi password", error);
            res.status(500).json({
                message: 'Terjadi kesalahan saat pendaftaran'
            });
        }
    });
});

const resetTokens = {}; // Objek sederhana untuk menyimpan token reset (UNTUK DEMO SAJA)

// Rute untuk memulai proses lupa password
app.post('/api/forgot-password', (req, res) => {
    const {
        whatsapp
    } = req.body;
    console.log("Permintaan lupa password untuk WhatsApp:", whatsapp);

    db.get("SELECT * FROM users WHERE whatsapp = ?", [whatsapp], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({
                message: 'Terjadi kesalahan server'
            });
        }
        if (!row) {
            return res.status(404).json({
                message: 'Nomor WhatsApp tidak ditemukan'
            });
        }

        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expirationTime = Date.now() + 3600000; // Token berlaku selama 1 jam

        resetTokens[whatsapp] = {
            token: resetToken,
            expires: expirationTime
        };
        console.log("Token reset dibuat untuk", whatsapp + ":", resetToken);

        // !!! INTEGRASI DENGAN LAYANAN WHATSAPP DI SINI !!!
        // Contoh (TIDAK AKAN BERFUNGSI TANPA INTEGRASI):
        // kirimPesanWhatsApp(whatsapp, `Kode reset password Anda: ${resetToken}`);

        res.json({
            message: 'Kode reset telah dikirim ke WhatsApp Anda.'
        });
    });
});

// Rute untuk mereset password
app.post('/api/reset-password', async (req, res) => {
    const {
        whatsapp,
        token,
        newPassword
    } = req.body;
    console.log("Permintaan reset password untuk WhatsApp:", whatsapp, "dengan token:", token);

    const storedTokenData = resetTokens[whatsapp];

    if (!storedTokenData || storedTokenData.token !== token || storedTokenData.expires < Date.now()) {
        return res.status(400).json({
            message: 'Token reset tidak valid atau sudah kadaluarsa'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run("UPDATE users SET password = ? WHERE whatsapp = ?", [hashedPassword, whatsapp], function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({
                    message: 'Terjadi kesalahan saat mereset password'
                });
            }
            console.log("Password berhasil direset untuk WhatsApp:", whatsapp);
            delete resetTokens[whatsapp];
            res.json({
                message: 'Password berhasil direset'
            });
        });
    } catch (error) {
        console.error("Gagal mengenkripsi password baru", error);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mereset password'
        });
    }
});

// Middleware untuk menangani 404 error
app.use((req, res) => {
    res.status(404).json({
        message: 'Halaman tidak ditemukan'
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});