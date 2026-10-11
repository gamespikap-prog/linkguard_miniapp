const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// Защищенный URL бэкенда на RavenHost
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

        if (res.ok) {
            const data = await res.json();
            state.balance = data.balance ?? 0;
            state.attemptsLeft = data.attempts_left ?? 50;
            state.isAdmin = data.is_admin ?? false;
            state.isPremium = data.is_premium ?? false;
            updateUI();
        } else {
            console.warn("Server response not OK:", res.status);
            showToast(`Ошибка сервера: ${res.status}`);
            updateUI(); // Показываем интерфейс с локальными данными (для тестов)
        }
    } catch (e) {
        console.error("API Connection Error:", e);
        showToast("Ошибка соединения с сервером");
        updateUI(); // Показываем интерфейс, чтобы админка была доступна
    }
}

function updateUI() {
    const balanceEl = $('#balance-display');
    if (balanceEl) balanceEl.textContent = state.balance;

    const attemptsEl = $('#attempts-display');
    if (attemptsEl) attemptsEl.textContent = state.attemptsLeft;

    // Отображение кнопки админки
    const adminBtn = $('#admin-btn');
    if (adminBtn) {
        // Показываем кнопку если пользователь админ или для отладки
        adminBtn.style.display = (state.isAdmin || state.user?.id === 6591727196) ? "block" : "none";
    }
}

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    fetchUserData();
});