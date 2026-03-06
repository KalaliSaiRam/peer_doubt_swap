// Step 1 — show reset fields (frontend-only, no email check)
function showResetFields() {
  const email = document.getElementById('reset-email').value.trim();
  if (!email.includes('@')) { alert('Please enter a valid email.'); return; }

  sessionStorage.setItem('pds_reset_email', email);
  document.getElementById('forgot-step-1').style.display = 'none';
  document.getElementById('forgot-step-2').style.display = 'block';
}

// Step 2 — set new password (frontend-only)
function handleReset() {
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;

  if (newPass !== confirmPass || newPass.length < 8) {
    alert('Passwords must match and be at least 8 characters.');
    return;
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(newPass)) {
    alert('Password must have uppercase, lowercase, number & special character.');
    return;
  }

  alert('Password updated successfully! Please log in.');
  sessionStorage.removeItem('pds_reset_email');
  window.location.href = 'index.html';
}

// Live feedback
document.addEventListener('DOMContentLoaded', function () {
  const newPass = document.getElementById('new-password');
  const confirmPass = document.getElementById('confirm-password');
  const strengthMsg = document.getElementById('strength-msg');
  const matchMsg = document.getElementById('match-msg');

  if (newPass && strengthMsg) {
    newPass.addEventListener('input', function () {
      const val = newPass.value;
      const isStrong = val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val);
      strengthMsg.textContent = isStrong ? '✅ Strong Password' : '❌ Weak (8+ chars, Uppercase & Number needed)';
      strengthMsg.style.color = isStrong ? 'green' : 'red';
    });
  }
  if (confirmPass && matchMsg) {
    confirmPass.addEventListener('input', function () {
      matchMsg.textContent = confirmPass.value === newPass.value ? '✅ Passwords Match' : '❌ Passwords do not match';
      matchMsg.style.color = confirmPass.value === newPass.value ? 'green' : 'red';
    });
  }
});

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
