window.onload = function () {
  const stars = sessionStorage.getItem('pds_stars') || '0';
  const starEl = document.getElementById('star-count');
  if (starEl) starEl.innerText = stars;
};

const SUBJECTS = ['C', 'C++', 'Python', 'Java'];

let localDoubts = JSON.parse(sessionStorage.getItem('pds_localDoubts') || '[]');

function postDoubt() {
  const subjectSelect = document.getElementById('subject-select');
  const questionInput = document.getElementById('user-input');
  const difficultySelect = document.getElementById('difficulty-select');

  const subject = subjectSelect.value;
  const question = questionInput.value;
  const difficulty = difficultySelect.value;

  // Client-side validation
  const trimmed = question.trim();
  if (subject === '') { alert('Please select a subject.'); return; }
  if (trimmed === '') { alert('Please type a question before posting.'); return; }
  if (trimmed.length < 10) { alert('Question must be at least 10 characters.'); return; }
  if (trimmed.length > 1000) { alert('Question is too long (max 1000 chars).'); return; }
  if (!/[a-zA-Z]/.test(trimmed)) { alert('Question must contain text.'); return; }
  if (difficulty === '') { alert('Please select a difficulty level.'); return; }

  const doubtId = Date.now();
  const newDoubt = {
    id: doubtId,
    question: trimmed,
    difficulty: difficulty,
    subjectName: subject,
    answers: []
  };

  localDoubts.push(newDoubt);
  sessionStorage.setItem('pds_localDoubts', JSON.stringify(localDoubts));

  // Show inline success message
  const successMsg = document.getElementById('post-success');
  successMsg.style.display = 'block';
  setTimeout(() => { successMsg.style.display = 'none'; }, 3000);

  questionInput.value = '';
  difficultySelect.value = '';
  subjectSelect.value = '';
}
