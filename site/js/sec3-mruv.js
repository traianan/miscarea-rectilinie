/* Secțiunea 03 — Mișcarea rectilinie uniform variată */
(function () {
  const MR = window.MR, S = MR.sound, $ = MR.$, $$ = MR.$$, f = MR.fmt;

  const U = { x0: -40, v0: 12, a: -2, T: 10, brake: false, tStop: NaN };
  const raw = (t) => U.x0 + U.v0 * t + 0.5 * U.a * t * t;
  const stopped = (t) => U.brake && isFinite(U.tStop) && t > U.tStop;
  const X = (t) => (stopped(t) ? raw(U.tStop) : raw(t));
  const V = (t) => (stopped(t) ? 0 : U.v0 + U.a * t);
  const A = (t) => (stopped(t) ? 0 : U.a);
  const dist = (t) => {
    if (isFinite(U.tStop) && U.tStop > 0 && U.tStop < t) return Math.abs(raw(U.tStop) - U.x0) + Math.abs(X(t) - raw(U.tStop));
    return Math.abs(X(t) - U.x0);
  };

  const track = new MR.Track($('#uv-track'), { min: -100, max: 100 });
  const scrub = (t) => { run.pause(); run.seek(t); };
  const px = new MR.Plot($('#uv-px'), { onScrub: scrub });
  const pv = new MR.Plot($('#uv-pv'), { onScrub: scrub });
  const pa = new MR.Plot($('#uv-pa'), { onScrub: scrub });
  const run = new MR.Runner({ T: 10, onFrame: frame, onEnd: () => { S.end(); log.add(U.T, 'Sfârșitul intervalului de observație.'); } });
  const tr = MR.transport($('#uv-transport'), run);
  const log = MR.logger($('#uv-log'));
  let vScale = 4, aScale = 10;

  function setup() {
    U.x0 = MR.val('uv-x0'); U.v0 = MR.val('uv-v0'); U.a = MR.val('uv-a'); U.T = MR.val('uv-T');
    U.brake = $('#uv-brake').checked;
    U.tStop = U.a !== 0 && U.v0 * U.a < 0 ? -U.v0 / U.a : NaN;
    run.T = U.T;

    // pista se scalează astfel încât întreaga mișcare să fie vizibilă
    let mn = Math.min(0, U.x0), mx = Math.max(0, U.x0), vmax = Math.abs(U.v0);
    for (let i = 0; i <= 200; i++) { const t = (U.T * i) / 200, x = X(t); mn = Math.min(mn, x); mx = Math.max(mx, x); vmax = Math.max(vmax, Math.abs(V(t))); }
    if (mx - mn < 40) { const c = (mx + mn) / 2; mn = c - 20; mx = c + 20; }
    const pad = (mx - mn) * 0.08, st = MR.niceStep(mx - mn, 8);
    track.setRange(Math.floor((mn - pad) / st) * st, Math.ceil((mx + pad) / st) * st);
    vScale = 80 / Math.max(vmax, 1);
    aScale = 50 / Math.max(Math.abs(U.a), 0.5);

    const cx = MR.css('--c-x'), cv = MR.css('--c-v'), ca = MR.css('--c-a'), ink2 = MR.css('--ink-2');
    const hasStop = isFinite(U.tStop) && U.tStop <= U.T;
    const vl = hasStop ? [{ t: U.tStop, label: 'v = 0', color: ink2 }] : [];
    const pts = [{ t: 0, y: U.x0, color: cx }];
    if (hasStop) pts.push({ t: U.tStop, y: raw(U.tStop), color: cx, label: `oprire: x = ${f(raw(U.tStop), 1)} m` });
    px.set({ t0: 0, t1: U.T, yName: 'x', unit: 'm', series: [{ fn: X, color: cx }], points: pts, vlines: vl });
    pv.set({ t0: 0, t1: U.T, yName: 'v', unit: 'm/s', series: [{ fn: V, color: cv }], vlines: vl,
      points: hasStop ? [{ t: U.tStop, y: 0, color: cv }] : [] });
    const amax = Math.max(1, Math.abs(U.a) * 1.3);
    pa.set({ t0: 0, t1: U.T, yName: 'a', unit: 'm/s²', yMin: -amax, yMax: amax, series: [{ fn: A, color: ca }], vlines: vl });

    // ecuațiile cu valorile curente
    $('#uv-eq').innerHTML =
      `<span class="lbl">Legile</span><i>v</i>(<i>t</i>) = ${f(U.v0, 1)} ${MR.sgn(U.a)}·<i>t</i> &nbsp;<span class="muted">(m/s)</span>` +
      ` &nbsp;&nbsp;·&nbsp;&nbsp; <i>x</i>(<i>t</i>) = ${f(U.x0, 0)} ${MR.sgn(U.v0)}·<i>t</i> ${MR.sgn(U.a / 2, 2)}·<i>t</i><sup>2</sup> &nbsp;<span class="muted">(m)</span>`;

    // clasificarea cazului
    const c = $('#uv-case'), dir = (s) => (s > 0 ? 'pozitiv' : 'negativ');
    let cls = '', txt = '';
    if (U.a === 0) {
      cls = 'good';
      txt = U.v0 === 0 ? '<b>a = 0 și v₀ = 0</b>: corpul rămâne în repaus.' : '<b>a = 0</b>: viteza nu se schimbă — este o <b>mișcare rectilinie uniformă</b> (secțiunea 02).';
    } else if (U.v0 === 0) {
      txt = `<b>Pornire din repaus</b> (v₀ = 0): mișcare <b>uniform accelerată</b> în sensul ${dir(U.a)} al axei.`;
    } else if (U.v0 * U.a > 0) {
      txt = `<b>v₀ și a au același sens</b>: mișcare <b>uniform accelerată</b> în sensul ${dir(U.v0)}; modulul vitezei crește cu ${f(Math.abs(U.a), 1)} m/s în fiecare secundă.`;
    } else {
      cls = 'warn';
      txt = `<b>v₀ și a au sensuri opuse</b>: mișcare <b>uniform încetinită</b>. Corpul se oprește la t<sub>opr</sub> = ${f(U.tStop, 2)} s, după d<sub>opr</sub> = ${f((U.v0 * U.v0) / (2 * Math.abs(U.a)), 1)} m`;
      txt += U.brake ? ', apoi rămâne în repaus (frânare).' : `, apoi se întoarce: mișcare accelerată în sensul ${dir(U.a)}.`;
      if (!hasStop) txt += ' <span class="muted">(Oprirea are loc după intervalul afișat — mărește durata T.)</span>';
    }
    c.className = 'status ' + cls;
    c.lastElementChild.innerHTML = txt;
  }

  function frame(t, prev, live) {
    const x = X(t), v = V(t), a = A(t), cx = MR.css('--c-x');
    const strobe = [];
    if ($('#uv-strobe').checked) for (let i = 0; i <= Math.floor(t + 1e-9); i++) strobe.push({ x: X(i), color: cx });
    const showVec = $('#uv-vec').checked;
    track.set({
      bodies: [{ x, v, a, color: cx }], strobe, showV: showVec, showA: showVec, vScale, aScale,
      marks: [{ x: U.x0, label: 'x₀', color: MR.css('--muted') }],
    });
    px.setCursor(t);
    pv.scene.areas = [{ fn: V, from: 0, to: t, color: MR.css('--c-v'), alpha: 0.2 }];
    pv.setCursor(t);
    pa.scene.areas = [{ fn: A, from: 0, to: t, color: MR.css('--c-a'), alpha: 0.2 }];
    pa.setCursor(t);
    tr.update(t);

    $('#uv-rt').textContent = f(t, 2) + ' s';
    $('#uv-rx').textContent = f(x, 2) + ' m';
    $('#uv-rv').textContent = f(v, 2) + ' m/s';
    $('#uv-ra').textContent = f(a, 2) + ' m/s²';
    $('#uv-rdx').textContent = f(x - U.x0, 2) + ' m';
    $('#uv-rd').textContent = f(dist(t), 2) + ' m';

    // faza curentă a mișcării
    const ph = $('#uv-phase');
    let cls = '', txt;
    if (Math.abs(v) < 1e-6 && Math.abs(a) < 1e-9) { cls = 'good'; txt = '<b>Acum: repaus</b> (v = 0, a = 0).'; }
    else if (Math.abs(v) < 1e-6) { cls = 'warn'; txt = '<b>Acum: v = 0</b> — momentul opririi; accelerația nu este nulă, deci corpul va porni în sens opus.'; }
    else if (Math.abs(a) < 1e-9) { cls = 'good'; txt = `<b>Acum: mișcare uniformă</b> în sensul ${v > 0 ? 'pozitiv' : 'negativ'}.`; }
    else if (v * a > 0) { txt = `<b>Acum: accelerată</b> — vectorii v și a au același sens (${v > 0 ? '→' : '←'}).`; }
    else { cls = 'warn'; txt = `<b>Acum: încetinită</b> — vectorii v și a au sensuri opuse (v ${v > 0 ? '→' : '←'}, a ${a > 0 ? '→' : '←'}).`; }
    ph.className = 'status ' + cls;
    ph.lastElementChild.innerHTML = txt;

    if (!live) return;
    if (isFinite(U.tStop) && U.tStop > prev && U.tStop <= t) {
      S.stop(); MR.flash($('#uv-track'));
      log.add(U.tStop, `<b>v = 0</b>: corpul se oprește în x = ${f(raw(U.tStop), 1)} m${U.brake ? ' și rămâne în repaus' : ' și își schimbă sensul de mișcare'}.`);
    }
    const xp = X(prev);
    if ((xp < 0 && x >= 0) || (xp > 0 && x <= 0)) {
      const r = MR.roots(U.a / 2, U.v0, U.x0).filter((q) => q >= prev - 1e-9 && q <= t + 1e-9);
      S.origin();
      log.add(r.length ? r[0] : t, `Corpul trece prin <b>originea O</b>, cu viteza ${f(V(r.length ? r[0] : t), 1)} m/s.`);
    }
    if ($('#uv-tick').checked && Math.floor(prev + 1e-9) !== Math.floor(t + 1e-9)) S.tick();
  }

  const PRESETS = {
    repaus: { x0: -80, v0: 0, a: 2, T: 10, brake: false },
    acc: { x0: -80, v0: 5, a: 1.5, T: 10, brake: false },
    frana: { x0: -80, v0: 20, a: -4, T: 8, brake: true },
    intoarce: { x0: -60, v0: 16, a: -3, T: 10, brake: false },
    negacc: { x0: 80, v0: -5, a: -1.5, T: 10, brake: false },
    neginc: { x0: 60, v0: -16, a: 3, T: 10, brake: false },
    vertical: { x0: 0, v0: 20, a: -9.8, T: 4, brake: false },
  };
  function load(p) {
    MR.setVal('uv-x0', p.x0); MR.setVal('uv-v0', p.v0); MR.setVal('uv-a', p.a); MR.setVal('uv-T', p.T);
    $('#uv-brake').checked = !!p.brake;
    S.click(); log.clear(); setup(); run.reset(); run.play();
    if (p.note) log.add(null, p.note);
  }
  $$('#uv-presets .chip').forEach((b) => b.addEventListener('click', () => {
    const p = Object.assign({}, PRESETS[b.dataset.p]);
    if (b.dataset.p === 'vertical') p.note = 'Axa Ox este orientată vertical în sus; g ≈ 9,8 m/s². Corpul urcă, se oprește la înălțimea maximă, apoi cade.';
    load(p);
  }));
  $$('#uv-cases [data-case]').forEach((b) => b.addEventListener('click', () => {
    const [x0, v0, a] = b.dataset.case.split(',').map(Number);
    load({ x0, v0, a, T: 10, brake: false });
    $('#uv-ctl').closest('.block').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  MR.bindControls($('#uv-ctl'), () => { setup(); run.seek(Math.min(run.t, U.T)); });
  ['#uv-brake'].forEach((s) => $(s).addEventListener('change', () => { setup(); run.seek(run.t); }));
  ['#uv-vec', '#uv-strobe'].forEach((s) => $(s).addEventListener('change', () => run.seek(run.t)));
  setup(); run.seek(0);
  MR.onRedraw(() => { setup(); run.seek(run.t); });

  /* ================= Calculator Galilei ================= */
  let unk = 'v';
  const fields = { v0: '#gal-v0', v: '#gal-v', a: '#gal-a', dx: '#gal-dx' };
  function galMark() {
    $$('#gal .calc-field').forEach((el) => {
      const isU = el.dataset.f === unk;
      el.classList.toggle('unknown', isU);
      const inp = $('input', el);
      inp.disabled = isU;
      if (isU) { inp.type = 'text'; inp.value = '?'; } else if (inp.type === 'text') { inp.type = 'number'; inp.value = inp.dataset.last || '0'; }
    });
    $('#gal-out').innerHTML = '';
  }
  MR.chipGroup($('#gal-unk'), (k) => { unk = k; S.click(); galMark(); });
  function g(k) { const el = $(fields[k]); el.dataset.last = el.value; return +el.value; }
  function setRes(k, val) { $(fields[k]).value = f(val, 2); }

  $('#gal-go').onclick = () => {
    const out = $('#gal-out');
    const fail = (msg) => { out.innerHTML = `<div class="status bad"><span class="dot"></span><span>${msg}</span></div>`; S.err(); };
    let html = '';
    if (unk === 'v') {
      const v0 = g('v0'), a = g('a'), dx = g('dx');
      const rad = v0 * v0 + 2 * a * dx;
      html = `<i>v</i><sup>2</sup> = <i>v</i><sub>0</sub><sup>2</sup> + 2<i>a</i>Δ<i>x</i> = ${MR.par(v0)}<sup>2</sup> + 2·${MR.par(a)}·${MR.par(dx)} = ${f(rad, 2)} m²/s²<br>`;
      if (rad < 0) return fail(html.replace('<br>', '') + ' &lt; 0. <b>Imposibil</b>: corpul se oprește și se întoarce înainte de a atinge această deplasare (d<sub>opr</sub> = ' + f((v0 * v0) / (2 * Math.abs(a)), 2) + ' m).');
      // momentul primei atingeri a deplasării dx
      const ts = MR.roots(a / 2, v0, -dx).filter((q) => q >= -1e-9);
      if (!ts.length) return fail('Corpul nu ajunge niciodată la această deplasare (verifică semnele lui v₀ și Δx).');
      const t = ts[0], v = v0 + a * t;
      html += `|<i>v</i>| = √${f(rad, 2)} = <b>${f(Math.abs(v), 2)} m/s</b> &nbsp;(${f(Math.abs(v) * 3.6, 1)} km/h)<br>`;
      html += `<span class="muted">Corpul atinge deplasarea după t = ${f(t, 2)} s, cu viteza v = ${f(v, 2)} m/s (cu semn).</span>`;
      setRes('v', v);
    } else if (unk === 'v0') {
      const v = g('v'), a = g('a'), dx = g('dx');
      const rad = v * v - 2 * a * dx;
      html = `<i>v</i><sub>0</sub><sup>2</sup> = <i>v</i><sup>2</sup> − 2<i>a</i>Δ<i>x</i> = ${MR.par(v)}<sup>2</sup> − 2·${MR.par(a)}·${MR.par(dx)} = ${f(rad, 2)} m²/s²<br>`;
      if (rad < 0) return fail(html.replace('<br>', '') + ' &lt; 0. <b>Imposibil</b> pentru datele introduse.');
      const v0 = Math.sqrt(rad);
      html += `|<i>v</i><sub>0</sub>| = √${f(rad, 2)} = <b>${f(v0, 2)} m/s</b> &nbsp;(${f(v0 * 3.6, 1)} km/h)`;
      setRes('v0', dx < 0 ? -v0 : v0);
    } else if (unk === 'a') {
      const v0 = g('v0'), v = g('v'), dx = g('dx');
      if (dx === 0) return fail('Pentru Δx = 0 accelerația nu se poate determina din ecuația lui Galilei.');
      const a = (v * v - v0 * v0) / (2 * dx);
      html = `<i>a</i> = <span class="frac"><span><i>v</i><sup>2</sup> − <i>v</i><sub>0</sub><sup>2</sup></span><span>2Δ<i>x</i></span></span> = <span class="frac"><span>${MR.par(v)}<sup>2</sup> − ${MR.par(v0)}<sup>2</sup></span><span>2·${MR.par(dx)}</span></span> = <b>${f(a, 2)} m/s²</b><br>`;
      if (a !== 0) html += `<span class="muted">Durata: t = (v − v₀)/a = ${f((v - v0) / a, 2)} s${(v - v0) / a < 0 ? ' — negativă: verifică semnele vitezelor' : ''}.</span>`;
      setRes('a', a);
    } else {
      const v0 = g('v0'), v = g('v'), a = g('a');
      if (a === 0) return fail(v === v0 ? 'Pentru a = 0 și v = v₀ (mișcare uniformă) deplasarea depinde de timp, nu se poate afla din această ecuație.' : 'Pentru a = 0 viteza nu se poate schimba: datele sunt contradictorii.');
      const dx = (v * v - v0 * v0) / (2 * a);
      html = `Δ<i>x</i> = <span class="frac"><span><i>v</i><sup>2</sup> − <i>v</i><sub>0</sub><sup>2</sup></span><span>2<i>a</i></span></span> = <span class="frac"><span>${MR.par(v)}<sup>2</sup> − ${MR.par(v0)}<sup>2</sup></span><span>2·${MR.par(a)}</span></span> = <b>${f(dx, 2)} m</b><br>`;
      html += `<span class="muted">Durata: t = (v − v₀)/a = ${f((v - v0) / a, 2)} s${(v - v0) / a < 0 ? ' — negativă: verifică semnele' : ''}.</span>`;
      setRes('dx', dx);
    }
    out.innerHTML = html;
    S.ok();
  };
  galMark();

  MR.sections = MR.sections || {};
  MR.sections.mruv = { show() {}, hide() { run.pause(); } };
})();
