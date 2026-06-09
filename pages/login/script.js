'use strict';
 
const toggleBtn   = document.getElementById('toggle-btn');
const door        = document.getElementById('door');
const formOverlay = document.getElementById('form-overlay');
const hint        = document.getElementById('hint');
const doorInfo    = document.getElementById('door-info');
const closeBtn    = document.getElementById('close-form');
const authBtn     = document.getElementById('auth-btn');
 
let phase = 'closed';
 
toggleBtn.addEventListener('click', () => {
    if (phase !== 'closed') return;
 
    phase = 'form';
    formOverlay.classList.add('show');
    hint.classList.add('hidden');
    doorInfo.classList.add('hidden');
    toggleBtn.classList.add('open');
});
 
closeBtn.addEventListener('click', () => {
    phase = 'closed';
    formOverlay.classList.remove('show');
    toggleBtn.classList.remove('open');
    hint.classList.remove('hidden');
    doorInfo.classList.remove('hidden');
    clearError();
});
 
authBtn.addEventListener('click', () => {
    if (phase !== 'form') return;
 
    const email    = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();
 
    if (!email || !password) {
        showError('Email dan password wajib diisi');
        return;
    }
 
    // Loading state
    authBtn.disabled   = true;
    authBtn.textContent = 'LOADING...';
    clearError();
 
    fetch('/nexus/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Animasi pintu buka dulu, baru redirect
            phase = 'open';
            formOverlay.classList.remove('show');
            door.classList.add('open');
 
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 800);
        } else {
            showError(data.message || 'Login gagal');
            authBtn.disabled    = false;
            authBtn.textContent = 'MASUK';
        }
    })
    .catch(() => {
        showError('Tidak dapat terhubung ke server');
        authBtn.disabled    = false;
        authBtn.textContent = 'MASUK';
    });
});
 
function showError(msg) {
    let el = document.getElementById('login-error');
    if (!el) {
        el = document.createElement('div');
        el.id = 'login-error';
        el.style.cssText = 'color:#ff4444;font-size:12px;margin-top:8px;text-align:center;';
        authBtn.insertAdjacentElement('afterend', el);
    }
    el.textContent = msg;
}
 
function clearError() {
    const el = document.getElementById('login-error');
    if (el) el.textContent = '';
}