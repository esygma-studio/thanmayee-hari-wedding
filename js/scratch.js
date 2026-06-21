/* ================================================================
   SCRATCH CARD
   ================================================================ */

function initScratch() {
  const container = document.querySelector('.scratch-container');
  const canvas    = document.getElementById('scratchCanvas');
  if (!container || !canvas) return;

  const W = container.offsetWidth;
  const H = container.offsetHeight;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');

  /* Draw metallic gold scratch surface */
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,    '#c4a84a');
  grad.addColorStop(0.35, '#e8cc70');
  grad.addColorStop(0.65, '#c9a840');
  grad.addColorStop(1,    '#a08030');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  /* Repeating "SCRATCH HERE" watermark */
  ctx.font      = '13px Cinzel, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.textAlign = 'left';
  for (let y = 30; y < H; y += 48) {
    for (let x = -20; x < W + 20; x += 170) {
      ctx.fillText('✦  SCRATCH HERE  ✦', x, y);
    }
  }

  /* Hand icon hint */
  ctx.font      = '44px serif';
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  ctx.textAlign = 'center';
  ctx.fillText('🖐', W / 2, H / 2 + 16);

  /* ---- Scratch logic ---- */
  let scratching = false;
  let revealed   = false;

  function getXY(e) {
    const r     = canvas.getBoundingClientRect();
    const sx    = W / r.width;
    const sy    = H / r.height;
    return [
      (e.clientX - r.left) * sx,
      (e.clientY - r.top)  * sy,
    ];
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    if (!revealed) checkReveal();
  }

  function checkReveal() {
    const data = ctx.getImageData(0, 0, W, H).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++;
    }
    if ((transparent / (W * H)) * 100 > 58) {
      revealed = true;
      celebrate();
    }
  }

  /* Mouse */
  canvas.addEventListener('mousedown', e => { scratching = true;  scratch(...getXY(e)); });
  canvas.addEventListener('mousemove', e => { if (scratching) scratch(...getXY(e)); });
  window.addEventListener('mouseup',   ()  => { scratching = false; });

  /* Touch */
  canvas.addEventListener('touchstart', e => {
    e.preventDefault(); scratching = true; scratch(...getXY(e.touches[0]));
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault(); if (scratching) scratch(...getXY(e.touches[0]));
  }, { passive: false });
  window.addEventListener('touchend', () => { scratching = false; });
}

/* ---- Trigger celebration ---- */
function celebrate() {
  /* Fade out canvas */
  const canvas = document.getElementById('scratchCanvas');
  canvas.style.transition = 'opacity 0.7s ease';
  canvas.style.opacity    = '0';
  setTimeout(() => { canvas.style.pointerEvents = 'none'; }, 700);

  /* Reveal hashtag with pop animation */
  const reward = document.getElementById('scratchReward');
  if (reward) reward.classList.add('revealed');

  /* Swap hint → done message */
  const hint = document.getElementById('scratchHint');
  const done = document.getElementById('scratchDone');
  if (hint) hint.style.display = 'none';
  if (done) done.style.display = 'block';

  /* Sound then confetti */
  playCelebrationSound();
  setTimeout(launchConfetti, 250);
}

/* ================================================================
   CELEBRATION SOUND  (Web Audio API — no file needed)
   ================================================================ */
function playCelebrationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ac = new AudioCtx();

    /* "Ta-da!" melody: G4 → C5 → E5 → G5 → C6 */
    const notes = [
      { f: 392.00, t: 0.00, d: 0.18 },
      { f: 523.25, t: 0.14, d: 0.18 },
      { f: 659.25, t: 0.26, d: 0.18 },
      { f: 783.99, t: 0.36, d: 0.28 },
      { f: 1046.5, t: 0.44, d: 0.65 },
    ];

    notes.forEach(({ f, t, d }) => {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = f;
      osc.type = 'sine';
      const start = ac.currentTime + t;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + d);
      osc.start(start);
      osc.stop(start + d + 0.05);
    });

    /* Short "yay" cheer: burst of noise */
    const buf  = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.06;
    const noise = ac.createBufferSource();
    noise.buffer = buf;
    const nGain = ac.createGain();
    const nFilter = ac.createBiquadFilter();
    nFilter.type = 'bandpass';
    nFilter.frequency.value = 2400;
    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(ac.destination);
    const ns = ac.currentTime + 0.44;
    nGain.gain.setValueAtTime(0, ns);
    nGain.gain.linearRampToValueAtTime(0.5, ns + 0.04);
    nGain.gain.exponentialRampToValueAtTime(0.001, ns + 0.28);
    noise.start(ns);
    noise.stop(ns + 0.35);
  } catch (e) {}
}

/* ================================================================
   CONFETTI / PARTY POPPERS
   ================================================================ */
function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'pointer-events:none;z-index:9999;';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const colors = [
    '#a59b60','#f0d98a','#ffffff',
    '#4b7550','#7ec8a0','#e8a0b0',
    '#f4c060','#c4b870','#80c0a0',
  ];

  const pieces = [];
  /* Two bursts — left and right like party poppers */
  function burst(cx, cy, count) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const speed = 4 + Math.random() * 9;
      pieces.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 7 + Math.random() * 9,
        h: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.25,
        alpha: 1,
      });
    }
  }

  burst(canvas.width * 0.18, canvas.height * 0.35, 60);
  burst(canvas.width * 0.82, canvas.height * 0.35, 60);
  /* Centre burst */
  burst(canvas.width * 0.5,  canvas.height * 0.3,  50);

  let raf;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.22;
      p.vx   *= 0.99;
      p.rot  += p.rotV;
      p.alpha = Math.max(0, p.alpha - 0.012);

      if (p.alpha <= 0 || p.y > canvas.height + 20) return;
      alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (alive) {
      raf = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  animate();

  /* Hard cleanup after 5 s */
  setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 5000);
}
