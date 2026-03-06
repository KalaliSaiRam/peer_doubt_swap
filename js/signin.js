const BASE_URL = 'http://localhost:3000';

// ── Input guard helpers ─────────────────────────────────────────────────────
function preventSpaces(event) {
  if (event.key === ' ') { event.preventDefault(); return false; }
  return true;
}

function allowOnlyNumbers(event) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return true;
  if (!/^[0-9]$/.test(event.key)) { event.preventDefault(); return false; }
  return true;
}

function allowUsernameChars(event) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return true;
  if (event.key === ' ') { event.preventDefault(); return false; }
  if (!/^[a-z0-9_]$/.test(event.key)) { event.preventDefault(); return false; }
  return true;
}

function allowOnlyLetters(event) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return true;
  if (!/^[A-Za-z]$/.test(event.key)) { event.preventDefault(); return false; }
  return true;
}

function preventNonLetterPaste(event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  event.target.value += paste.replace(/[^A-Za-z]/g, '');
}

function preventSpacePaste(event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  event.target.value += paste.replace(/\s/g, '');
}

function preventYearPaste(event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  let clean = paste.replace(/[^0-9]/g, '');
  const remaining = 4 - event.target.value.length;
  if (remaining > 0) event.target.value += clean.slice(0, remaining);
}

function preventInvalidUsernamePaste(event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  event.target.value += paste.replace(/[^a-z0-9_]/g, '');
}

function allowCollegeName(event) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return true;
  if (event.key === ' ' && event.target.selectionStart === 0) { event.preventDefault(); return false; }
  if (!/^[A-Za-z\s]$/.test(event.key)) { event.preventDefault(); return false; }
  return true;
}

function preventInvalidCollegePaste(event) {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  let clean = paste.replace(/[^A-Za-z\s]/g, '');
  if (event.target.selectionStart === 0) clean = clean.replace(/^\s+/, '');
  event.target.value += clean;
}

// ── Student toggle ──────────────────────────────────────────────────────────
const studentRadios = document.querySelectorAll('input[name="student"]');
const academicSection = document.getElementById('academicSection');
const academicInputs = academicSection.querySelectorAll('input, select');

studentRadios.forEach(radio => {
  radio.addEventListener('change', function () {
    if (this.value === 'yes') {
      academicSection.style.display = 'block';
      academicInputs.forEach(i => i.required = true);
    } else {
      academicSection.style.display = 'none';
      academicInputs.forEach(i => { i.required = false; i.value = ''; });
    }
  });
});

// ── Error helpers ───────────────────────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.innerText = msg; el.style.display = 'block'; }
}

function clearErrors() {
  ['error-username', 'error-email', 'error-password', 'error-confirm', 'error-dob']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.innerText = ''; el.style.display = 'none'; }
    });
}

// ── Password toggle ─────────────────────────────────────────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (isPassword) {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
    </svg>`;
    btn.setAttribute('aria-label', 'Hide password');
  } else {
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
      <path d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
      <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708l-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
    </svg>`;
    btn.setAttribute('aria-label', 'Show password');
  }
}

// ── Form submission → API call ──────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  clearErrors();

  if (!this.checkValidity()) {
    event.stopPropagation();
    this.classList.add('was-validated');
    return;
  }

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;
  const dob = document.getElementById('dob').value;

  // Client-side validation (same rules as before)
  let isValid = true;

  if (!/^(?=.*[a-z])(?=.*\d)[a-z0-9_]{6,}$/.test(username)) {
    showError('error-username', 'Username must be ≥6 chars with at least one letter and number.');
    isValid = false;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass)) {
    showError('error-password', 'Password must have 8+ chars, uppercase, lowercase, number & special char.');
    isValid = false;
  }
  if (pass !== confirm) {
    showError('error-confirm', 'Passwords do not match!');
    isValid = false;
  }
  if (dob) {
    const today = new Date(), birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 15) { showError('error-dob', 'You must be at least 15 years old.'); isValid = false; }
  }
  if (!isValid) return;

  // Gather all fields
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.nextElementSibling?.innerText?.trim() || '';
  const isStudentEl = document.querySelector('input[name="student"]:checked');
  const isStudent = isStudentEl ? isStudentEl.value === 'yes' : false;
  const collegeName = document.getElementById('collegeName')?.value || '';
  const passoutYear = document.getElementById('passoutYear')?.value || '';
  const branch = document.getElementById('branch')?.value || '';

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Registering...';

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName, lastName, username, email, password: pass,
        dob, gender, isStudent, collegeName, passoutYear, branch
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data.error || 'Registration failed.';
      showError('error-email', msg);
      submitBtn.disabled = false;
      submitBtn.innerText = 'SIGN-IN';
      return;
    }

    // Store session
    sessionStorage.setItem('pds_token', data.token);
    sessionStorage.setItem('pds_userId', data.userId);
    sessionStorage.setItem('pds_username', data.username);
    sessionStorage.setItem('pds_stars', '0');
    sessionStorage.setItem('pds_level', 'Bronze');

    alert('Registration Successful! Welcome, ' + data.username + '!');
    window.location.href = 'index.html';

  } catch (err) {
    showError('error-email', 'Cannot connect to server. Make sure the backend is running.');
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.innerText = 'SIGN-IN';
  }
});