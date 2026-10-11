const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

const API_BASE = "http://tex.ravenhost.space:19278/api/v1";

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
            state.balance = data.balance || 0;
            state.attemptsLeft = data.attempts_left ?? 50;
            state.isAdmin = data.is_admin || false;
            state.isPremium = data.is_premium || false;
            updateUI();
        } else {
            showToast("Ошибка загрузки профиля");
        }
    } catch (e) {
        console.error("API connection error:", e);
        showToast("Ошибка соединения с сервером");
    }
}

function updateUI() {
    const balanceEl = $('#balance-display');
    if (balanceEl) balanceEl.textContent = state.balance;

    const attemptsEl = $('#attempts-display');
    if (attemptsEl) attemptsEl.textContent = state.attemptsLeft;

    const adminBtn = $('#admin-btn');
    if (adminBtn) {
        adminBtn.style.display = state.isAdmin ? "block" : "none";
    }
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    fetchUserData();
});