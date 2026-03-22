const LEVEL_COLORS = {
  Bronze:   { bg: '#cd7f3222', border: '#cd7f32', text: '#92400e' },
  Silver:   { bg: '#a8a9ad22', border: '#a8a9ad', text: '#374151' },
  Gold:     { bg: '#ffd70022', border: '#ffd700', text: '#92400e' },
  Platinum: { bg: '#e5e4e222', border: '#9ca3af', text: '#374151' },
  Diamond:  { bg: '#b9f2ff22', border: '#06b6d4', text: '#0e7490' }
};

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('pds_token');
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  try {
    const res = await fetch('/api/leaderboard', { headers });
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    renderTable(data);
  } catch (e) {
    document.getElementById('lb-body').innerHTML =
      '<tr><td colspan="6" class="lb-empty">Could not load leaderboard. Please try again.</td></tr>';
  }
});

function renderTable(rows) {
  const tbody = document.getElementById('lb-body');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="lb-empty">No data yet.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((u, i) => {
    const rank = i + 1;
    const rankDisplay = RANK_ICONS[rank] || rank;
    const rankClass = rank <= 3 ? `rank-${rank}` : '';
    const initial = u.username ? u.username[0].toUpperCase() : '?';
    const level = u.level || 'Bronze';
    const lc = LEVEL_COLORS[level] || LEVEL_COLORS.Bronze;

    return `
      <tr>
        <td class="rank-cell ${rankClass}">${rankDisplay}</td>
        <td>
          <div class="user-cell">
            <div class="lb-avatar">${initial}</div>
            <span class="lb-username">@${escHtml(u.username)}</span>
          </div>
        </td>
        <td>${u.doubts_asked}</td>
        <td>${u.doubts_solved}</td>
        <td class="lb-stars">⭐ ${u.stars}</td>
        <td>
          <span class="lb-badge" style="background:${lc.bg};border:1px solid ${lc.border};color:${lc.text};">
            ${level}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
