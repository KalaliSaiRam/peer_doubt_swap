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
      li.innerHTML = `<strong>@${data.comment.username}</strong>: ${data.comment.content}`;
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

window.onload = async function () {
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
                  li.innerHTML = `<strong>@${c.username}</strong>: ${c.content}`;
                  commentList.appendChild(li);
              });
              updateEmptyState();
          }
      } catch(e) {
          console.error('Failed to load comments', e);
      }
  }
};
