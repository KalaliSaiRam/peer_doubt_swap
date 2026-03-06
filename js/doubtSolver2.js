let currentStars = parseInt(sessionStorage.getItem('pds_stars') || '0');

function updateEmptyState() {
  const commentList = document.getElementById('comment-list');
  let emptyMsg = document.getElementById('empty-msg');
  if (commentList && commentList.children.length === 0) {
    if (!emptyMsg) {
      emptyMsg = document.createElement('p');
      emptyMsg.id = 'empty-msg';
      emptyMsg.className = 'empty-msg';
      emptyMsg.innerText = 'Still looking for solutions... be the first to answer!';
      commentList.parentNode.appendChild(emptyMsg);
    }
  } else if (emptyMsg) {
    emptyMsg.remove();
  }
}

function addComment() {
  const commentInput = document.getElementById('new-comment');
  const commentList = document.getElementById('comment-list');
  const doubtId = sessionStorage.getItem('pds_currentDoubtId');
  const answerText = commentInput.value.trim();

  if (!answerText) { alert('Please write something before posting.'); return; }

  const username = sessionStorage.getItem('pds_username') || 'anonymous';

  // Save answer to local doubt store
  const allDoubts = JSON.parse(sessionStorage.getItem('pds_localDoubts') || '[]');
  const idx = allDoubts.findIndex(d => String(d.id) === String(doubtId));
  if (idx !== -1) {
    if (!allDoubts[idx].answers) allDoubts[idx].answers = [];
    allDoubts[idx].answers.push({
      solver_username: username,
      answer_text: answerText,
      created_at: new Date().toISOString()
    });
    sessionStorage.setItem('pds_localDoubts', JSON.stringify(allDoubts));
  }

  // Add to comment list in UI
  const li = document.createElement('li');
  li.className = 'comment-item';
  li.innerHTML = `<strong>@${username}</strong>: ${answerText}`;
  commentList.appendChild(li);
  commentInput.value = '';
  updateEmptyState();
}

window.onload = function () {
  const subject = sessionStorage.getItem('pds_subjectName') || '';
  const difficulty = sessionStorage.getItem('pds_difficulty') || '';
  const question = sessionStorage.getItem('pds_currentQuestion') || 'No question found.';
  const doubtId = sessionStorage.getItem('pds_currentDoubtId');

  const qEl = document.getElementById('display-question');
  if (qEl) qEl.innerText = question;

  const subjEl = document.getElementById('meta-subject');
  if (subjEl && subject) subjEl.innerText = '📚 ' + subject;

  const diffEl = document.getElementById('meta-difficulty');
  if (diffEl && difficulty) diffEl.innerText = '⚡ ' + difficulty;

  const starEl = document.getElementById('star-count');
  if (starEl) starEl.innerText = currentStars;

  // Load existing answers for this doubt
  if (doubtId) {
    const allDoubts = JSON.parse(sessionStorage.getItem('pds_localDoubts') || '[]');
    const doubt = allDoubts.find(d => String(d.id) === String(doubtId));
    if (doubt && doubt.answers && doubt.answers.length > 0) {
      const commentList = document.getElementById('comment-list');
      doubt.answers.forEach(a => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        li.innerHTML = `<strong>@${a.solver_username}</strong>: ${a.answer_text}`;
        commentList.appendChild(li);
      });
    }
  }

  updateEmptyState();
};
