# Status projektu

## Ostatni etap: Etap 0 — Audyt (pełna wersja)

Data: 2026-07-14

**Wykonano:**
- Pełna analiza struktury repozytorium: 16 plików HTML, `robots.txt`, `sitemap.xml`, `vercel.json`, `package.json`, katalog `upload/`.
- Zbudowano pełną tabelę wszystkich URL-i (adres, plik, intencja, fraza, title, H1, canonical, status) — `docs/AUDYT-SEO.md`, sekcja 3.
- Sprawdzono linkowanie wewnętrzne — brak martwych linków do nieistniejących plików; znaleziono 2 martwe kotwice w `privacy-policy.html`.
- Sprawdzono menu mobilne na wszystkich stronach — działa poprawnie tylko na 2/16 (`index.html`, `korepetycje-online.html`); pozostałe 12 chowa linki nawigacyjne bez zamiennika poniżej 900px.
- Sprawdzono formularze, integrację Google Sheets, Meta Pixel, GA — wszystko spójne, jeden endpoint/jeden identyfikator na cały serwis, nietestowane pod kątem wysyłki (zgodnie z zasadami bezpieczeństwa).
- Sprawdzono duplikaty treści — potwierdzono identyczny H1 na `index.html` i `korepetycje-online.html`; FAQ i pozostałe treści unikalne.
- Zweryfikowano na produkcji (curl, nie założenie) działanie przekierowań `.html` → adres czysty — HTTP 308, poprawne.
- Sprawdzono obrazy/alt, dostępność (lang, aria, labels), wydajność (rozmiary plików, lazy loading) na podstawie analizy statycznej kodu.
- Przygotowano propozycję planu wdrożenia w 4 kolejnych etapach (`docs/AUDYT-SEO.md`, sekcja 20) — bez wdrażania czegokolwiek.

**Nie wykonano (celowo, zgodnie z poleceniem):**
- Żadnych zmian w kodzie HTML/CSS/JS, konfiguracji Vercel, `robots.txt`, `sitemap.xml`.
- Żadnych zmian w trackingu, formularzach, integracji Google Sheets.
- Nie użyto przeglądarki (Browser MCP) — wszystkie dane pozyskano z plików lokalnych i nagłówków HTTP (`curl`).
- Commit/push — brak zmian produkcyjnych, jedynie aktualizacja `docs/`.

**Kluczowe potwierdzone problemy do decyzji właściciela:**
1. Rozdzielenie matura/E8 dla matematyki, angielskiego, polskiego (główny problem strukturalny).
2. Naprawa 2 martwych kotwic w `privacy-policy.html`.
3. Ujednolicenie menu mobilnego na 12 stronach bez hamburgera.
4. Zróżnicowanie zduplikowanego H1 na `index.html`/`korepetycje-online.html`.
5. Decyzja ws. `/zapisz-sie` (dodać do sitemap? potwierdzić brak linkowania jako zamierzony?).
6. Decyzja ws. slugu polityki prywatności (`/privacy-policy` vs. `/polityka-prywatnosci`).

**Następny krok:** oczekiwanie na akceptację audytu i polecenie, od którego z proponowanych etapów (sekcja 20 w `AUDYT-SEO.md`) zacząć.
