# Plan przebudowy strony — Burza Mózgów Korepetycje

Ten plik jest żywym dokumentem: aktualna architektura, etapy, ograniczenia i decyzje właściciela. Aktualizować po każdym etapie.

## Cel

Przebudować stronę pod kątem SEO, sprzedaży, szybkości i użyteczności, bez utraty obecnych treści, działania formularzy, integracji i pozycji w Google. Wspierać sprzedaż zajęć online w całej Polsce.

## Zasady bezpieczeństwa (obowiązują przez cały projekt)

1. Nie usuwać ani nie zastępować strony głównej bez wcześniejszej analizy kodu.
2. Nie usuwać żadnej działającej podstrony.
3. Nie zmieniać sposobu wysyłania formularzy do Google Sheets.
4. Nie usuwać/modyfikować identyfikatora Meta Pixel bez wyraźnej potrzeby.
5. Nie usuwać skryptów analitycznych, zgód marketingowych ani polityki prywatności.
6. Nie zmieniać numeru telefonu: 605 947 803.
7. Nie zmieniać adresów: ul. Prosta 3, 07-200 Wyszków; ul. Sowińskiego 38, 07-200 Wyszków.
8. Nie wykonywać zmian niezwiązanych z bieżącym etapem.
9. Zachować obecną identyfikację wizualną i wysoką jakość projektu.
10. Wszystkie zmiany responsywne.
11. Przed zmianami sprawdzić stan repo i niezacommitowane zmiany.
12. Nie nadpisywać zmian użytkownika.
13. Nie wdrażać wszystkiego naraz.
14. Najpierw audyt i plan plików/zmian.
15. Po każdym etapie testy + dokładny opis zmian.
16. Nie wymyślać opinii, wyników, danych nauczycieli, informacji o ofercie.
17. Brak danych → wyraźny placeholder techniczny lub pytanie do właściciela.
18. Każdy etap kończy się kompletną, produkcyjnie gotową zmianą.
19. Po testach: commit → push → weryfikacja na Vercel/produkcji.
20. Nie rozpoczynać kolejnego etapu bez polecenia użytkownika.

## Obecna struktura (stan na start projektu)

```
/
├── kursy
├── kurs-matematyka        (matura + E8 pod jednym URL — patrz AUDYT-SEO.md)
├── kurs-angielski         (matura + E8 pod jednym URL)
├── kurs-polski            (matura + E8 pod jednym URL)
├── korepetycje-matematyka
├── korepetycje-angielski
├── korepetycje-polski
├── korepetycje-biologia
├── korepetycje-chemia
├── korepetycje-hiszpanski
├── korepetycje-geografia
├── korepetycje-wos
├── korepetycje-online
├── zapisz-sie             (poza sitemap.xml — brak w briefie, istnieje w repo)
└── polityka-prywatnosci   (obecnie pod adresem /privacy-policy — niespójność do decyzji)
```

## Docelowa struktura

```
/
├── kursy
├── kursy-maturalne
│   ├── kurs-maturalny-matematyka
│   ├── kurs-maturalny-angielski
│   ├── kurs-maturalny-polski
│   ├── kurs-maturalny-biologia
│   ├── kurs-maturalny-chemia
│   ├── kurs-maturalny-geografia
│   └── kurs-maturalny-wos
├── kursy-egzamin-osmoklasisty
│   ├── kurs-e8-matematyka
│   ├── kurs-e8-angielski
│   └── kurs-e8-polski
├── korepetycje-matematyka
├── korepetycje-angielski
├── korepetycje-polski
├── korepetycje-biologia
├── korepetycje-chemia
├── korepetycje-hiszpanski
├── korepetycje-geografia
├── korepetycje-wos
├── korepetycje-online
├── zajecia-indywidualne
├── zajecia-grupowe
├── cennik
├── wyniki
├── opinie
├── o-nas
├── kontakt
├── lokalizacje
│   ├── prosta-3-wyszkow
│   └── sowinskiego-38-wyszkow
├── blog
└── polityka-prywatnosci
```

## Główny problem strukturalny (potwierdzony w audycie)

`kurs-matematyka`, `kurs-angielski`, `kurs-polski` obsługują jednocześnie intencję maturalną i E8 pod jednym adresem, rozróżnianą tylko JS-owym przełącznikiem zakładek. Wymaga rozdzielenia na osobne adresy z zachowaniem starych URL-i (przekierowania, nie usuwanie). Szczegóły: `docs/AUDYT-SEO.md`, sekcja 19.

## Dodatkowe potwierdzone ustalenia (pełny audyt, sekcje 3–18 w AUDYT-SEO.md)

- **Brak martwych linków** do nieistniejących plików — zweryfikowano wszystkie `href` wewnętrzne.
- **2 martwe kotwice** w `privacy-policy.html` (`/#przedmioty`, `/#kontakt` — na `index.html` te ID nie istnieją, są `#subjects`/`#contact`).
- **Menu mobilne działa tylko na 2 z 16 stron** (`index.html`, `korepetycje-online.html`). Pozostałe 12 stron chowa linki nawigacyjne poniżej 900px bez żadnego zamiennika (hamburgera) — zostają tylko przyciski CTA/telefon.
- **Zduplikowany H1** („Średni wynik naszych uczniów to 80%.”) — identyczny słowo w słowo na `index.html` i `korepetycje-online.html`.
- **Przekierowanie `.html` → adres czysty zweryfikowane na produkcji** (curl, HTTP 308) — działa poprawnie, ale linki wewnętrzne nadal wskazują na `.html` (niepotrzebny dodatkowy przeskok).
- `/zapisz-sie` (landing pod kampanie płatne) nie jest w `sitemap.xml` i nie jest linkowany z żadnej innej strony — do potwierdzenia, czy to zamierzone.
- `wyniki-zbiorcze.png` waży 1,6 MB — kandydat do konwersji/kompresji.

Pełne tabele URL, szczegóły techniczne i proponowany plan wdrożenia (etapy 1–4+): `docs/AUDYT-SEO.md`.

## Etapy

- **Etap 0 — Audyt:** wyłącznie dokumentacja. Zero zmian w kodzie produkcyjnym. Wynik: `docs/AUDYT-SEO.md`.
- **Etap 1 — Wspólny system komponentów:** zaimplementowany, oczekuje na wdrożenie. Szczegóły: `docs/STATUS.md`.
- **Etap 2 — Strony egzaminacyjne:** zaimplementowany, oczekuje na wdrożenie. Szczegóły: `docs/STATUS.md`.
- **Kolejne etapy:** do zaplanowania i zatwierdzenia przez właściciela, jeden po drugim, każdy z osobnym zestawem plików do zmiany, testami i commitem po zakończeniu.

Nie tworzymy wszystkich stron docelowej struktury od razu — każdy etap obejmuje wąski, uzgodniony zakres.

## Decyzje właściciela (oczekujące)

- Slug polityki prywatności: `/privacy-policy` (obecny, zaindeksowany) vs. `/polityka-prywatnosci` (docelowy) — potrzebna decyzja i plan przekierowania.
- Nowe sekcje (`zajecia-indywidualne`, `zajecia-grupowe`, `cennik`, `wyniki`, `opinie`, `o-nas`, `kontakt`, `lokalizacje`, `blog`) — nowe strony od zera czy wydzielenie z istniejących treści?
- Źródło danych do opinii/wyników/nauczycieli — co jest dostępne od właściciela już teraz.

## Log decyzji

- **2026-07-14 (Etap 2, strony egzaminacyjne):** utworzono 8 stron rozdzielających intencję matura/E8 (2 huby + 6 stron przedmiotowych: matematyka, angielski, polski). Adresy płaskie (`/kursy-maturalne`, `/kurs-maturalny-matematyka` itd.), nie zagnieżdżone jak w szkicu „docelowa struktura” powyżej — witryna jest statyczna bez routingu obsługującego podkatalogi. `kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html` pozostają nietknięte jako strony wyboru egzaminu (zgodnie z poleceniem), z dodanym linkiem do stron dedykowanych. Gwarancja 70%+ dodana wyłącznie na stronach matematyki (matura i E8) — potwierdzone w istniejącej treści serwisu, że dotyczy wyłącznie tego przedmiotu. Biologia, chemia, geografia i WOS nie mają jeszcze stron maturalnych — pozostają w `kursy.html`; naturalny zakres kolejnego etapu. Szczegóły i pełna lista testów: `docs/STATUS.md`.
- **2026-07-14 (Etap 1, wspólny system komponentów):** zakres ograniczony do 12 stron "prostych" (bez `index.html`, `korepetycje-online.html`, `zapisz-sie.html`, `privacy-policy.html` — różne systemy designu, patrz `docs/STATUS.md`). Mechanizm: build-time include w czystym Node, zero zależności, zamiast wspólnego pliku CSS/JS bez generatora — właściciel wybrał opcję z automatycznym wstrzykiwaniem HTML nagłówka/stopki z `/partials`, żeby tworzenie nowych stron nie wymagało ręcznego kopiowania nawigacji.
