window.onload = function () {
  const stars = sessionStorage.getItem('pds_stars') || '0';
  const level = sessionStorage.getItem('pds_level') || 'Bronze';
  const starEl = document.getElementById('points');
  const levelEl = document.getElementById('level-display');
  if (starEl) starEl.textContent = stars;
  if (levelEl) levelEl.textContent = level;
};

function chooseRole(role) {
  sessionStorage.setItem('pds_userRole', role);
  if (role === 'asker') {
    window.location.href = 'doubtAsker1.html';
  } else {
    window.location.href = 'doubtSolver1.html';
  }
}
