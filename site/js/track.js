/* Pista rectilinie: axa Ox, mobilul (căruț), vectorii v și a, urmele stroboscopice. */
(function () {
  const MR = window.MR;

  function arrow(ctx, x1, y, x2, color, label) {
    const len = x2 - x1;
    if (Math.abs(len) < 2) return;
    const dir = Math.sign(len), head = Math.min(9, Math.abs(len));
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2 - dir * head * 0.8, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - dir * head, y - 5); ctx.lineTo(x2 - dir * head, y + 5); ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = 'italic 600 14px Fraunces, Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const lx = x2 + dir * 10;
      ctx.fillText(label, lx, y + 6);
      // săgeata mică de vector deasupra literei
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(lx - 4, y - 10); ctx.lineTo(lx + 4, y - 10); ctx.lineTo(lx + 2, y - 12); ctx.stroke();
    }
  }

  class Track {
    constructor(canvas, o = {}) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.o = Object.assign({ min: -100, max: 100, lanes: 1, unit: 'm', name: 'x' }, o);
      this.scene = { bodies: [] };
      new ResizeObserver(() => this.resize()).observe(canvas);
      MR.onRedraw(() => this.render());
    }
    setRange(min, max) { this.o.min = min; this.o.max = max; this.render(); }
    resize() {
      const r = this.c.getBoundingClientRect();
      if (!r.width) return;
      const dpr = window.devicePixelRatio || 1;
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * dpr); this.c.height = Math.round(r.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.render();
    }
    set(scene) { this.scene = scene; this.render(); }
    X(x) { const { min, max } = this.o; return 28 + ((x - min) / (max - min)) * (this.w - 56); }

    render() {
      if (!this.w) return;
      const ctx = this.ctx, W = this.w, H = this.h, o = this.o, s = this.scene;
      const col = { ink: MR.css('--ink'), ink2: MR.css('--ink-2'), muted: MR.css('--muted'), line: MR.css('--line-strong'), grid: MR.css('--line'), card: MR.css('--card') };
      ctx.clearRect(0, 0, W, H);
      const axisY = H - 30;

      // axa
      ctx.strokeStyle = col.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(14, axisY); ctx.lineTo(W - 12, axisY); ctx.stroke();
      ctx.fillStyle = col.line;
      ctx.beginPath(); ctx.moveTo(W - 6, axisY); ctx.lineTo(W - 14, axisY - 4); ctx.lineTo(W - 14, axisY + 4); ctx.closePath(); ctx.fill();
      ctx.font = 'italic 13px Fraunces, Georgia, serif'; ctx.fillStyle = col.ink2;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText(`${o.name} (${o.unit})`, W - 8, axisY - 6);

      const step = MR.niceStep(o.max - o.min, Math.max(4, Math.floor(W / 70)));
      ctx.font = '11px "JetBrains Mono", Consolas, monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let x = Math.ceil(o.min / step) * step; x <= o.max + 1e-9; x += step) {
        const px = this.X(x), zero = Math.abs(x) < 1e-9;
        ctx.strokeStyle = zero ? col.ink2 : col.line; ctx.lineWidth = zero ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(px, axisY - (zero ? 7 : 4)); ctx.lineTo(px, axisY + (zero ? 7 : 4)); ctx.stroke();
        ctx.fillStyle = zero ? col.ink : col.muted;
        ctx.fillText(zero ? 'O' : MR.fmt(x, step < 1 ? 1 : 0), px, axisY + 9);
      }
      // linii fine pentru fiecare bandă
      const laneH = (axisY - 16) / o.lanes;
      const laneY = (i) => 16 + laneH * (i + 0.62);
      for (let i = 0; i < o.lanes; i++) {
        ctx.strokeStyle = col.grid; ctx.setLineDash([2, 5]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(this.X(o.min), laneY(i) + 9); ctx.lineTo(this.X(o.max), laneY(i) + 9); ctx.stroke();
        ctx.setLineDash([]);
      }

      // marcaje fixe (ex.: poziția inițială, locul întâlnirii)
      (s.marks || []).forEach((m) => {
        if (m.x < o.min || m.x > o.max) return;
        const px = this.X(m.x);
        ctx.strokeStyle = m.color || col.muted; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, 10); ctx.lineTo(px, axisY); ctx.stroke(); ctx.setLineDash([]);
        if (m.label) {
          ctx.font = '11px "Source Sans 3", sans-serif'; ctx.fillStyle = m.color || col.muted;
          ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(m.label, px, 0);
        }
      });

      // segmente (ex.: deplasarea Δx)
      (s.segments || []).forEach((g) => {
        const y = laneY(g.lane || 0) - 26;
        arrow(ctx, this.X(g.from), y, this.X(g.to), g.color, null);
        ctx.font = 'italic 13px Fraunces, Georgia, serif'; ctx.fillStyle = g.color;
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(g.label || '', (this.X(g.from) + this.X(g.to)) / 2, y - 5);
      });

      // urme stroboscopice
      (s.strobe || []).forEach((p) => {
        if (p.x < o.min || p.x > o.max) return;
        ctx.fillStyle = MR.alpha(p.color, 0.3); ctx.strokeStyle = MR.alpha(p.color, 0.65); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(this.X(p.x), laneY(p.lane || 0) + 9, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });

      // corpurile
      s.bodies.forEach((b) => {
        const y = laneY(b.lane || 0);
        let px = this.X(b.x);
        if (b.x < o.min || b.x > o.max) {
          // corpul a ieșit de pe pistă: indicator la margine
          const left = b.x < o.min; px = left ? 10 : W - 10;
          ctx.fillStyle = b.color;
          ctx.beginPath(); ctx.moveTo(px + (left ? -4 : 4), y); ctx.lineTo(px + (left ? 6 : -6), y - 7); ctx.lineTo(px + (left ? 6 : -6), y + 7); ctx.closePath(); ctx.fill();
          return;
        }
        if (b.shape === 'point') {
          ctx.fillStyle = b.color; ctx.strokeStyle = col.card; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(px, y + 9, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        } else {
          // căruț cu roți
          const w = 30, h = 15;
          ctx.fillStyle = b.color;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(px - w / 2, y - h / 2, w, h, 4) : ctx.rect(px - w / 2, y - h / 2, w, h); ctx.fill();
          ctx.fillStyle = col.ink;
          [-8, 8].forEach((dx) => { ctx.beginPath(); ctx.arc(px + dx, y + h / 2 + 2, 3.2, 0, Math.PI * 2); ctx.fill(); });
          ctx.fillStyle = col.ink; ctx.beginPath(); ctx.arc(px, y + 9, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        if (b.label) {
          ctx.font = '600 11px "Source Sans 3", sans-serif'; ctx.fillStyle = col.card;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          if (b.shape !== 'point') ctx.fillText(b.label, px, y);
        }
        const scaleV = s.vScale || 4, scaleA = s.aScale || 10;
        if (s.showV !== false && b.v !== undefined) arrow(ctx, px, y - 18, px + MR.clamp(b.v * scaleV, -W * 0.4, W * 0.4), b.vColor || MR.css('--c-v'), 'v');
        if (s.showA && b.a !== undefined && Math.abs(b.a) > 1e-9) arrow(ctx, px, y - 34, px + MR.clamp(b.a * scaleA, -W * 0.3, W * 0.3), MR.css('--c-a'), 'a');
        if (b.flash) {
          ctx.strokeStyle = MR.alpha(b.color, 0.5); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(px, y + 2, 20 + b.flash * 10, 0, Math.PI * 2); ctx.stroke();
        }
      });
    }
  }
  MR.Track = Track;
})();
