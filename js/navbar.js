/**
 * navbar.js — shared across all post-login pages
 * Injects a username chip + star/level badge + theme toggle into the page header.
 * Also handles the global light/dark theme applied via data-theme on <html>.
 */
(function () {


  // ── 3. Redirect to login if not authenticated ─────────────────────────────────
  const username = sessionStorage.getItem('pds_username');
  if (!username) {
    window.location.href = '../html/index.html';
    return;
  }



  // ── 5. Build nav ──────────────────────────────────────────────────────────────
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
      <div class="nav-user-chip">



        <!-- User avatar + name -->
        <a href="../html/profile.html" class="nav-username-link" title="View Profile">
          <span class="nav-avatar">${username.charAt(0).toUpperCase()}</span>
          <span class="nav-username">${username}</span>
        </a>

        <span class="nav-stars">⭐ ${stars}</span>
        <span class="nav-level" style="background:${color};color:#111;">${level}</span>
      </div>

      <style>
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
          transition: transform 0.2s;
        }
        .nav-username-link:hover .nav-avatar { transform: scale(1.1); }
        .nav-username {
          font-weight: 600;
          font-size: 0.95rem;
          color: inherit;
          transition: color 0.2s;
        }
        .nav-username-link:hover .nav-username { color: #f97316; }
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();
