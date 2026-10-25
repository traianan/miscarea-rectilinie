/* Secțiunea 04 — Probleme rezolvate (MRU și MRUV), cu valori care se pot regenera. */
(function () {
  const MR = window.MR, $ = MR.$, $$ = MR.$$, S = MR.sound;

  /* ---------- mici utilitare de scriere ---------- */
  // număr „curat”: max. 2 zecimale, virgulă, minus tipografic
  const n = (v) => {
    let r = Math.round(v * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    const s = String(Math.abs(r)).replace('.', ',');
    return r < 0 ? '−' + s : s;
  };
  const pn = (v) => (v < 0 ? '(' + n(v) + ')' : n(v));
  const V = (s) => `<i class="v">${s}</i>`;
  const sub = (s, i) => `${V(s)}<sub>${i}</sub>`;
  const fr = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  const eq = (h) => `<div class="eq">${h}</div>`;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const vm = sub('v', 'm'), v0 = sub('v', '0'), x0 = sub('x', '0');

  /* ---------- problemele ----------
     Fiecare: base (valorile din enunțul „de manual”), gen() (valori noi),
     text, data (Se dă), ask (Se cere), steps (rezolvarea), ans (răspunsuri de verificat). */
  const P = [
    {
      id: 'vmed', cat: 'mru', lvl: 1, title: 'Viteza medie a unui autoturism',
      base: { vk: 72, t: 2.5 },
      gen: () => ({ vk: pick([54, 72, 90, 108]), t: pick([1.5, 2, 2.5, 3]) }),
      text: (p) => `Un autoturism parcurge distanța de <b>${n(p.vk * p.t)} km</b> în <b>${n(p.t)} h</b>. Află viteza medie a autoturismului, exprimată în km/h și în m/s.`,
      data: (p) => [[V('d'), n(p.vk * p.t) + ' km'], [V('t'), n(p.t) + ' h']],
      ask: () => [vm + ' (km/h)', vm + ' (m/s)'],
      steps: (p) => [
        ['Formula vitezei medii', `Viteza medie este raportul dintre distanța parcursă și durata mișcării:` + eq(`${vm} = ${fr(V('d'), 'Δ' + V('t'))}`)],
        ['Înlocuim valorile', eq(`${vm} = ${fr(n(p.vk * p.t) + ' km', n(p.t) + ' h')} = <b>${n(p.vk)} km/h</b>`)],
        ['Transformăm în m/s', `Cum 1 km = 1000 m și 1 h = 3600 s, avem 1 km/h = ${fr('1', '3,6')} m/s:` + eq(`${vm} = ${fr(n(p.vk), '3,6')} m/s = <b>${n(p.vk / 3.6)} m/s</b>`)],
      ],
      ans: (p) => [{ l: vm, u: 'km/h', v: p.vk }, { l: vm, u: 'm/s', v: p.vk / 3.6 }],
    },
    {
      id: 'lege', cat: 'mru', lvl: 1, title: 'Legea mișcării uniforme',
      base: { x0: -20, v: 5, t: 8 },
      gen: () => ({ x0: pick([-60, -40, -30, -20, -12]), v: pick([3, 4, 5, 6, 8, 10]), t: pick([6, 8, 10, 12]) }),
      text: (p) => `Un mobil se mișcă rectiliniu uniform. La momentul inițial (${sub('t', '0')} = 0) se află în punctul de coordonată ${x0} = <b>${n(p.x0)} m</b> și are viteza <b>${n(p.v)} m/s</b>, orientată în sensul pozitiv al axei. a) Scrie legea mișcării. b) Află poziția mobilului la momentul ${V('t')} = <b>${n(p.t)} s</b>. c) În ce moment trece mobilul prin origine?`,
      data: (p) => [[x0, n(p.x0) + ' m'], [V('v'), n(p.v) + ' m/s'], [sub('t', '1'), n(p.t) + ' s']],
      ask: () => [`${V('x')}(${V('t')})`, `${V('x')}(${sub('t', '1')})`, sub('t', 'O')],
      steps: (p) => [
        ['Legea generală', `În mișcarea rectilinie uniformă, cu ${sub('t', '0')} = 0:` + eq(`${V('x')} = ${x0} + ${V('v')}·${V('t')}`)],
        ['Legea pentru acest mobil', eq(`${V('x')}(${V('t')}) = ${n(p.x0)} + ${n(p.v)}·${V('t')} &nbsp;(m)`)],
        ['Poziția la momentul dat', eq(`${V('x')}(${n(p.t)}) = ${n(p.x0)} + ${n(p.v)}·${n(p.t)} = <b>${n(p.x0 + p.v * p.t)} m</b>`) + (p.x0 + p.v * p.t > 0 ? 'Mobilul se află acum de partea pozitivă a axei.' : '')],
        ['Trecerea prin origine', `Originea are coordonata ${V('x')} = 0:` + eq(`0 = ${n(p.x0)} + ${n(p.v)}·${sub('t', 'O')} ⇒ ${sub('t', 'O')} = ${fr('−' + x0, V('v'))} = ${fr(n(-p.x0), n(p.v))} = <b>${n(-p.x0 / p.v)} s</b>`)],
      ],
      ans: (p) => [{ l: `${V('x')}(${sub('t', '1')})`, u: 'm', v: p.x0 + p.v * p.t }, { l: sub('t', 'O'), u: 's', v: -p.x0 / p.v }],
    },
    {
      id: 'opuse', cat: 'mru', lvl: 2, title: 'Întâlnire din sensuri opuse',
      base: { va: 60, vb: 40, t: 3 },
      gen: () => ({ va: pick([50, 60, 70, 80, 90]), vb: pick([30, 40, 50, 60]), t: pick([1.5, 2, 2.5, 3, 4]) }),
      text: (p) => `Din două orașe A și B, aflate la distanța de <b>${n((p.va + p.vb) * p.t)} km</b>, pleacă în același moment, unul spre celălalt, două automobile cu vitezele constante <b>${n(p.va)} km/h</b> (din A) și <b>${n(p.vb)} km/h</b> (din B). După cât timp se întâlnesc și la ce distanță de orașul A?`,
      data: (p) => [[V('D'), n((p.va + p.vb) * p.t) + ' km'], [sub('v', 'A'), n(p.va) + ' km/h'], [sub('v', 'B'), n(p.vb) + ' km/h']],
      ask: () => [sub('t', 'î'), sub('x', 'î') + ' (față de A)'],
      steps: (p) => {
        const D = (p.va + p.vb) * p.t;
        return [
          ['Alegem sistemul de referință', `Originea în A, sensul pozitiv de la A spre B, ${V('t')} = 0 la plecare. Automobilul din B merge în sens negativ:` + eq(`${sub('x', 'A')} = ${sub('v', 'A')}·${V('t')}, &nbsp;&nbsp; ${sub('x', 'B')} = ${V('D')} − ${sub('v', 'B')}·${V('t')}`)],
          ['Condiția de întâlnire', `Se întâlnesc când au aceeași poziție:` + eq(`${sub('v', 'A')}·${V('t')} = ${V('D')} − ${sub('v', 'B')}·${V('t')} ⇒ ${sub('t', 'î')} = ${fr(V('D'), sub('v', 'A') + ' + ' + sub('v', 'B'))}`)],
          ['Calculăm momentul', eq(`${sub('t', 'î')} = ${fr(n(D), n(p.va) + ' + ' + n(p.vb))} = <b>${n(p.t)} h</b>`)],
          ['Locul întâlnirii', eq(`${sub('x', 'î')} = ${sub('v', 'A')}·${sub('t', 'î')} = ${n(p.va)}·${n(p.t)} = <b>${n(p.va * p.t)} km</b>`) + `adică la ${n(D - p.va * p.t)} km de orașul B.`],
        ];
      },
      ans: (p) => [{ l: sub('t', 'î'), u: 'h', v: p.t }, { l: sub('x', 'î'), u: 'km', v: p.va * p.t }],
    },
    {
      id: 'urmarire', cat: 'mru', lvl: 2, title: 'Motociclistul ajunge biciclistul',
      base: { v1: 5, v2: 15, dt: 20 },
      gen: () => ({ v1: pick([4, 5, 6]), v2: pick([12, 14, 15, 16]), dt: pick([10, 20, 30, 40]) }),
      text: (p) => `Un biciclist pleacă dintr-un punct cu viteza constantă de <b>${n(p.v1)} m/s</b>. După <b>${n(p.dt)} s</b>, din același punct și în același sens pleacă un motociclist cu viteza constantă de <b>${n(p.v2)} m/s</b>. După cât timp de la plecarea sa îl ajunge motociclistul pe biciclist și la ce distanță de punctul de plecare?`,
      data: (p) => [[sub('v', '1'), n(p.v1) + ' m/s'], [sub('v', '2'), n(p.v2) + ' m/s'], ['Δ' + V('t'), n(p.dt) + ' s']],
      ask: () => [V('t') + ' (de la plecarea motociclistului)', V('x')],
      steps: (p) => {
        const d0 = p.v1 * p.dt, t = d0 / (p.v2 - p.v1);
        return [
          ['Avansul biciclistului', `Alegem ${V('t')} = 0 la plecarea motociclistului. Până atunci, biciclistul a parcurs:` + eq(`${sub('d', '0')} = ${sub('v', '1')}·Δ${V('t')} = ${n(p.v1)}·${n(p.dt)} = ${n(d0)} m`)],
          ['Legile de mișcare', eq(`${sub('x', '1')} = ${sub('d', '0')} + ${sub('v', '1')}·${V('t')}, &nbsp;&nbsp; ${sub('x', '2')} = ${sub('v', '2')}·${V('t')}`)],
          ['Condiția de întâlnire', eq(`${sub('x', '1')} = ${sub('x', '2')} ⇒ ${V('t')} = ${fr(sub('d', '0'), sub('v', '2') + ' − ' + sub('v', '1'))} = ${fr(n(d0), n(p.v2) + ' − ' + n(p.v1))} = <b>${n(t)} s</b>`) + `Motociclistul „recuperează” avansul cu viteza relativă ${sub('v', '2')} − ${sub('v', '1')} = ${n(p.v2 - p.v1)} m/s.`],
          ['Locul întâlnirii', eq(`${V('x')} = ${sub('v', '2')}·${V('t')} = ${n(p.v2)}·${n(t)} = <b>${n(p.v2 * t)} m</b>`)],
        ];
      },
      ans: (p) => {
        const t = (p.v1 * p.dt) / (p.v2 - p.v1);
        return [{ l: V('t'), u: 's', v: t, trap: [[t + p.dt, 'Acesta este timpul măsurat de la plecarea biciclistului. Se cere timpul de la plecarea motociclistului.']] }, { l: V('x'), u: 'm', v: p.v2 * t }];
      },
    },
    {
      id: 'jumatati', cat: 'mru', lvl: 2, title: 'Viteza medie pe două jumătăți de drum',
      base: { v1: 60, v2: 40 },
      gen: () => pick([{ v1: 60, v2: 40 }, { v1: 90, v2: 60 }, { v1: 30, v2: 60 }, { v1: 80, v2: 120 }, { v1: 40, v2: 60 }, { v1: 60, v2: 90 }]),
      text: (p) => `Un automobil parcurge prima jumătate a drumului cu viteza constantă <b>${n(p.v1)} km/h</b>, iar a doua jumătate cu viteza constantă <b>${n(p.v2)} km/h</b>. Care este viteza medie pe tot drumul?`,
      data: (p) => [[sub('v', '1'), n(p.v1) + ' km/h'], [sub('v', '2'), n(p.v2) + ' km/h'], [sub('d', '1') + ' = ' + sub('d', '2'), fr(V('d'), '2')]],
      ask: () => [vm],
      steps: (p) => [
        ['Duratele celor două porțiuni', `Notăm cu ${V('d')} lungimea întregului drum:` + eq(`${sub('t', '1')} = ${fr(V('d'), '2' + sub('v', '1'))}, &nbsp;&nbsp; ${sub('t', '2')} = ${fr(V('d'), '2' + sub('v', '2'))}`)],
        ['Viteza medie', `Viteza medie este distanța totală împărțită la durata totală:` + eq(`${vm} = ${fr(V('d'), sub('t', '1') + ' + ' + sub('t', '2'))} = ${fr(V('d'), fr(V('d'), '2' + sub('v', '1')) + ' + ' + fr(V('d'), '2' + sub('v', '2')))} = ${fr('2' + sub('v', '1') + sub('v', '2'), sub('v', '1') + ' + ' + sub('v', '2'))}`) + `Distanța ${V('d')} se simplifică, deci nu trebuie cunoscută.`],
        ['Calcul numeric', eq(`${vm} = ${fr('2·' + n(p.v1) + '·' + n(p.v2), n(p.v1) + ' + ' + n(p.v2))} = <b>${n((2 * p.v1 * p.v2) / (p.v1 + p.v2))} km/h</b>`)],
        ['Atenție la capcană!', `Viteza medie <b>nu</b> este media aritmetică ${fr(sub('v', '1') + ' + ' + sub('v', '2'), '2')} = ${n((p.v1 + p.v2) / 2)} km/h: pe porțiunea mai lentă automobilul petrece mai mult timp, deci aceasta „cântărește” mai mult.`],
      ],
      ans: (p) => [{ l: vm, u: 'km/h', v: (2 * p.v1 * p.v2) / (p.v1 + p.v2), trap: [[(p.v1 + p.v2) / 2, 'Ai calculat media aritmetică a vitezelor. Viteza medie este distanța totală împărțită la timpul total.']] }],
    },
    {
      id: 'pod', cat: 'mru', lvl: 2, title: 'Trenul care traversează un pod',
      base: { L: 200, P: 400, vk: 72 },
      gen: () => ({ L: pick([120, 150, 200, 250]), P: pick([300, 400, 450, 600]), vk: pick([54, 72, 90]) }),
      text: (p) => `Un tren cu lungimea de <b>${n(p.L)} m</b> se deplasează uniform cu viteza de <b>${n(p.vk)} km/h</b> și traversează un pod cu lungimea de <b>${n(p.P)} m</b>. Cât timp durează traversarea completă, din momentul în care locomotiva intră pe pod până când ultimul vagon iese de pe pod?`,
      data: (p) => [[V('L'), n(p.L) + ' m'], [sub('L', 'pod'), n(p.P) + ' m'], [V('v'), n(p.vk) + ' km/h']],
      ask: () => [V('t')],
      steps: (p) => {
        const v = p.vk / 3.6;
        return [
          ['Transformăm viteza în m/s', eq(`${V('v')} = ${fr(n(p.vk), '3,6')} m/s = ${n(v)} m/s`)],
          ['Ce distanță parcurge trenul?', `Urmărim locomotiva: ea parcurge podul, apoi încă o lungime de tren, până iese și ultimul vagon:` + eq(`${V('d')} = ${sub('L', 'pod')} + ${V('L')} = ${n(p.P)} + ${n(p.L)} = ${n(p.P + p.L)} m`)],
          ['Durata traversării', eq(`${V('t')} = ${fr(V('d'), V('v'))} = ${fr(n(p.P + p.L), n(v))} = <b>${n((p.P + p.L) / v)} s</b>`)],
        ];
      },
      ans: (p) => {
        const v = p.vk / 3.6;
        return [{ l: V('t'), u: 's', v: (p.P + p.L) / v, trap: [[p.P / v, 'Ai folosit doar lungimea podului. Trenul trebuie să parcurgă și propria lungime ca să iasă complet de pe pod.']] }];
      },
    },
    {
      id: 'repaus', cat: 'mruv', lvl: 1, title: 'Pornire din repaus',
      base: { a: 2, t: 10 },
      gen: () => ({ a: pick([0.5, 1, 1.5, 2, 2.5, 3]), t: pick([6, 8, 10, 12, 15]) }),
      text: (p) => `Un automobil pornește din repaus și accelerează uniform cu accelerația <b>${n(p.a)} m/s²</b>. Ce viteză are după <b>${n(p.t)} s</b> și ce distanță a parcurs în acest timp?`,
      data: (p) => [[v0, '0 (repaus)'], [V('a'), n(p.a) + ' m/s²'], [V('t'), n(p.t) + ' s']],
      ask: () => [V('v'), V('d')],
      steps: (p) => [
        ['Legea vitezei', `Pornind din repaus, ${v0} = 0:` + eq(`${V('v')} = ${v0} + ${V('a')}·${V('t')} = ${V('a')}·${V('t')} = ${n(p.a)}·${n(p.t)} = <b>${n(p.a * p.t)} m/s</b>`) + `adică ${n(p.a * p.t * 3.6)} km/h.`],
        ['Distanța parcursă', `Din legea mișcării, cu ${v0} = 0:` + eq(`${V('d')} = ${fr(V('a') + V('t') + '<sup>2</sup>', '2')} = ${fr(n(p.a) + '·' + n(p.t) + '<sup>2</sup>', '2')} = <b>${n((p.a * p.t * p.t) / 2)} m</b>`)],
        ['Verificare cu ecuația lui Galilei', eq(`${V('v')}<sup>2</sup> = 2${V('a')}${V('d')} = 2·${n(p.a)}·${n((p.a * p.t * p.t) / 2)} = ${n(p.a * p.a * p.t * p.t)} ⇒ ${V('v')} = ${n(p.a * p.t)} m/s &nbsp;✓`)],
      ],
      ans: (p) => [{ l: V('v'), u: 'm/s', v: p.a * p.t }, { l: V('d'), u: 'm', v: (p.a * p.t * p.t) / 2, trap: [[p.a * p.t * p.t, 'Ai uitat împărțirea la 2 din formula distanței.']] }],
    },
    {
      id: 'franare', cat: 'mruv', lvl: 1, title: 'Frânarea unui automobil',
      base: { vk: 72, a: 5 },
      gen: () => ({ vk: pick([36, 54, 72, 90, 108]), a: pick([4, 5, 6]) }),
      text: (p) => `Un automobil care se deplasează cu viteza de <b>${n(p.vk)} km/h</b> frânează uniform, cu o accelerație de modul <b>${n(p.a)} m/s²</b>, până la oprire. Cât durează frânarea și ce distanță parcurge automobilul până se oprește?`,
      data: (p) => [[v0, n(p.vk) + ' km/h'], [V('a'), '−' + n(p.a) + ' m/s² (încetinire)'], [V('v'), '0 (oprire)']],
      ask: () => [sub('t', 'opr'), sub('d', 'opr')],
      steps: (p) => {
        const u = p.vk / 3.6;
        return [
          ['Transformăm viteza', eq(`${v0} = ${fr(n(p.vk), '3,6')} m/s = ${n(u)} m/s`)],
          ['Semnul accelerației', `Viteza scade, deci accelerația are sens opus vitezei: ${V('a')} = −${n(p.a)} m/s².`],
          ['Durata frânării', `La oprire ${V('v')} = 0:` + eq(`0 = ${v0} + ${V('a')}·${sub('t', 'opr')} ⇒ ${sub('t', 'opr')} = −${fr(v0, V('a'))} = ${fr(n(u), n(p.a))} = <b>${n(u / p.a)} s</b>`)],
          ['Distanța de frânare', `Cu ecuația lui Galilei:` + eq(`0 = ${v0}<sup>2</sup> + 2${V('a')}·${sub('d', 'opr')} ⇒ ${sub('d', 'opr')} = ${fr(v0 + '<sup>2</sup>', '2|' + V('a') + '|')} = ${fr(n(u) + '<sup>2</sup>', '2·' + n(p.a))} = <b>${n((u * u) / (2 * p.a))} m</b>`)],
        ];
      },
      ans: (p) => {
        const u = p.vk / 3.6;
        return [{ l: sub('t', 'opr'), u: 's', v: u / p.a }, { l: sub('d', 'opr'), u: 'm', v: (u * u) / (2 * p.a), trap: [[(p.vk * p.vk) / (2 * p.a), 'Ai folosit viteza în km/h. Transformă mai întâi viteza în m/s (împarte la 3,6).']] }];
      },
    },
    {
      id: 'galilei', cat: 'mruv', lvl: 2, title: 'Accelerația din ecuația lui Galilei',
      base: { u0: 10, u: 20, d: 75 },
      gen: () => {
        const u0 = pick([2, 4, 5, 6, 8, 10]), a = pick([0.5, 1, 1.5, 2, 2.5, 3]), t = pick([2, 4, 5, 6, 8]);
        return { u0, u: u0 + a * t, d: ((2 * u0 + a * t) / 2) * t };
      },
      text: (p) => `Viteza unui mobil crește uniform de la <b>${n(p.u0)} m/s</b> la <b>${n(p.u)} m/s</b> pe o distanță de <b>${n(p.d)} m</b>. Află accelerația mobilului și durata acestei porțiuni de mișcare.`,
      data: (p) => [[v0, n(p.u0) + ' m/s'], [V('v'), n(p.u) + ' m/s'], ['Δ' + V('x'), n(p.d) + ' m']],
      ask: () => [V('a'), 'Δ' + V('t')],
      steps: (p) => {
        const a = (p.u * p.u - p.u0 * p.u0) / (2 * p.d);
        return [
          ['Alegem formula potrivită', `Nu cunoaștem timpul, deci folosim ecuația lui Galilei, care nu îl conține:` + eq(`${V('v')}<sup>2</sup> = ${v0}<sup>2</sup> + 2${V('a')}·Δ${V('x')} ⇒ ${V('a')} = ${fr(V('v') + '<sup>2</sup> − ' + v0 + '<sup>2</sup>', '2Δ' + V('x'))}`)],
          ['Calculăm accelerația', eq(`${V('a')} = ${fr(n(p.u) + '<sup>2</sup> − ' + n(p.u0) + '<sup>2</sup>', '2·' + n(p.d))} = ${fr(n(p.u * p.u - p.u0 * p.u0), n(2 * p.d))} = <b>${n(a)} m/s²</b>`)],
          ['Durata, din legea vitezei', eq(`${V('v')} = ${v0} + ${V('a')}·Δ${V('t')} ⇒ Δ${V('t')} = ${fr(V('v') + ' − ' + v0, V('a'))} = ${fr(n(p.u) + ' − ' + n(p.u0), n(a))} = <b>${n((p.u - p.u0) / a)} s</b>`)],
          ['Verificare cu viteza medie', eq(`Δ${V('x')} = ${fr(v0 + ' + ' + V('v'), '2')}·Δ${V('t')} = ${n((p.u0 + p.u) / 2)}·${n((p.u - p.u0) / a)} = ${n(((p.u0 + p.u) / 2) * ((p.u - p.u0) / a))} m &nbsp;✓`)],
        ];
      },
      ans: (p) => {
        const a = (p.u * p.u - p.u0 * p.u0) / (2 * p.d);
        return [{ l: V('a'), u: 'm/s²', v: a }, { l: 'Δ' + V('t'), u: 's', v: (p.u - p.u0) / a }];
      },
    },
    {
      id: 'secunda', cat: 'mruv', lvl: 3, title: 'Distanța parcursă în a n-a secundă',
      base: { a: 4, k: 5 },
      gen: () => ({ a: pick([2, 3, 4, 6, 8]), k: pick([3, 4, 5, 6, 8, 10]) }),
      text: (p) => `Un corp pornește din repaus și se mișcă uniform accelerat cu accelerația <b>${n(p.a)} m/s²</b>. Ce distanță parcurge în primele <b>${p.k} s</b>? Dar numai în <b>a ${p.k}-a secundă</b> de mișcare?`,
      data: (p) => [[v0, '0'], [V('a'), n(p.a) + ' m/s²'], [V('n'), String(p.k)]],
      ask: (p) => [sub('d', p.k + ' s') + ' (primele ' + p.k + ' s)', sub('d', 'a ' + p.k + '-a') + ' (doar a ' + p.k + '-a secundă)'],
      steps: (p) => {
        const X = (t) => (p.a * t * t) / 2;
        return [
          ['Legea mișcării', `Din repaus, din origine:` + eq(`${V('x')}(${V('t')}) = ${fr(V('a') + V('t') + '<sup>2</sup>', '2')} = ${n(p.a / 2)}·${V('t')}<sup>2</sup>`)],
          ['Distanța în primele ' + p.k + ' s', eq(`${V('x')}(${p.k}) = ${n(p.a / 2)}·${p.k}<sup>2</sup> = <b>${n(X(p.k))} m</b>`)],
          [`Unde era corpul la începutul secundei a ${p.k}-a?`, `A ${p.k}-a secundă este intervalul de la ${V('t')} = ${p.k - 1} s la ${V('t')} = ${p.k} s:` + eq(`${V('x')}(${p.k - 1}) = ${n(p.a / 2)}·${p.k - 1}<sup>2</sup> = ${n(X(p.k - 1))} m`)],
          [`Distanța numai în a ${p.k}-a secundă`, eq(`${sub('d', 'a ' + p.k + '-a')} = ${V('x')}(${p.k}) − ${V('x')}(${p.k - 1}) = ${n(X(p.k))} − ${n(X(p.k - 1))} = <b>${n(X(p.k) - X(p.k - 1))} m</b>`) + `În general, ${sub('d', V('n'))} = ${fr(V('a') + '(2' + V('n') + ' − 1)', '2')}: distanțele în secunde succesive sunt proporționale cu numerele impare 1, 3, 5, 7…`],
        ];
      },
      ans: (p) => {
        const X = (t) => (p.a * t * t) / 2;
        return [{ l: sub('d', p.k + ' s'), u: 'm', v: X(p.k) }, { l: sub('d', 'a ' + p.k + '-a'), u: 'm', v: X(p.k) - X(p.k - 1), trap: [[X(p.k), `Aceasta este distanța parcursă în primele ${p.k} s, nu numai în a ${p.k}-a secundă.`]] }];
      },
    },
    {
      id: 'vertical', cat: 'mruv', lvl: 2, title: 'Aruncarea unei mingi în sus',
      base: { u0: 20 },
      gen: () => ({ u0: pick([10, 15, 20, 25, 30]) }),
      text: (p) => `O minge este aruncată vertical în sus cu viteza de <b>${n(p.u0)} m/s</b>. Neglijând frecarea cu aerul și considerând ${V('g')} = 10 m/s², află înălțimea maximă atinsă și după cât timp revine mingea în punctul de lansare.`,
      data: (p) => [[v0, n(p.u0) + ' m/s'], [V('g'), '10 m/s²']],
      ask: () => [sub('h', 'max'), sub('t', 'total')],
      steps: (p) => [
        ['Axa și accelerația', `Alegem axa ${V('Oy')} vertical în sus, cu originea în punctul de lansare. Accelerația gravitațională e orientată în jos: ${V('a')} = −${V('g')} = −10 m/s². Mișcarea este uniform încetinită la urcare.`],
        ['Durata urcării', `În punctul cel mai înalt viteza se anulează:` + eq(`0 = ${v0} − ${V('g')}·${sub('t', 'u')} ⇒ ${sub('t', 'u')} = ${fr(v0, V('g'))} = ${fr(n(p.u0), '10')} = ${n(p.u0 / 10)} s`)],
        ['Înălțimea maximă', eq(`0 = ${v0}<sup>2</sup> − 2${V('g')}·${sub('h', 'max')} ⇒ ${sub('h', 'max')} = ${fr(v0 + '<sup>2</sup>', '2' + V('g'))} = ${fr(n(p.u0) + '<sup>2</sup>', '20')} = <b>${n((p.u0 * p.u0) / 20)} m</b>`)],
        ['Revenirea în punctul de lansare', `Mingea revine când ${V('y')} = 0:` + eq(`${v0}${V('t')} − ${fr(V('g') + V('t') + '<sup>2</sup>', '2')} = 0 ⇒ ${V('t')}(${v0} − ${fr(V('g') + V('t'), '2')}) = 0 ⇒ ${sub('t', 'total')} = ${fr('2' + v0, V('g'))} = <b>${n(p.u0 / 5)} s</b>`) + `Urcarea și coborârea durează la fel, iar mingea revine cu viteza −${n(p.u0)} m/s (același modul, sens opus).`],
      ],
      ans: (p) => [{ l: sub('h', 'max'), u: 'm', v: (p.u0 * p.u0) / 20 }, { l: sub('t', 'total'), u: 's', v: p.u0 / 5, trap: [[p.u0 / 10, 'Acesta este doar timpul de urcare. Mingea mai are nevoie de același timp pentru a coborî.']] }],
    },
    {
      id: 'camion', cat: 'mruv', lvl: 3, title: 'Automobilul care pornește după camion',
      base: { u: 20, a: 2 },
      gen: () => ({ u: pick([10, 15, 20, 25]), a: pick([1, 1.5, 2, 2.5]) }),
      text: (p) => `Un automobil stă la semafor. În momentul în care se aprinde verdele, automobilul pornește cu accelerația constantă <b>${n(p.a)} m/s²</b> și, în același moment, este depășit de un camion care merge uniform cu <b>${n(p.u)} m/s</b>. După cât timp ajunge automobilul camionul, la ce distanță de semafor și ce viteză are automobilul atunci?`,
      data: (p) => [[sub('v', 'C'), n(p.u) + ' m/s'], [V('a'), n(p.a) + ' m/s²'], [sub('v', '0A'), '0']],
      ask: () => [V('t'), V('x'), sub('v', 'A')],
      steps: (p) => {
        const t = (2 * p.u) / p.a;
        return [
          ['Legile de mișcare', `Originea la semafor, ${V('t')} = 0 la aprinderea verdelui:` + eq(`${sub('x', 'C')} = ${sub('v', 'C')}·${V('t')} (MRU), &nbsp;&nbsp; ${sub('x', 'A')} = ${fr(V('a') + V('t') + '<sup>2</sup>', '2')} (MRUV)`)],
          ['Condiția de întâlnire', eq(`${sub('v', 'C')}·${V('t')} = ${fr(V('a') + V('t') + '<sup>2</sup>', '2')} ⇒ ${V('t')}·(${sub('v', 'C')} − ${fr(V('a') + V('t'), '2')}) = 0`) + `Soluția ${V('t')} = 0 este momentul depășirii la semafor. Cealaltă soluție:` + eq(`${V('t')} = ${fr('2' + sub('v', 'C'), V('a'))} = ${fr('2·' + n(p.u), n(p.a))} = <b>${n(t)} s</b>`)],
          ['Distanța față de semafor', eq(`${V('x')} = ${sub('v', 'C')}·${V('t')} = ${n(p.u)}·${n(t)} = <b>${n(p.u * t)} m</b>`)],
          ['Viteza automobilului', eq(`${sub('v', 'A')} = ${V('a')}·${V('t')} = ${n(p.a)}·${n(t)} = <b>${n(p.a * t)} m/s</b>`) + `Exact dublul vitezei camionului: au parcurs aceeași distanță în același timp, deci au aceeași viteză medie, iar viteza medie a automobilului este ${fr('0 + ' + sub('v', 'A'), '2')}.`],
        ];
      },
      ans: (p) => {
        const t = (2 * p.u) / p.a;
        return [{ l: V('t'), u: 's', v: t, trap: [[p.u / p.a, 'Acesta este momentul în care automobilul are aceeași viteză cu camionul (atunci distanța dintre ele e maximă), nu momentul întâlnirii.']] }, { l: V('x'), u: 'm', v: p.u * t }, { l: sub('v', 'A'), u: 'm/s', v: p.a * t }];
      },
    },
    {
      id: 'intoarcere', cat: 'mruv', lvl: 3, title: 'Deplasare sau distanță? Mobilul care se întoarce',
      base: { u0: 12, a: 3, ex: 2 },
      gen: () => {
        const u0 = pick([8, 12, 16, 20]);
        return { u0, a: pick(u0 % 3 === 0 ? [2, 3, 4] : [2, 4]), ex: pick([1, 2, 3]) };
      },
      text: (p) => `Un mobil pleacă din origine cu viteza inițială <b>${n(p.u0)} m/s</b> și are accelerația constantă <b>−${n(p.a)} m/s²</b> (opusă vitezei). a) După cât timp se oprește? b) Ce deplasare și ce distanță parcurge mobilul în primele <b>${n(p.u0 / p.a + p.ex)} s</b>?`,
      data: (p) => [[x0, '0'], [v0, n(p.u0) + ' m/s'], [V('a'), '−' + n(p.a) + ' m/s²'], [V('T'), n(p.u0 / p.a + p.ex) + ' s']],
      ask: () => [sub('t', 'opr'), 'Δ' + V('x'), V('d')],
      steps: (p) => {
        const to = p.u0 / p.a, T = to + p.ex, d1 = (p.u0 * p.u0) / (2 * p.a), d2 = (p.a * p.ex * p.ex) / 2;
        const dx = p.u0 * T - (p.a * T * T) / 2;
        return [
          ['Momentul opririi', eq(`${V('v')} = ${v0} + ${V('a')}${V('t')} = 0 ⇒ ${sub('t', 'opr')} = ${fr(n(p.u0), n(p.a))} = <b>${n(to)} s</b>`) + `Cum ${V('T')} = ${n(T)} s > ${sub('t', 'opr')}, mobilul se oprește și apoi <b>se întoarce</b>.`],
          ['Deplasarea, din legea mișcării', `Legea mișcării rămâne valabilă și după întoarcere (accelerația e aceeași):` + eq(`Δ${V('x')} = ${v0}${V('T')} + ${fr(V('a') + V('T') + '<sup>2</sup>', '2')} = ${n(p.u0)}·${n(T)} − ${fr(n(p.a) + '·' + n(T) + '<sup>2</sup>', '2')} = <b>${n(dx)} m</b>`)],
          ['Distanța până la oprire', eq(`${sub('d', '1')} = ${fr(v0 + '<sup>2</sup>', '2|' + V('a') + '|')} = ${fr(n(p.u0) + '<sup>2</sup>', '2·' + n(p.a))} = ${n(d1)} m`)],
          ['Distanța la întoarcere', `După oprire, mobilul pornește din repaus în sens opus timp de ${n(p.ex)} s:` + eq(`${sub('d', '2')} = ${fr('|' + V('a') + '|·' + n(p.ex) + '<sup>2</sup>', '2')} = ${n(d2)} m`)],
          ['Distanța totală', eq(`${V('d')} = ${sub('d', '1')} + ${sub('d', '2')} = ${n(d1)} + ${n(d2)} = <b>${n(d1 + d2)} m</b>`) + `Verificare: Δ${V('x')} = ${sub('d', '1')} − ${sub('d', '2')} = ${n(d1 - d2)} m. Distanța e mai mare decât deplasarea pentru că mobilul și-a schimbat sensul.`],
        ];
      },
      ans: (p) => {
        const T = p.u0 / p.a + p.ex, d1 = (p.u0 * p.u0) / (2 * p.a), d2 = (p.a * p.ex * p.ex) / 2;
        const dx = p.u0 * T - (p.a * T * T) / 2;
        return [{ l: sub('t', 'opr'), u: 's', v: p.u0 / p.a }, { l: 'Δ' + V('x'), u: 'm', v: dx }, { l: V('d'), u: 'm', v: d1 + d2, trap: [[dx, 'Aceasta este deplasarea. Mobilul s-a întors, deci distanța parcursă este mai mare: adună drumul de dus și drumul de întors.']] }];
      },
    },
  ];

  /* ---------- stare ---------- */
  let solved = {};
  try { solved = JSON.parse(localStorage.getItem('mr-probleme') || '{}') || {}; } catch (e) { solved = {}; }
  const save = () => { try { localStorage.setItem('mr-probleme', JSON.stringify(solved)); } catch (e) {} };

  let filter = 'toate', cur = 0, prm = null, shown = 0;
  const list = $('#pb-list'), card = $('#pb-card');
  const visible = () => P.map((p, i) => i).filter((i) => filter === 'toate' || P[i].cat === filter);
  const CAT = { mru: 'MRU', mruv: 'MRUV' };
  const LVL = ['', 'ușoară', 'medie', 'dificilă'];

  function renderList() {
    list.innerHTML = visible().map((i) => {
      const p = P[i];
      return `<button class="pb-item${i === cur ? ' on' : ''}${solved[p.id] ? ' done' : ''}" data-i="${i}">
        <span class="pb-no">${String(i + 1).padStart(2, '0')}</span>
        <span class="pb-t">${p.title}<small>${CAT[p.cat]} · ${LVL[p.lvl]}</small></span>
        <span class="pb-ok" aria-label="${solved[p.id] ? 'rezolvată' : ''}">${solved[p.id] ? '✓' : ''}</span>
      </button>`;
    }).join('');
    const k = P.filter((p) => solved[p.id]).length;
    $('#pb-count').textContent = `Rezolvate: ${k} / ${P.length}`;
    $('#pb-bar').style.width = (100 * k) / P.length + '%';
    const on = $('.pb-item.on', list);
    if (on && (on.offsetTop < list.scrollTop || on.offsetTop + on.offsetHeight > list.scrollTop + list.clientHeight))
      list.scrollTop = on.offsetTop - list.clientHeight / 2;
  }

  function renderCard() {
    const p = P[cur], st = p.steps(prm), an = p.ans(prm);
    shown = 0;
    card.innerHTML = `
      <div class="pb-head">
        <span class="pb-badge ${p.cat}">${CAT[p.cat]}</span>
        <span class="pb-lvl" title="Nivel: ${LVL[p.lvl]}">${'<i class="on"></i>'.repeat(p.lvl)}${'<i></i>'.repeat(3 - p.lvl)}</span>
        <span class="muted small">Problema ${cur + 1} din ${P.length}</span>
        <button class="btn sm" id="pb-new" title="Aceeași problemă, cu alte valori numerice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>Alte valori</button>
      </div>
      <h3 class="pb-title">${p.title}</h3>
      <p class="pb-text">${p.text(prm)}</p>
      <div class="pb-given">
        <div><div class="pb-lbl">Se dă</div><table class="pb-data">${p.data(prm).map(([s, v]) => `<tr><td>${s}</td><td>=</td><td>${v}</td></tr>`).join('')}</table></div>
        <div><div class="pb-lbl">Se cere</div><ul class="pb-ask">${p.ask(prm).map((a) => `<li>${a} = ?</li>`).join('')}</ul></div>
      </div>

      <div class="pb-lbl">Răspunsul tău</div>
      <div class="pb-answers">${an.map((a, k) => `
        <label class="pb-ans" data-k="${k}"><span class="pb-al">${a.l} =</span>
          <input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="?">
          <span class="pb-u">${a.u}</span><span class="pb-mark"></span></label>`).join('')}
      </div>
      <div class="pb-actions">
        <button class="btn primary" id="pb-check">Verifică</button>
        <span class="small muted">Poți scrie cu virgulă sau cu punct (ex: 12,5). Se acceptă rezultate rotunjite (abatere de cel mult 1,5%).</span>
      </div>
      <div class="status" id="pb-fb" hidden><span class="dot"></span><span></span></div>

      <div class="pb-sol-head">
        <div class="pb-lbl">Rezolvare</div>
        <span class="small muted" id="pb-stepc"></span>
        <span class="sp"></span>
        <button class="btn" id="pb-next">Pasul următor</button>
        <button class="btn" id="pb-all">Arată tot</button>
        <button class="btn" id="pb-hide" hidden>Ascunde</button>
      </div>
      <ol class="pb-steps">${st.map(([t, h]) => `<li hidden><div class="pb-st">${t}</div><div class="pb-sb">${h}</div></li>`).join('')}</ol>
      <p class="pb-empty muted small" id="pb-empty">Încearcă întâi singur. Dacă te blochezi, dezvăluie rezolvarea pas cu pas.</p>

      <div class="pb-nav">
        <button class="btn" id="pb-prev">← Problema anterioară</button>
        <span class="sp"></span>
        <button class="btn" id="pb-fwd">Problema următoare →</button>
      </div>`;

    const steps = $$('.pb-steps li', card);
    const paintSteps = () => {
      steps.forEach((li, k) => (li.hidden = k >= shown));
      $('#pb-stepc').textContent = shown ? `${shown} / ${steps.length} pași` : `${steps.length} pași`;
      $('#pb-next').hidden = shown >= steps.length;
      $('#pb-all').hidden = shown >= steps.length;
      $('#pb-hide').hidden = shown === 0;
      $('#pb-empty').hidden = shown > 0;
      $('#pb-next').textContent = shown ? `Pasul ${shown + 1}` : 'Primul pas';
    };
    paintSteps();
    $('#pb-next').addEventListener('click', () => {
      shown++; S.tick(); paintSteps();
      const li = steps[shown - 1];
      li.classList.remove('pop'); void li.offsetWidth; li.classList.add('pop');
    });
    $('#pb-all').addEventListener('click', () => { shown = steps.length; S.click(); paintSteps(); });
    $('#pb-hide').addEventListener('click', () => { shown = 0; S.click(); paintSteps(); });
    $('#pb-check').addEventListener('click', check);
    $$('.pb-ans input', card).forEach((inp) => {
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
      inp.addEventListener('input', () => { inp.parentElement.classList.remove('ok', 'bad'); $('.pb-mark', inp.parentElement).textContent = ''; });
    });
    $('#pb-new').addEventListener('click', () => {
      let q, tries = 0;
      do { q = p.gen(); tries++; } while (JSON.stringify(q) === JSON.stringify(prm) && tries < 20);
      prm = q; S.click(); renderCard();
      MR.flash($('.pb-text', card));
    });
    const vis = visible(), pos = vis.indexOf(cur);
    $('#pb-prev').disabled = pos <= 0;
    $('#pb-fwd').disabled = pos >= vis.length - 1;
    $('#pb-prev').addEventListener('click', () => go(vis[pos - 1], true));
    $('#pb-fwd').addEventListener('click', () => go(vis[pos + 1], true));
  }

  const parse = (s) => {
    s = s.trim().replace(/\s/g, '').replace('−', '-').replace(',', '.');
    if (!s || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    return parseFloat(s);
  };
  const near = (u, v) => Math.abs(u - v) <= Math.max(0.015 * Math.abs(v), 0.011);

  function check() {
    const p = P[cur], an = p.ans(prm);
    const fb = $('#pb-fb');
    let allOk = true, empty = 0;
    const tips = [];
    $$('.pb-ans', card).forEach((el, k) => {
      const a = an[k], u = parse($('input', el).value), mk = $('.pb-mark', el);
      el.classList.remove('ok', 'bad');
      if (u === null) { empty++; allOk = false; mk.textContent = ''; return; }
      const ok = near(u, a.v);
      el.classList.add(ok ? 'ok' : 'bad');
      mk.textContent = ok ? '✓' : '✗';
      if (ok) return;
      allOk = false;
      const trap = (a.trap || []).find(([tv]) => near(u, tv));
      if (trap) tips.push(`<b>${a.l}:</b> ${trap[1]}`);
      else if (near(-u, a.v) && a.v !== 0) tips.push(`<b>${a.l}:</b> valoarea e corectă, dar verifică <b>semnul</b>.`);
      else if (near(u, a.v * 3.6) || near(u, a.v / 3.6)) tips.push(`<b>${a.l}:</b> verifică <b>unitatea de măsură</b>: se cere în ${a.u} (1 m/s = 3,6 km/h).`);
    });
    fb.hidden = false;
    if (allOk) {
      fb.className = 'status good';
      fb.lastElementChild.innerHTML = `<b>Corect!</b> ${shown < $$('.pb-steps li', card).length ? 'Poți compara cu rezolvarea pas cu pas sau poți încerca problema cu <b>alte valori</b>.' : 'Încearcă problema și cu <b>alte valori</b>.'}`;
      S.ok();
      if (!solved[p.id]) { solved[p.id] = 1; save(); renderList(); }
    } else if (empty === an.length) {
      fb.className = 'status warn';
      fb.lastElementChild.innerHTML = 'Completează răspunsul (doar valoarea numerică), apoi apasă <b>Verifică</b>.';
      S.err();
    } else {
      fb.className = 'status bad';
      fb.lastElementChild.innerHTML = (empty ? `Mai ai ${empty === 1 ? 'un câmp necompletat' : empty + ' câmpuri necompletate'}. ` : '') +
        (tips.length ? tips.join('<br>') : 'Unele valori nu sunt corecte. Verifică formulele și calculele, sau dezvăluie un pas din rezolvare.');
      S.err();
    }
    MR.flash(fb);
  }

  function go(i, scroll) {
    cur = i; prm = Object.assign({}, P[i].base);
    renderList(); renderCard();
    if (scroll) { S.click(); card.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  }

  list.addEventListener('click', (e) => {
    const b = e.target.closest('.pb-item');
    if (!b) return;
    go(+b.dataset.i, window.innerWidth < 1080);
    if (window.innerWidth >= 1080) S.click();
  });
  MR.chipGroup($('#pb-filter'), (k) => {
    filter = k; S.click();
    const vis = visible();
    if (!vis.includes(cur)) go(vis[0]); else { renderList(); renderCard(); }
  });
  $('#pb-reset').addEventListener('click', () => {
    solved = {}; save(); renderList(); S.click();
  });

  go(0);
  MR.problems = P;
  MR.sections.probleme = { show() {}, hide() {} };
})();
