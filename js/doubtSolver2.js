function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

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

async function addComment() {
  const commentInput = document.getElementById('new-comment');
  const commentList = document.getElementById('comment-list');
  const doubtId = sessionStorage.getItem('pds_currentDoubtId');
  const answerText = commentInput.value.trim();

  if (!answerText) { alert('Please write something before posting.'); return; }

  const token = sessionStorage.getItem('pds_token');
  if (!token) { alert('You must be logged in to comment.'); return; }

  try {
      const res = await fetch(`/api/doubts/${doubtId}/comments`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ content: answerText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');

      const li = document.createElement('li');
      li.className = 'comment-item';
      if (data.comment && data.comment.id != null) {
        li.id = 'pds-comment-' + data.comment.id;
        li.setAttribute('data-comment-id', data.comment.id);
      }
      li.innerHTML = `<strong>@${escHtml(data.comment.username)}</strong>: ${escHtml(data.comment.content)}`;
      commentList.appendChild(li);
      commentInput.value = '';
      updateEmptyState();

      // Update stars
      const currentStars = parseInt(sessionStorage.getItem('pds_stars') || '0');
      sessionStorage.setItem('pds_stars', currentStars + 10);
      const starEl = document.getElementById('star-count');
      if (starEl) starEl.innerText = currentStars + 10;
  } catch(e) {
      alert(e.message);
  }
}

function scrollToSolutionComment(commentId) {
  if (!commentId) return;
  const id = String(commentId).trim();
  const el = document.getElementById('pds-comment-' + id);
  if (!el) return;
  el.classList.add('comment-item--targeted');
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(function () {
    el.classList.remove('comment-item--targeted');
  }, 5000);
}

window.onload = async function () {
  const params = new URLSearchParams(window.location.search);
  const commentIdFromUrl = params.get('commentId');
  const doubtIdFromUrl = params.get('doubtId');
  if (doubtIdFromUrl) {
    try {
      const res = await fetch('/api/doubts/' + encodeURIComponent(doubtIdFromUrl));
      const d = await res.json();
      if (res.ok && d && d.id) {
        sessionStorage.setItem('pds_currentDoubtId', String(d.id));
        sessionStorage.setItem('pds_subjectName', d.subject || '');
        sessionStorage.setItem('pds_difficulty', d.difficulty || '');
        sessionStorage.setItem('pds_currentQuestion', d.question || '');
      }
    } catch (e) {
      console.warn('Could not load doubt from URL', e);
    }
  }

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
  if (starEl) starEl.innerText = parseInt(sessionStorage.getItem('pds_stars') || '0');

  updateEmptyState();

  if (doubtId) {
      try {
          const res = await fetch(`/api/doubts/${doubtId}/comments`);
          const comments = await res.json();
          if (res.ok && comments.length > 0) {
              const commentList = document.getElementById('comment-list');
              comments.forEach(c => {
                  const li = document.createElement('li');
                  li.className = 'comment-item';
                  if (c.id != null) {
                    li.id = 'pds-comment-' + c.id;
                    li.setAttribute('data-comment-id', c.id);
                  }
                  li.innerHTML = `<strong>@${escHtml(c.username)}</strong>: ${escHtml(c.content)}`;
                  commentList.appendChild(li);
              });
              updateEmptyState();
              if (commentIdFromUrl) {
                scrollToSolutionComment(commentIdFromUrl);
              }
          }
      } catch(e) {
          console.error('Failed to load comments', e);
      }
  }
};
