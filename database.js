const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'users.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Gagal terhubung ke database", err.message);
    } else {
        console.log("Terhubung ke database SQLite.");
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fullName TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                whatsapp TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error("Gagal membuat tabel users", err.message);
            } else {
                console.log("Tabel users berhasil dibuat atau sudah ada.");
            }
        });
    }
});

module.exports = db;