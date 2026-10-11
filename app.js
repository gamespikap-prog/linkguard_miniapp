const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const API_BASE = "https://tex.ravenhost.space:19278/api/v1"; 

const $ = (selector) => document.querySelector(selector); const $$ = (selector) => [...document.querySelectorAll(selector)];

let state = {
  balance: 0,
  user: tg?.initDataUnsafe?.user || { id: 6591727196, first_name: "Админ" },
  isAdmin: false,
  isPremium: false,
  attemptsLeft: 50
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
      state.attemptsLeft = data.attempts_left;
      
      if (state.isAdmin) {
        $('#adminBtn').classList.remove('hidden');       }     }   } catch (e) {} }  function setActiveTab(tab) {   $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function showGames() {
  $('#gamesSection').classList.remove('hidden');
  $('#subPage').classList.add('hidden');
  setActiveTab('games');
}

function renderHomeContent() {
  $('#gamesSection').innerHTML = `
    <div class="balance-container">
      <div class="balance-pill">🌕 <span id="lunaBalance">${state.balance}</span></div>
      <div class="balance-pill stars">⭐ <span>0</span> <div class="plus-btn" id="topUpBtn">+</div></div>
    </div>

    <div class="live-strip-wrap">
      <div class="live-label"><span class="live-pulse"></span> LIVE ВЫИГРЫШИ</div>
      <div class="live-strip" id="liveStrip">
        <span style="font-size:10px; color:var(--muted);">Ожидание первых побед сезона...</span>
      </div>
    </div>

    <div class="featured-games">
      <button class="featured-card daily" data-page="daily">
        <div class="featured-icon">🎁</div>
        <div class="featured-info"><h3>Бесплатный кейс</h3><p>Один раз в день (В разработке)</p></div>
        <span class="card-arrow">›</span>
      </button>

      <button class="featured-card cases" data-page="cases">
        <div class="featured-icon">📦</div>
        <div class="featured-info"><h3>Кейсы</h3><p>Редкие награды (В разработке)</p></div>
        <span class="card-arrow">›</span>
      </button>

      <button class="featured-card mines" data-page="mines">
        <div class="featured-icon">💣</div>
        <div class="featured-info"><h3>Мины</h3><p>Попыток на сегодня: <b>${state.attemptsLeft}</b></p></div>
        <span class="card-arrow">›</span>
      </button>

      <button class="featured-card duel" data-page="duel">
        <div class="featured-icon">⚔️</div>
        <div class="featured-info"><h3>PvP Дуэль</h3><p>Сражение (В разработке)</p></div>
        <span class="card-arrow">›</span>
      </button>
    </div>`;

  $('#topUpBtn').addEventListener('click', openTopUpModal);   $$('[data-page]').forEach(card => card.addEventListener('click', () => showGame(card.dataset.page)));
}

function openTopUpModal() {
  const uId = state.user?.id || "6591727196";
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>💎 Пополнение баланса</h3>
      <p style="font-size:11px; line-height:1.6; margin:12px 0; color:var(--muted);">
        Отправьте подарок любой стоимости аккаунту <a href="https://t.me/DurovX4" target="_blank" style="color:var(--blue); font-weight:bold;">@DurovX4</a>.<br><br>
        Укажите ваш Telegram ID:<br>
        <code style="background:#07080d; padding:4px 8px; border-radius:6px; color:#fff; font-size:13px;">${uId}</code>
      </p>
      <button class="primary-btn" onclick="navigator.clipboard.writeText('${uId}'); showToast('ID скопирован!')">Скопировать ID</button>
      <button class="back-btn" onclick="this.closest('.modal-overlay').remove()" style="width:100%; margin-top:8px;">Закрыть</button>
    </div>`;
  document.body.appendChild(modal);
}

// ТАЙМЕР СЕЗОНА И ТОП-10
function startSeasonTimer() {
  setInterval(() => {
    const el = $('#seasonTimer');
    if (!el) return;
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    el.textContent = `${d}д ${h}ч ${m}м ${s}с`;
  }, 1000);
}

async function showTop() {
  $('#gamesSection').classList.add('hidden');
  $('#subPage').classList.remove('hidden');
  setActiveTab('top');

  let leadersHtml = '';
  try {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      headers: { "init-data": tg?.initData || "" }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.length === 0) {
        leadersHtml = '<p style="font-size:11px; color:var(--muted); text-align:center;">Места пока пусты. Будьте первым!</p>';
      } else {
        leadersHtml = data.map((item, idx) => `
          <div class="mini-row">
            <span style="font-weight:900; width:20px;">#${idx+1}</span>
            <span style="flex:1;">${item.name} ${item.is_premium ? '👑' : ''} ${item.user_id ? `<small>(${item.user_id})</small>` : ''}</span>
            <span style="color:var(--gold); font-weight:800;">${item.balance} 🌕</span>
          </div>
        `).join('');
      }
    }
  } catch (e) {}

  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <h2>🏆 Топ-10 игроков</h2>
      <div style="background:#07080d; padding:10px; border-radius:12px; margin-bottom:12px; text-align:center;">
        <span style="font-size:10px; color:var(--muted); display:block;">До окончания сезона:</span>
        <strong id="seasonTimer" style="color:var(--green); font-size:16px;">Загрузка...</strong>
      </div>
      <p style="font-size:11px; color:var(--muted); margin-bottom:12px;">Топ-10 игроков получают по 100 звезд ⭐ в конце месяца!</p>
      <div class="mini-list">${leadersHtml}</div>
      <button class="primary-btn" onclick="alert('За очень высокую активность вы можете получить дополнительно от 50 до 200 звезд!')" style="background:#1c2130; margin-top:10px;">🎁 Доп. награды за активность</button>
    </div>`;

  startSeasonTimer();
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
      <p><b>ID:</b> <code>${u.id}</code></p>
      <p><b>Баланс Лун:</b> ${state.balance} 🌕</p>
      <button class="primary-btn" onclick="showToast('Модуль покупки Премиум в разработке!')" style="background:linear-gradient(135deg, #ffd95e, #b89114); color:#000;">👑 Купить PREMIUM</button>
    </div>`;
}

// ИГРА МИНЫ
function showGame(page) {
  if (page === 'mines') {
    $('#subPageContent').innerHTML = `
      <div class="sub-card">
        <button class="back-btn" onclick="showGames()">‹ Игры</button>
        <h2>💣 Мины</h2>
        <p style="font-size:11px; color:var(--muted);">Выберите сложность:</p>
        <div style="display:grid; gap:8px; margin:15px 0;">
          <button class="primary-btn" onclick="startMinesSession('easy')" style="background:#28a745; margin:0;">🟢 Easy (3 мины)</button>
          <button class="primary-btn" onclick="startMinesSession('medium')" style="background:#ffc107; color:#000; margin:0;">🟡 Medium (6 мин)</button>
          <button class="primary-btn" onclick="startMinesSession('hardcore')" style="background:#dc3545; margin:0;">🔴 Hardcore (10 мин)</button>
        </div>
        <button class="back-btn" onclick="alert('Дроп: 🛡 Щит (7%), 🔍 Сканер (4%), 🧸 Мишка (1.5%), 🌹 Роза (0.7%)')" style="width:100%;">🎁 Возможные награды</button>
      </div>`;
    $('#gamesSection').classList.add('hidden');
    $('#subPage').classList.remove('hidden');
  } else {
    showToast('Модуль в разработке 🚀');
  }
}

async function startMinesSession(diff) {
  try {
    const res = await fetch(`${API_BASE}/mines/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", difficulty: diff })
    });
    const data = await res.json();
    if (res.ok) {
      state.attemptsLeft = data.attempts_left;
      renderMinesBoard(data.game_id);
    } else {
      showToast(data.detail);
    }
  } catch (e) {
    showToast("Ошибка запуска");
  }
}

function renderMinesBoard(gameId) {
  let cellsHtml = '';
  for (let i = 0; i < 25; i++) {
    cellsHtml += `<button class="mine-cell" data-idx="${i}" onclick="openMineCell('${gameId}', ${i})">?</button>`;
  }

  $('#subPageContent').innerHTML = `
    <div class="sub-card">
      <button class="back-btn" onclick="showGames()">‹ Меню</button>
      <h2>💣 Мины</h2>
      <div id="bankDisplay" style="font-size:14px; color:var(--green); margin-bottom:8px;">Накоплено: 0 🌕</div>
      <div class="mines-grid-5">${cellsHtml}</div>
      <button class="primary-btn" id="claimBtn" onclick="claimMines('${gameId}')" style="background:var(--green); color:#000; display:none;">Забрать выигрыш (Cash Out)</button>
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
      showToast("Вы подорвались! Банк сгорел.");
      setTimeout(showGames, 1500);
    } else if (data.status === "safe") {
      btn.classList.add("safe", "opened");
      btn.textContent = "👑";
      btn.disabled = true;
      $('#bankDisplay').textContent = `Накоплено: ${data.total_bank} 🌕`;
      $('#claimBtn').style.display = "block";
      if (data.drop) showToast(data.drop);
    } else if (data.status === "shield_saved") {
      showToast(data.message);
    }
  } catch (e) {
    showToast("Ошибка или задержка 2 сек!");
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
      showToast(`Выиграно +${data.win} 🌕!`);
      showGames();
      renderHomeContent();
    }
  } catch (e) {}
};

// АДМИНКА ДЛЯ ID 6591727196 (⚙️)
$('#adminBtn').addEventListener('click', () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <h3>⚙️ Админ-панель</h3>
      <div style="margin:10px 0; text-align:left;">
        <label style="font-size:10px;">ID пользователя:</label>
        <input type="number" id="admUserId" style="width:100%; padding:6px; background:#07080d; border:1px solid var(--line); color:#fff; border-radius:6px; margin-bottom:8px;">
        <label style="font-size:10px;">Количество / Дни:</label>
        <input type="number" id="admAmount" style="width:100%; padding:6px; background:#07080d; border:1px solid var(--line); color:#fff; border-radius:6px; margin-bottom:10px;">
        <button class="primary-btn" onclick="execAdmin('balance')">Начислить Луны</button>
        <button class="primary-btn" onclick="execAdmin('premium')" style="background:var(--gold); color:#000;">Выдать Premium</button>
      </div>
      <button class="back-btn" onclick="this.closest('.modal-overlay').remove()" style="width:100%; margin-top:10px;">Закрыть</button>
    </div>`;
  document.body.appendChild(modal);
});

window.execAdmin = async function(type) {
  const targetId = parseInt($('#admUserId').value);
  const amount = parseInt($('#admAmount').value) || 0;
  try {
    const res = await fetch(`${API_BASE}/admin/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg?.initData || "", target_id: targetId, amount: amount, days: amount, action_type: type })
    });
    if (res.ok) {
      showToast("Выполнено!");
      document.querySelector('.modal-overlay').remove();
    }
  } catch (e) {}
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