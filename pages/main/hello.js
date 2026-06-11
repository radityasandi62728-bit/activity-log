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
function calculateStreak(logs) {
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

    return streak;
}

function updateStats() {
    const logs = getLogs();
    const tasks = getTasks();

    const uniqueDays = new Set(logs.map(l => l.date)).size;
    document.getElementById('totalDays').textContent = uniqueDays;
    const profileLog = document.getElementById('profileTotalLog');
    if (profileLog) profileLog.textContent = logs.length;

    const streak = calculateStreak(logs);
    document.getElementById('totalStreak').textContent = streak;

    updateAchievements(uniqueDays, streak, tasks);
}

function updateAchievements(days, streak, tasks) {
    const items = document.querySelectorAll('.ach-item');
    if (!items.length) return;

    const defs = [
        { label: 'First Log', check: () => days >= 1 },
        { label: '7-Day Streak', check: () => streak >= 7 },
        { label: 'Task Master', check: () => tasks.filter(t => parseInt(t.done) === 1).length >= 5 },
    ];

    items.forEach((el, i) => {
        const unlocked = defs[i] ? defs[i].check() : false;
        el.classList.toggle('unlocked', unlocked);
        el.classList.toggle('locked', !unlocked);

        const icon = el.querySelector('span');
        if (icon) icon.textContent = unlocked ? '⬢' : '⬡';
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
function updateTotalDays() {

    const counts = getHeatCounts();

    // jumlah tanggal yang punya activity
    const totalDays =
        Object.keys(counts).length;

    const el =
        document.getElementById('totalDays');

    if (el) {
        el.textContent = totalDays;
    }
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
            updateTotalDays();
            updateStreak();
            updateStats();
            loadStats();
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
    loadProfile();
    renderHeatmap();
    renderMonths();
    updateTotalDays();
    updateStreak();
    updateStats();
    loadTasks();
    loadTaskStats();
    addLog('session_start');
    loadHistory();
    loadAchievements();


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

function formatTime(datetimeStr) {
    if (!datetimeStr) return null;
    const d = new Date(datetimeStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function addTask() {
    const input = document.getElementById('taskInput');
    const val = input.value.trim();
    if (!val) return;

    fetch('/nexus/backend/add_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'text=' + encodeURIComponent(val)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                input.value = '';
                loadTasks();
            }
        });
}

function toggleTask(id, currentDone) {
    const newDone = currentDone ? 0 : 1;

    fetch('/nexus/backend/update_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}&done=${newDone}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadTasks();
                loadTaskStats();
                updateStats();
            }
        });
}

function deleteTask(id) {
    fetch('/nexus/backend/delete_task.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + id
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadTasks();
                loadTaskStats();
                updateStats();
            }
        });
}

function loadTasks() {
    fetch('/nexus/backend/get_task.php')
        .then(res => {
            if (!res.ok) throw new Error('Gagal memuat tugas');
            return res.json();
        })
        .then(data => {
            if (!data.success) return;

            const tasks = data.data || [];
            saveTasks(tasks);
            renderTasksFromDB(tasks);
            updateTaskCount(tasks);
            updateStats();
        })
        .catch(error => {
            console.error('Error memuat tugas:', error);
        });
}

function renderTasksFromDB(tasks) {
    const list = document.getElementById('taskList');
    if (!list) return;
    list.innerHTML = '';

    if (!tasks.length) {
        list.innerHTML = '<li style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);text-align:center;padding:16px;">Belum ada tugas. Tambahkan tugas baru!</li>';
        return;
    }

    tasks.forEach(t => {
        const isDone = parseInt(t.done) === 1; 
        const createdTime = formatTime(t.created_at);
        const completedTime = formatTime(t.completed_at);

        const timeBadge = isDone && completedTime
            ? `<span class="task-time">📅 ${createdTime} &nbsp;✓ ${completedTime}</span>`
            : `<span class="task-time">📅 ${createdTime}</span>`;

        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div class="task-checkbox ${isDone ? 'checked' : ''}"
                 onclick="toggleTask(${t.id}, ${isDone ? 1 : 0})"></div>
            <div class="task-text-wrap">
                <span class="task-text ${isDone ? 'done' : ''}">${escapeHtml(t.text)}</span>
                ${timeBadge}
            </div>
            <button class="task-delete" onclick="deleteTask(${t.id})">✕</button>
        `;
        list.appendChild(li);
    });
}

function updateTaskCount(tasks) {
    const countEl = document.getElementById('taskCount');
    const doneEl = document.getElementById('taskDone');
    const totalEl = document.getElementById('totalTasks');
    if (countEl) countEl.textContent = `${tasks.length} tugas`;
    if (doneEl) doneEl.textContent = `${tasks.filter(t => t.done == 1).length} selesai`;
    if (totalEl) totalEl.textContent = tasks.length;
}

// ========================
// CELIA CHATBOT
// ========================
const CELIA_RESPONSES = [
    ["halo|hai|hello", "Ya? Ada yang bisa aku bantu? 😊"],
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

        archiveModal.classList.add("active");
        archiveTitle.innerText = "ACHIEVEMENTS";
        archiveBody.innerHTML = '<div class="ach-grid" id="achGrid"></div>';
        renderAchArchive(); 
    }

    else if (type === "stats") {

        archiveTitle.innerText = "STATISTIK";

        const totalLogs =
            document.getElementById('totalLogs')
                ?.textContent || 0;

        const totalStreak =
            document.getElementById('totalStreak')
                ?.textContent || 0;

        archiveBody.innerHTML = `
            <p>Total Logs : ${totalLogs}</p>
            <p>Current Streak : ${totalStreak}</p>
            <p>Total Task : COMING SOON</p>
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

let profileData = {
    name: 'Nama Pengguna',
    username: '@username',
    email: 'user@email.com',
    uid: 'USR_001_ALPHA',
    join: '2025-01-01',
    login: '2026-06-01 11:30',
    avatarSrc: null,
    logs: null,
    data: null,
    access: null
};

function fetchStatsFromDB() {

    setTimeout(() => {
        updateStats(128, 24, 'ADMIN');
    }, 1400);
}

function updateStats(logs, data, access) {
    profileData.logs = logs;
    profileData.data = data;
    profileData.access = access;

    setStatEl('statLogs', logs);
    setStatEl('statData', data);
    setStatEl('statAccess', access);
    setStatEl('mStatLogs', logs);
    setStatEl('mStatData', data);
    setStatEl('mStatAccess', access);
}

function setStatEl(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    el.classList.remove('loading');
}

/* ------------------------------------------------------------------
 * MODAL — BUKA & TUTUP
 * ------------------------------------------------------------------ */
function openModal() {

    document.getElementById('inputName').value = profileData.name;
    document.getElementById('inputUsername').value = profileData.username;
    document.getElementById('inputEmail').value = profileData.email;
    document.getElementById('inputUid').value = profileData.uid;
    document.getElementById('inputJoin').value = profileData.join;
    document.getElementById('inputLogin').value = profileData.login;
    document.getElementById('inputPass').value = '';
    document.getElementById('inputPassConf').value = '';

    syncModalStats();

    const ma = document.getElementById('modalAvatar');
    if (profileData.avatarSrc) {
        ma.innerHTML = `<img src="${profileData.avatarSrc}" alt="Foto profil">`;
    } else {
        ma.innerHTML = defaultAvatarSVG();
    }

    const overlay = document.getElementById('overlay');
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
}

function closeModal() {
    const overlay = document.getElementById('overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('active');
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('overlay')) closeModal();
}

function syncModalStats() {
    const ids = ['mStatLogs', 'mStatData', 'mStatAccess'];
    const vals = [profileData.logs, profileData.data, profileData.access];
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (vals[i] !== null) {
            el.textContent = vals[i];
            el.classList.remove('loading');
        } else {
            el.textContent = '···';
            el.classList.add('loading');
        }
    });
}

/* ------------------------------------------------------------------
 * UPLOAD FOTO
 * ------------------------------------------------------------------ */

let selectedAvatarFile = null;

function handleFileUpload(event) {

    const file = event.target.files[0];

    if (!file) return;

    selectedAvatarFile = file;

    const imageUrl = URL.createObjectURL(file);

    profileData.avatarSrc = imageUrl;

    const imgHTML =
        `<img src="${imageUrl}"
              style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
              alt="avatar">`;

    syncAvatarUI(imgHTML);
}
/* ------------------------------------------------------------------
 * SIMPAN PROFIL
 * Ganti bagian fetch() di bawah dengan endpoint API kamu.
 * ------------------------------------------------------------------ */
function saveProfile() {
    const name = document.getElementById('inputName').value.trim();
    const username = document.getElementById('inputUsername').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const pass = document.getElementById('inputPass').value;
    const passConf = document.getElementById('inputPassConf').value;

    // Validasi
    if (!name) {
        showToast('⚠ NAMA TIDAK BOLEH KOSONG', true);
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('⚠ FORMAT EMAIL TIDAK VALID', true);
        return;
    }
    if (pass && pass !== passConf) {
        showToast('⚠ PASSWORD TIDAK COCOK', true);
        return;
    }

    const btn = document.getElementById('btnSave');
    btn.textContent = 'MENYIMPAN···';
    btn.disabled = true;

    const formData = new FormData();

    formData.append("name", name);
    formData.append("username", username);
    formData.append("email", email);

    if (selectedAvatarFile) {
        formData.append("avatar", selectedAvatarFile);
    }

    fetch('/nexus/backend/update_profile.php', {

        method: 'POST',
        body: formData

    })
        .then(response => response.text())
        .then(data => {

            console.log(data);

            data = JSON.parse(data);

            if (data.success) {

                applyProfileUpdate(name, username, email);

                showToast('✓ PROFIL BERHASIL DIPERBARUI');

            } else {

                showToast(data.message, true);
            }

            btn.textContent = 'SIMPAN PERUBAHAN';
            btn.disabled = false;
        })
        .catch(error => {

            console.error(error);

            showToast('SERVER ERROR', true);

            // RESET BUTTON
            btn.textContent = 'SIMPAN PERUBAHAN';
            btn.disabled = false;
        });
}

function applyProfileUpdate(name, username, email) {
    profileData.name = name;
    profileData.username = username;
    profileData.email = email;

    document.getElementById('displayName').textContent = name;
    document.getElementById('displayUsername').textContent = username;
    document.getElementById('displayEmail').textContent = email;

    if (profileData.avatarSrc) {
        const avatarHTML = `<img src="${profileData.avatarSrc}"
                style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
                alt="Foto profil">`;

        syncAvatarUI(avatarHTML);
    }

    closeModal();
    showToast('✓ PROFIL BERHASIL DIPERBARUI');
}

/* ------------------------------------------------------------------
 * TOAST NOTIFICATION
 * ------------------------------------------------------------------ */
function showToast(msg, isError = false) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.toggle('error', isError);
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

/* ------------------------------------------------------------------
 * HELPER
 * ------------------------------------------------------------------ */
function defaultAvatarSVG() {
    return `<svg viewBox="0 0 80 80" style="width:66px;height:66px;color:var(--text-dim)">
        <circle cx="40" cy="30" r="18" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M10 75 Q10 55 40 55 Q70 55 70 75" fill="none" stroke="currentColor" stroke-width="2"/>
      </svg>`;
}

function syncAvatarUI(avatarHTML) {
    const targets = ['mainAvatar', 'profileAvatar', 'miniAvatar', 'modalAvatar'];
    targets.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = avatarHTML;
    });
}

function loadProfile() {

    fetch('/nexus/backend/get_profile.php')

        .then(response => response.json())

        .then(result => {

            if (!result.success) return;

            const data = result.data;

            profileData.name = data.name;
            profileData.username = data.username;
            profileData.email = data.email;
            profileData.avatarSrc = data.avatar;

            const displayName =
                document.getElementById('displayName');

            if (displayName) {
                displayName.textContent =
                    data.name || 'NO NAME';
            }

            const displayUsername =
                document.getElementById('displayUsername');

            if (displayUsername) {
                displayUsername.textContent =
                    data.username || '@unknown';
            }

            const displayEmail =
                document.getElementById('displayEmail');

            if (displayEmail) {
                displayEmail.textContent =
                    data.email || 'no@email';
            }
            const profileName =
                document.getElementById('profileName');

            if (profileName) {
                profileName.textContent =
                    data.name || 'NO NAME';
            }

            const profileUsername =
                document.getElementById('profileUsername');

            if (profileUsername) {
                profileUsername.textContent =
                    data.username || '@unknown';
            }

            const profileEmail =
                document.getElementById('profileEmail');

            if (profileEmail) {
                profileEmail.textContent =
                    data.email || 'no@email';
            }

            const profileJoin =
                document.getElementById('profileJoin');

            if (profileJoin) {
                profileJoin.textContent =
                    data.created_at || '-';
            }

            const profileLogin =
                document.getElementById('profileLogin');

            if (profileLogin) {
                profileLogin.textContent =
                    data.last_login || '-';
            }

            const profileUID =
                document.getElementById('profileUID');

            if (profileUID) {
                profileUID.textContent =
                    'USR_' + data.id;
            }
            const headerUserId = document.getElementById('headerUserId');
            if (headerUserId) {
                headerUserId.textContent = 'USR_' + data.id;
            }
            // avatar
            const avatarHTML = data.avatar
                ? `<img src="${data.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Foto profil">`
                : defaultAvatarSVG();

            syncAvatarUI(avatarHTML);
        })

        .catch(err => {

            console.error('LOAD PROFILE ERROR:', err);

        });
}
function loadStats() {

    fetch('/nexus/backend/get_stats.php')

        .then(response => response.json())

        .then(data => {

            if (!data.success) return;

            const totalLogs =
                document.getElementById('totalLogs');

            if (totalLogs) {
                totalLogs.textContent =
                    data.totalLogs;
            }
        })

        .catch(err => {

            console.error('LOAD STATS ERROR:', err);

        });
}
function updateStreak() {

    const counts = getHeatCounts();

    const activeDates =
        Object.keys(counts).sort();

    if (activeDates.length === 0) {

        document.getElementById('totalStreak')
            .textContent = 0;

        return;
    }

    let streak = 0;

    const today = new Date();

    for (let i = 0; i < 365; i++) {

        const checkDate = new Date(today);

        checkDate.setDate(today.getDate() - i);

        const ds =
            checkDate.toISOString().slice(0, 10);

        if (counts[ds]) {

            streak++;

        } else {

            break;
        }
    }

    document.getElementById('totalStreak')
        .textContent = streak;
}
//total hours
function loadTaskStats() {
    fetch('/nexus/backend/get_task_stat.php')
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            const hoursEl = document.getElementById('totalHours');
            if (hoursEl) {
                hoursEl.textContent = data.total_minutes < 60
                    ? data.minutes + 'm'
                    : data.hours + 'j';
                hoursEl.title = `Total: ${data.display}`;
            }

            const tasksEl = document.getElementById('totalTasks');
            if (tasksEl) tasksEl.textContent = data.total_tasks;
        })
        .catch(err => console.error('Error load task stats:', err));
}
function handleLogout() {
    fetch('/nexus/backend/logout.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/nexus/login.html';
            }
        })
        .catch(() => {

            window.location.href = '/nexus/login.html';
        });
}
loadProfile();
loadStats();
fetchStatsFromDB();

