document.addEventListener('DOMContentLoaded', function () {
    const openingGif = qs('#loginOpeningGif');
    const openingFreeze = qs('#loginOpeningFreeze');
    const form = qs('#loginForm');
    const toggle = qs('#modeToggle');
    const title = qs('#pageTitle');
    const submit = qs('#submitButton');
    const submitText = qs('#submitButtonText');
    const toggleText = qs('#modeToggleText');
    const message = qs('#message');
    const ideaIcon = qs('#omiIdeaIcon');
    const dropZone = qs('#omiDropZone');
    let mode = 'login';

    function revealOmiIntro() {
        document.body.classList.add('omi-intro-ready');
        setTimeout(function () {
            document.body.classList.add('omi-idea-ready');
        }, 1900);
    }

    function freezeOpeningFrame() {
        if (!openingGif || !openingFreeze) {
            revealOmiIntro();
            return;
        }

        try {
            const canvas = openingFreeze;
            const width = openingGif.naturalWidth || window.innerWidth;
            const height = openingGif.naturalHeight || window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            context.drawImage(openingGif, 0, 0, width, height);
            document.body.classList.add('omi-opening-complete');
        } catch (error) {
            document.body.classList.add('omi-opening-complete');
        }

        setTimeout(revealOmiIntro, 40);
    }

    const gifDurationMs = 3880;

    function startOpeningSequence() {
        setTimeout(function () {
            freezeOpeningFrame();
        }, gifDurationMs);
    }

    if (!openingGif) {
        revealOmiIntro();
    } else if (openingGif.complete && openingGif.naturalWidth > 0) {
        startOpeningSequence();
    } else {
        openingGif.addEventListener('load', startOpeningSequence, { once: true });
        openingGif.addEventListener('error', revealOmiIntro, { once: true });
    }

    function startExperience() {
        if (!document.body.classList.contains('login-started')) {
            document.body.classList.add('login-started');
        }
        if (dropZone) {
            dropZone.classList.add('activated');
        }
        setTimeout(function () {
            qs('#email').focus();
        }, 260);
    }

    if (ideaIcon && dropZone) {
        ideaIcon.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', 'omi-idea');
            ideaIcon.classList.add('dragging');
        });

        ideaIcon.addEventListener('dragend', function () {
            ideaIcon.classList.remove('dragging');
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('dragover', function (event) {
            event.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', function () {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', function (event) {
            event.preventDefault();
            dropZone.classList.remove('drag-over');
            startExperience();
        });

        ideaIcon.addEventListener('click', function () {
            dropZone.classList.add('drag-over');
            setTimeout(function () {
                startExperience();
            }, 180);
        });
    }

    toggle.addEventListener('click', function () {
        mode = mode === 'login' ? 'register' : 'login';
        title.textContent = mode === 'login' ? 'Login' : 'Register';
        submitText.textContent = mode === 'login' ? 'Login' : 'Register';
        submit.querySelector('.btn-icon').textContent = mode === 'login' ? '\uD83D\uDE80' : '\u2728';
        qs('#nameRow').style.display = mode === 'register' ? 'block' : 'none';
        qs('#name').required = mode === 'register';
        qs('#roleRow').style.display = mode === 'register' ? 'block' : 'none';
        toggleText.textContent = mode === 'login' ? 'No account? Register' : 'Already have an account? Login';
        toggle.querySelector('.btn-icon').textContent = mode === 'login' ? '\u270F\uFE0F' : '\uD83D\uDD11';
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
