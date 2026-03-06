window.onload = function () {
  const stars = sessionStorage.getItem('pds_stars') || '0';
  const starEl = document.getElementById('star-count');
  if (starEl) starEl.innerText = stars;

  const subjectFilter = document.getElementById('subject-filter');
  const filterSelect = document.getElementById('difficulty-filter');

  subjectFilter.addEventListener('change', renderDoubts);
  filterSelect.addEventListener('change', renderDoubts);
  renderDoubts();
};

function renderDoubts() {
  const listContainer = document.getElementById('solver-list');
  const subjectFilter = document.getElementById('subject-filter');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const selectedSubject = (subjectFilter.value || 'all').toLowerCase();
  const selectedDiff = (difficultyFilter.value || 'all').toLowerCase();

  const allDoubts = JSON.parse(sessionStorage.getItem('pds_localDoubts') || '[]');

  let doubts = allDoubts;
  if (selectedSubject !== 'all') {
    doubts = doubts.filter(d => (d.subjectName || '').toLowerCase() === selectedSubject);
  }
  if (selectedDiff !== 'all') {
    doubts = doubts.filter(d => d.difficulty === selectedDiff);
  }

  listContainer.innerHTML = '';

  if (!doubts.length) {
    listContainer.innerHTML = '<div class="empty-state">No doubts available for the selected filters. Be the first to ask!</div>';
    return;
  }

  doubts.forEach(d => {
    const box = document.createElement('div');
    box.className = 'doubt-box';

    const badge = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }[d.difficulty] || d.difficulty;
    box.innerHTML = `
      <div style="font-weight:600">${d.question}</div>
      <div style="font-size:0.8rem;margin-top:4px;display:flex;gap:10px;opacity:0.75">
        <span>${badge}</span>
        <span>📚 ${d.subjectName}</span>
        <span>💬 ${(d.answers || []).length} answer(s)</span>
      </div>`;
    box.onclick = function () {
      sessionStorage.setItem('pds_currentQuestion', d.question);
      sessionStorage.setItem('pds_currentDoubtId', d.id);
      sessionStorage.setItem('pds_subjectName', d.subjectName || '');
      sessionStorage.setItem('pds_difficulty', d.difficulty || '');
      window.location.href = 'doubtSolver2.html';
    };
    listContainer.appendChild(box);
  });
}
