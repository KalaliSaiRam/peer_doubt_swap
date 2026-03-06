// Level thresholds
const LEVELS = [
    { name: 'Bronze', min: 0, max: 99 },
    { name: 'Silver', min: 100, max: 299 },
    { name: 'Gold', min: 300, max: 599 },
    { name: 'Platinum', min: 600, max: 999 },
    { name: 'Diamond', min: 1000, max: 9999 }
];

const LEVEL_COLORS = {
    Bronze: '#cd7f32',
    Silver: '#a8a9ad',
    Gold: '#ffd700',
    Platinum: '#e5e4e2',
    Diamond: '#b9f2ff'
};

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const username = sessionStorage.getItem('pds_username');
    if (!username) { window.location.href = 'index.html'; return; }

    const stars = parseInt(sessionStorage.getItem('pds_stars') || '0');
    const level = sessionStorage.getItem('pds_level') || 'Bronze';

    // Populate hero from sessionStorage
    const userData = {
        username: username,
        stars: stars,
        level: level,
        first_name: username.charAt(0).toUpperCase() + username.slice(1),
        last_name: '',
        email: sessionStorage.getItem('pds_email') || '',
        dob: '',
        gender: '',
        is_student: false,
        college_name: '',
        passout_year: '',
        branch: '',
        created_at: new Date().toISOString()
    };

    populateHero(userData);
    populateDetails(userData);
    renderLists();

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
});

// ── Data ─────────────────────────────────────────────────
let allAsked = [];
let allSolved = [];
let activeFilter = { asked: 'all', solved: 'all' };

// ── Hero section ─────────────────────────────────────────
function populateHero(user) {
    const initials = user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase();
    document.getElementById('profile-avatar').textContent = initials;
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

    list.innerHTML = items.map(d => `
    <div class="doubt-item">
      <div class="doubt-item-question">${escHtml(d.question)}</div>
      <div class="doubt-item-meta">
        ${diffBadge(d.difficulty)}
        <span>📚 ${escHtml(d.subject_name)}</span>
        <span>💬 ${d.answer_count} answer(s)</span>
      </div>
    </div>
  `).join('');
}

function renderSolved() {
    const list = document.getElementById('solved-list');
    const filter = activeFilter.solved;
    const items = filter === 'all' ? allSolved : allSolved.filter(d => d.difficulty === filter);

    if (!items.length) {
        list.innerHTML = '<div class="empty-state">No solved doubts yet.</div>';
        return;
    }

    list.innerHTML = items.map(d => `
    <a class="doubt-item clickable"
       href="doubtAsker2.html"
       onclick="selectSolvedDoubt(event, '${escHtml(d.question)}', ${d.doubt_id})">
      <div class="doubt-item-question">${escHtml(d.question)}</div>
      <div class="doubt-item-meta">
        ${diffBadge(d.difficulty)}
        <span>📚 ${escHtml(d.subject_name)}</span>
        <span style="color:#4ade80">🔗 View Solution</span>
      </div>
    </a>
  `).join('');
}

function selectSolvedDoubt(event, question, doubtId) {
    event.preventDefault();
    sessionStorage.setItem('pds_activeDoubt', question);
    sessionStorage.setItem('pds_activeDoubtId', doubtId);
    window.location.href = 'doubtAsker2.html';
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Logout ─────────────────────────────────────────
function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    [
        'pds_username', 'pds_stars', 'pds_level',
        'pds_subjectId', 'pds_subjectName', 'pds_activeDoubt', 'pds_activeDoubtId',
        'pds_currentQuestion', 'pds_currentDoubtId', 'pds_reset_email', 'pds_email'
    ].forEach(k => sessionStorage.removeItem(k));
    window.location.href = 'index.html';
}
