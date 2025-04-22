// public/script.js - Script untuk halaman login/daftar (Integrasi Supabase Authentication)

// --- KONFIGURASI SUPABASE ---
// !!! PERINGATAN: Menyimpan URL dan ANON KEY secara langsung di kode klien yang publik
// TIDAK AMAN untuk aplikasi produksi. Gunakan environment variables atau server-side logic. !!!
const supabaseUrl = 'https://gdhetudsmvypfpksggqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGV0dWRzbXZ5cGZwa3NnZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDQ3OTksImV4cCI6MjA2MDgyMDc5OX0.-E9dDIBX8s-AL50bG_vrcdIOAMzeXh1VFzsJbSL5znE';

// Inisialisasi klien Supabase
// Pastikan Anda sudah menambahkan tag script Supabase JS Library di index.html HEAD:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Buat instance client Supabase menggunakan objek global 'supabase' dari library
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase client initialized.");

// --- Logika Cek Status Login dengan Supabase saat DOMContentLoaded ---
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Supabase Auth State Change:', event, session);

    // Jika ada sesi aktif (pengguna sudah login), redirect ke homepage
    // Ini adalah cara standar dan disarankan untuk menangani redirect.
    if (session) {
        console.log("Sesi Supabase ditemukan, redirect ke homepage.html (via onAuthStateChange)");
        window.location.replace('/homepage.html'); // !!! Pastikan '/homepage.html' adalah path homepage Anda !!!
    } else {
        console.log("Tidak ada sesi Supabase, tetap di halaman login/daftar.");
    }
});


document.addEventListener('DOMContentLoaded', async () => {

    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginFormContainer = document.getElementById('loginForm');
    const registerFormContainer = document.getElementById('registerForm');

    const loginFormElement = document.getElementById('login');
    const registerFormElement = document.getElementById('register');

    const notificationElement = document.getElementById('custom-notification');


    function showNotification(message, type = 'info', duration = 3000) {
        if (!notificationElement) return;
        if (notificationElement.timeoutId) {
            clearTimeout(notificationElement.timeoutId);
        }

        notificationElement.textContent = message;
        notificationElement.className = 'custom-notification ' + type;
        notificationElement.classList.add('show');

        notificationElement.timeoutId = setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.addEventListener('transitionend', function handler() {
                if (!notificationElement.classList.contains('show')) {
                    notificationElement.style.display = 'none';
                    notificationElement.textContent = '';
                }
                notificationElement.removeEventListener('transitionend', handler);
            });
        }, duration);
    }


    function showLoginTab() {
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');

        if (registerFormContainer) registerFormContainer.classList.add('hidden');
        if (loginFormContainer) loginFormContainer.classList.remove('hidden');

        if (loginFormElement) loginFormElement.classList.remove('hidden');
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) forgotForm.classList.add('hidden');

        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    function showRegisterTab() {
        if (registerTab) registerTab.classList.add('active');
        if (loginTab) loginTab.classList.remove('active');

        if (loginFormContainer) loginFormContainer.classList.add('hidden');
        if (registerFormContainer) registerFormContainer.classList.remove('hidden');

        if (registerFormElement) registerFormElement.classList.remove('hidden');

        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }


    function showFormContent(formToShowId) {
        if (!loginFormContainer) {
            console.error("Login form container not found.");
            return;
        }
        const formContents = loginFormContainer.querySelectorAll('.form-content');
        formContents.forEach(formContent => {
            formContent.classList.add('hidden');
        });

        const formToShow = document.getElementById(formToShowId);
        if (formToShow) {
            formToShow.classList.remove('hidden');
        } else {
            console.error(`Form content with ID "${formToShowId}" not found.`);
        }
        showNotification('');
        if (notificationElement) notificationElement.style.display = 'none';
    }

    if (loginFormElement) loginFormElement.classList.add('form-content');
    if (registerFormElement) registerFormElement.classList.add('form-content');


    if (loginTab) loginTab.addEventListener('click', showLoginTab);
    if (registerTab) registerTab.addEventListener('click', showRegisterTab);
    const switchToRegisterLink = document.getElementById('switchToRegister');
    const switchToLoginLink = document.getElementById('switchToLogin');
    if (switchToRegisterLink) switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterTab();
    });
    if (switchToLoginLink) switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginTab();
    });


    function setupPasswordToggle(checkboxId, passwordInputId) {
        const checkbox = document.getElementById(checkboxId);
        const passwordInput = document.getElementById(passwordInputId);
        if (checkbox && passwordInput) {
            passwordInput.type = checkbox.checked ? 'text' : 'password';
            checkbox.addEventListener('change', function () {
                passwordInput.type = this.checked ? 'text' : 'password';
            });
        } else {
            console.warn(`Toggle elements not found: Checkbox ID "${checkboxId}", Input ID "${passwordInputId}"`);
        }
    }

    setupPasswordToggle('showLoginPassword', 'loginPassword');
    setupPasswordToggle('showPassword', 'password');
    setupPasswordToggle('showConfirmPassword', 'confirmPassword');


    const handleForgotPasswordClick = (e) => {
        e.preventDefault();

        if (!loginFormContainer) {
            console.error("Login form container not found for forgot password flow.");
            return;
        }

        const loginFormElement = document.getElementById('login');
        const originalLoginFormContentHTML = loginFormElement ? loginFormElement.outerHTML : '';

        if (loginFormElement) loginFormElement.classList.add('hidden');

        loginFormContainer.innerHTML = `
            <div class="form-content" id="forgotPasswordForm">
                <h2> Lupa Password </h2>
                <p style="color: #272343; font-style: italic;"> Masukkan Email akun Anda untuk memulai proses reset password. </p>
                <form id="forgotPasswordFormElement">
                    <div class="input-group">
                        <label for="forgotPasswordEmail"> Email </label>
                        <input type="email" id="forgotPasswordEmail" placeholder="Masukan Email" required>
                    </div>
                    <button type="submit"> Kirim Link Reset </button>
                    <p class="switch-form"> Ingat password? <a href="#" id="switchToLoginFromForgot"> Masuk Sekarang </a></p>
                </form>
             </div>
        `;

        const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');

        const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');
        if (switchToLoginFromForgot) {
            switchToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                if (loginFormContainer) {
                    loginFormContainer.innerHTML = originalLoginFormContentHTML;
                    attachLoginFormListeners();
                }
            });
        }

        if (forgotPasswordFormElement) {
            forgotPasswordFormElement.addEventListener('submit', async (e) => {
                e.preventDefault();

                const emailInput = document.getElementById('forgotPasswordEmail');
                if (!emailInput) {
                    console.error("Forgot password email input not found.");
                    showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
                    return;
                }
                const email = emailInput.value.trim();

                if (!email) {
                    showNotification('Email harus diisi.', 'error');
                    return;
                }

                showNotification('Mengirim link reset password...', 'info');

                const {
                    data,
                    error
                } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    // !!! GANTI URL INI !!!
                    redirectTo: window.location.origin + '/reset-password.html'
                });

                if (error) {
                    console.error('Error reset password Supabase:', error.message);
                    showNotification(`Gagal mengirim link reset: ${error.message}`, 'error');
                } else {
                    console.log('Link reset password dikirim (cek email).', data);
                    showNotification('Jika email terdaftar, link reset telah dikirim. Cek inbox Anda.', 'success', 5000);
                    setTimeout(() => {
                        const loginFormContainer = document.getElementById('loginForm');
                        if (loginFormContainer) {
                            loginFormContainer.innerHTML = originalLoginFormContentHTML;
                            attachLoginFormListeners();
                        }
                    }, 2000);
                }
            });
        } else {
            console.error("Forgot password form element not found after innerHTML replacement.");
        }
    };

    function attachResetPasswordFormListener(identifier) {
        console.warn("attachResetPasswordFormListener called in index.js - This function is for the reset password page.");
    }


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        console.log('Memproses login (menggunakan Supabase Authentication)...');

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (!emailInput || !passwordInput) {
            console.error("Login form inputs not found (Email or Password).");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showNotification('Email dan password harus diisi.', 'error');
            return;
        }

        showNotification('Memproses login...', 'info');

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Error login Supabase:', error.message);
            let errorMessage = 'Login gagal.';
            if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Email belum dikonfirmasi. Cek inbox Anda.';
            } else if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah.';
            } else {
                errorMessage += ' ' + error.message;
            }
            showNotification(errorMessage, 'error');
            passwordInput.value = '';

        } else {
            console.log('Login berhasil via Supabase Auth:', data);
            showNotification('Login berhasil!', 'success', 1000); // Tampilkan notifikasi sukses singkat

            // --- MENAMBAHKAN REDIRECT LANGSUNG DI SINI ---
            // Ini sebagai penjamin atau alternatif jika onAuthStateChange tidak redirect segera
            window.location.replace('/homepage.html'); // !!! TEMPORARY DIRECT REDIRECT !!!
            // ---------------------------------------------
        }
    };


    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        console.log('Memproses pendaftaran (menggunakan Supabase Authentication)...');

        const fullNameInput = document.getElementById('fullName');
        const usernameInput = document.getElementById('username');
        const whatsappInput = document.getElementById('whatsapp');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (!fullNameInput || !usernameInput || !whatsappInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error("Register form inputs not found.");
            showNotification('Terjadi kesalahan. Silakan coba lagi.', 'error');
            return;
        }

        const fullName = fullNameInput.value.trim();
        const username = usernameInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!fullName || !username || !whatsapp || !email || !password || !confirmPassword) {
            showNotification('Semua field harus diisi.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Password dan konfirmasi password tidak cocok.', 'error');
            return;
        }
        if (password.length < 6) {
            showNotification('Password minimal 6 karakter.', 'error');
            return;
        }

        showNotification('Memproses pendaftaran...', 'info');

        const {
            data,
            error
        } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    username: username,
                    whatsapp: whatsapp
                }
            }
        });

        if (error) {
            console.error('Error pendaftaran Supabase:', error.message);
            let errorMessage = 'Pendaftaran gagal.';
            if (error.message.includes('already registered')) {
                errorMessage = 'Email sudah terdaftar.';
            } else {
                errorMessage += ' ' + error.message;
            }
            showNotification(errorMessage, 'error');

        } else {
            console.log('Pendaftaran berhasil via Supabase Auth:', data);

            if (data && data.user && data.user.identities && data.user.identities.length > 0 && data.user.email_confirmed_at === null) {
                showNotification('Pendaftaran berhasil! Cek email Anda untuk konfirmasi akun sebelum login.', 'success', 7000);
            } else {
                showNotification('Pendaftaran berhasil! Silakan Login.', 'success');
            }

            setTimeout(() => {
                showLoginTab();
                const registerForm = document.getElementById('register');
                if (registerForm) registerForm.reset();
            }, 1500);
        }
    };


    function attachLoginFormListeners() {
        const loginFormElement = document.getElementById('login');
        const forgotPasswordLink = document.querySelector('#login form .forgot-password');

        if (loginFormElement) {
            loginFormElement.removeEventListener('submit', handleLoginSubmit);
            loginFormElement.addEventListener('submit', handleLoginSubmit);
            setupPasswordToggle('showLoginPassword', 'loginPassword');
        } else {
            console.error("Login form element with ID 'login' not found in attachLoginFormListeners.");
        }

        const currentForgotPasswordLink = document.querySelector('#login form .forgot-password');
        if (currentForgotPasswordLink) {
            currentForgotPasswordLink.removeEventListener('click', handleForgotPasswordClick);
            currentForgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
        }
    }


    if (registerFormElement) {
        registerFormElement.removeEventListener('submit', handleRegisterSubmit);
        registerFormElement.addEventListener('submit', handleRegisterSubmit);
        setupPasswordToggle('showPassword', 'password');
        setupPasswordToggle('showConfirmPassword', 'confirmPassword');
    } else {
        console.warn("Register form element with ID 'register' not found on initial load.");
    }


    function initializeFormsAndTabs() {
        if (!loginTab || !registerTab || !loginFormContainer || !registerFormContainer) {
            console.error("HTML structure for tabs or forms not complete.");
            showNotification('Error: Struktur halaman tidak lengkap.', 'error');
            return;
        }

        attachLoginFormListeners();

        registerFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');

        if (loginFormElement) loginFormElement.classList.remove('hidden');
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) forgotForm.classList.add('hidden');

        console.log("Halaman login/daftar diinisialisasi.");
    }

    initializeFormsAndTabs();


}); // Akhir DOMContentLoaded