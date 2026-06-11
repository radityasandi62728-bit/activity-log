'use strict';

// Cache hasil fetch supaya tidak fetch dua kali
let _achCache = null;

function loadAchievements() {
    if (_achCache) {
        renderAchHome(_achCache);
        return;
    }

    fetch('/nexus/backend/check_achievements.php')
        .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(data => {
            if (!data.success) throw new Error(data.message || 'Gagal memuat achievement');
            _achCache = data.data || [];
            renderAchHome(_achCache);
        })
        .catch(err => {
            console.error('Achievement error:', err);
            const container = document.querySelector('.ach-list');
            if (container) {
                container.innerHTML = '<div class="ach-item locked"><span>⬡</span> Achievement sedang tidak bisa dimuat</div>';
            }
        });
}

// ================================================
// HOME — ringkas, tanpa foto
// ================================================
function renderAchHome(list) {
    const container = document.querySelector('.ach-list');
    if (!container) return;

    container.innerHTML = '';

    list.forEach(ach => {
        const div = document.createElement('div');
        div.className = 'ach-item' + (ach.unlocked ? ' unlocked' : ' locked');
        div.innerHTML = `<span>${ach.unlocked ? '⬢' : '⬡'}</span> ${ach.unlocked ? ach.name : ach.name}`;
        container.appendChild(div);
    });
}

// ================================================
// ARCHIVE MODAL — lengkap dengan foto
// Dipanggil dari openArchive('achievement')
// ================================================
function renderAchArchive() {
    const title = document.getElementById('archiveTitle');
    const body  = document.getElementById('archiveBody');
    if (!title || !body) return;

    title.innerText = 'ACHIEVEMENTS';

    if (!_achCache) {
        body.innerHTML = '<p style="color:var(--text-dim);font-size:12px;">Memuat achievement...</p>';
        fetch('/nexus/backend/check_achievements.php')
            .then(res => {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(data => {
                if (!data.success) throw new Error(data.message || 'Gagal memuat achievement');
                _achCache = data.data || [];
                buildArchiveHTML(body, _achCache);
            })
            .catch(err => {
                console.error('Achievement archive error:', err);
                body.innerHTML = '<p style="color:var(--text-dim);font-size:12px;">Achievement sedang tidak bisa dimuat. Coba refresh halaman.</p>';
            });
        return;
    }

    buildArchiveHTML(body, _achCache);
}

function resolveAchievementImage(ach) {
    const raw = (ach.image || '').trim();

    if (!raw) return null;
    if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
    if (raw.startsWith('asset/')) return '/nexus/' + raw;
    if (raw.startsWith('achievements/')) return '/nexus/asset/' + raw;
    if (/\.(png|jpe?g|gif|webp)$/i.test(raw)) return '/nexus/asset/achievements/' + raw.replace(/^\/+/, '');

    return '/nexus/asset/achievements/' + raw.replace(/^\/+/, '');
}

function buildArchiveHTML(body, list) {
    body.innerHTML = `<div class="ach-archive-grid"></div>`;
    const grid = body.querySelector('.ach-archive-grid');

    list.forEach(ach => {
        const card = document.createElement('div');
        card.className = 'ach-arc-card' + (ach.unlocked ? ' unlocked' : ' locked');

        const imageSrc = resolveAchievementImage(ach);

        card.innerHTML = `
            <div class="ach-arc-img">
                ${ach.unlocked && imageSrc
                    ? `<img src="${imageSrc}" alt="${ach.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\"ach-arc-lock\">🏆</div>'">`
                    : `<div class="ach-arc-lock">${ach.unlocked ? '🔒' : '🔒'}</div>`
                }
            </div>
            <div class="ach-arc-name">${ach.unlocked ? ach.name : '???'}</div>
            <div class="ach-arc-desc">${ach.unlocked ? ach.description : 'Belum terbuka'}</div>
            ${ach.unlocked && ach.unlocked_at
                ? `<div class="ach-arc-date">✓ ${formatAchDate(ach.unlocked_at)}</div>`
                : ''}
        `;

        grid.appendChild(card);
    });
}

function defaultAchIcon() {
    const div = document.createElement('div');
    div.className = 'ach-arc-lock';
    div.textContent = '⬢';
    return div;
}

function formatAchDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}
