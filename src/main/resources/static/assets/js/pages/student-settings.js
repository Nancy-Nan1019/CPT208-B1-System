document.addEventListener('DOMContentLoaded', function () {
    const user = requireCurrentUser();
    if (!user) {
        return;
    }

    const message = qs('#message');
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const isTeacher = user.role === 'TEACHER';

    var avatarEl = qs('#profileAvatar');
    var initial = (user.name || '?').trim().charAt(0).toUpperCase();
    avatarEl.textContent = initial;
    avatarEl.style.background = isTeacher
        ? 'linear-gradient(135deg, #312e81, var(--violet-600))'
        : 'linear-gradient(135deg, #042f2e, var(--teal-500))';

    qs('#profileName').textContent = user.name || '-';
    qs('#profileEmail').textContent = user.email || '';

    var badge = qs('#profileRoleBadge');
    badge.textContent = isTeacher ? 'Teacher' : 'Student';
    badge.style.background = isTeacher ? 'var(--violet-100)' : 'rgba(45,212,191,.15)';
    badge.style.color = isTeacher ? 'var(--violet-600)' : 'var(--teal-600)';

    if (isTeacher) {
        qs('#personalitySection').style.display = 'none';
    } else if (user.personality) {
        var selected = document.querySelector('input[name="personality"][value="' + user.personality + '"]');
        if (selected) {
            selected.checked = true;
        }
    }

    qs('#backButton').addEventListener('click', function () {
        if (from === 'discussion-room') {
            window.location.href = './discussion-room.html';
            return;
        }
        if (from === 'teacher-dashboard') {
            window.location.href = './teacher-dashboard.html';
            return;
        }
        if (from === 'teacher-session') {
            var sid = params.get('sessionId');
            window.location.href = './teacher-session.html' + (sid ? '?sessionId=' + sid : '');
            return;
        }
        window.location.href = isTeacher ? './teacher-dashboard.html' : './waiting-room.html';
    });

    if (!isTeacher) {
        qs('#personalityForm').addEventListener('submit', async function (event) {
            event.preventDefault();
            try {
                var personality = qs('input[name="personality"]:checked');
                if (!personality) {
                    throw new Error('Please select E or I');
                }
                var updatedUser = await apiRequest('/students/personality', {
                    method: 'POST',
                    body: JSON.stringify({ personality: personality.value })
                });
                saveCurrentUser(updatedUser);
                showMessage(message, 'Profile updated');
            } catch (error) {
                showMessage(message, error.message, true);
            }
        });
    }
});
