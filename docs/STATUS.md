# Status projektu

## Ostatni etap: Etap 0 — Audyt (zakończony i wdrożony)

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
