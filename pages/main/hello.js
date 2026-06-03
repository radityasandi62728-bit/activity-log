'use strict';

// ========================
// NAVIGATION
// ========================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.section;

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        sections.forEach(s => {
            s.classList.remove('active-section');
        });

        const targetSection = document.getElementById(target);
        if (targetSection) {
            targetSection.classList.add('active-section');
        }
    });
});

// ========================
// CLOCK & DATE
// ========================
const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}:${s}`;

    const dayEl = document.getElementById('day');
    if (dayEl) dayEl.textContent = DAYS_ID[now.getDay()];

    const dateEl = document.getElementById('dateDisplay');
    if (dateEl) dateEl.textContent = `${now.getDate()} ${MONTHS_ID[now.getMonth()]} ${now.getFullYear()}`;
}
updateClock();
setInterval(updateClock, 1000);

// ========================
// LOCAL STORAGE HELPERS
// ========================
function getLogs() { return JSON.parse(localStorage.getItem('nexus_logs')) || []; }
function saveLogs(logs) { localStorage.setItem('nexus_logs', JSON.stringify(logs)); }
function getTasks() { return JSON.parse(localStorage.getItem('nexus_tasks')) || []; }
function saveTasks(tasks) { localStorage.setItem('nexus_tasks', JSON.stringify(tasks)); }

function addLog(text = 'activity') {
    const logs = getLogs();
    const now = new Date();
    logs.push({ date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), text });
    saveLogs(logs);
}

// ========================
// STATS
// ========================
function updateStats() {
    const logs = getLogs();
    const tasks = getTasks();

    // Total unique days
    const uniqueDays = new Set(logs.map(l => l.date)).size;
    document.getElementById('totalDays').textContent = uniqueDays;
    const profileLog = document.getElementById('profileTotalLog');
    if (profileLog) profileLog.textContent = logs.length;

    // Streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        const hasLog = logs.some(l => l.date === ds);
        if (hasLog) streak++;
        else if (i > 0) break;
    }
    document.getElementById('totalStreak').textContent = streak;
    document.getElementById('totalHours').textContent = Math.floor(logs.length * 0.5);
    document.getElementById('totalTasks').textContent = tasks.filter(t => t.done).length;

    // Achievements
    updateAchievements(uniqueDays, streak, tasks);
}

function updateAchievements(days, streak, tasks) {
    const items = document.querySelectorAll('.ach-item');
    if (!items.length) return;
    const defs = [
        { label: 'First Log', check: () => days >= 1 },
        { label: '7-Day Streak', check: () => streak >= 7 },
        { label: 'Task Master', check: () => tasks.filter(t => t.done).length >= 5 },
    ];
    items.forEach((el, i) => {
        if (defs[i] && defs[i].check()) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
            el.querySelector('span').textContent = '⬢';
        }
    });
}

// ========================
// HEATMAP
// ========================
function getHeatCounts() {
    const logs = getLogs();
    const counts = {};
    logs.forEach(l => { counts[l.date] = (counts[l.date] || 0) + 1; });
    return counts;
}

function generateDates(days = 365) {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(new Date(d));
    }
    return dates;
}

function getLevel(count) {
    if (count >= 8) return 'level-4';
    if (count >= 5) return 'level-3';
    if (count >= 3) return 'level-2';
    if (count >= 1) return 'level-1';
    return '';
}

function renderHeatmap() {
    const container = document.getElementById('heatmap');
    if (!container) return;
    container.innerHTML = '';
    const counts = getHeatCounts();
    const dates = generateDates(365);

    dates.forEach(dateObj => {
        const ds = dateObj.toISOString().slice(0, 10);
        const div = document.createElement('div');
        div.className = 'day';
        const count = counts[ds] || 0;
        const level = getLevel(count);
        if (level) div.classList.add(level);
        div.title = `${ds}: ${count} aktivitas`;
        container.appendChild(div);
    });
}

function renderMonths() {
    const container = document.getElementById('months');
    if (!container) return;
    container.innerHTML = '';
    const dates = generateDates(365);
    let weekIndex = 0;

    dates.forEach((date, i) => {
        const day = date.getDay();
        if (day === 0 && i !== 0) weekIndex++;
        if (date.getDate() === 1) {
            const span = document.createElement('span');
            span.textContent = date.toLocaleString('id-ID', { month: 'short' }).toUpperCase();
            span.className = 'month-label';
            span.style.gridColumnStart = weekIndex + 1;
            container.appendChild(span);
        }
    });
}

// ========================
// ACTIVITY LOG (HOME)
// ========================
function addMessage() {
    const input = document.getElementById('userInput');
    const val = input.value.trim();

    if (!val) return;

    fetch("/nexus/backend/add_activity.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "activity=" + encodeURIComponent(val)
    })
    .then(res => res.text())
    .then(data => {

        const history = document.getElementById('history');
        const emptyEl = history.querySelector('.log-empty');

        if (emptyEl) emptyEl.remove();

        const now = new Date();

        const timeStr =
            `${String(now.getHours()).padStart(2, '0')}:` +
            `${String(now.getMinutes()).padStart(2, '0')}`;

        const msg = document.createElement('div');

        msg.className = 'log-message';
        msg.innerHTML =
            `<span class="log-time">${timeStr}</span>
             <span class="log-text">${escapeHtml(val)}</span>`;

        history.appendChild(msg);
        history.scrollTop = history.scrollHeight;
        input.value = '';

        addLog(val);
        renderHeatmap();
        updateStats();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = document.getElementById('userInput');
    if (ui) ui.addEventListener('keypress', e => { if (e.key === 'Enter') addMessage(); });

    const ci = document.getElementById('chatInput');
    if (ci) ci.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    const cif = document.getElementById('celiaInputFull');
    if (cif) cif.addEventListener('keypress', e => { if (e.key === 'Enter') sendCeliaFull(); });

    const ti = document.getElementById('taskInput');
    if (ti) ti.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

    renderHeatmap();
    renderMonths();
    updateStats();
    renderTasks();
    addLog('session_start');
    loadHistory();


    // Close modals
    document.getElementById('closeDaily').addEventListener('click', () => {
        document.getElementById('dailyform-overlay').classList.remove('active');
    });
    document.getElementById('closeCelia').addEventListener('click', () => {
        document.getElementById('celiaform-overlay').classList.remove('active');
    });
    document.getElementById('dailyform-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
    });
    document.getElementById('celiaform-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
    });

    // FABs
    document.getElementById('dailytask-fab').addEventListener('click', () => {
        document.getElementById('dailyform-overlay').classList.toggle('active');
    });
    document.getElementById('celia-fab').addEventListener('click', () => {
        document.getElementById('celiaform-overlay').classList.toggle('active');
        // Show greeting if empty
        const ch = document.getElementById('chatHistory');
        if (ch && !ch.children.length) {
            appendBotMessage(ch, "Halo! Aku CELIA, asisten AI-mu. Ada yang bisa aku bantu hari ini?");
        }
    });
    const fabToggle = document.getElementById('fabToggle');
    const fabContainer = document.getElementById('fabContainer');

    fabToggle.addEventListener('click', () => {
        fabContainer.classList.toggle('active');

        if (fabContainer.classList.contains('active')) {
            fabToggle.innerHTML = '▶';
        } else {
            fabToggle.innerHTML = '◀';
        }
    });
});
// Load History
    function loadHistory() {
    fetch("/nexus/backend/add_activity.php")  
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            const history = document.getElementById('history');
            history.innerHTML = '';

            if (!data.length) {
                history.innerHTML = '<div class="log-empty">Belum ada aktivitas tercatat...</div>';
                return;
            }

            data.forEach(item => {  
                const time = new Date(item.created_at);
                const timeStr =
                    `${String(time.getHours()).padStart(2, '0')}:` +
                    `${String(time.getMinutes()).padStart(2, '0')}`;

                const msg = document.createElement('div');
                msg.className = 'log-message';
                msg.innerHTML =
                    `<span class="log-time">${timeStr}</span>
                     <span class="log-text">${escapeHtml(item.activity_text)}</span>`;

                history.appendChild(msg);
            });

            history.scrollTop = history.scrollHeight;
        })
        .catch(error => {
            const history = document.getElementById('history');
            if (history) {
                history.innerHTML = '<div class="log-empty">Gagal memuat histori aktivitas.</div>';
            }
            console.error('Error memuat histori:', error);
        });
}

// ========================
// TASKS
// ========================
function addTask() {
    const input = document.getElementById('taskInput');
    const val = input.value.trim();
    if (!val) return;
    const tasks = getTasks();
    tasks.push({ id: Date.now(), text: val, done: false });
    saveTasks(tasks);
    input.value = '';
    renderTasks();
    updateStats();
}

function toggleTask(id) {
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    if (t) t.done = !t.done;
    saveTasks(tasks);
    renderTasks();
    updateStats();
}

function deleteTask(id) {
    let tasks = getTasks();
    tasks = tasks.filter(x => x.id !== id);
    saveTasks(tasks);
    renderTasks();
    updateStats();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;
    const tasks = getTasks();
    list.innerHTML = '';

    if (!tasks.length) {
        list.innerHTML = '<li style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); text-align: center; padding: 16px;">Belum ada tugas. Tambahkan tugas baru!</li>';
    } else {
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-checkbox ${t.done ? 'checked' : ''}" onclick="toggleTask(${t.id})"></div>
                <div class="task-text-wrap">
                    <span class="task-text ${t.done ? 'done' : ''}">${escapeHtml(t.text)}</span>
                </div>
                <button class="task-delete" onclick="deleteTask(${t.id})">✕</button>
            `;
            list.appendChild(li);
        });
    }

    const countEl = document.getElementById('taskCount');
    const doneEl = document.getElementById('taskDone');
    if (countEl) countEl.textContent = `${tasks.length} tugas`;
    if (doneEl) doneEl.textContent = `${tasks.filter(t => t.done).length} selesai`;
}

// ========================
// CELIA CHATBOT
// ========================
const CELIA_RESPONSES = [
    ["halo|hai|hello", "Halo! Aku CELIA, siap membantumu hari ini! 🚀"],
    ["semangat|motivasi|down|lelah", "Ingat — setiap langkah kecil yang kamu ambil hari ini adalah investasi untuk versi dirimu di masa depan. KEEP GOING! 💪"],
    ["tugas|task|todo", "Kamu bisa buka Task Manager dengan tombol TASK di pojok kanan bawah untuk mengelola tugasmu!"],
    ["streak|aktif|produktif", "Konsistensi adalah kunci! Setiap kali kamu log aktivitas, kamu membangun kebiasaan yang kuat."],
    ["heatmap|aktivitas|grafik", "Heatmap-mu menunjukkan pola aktivitas selama 365 hari. Semakin hijau, semakin produktif kamu!"],
    ["siapa|kamu|celia", "Aku CELIA — Cognitive Enhanced Learning Intelligence Agent. Dibuat untuk membantumu jadi lebih produktif!"],
    ["terima kasih|makasih|thanks", "Sama-sama! Aku selalu di sini untukmu. Tetap semangat! ⚡"],
    ["waktu|jam|hari", "Waktu adalah sumber daya paling berharga. Manfaatkan setiap menitnya dengan baik!"],
];

function celiaBotReply(text) {
    const lower = text.toLowerCase();
    for (const [pattern, reply] of CELIA_RESPONSES) {
        if (new RegExp(pattern).test(lower)) return reply;
    }
    return "Hmm, aku mengerti pesanmu. Terus semangat dan jangan lupa log aktivitasmu hari ini! 🌟";
}

function appendUserMessage(container, text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble user';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function appendBotMessage(container, text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble bot';
    div.innerHTML = `<div class="bubble-name">CELIA</div>${escapeHtml(text)}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function showTyping(container) {
    const div = document.createElement('div');
    div.className = 'chat-bubble bot typing-wrap';
    div.innerHTML = `<div class="bubble-name">CELIA</div><div class="typing-indicator"><span></span><span></span><span></span></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const container = document.getElementById('chatHistory');
    const val = input.value.trim();
    if (!val) return;

    appendUserMessage(container, val);
    input.value = '';

    const typing = showTyping(container);
    setTimeout(() => {
        typing.remove();
        appendBotMessage(container, celiaBotReply(val));
    }, 900 + Math.random() * 600);
}

function sendCeliaFull() {
    const input = document.getElementById('celiaInputFull');
    const container = document.getElementById('celiaChatFull');
    const val = input.value.trim();
    if (!val) return;

    appendUserMessage(container, val);
    input.value = '';

    const typing = showTyping(container);
    setTimeout(() => {
        typing.remove();
        appendBotMessage(container, celiaBotReply(val));
    }, 900 + Math.random() * 600);
}

// ========================
// UTILS
// ========================
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
const archiveTitle = document.getElementById("archiveTitle");
const archiveBody = document.getElementById("archiveBody");
const archiveModal = document.getElementById("archiveModal");

function openArchive(type) {

    archiveModal.classList.add("active");

    if (type === "achievement") {

        archiveTitle.innerText = "ACHIEVEMENT";

        archiveBody.innerHTML = `
            <div class="badge-card">
                🏆 Badge 777 Unlocked
            </div>

            <div class="badge-card locked">
                🔒 Night Hunter
            </div>
        `;
    }

    else if (type === "stats") {

        archiveTitle.innerText = "STATISTIK";

        archiveBody.innerHTML = `
            <p>Total Task : 28</p>
            <p>Current Streak : 7</p>
            <p>Focus Time : 32 Jam</p>
        `;
    }

    else if (type === "activity") {

        archiveTitle.innerText = "ACTIVITY LOG";

        archiveBody.innerHTML = `
            <p>[07:14] Task completed</p>
            <p>[09:21] New achievement unlocked</p>
            <p>[13:08] Daily mission finished</p>
        `;
    }

    else if (type === "mission") {

        archiveTitle.innerText = "MISSION PROGRESS";

        archiveBody.innerHTML = `
            <p>Daily Goal : 70%</p>
            <p>Weekly Goal : 42%</p>
            <p>Monthly Goal : 18%</p>
        `;
    }
}

function closeArchive() {
    archiveModal.classList.remove("active");
}
