
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

authBtn.addEventListener('click', () => {
  if (phase !== 'form') return;

  phase = 'open';

  formOverlay.classList.remove('show');

  door.classList.add('open');
});


closeBtn.addEventListener('click', () => {
  phase = 'closed';

  formOverlay.classList.remove('show');
  toggleBtn.classList.remove('open');
  hint.classList.remove('hidden');
  doorInfo.classList.remove('hidden');
});
 document.getElementById("auth-btn").onclick = function () {
    window.location.href = "main.html";
  }; 