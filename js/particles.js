/* ================================================================
   GLITTER PARTICLE SYSTEM
   ================================================================ */

class Particle {
  constructor(cx, cy) {
    const spread = 220;
    this.x  = cx + (Math.random() - 0.5) * spread;
    this.y  = cy + (Math.random() - 0.5) * (spread * 0.6);
    this.sz = Math.random() * 2.8 + 0.4;
    this.col = this._randomColor();
    this.vx  = (Math.random() - 0.5) * 1.2;
    this.vy  = (Math.random() - 0.5) * 1.2 - 0.4;
    this.alpha = Math.random() * 0.7 + 0.3;
    this.alphaDir = (Math.random() > 0.5 ? 1 : -1) * 0.025;
    this.life  = 1;
    this.decay = Math.random() * 0.007 + 0.003;
    this.isStar = Math.random() > 0.55;
    this.rot = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.07;
  }

  _randomColor() {
    const p = [
      '#ffd700','#d4af37','#f0e68c','#fffacd',
      '#ffffff','#ffeaa0','#c9a227','#ffe97d',
    ];
    return p[Math.floor(Math.random() * p.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.012;
    this.alpha += this.alphaDir;
    if (this.alpha > 1)   this.alphaDir = -Math.abs(this.alphaDir);
    if (this.alpha < 0.1) this.alphaDir =  Math.abs(this.alphaDir);
    this.rot  += this.rotV;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.alpha * this.life * 1.2);
    ctx.fillStyle   = this.col;
    ctx.shadowBlur  = 7;
    ctx.shadowColor = this.col;
    if (this.isStar) {
      this._drawStar(ctx);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawStar(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    const r  = this.sz * 2.2;
    const ir = r * 0.35;
    const n  = 4;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a   = (i * Math.PI) / n - Math.PI / 2;
      const rad = i % 2 === 0 ? r : ir;
      const x   = Math.cos(a) * rad;
      const y   = Math.sin(a) * rad;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  get dead() { return this.life <= 0; }
}

class GlitterCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx    = this.canvas.getContext('2d');
    this.pool   = [];
    this._raf   = null;
    this.active = false;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cx = this.canvas.width  / 2;
    this.cy = this.canvas.height / 2;
  }

  _emit(n = 6) {
    for (let i = 0; i < n; i++) {
      this.pool.push(new Particle(this.cx, this.cy));
    }
  }

  burst(n = 60) {
    for (let i = 0; i < n; i++) {
      this.pool.push(new Particle(this.cx, this.cy));
    }
  }

  start() {
    this.active = true;
    this._loop();
  }

  stop() {
    this.active = false;
  }

  _loop() {
    this._raf = requestAnimationFrame(() => this._loop());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.active) this._emit(4);
    this.pool = this.pool.filter(p => !p.dead);
    this.pool.forEach(p => { p.update(); p.draw(this.ctx); });
  }

  destroy() {
    cancelAnimationFrame(this._raf);
  }
}

window.GlitterCanvas = GlitterCanvas;
