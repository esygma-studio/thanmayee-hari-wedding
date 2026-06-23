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

  /*
   * Unlock ALL event videos immediately while we are still inside the
   * tap/click event handler — the only guaranteed user-gesture context
   * on iOS Safari.  Setting .muted and .playsinline as JS properties
   * (not just HTML attributes) is required for iOS to honour them.
   */
  document.querySelectorAll('video.ev-img').forEach(function(v) {
    v.muted     = true;
    v.playsInline = true;
    var p = v.play();
    if (p !== undefined) p.catch(function() {});
  });

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

  /* Force-play event videos as they scroll into view.
     iOS ignores the autoplay attribute for off-screen elements;
     an explicit .play() call triggered by IntersectionObserver is required. */
  const videoObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const v = entry.target;
        v.muted      = true;
        v.playsInline = true;
        const p = v.play();
        if (p !== undefined) p.catch(() => {});
      }
    });
  }, { threshold: 0 });

  document.querySelectorAll('video.ev-img').forEach(v => videoObs.observe(v));
}

/* ================================================================
   YOUTUBE BACKGROUND MUSIC
   ================================================================ */
var ytPlayer      = null;
var userPaused    = false;
var userInteracted = false; /* tracks whether a real gesture has occurred */

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    videoId: '5qsRz1mjI60',
    playerVars: {
      autoplay:       1,
      controls:       0,
      mute:           1,   /* satisfies non-iOS autoplay policy */
      loop:           1,
      playlist:       '5qsRz1mjI60',
      modestbranding: 1,
      rel:            0,
      fs:             0,
      playsinline:    1,   /* CRITICAL for iOS — prevents fullscreen takeover */
    },
    events: {
      onReady: function(e) {
        e.target.playVideo();
        e.target.unMute();
        e.target.setVolume(55);
        /* If user already tapped before player was ready, start immediately */
        if (userInteracted) {
          e.target.playVideo();
          e.target.unMute();
        }
        _startWatchdog();
      },
      onStateChange: function(e) {
        if (userPaused) return;
        /*
         * iOS fires -1 (unstarted) or 0 (ended) when the song finishes.
         * Both need the same response: seek to start and replay.
         */
        if (e.data === YT.PlayerState.ENDED || e.data === -1) {
          setTimeout(function() {
            if (!userPaused && ytPlayer) {
              ytPlayer.seekTo(0);
              ytPlayer.playVideo();
              ytPlayer.unMute();
              ytPlayer.setVolume(55);
            }
          }, 200);
        }
        if (e.data === YT.PlayerState.PAUSED) {
          setTimeout(function() {
            if (!userPaused && ytPlayer &&
                ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
              ytPlayer.playVideo();
            }
          }, 600);
        }
      }
    }
  });
}

/*
 * Two-tier watchdog:
 * 1. State check every 2 s — restarts if not playing and user hasn't paused.
 * 2. Time check every 800 ms — proactively loops 1.5 s before the track ends.
 *    This is the most reliable loop mechanism on iOS Safari where onStateChange
 *    ENDED often fires too late or not at all.
 */
function _startWatchdog() {
  setInterval(function() {
    if (!ytPlayer || userPaused) return;
    var s = ytPlayer.getPlayerState();
    if (s === -1 || s === 0 || s === 2 || s === 5) {
      ytPlayer.playVideo();
      ytPlayer.unMute();
      ytPlayer.setVolume(55);
    }
  }, 2000);

  setInterval(function() {
    if (!ytPlayer || userPaused) return;
    try {
      var duration = ytPlayer.getDuration();
      var current  = ytPlayer.getCurrentTime();
      if (duration > 0 && current > 0 && (duration - current) < 1.5) {
        ytPlayer.seekTo(0);
        ytPlayer.playVideo();
      }
    } catch (err) {}
  }, 800);
}

/* Start music on first user interaction — the only reliable way on iOS */
function _startOnInteraction() {
  userInteracted = true;
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
document.addEventListener('click',      _startOnInteraction, { passive: true });
document.addEventListener('touchstart', _startOnInteraction, { passive: true });

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

  /* Send email via /api/rsvp (Resend — server-side, key stays secret) */
  fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guest_name:       name,
      guest_phone:      phone,
      rsvp_status:      rsvp      || 'Not selected',
      headcount:        headcount || 'Not selected',
      rooting_for:      rooting   || 'Not selected',
      excited_level:    excited   || 'Not selected',
      fav_event:        favEvent  || 'Not selected',
      events_attending: attending || 'None selected',
      wishes:           wishes    || '—',
    }),
  }).catch(function(err) { console.warn('RSVP email error:', err); });

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
