/* Nucleul aplicației: utilitare, sunete, controale, cronometru de animație. */
(function () {
  const MR = (window.MR = window.MR || {});

  /* ---------- utilitare ---------- */
  MR.css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  MR.$ = (sel, root = document) => root.querySelector(sel);
  MR.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  MR.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Format românesc: virgulă zecimală, minus tipografic.
  MR.fmt = (v, d = 2) => {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    if (Math.abs(v) < 0.5 * Math.pow(10, -d)) v = 0;
    let s = v.toFixed(d).replace('.', ',');
    if (s[0] === '-') s = '−' + s.slice(1);
    return s;
  };
  // Număr cu semn explicit, pentru ecuații: "+ 3,5" / "− 3,5"
  MR.sgn = (v, d = 1) => (v < 0 ? '− ' : '+ ') + MR.fmt(Math.abs(v), d);
  MR.par = (v, d = 1) => (v < 0 ? '(' + MR.fmt(v, d) + ')' : MR.fmt(v, d));

  MR.alpha = (color, a) => {
    if (color.startsWith('#')) {
      let h = color.slice(1);
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    return color;
  };

  MR.niceStep = (range, target) => {
    if (!(range > 0)) return 1;
    const raw = range / target;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  };

  /* ---------- sunete (Web Audio, fără fișiere) ---------- */
  const S = (MR.sound = { on: true, ctx: null });
  function ac() {
    if (!S.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      S.ctx = new C();
    }
    if (S.ctx.state === 'suspended') S.ctx.resume();
    return S.ctx;
  }
  S.tone = (freq, dur = 0.12, o = {}) => {
    if (!S.on) return;
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.16, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  };
  S.tick = () => S.tone(1500, 0.035, { type: 'triangle', vol: 0.05 });
  S.strobe = () => S.tone(1250, 0.03, { vol: 0.05 });
  S.origin = () => S.tone(880, 0.16, { vol: 0.15 });
  S.stop = () => { S.tone(660, 0.12, { vol: 0.15 }); S.tone(440, 0.22, { delay: 0.12, vol: 0.15 }); };
  S.meet = () => [523.25, 659.25, 783.99].forEach((f, i) => S.tone(f, 0.25, { delay: i * 0.09, vol: 0.13 }));
  S.end = () => { S.tone(784, 0.12, { vol: 0.1 }); S.tone(523, 0.28, { delay: 0.12, vol: 0.1 }); };
  S.edge = () => S.tone(330, 0.2, { type: 'triangle', vol: 0.12, slideTo: 250 });
  S.ok = () => { S.tone(660, 0.1, { vol: 0.13 }); S.tone(990, 0.2, { delay: 0.1, vol: 0.13 }); };
  S.err = () => S.tone(240, 0.28, { type: 'triangle', vol: 0.14, slideTo: 170 });
  S.click = () => S.tone(1000, 0.025, { vol: 0.04 });
  S.lap = () => S.tone(1046.5, 0.09, { vol: 0.07 });

  /* ---------- controale: slider + câmp numeric sincronizate ---------- */
  function paintFill(r) {
    const min = +r.min, max = +r.max;
    r.style.setProperty('--fill', ((+r.value - min) / (max - min)) * 100 + '%');
  }
  MR.paintFill = paintFill;

  // Leagă toate .ctl din root; cb() e apelat la orice schimbare.
  MR.bindControls = (root, cb) => {
    MR.$$('.ctl', root).forEach((ctl) => {
      const r = MR.$('input[type=range]', ctl);
      const n = MR.$('input[type=number]', ctl);
      if (!r) return;
      paintFill(r);
      if (n) {
        n.min = r.min; n.max = r.max; n.step = r.step; n.value = r.value;
        n.addEventListener('input', () => {
          if (n.value === '' || isNaN(+n.value)) return;
          r.value = MR.clamp(+n.value, +r.min, +r.max);
          paintFill(r);
          cb && cb(r.id);
        });
        n.addEventListener('change', () => { n.value = r.value; });
      }
      r.addEventListener('input', () => {
        if (n) n.value = r.value;
        paintFill(r);
        cb && cb(r.id);
      });
    });
  };
  MR.val = (id) => +document.getElementById(id).value;
  MR.setVal = (id, v) => {
    const r = document.getElementById(id);
    r.value = v;
    paintFill(r);
    const n = MR.$('input[type=number]', r.closest('.ctl'));
    if (n) n.value = r.value;
  };

  /* ---------- cronometrul animației ---------- */
  class Runner {
    constructor(o) {
      this.T = o.T; this.t = 0; this.speed = 1; this.playing = false;
      this.onFrame = o.onFrame; this.onEnd = o.onEnd; this.onState = null;
      this._loop = this._loop.bind(this);
    }
    play() {
      if (this.t >= this.T - 1e-9) this.seek(0);
      this.playing = true; this.last = performance.now();
      this.onState && this.onState(true);
      requestAnimationFrame(this._loop);
    }
    pause() { this.playing = false; this.onState && this.onState(false); }
    toggle() { this.playing ? this.pause() : this.play(); }
    reset() { this.pause(); this.seek(0); }
    seek(t) { this.t = MR.clamp(t, 0, this.T); this.onFrame(this.t, this.t, false); }
    step(dt) { this.pause(); const p = this.t; this.t = MR.clamp(this.t + dt, 0, this.T); this.onFrame(this.t, p, true); }
    _loop(now) {
      if (!this.playing) return;
      const dt = Math.min(0.05, (now - this.last) / 1000) * this.speed;
      this.last = now;
      const prev = this.t;
      this.t = Math.min(this.T, this.t + dt);
      this.onFrame(this.t, prev, true);
      if (this.t >= this.T) { this.pause(); this.onEnd && this.onEnd(); }
      else requestAnimationFrame(this._loop);
    }
  }
  MR.Runner = Runner;

  const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
  const ICON_RESET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
  const ICON_STEP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>';

  // Construiește bara de control (Start/Pauză, Reset, Pas, viteză, cursor de timp).
  MR.transport = (el, runner) => {
    el.classList.add('transport');
    el.innerHTML = `
      <button class="btn primary" data-r="play">${ICON_PLAY}<span>Start</span></button>
      <button class="btn" data-r="reset" title="De la început">${ICON_RESET}</button>
      <button class="btn" data-r="step" title="Pas înainte: 0,1 s">${ICON_STEP}</button>
      <select data-r="speed" title="Viteza animației">
        <option value="0.25">0,25×</option><option value="0.5">0,5×</option>
        <option value="1" selected>1×</option><option value="2">2×</option></select>
      <div class="time"><input type="range" data-r="time" min="0" step="0.01" aria-label="Timp">
        <span class="clock">t = 0,00 s</span></div>`;
    const play = MR.$('[data-r=play]', el);
    const time = MR.$('[data-r=time]', el);
    const clock = MR.$('.clock', el);
    time.max = runner.T;
    time.style.setProperty('--tc', 'var(--ink-2)');
    play.onclick = () => { MR.sound.click(); runner.toggle(); };
    MR.$('[data-r=reset]', el).onclick = () => { MR.sound.click(); runner.reset(); };
    MR.$('[data-r=step]', el).onclick = () => runner.step(0.1);
    MR.$('[data-r=speed]', el).onchange = (e) => (runner.speed = +e.target.value);
    time.addEventListener('input', () => { runner.pause(); runner.seek(+time.value); });
    runner.onState = (p) => {
      play.innerHTML = (p ? ICON_PAUSE : ICON_PLAY) + `<span>${p ? 'Pauză' : 'Start'}</span>`;
    };
    return {
      update(t) {
        time.max = runner.T; time.value = t; paintFill(time);
        clock.textContent = 't = ' + MR.fmt(t, 2) + ' s';
      },
    };
  };

  /* ---------- jurnal de evenimente ---------- */
  MR.logger = (ul) => ({
    add(t, html) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="t">${t === null ? '' : MR.fmt(t, 2) + ' s'}</span><span>${html}</span>`;
      ul.prepend(li);
      while (ul.children.length > 30) ul.lastChild.remove();
    },
    clear() { ul.innerHTML = ''; },
  });

  MR.flash = (el) => { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); };

  // Rădăcinile unui polinom de grad ≤ 2 (a2 t² + a1 t + a0 = 0), sortate.
  MR.roots = (a2, a1, a0) => {
    if (Math.abs(a2) < 1e-12) return Math.abs(a1) < 1e-12 ? [] : [-a0 / a1];
    const D = a1 * a1 - 4 * a2 * a0;
    if (D < 0) return [];
    const s = Math.sqrt(D);
    return [(-a1 - s) / (2 * a2), (-a1 + s) / (2 * a2)].sort((p, q) => p - q);
  };

  // Redesenare la schimbarea temei.
  MR.redrawers = [];
  MR.onRedraw = (fn) => MR.redrawers.push(fn);
  MR.redrawAll = () => MR.redrawers.forEach((f) => f());
})();
