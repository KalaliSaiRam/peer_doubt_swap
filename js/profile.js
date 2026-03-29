// Level thresholds
const LEVELS = [
    { name: 'Bronze', min: 0, max: 99 },
    { name: 'Silver', min: 100, max: 299 },
    { name: 'Gold', min: 300, max: 599 },
    { name: 'Platinum', min: 600, max: 999 },
    { name: 'Diamond', min: 1000, max: 9999 }
];

// ── AVATAR SPRITE CONFIG ────────────────────────────────────
// The sprite sheet is a 5-column × 6-row grid = 30 avatars
const AVATAR_COLS = 5;
const AVATAR_ROWS = 6;
const AVATAR_TOTAL = AVATAR_COLS * AVATAR_ROWS; // 30

// Returns background-size and background-position for a given index (0-based)
function avatarSpriteStyle(index, displaySize) {
    const col = index % AVATAR_COLS;
    const row = Math.floor(index / AVATAR_COLS);
    // background-size: make the full sheet fit such that each cell = displaySize
    const bsW = AVATAR_COLS * displaySize;
    const bsH = AVATAR_ROWS * displaySize;
    const bpX = -(col * displaySize);
    const bpY = -(row * displaySize);
    return {
        backgroundSize: `${bsW}px ${bsH}px`,
        backgroundPosition: `${bpX}px ${bpY}px`
    };
}

const LEVEL_COLORS = {
    Bronze: '#cd7f32',
    Silver: '#a8a9ad',
    Gold: '#ffd700',
    Platinum: '#e5e4e2',
    Diamond: '#b9f2ff'
};

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('pds_token');
    if (!token) { window.location.href = 'index.html'; return; }

    try {
        const [profRes, askedRes, solvedRes] = await Promise.all([
            fetch('/api/profile', { headers: { 'Authorization': 'Bearer ' + token } }),
            fetch('/api/profile/doubts-asked', { headers: { 'Authorization': 'Bearer ' + token } }),
            fetch('/api/profile/doubts-solved', { headers: { 'Authorization': 'Bearer ' + token } })
        ]);

        if (profRes.ok) {
            const user = await profRes.json();
            populateHero(user);
            populateDetails(user);
        }

        if (askedRes.ok) allAsked = await askedRes.json();
        if (solvedRes.ok) allSolved = await solvedRes.json();

        renderLists();
    } catch (e) {
        console.error('Error fetching profile data', e);
    }

    // Filter button listeners
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const col = this.dataset.col;
            const diff = this.dataset.diff;
            document.querySelectorAll(`.diff-btn[data-col="${col}"]`).forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            activeFilter[col] = diff;
            renderLists();
        });
    });

    // ── Avatar modal setup ──────────────────────────────────
    buildAvatarGrid();
    const avatarWrapper = document.getElementById('avatar-wrapper');
    const avatarModal   = document.getElementById('avatar-modal');
    const closeBtn      = document.getElementById('avatar-modal-close');

    if (avatarWrapper && avatarModal) {
        avatarWrapper.addEventListener('click', () => {
            avatarModal.style.display = 'flex';
            highlightSelected();
        });
        closeBtn.addEventListener('click', () => {
            avatarModal.style.display = 'none';
        });
        avatarModal.addEventListener('click', (e) => {
            if (e.target === avatarModal) avatarModal.style.display = 'none';
        });
    }
});

// ── Data ─────────────────────────────────────────────────
let allAsked = [];
let allSolved = [];
let activeFilter = { asked: 'all', solved: 'all' };

// ── Hero section ─────────────────────────────────────────
function populateHero(user) {
    const initials = user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase();
    const avatarEl = document.getElementById('profile-avatar');

    // Determine saved avatar: prefer DB value, fallback to sessionStorage
    const savedPic = user.profile_pic !== undefined && user.profile_pic !== null
        ? String(user.profile_pic)
        : sessionStorage.getItem('pds_profile_pic');

    if (savedPic !== null && savedPic !== '' && !isNaN(Number(savedPic))) {
        applyAvatarToEl(avatarEl, Number(savedPic), 90);
        // Sync sessionStorage with DB value
        sessionStorage.setItem('pds_profile_pic', savedPic);
    } else {
        avatarEl.textContent = initials;
    }

    document.getElementById('profile-fullname').textContent = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    document.getElementById('profile-username').textContent = `@${user.username}`;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('hero-stars').textContent = `⭐ ${user.stars} Stars`;

    const lvl = LEVELS.find(l => user.stars >= l.min && user.stars <= l.max) || LEVELS[0];
    const color = LEVEL_COLORS[lvl.name] || '#cd7f32';
    const badge = document.getElementById('hero-level');
    badge.textContent = `🏆 ${user.level || lvl.name}`;
    badge.style.background = color + '22';
    badge.style.borderColor = color;
    badge.style.color = color;

    // Progress bar
    const progress = Math.min(((user.stars - lvl.min) / (lvl.max - lvl.min)) * 100, 100);
    const nextLevel = LEVELS[LEVELS.indexOf(lvl) + 1];
    document.getElementById('level-fill').style.width = progress + '%';
    document.getElementById('level-current-label').textContent = lvl.name + ' (' + user.stars + ' ⭐)';
    document.getElementById('level-next-label').textContent = nextLevel ? nextLevel.name + ' at ' + nextLevel.min + ' ⭐' : 'MAX LEVEL 💎';
}

// ── Details grid ─────────────────────────────────────────
function populateDetails(user) {
    const fmt = v => v || '—';
    document.getElementById('d-dob').textContent = fmt(user.dob ? user.dob.split('T')[0] : null);
    document.getElementById('d-gender').textContent = fmt(user.gender);
    document.getElementById('d-student').textContent = user.is_student ? 'Yes' : 'No';
    document.getElementById('d-college').textContent = fmt(user.college_name);
    document.getElementById('d-year').textContent = fmt(user.passout_year);
    document.getElementById('d-branch').textContent = fmt(user.branch);
    document.getElementById('d-joined').textContent = new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Render both columns ───────────────────────────────────
function renderLists() {
    renderAsked();
    renderSolved();
}

function diffBadge(diff) {
    const map = { easy: 'diff-easy 🟢 Easy', medium: 'diff-medium 🟡 Medium', hard: 'diff-hard 🔴 Hard' };
    const [cls, label] = (map[diff] || 'diff-easy ' + diff).split(' ').reduce((a, v, i) => i === 0 ? [[v], ''] : [a[0], a[1] + ' ' + v], [[], '']);
    return `<span class="diff-badge ${cls.join('')}">${label.trim()}</span>`;
}

function renderAsked() {
    const list = document.getElementById('asked-list');
    const filter = activeFilter.asked;
    const items = filter === 'all' ? allAsked : allAsked.filter(d => d.difficulty === filter);

    if (!items.length) {
        list.innerHTML = '<div class="empty-state">No doubts posted yet.</div>';
        return;
    }

    list.innerHTML = items.map(d => {
      const href = 'doubtSolver2.html?doubtId=' + encodeURIComponent(d.doubt_id);
      return `
    <a class="doubt-item clickable" href="${href}">
      <div class="doubt-item-question">${escHtml(d.question)}</div>
      <div class="doubt-item-meta">
        ${diffBadge(d.difficulty)}
        <span>📚 ${escHtml(d.subject_name)}</span>
        <span>💬 ${d.answer_count} answer(s)</span>
        <span style="color:#4ade80">→ Open solutions</span>
      </div>
    </a>
  `;
    }).join('');
}

function renderSolved() {
    const list = document.getElementById('solved-list');
    const filter = activeFilter.solved;
    const items = filter === 'all' ? allSolved : allSolved.filter(d => d.difficulty === filter);

    if (!items.length) {
        list.innerHTML = '<div class="empty-state">No solved doubts yet.</div>';
        return;
    }

    list.innerHTML = items.map(d => {
      let href = 'doubtSolver2.html?doubtId=' + encodeURIComponent(d.doubt_id);
      if (d.my_comment_id != null) {
        href += '&commentId=' + encodeURIComponent(d.my_comment_id);
      }
      return `
    <a class="doubt-item clickable" href="${href}">
      <div class="doubt-item-question">${escHtml(d.question)}</div>
      <div class="doubt-item-meta">
        ${diffBadge(d.difficulty)}
        <span>📚 ${escHtml(d.subject_name)}</span>
        <span style="color:#4ade80">→ View solution thread</span>
      </div>
    </a>
  `;
    }).join('');
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Avatar helpers ────────────────────────────────────────
function applyAvatarToEl(el, index, size) {
    const { backgroundSize, backgroundPosition } = avatarSpriteStyle(index, size);
    el.classList.add('is-sprite');
    el.style.backgroundSize = backgroundSize;
    el.style.backgroundPosition = backgroundPosition;
    el.textContent = '';
}

function buildAvatarGrid() {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < AVATAR_TOTAL; i++) {
        const cell = document.createElement('div');
        cell.className = 'avatar-cell';
        cell.dataset.index = i;
        const { backgroundSize, backgroundPosition } = avatarSpriteStyle(i, 72);
        cell.style.backgroundSize = backgroundSize;
        cell.style.backgroundPosition = backgroundPosition;
        cell.addEventListener('click', () => selectAvatar(i));
        grid.appendChild(cell);
    }
}

function highlightSelected() {
    const saved = sessionStorage.getItem('pds_profile_pic');
    document.querySelectorAll('.avatar-cell').forEach(c => c.classList.remove('selected'));
    if (saved !== null) {
        const cell = document.querySelector(`.avatar-cell[data-index="${saved}"]`);
        if (cell) cell.classList.add('selected');
    }
}

async function selectAvatar(index) {
    const token = sessionStorage.getItem('pds_token');
    // Optimistic UI update
    const avatarEl = document.getElementById('profile-avatar');
    applyAvatarToEl(avatarEl, index, 90);
    sessionStorage.setItem('pds_profile_pic', String(index));
    highlightSelected();
    // Close modal
    document.getElementById('avatar-modal').style.display = 'none';

    // Persist to DB
    try {
        await fetch('/api/profile/avatar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ profile_pic: String(index) })
        });
    } catch (e) {
        console.warn('Avatar save failed', e);
    }
}

// ── Logout ─────────────────────────────────────────
function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    [
        'pds_username', 'pds_stars', 'pds_level',
        'pds_subjectId', 'pds_subjectName', 'pds_activeDoubt', 'pds_activeDoubtId',
        'pds_currentQuestion', 'pds_currentDoubtId', 'pds_reset_email', 'pds_email',
        'pds_first_name', 'pds_last_name', 'pds_dob', 'pds_gender', 'pds_is_student',
        'pds_college_name', 'pds_passout_year', 'pds_branch', 'pds_token'
    ].forEach(k => sessionStorage.removeItem(k));
    window.location.href = 'index.html';
}
