/* ============================================
   WEALTHPOINT CONFERENCE POLL — MOBILE LOGIC
   ============================================ */

(function () {
  'use strict';

  const API_BASE = '';
  let currentStep = 1;
  let userData = {};
  let q1Answer = null;
  let q1Other = '';
  let q2Answers = [];
  let q2Other = '';
  let q3Answer = null;
  let q3Other = '';
  let resultsData = null;

  // === DOM Refs ===
  const steps = {
    1: document.getElementById('step1'),
    '2': document.getElementById('step2'),
    '2b': document.getElementById('step2b'),
    '3': document.getElementById('step3'),
    '3b': document.getElementById('step3b'),
    '4': document.getElementById('step4'),
    '4b': document.getElementById('step4b'),
    '5': document.getElementById('step5'),
  };

  const progressFill = document.getElementById('progressFill');
  const dots = document.querySelectorAll('.dot');

  // === Step Navigation ===
  const stepOrder = ['1', '2', '2b', '3', '3b', '4', '4b', '5'];
  const progressMap = { '1': 20, '2': 30, '2b': 40, '3': 50, '3b': 60, '4': 70, '4b': 85, '5': 100 };
  const dotMap = { '1': 1, '2': 2, '2b': 2, '3': 3, '3b': 3, '4': 4, '4b': 4, '5': 5 };

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
    userData.name = document.getElementById('userName').value.trim();
    userData.email = document.getElementById('userEmail').value.trim();
    userData.company = document.getElementById('userCompany').value.trim();
    if (!userData.name || !userData.email) return;
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

    // Fetch results and show comparison
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

      // Animate bar
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
        if (q2Answers.length >= 2) return; // Max 2
        this.classList.add('selected');
        q2Answers.push(val);
        if (val === 'Other') {
          q2OtherWrap.classList.remove('hidden');
          document.getElementById('q2Other').focus();
        }
      }

      // Disable unselected if at max
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

  // === Step 4: Q3 Single Choice ===
  const q3Buttons = document.querySelectorAll('#q3Options .option-btn');
  const q3SubmitBtn = document.getElementById('q3Submit');
  const q3OtherWrap = document.getElementById('q3OtherWrap');

  q3Buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      q3Buttons.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      q3Answer = this.dataset.value;

      if (q3Answer === 'Other') {
        q3OtherWrap.classList.remove('hidden');
        document.getElementById('q3Other').focus();
      } else {
        q3OtherWrap.classList.add('hidden');
      }

      q3SubmitBtn.classList.remove('hidden');
    });
  });

  q3SubmitBtn.addEventListener('click', function () {
    if (!q3Answer) return;
    q3Other = document.getElementById('q3Other').value.trim();

    q3SubmitBtn.innerHTML = '<span class="spinner"></span>';
    q3SubmitBtn.disabled = true;

    // Submit entire poll
    submitPoll().then(data => {
      // Show Q3 results
      renderQ3Chart(data);
      goToStep('4b');
      q3SubmitBtn.innerHTML = 'Submit →';
      q3SubmitBtn.disabled = false;
    }).catch(err => {
      console.error('Submit failed:', err);
      // Still try to advance
      goToStep('4b');
      q3SubmitBtn.innerHTML = 'Submit →';
      q3SubmitBtn.disabled = false;
    });
  });

  // === Q3 Results Chart ===
  function renderQ3Chart(data) {
    const container = document.getElementById('q3Chart');
    container.innerHTML = '';
    const q3 = data.q3 || {};
    const total = Object.values(q3).reduce((a, b) => a + b, 0) || 1;
    const options = [
      'Compliance Guidance',
      'Business Development Tools',
      'Training & Development',
      'Recruitment Support',
      'Peer Networks & Mentoring',
      'Other'
    ];

    options.forEach(opt => {
      const count = q3[opt] || 0;
      const pct = Math.round((count / total) * 100);
      const isYours = (opt === q3Answer);

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

      // Animate bar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.chart-bar-fill').style.width = Math.max(pct, 2) + '%';
        });
      });
    });
  }

  document.getElementById('q3ResponsesNext').addEventListener('click', function () {
    goToStep('5');
    launchConfetti();
  });

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
      q1_answer: q1Answer,
      q1_other: q1Other,
      q2_answers: q2Answers,
      q2_other: q2Other,
      q3_answer: q3Answer,
      q3_other: q3Other,
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

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

})();
