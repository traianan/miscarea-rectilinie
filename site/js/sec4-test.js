/* Secțiunea 04 — Mod Test: 5 probleme aleatorii cu valori noi, cronometru, notă la final. */
(function () {
  const MR = window.MR, $ = MR.$, $$ = MR.$$, S = MR.sound, PB = MR.pb;
  const N = 5, PTS = 9 / N; // 1 punct din oficiu + 9 puncte împărțite egal între probleme
  const box = $('#pb-test');

  const LIMS = [0, 10, 20, 30]; // minute; 0 = fără limită
  let cat = 'toate', T = null, timer = null, armed = false, lim = 0;
  try { lim = +localStorage.getItem('mr-test-lim') || 0; } catch (e) {}
  if (!LIMS.includes(lim)) lim = 0;
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem('mr-teste') || '[]') || []; } catch (e) { hist = []; }
  const saveHist = () => { try { localStorage.setItem('mr-teste', JSON.stringify(hist.slice(0, 8))); } catch (e) {} };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const f2 = (v) => v.toFixed(2).replace('.', ',');
  const clock = (ms) => {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };
  const dur = (ms) => {
    const s = Math.round(ms / 1000), m = Math.floor(s / 60);
    return m && !(s % 60) ? m + ' min' : (m ? m + ' min ' : '') + (s % 60) + ' s';
  };
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const filled = (it) => it.vals.filter((v) => PB.parse(v || '') !== null).length;

  /* ---------- ecranul de început ---------- */
  function intro() {
    stopTimer(); T = null;
    const pool = PB.P.filter((p) => cat === 'toate' || p.cat === cat).length;
    box.innerHTML = `
      <div class="pt-intro">
        <div>
          <div class="pb-lbl">Mod test</div>
          <h3 class="pb-title">Verifică-ți cunoștințele</h3>
          <ul class="pt-rules">
            <li><b>${N} probleme</b> alese la întâmplare, cu valori numerice noi.</li>
            <li>Rezolvarea și verificarea <b>nu</b> sunt disponibile în timpul testului. Poți trece de la o problemă la alta și îți poți schimba răspunsurile oricând.</li>
            <li>${lim ? `Ai la dispoziție <b>${lim} minute</b>. Când timpul expiră, testul se <b>predă automat</b> cu răspunsurile scrise până atunci.` : 'Cronometrul pornește când începi testul și doar măsoară timpul. Nu există limită.'}</li>
            <li>Fiecare problemă valorează ${f2(PTS)} puncte, împărțite egal între cerințele ei. Se acordă <b>1 punct din oficiu</b>, deci nota este între 1 și 10.</li>
          </ul>
          <div class="pb-lbl">Din ce capitol?</div>
          <div class="chips" id="pt-cat">
            ${[['toate', 'MRU și MRUV'], ['mru', 'Doar MRU'], ['mruv', 'Doar MRUV']].map(([k, l]) => `<button class="chip" data-k="${k}" aria-pressed="${k === cat}">${l}</button>`).join('')}
          </div>
          <p class="small muted" style="margin:8px 0 14px">Se aleg ${N} din cele ${pool} probleme ale capitolului.</p>
          <div class="pb-lbl">Timp de lucru</div>
          <div class="chips" id="pt-lim">
            ${LIMS.map((m) => `<button class="chip" data-k="${m}" aria-pressed="${m === lim}">${m ? m + ' min' : 'Fără limită'}</button>`).join('')}
          </div>
          <p class="small muted" style="margin:8px 0 18px">${lim ? `Cam ${lim / N} minute pe problemă. Cronometrul arată timpul rămas.` : 'Poți alege o limită ca să te antrenezi ca la o lucrare.'}</p>
          <button class="btn primary" id="pt-start">Începe testul</button>
        </div>
        <aside class="pt-hist">
          <div class="pb-lbl">Testele tale recente</div>
          ${hist.length ? `<table>${hist.slice(0, 6).map((h) => `<tr><td class="muted">${h.d}</td><td>${h.c}</td><td class="muted" title="${h.l ? 'Limită: ' + h.l + ' min' + (h.x ? ' (timp expirat)' : '') : 'Fără limită de timp'}">${h.t}${h.l ? `<small>/${h.l}′</small>` : ''}</td><td class="pt-hn ${h.g >= 5 ? 'ok' : 'bad'}">${f2(h.g)}</td></tr>`).join('')}</table>`
            : '<p class="small muted">Încă nu ai dat niciun test. Rezultatele se salvează pe acest dispozitiv.</p>'}
        </aside>
      </div>`;
    MR.chipGroup($('#pt-cat'), (k) => { cat = k; S.click(); intro(); });
    MR.chipGroup($('#pt-lim'), (k) => {
      lim = +k; S.click();
      try { localStorage.setItem('mr-test-lim', lim); } catch (e) {}
      intro();
    });
    $('#pt-start').addEventListener('click', start);
  }

  /* ---------- testul ---------- */
  function start() {
    const pool = shuffle(PB.P.filter((p) => cat === 'toate' || p.cat === cat)).slice(0, N);
    pool.sort((a, b) => a.lvl - b.lvl);
    T = { items: pool.map((p) => ({ p, q: p.gen(), vals: [] })), cur: 0, t0: Date.now(), cat, lim: lim * 60000, warned: false };
    S.ok(); armed = false;
    timer = setInterval(tick, 1000);
    question();
    box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }

  // cu limită: numără invers și predă automat la 00:00; fără limită: timp scurs
  const left = () => T.lim - (Date.now() - T.t0);
  const clockText = () => (T.lim ? clock(Math.max(0, left()) + 999) : clock(Date.now() - T.t0));
  function paintClock() {
    const c = $('#pt-clock');
    if (!c) return;
    c.textContent = clockText();
    if (!T.lim) return;
    const l = left(), w = c.parentNode;
    w.classList.toggle('low', l <= 120000 && l > 30000);
    w.classList.toggle('crit', l <= 30000);
    const bar = $('.pt-tbar i', box);
    if (bar) bar.style.width = Math.max(0, (100 * l) / T.lim) + '%';
  }
  function tick() {
    if (!T) return;
    if (T.lim) {
      const l = left(), s = Math.ceil(l / 1000);
      if (l <= 0) { finish(true); return; }
      if (s <= 60 && !T.warned) {
        T.warned = true; S.tick();
        const w = $('#pt-warn');
        if (w) { w.hidden = false; w.lastElementChild.innerHTML = 'Mai ai <b>un minut</b>. La 00:00 testul se predă automat.'; MR.flash(w); }
      } else if (s <= 10) S.tick();
    }
    paintClock();
  }

  function question() {
    const it = T.items[T.cur], an = it.p.ans(it.q), last = T.cur === N - 1;
    box.innerHTML = `
      <div class="pt-bar">
        <div class="pt-dots">${T.items.map((x, k) => {
          const f = filled(x), tot = x.p.ans(x.q).length;
          return `<button class="pt-dot${k === T.cur ? ' on' : ''}${f === tot ? ' full' : f ? ' part' : ''}" data-k="${k}" title="Problema ${k + 1}${f === tot ? ' (completată)' : f ? ' (parțial)' : ''}">${k + 1}</button>`;
        }).join('')}</div>
        <span class="sp"></span>
        <span class="pt-clock" title="${T.lim ? 'Timp rămas din ' + T.lim / 60000 + ' min' : 'Timp scurs'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg><span id="pt-clock">${clockText()}</span></span>
        <button class="btn sm" id="pt-quit">Renunță</button>
        ${T.lim ? '<div class="pt-tbar" aria-hidden="true"><i></i></div>' : ''}
      </div>
      <div class="pb-head">${PB.headHTML(it.p, `Problema ${T.cur + 1} din ${N}`)}</div>
      ${PB.bodyHTML(it.p, it.q)}
      <div class="pb-lbl">Răspunsul tău</div>
      ${PB.answersHTML(an, it.vals)}
      <p class="small muted">Scrie doar valoarea numerică (cu virgulă sau cu punct). Răspunsurile se verifică abia la final. Enter te duce la problema următoare.</p>
      <div class="status warn" id="pt-warn" hidden><span class="dot"></span><span></span></div>
      <div class="pb-nav">
        <button class="btn" id="pt-prev"${T.cur ? '' : ' disabled'}>← Anterioara</button>
        <span class="sp"></span>
        ${last ? '' : '<button class="btn" id="pt-next">Următoarea →</button>'}
        <button class="btn${last ? ' primary' : ''}" id="pt-end">Finalizează testul</button>
      </div>`;

    paintClock();
    $$('.pb-ans input', box).forEach((inp, k) => {
      inp.addEventListener('input', () => { it.vals[k] = inp.value; armed = false; $('#pt-warn').hidden = true; paintDot(); });
      inp.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const ins = $$('.pb-ans input', box);
        if (k < ins.length - 1) ins[k + 1].focus();
        else if (!last) goQ(T.cur + 1);
        else $('#pt-end').focus();
      });
    });
    $$('.pt-dot', box).forEach((d) => d.addEventListener('click', () => goQ(+d.dataset.k)));
    $('#pt-prev').addEventListener('click', () => goQ(T.cur - 1));
    if (!last) $('#pt-next').addEventListener('click', () => goQ(T.cur + 1));
    $('#pt-end').addEventListener('click', tryEnd);
    $('#pt-quit').addEventListener('click', () => {
      if (window.confirm('Renunți la test? Răspunsurile date până acum se pierd.')) { S.click(); intro(); }
    });
    const first = $$('.pb-ans input', box).find((i) => !i.value);
    if (first && window.innerWidth >= 1080) first.focus({ preventScroll: true });
  }

  function paintDot() {
    const it = T.items[T.cur], f = filled(it), tot = it.p.ans(it.q).length, d = $$('.pt-dot', box)[T.cur];
    d.classList.toggle('full', f === tot);
    d.classList.toggle('part', f > 0 && f < tot);
  }

  function goQ(k) {
    if (k < 0 || k >= N || k === T.cur) return;
    T.cur = k; armed = false; S.click(); question();
    const top = box.getBoundingClientRect().top;
    if (top < 0) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function tryEnd() {
    const empty = T.items.reduce((s, it) => s + it.p.ans(it.q).length - filled(it), 0);
    if (empty && !armed) {
      armed = true; S.err();
      const w = $('#pt-warn');
      w.hidden = false;
      w.lastElementChild.innerHTML = `Mai ai <b>${empty === 1 ? 'un câmp necompletat' : empty + ' câmpuri necompletate'}</b> (vezi cerculețele de sus). Apasă din nou <b>Finalizează testul</b> ca să predai așa.`;
      MR.flash(w);
      return;
    }
    finish();
  }

  /* ---------- rezultatul ---------- */
  function finish(auto) {
    stopTimer();
    const ms = auto ? T.lim : Date.now() - T.t0;
    const res = T.items.map((it) => {
      const an = it.p.ans(it.q);
      const marks = an.map((a, k) => { const u = PB.parse(it.vals[k] || ''); return u !== null && PB.near(u, a.v); });
      const pts = (PTS * marks.filter(Boolean).length) / an.length;
      if (marks.every(Boolean)) PB.markSolved(it.p.id);
      return { it, an, marks, pts };
    });
    const grade = 1 + res.reduce((s, r) => s + r.pts, 0);
    const round = Math.floor(grade + 0.5 + 1e-9);
    const msg = grade >= 9.5 ? 'Excelent! Stăpânești foarte bine mișcarea rectilinie.' : grade >= 8 ? 'Foarte bine! Mai ai doar câteva detalii de pus la punct.'
      : grade >= 6.5 ? 'Bine. Revezi rezolvările problemelor greșite.' : grade >= 5 ? 'Ai trecut, dar mai exersează problemele greșite în modul Exersare.'
      : 'Mai exersează: citește rezolvările de mai jos, apoi reia problemele în modul Exersare.';
    const d = new Date();
    hist.unshift({ d: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`, c: { toate: 'MRU+MRUV', mru: 'MRU', mruv: 'MRUV' }[T.cat], t: clock(ms), g: grade, l: T.lim / 60000, x: auto ? 1 : 0 });
    saveHist();

    box.innerHTML = `
      ${auto ? `<div class="status warn pt-timeup"><span class="dot"></span><span><b>Timpul a expirat.</b> Testul a fost predat automat cu răspunsurile scrise până la 00:00${T.items.some((it) => filled(it) < it.p.ans(it.q).length) ? '; câmpurile goale au primit 0 puncte' : ''}.</span></div>` : ''}
      <div class="pt-result ${grade >= 5 ? 'ok' : 'bad'}">
        <div class="pt-grade"><span class="pb-lbl">Nota</span><b>${f2(grade)}</b><span class="small muted">rotunjit: ${round}</span></div>
        <div class="pt-sum">
          <h3 class="pb-title">${msg}</h3>
          <div class="pt-stats">
            <span><b>${res.filter((r) => r.marks.every(Boolean)).length}</b> din ${N} probleme rezolvate complet</span>
            <span><b>${f2(grade - 1)}</b> + 1 din oficiu</span>
            <span>timp: <b>${dur(ms)}</b>${T.lim ? ` din ${T.lim / 60000} min` : ''}</span>
          </div>
          <div class="pt-actions">
            <button class="btn primary" id="pt-again">Test nou</button>
            <button class="btn" id="pt-back">Înapoi la ecranul de start</button>
          </div>
        </div>
      </div>
      <ol class="pt-list">${res.map((r, i) => `
        <li class="${r.marks.every(Boolean) ? 'ok' : r.marks.some(Boolean) ? 'part' : 'bad'}">
          <div class="pt-lh"><span class="pt-no">${i + 1}</span><b>${r.it.p.title}</b><span class="sp"></span><span class="pt-pts">${f2(r.pts)} / ${f2(PTS)} p</span></div>
          <table class="pt-ans">${r.an.map((a, k) => `<tr class="${r.marks[k] ? 'ok' : 'bad'}">
            <td>${a.l}</td>
            <td>${PB.parse(r.it.vals[k] || '') === null ? '<span class="muted">necompletat</span>' : esc(r.it.vals[k].trim()) + ' ' + a.u}</td>
            <td class="pt-m">${r.marks[k] ? '✓' : '✗'}</td>
            <td class="muted">${r.marks[k] ? '' : 'corect: <b>' + PB.n(a.v) + ' ' + a.u + '</b>'}</td></tr>`).join('')}</table>
          <details><summary>Enunțul și rezolvarea</summary>
            <div class="pt-sol">${PB.bodyHTML(r.it.p, r.it.q).replace(/<h3 class="pb-title">.*?<\/h3>/, '')}${PB.stepsHTML(r.it.p.steps(r.it.q), false)}</div>
          </details>
        </li>`).join('')}
      </ol>`;
    auto ? S.end() : grade >= 5 ? S.meet() : S.err();
    $('#pt-again').addEventListener('click', start);
    $('#pt-back').addEventListener('click', () => { S.click(); intro(); });
    box.scrollIntoView({ block: 'start', behavior: 'smooth' });
    T = null;
  }

  /* ---------- comutatorul Exersare / Test ---------- */
  MR.chipGroup($('#pb-mode'), (k) => {
    S.click();
    $('#probleme').classList.toggle('pb-testing', k === 'test');
    $('#pb-practice').hidden = k === 'test';
    box.hidden = k !== 'test';
  });
  intro();
})();
