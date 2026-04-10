document.addEventListener('DOMContentLoaded', async function () {
    const user = requireCurrentUser();
    if (!user) {
        return;
    }
    let realtimeConnected = false;
    var cachedSessions = [];
    qs('#userName').textContent = user.name;
    var openSessionIds = await loadOpenSessions();
    var rememberedSessionId = storage.get('joinedSessionId');
    if (rememberedSessionId && openSessionIds.indexOf(rememberedSessionId) === -1) {
        storage.remove('joinedSessionId');
        rememberedSessionId = null;
    }
    if (rememberedSessionId) {
        qs('#sessionSelect').value = String(rememberedSessionId);
        refreshParticipantCount(rememberedSessionId);
    }
    updateButtonState();

    qs('#sessionSelect').addEventListener('change', function () {
        updateButtonState();
        showSessionInfo();
        renderSessionPreview();
    });
    showSessionInfo();
    renderSessionPreview();

    connectRealtime(rememberedSessionId);

    qs('#openHistoryBtn').addEventListener('click', function () {
        qs('#historyOverlay').style.display = 'flex';
        loadMyHistory();
    });
    qs('#closeHistoryBtn').addEventListener('click', function () {
        qs('#historyOverlay').style.display = 'none';
    });
    qs('#historyOverlay').addEventListener('click', function (e) {
        if (e.target === qs('#historyOverlay')) {
            qs('#historyOverlay').style.display = 'none';
        }
    });

    qs('#joinSessionButton').addEventListener('click', async function () {
        try {
            const sessionId = Number(qs('#sessionSelect').value);
            if (!sessionId) {
                throw new Error('Please select a session');
            }
            await apiRequest('/students/join-session', {
                method: 'POST',
                body: JSON.stringify({
                    sessionId: sessionId
                })
            });
            storage.set('joinedSessionId', sessionId);
            disconnectDiscussionSocket();
            connectRealtime(sessionId);
            refreshParticipantCount(sessionId);
            renderWaitingStats(sessionId);
            showMessage(qs('#message'), 'Joined the waiting room');
        } catch (error) {
            showMessage(qs('#message'), error.message, true);
        }
    });

    const pollTimer = setInterval(async function () {
        const joined = await checkGroup(true);
        if (joined) {
            clearInterval(pollTimer);
        }
    }, 5000);

    const countTimer = setInterval(async function () {
        const joinedSessionId = storage.get('joinedSessionId');
        if (joinedSessionId) {
            await refreshParticipantCount(joinedSessionId);
            renderWaitingStats(joinedSessionId);
        }
    }, 5000);

    window.addEventListener('beforeunload', function () {
        clearInterval(pollTimer);
        clearInterval(countTimer);
        disconnectDiscussionSocket();
    });

    async function checkGroup(silent) {
        try {
            const sessionId = storage.get('joinedSessionId');
            if (!sessionId) {
                if (!silent) {
                    showMessage(qs('#message'), 'Join a session first', true);
                }
                return false;
            }
            const group = await apiRequest('/students/group?sessionId=' + sessionId);
            storage.set('currentGroup', group);
            await acknowledgeGroupReady(sessionId);
            if (!silent) {
                showMessage(qs('#message'), realtimeConnected ? 'Group ready notification received' : 'Group result loaded via polling');
            }
            window.location.href = './discussion-room.html';
            return true;
        } catch (error) {
            const waitingMessage = 'User has not been assigned to a group in this session';
            if (error.message === waitingMessage) {
                if (!silent) {
                    showMessage(qs('#message'), 'Grouping is not ready yet. Please wait for the teacher.', true);
                }
                return false;
            }
            if (!silent) {
                showMessage(qs('#message'), error.message, true);
            } else {
                console.error(error);
            }
            return false;
        }
    }

    function updateButtonState() {
        var hasSelection = !!qs('#sessionSelect').value;
        qs('#joinSessionButton').disabled = !hasSelection;
    }

    async function loadOpenSessions() {
        cachedSessions = await apiRequest('/sessions/open');
        qs('#sessionSelect').innerHTML = '<option value="">Select a session</option>' + cachedSessions.map(function (session) {
            var teacher = session.teacherName ? ' - ' + session.teacherName : '';
            return '<option value="' + session.id + '">' + session.topic + ' - ' + session.status + teacher + '</option>';
        }).join('');
        renderSessionPreview();
        renderWaitingStats(storage.get('joinedSessionId'));
        if (!cachedSessions.length) {
            showMessage(qs('#message'), 'No sessions available. Please wait for a teacher to create one.', true, true);
        }
        return cachedSessions.map(function (s) { return s.id; });
    }

    function showSessionInfo() {
        var selectedId = Number(qs('#sessionSelect').value);
        var infoEl = qs('#sessionInfo');
        if (!selectedId) {
            infoEl.style.display = 'none';
            return;
        }
        var session = cachedSessions.find(function (s) { return s.id === selectedId; });
        if (session) {
            infoEl.innerHTML =
                '<div class="detail-metric-grid">' +
                '<div class="detail-metric"><div class="detail-metric-label">Teacher</div><div class="detail-metric-value">' + escapeHtml(session.teacherName || '-') + '</div></div>' +
                '<div class="detail-metric"><div class="detail-metric-label">Duration</div><div class="detail-metric-value">' + (session.durationMinutes || '-') + ' min</div></div>' +
                '<div class="detail-metric"><div class="detail-metric-label">Group Size</div><div class="detail-metric-value">' + (session.groupSize || '-') + '</div></div>' +
                '<div class="detail-metric"><div class="detail-metric-label">Status</div><div class="detail-metric-value">' + escapeHtml(session.status || '-') + '</div></div>' +
                '</div>';
            infoEl.style.display = 'block';
        } else {
            infoEl.style.display = 'none';
        }
    }

    function renderSessionPreview() {
        var selectedId = Number(qs('#sessionSelect').value);
        var list = qs('#sessionPreviewList');
        if (!cachedSessions.length) {
            list.innerHTML = '<div class="panel-empty">No open sessions right now.</div>';
            return;
        }
        list.innerHTML = cachedSessions.map(function (session) {
            var activeClass = session.id === selectedId ? ' active' : '';
            return '<div class="session-card waiting-session-card' + activeClass + '">' +
                '<div class="session-card-head">' +
                '<div>' +
                '<div class="session-card-title">' + escapeHtml(session.topic || '') + '</div>' +
                '<div class="session-card-meta">' +
                '<span class="meta-chip"><strong>' + (session.durationMinutes || '-') + '</strong> min</span>' +
                '<span class="meta-chip"><strong>' + (session.groupSize || '-') + '</strong> per group</span>' +
                '</div>' +
                '</div>' +
                '<span class="status-chip status-active">' + escapeHtml(session.status || '') + '</span>' +
                '</div>' +
                '<div class="member-inline-meta">Teacher: ' + escapeHtml(session.teacherName || '-') + '</div>' +
                '</div>';
        }).join('');
    }

    function renderWaitingStats(joinedSessionId) {
        var selectedId = Number(qs('#sessionSelect').value) || Number(joinedSessionId);
        var selectedSession = cachedSessions.find(function (s) { return s.id === selectedId; });
        var stats = qs('#waitingStats');
        stats.innerHTML =
            '<div class="detail-metric"><div class="detail-metric-label">Open Sessions</div><div class="detail-metric-value">' + cachedSessions.length + '</div></div>' +
            '<div class="detail-metric"><div class="detail-metric-label">Joined Session</div><div class="detail-metric-value">' + (joinedSessionId ? 'Yes' : 'No') + '</div></div>' +
            '<div class="detail-metric"><div class="detail-metric-label">Selected Topic</div><div class="detail-metric-value">' + escapeHtml(selectedSession ? selectedSession.topic : '-') + '</div></div>' +
            '<div class="detail-metric"><div class="detail-metric-label">Realtime</div><div class="detail-metric-value">' + (realtimeConnected ? 'Live' : 'Polling') + '</div></div>';
    }

    async function refreshParticipantCount(sessionId) {
        try {
            const result = await apiRequest('/students/waiting-room/count?sessionId=' + sessionId);
            qs('#participantCount').textContent = result.count;
        } catch (error) {
            qs('#participantCount').textContent = '-';
        }
    }

    async function acknowledgeGroupReady(sessionId) {
        try {
            await apiRequest('/students/group-ready/ack?sessionId=' + sessionId, {
                method: 'POST'
            });
        } catch (error) {
        }
    }

    var cachedHistory = [];

    async function loadMyHistory() {
        var container = qs('#historyContent');
        qs('#historyTitle').textContent = 'My History';
        container.innerHTML = 'Loading...';
        try {
            cachedHistory = await apiRequest('/students/my-sessions');
            renderHistoryList();
        } catch (error) {
            container.innerHTML = '<div class="detail-error">Failed to load history.</div>';
            console.error(error);
        }
    }

    function renderHistoryList() {
        var container = qs('#historyContent');
        qs('#historyTitle').textContent = 'My History';
        if (!cachedHistory || cachedHistory.length === 0) {
            container.innerHTML = '<div class="panel-empty">No participation history yet.</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < cachedHistory.length; i++) {
            var s = cachedHistory[i];
            var statusClass = s.status === 'ENDED' ? 'status-ended' : s.status === 'RUNNING' ? 'status-active' : 'status-warning';
            var speakingInfo = '';
            if (s.speakingCount > 0) {
                var mins = Math.floor(s.totalSpeakingSeconds / 60);
                var secs = s.totalSpeakingSeconds % 60;
                var dur = mins > 0 ? mins + 'm ' + secs + 's' : secs + 's';
                speakingInfo = s.speakingCount + ' turns - ' + dur;
            } else {
                speakingInfo = 'No speaking record';
            }
            var dateStr = s.startedAt ? new Date(s.startedAt).toLocaleString() : (s.createdAt ? new Date(s.createdAt).toLocaleString() : '-');
            html += '<div class="detail-panel waiting-history-item" data-index="' + i + '">';
            html += '<div class="detail-item-row">';
            html += '<strong>' + escapeHtml(s.topic) + '</strong>';
            html += '<span class="status-chip ' + statusClass + '">' + s.status + '</span>';
            html += '</div>';
            html += '<div class="member-inline-meta">' + escapeHtml(s.teacherName) + ' - ' + dateStr + '</div>';
            html += '<div class="member-inline-meta">' + speakingInfo + '</div>';
            html += '</div>';
        }
        container.innerHTML = html;
        var items = container.querySelectorAll('.waiting-history-item');
        for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('click', function () {
                var idx = Number(this.getAttribute('data-index'));
                renderHistoryDetail(cachedHistory[idx]);
            });
        }
    }

    function renderHistoryDetail(s) {
        var statusClass = s.status === 'ENDED' ? 'status-ended' : s.status === 'RUNNING' ? 'status-active' : 'status-warning';
        var html = '';
        html += '<div class="detail-stack">';
        html += '<div class="detail-panel"><div class="detail-item-row"><strong>Status</strong><span class="status-chip ' + statusClass + '">' + s.status + '</span></div></div>';
        html += '<div class="detail-metric-grid">';
        html += '<div class="detail-metric"><div class="detail-metric-label">Teacher</div><div class="detail-metric-value">' + escapeHtml(s.teacherName) + '</div></div>';
        html += '<div class="detail-metric"><div class="detail-metric-label">Duration</div><div class="detail-metric-value">' + (s.durationMinutes || '-') + ' min</div></div>';
        if (s.startedAt) {
            html += '<div class="detail-metric"><div class="detail-metric-label">Started</div><div class="detail-metric-value waiting-detail-time">' + new Date(s.startedAt).toLocaleString() + '</div></div>';
        }
        if (s.endedAt) {
            html += '<div class="detail-metric"><div class="detail-metric-label">Ended</div><div class="detail-metric-value waiting-detail-time">' + new Date(s.endedAt).toLocaleString() + '</div></div>';
        }
        html += '<div class="detail-metric"><div class="detail-metric-label">Joined</div><div class="detail-metric-value waiting-detail-time">' + new Date(s.joinedAt).toLocaleString() + '</div></div>';
        html += '<div class="detail-metric"><div class="detail-metric-label">Turns</div><div class="detail-metric-value">' + (s.speakingCount || 0) + '</div></div>';
        html += '</div>';
        html += '<div class="detail-panel"><strong>Speaking Stats</strong><div class="member-inline-meta" style="margin-top:8px;">' + ((s.speakingCount > 0) ? (Math.floor(s.totalSpeakingSeconds / 60) > 0 ? Math.floor(s.totalSpeakingSeconds / 60) + 'm ' + (s.totalSpeakingSeconds % 60) + 's' : (s.totalSpeakingSeconds % 60) + 's') : 'No speaking record') + '</div></div>';
        if (s.status === 'ENDED') {
            html += '<button class="btn" style="width:100%;" onclick="window.location.href=\'./session-result.html?sessionId=' + s.sessionId + '&from=history\'">View Session Result</button>';
        }
        html += '</div>';
        qs('#historyContent').innerHTML = html;
        qs('#historyTitle').style.cursor = 'pointer';
        qs('#historyTitle').textContent = '< Back to History';
        qs('#historyTitle').onclick = function () {
            qs('#historyTitle').style.cursor = '';
            qs('#historyTitle').onclick = null;
            renderHistoryList();
        };
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function connectRealtime(sessionId) {
        if (!sessionId) {
            realtimeConnected = false;
            renderWaitingStats(storage.get('joinedSessionId'));
            return;
        }
        connectDiscussionSocket(sessionId, async function (message) {
            const joinedSessionId = storage.get('joinedSessionId');
            if (!joinedSessionId || message.type !== 'GROUP_READY' || Number(message.sessionId) !== Number(joinedSessionId)) {
                return;
            }
            await checkGroup(true);
        }, {
            onOpen: function () {
                realtimeConnected = true;
                renderWaitingStats(storage.get('joinedSessionId'));
            },
            onError: function () {
                realtimeConnected = false;
                renderWaitingStats(storage.get('joinedSessionId'));
            },
            onClose: function () {
                realtimeConnected = false;
                renderWaitingStats(storage.get('joinedSessionId'));
            }
        });
    }
});
