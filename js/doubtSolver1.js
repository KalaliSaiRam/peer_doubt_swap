let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let searchTimer = null;

window.onload = function () {
  const stars = sessionStorage.getItem('pds_stars') || '0';
  const starEl = document.getElementById('star-count');
  if (starEl) starEl.innerText = stars;

  const subjectFilter = document.getElementById('subject-filter');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const searchInput = document.getElementById('search-input');

  subjectFilter.addEventListener('change', () => { currentPage = 1; renderDoubts(); });
  difficultyFilter.addEventListener('change', () => { currentPage = 1; renderDoubts(); });
  
  if (searchInput) {
      searchInput.addEventListener('input', () => {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => {
              currentPage = 1;
              renderDoubts();
          }, 400); // 400ms debounce
      });
  }

  renderDoubts();
};

async function renderDoubts() {
  const listContainer = document.getElementById('solver-list');
  const subjectFilter = document.getElementById('subject-filter');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const searchInput = document.getElementById('search-input');
  
  const selectedSubject = subjectFilter.value || 'all';
  const selectedDiff = difficultyFilter.value || 'all';
  const searchQuery = searchInput ? searchInput.value.trim() : '';

  listContainer.innerHTML = '<div class="empty-state">Loading doubts...</div>';

  try {
      let url = `/api/doubts?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
      if (selectedSubject !== 'all') url += '&subject=' + encodeURIComponent(selectedSubject);
      if (selectedDiff !== 'all') url += '&difficulty=' + encodeURIComponent(selectedDiff);
      if (searchQuery) url += '&search=' + encodeURIComponent(searchQuery);

      const res = await fetch(url);
      const data = await res.json();
      
      const doubts = data.doubts || [];
      const totalPages = data.totalPages || 1;

      listContainer.innerHTML = '';

      if (!doubts.length) {
          listContainer.innerHTML = '<div class="empty-state">No doubts found matching your criteria.</div>';
          document.getElementById('pagination-controls').style.display = 'none';
          return;
      }

      doubts.forEach(d => {
          const box = document.createElement('div');
          box.className = 'doubt-card';
          
          const badgeClass = `badge-${d.difficulty}`;
          const badgeText = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' }[d.difficulty] || d.difficulty;
          
          box.innerHTML = `
            <h4>${d.question}</h4>
            <div class="doubt-meta">
              <span class="${badgeClass}">${badgeText}</span>
              <span>📚 ${d.subject}</span>
              <span>💬 ${d.answer_count || 0} answer(s)</span>
              <span>👤 @${d.username}</span>
            </div>`;
            
          box.onclick = function () {
              sessionStorage.setItem('pds_currentQuestion', d.question);
              sessionStorage.setItem('pds_currentDoubtId', d.id);
              sessionStorage.setItem('pds_subjectName', d.subject || '');
              sessionStorage.setItem('pds_difficulty', d.difficulty || '');
              window.location.href = 'doubtSolver2.html';
          };
          listContainer.appendChild(box);
      });
      
      updatePagination(currentPage, totalPages);

  } catch(e) {
      console.error(e);
      listContainer.innerHTML = '<div class="empty-state" style="color:red">Failed to load doubts.</div>';
      document.getElementById('pagination-controls').style.display = 'none';
  }
}

function updatePagination(current, total) {
    const controls = document.getElementById('pagination-controls');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');
    
    if (total <= 1) {
        controls.style.display = 'none';
        return;
    }
    
    controls.style.display = 'flex';
    pageInfo.innerText = `Page ${current} of ${total}`;
    
    btnPrev.disabled = current <= 1;
    btnNext.disabled = current >= total;
    
    controls.dataset.total = total;
}

function changePage(delta) {
    const controls = document.getElementById('pagination-controls');
    const total = parseInt(controls.dataset.total || '1');
    const newPage = currentPage + delta;
    
    if (newPage >= 1 && newPage <= total) {
        currentPage = newPage;
        renderDoubts();
        document.querySelector('.doubts-section').scrollIntoView({ behavior: 'smooth' });
    }
}
