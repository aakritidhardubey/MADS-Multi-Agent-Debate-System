// ─── Auth Guard ──────────────────────────────────────────────────────────────
(function () {
    const token = localStorage.getItem('mads_token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    // Set username in header
    const username = localStorage.getItem('mads_username') || 'User';
    const displayEl = document.getElementById('usernameDisplay');
    const avatarEl = document.getElementById('avatarIcon');
    if (displayEl) displayEl.textContent = username;
    if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();
})();

// ─── Attach token to all API calls ───────────────────────────────────────────
const _originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
    if (typeof url === 'string' && url.startsWith('/api/')) {
        const token = localStorage.getItem('mads_token');
        if (token) {
            options.headers = options.headers || {};
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return _originalFetch(url, options);
};

// ─── Logout ───────────────────────────────────────────────────────────────────
function logout() {
    localStorage.removeItem('mads_token');
    localStorage.removeItem('mads_username');
    window.location.href = '/';
}

// ─── History Panel ────────────────────────────────────────────────────────────
function openHistory() {
    document.getElementById('historySidebar').style.display = 'block';
    document.getElementById('historyOverlay').style.display = 'block';
    loadHistory();
}

function closeHistory() {
    document.getElementById('historySidebar').style.display = 'none';
    document.getElementById('historyOverlay').style.display = 'none';
}

// ─── History Cache ────────────────────────────────────────────────────────────
// Keyed by debate _id. Rebuilt fresh on every loadHistory() call.
const _historyCache = {};

async function loadHistory() {
    const listEl = document.getElementById('historyList');
    listEl.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4); padding:40px 0;"><i class="fas fa-spinner fa-spin" style="font-size:24px;"></i><p style="margin-top:12px;">Loading...</p></div>';

    try {
        const res = await fetch('/api/history');
        if (res.status === 401) { logout(); return; }
        const data = await res.json();

        if (!data.debates || data.debates.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4); padding:40px 0;"><i class="fas fa-comments" style="font-size:36px; margin-bottom:12px; display:block;"></i><p>No debates yet. Start your first one!</p></div>';
            return;
        }

        // Clear stale cache before repopulating
        Object.keys(_historyCache).forEach(k => delete _historyCache[k]);

        listEl.innerHTML = data.debates.map(debate => {
            const debateId = debate._id;
            // Store a deep copy so external globals can never corrupt cached data
            _historyCache[debateId] = JSON.parse(JSON.stringify(debate));

            const date = new Date(debate.created_at);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            let winnerBadge = '';
            const summary = debate.results?.summary || '';
            // Match the VERDICT line (case-insensitive label, but check winner word as whole word)
            const verdictLineMatch = summary.match(/verdict\s*:\s*([^\n]+)/i);
            if (verdictLineMatch) {
                const verdictLine = verdictLineMatch[1];
                // Use word boundaries so "for" doesn't match "therefore", "before", etc.
                if (/\bAGAINST\b/i.test(verdictLine)) {
                    winnerBadge = '<span style="background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); border-radius:6px; padding:2px 8px; font-size:11px; color:#fca5a5;">&#127942; AGAINST wins</span>';
                } else if (/\bFOR\b/i.test(verdictLine)) {
                    winnerBadge = '<span style="background:rgba(34,197,94,0.2); border:1px solid rgba(34,197,94,0.4); border-radius:6px; padding:2px 8px; font-size:11px; color:#86efac;">&#127942; FOR wins</span>';
                }
            }

            // Use data-debate-id attribute — no inline onclick strings with IDs
            return `
            <div class="history-item" id="hist-${debateId}" data-debate-id="${debateId}"
                style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:12px; transition:all 0.2s; cursor:pointer;">
                <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:8px;">
                    <p style="color:white; font-size:14px; font-weight:600; line-height:1.4; flex:1; margin:0;">
                        ${escapeHtml(debate.topic)}
                    </p>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        ${winnerBadge}
                        <button class="delete-btn" data-delete-id="${debateId}"
                            title="Delete this debate"
                            style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:7px;color:#fca5a5;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;transition:all 0.15s;flex-shrink:0;"
                            onmouseover="this.style.background='rgba(239,68,68,0.25)'"
                            onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <span style="color:rgba(255,255,255,0.4); font-size:11px;"><i class="fas fa-robot" style="margin-right:4px;"></i>${escapeHtml(debate.model)}</span>
                    <span style="color:rgba(255,255,255,0.3); font-size:11px;">•</span>
                    <span style="color:rgba(255,255,255,0.4); font-size:11px;"><i class="fas fa-calendar" style="margin-right:4px;"></i>${dateStr} at ${timeStr}</span>
                </div>
            </div>`;
        }).join('');

        // Event delegation — one listener handles all items safely
        listEl.removeEventListener('click', _historyListClickHandler);
        listEl.addEventListener('click', _historyListClickHandler);

    } catch (e) {
        console.error('loadHistory error:', e);
        listEl.innerHTML = '<div style="text-align:center; color:#fca5a5; padding:40px 0;"><i class="fas fa-exclamation-triangle" style="font-size:24px; margin-bottom:12px; display:block;"></i><p>Failed to load history</p></div>';
    }
}

// ─── Event delegation handler for history list ────────────────────────────────
function _historyListClickHandler(e) {
    // Delete button takes priority
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.getAttribute('data-delete-id');
        deleteDebate(id, e);
        return;
    }
    // Load debate on clicking any part of the card
    const item = e.target.closest('.history-item');
    if (item) {
        const id = item.getAttribute('data-debate-id');
        const debate = _historyCache[id];
        if (debate) {
            loadDebateFromHistory(debate);
        } else {
            console.error('No cached debate for id:', id);
        }
    }
}

// ─── Delete a debate ──────────────────────────────────────────────────────────
async function deleteDebate(debateId, event) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this debate? This cannot be undone.')) return;

    try {
        const res = await fetch(`/api/history/${debateId}`, { method: 'DELETE' });
        if (res.ok) {
            delete _historyCache[debateId];
            const el = document.getElementById('hist-' + debateId);
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateX(20px)';
                el.style.transition = 'all 0.25s';
                setTimeout(() => {
                    el.remove();
                    const listEl = document.getElementById('historyList');
                    if (listEl && listEl.querySelectorAll('.history-item').length === 0) {
                        listEl.innerHTML = '<div style="text-align:center; color:rgba(255,255,255,0.4); padding:40px 0;"><i class="fas fa-comments" style="font-size:36px; margin-bottom:12px; display:block;"></i><p>No debates yet. Start your first one!</p></div>';
                    }
                }, 260);
            }
        } else {
            alert('Failed to delete debate. Please try again.');
        }
    } catch (e) {
        alert('Error deleting debate: ' + e.message);
    }
}

// ─── Render a history debate into the results panel ───────────────────────────
function loadDebateFromHistory(debate) {
    if (!debate || !debate.results) {
        console.error('loadDebateFromHistory: bad debate object', debate);
        return;
    }

    closeHistory();

    // 1. Show results section, hide others
    ['welcomeSection', 'inputSection'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) resultsSection.style.display = 'block';

    // 2. Topic + model
    const currentTopicEl = document.getElementById('currentTopic');
    if (currentTopicEl) currentTopicEl.textContent = debate.topic || '';

    const selectedModelEl = document.getElementById('selectedModel');
    if (selectedModelEl) selectedModelEl.textContent = debate.model || '';

    // 3. Status badge
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        statusBadge.textContent = 'From History';
        statusBadge.style.background = 'rgba(108,99,255,0.3)';
        statusBadge.classList.remove('completed');
    }

    // 4. Hide spinner + progress bar
    const statusDisplay = document.getElementById('statusDisplay');
    if (statusDisplay) statusDisplay.style.display = 'none';

    const progBar = document.querySelector('#resultsSection .prog');
    if (progBar) progBar.style.display = 'none';

    // 5. Render debate content — prefer script.js helper, else self-contained
    const debateResultsEl = document.getElementById('debateResults');
    if (debateResultsEl) {
        debateResultsEl.style.display = 'block';
        if (typeof formatSideBySideResults === 'function') {
            debateResultsEl.innerHTML = formatSideBySideResults(debate.results);
        } else {
            debateResultsEl.innerHTML = _renderDebateHTML(debate.results);
        }
    }

    // 6. Show export section
    const exportSection = document.getElementById('exportSection');
    if (exportSection) exportSection.style.display = 'block';

    // 7. Hide follow-up (belongs to live sessions)
    const followupSection = document.getElementById('followupSection');
    if (followupSection) followupSection.style.display = 'none';

    // 8. Sync currentDebateData so export works for this history debate
    const snapshot = {
        topic:   debate.topic,
        model:   debate.model,
        results: debate.results
    };
    window.currentDebateData = snapshot;
    // Also patch the local variable inside script.js scope if accessible
    try { currentDebateData = snapshot; } catch (_) {}
}

// ─── Restore progress bar when a new debate starts ───────────────────────────
// Hooks into startNewDebate (called by the "+ New Debate" button) so the
// progress bar we hid for history views comes back for real debates.
(function _patchStartNewDebate() {
    document.addEventListener('DOMContentLoaded', function () {
        const newDebateBtn = document.getElementById('startDebateBtn');
        // We don't override startNewDebate — instead listen for the New Debate
        // button click and restore the progress bar before the existing handler runs.
        document.addEventListener('click', function (e) {
            if (e.target.closest('.new-btn')) {
                const progBar = document.querySelector('#resultsSection .prog');
                if (progBar) progBar.style.display = '';
            }
        }, true); // capture phase so it runs before other handlers
    });
})();

// ─── Self-contained debate HTML renderer ─────────────────────────────────────
// Mirrors script.js formatSideBySideResults + formatText exactly.
function _fmtText(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function _renderDebateHTML(results) {
    const forArgs     = results.for_arguments     || '';
    const againstArgs = results.against_arguments || '';
    const summary     = results.summary           || '';
    return `
        <div class="debate-layout">
            <div class="arguments-container">
                <div class="argument-column for-column">
                    <div class="argument-header for-header">
                        <div class="argument-icon"><i class="fas fa-thumbs-up"></i></div>
                        <h3>Arguments For</h3>
                    </div>
                    <div class="argument-content">${_fmtText(forArgs)}</div>
                </div>
                <div class="argument-column against-column">
                    <div class="argument-header against-header">
                        <div class="argument-icon"><i class="fas fa-thumbs-down"></i></div>
                        <h3>Arguments Against</h3>
                    </div>
                    <div class="argument-content">${_fmtText(againstArgs)}</div>
                </div>
            </div>
            <div class="summary-section">
                <div class="summary-header">
                    <div class="summary-icon"><i class="fas fa-balance-scale"></i></div>
                    <h3>Conclusion &amp; Analysis</h3>
                </div>
                <div class="summary-content">${_fmtText(summary)}</div>
            </div>
        </div>`;
}

// ─── HTML escape ──────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
