
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
  if (!/^[A-Za-z0-9_]$/.test(event.key)) { event.preventDefault(); return false; }
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
  event.target.value += paste.replace(/[^A-Za-z0-9_]/g, '');
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

// ── College list (IITs, NITs, IIITs) ────────────────────────────────────────
const COLLEGES = [
  // ── IITs (23) ──
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad',
  'IIT Indore', 'IIT Ropar', 'IIT Mandi', 'IIT Jodhpur', 'IIT Patna',
  'IIT Gandhinagar', 'IIT Bhubaneswar', 'IIT (BHU) Varanasi',
  'IIT Tirupati', 'IIT Palakkad', 'IIT Jammu', 'IIT Dharwad',
  'IIT Bhilai', 'IIT Goa', 'IIT (ISM) Dhanbad',

  // ── NITs (31) ──
  'NIT Trichy (NITT)', 'NIT Karnataka (Surathkal)', 'NIT Warangal (NITW)',
  'MNIT Jaipur', 'MNNIT Allahabad', 'NIT Calicut (NITC)', 'VNIT Nagpur',
  'MANIT Bhopal', 'NIT Rourkela', 'NIT Silchar', 'NIT Jamshedpur',
  'NIT Hamirpur', 'NIT Patna', 'NIT Raipur', 'NIT Surat (SVNIT)',
  'NIT Goa', 'NIT Delhi', 'NIT Arunachal Pradesh', 'NIT Manipur',
  'NIT Meghalaya', 'NIT Mizoram', 'NIT Nagaland', 'NIT Sikkim',
  'NIT Srinagar', 'NIT Uttarakhand', 'NIT Andhra Pradesh',
  'NIT Puducherry', 'NIT Kurukshetra', 'NIT Durgapur',
  'NIT Agartala', 'MNNIT Allahabad',

  // ── IIITs (26+) ──
  'IIIT Allahabad (IIITA)', 'ABV-IIITM Gwalior',
  'IIITDM Jabalpur', 'IIITDM Kancheepuram',
  'IIIT Guwahati', 'IIIT Kota', 'IIIT Sri City',
  'IIIT Vadodara', 'IIIT Pune', 'IIIT Naya Raipur',
  'IIIT Delhi', 'IIIT Bangalore', 'IIIT Hyderabad',
  'IIIT Bhubaneswar', 'IIIT Kalyani', 'IIIT Kottayam',
  'IIIT Lucknow', 'IIIT Dharwad', 'IIIT Tiruchirappalli',
  'IIIT Manipur', 'IIIT Nagpur', 'IIIT Ranchi',
  'IIIT Sonepat', 'IIIT Una', 'IIIT Agartala', 'IIIT Bhagalpur',
  'IIIT Surat', 'IIIT Raichur', 'IIIT Bhopal',

  // ── Top Engineering Colleges (Hyderabad / Telangana / AP) ──
  'JNTUH University College of Engineering Hyderabad (JNTH)',
  'JNTUH University College of Engineering - Integrated MTech (JNTHMT)',
  'Chaitanya Bharathi Institute of Technology (CBIT)',
  'VNR Vignana Jyothi Institute of Engineering and Technology (VJEC)',
  'OU College of Engineering Hyderabad (OUCE)',
  'CVR College of Engineering (CVRH)',
  'SR University (SRHP)',
  'Vasavi College of Engineering (VASV)',
  'Gokaraju Rangaraju Institute of Engineering and Technology (GRRR)',
  'Vardhaman College of Engineering (VMEG)',
  'Mahatma Gandhi Institute of Technology (MGIT)',
  'Sreenidhi Institute of Science and Technology (SNIS)',
  'B V Raju Institute of Technology (BVRI)',
  'Anurag University (CVSR)',
  'Kakatiya Institute of Technology and Science (KITS)',
  'MVSR Engineering College (MVSR)',
  'Keshav Memorial Institute of Technology (KMIT)',
  'Geetanjali College of Engineering and Technology (GCTC)',
  'Malla Reddy Engineering College (MREC)',
  'Guru Nanak Institute of Technology (GNIT)',
  'Vaagdevi College of Engineering (VAGE)',
  'Vidyajyothi Institute of Technology (VJIT)',
  'Nalla Malla Reddy Engineering College (NREC)',
  'MLR Institute of Technology (MLID)',
  'KU College of Engineering and Technology (KUWL)',
  'CMR Engineering College (CMRN)',
  'CMR College of Engineering and Technology (CMRK)',
  'St Martins Engineering College (MRTN)',
  'Malla Reddy College of Engineering Technology (MLRD)',
  'CMR Institute of Technology (CMRM)',
  'ACE Engineering College (ACEG)',
  'Marri Laxman Reddy Institute of Technology and Management (MLRS)',
  'KG Reddy College of Engineering and Technology (KGRH)',
  'Guru Nanak Institutions Technical Campus (GURU)',
  'CMR Technical Campus (CMRG)',
  'Sri Indu College of Engineering and Technology (INDU)',
  'Hyderabad Institute of Technology and Management (HITM)',
  'JNTUH University College of Engineering Jagtial (JNKR)',
  'Kommuri Pratap Reddy Institute of Technology (KPRT)',
  'Stanley College of Engineering and Technology for Women (STLW)',
  'Nalla Narasimha Reddy Educational Society Group of Institutions (NNRG)',
  'Teegala Krishna Reddy Engineering College (TKEM)',
  'TKR College of Engineering and Technology (TKRC)',
  'St Peters Engineering College (SPEC)',
  'Sreyas Institute of Engineering and Technology (SRYS)',
  'Sri Indu Institute of Engineering and Technology (INDI)',
  'JB Institute of Engineering and Technology (JBIT)',
  'Vignan Bharati Institute of Engineering and Technology (VBIT)',
  'Malla Reddy Institute of Engineering and Technology (MRET)',
  'Narsimha Reddy Engineering College (NRCM)',

  // ── Others ──
  'Others'
];

function showCollegeList() {
  filterColleges();
  document.getElementById('collegeDropdown').style.display = 'block';
}

function filterColleges() {
  const searchInput = document.getElementById('collegeSearch');
  const hiddenInput = document.getElementById('collegeName');
  const query = searchInput.value.toLowerCase();
  const dropdown = document.getElementById('collegeDropdown');
  dropdown.innerHTML = '';
  hiddenInput.value = searchInput.value.trim();
  searchInput.setCustomValidity('');

  const filtered = COLLEGES.filter(c => c.toLowerCase().includes(query));

  if (filtered.length === 0) {
    dropdown.innerHTML = '<div style="padding:10px 14px;color:#9ca3af;font-size:0.88rem;">No matches found</div>';
    dropdown.style.display = 'block';
    return;
  }

  filtered.forEach(name => {
    const item = document.createElement('div');
    item.textContent = name;
    item.style.cssText = 'padding:8px 14px;cursor:pointer;font-size:0.9rem;border-bottom:1px solid #f3f4f6;transition:background 0.15s;';
    item.onmouseenter = () => item.style.background = '#eff6ff';
    item.onmouseleave = () => item.style.background = '';
    item.onclick = () => selectCollege(name);
    dropdown.appendChild(item);
  });

  dropdown.style.display = 'block';
}

function selectCollege(name) {
  const searchInput = collegeSearchInput;
  const hiddenInput = collegeHiddenInput;
  const otherInput = collegeOtherInput;
  const dropdown = document.getElementById('collegeDropdown');

  dropdown.style.display = 'none';
  searchInput.setCustomValidity('');

  if (name === 'Others') {
    searchInput.value = 'Others';
    hiddenInput.value = '';
    otherInput.style.display = 'block';
    otherInput.required = true;
    otherInput.focus();
    otherInput.oninput = () => { hiddenInput.value = otherInput.value; };
  } else {
    searchInput.value = name;
    hiddenInput.value = name;
    otherInput.style.display = 'none';
    otherInput.required = false;
    otherInput.value = '';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
  const wrap = document.querySelector('.college-search-wrap');
  const dd = document.getElementById('collegeDropdown');
  if (wrap && dd && !wrap.contains(e.target)) {
    dd.style.display = 'none';
  }
});

// ── Student toggle ──────────────────────────────────────────────────────────
const studentRadios = document.querySelectorAll('input[name="student"]');
const academicSection = document.getElementById('academicSection');
const collegeSearchInput = document.getElementById('collegeSearch');
const collegeHiddenInput = document.getElementById('collegeName');
const collegeOtherInput = document.getElementById('collegeOther');
const passoutYearInput = document.getElementById('passoutYear');
const branchInput = document.getElementById('branch');

// Keep hidden academic fields non-blocking until "Yes" is selected.
academicSection.style.display = 'none';
collegeSearchInput.required = false;
collegeOtherInput.required = false;
passoutYearInput.required = false;
branchInput.required = false;

studentRadios.forEach(radio => {
  radio.addEventListener('change', function () {
    if (this.value === 'yes') {
      academicSection.style.display = 'block';
      collegeSearchInput.required = true;
      passoutYearInput.required = true;
      branchInput.required = true;
    } else {
      academicSection.style.display = 'none';
      collegeSearchInput.required = false;
      collegeSearchInput.value = '';
      collegeSearchInput.setCustomValidity('');
      collegeHiddenInput.value = '';
      collegeOtherInput.required = false;
      collegeOtherInput.style.display = 'none';
      collegeOtherInput.value = '';
      passoutYearInput.required = false;
      passoutYearInput.value = '';
      branchInput.required = false;
      branchInput.value = '';
    }
  });
});

// ── Error helpers ───────────────────────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.innerText = msg; el.style.display = 'block'; }
  const inputId = id.replace('error-', '');
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
  }
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) { el.innerText = ''; el.style.display = 'none'; }
  const inputId = id.replace('error-', '');
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    inputEl.classList.remove('is-invalid');
    if (inputEl.value.trim() !== '') {
      inputEl.classList.add('is-valid');
    } else {
      inputEl.classList.remove('is-valid');
    }
  }
}

function clearErrors() {
  ['error-username', 'error-email', 'error-password', 'error-confirm', 'error-dob']
    .forEach(id => clearError(id));
}

// ── Real-time Validation ────────────────────────────────────────────────────
['firstName', 'lastName'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', function() {
      if (this.checkValidity() && this.value.trim() !== '') {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
      } else {
        this.classList.add('is-invalid');
        this.classList.remove('is-valid');
      }
    });
  }
});

const usernameEl = document.getElementById('username');
if (usernameEl) {
  usernameEl.addEventListener('input', function() {
    const v = this.value.trim();
    if (!v) { clearError('error-username'); return; }
    if (v.length < 6) {
      showError('error-username', 'Username must be at least 6 characters long.');
    } else if (/[A-Z]/.test(v)) {
      showError('error-username', 'Username cannot contain uppercase letters.');
    } else if (!/[a-z]/.test(v)) {
      showError('error-username', 'Username must contain at least one letter.');
    } else if (!/\d/.test(v)) {
      showError('error-username', 'Username must contain at least one number.');
    } else if (/[^a-zA-Z0-9_]/.test(v)) {
      showError('error-username', 'Username can only contain letters, numbers, and underscores.');
    } else {
      clearError('error-username');
    }
  });
}

const emailEl = document.getElementById('email');
if (emailEl) {
  emailEl.addEventListener('input', function() {
    const v = this.value.trim();
    if (!v) { clearError('error-email'); return; }
    if (!/@/.test(v)) {
      showError('error-email', 'Email must contain an "@" symbol.');
    } else if (!/@.*\./.test(v)) {
      showError('error-email', 'Email must have a valid domain extension (e.g., .com, .in).');
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(v)) {
        showError('error-email', 'Please enter a valid email address.');
      } else {
        clearError('error-email');
      }
    }
  });
}

const passEl = document.getElementById('password');
if (passEl) {
  passEl.addEventListener('input', function() {
    const v = this.value;
    if (!v) { clearError('error-password'); return; }
    if (v.length < 8) {
      showError('error-password', 'Password must be at least 8 characters long.');
    } else if (!/[a-z]/.test(v)) {
      showError('error-password', 'Password must contain at least one lowercase letter.');
    } else if (!/[A-Z]/.test(v)) {
      showError('error-password', 'Password must contain at least one uppercase letter.');
    } else if (!/\d/.test(v)) {
      showError('error-password', 'Password must contain at least one number.');
    } else if (!/\W|_/.test(v)) {
      showError('error-password', 'Password must contain at least one special character.');
    } else {
      clearError('error-password');
    }
    
    const confirmV = document.getElementById('confirmPassword')?.value;
    if (confirmV && v !== confirmV) {
      showError('error-confirm', 'Passwords do not match!');
    } else if (confirmV) {
      clearError('error-confirm');
    }
  });
}

const confirmPassEl = document.getElementById('confirmPassword');
if (confirmPassEl) {
  confirmPassEl.addEventListener('input', function() {
    const v = this.value;
    if (!v) { clearError('error-confirm'); return; }
    const passV = document.getElementById('password')?.value;
    if (v !== passV) {
      showError('error-confirm', 'Passwords do not match!');
    } else {
      clearError('error-confirm');
    }
  });
}

const dobEl = document.getElementById('dob');
if (dobEl) {
  dobEl.addEventListener('change', function() {
    const v = this.value;
    if (!v) { clearError('error-dob'); return; }
    const today = new Date(), birth = new Date(v);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 15) { 
      showError('error-dob', 'You must be at least 15 years old.');
    } else {
      clearError('error-dob');
    }
  });
}

function setFormStatus(msg, isError = false) {
  const el = document.getElementById('form-status');
  if (!el) return;
  el.style.color = isError ? '#dc2626' : '#15803d';
  el.innerText = msg || '';
}

function triggerSignupSubmit(event) {
  if (event) event.preventDefault();
  const form = document.getElementById('signupForm');
  if (!form) return;
  setFormStatus('Button clicked. Validating...');
  if (typeof form.requestSubmit === 'function') {
    form.requestSubmit();
  } else {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  }
}

window.triggerSignupSubmit = triggerSignupSubmit;

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

// ── Form submission ──────────────────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  clearErrors();
  setFormStatus('');

  const studentEl = document.querySelector('input[name="student"]:checked');
  const isStudentSelected = studentEl && studentEl.value === 'yes';

  if (isStudentSelected) {
    const resolvedCollegeName = (collegeHiddenInput.value || collegeSearchInput.value || '').trim();
    if (!resolvedCollegeName) {
      collegeSearchInput.setCustomValidity('Please select your college or choose Others and type it.');
    } else {
      collegeSearchInput.setCustomValidity('');
    }
  } else {
    collegeSearchInput.setCustomValidity('');
  }

  if (!this.checkValidity()) {
    event.stopPropagation();
    this.classList.add('was-validated');
    const firstInvalid = this.querySelector(':invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setFormStatus('Please fix highlighted fields and try again.', true);
    return;
  }

  const first_name = document.getElementById('firstName').value.trim();
  const last_name = document.getElementById('lastName').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;
  const dob = document.getElementById('dob').value;
  
  const genderEl = document.querySelector('input[name="gender"]:checked');
  const gender = genderEl ? genderEl.value : '';

  const is_student = studentEl && studentEl.value === 'yes' ? true : false;
  
  const college_name = (collegeHiddenInput.value || collegeSearchInput.value || '').trim();
  const passout_year = document.getElementById('passoutYear').value;
  const branch = document.getElementById('branch').value;

  // ── Client-side validation ──────────────────────────────────────────────
  let isValid = true;

  if (username.length < 6) {
    showError('error-username', 'Username must be at least 6 characters long.');
    isValid = false;
  } else if (/[A-Z]/.test(username)) {
    showError('error-username', 'Username cannot contain uppercase letters.');
    isValid = false;
  } else if (!/[a-z]/.test(username)) {
    showError('error-username', 'Username must contain at least one letter.');
    isValid = false;
  } else if (!/\d/.test(username)) {
    showError('error-username', 'Username must contain at least one number.');
    isValid = false;
  } else if (/[^a-zA-Z0-9_]/.test(username)) {
    showError('error-username', 'Username can only contain letters, numbers, and underscores.');
    isValid = false;
  }
  
  if (!/@/.test(email)) {
    showError('error-email', 'Email must contain an "@" symbol.');
    isValid = false;
  } else if (!/@.*\./.test(email)) {
    showError('error-email', 'Email must have a valid domain extension (e.g., .com, .in).');
    isValid = false;
  } else {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      showError('error-email', 'Please enter a valid email address.');
      isValid = false;
    }
  }

  if (pass.length < 8) {
    showError('error-password', 'Password must be at least 8 characters long.');
    isValid = false;
  } else if (!/[a-z]/.test(pass)) {
    showError('error-password', 'Password must contain at least one lowercase letter.');
    isValid = false;
  } else if (!/[A-Z]/.test(pass)) {
    showError('error-password', 'Password must contain at least one uppercase letter.');
    isValid = false;
  } else if (!/\d/.test(pass)) {
    showError('error-password', 'Password must contain at least one number.');
    isValid = false;
  } else if (!/\W|_/.test(pass)) {
    showError('error-password', 'Password must contain at least one special character.');
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

  // ── API call to backend ──────────────────────────────────────────
  try {
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Registering...';
    submitBtn.disabled = true;
    setFormStatus('Submitting details...');

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name, last_name, username, email, password: pass,
        dob, gender, is_student, college_name, passout_year, branch
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setFormStatus(data.error || 'Registration failed.', true);
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
      return;
    }

    // ── Store session & redirect ──────────────────────────────────────────
    try {
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
    } catch (storageErr) {
      console.warn('Session storage unavailable:', storageErr);
    }

    setFormStatus('Registration successful! Redirecting...');
    window.location.assign('/html/index.html');

  } catch (error) {
    console.error('Registration API error:', error);
    setFormStatus('Could not connect to server. Please try again.', true);
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.innerText = 'SIGN-IN';
    submitBtn.disabled = false;
  }
});