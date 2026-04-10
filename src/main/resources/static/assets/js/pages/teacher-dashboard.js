document.addEventListener('DOMContentLoaded', async function () {
    const user = requireCurrentUser();
    if (!user || user.role !== 'TEACHER') {
        window.location.href = './login.html';
        return;
    }
    qs('#teacherName').textContent = user.name;
    let sessionCountdownTimers = [];
    let activeDetailSessionId = null;
    let activeDetailHtml = '';
    let activeDetailTimer = null;
    try {
        await loadSessions();
    } catch (error) {
        showMessage(qs('#message'), error.message, true);
    }

    qs('#sessionForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        try {
            var groupSize = Number(qs('#groupSize').value);
            if (groupSize < 2 || groupSize > 6) {
                throw new Error('Group size must be between 2 and 6');
            }
            await apiRequest('/sessions/teacher/create', {
                method: 'POST',
                body: JSON.stringify({
                    topic: qs('#topic').value.trim(),
                    durationMinutes: Number(qs('#durationMinutes').value),
                    groupSize: groupSize
                })
            });
            await loadSessions();
            qs('#topic').value = '';
            showMessage(qs('#message'), 'Session created');
        } catch (error) {
            showMessage(qs('#message'), error.message, true);
        }
    });

    async function loadSessions() {
        clearSessionCountdownTimers();
        const sessions = await apiRequest('/sessions/teacher');
        qs('#sessionList').innerHTML = sessions.map(function (session) {
            var s = session.status;
            var statusClass = s === 'RUNNING' ? 'status-active' : (s === 'ENDED' ? 'status-ended' : 'status-warning');
            var actions = '';
            if (s === 'CREATED') {
                actions = '<button class="btn" onclick="autoGroup(' + session.id + ')">\uD83D\uDC65 Auto Group</button>';
            } else if (s === 'GROUPED') {
                actions = '<button class="btn" onclick="autoGroup(' + session.id + ')">\uD83D\uDD04 Re-Group</button>' +
                    '<button class="btn" onclick="startSession(' + session.id + ')">\u25B6\uFE0F Start Session</button>';
            } else if (s === 'RUNNING') {
                actions = '<button class="btn btn-danger" onclick="endSession(' + session.id + ')">\u23F9\uFE0F End Session</button>';
            }
            var views = '';
            if (s !== 'ENDED') {
                views = '<button class="btn btn-outline" onclick="viewGroups(' + session.id + ')">\uD83D\uDC65 Groups</button>' +
                    '<button class="btn btn-outline" onclick="viewWaitingRoom(' + session.id + ')">\uD83D\uDECB Waiting Room</button>' +
                    '<button class="btn btn-outline" onclick="viewOverview(' + session.id + ')">\uD83D\uDCCA Overview</button>';
            }
            if (s === 'RUNNING') {
                views += '<button class="btn btn-outline" onclick="openSessionMonitor(' + session.id + ')">\uD83D\uDCBB Session Monitor</button>';
            }
            if (s === 'ENDED') {
                views += '<button class="btn btn-outline" onclick="viewResult(' + session.id + ')">\uD83C\uDFC6 Result</button>';
            }
            var sessionMeta = (session.durationMinutes || '-') + ' min · Group size ' + (session.groupSize || '-');
            if (s === 'RUNNING') {
                sessionMeta += ' · Remaining <span data-session-countdown="' + session.id + '">--:--</span>';
            }
            var detailHtml = activeDetailSessionId === session.id ? ('<div class="card stack" data-session-detail="' + session.id + '">' + activeDetailHtml + '</div>') : '';
            return '<div class="card stack">' +
                '<div class="row" style="justify-content:space-between;align-items:center;">' +
                '<strong>' + escapeText(session.topic || '') + '</strong>' +
                '<span class="status-chip ' + statusClass + '">' + s + '</span>' +
                '</div>' +
                '<div class="form-hint">' + sessionMeta + '</div>' +
                (actions ? '<div class="row">' + actions + '</div>' : '') +
                (views ? '<div class="row">' + views + '</div>' : '') +
                detailHtml +
                '</div>';
        }).join('');
        applyStagger(qs('#sessionList'));
        startSessionCountdowns(sessions);
    }

    function applyStagger(container) {
        if (container.dataset.staggerApplied) return;
        container.dataset.staggerApplied = '1';
        var children = container.children;
        for (var i = 0; i < children.length; i++) {
            children[i].classList.add('stagger-in');
            children[i].style.animationDelay = (i * 50) + 'ms';
        }
    }

    function setActiveDetail(sessionId, html) {
        if (activeDetailTimer) {
            clearTimeout(activeDetailTimer);
            activeDetailTimer = null;
        }
        activeDetailSessionId = sessionId;
        activeDetailHtml = html;
        return loadSessions();
    }

    async function setActiveDetailError(sessionId, html) {
        await setActiveDetail(sessionId, html);
        activeDetailTimer = setTimeout(async function () {
            activeDetailTimer = null;
            clearActiveDetail();
            await loadSessions();
        }, 5000);
    }

    function clearActiveDetail() {
        if (activeDetailTimer) {
            clearTimeout(activeDetailTimer);
            activeDetailTimer = null;
        }
        activeDetailSessionId = null;
        activeDetailHtml = '';
    }

    function clearSessionCountdownTimers() {
        sessionCountdownTimers.forEach(function (timerId) {
            clearInterval(timerId);
        });
        sessionCountdownTimers = [];
    }

    function startSessionCountdowns(sessions) {
        sessions.filter(function (session) {
            return session.status === 'RUNNING';
        }).forEach(function (session) {
            const countdownNode = document.querySelector('[data-session-countdown="' + session.id + '"]');
            if (!countdownNode || !session.expectedEndAt || !session.serverNow) {
                return;
            }
            const endTime = new Date(session.expectedEndAt).getTime();
            const serverNow = new Date(session.serverNow).getTime();
            if (isNaN(endTime) || isNaN(serverNow)) {
                countdownNode.textContent = '--:--';
                return;
            }
            const serverOffsetMs = serverNow - Date.now();
            const updateCountdown = function () {
                const remaining = Math.max(0, endTime - (Date.now() + serverOffsetMs));
                const totalSec = Math.ceil(remaining / 1000);
                const min = Math.floor(totalSec / 60);
                const sec = totalSec % 60;
                countdownNode.textContent = remaining <= 0 ? 'Ended' : (min + ':' + (sec < 10 ? '0' : '') + sec);
            };
            updateCountdown();
            sessionCountdownTimers.push(setInterval(updateCountdown, 1000));
        });
    }

    window.autoGroup = async function (sessionId) {
        try {
            await apiRequest('/teacher/sessions/' + sessionId + '/groups/auto', { method: 'POST' });
            clearActiveDetail();
            await window.viewGroups(sessionId);
        } catch (error) {
            await setActiveDetailError(sessionId, '<div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.startSession = async function (sessionId) {
        try {
            await apiRequest('/sessions/teacher/' + sessionId + '/start', { method: 'POST' });
            clearActiveDetail();
            await loadSessions();
        } catch (error) {
            await setActiveDetailError(sessionId, '<div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.endSession = async function (sessionId) {
        if (!confirm('End this session? This action cannot be undone.')) return;
        try {
            await apiRequest('/sessions/teacher/' + sessionId + '/end', { method: 'POST' });
            clearActiveDetail();
            await loadSessions();
        } catch (error) {
            await setActiveDetailError(sessionId, '<div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.viewGroups = async function (sessionId) {
        try {
            const groups = await apiRequest('/teacher/sessions/' + sessionId + '/groups');
            var options = groups.map(function (optionGroup) {
                return '<option value="' + optionGroup.groupId + '">' + optionGroup.groupName + '</option>';
            }).join('');
            var content = '<h3>Group Result</h3>' + (groups.map(function (group) {
                return '<div class="card stack"><div><strong>' + group.groupName + '</strong></div>' +
                    (group.members || []).map(function (member) {
                        var personality = (member.personality || '').toString().toLowerCase();
                        var avatarText = (member.name || '?').trim().charAt(0).toUpperCase();
                        return '<div class="row" style="justify-content:space-between;align-items:center;">' +
                            '<div class="avatar-line">' +
                            '<span class="avatar-badge personality-' + personality + '">' + avatarText + '</span>' +
                            '<div>' + member.name + ' (' + (member.personality || '-') + ')</div>' +
                            '</div>' +
                            '<div class="row">' +
                            '<select id="move-user-' + member.userId + '" class="input">' + options + '</select>' +
                            '<button class="btn" onclick="moveMember(' + sessionId + ',' + member.userId + ')">Move</button>' +
                            '</div>' +
                            '</div>';
                    }).join('') +
                    '</div>';
            }).join('') || '<div class="ranking-item">No groups found</div>');
            await setActiveDetail(sessionId, content);
        } catch (error) {
            await setActiveDetailError(sessionId, '<h3>Group Result</h3><div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.moveMember = async function (sessionId, userId) {
        try {
            const targetGroupId = Number(qs('#move-user-' + userId).value);
            await apiRequest('/teacher/sessions/' + sessionId + '/groups/move-member', {
                method: 'POST',
                body: JSON.stringify({
                    userId: userId,
                    targetGroupId: targetGroupId
                })
            });
            await window.viewGroups(sessionId);
        } catch (error) {
            await setActiveDetailError(sessionId, '<h3>Group Result</h3><div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.viewWaitingRoom = async function (sessionId) {
        try {
            const students = await apiRequest('/teacher/sessions/' + sessionId + '/waiting-room/students');
            if (!students.length) {
                await setActiveDetail(sessionId, '<h3>Waiting Room Students</h3><div class="ranking-item">No students in waiting room</div>');
                return;
            }
            var content = '<h3>Waiting Room Students</h3>' + students.map(function (student) {
                var personality = (student.personality || '').toString().toLowerCase();
                var avatarText = (student.name || '?').trim().charAt(0).toUpperCase();
                return '<div class="ranking-item"><div class="avatar-line">' +
                    '<span class="avatar-badge personality-' + personality + '">' + avatarText + '</span>' +
                    '<div>' + student.name + ' (' + (student.personality || '-') + ')</div>' +
                    '</div></div>';
            }).join('');
            await setActiveDetail(sessionId, content);
        } catch (error) {
            await setActiveDetailError(sessionId, '<h3>Waiting Room Students</h3><div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.viewOverview = async function (sessionId) {
        try {
            const overview = await apiRequest('/teacher/sessions/' + sessionId + '/overview');
            var content = '<h3>Overview</h3><div class="card stack">' +
                '<div><strong>' + overview.topic + '</strong></div>' +
                '<div>Status: ' + overview.status + '</div>' +
                '<div>Joined: ' + overview.waitingRoomCount + '</div>' +
                '<div>Groups: ' + overview.groupCount + '</div>' +
                '<div>Total speaking: ' + overview.totalSpeakingSeconds + 's</div>' +
                '<div>Group ready ack: ' + (overview.groupReadyAckCount || 0) + '</div>' +
                '<div>Group ready pending: ' + (overview.groupReadyPendingCount || 0) + '</div>' +
                '</div>' +
                (overview.groups || []).map(function (group) {
                    return '<div class="card stack">' +
                        '<div><strong>' + group.groupName + '</strong></div>' +
                        '<div>Members: ' + group.memberCount + '</div>' +
                        '<div>Speaking: ' + group.speakingSeconds + 's</div>' +
                        (group.ranking || []).map(function (item) {
                            var avatarText = (item.name || '?').trim().charAt(0).toUpperCase();
                            return '<div class="avatar-line">' +
                                '<span class="avatar-badge">' + avatarText + '</span>' +
                                '<div>' + item.name + ' - ' + item.score + 's</div>' +
                                '</div>';
                        }).join('') +
                        '</div>';
                }).join('') +
                '<div class="card stack"><div><strong>Group Ready Confirmation</strong></div>' +
                (((overview.groupReadyStudents || []).map(function (student) {
                var personality = (student.personality || '').toString().toLowerCase();
                var avatarText = (student.name || '?').trim().charAt(0).toUpperCase();
                return '<div class="ranking-item row" style="justify-content:space-between;align-items:center;">' +
                    '<div class="avatar-line">' +
                    '<span class="avatar-badge personality-' + personality + '">' + avatarText + '</span>' +
                    '<div>' + student.name + ' (' + (student.personality || '-') + ')</div>' +
                    '</div>' +
                    '<span class="status-chip ' + (student.acknowledged ? 'status-active' : 'status-warning') + '">' + (student.acknowledged ? 'Acknowledged' : 'Pending') + '</span>' +
                    '</div>';
            }).join('')) || '<div class="ranking-item">No acknowledgement data</div>') + '</div>';
            await setActiveDetail(sessionId, content);
        } catch (error) {
            await setActiveDetailError(sessionId, '<h3>Overview</h3><div class="form-hint" style="color:#ef4444">' + error.message + '</div>');
        }
    };

    window.viewResult = function (sessionId) {
        window.location.href = './teacher-session.html?sessionId=' + sessionId;
    };

    window.openSessionMonitor = function (sessionId) {
        window.location.href = './teacher-session.html?sessionId=' + sessionId;
    };

    window.addEventListener('beforeunload', function () {
        clearActiveDetail();
        clearSessionCountdownTimers();
    });
});
