const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try { tg.setHeaderColor('#080a10'); tg.setBackgroundColor('#080a10'); } catch (_) {}
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  balance: 0,
  sound: true,
  user: tg?.initDataUnsafe?.user || null
};

const title = $('#welcomeTitle');
const balance = $('#balanceValue');
const gamesSection = $('#gamesSection');
const quickRow = $('.quick-row');
const subPage = $('#subPage');
const subPageContent = $('#subPageContent');
const toast = $('#toast');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[char]));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
}

function setActiveTab(tab) {
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.tab === tab));
}

function showGames() {
  gamesSection.classList.remove('hidden');
  quickRow.classList.remove('hidden');
  subPage.classList.add('hidden');
  setActiveTab('games');
}

function showTop() {
  gamesSection.classList.add('hidden');
  quickRow.classList.add('hidden');
  subPage.classList.remove('hidden');
  setActiveTab('top');
  subPageContent.innerHTML = `
    <div class="sub-card">
      <span class="section-kicker">LEADERBOARD</span>
      <h2>🏆 Топ игроков</h2>
      <p>Рейтинг пока работает в демо-режиме. После подключения базы здесь появятся реальные игроки.</p>
      <div class="mini-list">
        <div class="mini-row"><span class="rank-num">#1</span><span class="rank-name">LinkGuard Player</span><span class="rank-score">0</span></div>
        <div class="mini-row"><span class="rank-num">#2</span><span class="rank-name">Ожидает данных</span><span class="rank-score">—</span></div>
        <div class="mini-row"><span class="rank-num">#3</span><span class="rank-name">Ожидает данных</span><span class="rank-score">—</span></div>
      </div>
    </div>`;
}

function showProfile() {
  gamesSection.classList.add('hidden');
  quickRow.classList.add('hidden');
  subPage.classList.remove('hidden');
  setActiveTab('profile');
  const name = state.user ? [state.user.first_name, state.user.last_name].filter(Boolean).join(' ') : 'Гость';
  subPageContent.innerHTML = `
    <div class="sub-card">
      <span class="section-kicker">PROFILE</span>
      <h2>👤 ${escapeHtml(name)}</h2>
      <p>Твой профиль LinkGuard. Реальные данные подключим к API после установки сервера.</p>
      <div class="stat-grid">
        <div class="stat"><b>${state.balance}</b><span>ОЧКОВ</span></div>
        <div class="stat"><b>0</b><span>ИГР</span></div>
        <div class="stat"><b>0</b><span>ПОБЕД</span></div>
        <div class="stat"><b>0</b><span>ПРЕДМЕТОВ</span></div>
      </div>
    </div>`;
}

function showGame(page) {
  gamesSection.classList.add('hidden');
  quickRow.classList.add('hidden');
  subPage.classList.remove('hidden');
  setActiveTab('games');

  const data = {
    mines: {
      icon:'💣', title:'Mines', text:'Выбери режим и открывай клетки. Пока это визуальная демо-страница — игровую механику подключим к боту позже.'
    },
    duel: {
      icon:'⚔️', title:'PvP Дуэль', text:'Комната для дуэлей между игроками. Здесь позже появятся поиск соперника, приглашение и результат матча.'
    },
    cases: {
      icon:'🎁', title:'Кейсы', text:'Раздел наград и ежедневного кейса. Сейчас показываем интерфейс, а систему выдачи предметов подключим после базы.'
    }
  }[page];

  subPageContent.innerHTML = `
    <div class="sub-card">
      <div class="game-icon" style="margin-bottom:14px">${data.icon}</div>
      <span class="section-kicker">GAME MODULE</span>
      <h2>${data.title}</h2>
      <p>${data.text}</p>
      <button class="back-btn" style="margin-top:18px" id="demoAction">Открыть демо</button>
    </div>`;

  $('#demoAction').addEventListener('click', () => showToast('Модуль готов к подключению 🚀'));
}

$$('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item.dataset.tab === 'games') showGames();
    if (item.dataset.tab === 'top') showTop();
    if (item.dataset.tab === 'profile') showProfile();
  });
});

$$('[data-page]').forEach(card => card.addEventListener('click', () => showGame(card.dataset.page)));
$$('[data-tab]').filter(el => !el.classList.contains('nav-item')).forEach(card => {
  card.addEventListener('click', () => card.dataset.tab === 'top' ? showTop() : showProfile());
});

$('#backBtn').addEventListener('click', showGames);

$('#soundBtn').addEventListener('click', () => {
  state.sound = !state.sound;
  $('#soundBtn').textContent = state.sound ? '♪' : '×';
  showToast(state.sound ? 'Звук включён' : 'Звук выключен');
});

if (state.user) {
  title.textContent = `Привет, ${state.user.first_name}!`;
}

balance.textContent = state.balance.toLocaleString('ru-RU');
console.log('LinkGuard Mini App UI loaded');
