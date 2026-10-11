const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// Укажи здесь HTTPS-адрес твоего бэкенда на Raven Host
const API_BASE = "https://tex.ravenhost.space:19278/api/v1"; 

const $ = (selector) => document.querySelector(selector); const $$ = (selector) => [...document.querySelectorAll(selector)];

let state = {
  balance: 0,
  user: tg?.initDataUnsafe?.user || { id: 12345, first_name: "Тест" },
  audioPlaying: false,
  audio: null
};

function showToast(message) {
  let toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

async function fetchUserData() {
  try {
    const res = await fetch(`${API_BASE}/user`, {
      headers: { "init-data": tg?.initData || "" }
    });
    if (res.ok) {
      const data = await res.json();
      state.balance = data.balance;
      $('#balanceValue').textContent = state.balance.toLocaleString('ru-RU');     }   } catch (e) {     console.log("API connection error");   } }  function setActiveTab(tab) {   $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function showGames() {
  $('#gamesSection').classList.remove('hidden');
  $('#subPage').classList.add('hidden');
  setActiveTab('games');
}

async function showTop() {
  $('#gamesSection').classList.add('hidden');
  $('#subPage').classList.remove('hidden');
  setActiveTab('top');

  let leadersHtml = '<p>Загрузка...</p>';
  let hallHtml = '<p>Загрузка...</p>';

  try {
    const [resL, resH] = await Promise.all([
      fetch(`${API_BASE}/leaderboard`),
      fetch(`${API_BASE}/halloffame`)
    ]);
    if (resL.ok) {
      const data = await resL.json();
      leadersHtml = data.map((item, idx) => `
        <div class="mini-row"><span class="rank-num">#${idx+1}</span><span class="rank-name">${item.name}</span><span class="rank-score">${item.balance} ★</span></div>
      `).join('');
    }
    if (resH.ok) {
      const data = await resH.json();
      hallHtml = data.map((item) => `
        <div class="mini-row"><span class="rank-num">⭐</span><span class="rank-name">${item.name}</span></div>
      `).join('');
    }
  } catch (e) {}

  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <h2>🏆 Топ-10 игроков</h2>
      <div class="mini-list">${leadersHtml}</div>
      <h2 style="margin-top:20px;">⭐ Hall of Fame</h2>
      <div class="mini-list">${hallHtml}</div>
    </div>`;
}

function showProfile() {
  $('#gamesSection').classList.add('hidden');
  $('#subPage').classList.remove('hidden');
  setActiveTab('profile');

  const u = state.user;
  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <h2>👤 Профиль</h2>
      <p><b>Имя:</b> ${u.first_name || 'Игрок'}</p>
      <p><b>Telegram ID:</b> <code>${u.id}</code></p>
      <p><b>Баланс:</b> ${state.balance} очков</p>
      <button class="primary-btn" onclick="navigator.clipboard.writeText('${u.id}'); showToast('ID скопирован!')">Скопировать мой ID</button>
    </div>`;
}

async function startMinesGame() {
  const bet = parseInt($('#minesBet').value) || 10;
  const minesCount = parseInt($('#minesCount').value) || 3;

  try {
    const res = await fetch(`${API_BASE}/mines/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", bet, mines_count: minesCount })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.detail || "Ошибка запуска");
      return;
    }
    state.balance = data.balance;
    $('#balanceValue').textContent = state.balance;
    renderMinesBoard(data.game_id);
  } catch (e) {
    showToast("Ошибка соединения");
  }
}

function renderMinesBoard(gameId) {
  let cellsHtml = '';
  for (let i = 0; i < 25; i++) {
    cellsHtml += `<button class="mine-cell" data-idx="${i}" onclick="openMineCell('${gameId}', ${i})">❓</button>`;
  }
  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <h2>💣 Мины</h2>
      <div id="multiplierDisplay" style="font-size:14px; color:var(--green); margin-bottom:10px;">Множитель: x1.0</div>
      <div class="mines-grid">${cellsHtml}</div>
      <button class="primary-btn" id="claimBtn" onclick="claimMines('${gameId}')" style="background:var(--green); color:#000; display:none;">Забрать выигрыш</button>
      <button class="back-btn" onclick="showGames()" style="margin-top:10px; width:100%;">Выйти</button>
    </div>`;
}

window.openMineCell = async function(gameId, cellIdx) {
  try {
    const res = await fetch(`${API_BASE}/mines/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", game_id: gameId, cell_index: cellIdx })
    });
    const data = await res.json();
    const btn = document.querySelector(`[data-idx="${cellIdx}"]`);
    
    if (data.status === "boom") {
      btn.classList.add("boom");
      btn.textContent = "💥";
      showToast("Вы подорвались!");
      setTimeout(showGames, 2000);
    } else if (data.status === "safe") {
      btn.classList.add("safe", "opened");
      btn.textContent = "💎";
      btn.disabled = true;
      $('#multiplierDisplay').textContent = `Множитель: x${data.multiplier}`;
      $('#claimBtn').style.display = "block";
    }
  } catch (e) {
    showToast("Ошибка запроса");
  }
};

window.claimMines = async function(gameId) {
  try {
    const res = await fetch(`${API_BASE}/mines/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", game_id: gameId })
    });
    const data = await res.json();
    if (res.ok) {
      state.balance = data.balance;
      $('#balanceValue').textContent = state.balance;
      showToast(`Выигрыш забран: +${data.win}!`);
      showGames();
    }
  } catch (e) {
    showToast("Ошибка");
  }
};

function showGame(page) {
  if (page === 'mines') {
    $('#subPageContent').innerHTML = `
      <div class="sub-card">
        <h2>💣 Мины</h2>
        <div style="margin:15px 0;">
          <label style="font-size:11px;">Ставка:</label>
          <input type="number" id="minesBet" value="10" style="width:100%; padding:8px; background:#07080d; border:1px solid var(--line); color:#fff; border-radius:8px;">
        </div>
        <div style="margin:15px 0;">
          <label style="font-size:11px;">Сложность:</label>
          <select id="minesCount" style="width:100%; padding:8px; background:#07080d; border:1px solid var(--line); color:#fff; border-radius:8px;">
            <option value="3">Easy (3 мины)</option>
            <option value="6">Medium (6 мин)</option>
            <option value="10">Hardcore (10 мин)</option>
          </select>
        </div>
        <button class="primary-btn" onclick="startMinesGame()">Начать игру</button>
      </div>`;
  } else {
    $('#subPageContent').innerHTML = `
      <div class="sub-card">
        <h2>Скоро</h2>
        <p>Этот раздел находится в разработке.</p>
      </div>`;
  }
  $('#gamesSection').classList.add('hidden');
  $('#subPage').classList.remove('hidden');
}

$('#topUpBtn').addEventListener('click', () => {
  const uId = state.user?.id || "ID";
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>💎 Пополнение</h3>
      <p style="font-size:11px; line-height:1.5; margin:10px 0;">
        Отправьте подарок аккаунту <b>@DurovX4</b> и укажите свой Telegram ID: <code>${uId}</code> для ручного зачисления.
      </p>
      <button class="primary-btn" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
    </div>`;
  document.body.appendChild(modal);
});

$('#soundBtn').addEventListener('click', async () => {
  if (!state.audio) {
    try {
      const res = await fetch(`${API_BASE}/music`);
      const data = await res.json();
      if (data.music_url) {
        state.audio = new Audio(data.music_url);
        state.audio.loop = true;
      }
    } catch (e) {}
  }
  if (state.audio) {
    if (state.audioPlaying) {
      state.audio.pause();
      state.audioPlaying = false;
      showToast('Музыка выключена');
    } else {
      state.audio.play().then(() => {
        state.audioPlaying = true;
        showToast('Музыка играет');
      }).catch(() => showToast('Ошибка автовоспроизведения'));
    }
  } else {
    showToast('Трек не настроен');
  }
});

$$('.nav-item').forEach(item => {   item.addEventListener('click', () => {     const tab = item.dataset.tab;     if (tab === 'games') showGames();     if (tab === 'top') showTop();     if (tab === 'profile') showProfile();   }); });  $$
('[data-page]').forEach(card => {
  card.addEventListener('click', () => showGame(card.dataset.page));
});

$('#backBtn').addEventListener('click', showGames);
fetchUserData();