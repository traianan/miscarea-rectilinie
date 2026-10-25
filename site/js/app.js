/* Navigare între secțiuni, sunet, temă. */
(function () {
  const MR = window.MR, $ = MR.$, $$ = MR.$$;
  const TABS = ['tipuri', 'mru', 'mruv', 'probleme'];
  let current = null;

  function show(name) {
    if (!TABS.includes(name)) name = 'tipuri';
    if (current === name) return;
    if (current && MR.sections[current]) MR.sections[current].hide();
    current = name;
    $$('.tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
    TABS.forEach((id) => (document.getElementById(id).hidden = id !== name));
    MR.sections[name] && MR.sections[name].show();
    if (location.hash !== '#/' + name) history.replaceState(null, '', '#/' + name);
  }
  $$('.tab').forEach((t) => t.addEventListener('click', () => { MR.sound.click(); show(t.dataset.tab); window.scrollTo({ top: 0 }); }));
  window.addEventListener('hashchange', () => show(location.hash.replace(/^#\/?/, '')));
  show(location.hash.replace(/^#\/?/, ''));
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0));

  // sunet
  const sb = $('#btn-sound');
  function paintSound() {
    sb.setAttribute('aria-pressed', String(MR.sound.on));
    $$('.wave', sb).forEach((w) => (w.style.display = MR.sound.on ? '' : 'none'));
    $('.mute', sb).style.display = MR.sound.on ? 'none' : '';
  }
  try { MR.sound.on = localStorage.getItem('mr-sound') !== 'off'; } catch (e) { /* file:// fără localStorage */ }
  paintSound();
  sb.addEventListener('click', () => {
    MR.sound.on = !MR.sound.on;
    try { localStorage.setItem('mr-sound', MR.sound.on ? 'on' : 'off'); } catch (e) {}
    paintSound();
    MR.sound.ok();
  });

  // temă zi / noapte
  const tb = $('#btn-theme');
  function paintTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('.moon', tb).style.display = dark ? 'none' : '';
    $('.sun', tb).style.display = dark ? '' : 'none';
  }
  paintTheme();
  tb.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('mr-theme', next); } catch (e) {}
    paintTheme();
    MR.redrawAll();
  });

  // fonturile se încarcă după primul desen: redesenăm o dată
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => MR.redrawAll());
})();
