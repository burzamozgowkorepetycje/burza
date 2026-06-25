# Burza Mózgów Korepetycje — Wyszków

Strona internetowa centrum korepetycji **Burza Mózgów** w Wyszkowie.
Kursy maturalne i przygotowanie do egzaminu ósmoklasisty.

## Typ projektu

Statyczna strona HTML — jeden plik `index.html` z wbudowanym CSS i JS.
**Brak zależności i brak kroku budowania.**

## Podgląd lokalny

```bash
npm install        # nic nie instaluje (brak zależności)
npm run dev        # uruchamia lokalny serwer na http://localhost:3000
```

lub po prostu otwórz `index.html` w przeglądarce.

## Build

```bash
npm run build      # strona statyczna — nie wymaga budowania (no-op)
```

## Deployment

Hostowana na [Vercel](https://vercel.com) jako strona statyczna.
Konfiguracja w `vercel.json` (framework: brak, katalog wyjściowy: `.`).
Każdy `git push` na gałąź `main` automatycznie aktualizuje stronę.
