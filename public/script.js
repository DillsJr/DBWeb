const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Mencegah form submit secara default

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Data yang akan dikirim ke backend
    const data = {
        username: username,
        password: password
    };

    messageElement.textContent = 'Logging in...';
    messageElement.className = 'message'; // Reset class

    try {
        // Panggil API login di Vercel Serverless Function
        // Path '/api/login' akan otomatis merujuk ke api/login.js
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) { // Status code 2xx
            messageElement.textContent = result.message;
            messageElement.className = 'message success'; // Tambahkan class success
            // Di sini kamu bisa redirect pengguna atau menyimpan token
            // window.location.href = '/dashboard'; // Contoh redirect
        } else { // Status code lainnya (4xx, 5xx)
            messageElement.textContent = result.message || 'Login failed';
            messageElement.className = 'message'; // Tetap class default error
        }

    } catch (error) {
        console.error('Error during login fetch:', error);
        messageElement.textContent = 'An error occurred. Please try again.';
        messageElement.className = 'message';
    }
});