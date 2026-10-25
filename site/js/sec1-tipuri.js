/* Secțiunea 01 — Tipuri de mișcări */
(function () {
  const MR = window.MR, S = MR.sound, $ = MR.$, $$ = MR.$$;

  // Chips cu selecție exclusivă într-un grup.
  MR.chipGroup = (root, cb) => {
    $$('.chip', root).forEach((ch) =>
      ch.addEventListener('click', () => {
        $$('.chip', root).forEach((c) => c.setAttribute('aria-pressed', String(c === ch)));
        cb(ch.dataset.k, ch);
      })
    );
  };

  /* ================= A. După forma traiectoriei ================= */
  const TRAJ = {
    rect: {
      name: 'Mișcarea rectilinie', path: 'o linie dreaptă', dir: 'constantă (se poate schimba doar sensul)',
      text: 'Corpul se deplasează de-a lungul unei drepte. Vectorul viteză are mereu direcția dreptei.',
      ex: ['un tren pe o porțiune dreaptă de cale ferată', 'o bilă care cade liber', 'un lift care urcă'],
      p: (s, W, H) => [W * (0.1 + 0.8 * s), H * (0.78 - 0.56 * s)], period: 3.2,
    },
    circ: {
      name: 'Mișcarea circulară', path: 'un cerc', dir: 'variabilă — tangentă la cerc în fiecare punct',
      text: 'Corpul descrie un cerc. Chiar dacă mărimea vitezei e constantă, direcția ei se schimbă continuu.',
      ex: ['un punct de pe roata unei biciclete (față de ax)', 'vârful acului unui ceas', 'o persoană într-un carusel'],
      p: (s, W, H) => { const r = Math.min(W, H) * 0.38; return [W / 2 + r * Math.cos(2 * Math.PI * s), H / 2 - r * Math.sin(2 * Math.PI * s)]; }, period: 4,
    },
    parab: {
      name: 'Mișcarea parabolică', path: 'o parabolă', dir: 'variabilă',
      text: 'Apare la aruncarea oblică sau orizontală a unui corp în câmp gravitațional: pe orizontală mișcarea e uniformă, pe verticală e uniform variată.',
      ex: ['o minge de baschet aruncată spre coș', 'jetul de apă al unei fântâni', 'o săgeată trasă cu arcul'],
      p: (s, W, H) => [W * (0.08 + 0.84 * s), H * (0.86 - 0.72 * 4 * s * (1 - s))], period: 3.2,
    },
    elip: {
      name: 'Mișcarea eliptică', path: 'o elipsă', dir: 'variabilă — tangentă la elipsă',
      text: 'Traiectoria este o elipsă. Planetele se mișcă pe elipse în jurul Soarelui (legile lui Kepler).',
      ex: ['Pământul în jurul Soarelui', 'un satelit artificial pe orbită eliptică', 'o cometă'],
      p: (s, W, H) => [W / 2 + W * 0.38 * Math.cos(2 * Math.PI * s), H / 2 - H * 0.34 * Math.sin(2 * Math.PI * s)], period: 5,
    },
    oarecare: {
      name: 'Mișcarea curbilinie oarecare', path: 'o curbă oarecare', dir: 'variabilă',
      text: 'Traiectoria nu are o formă geometrică simplă. Vectorul viteză este întotdeauna tangent la traiectorie.',
      ex: ['un schior pe pârtie', 'o frunză care cade', 'un fluture în zbor'],
      p: (s, W, H) => [W * (0.08 + 0.84 * s), H * (0.5 + 0.3 * Math.sin(2 * Math.PI * 1.5 * s) * (0.65 + 0.35 * Math.cos(2 * Math.PI * s)))], period: 4.5,
    },
  };

  const tc = $('#traj-canvas'), tctx = tc.getContext('2d');
  let tKind = 'rect', tS = 0, tLast = 0, tW = 0, tH = 0, tRunning = false;

  function trajInfo() {
    const d = TRAJ[tKind];
    $('#traj-info').innerHTML = `
      <h4>${d.name}</h4>
      <p class="small">${d.text}</p>
      <dl class="kv"><dt>Traiectoria</dt><dd>${d.path}</dd><dt>Direcția vitezei</dt><dd>${d.dir}</dd></dl>
      <div class="group-title" style="margin:12px 0 6px">Exemple</div>
      <ul class="ex">${d.ex.map((e) => `<li>${e}</li>`).join('')}</ul>`;
  }
  function trajResize() {
    const r = tc.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    tW = r.width; tH = r.height;
    tc.width = Math.round(tW * dpr); tc.height = Math.round(tH * dpr);
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trajDraw();
  }
  new ResizeObserver(trajResize).observe(tc);

  function trajDraw() {
    if (!tW) return;
    const ctx = tctx, d = TRAJ[tKind], P = (s) => d.p(s, tW, tH);
    const cx = MR.css('--c-x'), cv = MR.css('--c-v'), ink = MR.css('--ink'), muted = MR.css('--muted'), line = MR.css('--line-strong');
    ctx.clearRect(0, 0, tW, tH);
    // reperul Oxy
    ctx.strokeStyle = line; ctx.fillStyle = line; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(16, tH - 16); ctx.lineTo(70, tH - 16); ctx.moveTo(16, tH - 16); ctx.lineTo(16, tH - 70); ctx.stroke();
    ctx.font = 'italic 12px Fraunces, Georgia, serif'; ctx.fillStyle = muted;
    ctx.fillText('x', 74, tH - 12); ctx.fillText('y', 12, tH - 74); ctx.fillText('O', 4, tH - 4);

    const closed = tKind === 'circ' || tKind === 'elip';
    if ($('#traj-trail').checked) {
      ctx.strokeStyle = MR.alpha(cx, 0.28); ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) { const [x, y] = P(i / 200); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = cx; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath();
      const n = Math.max(1, Math.round(tS * 200));
      for (let i = 0; i <= n; i++) { const [x, y] = P((i / n) * tS); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    const [x, y] = P(tS);
    if ($('#traj-vec').checked) {
      const ds = 0.002;
      const a = P(closed ? (tS - ds + 1) % 1 : Math.max(0, tS - ds)), b = P(closed ? (tS + ds) % 1 : Math.min(1, tS + ds));
      const span = closed ? 2 * ds : Math.min(1, tS + ds) - Math.max(0, tS - ds);
      let vx = ((b[0] - a[0]) / span) * 0.12, vy = ((b[1] - a[1]) / span) * 0.12;
      const L = Math.hypot(vx, vy);
      if (L > 110) { vx *= 110 / L; vy *= 110 / L; }
      if (L > 3) {
        const ang = Math.atan2(vy, vx);
        ctx.strokeStyle = cv; ctx.fillStyle = cv; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + vx - Math.cos(ang) * 7, y + vy - Math.sin(ang) * 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + vx, y + vy);
        ctx.lineTo(x + vx - 10 * Math.cos(ang - 0.4), y + vy - 10 * Math.sin(ang - 0.4));
        ctx.lineTo(x + vx - 10 * Math.cos(ang + 0.4), y + vy - 10 * Math.sin(ang + 0.4)); ctx.closePath(); ctx.fill();
        ctx.font = 'italic 600 15px Fraunces, Georgia, serif';
        ctx.fillText('v', x + vx + 8, y + vy - 6);
      }
    }
    ctx.fillStyle = ink; ctx.strokeStyle = MR.css('--card'); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  function trajLoop(now) {
    if (!tRunning) return;
    const dt = Math.min(0.05, (now - tLast) / 1000); tLast = now;
    if (!$('#traj-pause').checked) {
      tS += dt / TRAJ[tKind].period;
      if (tS >= 1) { tS -= 1; S.lap(); }
    }
    trajDraw();
    requestAnimationFrame(trajLoop);
  }
  MR.chipGroup($('#traj-chips'), (k) => { tKind = k; tS = 0; S.click(); trajInfo(); trajDraw(); });
  ['#traj-vec', '#traj-trail'].forEach((s) => $(s).addEventListener('change', trajDraw));
  trajInfo();
  MR.onRedraw(trajDraw);

  /* ================= B. După accelerație ================= */
  const ACC = {
    unif: {
      name: 'Mișcare uniformă', law: '<i>a</i> = 0, &nbsp;<i>v</i> = const.',
      text: 'Viteza rămâne aceeași: corpul parcurge distanțe egale în intervale de timp egale.',
      obs: 'egale', st: '',
      x: (t) => 5 + 15 * t, v: () => 15, a: () => 0,
    },
    acc: {
      name: 'Mișcare uniform accelerată', law: '<i>a</i> = const., &nbsp;<i>a</i> ↑↑ <i>v</i>',
      text: 'Viteza crește cu aceeași cantitate în fiecare secundă. Accelerația are același sens cu viteza.',
      obs: 'din ce în ce mai mari', st: 'good',
      x: (t) => 5 + 2 * t + 2.25 * t * t, v: (t) => 2 + 4.5 * t, a: () => 4.5,
    },
    inc: {
      name: 'Mișcare uniform încetinită', law: '<i>a</i> = const., &nbsp;<i>a</i> ↑↓ <i>v</i>',
      text: 'Viteza scade cu aceeași cantitate în fiecare secundă, până la oprire. Accelerația are sens opus vitezei.',
      obs: 'din ce în ce mai mici', st: 'warn',
      x: (t) => 5 + 30 * t - 2.5 * t * t, v: (t) => 30 - 5 * t, a: () => -5,
    },
    var: {
      name: 'Mișcare variată (neuniformă)', law: '<i>a</i> ≠ const.',
      text: 'Viteza variază în mod neregulat: accelerația însăși se schimbă în timp.',
      obs: 'neregulate', st: 'bad',
      x: (t) => 5 + 14 * t + (9 / 1.6) * (1 - Math.cos(1.6 * t)), v: (t) => 14 + 9 * Math.sin(1.6 * t), a: (t) => 14.4 * Math.cos(1.6 * t),
    },
  };
  let aKind = 'unif';
  const aTrack = new MR.Track($('#acc-track'), { min: 0, max: 110 });
  const aPv = new MR.Plot($('#acc-pv'), { onScrub: (t) => { aRun.pause(); aRun.seek(t); } });
  const aPa = new MR.Plot($('#acc-pa'), { onScrub: (t) => { aRun.pause(); aRun.seek(t); } });
  const aRun = new MR.Runner({ T: 6, onFrame: aFrame, onEnd: () => S.end() });
  const aTr = MR.transport($('#acc-transport'), aRun);

  function aSetup() {
    const d = ACC[aKind];
    $('#acc-info').innerHTML = `
      <div class="group-title">Tipul mișcării</div>
      <h4 style="font-size:1.3rem">${d.name}</h4>
      <div class="live-eq" style="font-size:1.1rem">${d.law}</div>
      <p class="small" style="margin:0">${d.text}</p>
      <p class="small muted" style="margin:0">Observă urmele de pe pistă: distanțele dintre ele sunt <b>${d.obs}</b>.</p>`;
    const cv = MR.css('--c-v'), ca = MR.css('--c-a');
    aPv.set({ t0: 0, t1: 6, yMin: 0, yMax: 35, yName: 'v', unit: 'm/s', series: [{ fn: d.v, color: cv }] });
    aPa.set({ t0: 0, t1: 6, yMin: -16, yMax: 16, yName: 'a', unit: 'm/s²', series: [{ fn: d.a, color: ca }] });
  }
  function aFrame(t, prev, live) {
    const d = ACC[aKind];
    const n = Math.floor(t / 0.5 + 1e-9);
    const strobe = [];
    for (let i = 0; i <= n; i++) strobe.push({ x: d.x(i * 0.5), color: MR.css('--c-x') });
    if (live && Math.floor(prev / 0.5 + 1e-9) !== n && $('#acc-sound').checked) S.strobe();
    aTrack.set({ bodies: [{ x: d.x(t), v: d.v(t), a: d.a(t), color: MR.css('--c-x') }], strobe, showA: true, vScale: 3.2, aScale: 6 });
    aPv.setCursor(t); aPa.setCursor(t);
    aTr.update(t);
    const gaps = [];
    for (let i = 1; i <= n; i++) gaps.push(MR.fmt(d.x(i * 0.5) - d.x((i - 1) * 0.5), 1));
    const st = $('#acc-status');
    st.className = 'status ' + d.st;
    st.lastElementChild.innerHTML = gaps.length
      ? `Distanțele dintre urme succesive (m): <b>${gaps.slice(-8).join(' · ')}</b>`
      : 'Apasă <b>Start</b>: la fiecare 0,5 s corpul lasă o urmă pe pistă.';
  }
  MR.chipGroup($('#acc-chips'), (k) => { aKind = k; aSetup(); aRun.reset(); aRun.play(); });
  aSetup(); aRun.seek(0);
  MR.onRedraw(() => { aSetup(); aRun.seek(aRun.t); });

  /* ================= C. Test ================= */
  const QS = [
    { q: 'Un tren se deplasează pe o porțiune dreaptă de cale ferată cu viteza constantă de 80 km/h.', t: 'rect', a: 'unif', why: 'Traiectoria este dreaptă, iar viteza nu se schimbă.' },
    { q: 'O bilă de oțel este lăsată să cadă liber (neglijăm frecarea cu aerul).', t: 'rect', a: 'acc', why: 'Cade pe verticală, iar viteza crește cu aproximativ 9,8 m/s în fiecare secundă (a = g).' },
    { q: 'Un automobil frânează uniform pe un drum drept, până se oprește.', t: 'rect', a: 'inc', why: 'Accelerația este constantă și opusă vitezei, deci viteza scade uniform.' },
    { q: 'Vârful acului secundar al unui ceas.', t: 'curb', a: 'unif', why: 'Descrie un cerc, iar mărimea vitezei rămâne constantă: mișcare circulară uniformă.' },
    { q: 'O minge de baschet aruncată oblic spre coș.', t: 'curb', a: 'var', why: 'Traiectoria este o parabolă; mărimea vitezei scade la urcare și crește la coborâre, nu cu aceeași cantitate pe secundă.' },
    { q: 'Un lift pornește din repaus și urcă, la început, cu accelerație constantă.', t: 'rect', a: 'acc', why: 'Mișcare pe verticală, cu viteza crescând uniform.' },
    { q: 'O piatră aruncată vertical în sus, în timpul urcării.', t: 'rect', a: 'inc', why: 'Viteza este îndreptată în sus, accelerația gravitațională în jos: viteza scade uniform până la oprire.' },
    { q: 'Un satelit care se rotește pe o orbită circulară în jurul Pământului.', t: 'curb', a: 'unif', why: 'Traiectoria e un cerc parcurs cu viteză de mărime constantă.' },
    { q: 'Un sprinter în primele secunde după start, pe culoarul drept.', t: 'rect', a: 'var', why: 'Viteza crește, dar nu cu aceeași cantitate în fiecare secundă: accelerația scade pe măsură ce se apropie de viteza maximă.' },
    { q: 'Un pendul care oscilează.', t: 'curb', a: 'var', why: 'Se mișcă pe un arc de cerc; viteza e maximă în poziția de jos și nulă la capete, variind neuniform.' },
  ];
  const LBL = { rect: 'rectilinie', curb: 'curbilinie', unif: 'uniformă', acc: 'uniform accelerată', inc: 'uniform încetinită', var: 'variată' };
  let order = [], qi = 0, score = 0, answered = false, selT = null, selA = null;

  function qStart() {
    order = QS.map((_, i) => i).sort(() => Math.random() - 0.5);
    qi = 0; score = 0; qShow();
  }
  function qShow() {
    answered = false; selT = selA = null;
    $$('#quiz .chip').forEach((c) => { c.setAttribute('aria-pressed', 'false'); c.classList.remove('right', 'wrong'); });
    $('#quiz-fb').style.display = 'none';
    $('#quiz-check').style.display = ''; $('#quiz-next').style.display = 'none';
    $('#quiz-bar').style.width = (qi / QS.length) * 100 + '%';
    $('#quiz-score').textContent = `Scor: ${score} / ${qi}`;
    if (qi >= QS.length) {
      $('#quiz-count').textContent = 'Gata!';
      $('#quiz-q').textContent = `Ai răspuns corect la ${score} din ${QS.length} situații. ${score >= 8 ? 'Excelent!' : score >= 5 ? 'Bine — mai exersează puțin.' : 'Recitește clasificarea de mai sus și încearcă din nou.'}`;
      $('#quiz-check').style.display = 'none';
      if (score >= 8) S.meet();
      return;
    }
    $('#quiz-count').textContent = `Situația ${qi + 1} din ${QS.length}`;
    $('#quiz-q').textContent = QS[order[qi]].q;
  }
  MR.chipGroup($('#quiz-traj'), (k) => { if (!answered) selT = k; else qMarkLock(); });
  MR.chipGroup($('#quiz-acc'), (k) => { if (!answered) selA = k; else qMarkLock(); });
  function qMarkLock() {
    // după verificare, păstrăm doar marcajele corect/greșit
    $$('#quiz .chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
  }
  $('#quiz-check').onclick = () => {
    if (qi >= QS.length) return;
    const fb = $('#quiz-fb');
    if (!selT || !selA) {
      fb.style.display = ''; fb.className = 'status warn';
      fb.lastElementChild.innerHTML = 'Alege atât tipul traiectoriei, cât și felul în care variază viteza.';
      S.click(); return;
    }
    answered = true;
    const q = QS[order[qi]], ok = selT === q.t && selA === q.a;
    $$('#quiz .chip').forEach((c) => {
      const k = c.dataset.k;
      if (k === q.t || k === q.a) c.classList.add('right');
      else if (k === selT || k === selA) c.classList.add('wrong');
      c.setAttribute('aria-pressed', 'false');
    });
    if (ok) score++;
    fb.style.display = ''; fb.className = 'status ' + (ok ? 'good' : 'bad');
    fb.lastElementChild.innerHTML = (ok ? '<b>Corect!</b> ' : `<b>Nu chiar.</b> Răspunsul corect: mișcare ${LBL[q.t]}, ${LBL[q.a]}. `) + q.why;
    ok ? S.ok() : S.err();
    $('#quiz-score').textContent = `Scor: ${score} / ${qi + 1}`;
    $('#quiz-check').style.display = 'none'; $('#quiz-next').style.display = '';
  };
  $('#quiz-next').onclick = () => { qi++; S.click(); qShow(); };
  $('#quiz-restart').onclick = () => { S.click(); qStart(); };
  qStart();

  MR.sections = MR.sections || {};
  MR.sections.tipuri = {
    show() { if (!tRunning) { tRunning = true; tLast = performance.now(); requestAnimationFrame(trajLoop); } },
    hide() { tRunning = false; aRun.pause(); },
  };
})();
