# Mișcarea rectilinie — laborator interactiv de fizică

Aplicație web pentru elevi despre mișcarea rectilinie: tipuri de mișcări, mișcarea rectilinie uniformă (MRU) și mișcarea rectilinie uniform variată (MRUV), cu formule, simulări, grafice și sunete.

**Demo:** https://traianan.github.io/miscarea-rectilinie/ (GitHub Pages) · https://d3d5m6igdl3grp.cloudfront.net

## Ce conține

1. **Tipuri de mișcări**: clasificare după forma traiectoriei și după accelerație, tabel recapitulativ și un exercițiu de clasificare.
2. **Mișcarea rectilinie**: poziție, deplasare, viteză medie, convertor de unități pentru viteză, simulare MRU cu glisoare și graficele x(t) și v(t), întâlnirea a două mobile.
3. **Mișcarea rectilinie uniform variată**: formule, simulator, toate cazurile posibile (accelerare și frânare, sensuri) și un calculator pentru ecuația lui Galilei.
4. **Probleme rezolvate**: 20 de probleme MRU și MRUV (inclusiv citire de pe grafic, întâlnirea mobilelor, aruncarea pe verticală). Fiecare are rezolvare pas cu pas, care se dezvăluie treptat, verificarea răspunsului și variante cu alte valori numerice.
   - **Mod Test**: 5 probleme aleatorii cu valori noi, fără rezolvare vizibilă, cu cronometru, limită de timp opțională (10 / 20 / 30 min, cu predare automată) și notă de la 1 la 10. La final apare recapitularea cu rezolvările.

Progresul și istoricul testelor se salvează local, în browser.

## Rulare

Aplicația este statică (HTML, CSS și JavaScript simplu, fără dependențe și fără build):

```bash
cd site
python3 -m http.server 8000
# apoi deschide http://localhost:8000
```

Merge și fără internet: descarcă `site/miscarea-rectilinie-offline.zip`, dezarhivează și deschide `index.html`.

## Publicare pe GitHub Pages

Site-ul este servit din ramura `gh-pages`, care conține doar folderul `site/`. După ce faci commit la modificări:

```bash
git push
git subtree push --prefix site origin gh-pages
```

## Structură

```
site/
  index.html          # pagina și secțiunile
  css/style.css       # stiluri (temă luminoasă și întunecată)
  fonts/              # fonturi locale
  js/core.js          # utilitare comune, sunete
  js/plot.js          # grafice
  js/sec1-tipuri.js   # tipuri de mișcări
  js/sec2-mru.js      # mișcarea rectilinie, MRU
  js/sec3-mruv.js     # MRUV
  js/sec4-probleme.js # probleme rezolvate
  js/sec4-test.js     # modul Test
  js/app.js           # navigare
```
