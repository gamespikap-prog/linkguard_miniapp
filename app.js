const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// Защищенный URL бэкенда через DuckDNS (HTTPS)
const API_BASE = "https://linkguard.duckdns.org/api/v1";

const $ = (selector) => document.querySelector(selector);  const $$ = (selector) => [...document.querySelectorAll(selector)];

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
    setTimeout(() => toast.classList.remove('show'), 2500);
}

async function fetchUserData() {
    try {
        const initDataStr = tg?.initData || "";

        const res = await fetch(`${API_BASE}/user`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "init-data": initDataStr
            }
        });
        
        if (!res.ok) throw new Error("Не удалось загрузить данные пользователя");
        
        const data = await res.json();
        state.balance = data.balance ?? state.balance;
        state.attemptsLeft = data.attempts ?? state.attemptsLeft;
        
        // Обновление интерфейса баланса и попыток, если они есть на странице
        const balanceEl = $('#balance');
        if (balanceEl) balanceEl.textContent = state.balance;
        
        const attemptsEl = $('#attempts');
        if (attemptsEl) attemptsEl.textContent = state.attemptsLeft;

    } catch (e) {
        console.error(e);
        showToast("Ошибка соединения с сервером");
    }
}

// Автоматический запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    fetchUserData();
});