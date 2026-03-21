async function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const feedback = document.getElementById('password-feedback');

  if (!email || !username || !password) {
    feedback.style.color = 'red';
    feedback.innerText = 'Please fill in all fields!';
    return;
  }

  try {
    const submitBtn = document.querySelector('button.btn-primary[onclick="handleLogin()"]');
    if (submitBtn) { submitBtn.innerText = 'Logging in...'; submitBtn.disabled = true; }
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    
    const data = await response.json();
    if (submitBtn) { submitBtn.innerText = 'Submit'; submitBtn.disabled = false; }
    
    if (!response.ok) {
      feedback.style.color = 'red';
      feedback.innerText = 'Error: ' + (data.error || 'Login failed.');
      return;
    }
    
    sessionStorage.setItem('pds_username', data.user.username);
    sessionStorage.setItem('pds_token', data.token);
    sessionStorage.setItem('pds_stars', data.user.stars);
    sessionStorage.setItem('pds_level', data.user.level);
    sessionStorage.setItem('pds_first_name', data.user.first_name);
    sessionStorage.setItem('pds_last_name', data.user.last_name || '');
    sessionStorage.setItem('pds_email', data.user.email);
    sessionStorage.setItem('pds_dob', data.user.dob || '');
    sessionStorage.setItem('pds_gender', data.user.gender || '');
    sessionStorage.setItem('pds_is_student', data.user.is_student || false);
    sessionStorage.setItem('pds_college_name', data.user.college_name || '');
    sessionStorage.setItem('pds_passout_year', data.user.passout_year || '');
    sessionStorage.setItem('pds_branch', data.user.branch || '');

    feedback.style.color = 'green';
    feedback.innerText = 'Login successful! Redirecting...';
    setTimeout(() => window.location.href = 'dashboard.html', 500);
  } catch(e) {
    feedback.style.color = 'red';
    feedback.innerText = 'Error connecting to server. Please try again.';
  }
}

function SignIn() {
  window.location.href = 'signin.html';
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  btn.innerHTML = isHidden
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
        <path d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708l-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
      </svg>`;
}
