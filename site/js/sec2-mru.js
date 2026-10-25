/* Secțiunea 02 — Mișcarea rectilinie: mărimi de bază, MRU, întâlnirea a două mobile */
(function () {
  const MR = window.MR, S = MR.sound, $ = MR.$, $$ = MR.$$, f = MR.fmt;

  /* ================= Poziție, deplasare, viteză medie ================= */
  const dTrack = new MR.Track($('#dep-track'), { min: -100, max: 100 });
  function depUpdate(id) {
    let t1 = MR.val('d-t1'), t2 = MR.val('d-t2');
    if (t2 <= t1) {
      if (id === 'd-t2') { t1 = Math.max(0, t2 - 0.5); MR.setVal('d-t1', t1); t2 = MR.val('d-t2'); }
      else { t2 = Math.min(20, t1 + 0.5); MR.setVal('d-t2', t2); t1 = MR.val('d-t1'); }
    }
    const x1 = MR.val('d-x1'), x2 = MR.val('d-x2'), dx = x2 - x1, dt = t2 - t1, vm = dx / dt;
    const cx = MR.css('--c-x'), cb = MR.css('--c-b');
    dTrack.set({
      bodies: [
        { x: x1, color: cx, shape: 'point' },
        { x: x2, color: cb, shape: 'point' },
      ],
      marks: [{ x: x1, label: `x₁ (t₁ = ${f(t1, 1)} s)`, color: cx }, { x: x2, label: `x₂ (t₂ = ${f(t2, 1)} s)`, color: cb }],
      segments: dx ? [{ from: x1, to: x2, color: MR.css('--ink-2'), label: `Δx = ${f(dx, 0)} m` }] : [],
      showV: false,
    });
    $('#dep-dx').innerHTML = `= ${f(x2, 0)} − ${MR.par(x1, 0)} = <b style="color:var(--ink)">${f(dx, 0)} m</b>`;
    $('#dep-dt').innerHTML = `= ${f(t2, 1)} − ${f(t1, 1)} = <b style="color:var(--ink)">${f(dt, 1)} s</b>`;
    $('#dep-vm').innerHTML = `= <b style="color:var(--ink)">${f(vm, 2)} m/s</b> = ${f(vm * 3.6, 1)} km/h`;
    const st = $('#dep-status');
    if (dx > 0) { st.className = 'status'; st.lastElementChild.innerHTML = '<b>Δx &gt; 0</b>: corpul s-a deplasat în <b>sensul pozitiv</b> al axei, deci și viteza medie este pozitivă.'; }
    else if (dx < 0) { st.className = 'status warn'; st.lastElementChild.innerHTML = '<b>Δx &lt; 0</b>: corpul s-a deplasat în <b>sensul negativ</b> al axei, deci viteza medie este negativă.'; }
    else { st.className = 'status good'; st.lastElementChild.innerHTML = '<b>Δx = 0</b>: corpul se află în aceeași poziție. Viteza medie este nulă, chiar dacă între timp corpul s-ar fi putut mișca.'; }
  }
  MR.bindControls($('#dep-ctl'), depUpdate);
  depUpdate();
  MR.onRedraw(depUpdate);

  // convertor m/s ↔ km/h
  $('#conv-ms').addEventListener('input', (e) => { if (e.target.value !== '') $('#conv-kmh').value = +(+e.target.value * 3.6).toFixed(3); });
  $('#conv-kmh').addEventListener('input', (e) => { if (e.target.value !== '') $('#conv-ms').value = +(+e.target.value / 3.6).toFixed(3); });

  /* ================= Mișcarea rectilinie uniformă ================= */
  const M = { x0: -60, v: 8, T: 12 };
  const xm = (t) => M.x0 + M.v * t;
  const mTrack = new MR.Track($('#mru-track'), { min: -100, max: 100 });
  const scrub = (t) => { mRun.pause(); mRun.seek(t); };
  const mPx = new MR.Plot($('#mru-px'), { onScrub: scrub });
  const mPv = new MR.Plot($('#mru-pv'), { onScrub: scrub });
  const mRun = new MR.Runner({ T: 12, onFrame: mFrame, onEnd: () => { S.end(); mLog.add(M.T, 'Sfârșitul intervalului de observație.'); } });
  const mTr = MR.transport($('#mru-transport'), mRun);
  const mLog = MR.logger($('#mru-log'));

  function mSetup() {
    M.x0 = MR.val('mru-x0'); M.v = MR.val('mru-v'); M.T = MR.val('mru-T');
    mRun.T = M.T;
    const cx = MR.css('--c-x'), cv = MR.css('--c-v');
    const tO = M.v !== 0 ? -M.x0 / M.v : NaN;
    const pts = [{ t: 0, y: M.x0, color: cx, label: `x₀ = ${f(M.x0, 0)} m` }];
    if (tO > 0 && tO <= M.T) pts.push({ t: tO, y: 0, color: cx, label: `trece prin O: t = ${f(tO, 2)} s` });
    mPx.set({ t0: 0, t1: M.T, yName: 'x', unit: 'm', series: [{ fn: xm, color: cx }], points: pts });
    mPv.set({ t0: 0, t1: M.T, yName: 'v', unit: 'm/s', yMin: Math.min(0, M.v) - 2, yMax: Math.max(0, M.v) + 2,
      series: [{ fn: () => M.v, color: cv }], areas: [] });

    const sign = M.v >= 0 ? '+' : '−';
    $('#mru-eq').innerHTML = `<span class="lbl">Ecuația mișcării</span><i>x</i>(<i>t</i>) = ${f(M.x0, 0)} ${sign} ${f(Math.abs(M.v), 1)}·<i>t</i> &nbsp;<span class="muted">(m)</span>`;
    const st = $('#mru-status');
    if (M.v > 0) { st.className = 'status'; st.lastElementChild.innerHTML = `<b>v &gt; 0</b>: corpul se mișcă în <b>sensul pozitiv</b> al axei Ox; x(t) este o dreaptă crescătoare (panta = v = ${f(M.v, 1)} m/s).`; }
    else if (M.v < 0) { st.className = 'status warn'; st.lastElementChild.innerHTML = `<b>v &lt; 0</b>: corpul se mișcă în <b>sensul negativ</b> al axei Ox; x(t) este o dreaptă descrescătoare (panta = ${f(M.v, 1)} m/s).`; }
    else { st.className = 'status good'; st.lastElementChild.innerHTML = '<b>v = 0</b>: corpul este în <b>repaus</b>; x(t) este o dreaptă paralelă cu axa timpului.'; }
  }
  function mFrame(t, prev, live) {
    const x = xm(t), cx = MR.css('--c-x'), cv = MR.css('--c-v');
    const strobe = [];
    if ($('#mru-strobe').checked) for (let i = 0; i <= Math.floor(t + 1e-9); i++) strobe.push({ x: xm(i), color: cx });
    mTrack.set({ bodies: [{ x, v: M.v, color: cx }], strobe, showV: $('#mru-vec').checked, vScale: 5, marks: [{ x: M.x0, label: 'x₀', color: MR.css('--muted') }] });
    mPx.setCursor(t);
    mPv.scene.areas = [{ fn: () => M.v, from: 0, to: t, color: cv, alpha: 0.2 }];
    mPv.setCursor(t);
    mTr.update(t);
    $('#mru-rt').textContent = f(t, 2) + ' s';
    $('#mru-rx').textContent = f(x, 2) + ' m';
    $('#mru-rv').textContent = f(M.v, 2) + ' m/s';
    $('#mru-rdx').textContent = f(x - M.x0, 2) + ' m';
    $('#mru-rd').textContent = f(Math.abs(x - M.x0), 2) + ' m';
    if (!live) return;
    const xp = xm(prev);
    if (M.v !== 0 && ((xp < 0 && x >= 0) || (xp > 0 && x <= 0))) {
      S.origin(); MR.flash($('#mru-track'));
      mLog.add(-M.x0 / M.v, 'Corpul trece prin <b>originea O</b> (x = 0).');
    }
    for (const lim of [-100, 100]) {
      if ((xp - lim) * (x - lim) < 0 || (x === lim && xp !== lim)) { S.edge(); mLog.add(t, `Corpul iese de pe porțiunea afișată (x = ${f(lim, 0)} m).`); }
    }
    if ($('#mru-tick').checked && Math.floor(prev + 1e-9) !== Math.floor(t + 1e-9)) S.tick();
  }
  const MRU_PRESETS = {
    pos: { x0: -60, v: 8 }, neg: { x0: 70, v: -10 }, zero: { x0: 30, v: 0 }, orig: { x0: 0, v: 6 },
  };
  $$('#mru-presets .chip').forEach((b) => b.addEventListener('click', () => {
    const p = MRU_PRESETS[b.dataset.p];
    MR.setVal('mru-x0', p.x0); MR.setVal('mru-v', p.v);
    S.click(); mLog.clear(); mSetup(); mRun.reset(); mRun.play();
  }));
  MR.bindControls($('#mru-ctl'), () => { mSetup(); mRun.seek(Math.min(mRun.t, M.T)); });
  ['#mru-strobe', '#mru-vec'].forEach((s) => $(s).addEventListener('change', () => mRun.seek(mRun.t)));
  mSetup(); mRun.seek(0);
  MR.onRedraw(() => { mSetup(); mRun.seek(mRun.t); });

  /* ================= Întâlnirea a două mobile ================= */
  const E = { xa: -80, va: 10, xb: 70, vb: -5 };
  const TM = 14;
  const xa = (t) => E.xa + E.va * t, xb = (t) => E.xb + E.vb * t;
  const eTrack = new MR.Track($('#met-track'), { min: -100, max: 100, lanes: 2 });
  const ePx = new MR.Plot($('#met-px'), { onScrub: (t) => { eRun.pause(); eRun.seek(t); } });
  const eRun = new MR.Runner({ T: TM, onFrame: eFrame, onEnd: () => S.end() });
  const eTr = MR.transport($('#met-transport'), eRun);
  const eLog = MR.logger($('#met-log'));
  let tMeet = NaN, flashT = -1;

  function eSetup() {
    E.xa = MR.val('met-xa'); E.va = MR.val('met-va'); E.xb = MR.val('met-xb'); E.vb = MR.val('met-vb');
    const cx = MR.css('--c-x'), cb = MR.css('--c-b');
    const dv = E.va - E.vb, dx0 = E.xb - E.xa;
    tMeet = dv !== 0 ? dx0 / dv : NaN;
    const pts = [];
    const sol = $('#met-sol'), st = $('#met-status');
    let solHtml = `<i>x</i><sub>A</sub> = ${f(E.xa, 0)} ${MR.sgn(E.va)}·<i>t</i><br><i>x</i><sub>B</sub> = ${f(E.xb, 0)} ${MR.sgn(E.vb)}·<i>t</i><br>`;
    if (dv === 0) {
      tMeet = NaN;
      if (dx0 === 0) {
        solHtml += 'Ecuațiile sunt identice: mobilele se mișcă <b>împreună</b>.';
        st.className = 'status good'; st.lastElementChild.innerHTML = 'Aceeași poziție inițială și aceeași viteză: mobilele sunt mereu în același loc.';
      } else {
        solHtml += `<i>v</i><sub>A</sub> = <i>v</i><sub>B</sub> ⇒ dreptele sunt <b>paralele</b>,<br>distanța rămâne ${f(Math.abs(dx0), 0)} m.`;
        st.className = 'status bad'; st.lastElementChild.innerHTML = '<b>Nu se întâlnesc niciodată</b>: au aceeași viteză, deci distanța dintre ele nu se schimbă.';
      }
    } else {
      const xM = xa(tMeet);
      solHtml += `<i>x</i><sub>A</sub> = <i>x</i><sub>B</sub> ⇒ <i>t</i><sub>î</sub> = <span class="frac"><span><i>x</i><sub>0B</sub> − <i>x</i><sub>0A</sub></span><span><i>v</i><sub>A</sub> − <i>v</i><sub>B</sub></span></span> = <span class="frac"><span>${f(dx0, 0)}</span><span>${f(dv, 1)}</span></span> = <b>${f(tMeet, 2)} s</b>`;
      if (tMeet >= 0) {
        solHtml += `<br><i>x</i><sub>î</sub> = ${f(E.xa, 0)} ${MR.sgn(E.va)}·${f(tMeet, 2)} = <b>${f(xM, 1)} m</b>`;
        pts.push({ t: tMeet, y: xM, color: MR.css('--ink'), label: `întâlnire (${f(tMeet, 1)} s; ${f(xM, 0)} m)` });
        if (tMeet <= TM) { st.className = 'status good'; st.lastElementChild.innerHTML = `<b>Se întâlnesc</b> la momentul t = ${f(tMeet, 2)} s, în poziția x = ${f(xM, 1)} m.`; }
        else { st.className = 'status warn'; st.lastElementChild.innerHTML = `Se vor întâlni la t = ${f(tMeet, 1)} s, după intervalul afișat (${TM} s).`; }
      } else {
        solHtml += '<br><span class="muted">t &lt; 0: întâlnirea ar fi avut loc <b>în trecut</b>.</span>';
        st.className = 'status bad'; st.lastElementChild.innerHTML = '<b>Se depărtează</b>: rezultatul negativ arată că mobilele s-ar fi întâlnit înainte de momentul inițial.';
      }
    }
    sol.innerHTML = solHtml;
    ePx.set({ t0: 0, t1: TM, yName: 'x', unit: 'm', series: [{ fn: xa, color: cx, label: 'xA' }, { fn: xb, color: cb, label: 'xB' }], points: pts });
  }
  function eFrame(t, prev, live) {
    const cx = MR.css('--c-x'), cb = MR.css('--c-b');
    if (live && isFinite(tMeet) && tMeet > prev && tMeet <= t) {
      S.meet(); flashT = t; MR.flash($('#met-track'));
      eLog.add(tMeet, `<b>Întâlnire!</b> Ambele mobile sunt în x = ${f(xa(tMeet), 1)} m.`);
    }
    if (live && E.va !== 0 && Math.sign(xa(prev)) !== Math.sign(xa(t)) && xa(prev) !== 0) eLog.add(-E.xa / E.va, 'Mobilul A trece prin O.');
    if (live && E.vb !== 0 && Math.sign(xb(prev)) !== Math.sign(xb(t)) && xb(prev) !== 0) eLog.add(-E.xb / E.vb, 'Mobilul B trece prin O.');
    const fl = flashT >= 0 && t - flashT < 0.6 ? 1 - (t - flashT) / 0.6 : 0;
    eTrack.set({
      bodies: [
        { x: xa(t), v: E.va, color: cx, vColor: cx, lane: 0, label: 'A', flash: fl },
        { x: xb(t), v: E.vb, color: cb, vColor: cb, lane: 1, label: 'B', flash: fl },
      ],
      marks: isFinite(tMeet) && tMeet >= 0 && tMeet <= TM ? [{ x: xa(tMeet), label: 'locul întâlnirii', color: MR.css('--ink-2') }] : [],
      vScale: 4,
    });
    ePx.setCursor(t);
    eTr.update(t);
  }
  const MET_PRESETS = {
    opus: { xa: -80, va: 10, xb: 70, vb: -5 },
    ajunge: { xa: -90, va: 12, xb: -30, vb: 4 },
    departe: { xa: -10, va: -6, xb: 10, vb: 5 },
    paralel: { xa: -80, va: 6, xb: -20, vb: 6 },
  };
  $$('#met-presets .chip').forEach((b) => b.addEventListener('click', () => {
    const p = MET_PRESETS[b.dataset.p];
    MR.setVal('met-xa', p.xa); MR.setVal('met-va', p.va); MR.setVal('met-xb', p.xb); MR.setVal('met-vb', p.vb);
    S.click(); eLog.clear(); eSetup(); eRun.reset(); eRun.play();
  }));
  MR.bindControls($('#met-ctl'), () => { eSetup(); eRun.seek(eRun.t); });
  eSetup(); eRun.seek(0);
  MR.onRedraw(() => { eSetup(); eRun.seek(eRun.t); });

  MR.sections = MR.sections || {};
  MR.sections.mru = { show() {}, hide() { mRun.pause(); eRun.pause(); } };
})();
