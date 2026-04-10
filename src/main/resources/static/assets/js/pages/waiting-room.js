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
    });
    showSessionInfo();

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
            var teacher = session.teacherName ? ' · ' + session.teacherName : '';
            return '<option value="' + session.id + '">' + session.topic + ' - ' + session.status + teacher + '</option>';
        }).join('');
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
            infoEl.textContent = 'By ' + (session.teacherName || '-') + ' · Duration: ' + (session.durationMinutes || '-') + ' min · Group size: ' + (session.groupSize || '-') + ' · Status: ' + session.status;
            infoEl.style.display = 'block';
        } else {
            infoEl.style.display = 'none';
        }
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
            container.innerHTML = '<div style="color:var(--danger);">Failed to load history.</div>';
            console.error(error);
        }
    }

    function renderHistoryList() {
        var container = qs('#historyContent');
        qs('#historyTitle').textContent = 'My History';
        if (!cachedHistory || cachedHistory.length === 0) {
            container.innerHTML = '<div style="color:var(--text-3);padding:8px 0;">No participation history yet.</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < cachedHistory.length; i++) {
            var s = cachedHistory[i];
            var statusColor = s.status === 'ENDED' ? 'var(--text-3)' : s.status === 'RUNNING' ? 'var(--accent)' : 'var(--text-2)';
            var speakingInfo = '';
            if (s.speakingCount > 0) {
                var mins = Math.floor(s.totalSpeakingSeconds / 60);
                var secs = s.totalSpeakingSeconds % 60;
                var dur = mins > 0 ? mins + 'm ' + secs + 's' : secs + 's';
                speakingInfo = s.speakingCount + ' turns · ' + dur;
            } else {
                speakingInfo = 'No speaking record';
            }
            var dateStr = s.startedAt ? new Date(s.startedAt).toLocaleString() : (s.createdAt ? new Date(s.createdAt).toLocaleString() : '-');
            html += '<div class="history-item" data-index="' + i + '" style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-top:10px;cursor:pointer;transition:background 150ms ease;">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
            html += '<div style="font-weight:600;font-size:15px;">' + escapeHtml(s.topic) + '</div>';
            html += '<span style="font-size:12px;color:' + statusColor + ';font-weight:500;">' + s.status + '</span>';
            html += '</div>';
            html += '<div style="font-size:13px;color:var(--text-3);margin-top:4px;">' + escapeHtml(s.teacherName) + ' · ' + dateStr + '</div>';
            html += '<div style="font-size:13px;margin-top:4px;color:var(--text-2);">' + speakingInfo + '</div>';
            html += '</div>';
        }
        container.innerHTML = html;
        var items = container.querySelectorAll('.history-item');
        for (var j = 0; j < items.length; j++) {
            items[j].addEventListener('click', function () {
                var idx = Number(this.getAttribute('data-index'));
                renderHistoryDetail(cachedHistory[idx]);
            });
        }
    }

    function renderHistoryDetail(s) {
        var statusColor = s.status === 'ENDED' ? 'var(--text-3)' : s.status === 'RUNNING' ? 'var(--accent)' : 'var(--text-2)';
        var html = '';
        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Status</span><span style="font-weight:600;color:' + statusColor + ';">' + s.status + '</span></div>';
        html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Teacher</span><span style="font-weight:500;">' + escapeHtml(s.teacherName) + '</span></div>';
        html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Duration</span><span style="font-weight:500;">' + (s.durationMinutes || '-') + ' min</span></div>';
        if (s.startedAt) {
            html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Started</span><span style="font-weight:500;">' + new Date(s.startedAt).toLocaleString() + '</span></div>';
        }
        if (s.endedAt) {
            html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Ended</span><span style="font-weight:500;">' + new Date(s.endedAt).toLocaleString() + '</span></div>';
        }
        html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Joined</span><span style="font-weight:500;">' + new Date(s.joinedAt).toLocaleString() + '</span></div>';
        html += '<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:4px;">';
        html += '<div style="font-weight:600;margin-bottom:6px;">Speaking Stats</div>';
        if (s.speakingCount > 0) {
            var mins = Math.floor(s.totalSpeakingSeconds / 60);
            var secs = s.totalSpeakingSeconds % 60;
            var dur = mins > 0 ? mins + 'm ' + secs + 's' : secs + 's';
            html += '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-3);">Turns</span><span style="font-weight:500;">' + s.speakingCount + '</span></div>';
            html += '<div style="display:flex;justify-content:space-between;margin-top:4px;"><span style="color:var(--text-3);">Total Duration</span><span style="font-weight:500;">' + dur + '</span></div>';
        } else {
            html += '<div style="color:var(--text-3);">No speaking record</div>';
        }
        html += '</div>';
        if (s.status === 'ENDED') {
            html += '<button class="btn" style="margin-top:8px;width:100%;" onclick="window.location.href=\'./session-result.html?sessionId=' + s.sessionId + '&from=history\'">View Session Result</button>';
        }
        html += '</div>';
        qs('#historyContent').innerHTML = html;
        qs('#historyTitle').style.cursor = 'pointer';
        qs('#historyTitle').textContent = '← ' + (s.topic || '');
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
            },
            onError: function () {
                realtimeConnected = false;
            },
            onClose: function () {
                realtimeConnected = false;
            }
        });
    }
});
