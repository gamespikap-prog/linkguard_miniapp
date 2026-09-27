const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try {
    tg.setHeaderColor('#07080d');
    tg.setBackgroundColor('#07080d');
  } catch (_) {}
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  balance: 0,
  sound: true,
  user: tg?.initDataUnsafe?.user || null
};

const balance = $('#balanceValue');
const welcomeTitle = $('#welcomeTitle');
const gamesSection = $('#gamesSection');
const subPage = $('#subPage');
const subPageContent = $('#subPageContent');
const toast = $('#toast');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[char]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
}

function setActiveTab(tab) {
  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function showGames() {
  gamesSection.classList.remove('hidden');
  subPage.classList.add('hidden');
  setActiveTab('games');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTop() {
  gamesSection.classList.add('hidden');
  subPage.classList.remove('hidden');
  setActiveTab('top');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  subPageContent.innerHTML = `
    <div class="sub-card top-card">
      <span class="section-kicker">LEADERBOARD</span>
      <h2>🏆 Топы LinkGuard</h2>
      <p class="lead-text">Соревнуйся с другими игроками, набирай активность и поднимайся выше в таблице.</p>

      <div class="podium">
        <div class="podium-place second"><span>🥈</span><b>Игрок #2</b><small>0 очков</small></div>
        <div class="podium-place first"><span>🥇</span><b>Игрок #1</b><small>0 очков</small></div>
        <div class="podium-place third"><span>🥉</span><b>Игрок #3</b><small>0 очков</small></div>
      </div>

      <div class="reward-note">
        <div class="reward-note-icon">🎁</div>
        <div>
          <h3>Награды за активность</h3>
          <p>Топ-3 по итогам рейтинга смогут получить от меня подарок общей ценностью от 100–150 ⭐.</p>
        </div>
      </div>

      <div class="secret-note">
        <span>🔒</span>
        <div>
          <b>Секретные награды</b>
          <p>За очень высокую активность иногда открываются дополнительные секретные награды. Их условия заранее не раскрываются 👀</p>
        </div>
      </div>

      <div class="mini-list">
        <div class="mini-row"><span class="rank-num">#1</span><span class="rank-name">Ожидает игроков</span><span class="rank-score">—</span></div>
        <div class="mini-row"><span class="rank-num">#2</span><span class="rank-name">Ожидает игроков</span><span class="rank-score">—</span></div>
        <div class="mini-row"><span class="rank-num">#3</span><span class="rank-name">Ожидает игроков</span><span class="rank-score">—</span></div>
      </div>
    </div>`;
}

function showProfile() {
  gamesSection.classList.add('hidden');
  subPage.classList.remove('hidden');
  setActiveTab('profile');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const name = state.user
    ? [state.user.first_name, state.user.last_name].filter(Boolean).join(' ')
    : 'Гость';

  subPageContent.innerHTML = `
    <div class="sub-card">
      <span class="section-kicker">PROFILE</span>
      <div class="profile-head">
        <div class="avatar">${escapeHtml((name[0] || 'G').toUpperCase())}</div>
        <div>
          <h2>${escapeHtml(name)}</h2>
          <p>Твой профиль LinkGuard</p>
        </div>
      </div>

      <div class="profile-balance">
        <span>★</span>
        <div><small>Баланс</small><strong>${state.balance.toLocaleString('ru-RU')} очков</strong></div>
      </div>

      <div class="stat-grid">
        <div class="stat"><b>${state.balance}</b><span>ОЧКОВ</span></div>
        <div class="stat"><b>0</b><span>ИГР</span></div>
        <div class="stat"><b>0</b><span>ПОБЕД</span></div>
        <div class="stat"><b>0</b><span>ПРЕДМЕТОВ</span></div>
      </div>

      <div class="inventory-box">
        <span class="section-kicker">INVENTORY</span>
        <h3>🎒 Инвентарь</h3>
        <p>Здесь появятся Shield, Scanner, попытки, купоны и другие награды.</p>
      </div>
    </div>`;
}

const gameData = {
  daily: {
    icon: '🎁',
    tag: 'БЕСПЛАТНО',
    title: 'Бесплатный кейс',
    text: 'Один бесплатный кейс раз в 24 часа. Здесь позже появится настоящая анимация открытия и выдача награды.'
  },
  cases: {
    icon: '🎁',
    tag: 'НАГРАДЫ',
    title: 'Кейсы',
    text: 'Открывай кейсы и получай ресурсы, попытки, бустеры и другие награды. Механику подключим после базы.'
  },
  mines: {
    icon: '💣',
    tag: 'GAME',
    title: 'Мины',
    text: 'Выбирай Easy, Medium или Hardcore, открывай клетки и решай, когда забрать накопленный банк.'
  },
  duel: {
    icon: '⚔️',
    tag: 'PVP',
    title: 'PvP Дуэль',
    text: 'В будущем здесь появятся поиск соперника, приглашение в дуэль и результат матча за виртуальные очки.'
  }
};

function showGame(page) {
  const data = gameData[page];
  if (!data) return;

  gamesSection.classList.add('hidden');
  subPage.classList.remove('hidden');
  setActiveTab('games');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  subPageContent.innerHTML = `
    <div class="sub-card game-page">
      <button class="back-btn" id="innerBack">‹ Игры</button>
      <div class="large-game-icon">${data.icon}</div>
      <span class="section-kicker">${data.tag}</span>
      <h2>${data.title}</h2>
      <p class="lead-text">${data.text}</p>
      <button class="primary-btn" id="demoAction">Скоро будет доступно</button>
    </div>`;

  $('#innerBack').addEventListener('click', showGames);
  $('#demoAction').addEventListener('click', () => showToast('Модуль уже в разработке 🚀'));
}

$$('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item.dataset.tab === 'games') showGames();
    if (item.dataset.tab === 'top') showTop();
    if (item.dataset.tab === 'profile') showProfile();
  });
});

$$('[data-page]').forEach(card => {
  card.addEventListener('click', () => showGame(card.dataset.page));
});

$('#backBtn').addEventListener('click', showGames);

$('#soundBtn').addEventListener('click', () => {
  state.sound = !state.sound;
  $('#soundBtn').textContent = state.sound ? '♪' : '×';
  showToast(state.sound ? 'Звук включён' : 'Звук выключен');
});

if (state.user) {
  welcomeTitle.textContent = `Привет, ${state.user.first_name}!`;
}

balance.textContent = state.balance.toLocaleString('ru-RU');
console.log('LinkGuard 2.0 Mini App UI v2 loaded');
