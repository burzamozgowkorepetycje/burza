# Status projektu

## Ostatni etap: Etap 1 — Wspólny system komponentów (zaimplementowany, oczekuje na wdrożenie)

Data: 2026-07-14

**Zakres:** 12 stron "prostych" (`korepetycje-biologia/chemia/geografia/wos/hiszpanski/matematyka/angielski/polski.html`, `kursy.html`, `kurs-matematyka/angielski/polski.html`). Poza zakresem: `index.html` i `korepetycje-online.html` (własny, już działający system nawigacji — flagowy design z SVG logo), `zapisz-sie.html` (celowo minimalistyczny landing kampanii płatnych), `privacy-policy.html` (strona prawna bez nawigacji).

**Mechanizm:** build-time include w czystym Node (zero zależności), zgodnie z decyzją właściciela. Źródło prawdy:
- `partials/tracking-head.html`, `partials/gtm-noscript.html`, `partials/footer.html` — fragmenty HTML wstrzykiwane do stron.
- `assets/shared.css` — DODATKOWE style (menu mobilne, breadcrumbs), nie nadpisuje istniejącego wyglądu strony.
- `assets/shared.js` — wspólna logika: wysyłka leadów do Google Sheets (`Shared.sendLead`), status formularza, tracking Meta Pixel, FAQ toggle, płynne przewijanie, tracking kliknięć telefonu, menu mobilne.
- `scripts/build-components.js` — skrypt budujący, idempotentny, uruchamiany przez `npm run build` i `vercel.json` (`buildCommand`).

**Zmiany widoczne na stronie:**
- Dodano brakujące menu mobilne (hamburger + panel) na 12 stronach, które go wcześniej nie miały — naprawia lukę z audytu (sekcja "Menu mobilne działa tylko na 2 z 16 stron").
- Dodano breadcrumbs (widoczne + `BreadcrumbList` JSON-LD) na każdej z 12 stron, generowane automatycznie z `<title>` — bez wymyślania treści.
- Formularze nadal wysyłają dane dokładnie do tego samego adresu Google Apps Script (`LEADS_URL` niezmieniony, teraz w jednym miejscu w `assets/shared.js`).
- Tracking (GTM/GA4/Meta Pixel) ujednolicony do jednego źródła (`partials/tracking-head.html`), identyfikatory bez zmian (G-ZWWWQMM89P, GTM-NLNXJ3DC, pixel 37060592533531781), brak duplikacji eventów.
- Wygląd wizualny stron niezmieniony poza dodaniem hamburgera i breadcrumbs (potwierdzone diffem — reszta HTML/CSS bez zmian).

**Testy wykonane:**
- Skrypt budujący przetestowany na kopii roboczej przed uruchomieniem na plikach repo; sprawdzona idempotencja (drugi przebieg = brak zmian).
- Weryfikacja regex: brak osieroconych wywołań `sendLead`/`track`/`showStatus` poza `Shared.*`, brak zduplikowanych definicji funkcji, wszystkie 12 stron mają menu mobilne i breadcrumbs.
- Walidacja HTML (`html.parser`) — wszystkie 12 stron parsują się bez błędów.
- Weryfikacja wizualna w przeglądarce (localhost:3456) na 375px, 768px, 1440px na `korepetycje-biologia.html`, `kursy.html`, `korepetycje-matematyka.html`: menu mobilne otwiera/zamyka się poprawnie (aria-expanded, focus na X), FAQ toggle działa, przełącznik matura/E8 na `kursy.html` działa, `window.Shared` zdefiniowany, `data-zrodlo`/`data-tel-source` poprawnie ustawione per strona.
- Formularze leadowe NIE zostały faktycznie wysłane podczas testów (uniknięcie fałszywych wpisów w arkuszu Google i fałszywych eventów Meta Pixel na produkcji) — poprawność wiązania potwierdzona przez inspekcję DOM/JS, nie przez realne submitty.
- `git diff` na plikach poza zakresem (`index.html`, `korepetycje-online.html`, `zapisz-sie.html`, `privacy-policy.html`, `robots.txt`, `sitemap.xml`) — pusty, potwierdzone brak zmian.

**Znane ograniczenie (do świadomej decyzji, nie blokuje wdrożenia):** `outputDirectory` w `vercel.json` to `.`, więc `/partials/*.html` i `/scripts/*.js` będą publicznie dostępne pod tymi adresami po wdrożeniu (analogicznie jak wcześniej `docs/` przed dodaniem `.vercelignore`). Nie zawierają sekretów ani danych osobowych — to wyłącznie kod budujący i fragmenty HTML już widoczne na stronach. Ukrycie ich wymagałoby osobnego katalogu `dist/` jako `outputDirectory`, co jest cięższym rozwiązaniem niż uzgodniony zakres tego etapu.

**Wdrożenie:** niewykonane — oczekuje na polecenie właściciela (commit → push → weryfikacja na Vercel/produkcji, zgodnie z zasadą 19).

**Następny etap:** nierozpoczęty, oczekuje na polecenie właściciela.

---

## Etap 0 — Audyt (zakończony i wdrożony)

Data: 2026-07-14

**Zmiany wykonane w tym etapie:**
- Dodano dokumentację audytu: `docs/AUDYT-SEO.md`, `docs/PLAN-STRONY.md`, `docs/STATUS.md` (21 sekcji pełnego audytu SEO/UX/technicznego, tabela wszystkich 16 URL-i, propozycja planu 4 kolejnych etapów).
- Dodano `.vercelignore` (`docs/`) — naprawa problemu znalezionego przy weryfikacji wdrożenia: `vercel.json` ma `outputDirectory: "."`, więc bez tego wpisu cały katalog `docs/` (w tym wewnętrzny audyt SEO) był publicznie dostępny pod `/docs/*.md`.

**Pliki zmienione:** `docs/AUDYT-SEO.md` (nowy), `docs/PLAN-STRONY.md` (nowy), `docs/STATUS.md` (nowy), `.vercelignore` (nowy). Żaden plik produkcyjny strony (HTML/CSS/JS, `robots.txt`, `sitemap.xml`, `vercel.json`) nie został zmieniony.

**Testy:**
- Repo nie ma skryptu `test` (statyczny HTML bez frameworka) — brak testów automatycznych do uruchomienia.
- Weryfikacja ograniczona do: `git diff --name-only HEAD` (potwierdzenie braku zmian w plikach śledzonych poza nowymi), sprawdzenia poprawności treści dokumentów oraz testów na żywej produkcji po wdrożeniu (patrz niżej).

**Wdrożenie:**
1. Commit `cae0801` — dodanie 3 plików `docs/*.md`. Push powiódł się dopiero za 3. próbą (2 pierwsze zakończyły się przejściowym błędem `remote: fatal error in commit_refs` po stronie GitHub, bez związku z zawartością zmian).
2. Po redeployu Vercel wykryto, że `/docs/AUDYT-SEO.md` zwraca **HTTP 200** (publicznie dostępny) — problem, nie było go w planie, napraw i zweryfikowano ponownie zgodnie z procedurą.
3. Commit `4737bea` — dodanie `.vercelignore` z wpisem `docs/`, push powiódł się od razu.
4. Po redeployu zweryfikowano na produkcji:
   - `/docs/AUDYT-SEO.md` → **HTTP 404** (poprawnie ukryte).
   - `/` (strona główna) → HTTP 200.
   - `/kursy`, `/kurs-matematyka`, `/privacy-policy` → HTTP 200 (spot-check, brak regresji).

**Adres wdrożenia:** https://burza-mozgow-korepetycje.pl
**Gałąź:** `main`
**Finalny hash commita:** `4737bea` (poprzedni: `cae0801`)

**Problemy napotkane i rozwiązane:**
- Przejściowy błąd push do GitHub (`fatal error in commit_refs`) — rozwiązany przez ponowienie próby (bez zmian w kodzie/konfiguracji).
- Nieplanowana publiczna ekspozycja `docs/` na produkcji przez `outputDirectory: "."` w `vercel.json` — rozwiązana przez dodanie `.vercelignore`, zweryfikowana ponownym testem na żywej stronie.

**Następny etap (nierozpoczęty — oczekuje na polecenie właściciela):** wybór jednego z etapów zaproponowanych w `docs/AUDYT-SEO.md` sekcja 20, m.in.:
1. Rozdzielenie matura/E8 dla matematyki, angielskiego, polskiego (główny problem strukturalny).
2. Naprawa 2 martwych kotwic w `privacy-policy.html`, dodanie `/zapisz-sie` do sitemap, ujednolicenie linków wewnętrznych, zróżnicowanie zduplikowanego H1.
3. Optymalizacja obrazów (`wyniki-zbiorcze.png` 1,6 MB) i `loading="lazy"`.
4. Nowe sekcje strony (cennik, opinie, lokalizacje, blog itd.) — wymaga danych od właściciela.
