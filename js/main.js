/* ================================================================
   GLITTER + NAME REVEAL
   ================================================================ */
const glitter = new GlitterCanvas('glitter-canvas');

const NAME_STEPS = [
  { id: 'n0',   delay: 500  },
  { id: 'n1',   delay: 900  },
  { id: 'n2',   delay: 1300 },
  { id: 'n3',   delay: 2000 },
  { id: 'n4',   delay: 2350 },
  { id: 'n5',   delay: 3100 },
  { id: 'n6',   delay: 3500 },
  { id: 'n7',   delay: 3900 },
  { id: 'n-cd', delay: 4300 },
  { id: 'n8',   delay: 4800 },
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
    temple.style.opacity      = '0';
    temple.style.pointerEvents = 'none';
  }, 400);

  setTimeout(() => {
    temple.style.display = 'none';
    glitter.start();
    initPetals();
    startMusic();
  }, 1200);

  NAME_STEPS.forEach(({ id, delay }) => {
    setTimeout(() => revealEl(id), delay);
  });

  setTimeout(() => {
    glitter.stop();
    document.getElementById('glitter-canvas').classList.add('fade-out');
  }, 7000);

  startCountdown();
  initScrollReveal();
}

/* ================================================================
   COUNTDOWN TIMER (in hero)
   ================================================================ */
const WEDDING = new Date('2026-10-31T11:54:00');
function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const diff = WEDDING - new Date();
  if (diff <= 0) {
    ['hcd-days','hcd-hours','hcd-mins','hcd-secs'].forEach(id => {
      document.getElementById(id).textContent = '00';
    });
    return;
  }
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5)  / 6e4);
  const s = Math.floor((diff % 6e4)   / 1e3);
  document.getElementById('hcd-days').textContent  = pad(d);
  document.getElementById('hcd-hours').textContent = pad(h);
  document.getElementById('hcd-mins').textContent  = pad(m);
  document.getElementById('hcd-secs').textContent  = pad(s);
}

function startCountdown() { tick(); setInterval(tick, 1000); }

/* ================================================================
   FALLING PETALS
   ================================================================ */
function initPetals() {
  const layer = document.getElementById('petalLayer');
  if (!layer) return;

  const colors = [
    'rgba(165,155,96,0.35)',
    'rgba(200,180,120,0.3)',
    'rgba(100,150,110,0.4)',
    'rgba(75,117,80,0.35)',
    'rgba(240,210,140,0.28)',
  ];

  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.left             = Math.random() * 100 + '%';
    p.style.width            = (5 + Math.random() * 7) + 'px';
    p.style.height           = (9 + Math.random() * 10) + 'px';
    p.style.background       = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration  = (8 + Math.random() * 10) + 's';
    p.style.animationDelay     = (-Math.random() * 10) + 's';
    p.style.borderRadius       = Math.random() > 0.5
      ? '60% 40% 60% 40%'
      : '50% 50% 40% 60%';
    layer.appendChild(p);
  }
}

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-scroll]').forEach(el => observer.observe(el));
}

/* ================================================================
   YOUTUBE BACKGROUND MUSIC
   ================================================================ */
var ytPlayer = null;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    videoId: '5qsRz1mjI60',
    playerVars: {
      autoplay: 0, controls: 0,
      loop: 1, playlist: '5qsRz1mjI60',
      modestbranding: 1, rel: 0, fs: 0,
    },
    events: {
      onReady: function(e) { e.target.setVolume(55); }
    }
  });
}

function startMusic() {
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
    const btn = document.getElementById('music-toggle');
    btn.classList.add('visible', 'playing');
  } else {
    setTimeout(startMusic, 600);
  }
}

function toggleMusic() {
  if (!ytPlayer) return;
  const btn  = document.getElementById('music-toggle');
  const icon = document.getElementById('music-icon');
  if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
    ytPlayer.pauseVideo();
    btn.classList.remove('playing');
    icon.textContent = '🔇';
  } else {
    ytPlayer.playVideo();
    btn.classList.add('playing');
    icon.textContent = '🎵';
  }
}

/* ================================================================
   RSVP FORM
   ================================================================ */
function selectToggle(btn) {
  const group = btn.dataset.group;
  document.querySelectorAll(`.rf-toggle[data-group="${group}"]`).forEach(b => {
    b.classList.remove('active');
  });
  btn.classList.add('active');
}

function selectMulti(btn) {
  btn.classList.toggle('active');
}

function submitRSVP(e) {
  e.preventDefault();
  const form   = document.getElementById('rsvpForm');
  const thanks = document.getElementById('rsvpThanks');
  form.style.display   = 'none';
  thanks.style.display = 'flex';
}
