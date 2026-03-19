/* ============================================
   WEALTHPOINT CONFERENCE POLL — TV DISPLAY
   ============================================ */

(function () {
  'use strict';

  const API_BASE = '';
  const SLIDE_DURATION = 10000; // 10 seconds per slide
  const REFRESH_INTERVAL = 30000; // 30 seconds
  const SLIDES = ['slideQ1', 'slideQ2', 'slideQ3'];

  let currentSlide = 0;
  let data = null;
  let slideTimer = null;
  let previousTotal = 0;

  // === Init ===
  async function init() {
    await refreshData();
    showSlide(0);
    startCycling();
    setInterval(refreshData, REFRESH_INTERVAL);
  }

  // === Fetch Data ===
  async function refreshData() {
    try {
      const res = await fetch(API_BASE + '/api/results');
      if (!res.ok) throw new Error('fetch failed');
      data = await res.json();
      updateCounter(data.totalResponses || 0);
      updateCurrentSlide();
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }

  // === Counter Animation ===
  function updateCounter(newTotal) {
    const el = document.getElementById('totalCount');
    if (newTotal === previousTotal) return;

    const start = previousTotal;
    const end = newTotal;
    const duration = 1500;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    previousTotal = newTotal;
  }

  // === Slide Cycling ===
  function startCycling() {
    slideTimer = setInterval(() => {
      currentSlide = (currentSlide + 1) % SLIDES.length;
      showSlide(currentSlide);
    }, SLIDE_DURATION);
  }

  function showSlide(index) {
    SLIDES.forEach((id, i) => {
      const el = document.getElementById(id);
      if (i === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    restartTimer();
    updateCurrentSlide();
  }

  function restartTimer() {
    const prog = document.querySelector('.timer-ring-progress');
    if (!prog) return;
    const parent = prog.parentNode;
    const clone = prog.cloneNode(true);
    clone.classList.remove('animating');
    parent.replaceChild(clone, prog);
    void clone.getBoundingClientRect();
    clone.classList.add('animating');
  }

  function updateCurrentSlide() {
    if (!data) return;
    const slideId = SLIDES[currentSlide];

    if (slideId === 'slideQ1') renderDisplayQ1(data);
    else if (slideId === 'slideQ2') renderDisplayQ2(data);
    else if (slideId === 'slideQ3') renderDisplayQ3(data);
  }

  // === Q1 Bar Chart ===
  function renderDisplayQ1(data) {
    const container = document.getElementById('displayQ1Chart');
    const q1 = data.q1 || {};
    const options = [
      'Regulation & Compliance',
      'Client Growth',
      'Tech & Automation',
      'Recruitment & Development',
      'Other'
    ];
    const total = Object.values(q1).reduce((a, b) => a + b, 0) || 1;

    const signature = JSON.stringify(q1);
    if (container.dataset.sig === signature) return;
    container.dataset.sig = signature;
    container.innerHTML = '';

    options.forEach((opt, i) => {
      const count = q1[opt] || 0;
      const pct = Math.round((count / total) * 100);

      const row = document.createElement('div');
      row.className = 'display-chart-row';
      row.innerHTML = `
        <div class="display-chart-label">${opt}</div>
        <div class="display-bar-track">
          <div class="display-bar-fill" style="width: 0%"></div>
        </div>
        <span class="display-bar-value">${pct}%</span>
      `;
      container.appendChild(row);

      setTimeout(() => {
        requestAnimationFrame(() => {
          row.querySelector('.display-bar-fill').style.width = Math.max(pct, 3) + '%';
        });
      }, 150 * i);
    });
  }

  // === Q2 Bar Chart ===
  function renderDisplayQ2(data) {
    const container = document.getElementById('displayQ2Chart');
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

    const signature = JSON.stringify(q2);
    if (container.dataset.sig === signature) return;
    container.dataset.sig = signature;
    container.innerHTML = '';

    options.forEach((opt, i) => {
      const count = q2[opt] || 0;
      const pct = Math.round((count / totalRespondents) * 100);

      const row = document.createElement('div');
      row.className = 'display-chart-row';
      row.innerHTML = `
        <div class="display-chart-label">${opt}</div>
        <div class="display-bar-track">
          <div class="display-bar-fill" style="width: 0%"></div>
        </div>
        <span class="display-bar-value">${pct}%</span>
      `;
      container.appendChild(row);

      setTimeout(() => {
        requestAnimationFrame(() => {
          row.querySelector('.display-bar-fill').style.width = Math.max(pct, 3) + '%';
        });
      }, 150 * i);
    });
  }

  // === Q3 Free Text Responses ===
  function renderDisplayQ3(data) {
    const container = document.getElementById('displayQ3Responses');
    const responses = data.q3_responses || [];

    const signature = JSON.stringify(responses);
    if (container.dataset.sig === signature) return;
    container.dataset.sig = signature;
    container.innerHTML = '';

    if (responses.length === 0) {
      container.innerHTML = '<p style="text-align:center; font-size: clamp(18px, 2vw, 28px); color: rgba(255,255,255,0.5);">Waiting for responses...</p>';
      return;
    }

    // Show up to 5 most recent responses
    const toShow = responses.slice(0, 5);
    toShow.forEach(resp => {
      const card = document.createElement('div');
      card.className = 'response-card';
      card.innerHTML = `<span class="response-text">${escapeHtml(resp.text)}</span>`;
      container.appendChild(card);
    });
  }

  // === Helpers ===
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // === Boot ===
  document.addEventListener('DOMContentLoaded', init);

})();
