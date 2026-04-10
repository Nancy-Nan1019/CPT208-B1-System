document.addEventListener('DOMContentLoaded', function () {
    const form = qs('#loginForm');
    const toggle = qs('#modeToggle');
    const title = qs('#pageTitle');
    const submit = qs('#submitButton');
    const message = qs('#message');
    let mode = 'login';

    toggle.addEventListener('click', function () {
        mode = mode === 'login' ? 'register' : 'login';
        title.textContent = mode === 'login' ? 'Login' : 'Register';
        submit.textContent = mode === 'login' ? '\uD83D\uDE80 Login' : '\u2728 Register';
        qs('#nameRow').style.display = mode === 'register' ? 'block' : 'none';
        qs('#name').required = mode === 'register';
        qs('#roleRow').style.display = mode === 'register' ? 'block' : 'none';
        toggle.textContent = mode === 'login' ? '\u270F\uFE0F No account? Register' : '\uD83D\uDD11 Already have an account? Login';
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        try {
            const payload = {
                email: qs('#email').value.trim(),
                password: qs('#password').value.trim()
            };
            let data;
            if (mode === 'register') {
                payload.name = qs('#name').value.trim();
                payload.role = qs('#role').value;
                data = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            } else {
                data = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }
            saveAccessToken(data.accessToken);
            saveCurrentUser(data.user);
            showMessage(message, mode === 'login' ? 'Login successful' : 'Registration successful');
            if (data.user.role === 'STUDENT') {
                if (data.user.personality) {
                    window.location.href = './waiting-room.html';
                } else {
                    window.location.href = './onboarding.html';
                }
            } else {
                window.location.href = './teacher-dashboard.html';
            }
        } catch (error) {
            showMessage(message, error.message, true);
        }
    });
});
