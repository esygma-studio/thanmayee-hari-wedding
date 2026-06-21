/* ================================================================
   GLITTER + NAME REVEAL
   ================================================================ */
const glitter = new GlitterCanvas('glitter-canvas');

const NAME_STEPS = [
  { id: 'n0',   delay: 500  },
  { id: 'n2',   delay: 1300 },
  { id: 'n3',   delay: 2000 },
  { id: 'n4',   delay: 2350 },
  { id: 'n5',   delay: 3100 },
  { id: 'n7',   delay: 3500 },
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

  /* Init scratch card when it scrolls into view */
  const scratchSection = document.querySelector('.s-scratch');
  let scratchInited = false;
  if (scratchSection) {
    const scratchObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !scratchInited) {
        scratchInited = true;
        initScratch();
        scratchObs.disconnect();
      }
    }, { threshold: 0.2 });
    scratchObs.observe(scratchSection);
  }
}

/* ================================================================
   YOUTUBE BACKGROUND MUSIC
   ================================================================ */
var ytPlayer   = null;
var userPaused = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    videoId: '5qsRz1mjI60',
    playerVars: {
      autoplay: 1, controls: 0, mute: 1,
      loop: 1, playlist: '5qsRz1mjI60',
      modestbranding: 1, rel: 0, fs: 0,
    },
    events: {
      onReady: function(e) {
        e.target.playVideo();
        e.target.unMute();
        e.target.setVolume(55);
        _startWatchdog();
      },
      onStateChange: function(e) {
        if (userPaused) return;
        /* Ended → loop back manually (more reliable than YT loop param) */
        if (e.data === YT.PlayerState.ENDED) {
          e.target.seekTo(0);
          e.target.playVideo();
        }
        /* Unexpectedly paused/stalled → restart after short grace period */
        if (e.data === YT.PlayerState.PAUSED) {
          setTimeout(function() {
            if (!userPaused && ytPlayer &&
                ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
              ytPlayer.playVideo();
            }
          }, 800);
        }
      }
    }
  });
}

/* Watchdog: every 3 s, restart if stalled and user hasn't paused */
function _startWatchdog() {
  setInterval(function() {
    if (!ytPlayer || userPaused) return;
    var s = ytPlayer.getPlayerState();
    /* -1=unstarted, 0=ended, 2=paused, 5=cued — all mean "not playing" */
    if (s === -1 || s === 0 || s === 2 || s === 5) {
      ytPlayer.playVideo();
      ytPlayer.unMute();
      ytPlayer.setVolume(55);
    }
  }, 3000);
}

/* Fallback: if browser blocked autoplay, unmute on first interaction */
function _startOnInteraction() {
  if (ytPlayer) {
    ytPlayer.unMute();
    ytPlayer.setVolume(55);
    if (ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
      ytPlayer.playVideo();
    }
  }
  document.removeEventListener('click',      _startOnInteraction);
  document.removeEventListener('touchstart', _startOnInteraction);
}
document.addEventListener('click',      _startOnInteraction);
document.addEventListener('touchstart', _startOnInteraction);

function toggleMusic() {
  if (!ytPlayer) return;
  const btn  = document.getElementById('music-toggle');
  const icon = document.getElementById('music-icon');
  if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
    userPaused = true;
    ytPlayer.pauseVideo();
    btn.classList.remove('playing');
    icon.textContent = '🔇';
  } else {
    userPaused = false;
    ytPlayer.playVideo();
    ytPlayer.unMute();
    ytPlayer.setVolume(55);
    btn.classList.add('playing');
    icon.textContent = '🎵';
  }
}

/* ================================================================
   FIREBASE — guest counter
   ================================================================ */
var _db = null;

function initFirebase() {
  if (typeof firebase === 'undefined' || !FIREBASE_DB_URL || FIREBASE_DB_URL.startsWith('YOUR_')) return;
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: FIREBASE_DB_URL });
    }
    _db = firebase.database();
    _db.ref('guestCount').on('value', function(snap) {
      var n = snap.val() || 0;
      var el = document.getElementById('guestCountNum');
      if (el) el.textContent = n;
    });
  } catch(e) { console.warn('Firebase init failed:', e); }
}

function _incrementGuests(n) {
  if (!_db) return;
  _db.ref('guestCount').transaction(function(current) {
    return (current || 0) + n;
  });
}

function _headcountToNumber(text) {
  if (!text) return 0;
  if (text.includes('Just Me'))       return 1;
  if (text.includes('+1'))            return 2;
  if (text.includes('+2'))            return 3;
  if (text.includes('+3'))            return 4;
  if (text.includes('+4'))            return 5;
  if (text.includes('+5'))            return 6;
  return 1;
}

/* ================================================================
   EMAILJS — send RSVP data to email
   ================================================================ */
function initEmailJS() {
  if (typeof emailjs === 'undefined' || !EMAILJS_PUBLIC_KEY || EMAILJS_PUBLIC_KEY.startsWith('YOUR_')) return;
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
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

function _getToggle(group) {
  const el = document.querySelector(`.rf-toggle[data-group="${group}"].active`);
  return el ? el.textContent.trim() : '';
}

function _getMulti(group) {
  return Array.from(document.querySelectorAll(`.rf-toggle[data-group="${group}"].active`))
    .map(b => b.textContent.trim()).join(', ') || '';
}

function submitRSVP(e) {
  e.preventDefault();

  const name       = document.querySelector('input[name="name"]').value.trim();
  const phone      = document.querySelector('input[name="phone"]').value.trim();
  const rsvp       = _getToggle('rsvp');
  const headcount  = _getToggle('headcount');
  const rooting    = _getToggle('rooting');
  const excited    = _getToggle('excited');
  const favEvent   = _getToggle('fav-event');
  const attending  = _getMulti('attending');
  const wishes     = document.querySelector('textarea[name="message"]').value.trim();

  /* Send email */
  if (typeof emailjs !== 'undefined' && !EMAILJS_SERVICE_ID.startsWith('YOUR_')) {
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      guest_name:       name,
      guest_phone:      phone,
      rsvp_status:      rsvp      || 'Not selected',
      headcount:        headcount || 'Not selected',
      rooting_for:      rooting   || 'Not selected',
      excited_level:    excited   || 'Not selected',
      fav_event:        favEvent  || 'Not selected',
      events_attending: attending || 'None selected',
      wishes:           wishes    || '—',
    }).catch(function(err) { console.warn('EmailJS error:', err); });
  }

  /* Increment guest counter only for acceptances */
  if (rsvp && rsvp.includes('Accept')) {
    _incrementGuests(_headcountToNumber(headcount));
  }

  /* Show thank-you */
  const form   = document.getElementById('rsvpForm');
  const thanks = document.getElementById('rsvpThanks');
  form.style.display   = 'none';
  thanks.style.display = 'flex';
}

/* Init on load */
initFirebase();
initEmailJS();
