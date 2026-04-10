document.addEventListener('DOMContentLoaded', async function () {
    const user = requireCurrentUser();
    if (!user) {
        window.location.href = './login.html';
        return;
    }

    var headerEl = document.querySelector('.page-header');
    if (headerEl) {
        headerEl.classList.add(user.role === 'TEACHER' ? 'page-header-teacher' : 'page-header-student');
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('sessionId');
    const from = params.get('from');
    if (!sessionId) {
        qs('#resultTopic').textContent = 'Missing session id';
        return;
    }

    qs('#backButton').addEventListener('click', function () {
        if (from === 'teacher-dashboard') {
            window.location.href = './teacher-dashboard.html';
            return;
        }
        window.location.href = user.role === 'TEACHER' ? './teacher-dashboard.html' : './waiting-room.html';
    });

    if (user.role !== 'TEACHER') {
        qs('#exportCsvButton').style.display = 'none';
    } else {
        qs('#exportCsvButton').addEventListener('click', async function () {
            try {
                const response = await fetch(API_BASE_URL + '/teacher/sessions/' + sessionId + '/result.csv', {
                    headers: {
                        Authorization: 'Bearer ' + getAccessToken()
                    }
                });
                if (!response.ok) {
                    throw new Error('Export failed with status ' + response.status);
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'session-' + sessionId + '-result.csv';
                link.click();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                showMessage(qs('#message'), error.message, true);
            }
        });
    }

    try {
        const data = await apiRequest(user.role === 'TEACHER' ? '/teacher/sessions/' + sessionId + '/result' : '/students/session-result?sessionId=' + sessionId);
        qs('#resultTopic').textContent = data.topic + ' | Status: ' + data.status + ' | Duration: ' + (data.durationMinutes || '-') + ' min';

        var groups = data.groups || [];
        var totalParticipants = 0;
        var totalSpeaking = 0;
        groups.forEach(function (group) {
            var members = group.members || [];
            totalParticipants += members.length;
            members.forEach(function (m) { totalSpeaking += (m.score || 0); });
        });

        var summaryHtml = '<div class="row" style="flex-wrap:wrap;gap:12px 24px;">' +
            '<div><strong>Groups:</strong> ' + groups.length + '</div>' +
            '<div><strong>Participants:</strong> ' + totalParticipants + '</div>' +
            '<div><strong>Total Speaking:</strong> ' + totalSpeaking + 's</div>' +
            '</div>';
        if (data.startedAt) {
            summaryHtml += '<div class="row" style="flex-wrap:wrap;gap:12px 24px;">' +
                '<div><strong>Started:</strong> ' + new Date(data.startedAt).toLocaleString() + '</div>' +
                (data.endedAt ? '<div><strong>Ended:</strong> ' + new Date(data.endedAt).toLocaleString() + '</div>' : '') +
                '</div>';
        }
        qs('#resultSummaryContent').innerHTML = summaryHtml;
        qs('#resultSummary').style.display = '';

        var medals = ['&#127942;', '&#129352;', '&#129353;'];
        qs('#resultRanking').innerHTML = (data.ranking || []).map(function (item, index) {
            var personality = (item.personality || '').toString().toLowerCase();
            var avatarText = (item.name || '?').trim().charAt(0).toUpperCase();
            var rankClass = index < 3 ? ' rank-' + (index + 1) : '';
            var medal = index < 3 ? '<span style="margin-right:4px;">' + medals[index] + '</span>' : (index + 1) + '. ';
            return '<div class="ranking-item' + rankClass + '"><div class="avatar-line">' +
                '<span class="avatar-badge personality-' + personality + '">' + avatarText + '</span>' +
                '<div>' + medal + escapeText(item.name || '') + ' - ' + item.score + 's (' + escapeText(item.groupName || '') + ')</div>' +
                '</div></div>';
        }).join('') || '<div class="form-hint">No ranking data</div>';
        applyStagger(qs('#resultRanking'));

        qs('#resultGroups').innerHTML = groups.map(function (group) {
            var members = group.members || [];
            var groupTotal = 0;
            members.forEach(function (m) { groupTotal += (m.score || 0); });
            return '<div class="card stack">' +
                '<div class="row" style="justify-content:space-between;align-items:center;">' +
                '<strong>' + escapeText(group.groupName || '') + '</strong>' +
                '<span class="form-hint">' + members.length + ' members · ' + groupTotal + 's total</span>' +
                '</div>' +
                (members.map(function (member) {
                    var personality = (member.personality || '').toString().toLowerCase();
                    var avatarText = (member.name || '?').trim().charAt(0).toUpperCase();
                    return '<div class="avatar-line">' +
                        '<span class="avatar-badge personality-' + personality + '">' + avatarText + '</span>' +
                        '<div>' + escapeText(member.name || '') + ' (' + escapeText(member.personality || '-') + ') - ' + (member.score || 0) + 's</div>' +
                        '</div>';
                }).join('') || '<div class="form-hint">No members</div>') +
                '</div>';
        }).join('') || '<div class="form-hint">No group data</div>';
        applyStagger(qs('#resultGroups'));
    } catch (error) {
        qs('#resultTopic').textContent = error.message;
    }

    function applyStagger(container) {
        if (container.dataset.staggerApplied) return;
        container.dataset.staggerApplied = '1';
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
            children[i].classList.add('stagger-in');
            children[i].style.animationDelay = (i * 40) + 'ms';
        }
    }
});
