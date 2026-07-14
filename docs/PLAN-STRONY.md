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
- **Etap 2 — Strony egzaminacyjne:** zaimplementowany i wdrożony. Szczegóły: `docs/STATUS.md`.
- **Etap 3 — Dopracowanie stron korepetycji przedmiotowych:** zaimplementowany i wdrożony (3 partie po 2-3 przedmioty). Szczegóły: `docs/STATUS.md`.
- **Etap 4 — Przebudowa /korepetycje-online:** zaimplementowany, oczekuje na wdrożenie (brak polecenia „wdróż” w instrukcji). Szczegóły i lista pytań do właściciela: `docs/STATUS.md`.
- **Etap 5 — Strony lokalizacji:** zaimplementowany i wdrożony (`/lokalizacje`, `/lokalizacja-prosta-3-wyszkow`, `/lokalizacja-sowinskiego-38-wyszkow`). Szczegóły, audyt źródeł danych i lista pytań do właściciela: `docs/STATUS.md`.
- **Etap 6 — Zaufanie i konwersja:** zaimplementowany, oczekuje na wdrożenie (brak polecenia „wdróż” w instrukcji). `/wyniki`, `/cennik`, `/opinie`, `/o-nas`, `/kontakt`. Szczegóły, audyt danych i lista pytań do właściciela: `docs/STATUS.md`.
- **Etap 7 — Blog:** partia 1/2 zaimplementowana i wdrożona (`/blog` + 3 artykuły o maturze z matematyki i wyborze formy zajęć). Partia 2/2 (pozostałe 3 tematy: E8 i decyzja o korepetycjach) czeka na kolejne polecenie. Szczegóły: `docs/STATUS.md`.
- **Etap 8 — SEO techniczne:** zaimplementowany, przetestowany i wdrożony. Poprawki na wszystkich 36 stronach (usunięcie linków `.html`, brakujące OG/breadcrumbs na `privacy-policy`/`zapisz-sie`/`index`/`korepetycje-online`, naprawa duplikatu H1 na stronach wyboru egzaminu, naprawa martwych kotwic i żywego błędu 404 w linkach bloga do niewdrożonego Etapu 6, nowa strona `/404`, wzmocnione linkowanie międzyklastrowe). Mapa URL-i i przekierowań poniżej. Szczegóły: `docs/STATUS.md`.
- **Kolejne etapy:** do zaplanowania i zatwierdzenia przez właściciela, jeden po drugim, każdy z osobnym zestawem plików do zmiany, testami i commitem po zakończeniu.

Nie tworzymy wszystkich stron docelowej struktury od razu — każdy etap obejmuje wąski, uzgodniony zakres.

## Decyzje właściciela (oczekujące)

- Slug polityki prywatności: `/privacy-policy` (obecny, zaindeksowany) vs. `/polityka-prywatnosci` (docelowy) — potrzebna decyzja i plan przekierowania.
- Nowe sekcje (`zajecia-indywidualne`, `zajecia-grupowe`, `cennik`, `wyniki`, `opinie`, `o-nas`, `kontakt`, `lokalizacje`, `blog`) — nowe strony od zera czy wydzielenie z istniejących treści?
- Źródło danych do opinii/wyników/nauczycieli — co jest dostępne od właściciela już teraz.

## Mapa URL-i i przekierowań (stan po Etapie 8, 2026-07-15)

**Mechanizm przekierowań:** wyłącznie `cleanUrls: true` w `vercel.json` — automatyczne 308 z `/adres.html` na `/adres`. Zweryfikowane na produkcji, bez pętli i bez łańcuchów (wszystkie linki wewnętrzne od Etapu 8 wskazują bezpośrednio na adres bez `.html`, więc przekierowanie nigdy nie jest już potrzebne przy nawigacji po stronie — tylko jako zabezpieczenie dla starych/zewnętrznych linków do `.html`).

**Żadien opublikowany adres nie został w Etapie 8 zmieniony ani usunięty — brak przekierowań 301 do wykonania teraz.**

**Adresy opublikowane (w `sitemap.xml`, indeksowalne):**
`/`, `/korepetycje-online`, `/kursy`, `/kurs-matematyka`, `/kurs-polski`, `/kurs-angielski`, `/kursy-maturalne`, `/kursy-egzamin-osmoklasisty`, `/kurs-maturalny-matematyka`, `/kurs-maturalny-angielski`, `/kurs-maturalny-polski`, `/kurs-e8-matematyka`, `/kurs-e8-angielski`, `/kurs-e8-polski`, `/korepetycje-matematyka`, `/korepetycje-polski`, `/korepetycje-angielski`, `/korepetycje-biologia`, `/korepetycje-chemia`, `/korepetycje-geografia`, `/korepetycje-wos`, `/korepetycje-hiszpanski`, `/lokalizacje`, `/lokalizacja-prosta-3-wyszkow`, `/lokalizacja-sowinskiego-38-wyszkow`, `/blog`, `/blog-jak-przygotowac-sie-do-matury-z-matematyki`, `/blog-jak-zdobyc-70-procent-z-matury-z-matematyki`, `/blog-kurs-grupowy-czy-korepetycje-indywidualne`, `/privacy-policy`.

**Adresy istniejące, świadomie poza sitemapą:**
- `/zapisz-sie` — `noindex, nofollow`, landing kampanii płatnych (zamierzone, nie błąd).
- `/404` — strona błędu, `noindex, follow`, nie jest treścią do indeksowania.

**Adresy zaimplementowane, jeszcze niewdrożone (Etap 6 — oczekują na commit):**
`/cennik`, `/wyniki`, `/opinie`, `/o-nas`, `/kontakt` — pliki istnieją w repozytorium, ale nie są w git ani w `sitemap.xml`. Do dodania do sitemapy dopiero w commicie, który je faktycznie opublikuje.

**Planowana zmiana adresu (oczekuje na decyzję właściciela, patrz sekcja "Decyzje właściciela"):**
`/privacy-policy` → `/polityka-prywatnosci` — gdy zapadnie decyzja, wymaga: (1) utworzenia pliku pod nowym adresem, (2) przekierowania 301 `/privacy-policy` → `/polityka-prywatnosci` w `vercel.json` (`redirects`), (3) aktualizacji wszystkich linków wewnętrznych i `sitemap.xml`, (4) weryfikacji braku łańcucha (stary adres nie może przekierowywać przez pośredni krok).

## Log decyzji

- **2026-07-15 (Etap 8, SEO techniczne):** pełny audyt 36 stron (title/description/H1/canonical/OG/JSON-LD/linki/alt/robots/sitemap/linkowanie). Największe realne ryzyko znalezione podczas audytu: strony bloga (wdrożone w Etapie 7) linkowały na żywo do `/cennik` i `/kontakt` — adresów Etapu 6, które nadal nie są wdrożone — co dawało realny błąd 404 w produkcji; naprawiono, przekierowując te linki na istniejące, wdrożone sekcje `/kursy-maturalne#cena` i `/kursy-maturalne#zapis`. Usunięto sitewide zbędne `.html` z linków wewnętrznych (wszystkie 36 plików). Naprawiono duplikat H1 między stronami "wyboru egzaminu" (`kurs-matematyka/angielski/polski.html`) a nowymi dedykowanymi stronami maturalnymi — zmieniono H1 stron wyboru egzaminu tak, by opisywały realną, dwuegzaminową zawartość strony (nie usunięto ani nie przeniesiono żadnej działającej strony). Dodano brakujące OG/Twitter (`index`, `korepetycje-online`, `zapisz-sie`) i pełny zestaw OG + `BreadcrumbList` na `privacy-policy` (wcześniej bez żadnego JSON-LD), naprawiając przy okazji 2 znane martwe kotwice (`#przedmioty`/`#kontakt` → `#subjects`/`#contact`). Utworzono `/404` w tym samym systemie wizualnym co pozostałe strony. `sitemap.xml` celowo NIE rozszerzono o 5 stron Etapu 6 — nie są jeszcze wdrożone, więc sitemapa musi ich nie zawierać, żeby zostać "pełna i poprawna", a nie tylko "pełna". Nie wykonano przekierowań 301, bo żaden opublikowany adres nie zmienił się w tym etapie — jedyny znany przyszły przypadek (`/privacy-policy` → `/polityka-prywatnosci`) czeka na decyzję właściciela i został opisany w sekcji mapy URL-i.
- **2026-07-15 (Etap 7, blog — partia 1/2):** utworzono system bloga (`/blog`, flaty URL-e `/blog-nazwa-artykulu` zgodnie z konwencją serwisu) oraz pierwszą partię 3 artykułów (matura z matematyki ×2, wybór formy zajęć). Przed napisaniem treści zweryfikowano w wyszukiwarce aktualne fakty o formule 2023 matury z matematyki (180 minut, 50 punktów, próg 30%=15 pkt) zamiast polegać na wiedzy z pamięci. Byline artykułów to "Redakcja Burza Mózgów Korepetycje" (nazwa organizacji) — nie wymyślono nazwiska konkretnego autora, bo żadne nie jest potwierdzone w repozytorium. Każdy artykuł prowadzi do jednej usługi (kurs maturalny z matematyki lub cennik). Instrukcja zawierała wyraźne polecenie wdrożenia po każdej partii, więc partia 1/2 została od razu scommitowana i wypchnięta. Partia 2/2 (pozostałe 3 tematy) czeka na kolejne polecenie.
- **2026-07-14 (Etap 6, zaufanie i konwersja):** utworzono `/wyniki`, `/cennik`, `/opinie`, `/o-nas`, `/kontakt`. Znaleziono i wykorzystano prawdziwy zrzut wyników matury (`upload/wyniki-zbiorcze.jpg`) zamiast wymyślać liczby. Rozdzielono średnią maturalną (80%, potwierdzoną) od pojedynczego przypadku E8 (91%, bez zbiorczej średniej — brak takich danych) zgodnie z poleceniem "nie mieszaj średnich z różnych egzaminów". Użyto wyłącznie 3 istniejących, prawdziwych opinii — bez wymyślania kolejnych. Cennik pokazuje wyłącznie potwierdzone stawki (40 zł/h indywidualnie, 60 zł/tydz. grupowo); cenę par przedstawiono jako "wycena indywidualna" zamiast zmyślonej kwoty. `/o-nas` zawiera jawnie oznaczone placeholdery na historię firmy i profile nauczycieli (brak tych danych w repozytorium) — zgodnie z poleceniem "przygotuj strukturę i poproś o uzupełnienie". Instrukcja nie zawierała słowa „wdróż”, więc zmiany pozostają niescommitowane do czasu wyraźnego polecenia właściciela.
- **2026-07-14 (Etap 5, strony lokalizacji):** utworzono `/lokalizacje` (hub), `/lokalizacja-prosta-3-wyszkow`, `/lokalizacja-sowinskiego-38-wyszkow`, w tym samym szablonie wizualnym co pozostałe "proste" strony. Dane NAP (adresy, telefon, godziny) wzięte 1:1 z już potwierdzonych źródeł (`index.html`, `privacy-policy.html`, `footer.html`) — bez rozbieżności. Nie wymyślono: współrzędnych geo dla Prosta 3 (pominięte w schemacie), informacji o parkingu (sekcja pominięta), zdjęć budynku/wejścia/sal (brak w `/upload`, galeria pominięta) — wszystkie trzy trafiły na listę pytań do właściciela w `docs/STATUS.md`. Mapy zaimplementowane jako Google Maps embed po adresie tekstowym (`output=embed`), nie po wymyślonych współrzędnych. Link "cennik" prowadzi tymczasowo do `/kursy.html` wobec braku dedykowanej strony cennika. Nie utworzono stron dla innych miast (Legionowo, Jabłonna) — brak potwierdzonych tam placówek. Nie zmieniono globalnej nawigacji pozostałych stron ani `index.html#locations` — poza zakresem etapu.
- **2026-07-14 (Etap 4, przebudowa /korepetycje-online):** przebudowano treść strony (H1, sekcja przedmiotów, sekcja "jak wyglądają zajęcia", FAQ, formularz, statystyki, breadcrumbs), zachowując bez zmian współdzielony z `index.html` "flagowy" design/nav/quiz-modal. Rozdzielono ofertę wg formy: indywidualnie online (8 przedmiotów), grupowo online (matematyka/angielski/polski — potwierdzone w `kurs-maturalny-*`/`kurs-e8-*.html`), grupa wyłącznie stacjonarnie (biologia/chemia/geografia/WOS — potwierdzone wprost w `korepetycje-*.html`). Hiszpański (forma grupowa) pozostał niejednoznaczny — zamiast zgadywać, strona pokazuje go tylko jako "indywidualnie online" i pytanie trafiło na listę pytań do właściciela w `docs/STATUS.md`. Szczegóły: `docs/STATUS.md`.
- **2026-07-14 (Etap 3, dopracowanie korepetycji przedmiotowych):** dopracowano 8 istniejących stron `korepetycje-*.html` w 3 partiach (matematyka/angielski/polski; biologia/chemia/hiszpański; geografia/WOS), testując i wdrażając każdą partię osobno. Dodano „Wyszków” do title, krótki proces zapisu (3 kroki) oraz — dla matematyki/angielskiego/polskiego — bezpośrednie linki crosssell do dedykowanych stron kursu maturalnego/E8 z Etapu 2 zamiast do starych stron wyboru egzaminu. Nie utworzono nowych podstron (brak wystarczająco unikalnej oferty dla hiszpańskiego; biologia/chemia/geografia/WOS mają już dwuwariantową ofertę na tej samej stronie). Szczegóły: `docs/STATUS.md`.
- **2026-07-14 (Etap 2, strony egzaminacyjne):** utworzono 8 stron rozdzielających intencję matura/E8 (2 huby + 6 stron przedmiotowych: matematyka, angielski, polski). Adresy płaskie (`/kursy-maturalne`, `/kurs-maturalny-matematyka` itd.), nie zagnieżdżone jak w szkicu „docelowa struktura” powyżej — witryna jest statyczna bez routingu obsługującego podkatalogi. `kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html` pozostają nietknięte jako strony wyboru egzaminu (zgodnie z poleceniem), z dodanym linkiem do stron dedykowanych. Gwarancja 70%+ dodana wyłącznie na stronach matematyki (matura i E8) — potwierdzone w istniejącej treści serwisu, że dotyczy wyłącznie tego przedmiotu. Biologia, chemia, geografia i WOS nie mają jeszcze stron maturalnych — pozostają w `kursy.html`; naturalny zakres kolejnego etapu. Szczegóły i pełna lista testów: `docs/STATUS.md`.
- **2026-07-14 (Etap 1, wspólny system komponentów):** zakres ograniczony do 12 stron "prostych" (bez `index.html`, `korepetycje-online.html`, `zapisz-sie.html`, `privacy-policy.html` — różne systemy designu, patrz `docs/STATUS.md`). Mechanizm: build-time include w czystym Node, zero zależności, zamiast wspólnego pliku CSS/JS bez generatora — właściciel wybrał opcję z automatycznym wstrzykiwaniem HTML nagłówka/stopki z `/partials`, żeby tworzenie nowych stron nie wymagało ręcznego kopiowania nawigacji.
