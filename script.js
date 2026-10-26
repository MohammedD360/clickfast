const API_URL = window.API_URL || 'http://localhost:3000';
const DURATION_MS = 5000;

const timerEl       = document.getElementById('timer');
const scoreEl       = document.getElementById('score');
const clickBtn      = document.getElementById('click-button');
const startBtn      = document.getElementById('start-button');
const usernameInput = document.getElementById('username');
const leaderboardEl = document.getElementById('leaderboard-list');

let score = 0, running = false, startTime = 0, rafId = null, timeoutId = null;

function tick() {
  const remaining = Math.max(0, DURATION_MS - (performance.now() - startTime));
  timerEl.textContent = (remaining / 1000).toFixed(1) + 's';
  if (remaining > 0) rafId = requestAnimationFrame(tick);
}

function startGame() {
  score = 0; scoreEl.textContent = '0'; timerEl.textContent = '5.0s';
  startTime = performance.now(); running = true;
  clickBtn.disabled = false; clickBtn.textContent = 'CLIQUE !';
  startBtn.disabled = true; usernameInput.disabled = true;
  rafId = requestAnimationFrame(tick);
  timeoutId = setTimeout(endGame, DURATION_MS);
}

function endGame() {
  running = false; clickBtn.disabled = true; clickBtn.textContent = 'Terminé';
  startBtn.disabled = false; startBtn.textContent = 'Rejouer';
  usernameInput.disabled = false; timerEl.textContent = '0.0s';
  if (rafId) cancelAnimationFrame(rafId);
  if (timeoutId) clearTimeout(timeoutId);
  submitScore();
}

function onClick() { if (!running) return; score += 1; scoreEl.textContent = score; }
clickBtn.addEventListener('click', onClick);
startBtn.addEventListener('click', startGame);

async function submitScore() {
  const username = (usernameInput.value || 'Anonyme').trim().slice(0, 20) || 'Anonyme';
  try {
    const res = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
  } catch (err) { console.warn('Envoi du score impossible :', err.message); }
  loadLeaderboard();
}

async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_URL}/scores`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    renderLeaderboard(data);
  } catch (err) { console.warn('Chargement du classement impossible :', err.message); }
}

function renderLeaderboard(scores) {
  leaderboardEl.innerHTML = '';
  if (!Array.isArray(scores) || scores.length === 0) {
    leaderboardEl.innerHTML = '<li class="empty">Aucun score pour le moment</li>';
    return;
  }
  scores.slice(0, 10).forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="rank">#${i + 1}</span>` +
      `<span class="name">${escapeHtml(s.username)}</span>` +
      `<span class="pts">${s.score}</span>`;
    leaderboardEl.appendChild(li);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

loadLeaderboard();
