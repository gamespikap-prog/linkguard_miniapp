const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const API_BASE = "https://tex.ravenhost.space:19278/api/v1"; 

const $ = (selector) => document.querySelector(selector); const $$ = (selector) => [...document.querySelectorAll(selector)];

let state = {
  balance: 0,
  lunaBalance: 150, // Непополняемая валюта (награды из игр)
  user: tg?.initDataUnsafe?.user || { id: 12345, first_name: "Тест" },
  isAdmin: false,
  isPremium: false,
  audioPlaying: false,
  audio: null
};

function showToast(msg) {
  let toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
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
      state.isAdmin = data.is_admin;
      state.isPremium = data.is_premium;
      $('#starBalance').textContent = state.balance.toLocaleString('ru-RU');
      $('#lunaBalance').textContent = state.lunaBalance.toLocaleString('ru-RU');              if (state.isPremium) {         document.body.classList.add('is-premium-user');       }     }   } catch (e) {} }  function setActiveTab(tab) {   $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function showGames() {
  $('#gamesSection').classList.remove('hidden');
  $('#subPage').classList.add('hidden');
  setActiveTab('games');
}

// Главная страница с двумя видами валюты и лентой LIVE
function renderHomeContent() {
  $('#gamesSection').innerHTML = `
    <div class="balance-container">
      <div class="balance-pill">🌕 <span id="lunaBalance">${state.lunaBalance}</span></div>
      <div class="balance-pill stars">⭐ <span id="starBalance">${state.balance}</span> <div class="plus-btn" id="topUpBtn">+</div></div>
    </div>

    <div class="live-strip-wrap">
      <div class="live-label"><span class="live-pulse"></span> LIVE ВЫИГРЫ</div>
      <div class="live-strip">
        <div class="live-item">🎁 Игрок Maksim забрал кейс</div>
        <div class="live-item">💣 Игрок Alex выиграл в минах x2.5</div>
        <div class="live-item">🏆 Игрок Dima поднялся в TOP-10</div>
      </div>
    </div>

    <div class="section-head"><h2>Игры</h2></div>
    <div class="featured-games">
      <button class="featured-card daily" data-page="daily">
        <div class="featured-icon">🎁</div>
        <div class="featured-info"><h3>Бесплатный кейс</h3><p>Один раз в день</p></div>
        <span class="card-arrow">›</span>
      </button>
      <button class="featured-card mines" data-page="mines">
        <div class="featured-icon">💣</div>
        <div class="featured-info"><h3>Мины</h3><p>Угадайте верную ячейку</p></div>
        <span class="card-arrow">›</span>
      </button>
    </div>`;

  $('#topUpBtn').addEventListener('click', openTopUpModal);   $$('[data-page]').forEach(card => card.addEventListener('click', () => showGame(card.dataset.page)));
}

// Модальное окно пополнения с кликабельным юзернеймом и ID
function openTopUpModal() {
  const uId = state.user?.id || "123456";
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>💎 Пополнение баланса</h3>
      <p style="font-size:11px; line-height:1.6; margin:12px 0; color:var(--muted);">
        Чтобы пополнить баланс звёзд, отправьте подарок любой стоимости аккаунту <a href="https://t.me/DurovX4" target="_blank" style="color:var(--blue); font-weight:bold; text-decoration:underline;">@DurovX4</a>.<br><br>
        Ваш Telegram ID для указания администратору:<br>
        <code style="background:#07080d; padding:4px 8px; border-radius:6px; color:#fff; font-size:13px;" id="copyIdText">${uId}</code>
      </p>
      <button class="primary-btn" onclick="navigator.clipboard.writeText('${uId}'); showToast('ID скопирован!')" style="margin-bottom:8px;">Скопировать ID</button>
      <button class="back-btn" onclick="this.closest('.modal-overlay').remove()" style="width:100%;">Закрыть</button>
    </div>`;
  document.body.appendChild(modal);
}

// РЕЙТИНГ с TOP-10 и кнопкой Доп
async function showTop() {
  $('#gamesSection').classList.add('hidden');
  $('#subPage').classList.remove('hidden');
  setActiveTab('top');

  let leadersHtml = '<p>Загрузка...</p>';
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (res.ok) {
      const data = await res.json();
      leadersHtml = data.map((item, idx) => `
        <div class="mini-row ${item.is_premium ? 'is-premium-user' : ''}">
          <span style="font-weight:900; width:20px;">#${idx+1}</span>
          <span style="flex:1;">${item.name} ${item.is_premium ? '👑' : ''}</span>
          <span style="color:var(--gold); font-weight:800;">${item.balance} ⭐</span>
        </div>
      `).join('');
    }
  } catch (e) {}

  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <h2>🏆 Топ-10 игроков</h2>
      <p style="font-size:11px; color:var(--muted); margin-bottom:12px;">Каждый месяц TOP-10 игроков гарантированно получают по 100 звезд ⭐!</p>
      <div class="mini-list">${leadersHtml}</div>
      <button class="primary-btn" onclick="alert('За очень высокую активность вы можете получить дополнительно от меня от 50-200 звезд!')" style="background:#222a40; margin-top:15px;">🎁 Доп. награды за активность</button>
    </div>`;
}

// ПРОФИЛЬ
function showProfile() {
  $('#gamesSection').classList.add('hidden');
  $('#subPage').classList.remove('hidden');
  setActiveTab('profile');

  const u = state.user;
  $('#subPageContent').innerHTML = `
    <div class="sub-card ${state.isPremium ? 'is-premium-user' : ''}">
      <h2>👤 Профиль ${state.isPremium ? '👑 Премиум' : ''}</h2>
      <p><b>Имя:</b> ${u.first_name || 'Игрок'}</p>
      <p><b>ID:</b> <code>${u.id}</code></p>
      <p><b>Баланс звезд:</b> ${state.balance} ⭐</p>
      <p><b>Баланс лун:</b> ${state.lunaBalance} 🌕</p>
      <h3 style="margin-top:20px; font-size:14px;">🎒 Инвентарь и награды</h3>
      <p style="font-size:11px; color:var(--muted);">Здесь будут отображаться ваши выигранные кейсы и призы.</p>
    </div>`;
}

// ИГРА МИНЫ (Без ставок, с выбором сетки как на фото)
function showGame(page) {
  if (page === 'mines') {
    $('#subPageContent').innerHTML = `
      <div class="sub-card">
        <button class="back-btn" onclick="showGames()">‹ Игры</button>
        <h2>💣 Мины</h2>
        <p style="font-size:11px; color:var(--muted);">Выберите размер игрового поля:</p>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin:15px 0;">
          <button class="primary-btn" onclick="startMinesSession(3, 2)" style="margin:0; background:#1c2130;">3x3</button>
          <button class="primary-btn" onclick="startMinesSession(5, 4)" style="margin:0; background:#795cff;">5x5</button>
          <button class="primary-btn" onclick="startMinesSession(7, 8)" style="margin:0; background:#1c2130;">7x7</button>
        </div>
      </div>`;
    $('#gamesSection').classList.add('hidden');
    $('#subPage').classList.remove('hidden');
  }
}

async function startMinesSession(gridSize, minesCount) {
  try {
    const res = await fetch(`${API_BASE}/mines/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", grid_size: gridSize, mines_count: minesCount })
    });
    const data = await res.json();
    if (res.ok) {
      renderMinesBoard(data.game_id, gridSize);
    }
  } catch (e) {
    showToast("Ошибка запуска");
  }
}

function renderMinesBoard(gameId, gridSize) {
  let cellsHtml = '';
  let gridClass = gridSize === 3 ? 'mines-grid-3' : gridSize === 7 ? 'mines-grid-7' : 'mines-grid-5';
  let totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    cellsHtml += `<button class="mine-cell" data-idx="${i}" onclick="openMineCell('${gameId}', ${i})">?</button>`;
  }

  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <button class="back-btn" onclick="showGames()">‹ Назад</button>
      <h2>💣 Мины</h2>
      <div id="multiplierDisplay" style="font-size:13px; color:var(--green); margin-bottom:8px;">Множитель: x1.0</div>
      <div class="${gridClass}">${cellsHtml}</div>
      <button class="primary-btn" id="claimBtn" onclick="claimMines('${gameId}')" style="background:var(--green); color:#000; display:none;">Забрать выигрыш</button>
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
      showToast("Вы подорвались на мине!");
      setTimeout(showGames, 1500);
    } else if (data.status === "safe") {
      btn.classList.add("safe", "opened");
      btn.textContent = "👑";
      btn.disabled = true;
      $('#multiplierDisplay').textContent = `Множитель: x${data.multiplier}`;
      $('#claimBtn').style.display = "block";
    }
  } catch (e) {
    showToast("Ошибка");
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
      $('#starBalance').textContent = state.balance;
      showToast(`Выигрыш забран!`);
      showGames();
    }
  } catch (e) {}
};

// АДМИН-ПАНЕЛЬ И УПРАВЛЕНИЕ МУЗЫКОЙ В КНОПКЕ ЗВУКА
$('#soundBtn').addEventListener('click', async () => {
  if (state.isAdmin) {
    openAdminModal();
    return;
  }

  // Обычный плеер музыки для пользователей
  if (!state.audio) {
    try {
      const res = await fetch(`${API_BASE}/music`);
      const data = await res.json();
      if (data.url) {
        state.audio = new Audio(data.url);
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
      }).catch(() => showToast('Ошибка воспроизведения'));
    }
  } else {
    showToast('Трек не настроен');
  }
});

function openAdminModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>🛠 Админ-панель</h3>
      <div style="margin:10px 0; text-align:left;">
        <label style="font-size:10px;">ID пользователя:</label>
        <input type="number" id="admUserId" style="width:100%; padding:6px; background:#07080d; border:1px solid var(--line); color:#fff; border-radius:6px; margin-bottom:8px;">
        <label style="font-size:10px;">Сумма звезд / Дни премиума:</label>
        <input type="number" id="admAmount" style="width:100%; padding:6px; background:#07080d; border:1px solid var(--line); color:#fff; border-radius:6px; margin-bottom:10px;">
        <button class="primary-btn" onclick="executeAdminAction('balance')">Начислить звезды</button>
        <button class="primary-btn" onclick="executeAdminAction('premium')" style="background:var(--gold); color:#000;">Выдать Premium</button>
        <button class="primary-btn" onclick="executeAdminAction('unpremium')" style="background:var(--red);">Снять Premium</button>
      </div>
      <button class="back-btn" onclick="this.closest('.modal-overlay').remove()" style="width:100%; margin-top:10px;">Закрыть</button>
    </div>`;
  document.body.appendChild(modal);
}

window.executeAdminAction = async function(type) {
  const targetId = parseInt($('#admUserId').value);
  const amount = parseInt($('#admAmount').value) || 0;
  if (!targetId) {
    showToast("Введите ID!");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/admin/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", target_id: targetId, amount: amount, days: amount, action_type: type })
    });
    if (res.ok) {
      showToast("Успешно выполнено!");
      document.querySelector('.modal-overlay').remove();
    }
  } catch (e) {
    showToast("Ошибка админки");
  }
};

$$('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    if (tab === 'games') { showGames(); renderHomeContent(); }
    if (tab === 'top') showTop();
    if (tab === 'profile') showProfile();
  });
});

fetchUserData().then(() => renderHomeContent());