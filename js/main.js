const glitter = new GlitterCanvas('glitter-canvas');

const NAME_STEPS = [
  { id: 'n0', delay: 500  },
  { id: 'n1', delay: 900  },
  { id: 'n2', delay: 1300 },
  { id: 'n3', delay: 2000 },
  { id: 'n4', delay: 2350 },
  { id: 'n5', delay: 3100 },
  { id: 'n6', delay: 3500 },
  { id: 'n7', delay: 3900 },
  { id: 'n8', delay: 4500 },
];

function revealEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity   = '1';
  el.style.transform = 'translateY(0)';
  if (id === 'n2' || id === 'n4') glitter.burst(55);
}

/* Temple → main site */
function openInvite() {
  const temple = document.getElementById('screen-temple');
  const img    = document.getElementById('templeImg');

  img.style.transition = 'transform 1.4s ease, opacity 1.4s ease';
  img.style.transform  = 'scale(1.18)';
  img.style.opacity    = '0';

  setTimeout(() => {
    temple.style.opacity = '0';
    temple.style.pointerEvents = 'none';
  }, 400);

  setTimeout(() => {
    temple.style.display = 'none';
    glitter.start();
  }, 1200);

  /* Reveal name elements */
  NAME_STEPS.forEach(({ id, delay }) => {
    setTimeout(() => revealEl(id), delay);
  });

  /* Fade out glitter after animation settles */
  setTimeout(() => {
    glitter.stop();
    document.getElementById('glitter-canvas').classList.add('fade-out');
  }, 7000);

  startCountdown();
}

/* Countdown */
const WEDDING = new Date('2026-10-31T11:54:00');
function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const diff = WEDDING - new Date();
  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  document.getElementById('cd-days').textContent  = pad(d);
  document.getElementById('cd-hours').textContent = pad(h);
  document.getElementById('cd-mins').textContent  = pad(m);
  document.getElementById('cd-secs').textContent  = pad(s);
}

function startCountdown() { tick(); setInterval(tick, 1000); }
