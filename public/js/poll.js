/* ============================================
   WEALTHPOINT CONFERENCE POLL — MOBILE LOGIC
   ============================================ */

(function () {
  'use strict';

  const API_BASE = '';
  let currentStep = 1;
  let userData = {};
  let demoData = { role_type: null, adviser_specialisation: null, gender: null, age: null };
  let q1Answer = null;
  let q1Other = '';
  let q2Answers = [];
  let q2Other = '';
  let q3FreeText = '';
  let resultsData = null;

  // === DOM Refs ===
  const steps = {
    '1': document.getElementById('step1'),
    '1b': document.getElementById('step1b'),
    '2': document.getElementById('step2'),
    '2b': document.getElementById('step2b'),
    '3': document.getElementById('step3'),
    '3b': document.getElementById('step3b'),
    '4': document.getElementById('step4'),
    '5': document.getElementById('step5'),
  };

  const progressFill = document.getElementById('progressFill');
  const dots = document.querySelectorAll('.dot');

  // === Step Navigation ===
  // Steps: 1 (details) → 1b (demographics) → 2 (Q1) → 2b (Q1 results) → 3 (Q2) → 3b (Q2 results) → 4 (Q3 free text) → 5 (thanks)
  const progressMap = { '1': 10, '1b': 20, '2': 30, '2b': 40, '3': 50, '3b': 65, '4': 80, '5': 100 };
  // 6 dots: Details, Demographics, Q1, Q2, Q3, Thanks
  const dotMap = { '1': 1, '1b': 2, '2': 3, '2b': 3, '3': 4, '3b': 4, '4': 5, '5': 6 };

  function goToStep(stepKey) {
    const currentEl = document.querySelector('.step.active');
    if (currentEl) {
      currentEl.classList.remove('active');
      currentEl.classList.add('exit-left');
      setTimeout(() => currentEl.classList.remove('exit-left'), 500);
    }

    setTimeout(() => {
      steps[stepKey].classList.add('active');
      steps[stepKey].scrollTop = 0;
      window.scrollTo(0, 0);
    }, 80);

    // Update progress
    progressFill.style.width = progressMap[stepKey] + '%';
    const activeDot = dotMap[stepKey];
    dots.forEach(d => {
      const s = parseInt(d.dataset.step);
      d.classList.remove('active', 'done');
      if (s < activeDot) d.classList.add('done');
      else if (s === activeDot) d.classList.add('active');
    });

    currentStep = stepKey;
  }

  // === Step 1: Details Form ===
  document.getElementById('detailsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    userData.firstName = document.getElementById('userFirstName').value.trim();
    userData.lastName = document.getElementById('userLastName').value.trim();
    userData.email = document.getElementById('userEmail').value.trim();
    userData.company = document.getElementById('userCompany').value.trim();
    if (!userData.firstName || !userData.lastName || !userData.email) return;
    // Combine for backward compat
    userData.name = userData.firstName + ' ' + userData.lastName;
    goToStep('1b');
  });

  // === Step 1b: Demographics ===
  const roleButtons = document.querySelectorAll('#roleOptions .option-btn');
  const adviserSpecSection = document.getElementById('adviserSpecSection');
  const adviserSpecButtons = document.querySelectorAll('#adviserSpecOptions .option-btn');
  const genderButtons = document.querySelectorAll('#genderOptions .option-btn');
  const ageInput = document.getElementById('userAge');
  const demoNextBtn = document.getElementById('demoNext');

  function checkDemoComplete() {
    const roleSet = !!demoData.role_type;
    const specOK = demoData.role_type !== 'financial_adviser' || !!demoData.adviser_specialisation;
    const genderSet = !!demoData.gender;
    const ageSet = !!ageInput.value.trim();
    if (roleSet && specOK && genderSet && ageSet) {
      demoNextBtn.classList.remove('hidden');
    } else {
      demoNextBtn.classList.add('hidden');
    }
  }

  roleButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      roleButtons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      demoData.role_type = this.dataset.value;

      if (demoData.role_type === 'financial_adviser') {
        adviserSpecSection.classList.remove('hidden');
      } else {
        adviserSpecSection.classList.add('hidden');
        demoData.adviser_specialisation = null;
        adviserSpecButtons.forEach(b => b.classList.remove('selected'));
      }
      checkDemoComplete();
    });
  });

  adviserSpecButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      adviserSpecButtons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      demoData.adviser_specialisation = this.dataset.value;
      checkDemoComplete();
    });
  });

  genderButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      genderButtons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      demoData.gender = this.dataset.value;
      checkDemoComplete();
    });
  });

  ageInput.addEventListener('input', checkDemoComplete);

  demoNextBtn.addEventListener('click', function () {
    demoData.age = ageInput.value.trim();
    goToStep('2');
  });

  // === Step 2: Q1 Single Choice ===
  const q1Buttons = document.querySelectorAll('#q1Options .option-btn');
  const q1NextBtn = document.getElementById('q1Next');
  const q1OtherWrap = document.getElementById('q1OtherWrap');

  q1Buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      q1Buttons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      q1Answer = this.dataset.value;

      if (q1Answer === 'Other') {
        q1OtherWrap.classList.remove('hidden');
        document.getElementById('q1Other').focus();
      } else {
        q1OtherWrap.classList.add('hidden');
      }

      q1NextBtn.classList.remove('hidden');
    });
  });

  q1NextBtn.addEventListener('click', function () {
    if (!q1Answer) return;
    q1Other = document.getElementById('q1Other').value.trim();

    q1NextBtn.innerHTML = '<span class="spinner"></span>';
    q1NextBtn.disabled = true;

    fetchResults().then(data => {
      resultsData = data;
      renderQ1Chart(data);
      goToStep('2b');
      q1NextBtn.innerHTML = 'Next →';
      q1NextBtn.disabled = false;
    }).catch(() => {
      goToStep('2b');
      q1NextBtn.innerHTML = 'Next →';
      q1NextBtn.disabled = false;
    });
  });

  // === Q1 Results Chart ===
  function renderQ1Chart(data) {
    const container = document.getElementById('q1Chart');
    container.innerHTML = '';
    const q1 = data.q1 || {};
    const options = [
      'Regulation & Compliance',
      'Client Growth',
      'Tech & Automation',
      'Recruitment & Development',
      'Other'
    ];
    const total = Object.values(q1).reduce((a, b) => a + b, 0) || 1;

    options.forEach(opt => {
      const count = q1[opt] || 0;
      const pct = Math.round((count / total) * 100);
      const isYours = (opt === q1Answer);

      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <div class="chart-label-row">
          <span class="chart-label ${isYours ? 'yours' : ''}">${isYours ? '→ ' : ''}${opt}</span>
          <span class="chart-value">${count} vote${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${isYours ? 'yours' : ''}" style="width: 0%">
            ${pct >= 15 ? `<span class="chart-bar-pct">${pct}%</span>` : ''}
          </div>
        </div>
      `;
      container.appendChild(row);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.chart-bar-fill').style.width = Math.max(pct, 2) + '%';
        });
      });
    });
  }

  document.getElementById('q1ResultsNext').addEventListener('click', () => goToStep('3'));

  // === Step 3: Q2 Multi-Select ===
  const q2Buttons = document.querySelectorAll('#q2Options .checkbox-btn');
  const q2NextBtn = document.getElementById('q2Next');
  const q2OtherWrap = document.getElementById('q2OtherWrap');

  q2Buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      const val = this.dataset.value;

      if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        q2Answers = q2Answers.filter(a => a !== val);
        if (val === 'Other') q2OtherWrap.classList.add('hidden');
      } else {
        if (q2Answers.length >= 2) return;
        this.classList.add('selected');
        q2Answers.push(val);
        if (val === 'Other') {
          q2OtherWrap.classList.remove('hidden');
          document.getElementById('q2Other').focus();
        }
      }

      q2Buttons.forEach(b => {
        if (q2Answers.length >= 2 && !b.classList.contains('selected')) {
          b.classList.add('disabled');
        } else {
          b.classList.remove('disabled');
        }
      });

      q2NextBtn.classList.toggle('hidden', q2Answers.length === 0);
    });
  });

  q2NextBtn.addEventListener('click', function () {
    if (q2Answers.length === 0) return;
    q2Other = document.getElementById('q2Other').value.trim();

    q2NextBtn.innerHTML = '<span class="spinner"></span>';
    q2NextBtn.disabled = true;

    fetchResults().then(data => {
      resultsData = data;
      renderQ2Chart(data);
      goToStep('3b');
      q2NextBtn.innerHTML = 'Next →';
      q2NextBtn.disabled = false;
    }).catch(() => {
      goToStep('3b');
      q2NextBtn.innerHTML = 'Next →';
      q2NextBtn.disabled = false;
    });
  });

  // === Q2 Results Chart ===
  function renderQ2Chart(data) {
    const container = document.getElementById('q2Chart');
    container.innerHTML = '';
    const q2 = data.q2 || {};
    const totalRespondents = data.totalResponses || 1;
    const options = [
      'Compliance Guidance',
      'Business Development Tools',
      'Training & Development',
      'Recruitment Support',
      'Peer Networks & Mentoring',
      'Other'
    ];

    options.forEach(opt => {
      const count = q2[opt] || 0;
      const pct = Math.round((count / totalRespondents) * 100);
      const isYours = q2Answers.includes(opt);

      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <div class="chart-label-row">
          <span class="chart-label ${isYours ? 'yours' : ''}">${isYours ? '→ ' : ''}${opt}</span>
          <span class="chart-value">${count} vote${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill ${isYours ? 'yours' : ''}" style="width: 0%">
            ${pct >= 15 ? `<span class="chart-bar-pct">${pct}%</span>` : ''}
          </div>
        </div>
      `;
      container.appendChild(row);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.chart-bar-fill').style.width = Math.max(pct, 2) + '%';
        });
      });
    });
  }

  document.getElementById('q2ResultsNext').addEventListener('click', () => goToStep('4'));

  // === Step 4: Q3 Free Text ===
  const q3TextArea = document.getElementById('q3FreeText');
  const q3CharCount = document.getElementById('q3CharCount');
  const q3SubmitBtn = document.getElementById('q3Submit');

  q3TextArea.addEventListener('input', function () {
    const len = this.value.trim().length;
    q3CharCount.textContent = this.value.length;
    if (len > 0) {
      q3SubmitBtn.classList.remove('hidden');
    } else {
      q3SubmitBtn.classList.add('hidden');
    }
  });

  q3SubmitBtn.addEventListener('click', function () {
    q3FreeText = q3TextArea.value.trim();
    if (!q3FreeText) return;

    q3SubmitBtn.innerHTML = '<span class="spinner"></span>';
    q3SubmitBtn.disabled = true;

    submitPoll().then(() => {
      populateThankYou();
      goToStep('5');
      launchConfetti();
      q3SubmitBtn.innerHTML = 'Submit →';
      q3SubmitBtn.disabled = false;
    }).catch(err => {
      console.error('Submit failed:', err);
      populateThankYou();
      goToStep('5');
      launchConfetti();
      q3SubmitBtn.innerHTML = 'Submit →';
      q3SubmitBtn.disabled = false;
    });
  });

  // === Populate Thank You ===
  function populateThankYou() {
    const container = document.getElementById('thankYouDetails');
    container.innerHTML = `
      <div class="thank-you-info">
        <p class="info-name">${escapeHtml(userData.firstName)} ${escapeHtml(userData.lastName)}</p>
        <p class="info-email">${escapeHtml(userData.email)}</p>
      </div>
    `;
  }

  // === Step 5: Thank You + Confetti ===
  function launchConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#07b947', '#01d3a3', '#feb136', '#0099cd', '#162e5a', '#ffffff'];

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';
      piece.style.width = (6 + Math.random() * 8) + 'px';
      piece.style.height = (6 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }

    setTimeout(() => { container.innerHTML = ''; }, 5000);
  }

  // === API Calls ===
  async function fetchResults() {
    const res = await fetch(API_BASE + '/api/results');
    if (!res.ok) throw new Error('Failed to fetch results');
    return res.json();
  }

  async function submitPoll() {
    const payload = {
      name: userData.name,
      email: userData.email,
      company: userData.company || '',
      role_type: demoData.role_type,
      adviser_specialisation: demoData.adviser_specialisation || '',
      gender: demoData.gender,
      age: demoData.age,
      q1_answer: q1Answer,
      q1_other: q1Other,
      q2_answers: q2Answers,
      q2_other: q2Other,
      q3_answer: q3FreeText,
    };

    const res = await fetch(API_BASE + '/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to submit');
    return res.json();
  }

  // === Helpers ===
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

})();
