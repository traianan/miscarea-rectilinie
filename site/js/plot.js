/* Grafic pe canvas pentru mărimi în funcție de timp: x(t), v(t), a(t).
   Scena: { t0, t1, yMin?, yMax?, yName, unit, series[], areas[], points[], vlines[], cursor } */
(function () {
  const MR = window.MR;

  class Plot {
    constructor(canvas, o = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ xName: 't', xUnit: 's', pad: { l: 50, r: 14, t: 30, b: 30 } }, o);
      this.scene = null;
      this.hoverT = null;
      this.w = 0; this.h = 0;
      new ResizeObserver(() => this.resize()).observe(canvas);
      canvas.addEventListener('pointermove', (e) => {
        const t = this.pxToT(e);
        if (this.drag && this.o.onScrub) this.o.onScrub(t);
        this.hoverT = t;
        this.render();
      });
      canvas.addEventListener('pointerleave', () => { this.hoverT = null; this.render(); });
      canvas.addEventListener('pointerdown', (e) => {
        if (!this.o.onScrub) return;
        this.drag = true;
        canvas.setPointerCapture(e.pointerId);
        this.o.onScrub(this.pxToT(e));
      });
      canvas.addEventListener('pointerup', () => (this.drag = false));
      MR.onRedraw(() => this.render());
    }
    resize() {
      const r = this.c.getBoundingClientRect();
      if (!r.width) return;
      const dpr = window.devicePixelRatio || 1;
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * dpr);
      this.c.height = Math.round(r.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (this.scene) this.computeY();
      this.render();
    }
    pxToT(e) {
      const r = this.c.getBoundingClientRect();
      const { l, r: pr } = this.o.pad;
      const s = this.scene;
      if (!s) return 0;
      const f = MR.clamp((e.clientX - r.left - l) / (r.width - l - pr), 0, 1);
      return s.t0 + f * (s.t1 - s.t0);
    }
    set(scene) { this.scene = scene; this.computeY(); this.render(); }
    setCursor(t) { if (this.scene) { this.scene.cursor = t; this.render(); } }

    computeY() {
      const s = this.scene;
      let lo = s.yMin, hi = s.yMax;
      if (lo === undefined || hi === undefined) {
        let mn = 0, mx = 0;
        s.series.forEach((se) => {
          const a = se.from ?? s.t0, b = se.to ?? s.t1;
          for (let i = 0; i <= 120; i++) {
            const y = se.fn(a + ((b - a) * i) / 120);
            if (isFinite(y)) { mn = Math.min(mn, y); mx = Math.max(mx, y); }
          }
        });
        if (mx - mn < 1e-6) { mx += 1; mn -= 1; }
        const padv = (mx - mn) * 0.1;
        lo = lo ?? mn - (mn < 0 ? padv : 0);
        hi = hi ?? mx + (mx > 0 ? padv : 0);
        if (mn === 0) lo = Math.min(lo, -padv * 0.4);
        if (mx === 0) hi = Math.max(hi, padv * 0.4);
      }
      this.step = MR.niceStep(hi - lo, MR.clamp(((this.h || 200) - this.o.pad.t - this.o.pad.b) / 34, 3, 6));
      this.y0 = Math.floor(lo / this.step) * this.step;
      this.y1 = Math.ceil(hi / this.step) * this.step;
    }

    render() {
      const s = this.scene, ctx = this.ctx;
      if (!s || !this.w) return;
      const W = this.w, H = this.h, P = this.o.pad;
      const X = (t) => P.l + ((t - s.t0) / (s.t1 - s.t0)) * (W - P.l - P.r);
      const Y = (y) => P.t + (1 - (y - this.y0) / (this.y1 - this.y0)) * (H - P.t - P.b);
      const col = {
        grid: MR.css('--grid'), line: MR.css('--line-strong'), muted: MR.css('--muted'),
        ink: MR.css('--ink'), ink2: MR.css('--ink-2'), card: MR.css('--card'), border: MR.css('--line'),
      };
      ctx.clearRect(0, 0, W, H);
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';

      // grilă + valori pe axa y
      ctx.lineWidth = 1;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let y = this.y0; y <= this.y1 + 1e-9; y += this.step) {
        const py = Math.round(Y(y)) + 0.5;
        ctx.strokeStyle = Math.abs(y) < 1e-9 ? col.line : col.grid;
        ctx.beginPath(); ctx.moveTo(P.l, py); ctx.lineTo(W - P.r, py); ctx.stroke();
        ctx.fillStyle = col.muted;
        ctx.fillText(MR.fmt(y, this.step < 1 ? 1 : 0), P.l - 7, py);
      }
      const ts = MR.niceStep(s.t1 - s.t0, 8);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let t = Math.ceil(s.t0 / ts) * ts; t <= s.t1 + 1e-9; t += ts) {
        const px = Math.round(X(t)) + 0.5;
        ctx.strokeStyle = t === 0 ? col.line : col.grid;
        ctx.beginPath(); ctx.moveTo(px, P.t); ctx.lineTo(px, H - P.b); ctx.stroke();
        ctx.fillStyle = col.muted;
        ctx.fillText(MR.fmt(t, ts < 1 ? 1 : 0), px, H - P.b + 6);
      }
      // titluri de axe
      ctx.fillStyle = col.ink2;
      ctx.font = 'italic 13px Fraunces, Georgia, serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(`${s.yName} (${s.unit})`, 6, 14);
      ctx.textAlign = 'right';
      ctx.fillText(`${this.o.xName} (${this.o.xUnit})`, W - P.r, H - P.b - 6);

      ctx.save();
      ctx.beginPath(); ctx.rect(P.l, P.t - 2, W - P.l - P.r, H - P.t - P.b + 4); ctx.clip();

      // arii (ex.: aria de sub v(t) = deplasarea)
      (s.areas || []).forEach((a) => {
        const from = Math.max(a.from, s.t0), to = Math.min(a.to, s.t1);
        if (to <= from) return;
        ctx.fillStyle = MR.alpha(a.color, a.alpha ?? 0.16);
        ctx.beginPath(); ctx.moveTo(X(from), Y(0));
        for (let i = 0; i <= 160; i++) { const t = from + ((to - from) * i) / 160; ctx.lineTo(X(t), Y(a.fn(t))); }
        ctx.lineTo(X(to), Y(0)); ctx.closePath(); ctx.fill();
      });

      // linii verticale de referință
      (s.vlines || []).forEach((v) => {
        if (v.t < s.t0 || v.t > s.t1) return;
        ctx.strokeStyle = v.color || col.ink2; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X(v.t), P.t); ctx.lineTo(X(v.t), H - P.b); ctx.stroke();
        ctx.setLineDash([]);
        if (v.label) {
          ctx.font = '11px "Source Sans 3", sans-serif'; ctx.fillStyle = col.ink2;
          const right = X(v.t) > W - 80;
          ctx.textAlign = right ? 'right' : 'left'; ctx.textBaseline = 'top';
          ctx.fillText(v.label, X(v.t) + (right ? -5 : 5), P.t + 2);
        }
      });

      // serii
      s.series.forEach((se) => {
        const a = Math.max(se.from ?? s.t0, s.t0), b = Math.min(se.to ?? s.t1, s.t1);
        if (b < a) return;
        ctx.strokeStyle = se.color; ctx.lineWidth = se.width || 2;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.setLineDash(se.dash || []);
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= 300; i++) {
          const t = a + ((b - a) * i) / 300, y = se.fn(t);
          if (!isFinite(y)) { pen = false; continue; }
          pen ? ctx.lineTo(X(t), Y(y)) : ctx.moveTo(X(t), Y(y));
          pen = true;
        }
        ctx.stroke(); ctx.setLineDash([]);
      });

      const dot = (px, py, color, r = 5) => {
        ctx.fillStyle = color; ctx.strokeStyle = col.card; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      };
      // puncte marcate (intersecții, vârful parabolei…)
      (s.points || []).forEach((p) => {
        if (p.t < s.t0 - 1e-9 || p.t > s.t1 + 1e-9) return;
        dot(X(p.t), Y(p.y), p.color, 5.5);
        if (p.label) {
          ctx.font = '600 11px "Source Sans 3", sans-serif'; ctx.fillStyle = col.ink;
          const tw = ctx.measureText(p.label).width, px = X(p.t);
          let lx = px + 8;
          if (lx + tw > W - P.r) lx = px - 8 - tw >= P.l ? px - 8 - tw : Math.max(P.l + 2, W - P.r - tw);
          ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText(p.label, lx, Math.max(P.t + 14, Y(p.y) - 6));
        }
      });
      ctx.restore();

      // cursorul momentului curent
      if (s.cursor !== undefined && s.cursor !== null) {
        const px = X(s.cursor);
        ctx.strokeStyle = MR.alpha(col.ink.startsWith('#') ? col.ink : '#555555', 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, P.t); ctx.lineTo(px, H - P.b); ctx.stroke();
        s.series.forEach((se) => {
          if (se.noCursor) return;
          const a = se.from ?? s.t0, b = se.to ?? s.t1;
          if (s.cursor < a || s.cursor > b) return;
          const y = se.fn(s.cursor);
          if (isFinite(y)) dot(px, Y(y), se.color, 5);
        });
      }

      // tooltip la hover
      if (this.hoverT !== null && !this.drag) {
        const t = this.hoverT, px = X(t);
        ctx.strokeStyle = col.muted; ctx.setLineDash([2, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, P.t); ctx.lineTo(px, H - P.b); ctx.stroke(); ctx.setLineDash([]);
        const rows = [[null, `${this.o.xName} = ${MR.fmt(t, 2)} ${this.o.xUnit}`]];
        s.series.forEach((se) => {
          const a = se.from ?? s.t0, b = se.to ?? s.t1;
          if (t < a || t > b) return;
          const y = se.fn(t);
          if (isFinite(y)) rows.push([se.color, `${se.label || s.yName} = ${MR.fmt(y, 2)} ${s.unit}`]);
        });
        ctx.font = '12px "JetBrains Mono", Consolas, monospace';
        const bw = Math.max(...rows.map((r) => ctx.measureText(r[1]).width)) + 30;
        const bh = rows.length * 18 + 10;
        let bx = px + 12; if (bx + bw > W - 4) bx = px - 12 - bw;
        const by = P.t + 4;
        ctx.fillStyle = col.card; ctx.strokeStyle = col.border; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        rows.forEach((r, i) => {
          const ry = by + 14 + i * 18;
          if (r[0]) { ctx.fillStyle = r[0]; ctx.fillRect(bx + 9, ry - 1.5, 10, 3); }
          ctx.fillStyle = i === 0 ? col.muted : col.ink;
          ctx.fillText(r[1], bx + (r[0] ? 24 : 9), ry);
        });
      }
    }
  }
  MR.Plot = Plot;
})();
