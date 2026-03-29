/**
 * navbar.js — shared across all post-login pages
 * Injects notification bell + username chip + star/level badge.
 */
(function () {
  const username = sessionStorage.getItem('pds_username');
  if (!username) {
    window.location.href = '/html/index.html';
    return;
  }

  const POLL_MS = 25000;

  // ── Avatar sprite helper ──────────────────────────────────
  const AV_COLS = 5, AV_ROWS = 6;
  function buildNavAvatar(uname) {
    const pic = sessionStorage.getItem('pds_profile_pic');
    if (pic !== null && pic !== '' && !isNaN(Number(pic))) {
      const idx = Number(pic);
      const col = idx % AV_COLS;
      const row = Math.floor(idx / AV_COLS);
      const sz = 34; // nav avatar size
      const bsW = AV_COLS * sz, bsH = AV_ROWS * sz;
      const bpX = -(col * sz), bpY = -(row * sz);
      return `<span class="nav-avatar-sprite" style="background-image:url('../images/avatars.jpeg');background-size:${bsW}px ${bsH}px;background-position:${bpX}px ${bpY}px;"></span>`;
    }
    return `<span>${uname.charAt(0).toUpperCase()}</span>`;
  }

  function refreshNavAvatar() {
    const el = document.getElementById('pds-nav-avatar');
    if (el) el.innerHTML = buildNavAvatar(username);
  }

  function injectNav() {
    const slot = document.getElementById('user-nav');
    if (!slot) return;

    const stars = sessionStorage.getItem('pds_stars') || '0';
    const level = sessionStorage.getItem('pds_level') || 'Bronze';

    const levelColors = {
      Bronze: '#cd7f32',
      Silver: '#a8a9ad',
      Gold: '#ffd700',
      Platinum: '#e5e4e2',
      Diamond: '#b9f2ff'
    };
    const color = levelColors[level] || '#cd7f32';

    slot.innerHTML = `
      <div class="pds-nav-row">
        <div class="pds-notif-wrap" id="pds-notif-wrap">
          <button type="button" class="pds-notif-bell" id="pds-notif-bell" aria-label="Notifications" title="Notifications">
            <svg class="pds-notif-bell-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="pds-notif-badge" id="pds-notif-badge" style="display:none;">0</span>
          </button>
          <div class="pds-notif-dropdown" id="pds-notif-dropdown" role="menu">
            <div class="pds-notif-head">New activity on your doubts</div>
            <div class="pds-notif-list" id="pds-notif-list"></div>
            <div class="pds-notif-foot">
              <button type="button" class="pds-notif-mark" id="pds-notif-mark">Mark all as read</button>
            </div>
          </div>
        </div>

        <div class="nav-user-chip">
          <a href="../html/profile.html" class="nav-username-link" title="View Profile">
            <span class="nav-avatar" id="pds-nav-avatar">${buildNavAvatar(username)}</span>
            <span class="nav-username">${username}</span>
          </a>
          <span class="nav-stars">⭐ ${stars}</span>
          <span class="nav-level" style="background:${color};color:#111;">${level}</span>
        </div>
      </div>

      <style>
        .pds-nav-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .pds-notif-wrap {
          position: relative;
        }
        .pds-notif-bell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.92);
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .pds-notif-bell:hover {
          background: rgba(255,255,255,0.28);
          transform: scale(1.05);
        }
        .pds-notif-bell.pds-notif-bell--live {
          background: rgba(251, 191, 36, 0.35);
          color: #fff;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.55), 0 0 18px rgba(251, 146, 60, 0.85);
          animation: pds-bell-pulse 1.6s ease-in-out infinite;
        }
        @keyframes pds-bell-pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.45), 0 0 14px rgba(251, 146, 60, 0.6); }
          50% { box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.7), 0 0 22px rgba(251, 146, 60, 1); }
        }
        .pds-notif-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: #ef4444;
          color: #fff;
          font-size: 0.68rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .pds-notif-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: min(340px, 92vw);
          max-height: 380px;
          overflow: hidden;
          display: none;
          flex-direction: column;
          background: #fff;
          color: #111827;
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
          z-index: 200;
          border: 1px solid #e5e7eb;
        }
        .pds-notif-dropdown.pds-open {
          display: flex;
        }
        .pds-notif-head {
          padding: 12px 14px;
          font-weight: 700;
          font-size: 0.9rem;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(180deg, #f9fafb, #fff);
        }
        .pds-notif-list {
          overflow-y: auto;
          max-height: 260px;
        }
        .pds-notif-item {
          display: block;
          padding: 10px 14px;
          border-bottom: 1px solid #f3f4f6;
          text-decoration: none;
          color: inherit;
          font-size: 0.86rem;
          transition: background 0.15s;
        }
        .pds-notif-item:hover { background: #eff6ff; }
        .pds-notif-item strong { color: #1d4ed8; }
        .pds-notif-item small { display: block; color: #6b7280; margin-top: 4px; font-size: 0.75rem; }
        .pds-notif-empty {
          padding: 16px 14px;
          color: #6b7280;
          font-size: 0.86rem;
        }
        .pds-notif-foot {
          padding: 8px 10px;
          border-top: 1px solid #f3f4f6;
          text-align: center;
        }
        .pds-notif-mark {
          background: none;
          border: none;
          color: #2563eb;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          padding: 6px 8px;
        }
        .pds-notif-mark:hover { text-decoration: underline; }
        .nav-user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-username-link {
          display: flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          color: inherit;
        }
        .nav-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .nav-avatar-sprite {
          display: block;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background-repeat: no-repeat;
          flex-shrink: 0;
        }
        .nav-username-link:hover .nav-avatar { transform: scale(1.1); }
        .nav-username {
          font-weight: 600;
          font-size: 0.95rem;
          color: inherit;
          transition: color 0.2s;
        }
        .nav-username-link:hover .nav-username { color: #fbbf24; }
        .nav-stars {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .nav-level {
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
      </style>
    `;

    setupNotifications();

    // Refresh nav avatar whenever sessionStorage changes (e.g. after selecting on profile page)
    window.addEventListener('storage', function(e) {
      if (e.key === 'pds_profile_pic') refreshNavAvatar();
    });
  }

  function authHeaders() {
    const token = sessionStorage.getItem('pds_token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = 'Bearer ' + token;
    return h;
  }

  function updateBellUI(count) {
    const bell = document.getElementById('pds-notif-bell');
    const badge = document.getElementById('pds-notif-badge');
    if (!bell || !badge) return;
    const n = Math.min(99, parseInt(count, 10) || 0);
    if (n > 0) {
      bell.classList.add('pds-notif-bell--live');
      badge.style.display = 'flex';
      badge.textContent = n > 99 ? '99+' : String(n);
    } else {
      bell.classList.remove('pds-notif-bell--live');
      badge.style.display = 'none';
    }
  }

  function renderList(items) {
    const listEl = document.getElementById('pds-notif-list');
    if (!listEl) return;
    if (!items || items.length === 0) {
      listEl.innerHTML = '<div class="pds-notif-empty">No new replies right now.</div>';
      return;
    }
    listEl.innerHTML = items.map(function (it) {
      const q = (it.question_preview || '').replace(/</g, '&lt;');
      const who = (it.from_username || 'Someone').replace(/</g, '&lt;');
      const cid = it.comment_id != null ? encodeURIComponent(it.comment_id) : '';
      const href = 'doubtSolver2.html?doubtId=' + encodeURIComponent(it.doubt_id) +
        (cid ? '&commentId=' + cid : '');
      return (
        '<a class="pds-notif-item" href="' + href + '">' +
        '<strong>@' + who + '</strong> replied to your doubt' +
        '<small>' + q + (q.length >= 100 ? '…' : '') + '</small>' +
        '</a>'
      );
    }).join('');
  }

  async function fetchNotifications() {
    const token = sessionStorage.getItem('pds_token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', { headers: authHeaders() });
      const data = await res.json().catch(function () { return {}; });
      const count = typeof data.unreadCount === 'number' ? data.unreadCount : 0;
      updateBellUI(count);
      window.__pdsLastNotifItems = Array.isArray(data.items) ? data.items : [];
    } catch (e) {
      console.warn('Notifications poll failed', e);
    }
  }

  async function markAllRead() {
    const token = sessionStorage.getItem('pds_token');
    if (!token) return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: authHeaders(),
        body: '{}'
      });
      updateBellUI(0);
      renderList([]);
    } catch (e) {
      console.warn('Mark read failed', e);
    }
  }

  function setupNotifications() {
    const wrap = document.getElementById('pds-notif-wrap');
    const bell = document.getElementById('pds-notif-bell');
    const dropdown = document.getElementById('pds-notif-dropdown');
    const markBtn = document.getElementById('pds-notif-mark');
    if (!wrap || !bell || !dropdown) return;

    bell.addEventListener('click', async function (e) {
      e.stopPropagation();
      const open = dropdown.classList.contains('pds-open');
      if (open) {
        dropdown.classList.remove('pds-open');
        return;
      }
      dropdown.classList.add('pds-open');
      await fetchNotifications();
      renderList(window.__pdsLastNotifItems || []);
    });

    if (markBtn) {
      markBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        markAllRead();
        dropdown.classList.remove('pds-open');
      });
    }

    document.addEventListener('click', function () {
      dropdown.classList.remove('pds-open');
    });
    wrap.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    fetchNotifications();
    setInterval(fetchNotifications, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();
