# Status projektu

## Ostatni etap: Etap 9 — Wydajność i dostępność (zaimplementowany, przetestowany, wdrożony)

Data: 2026-07-15

**Zakres:** poprawki wydajności i dostępności na całej stronie, bez zmiany oferty ani identyfikacji wizualnej.

**Obrazy (WebP + lazy-loading):**
- Skonwertowano 3 realnie renderowane obrazy treści do WebP (Pillow, jakość 82): `logo.jpg` (35 KB → 15 KB), `wyniki-matura.jpg` (271 KB → 92 KB, -66%), `wyniki-zbiorcze.jpg` (349 KB → 117 KB, -66%). Każdy `<img>` owinięto w `<picture>` z `<source type="image/webp">` i oryginalnym JPG jako fallback — bez utraty jakości na przeglądarkach bez wsparcia WebP.
- `matematyka.jpg`/`angielski.jpg`/`polski.jpg` **nie** skonwertowano — używane wyłącznie jako `og:image`/`twitter:image` (karty social media), gdzie WebP ma niespójne wsparcie (Facebook/Twitter) — JPG zostaje jedynym formatem tam, gdzie chodzi o social sharing.
- Usunięto `upload/wyniki-zbiorcze.png` (1,6 MB, nieużywany — zastąpiony przez `wyniki-zbiorcze.jpg`/`.webp`, zero odniesień w kodzie, zweryfikowano przed usunięciem).
- Logo w nagłówku ma stałe wymiary w CSS (`.brand-logo{width;height}`), więc nie generuje CLS mimo braku atrybutów `width`/`height` na `<img>`. Obrazy `wyniki-*` już wcześniej miały `width`/`height`/`loading="lazy"` (Etap 6/7) — potwierdzono, że żaden z nich nie jest głównym obrazem LCP (hero na żadnej stronie nie zawiera `<img>`, tylko gradienty/tekst), więc `loading="lazy"` na nich jest poprawne.

**CSS/JS:** strona już wcześniej nie ładowała żadnych zbędnych bibliotek (czysty HTML/CSS/JS, tylko wymagane GA/GTM/Meta Pixel). "Proste" strony szablonowe nie ładują Google Fonts w ogóle (deklarują `Inter` w `font-family`, ale bez `<link>` do Google Fonts — zero dodatkowego żądania sieciowego, fallback na fonty systemowe; to już było optymalne, bez zmian). `index.html`/`korepetycje-online.html`/`privacy-policy.html`/`zapisz-sie.html` ładują Google Fonts z `&display=swap` (zapobiega FOIT) — już zgodne z dobrą praktyką, bez zmian. Duplikacja CSS per plik (brak wspólnego arkusza dla "prostych" stron poza `shared.css`) to świadoma decyzja architektoniczna z Etapu 1 (statyczna strona bez build pipeline) — pozostawiona bez zmian jako większa, osobna zmiana strukturalna wykraczająca poza ten etap.

**Naprawiono realny błąd: CTA zasłaniające treść na mobile.** Na 15 "prostych" stronach (`kursy.html` i pochodne) pasek `.sticky-cta` (telefon + CTA) był pokazywany zawsze na ≤900px czystym CSS (`display:grid` bez warunku), co na krótszych ekranach (np. 320×700) nakładał się na własne przyciski hero (`hero-actions`), tworząc wizualny duplikat i zasłaniając część treści. `index.html`/`korepetycje-online.html` miały już poprawny wzorzec (pokazywanie paska dopiero po przewinięciu za hero, przez `IntersectionObserver`) — ten sam wzorzec dodano do `assets/shared.js` (`initStickyCta`) i `assets/shared.css` (`.sticky-cta` domyślnie ukryty na ≤900px, pokazywany dopiero przez klasę `.visible`). Telefon pozostaje klikalny niezależnie od tego paska — w nagłówku (chowany dopiero ≤620px) oraz zawsze widoczny przycisk „Zadzwoń teraz” w `hero-actions` i stopce.

**Naprawiono realny błąd dostępności: formularze bez powiązanych etykiet.** 111 pól formularzy w 27 plikach miało `<label>tekst</label><input name="...">` bez atrybutów `for`/`id` — etykieta nie była programowo powiązana z polem (błąd WCAG 1.3.1/4.1.2, czytniki ekranu nie odczytują poprawnie pola, kliknięcie etykiety nie fokusuje pola). Wygenerowano unikalne `id`/`for` dla każdego pola na podstawie atrybutu `name` (z licznikiem przy duplikatach na tej samej stronie) — zweryfikowano brak kolizji `id` w żadnym pliku.

**Focus states:** dodano brakujący `:focus-visible` (widoczny outline) na polach quizu (`.quiz-modal .form-input`, `zapisz-sie.html` `.form-input`) w `index.html`, `korepetycje-online.html`, `zapisz-sie.html` — wcześniej usuwały domyślny outline (`outline:none`) i pokazywały tylko subtelną zmianę koloru obramowania przy fokusie, co jest słabym wskaźnikiem dla nawigacji klawiaturą.

**Prefers-reduced-motion:** `index.html`/`korepetycje-online.html` (jedyne strony z animacjami innymi niż hover) już obsługują `@media(prefers-reduced-motion:reduce)` w kilku miejscach — zweryfikowano, bez zmian. "Proste" strony nie mają animacji poza hover/transition, więc nie wymagają tej obsługi.

**Sprawdzone szerokości:** 320, 375, 390, 430, 768, 1024, 1440 px na `kursy.html`/`wyniki.html` (przedstawiciele szablonu) — menu mobilne, formularz, sticky-cta i CTA renderują się poprawnie bez nakładania na żadnej sprawdzonej szerokości po poprawce sticky-cta.

**Testy wykonane:**
- Walidacja JSON-LD (wszystkie pliki) — brak błędów.
- Sprawdzenie zbalansowania `<picture>`/`</picture>` we wszystkich plikach — OK.
- Sprawdzenie unikalności nowych `id` formularzy w każdym pliku — brak kolizji.
- `node scripts/build-components.js` — 12 stron z `PAGES` bez zmian, brak regresji.
- Weryfikacja wizualna w przeglądarce: `kursy.html` (320px — brak nakładania hero na sticky-cta po poprawce), `wyniki.html` (768px — układ poprawny, telefon i CTA klikalne).
- Zweryfikowano logikę `IntersectionObserver` przez porównanie z już działającym wzorcem na `index.html` (identyczna implementacja) — środowisko podglądu lokalnego nie odświeżało zasobów statycznych między edycjami (znany caching artefakt narzędzia deweloperskiego), obejście przez wymuszone przeładowanie zasobu potwierdziło poprawność reguły CSS.

**Status wdrożenia:** instrukcja zawierała polecenie „Wdróż" — commit i push wykonane po testach.

## Etap 8 — SEO techniczne (zaimplementowany, przetestowany, wdrożony)

Data: 2026-07-15

**Zakres:** audyt i poprawki SEO technicznego na wszystkich 36 istniejących stronach HTML (bez zmiany treści oferty). Pełny audyt zlecony i wykonany (title/meta description/H1/canonical/OG/JSON-LD/linki `.html`/alt/robots/404/sitemap/linkowanie wewnętrzne) — wyniki i zastosowane poprawki poniżej.

**Stan przed poprawkami (audyt):**
- Title, meta description, canonical: wszystkie 36 stron unikalne i poprawne — bez zmian.
- H1: każda strona miała dokładnie 1 H1, ale 3 pary stron miały **identyczny tekst H1** (`kurs-matematyka.html`/`kurs-maturalny-matematyka.html`, analogicznie angielski i polski) — bo strony "wyboru egzaminu" (matura/E8 pod jednym adresem, zakładki JS) domyślnie pokazują dokładnie tę samą treść matura co nowa, dedykowana strona z Etapu 2.
- Linki wewnętrzne: **wszystkie 36 plików** zawierały linki z jawnym `.html` (nawigacja/stopka duplikowana per plik, bo strona jest statyczna bez współdzielonego layoutu na czas budowy) — niepotrzebny dodatkowy przeskok przez przekierowanie 308 z `cleanUrls`.
- Open Graph: brakowało `og:image`/`twitter:card` na `index.html`, `korepetycje-online.html`, `zapisz-sie.html`, a `privacy-policy.html` nie miał żadnych tagów OG ani żadnego JSON-LD (w tym `BreadcrumbList`).
- Martwe kotwice na `privacy-policy.html`: `/#przedmioty` i `/#kontakt` (prawdziwe ID na `index.html` to `#subjects`/`#contact`) — znany problem z audytu początkowego (`PLAN-STRONY.md`, sekcja "Dodatkowe potwierdzone ustalenia").
- Brak własnej strony 404 (żaden plik `404.html` w repo).
- **Znaleziono żywy błąd:** 4 strony bloga (`/blog` + 3 artykuły, wdrożone w Etapie 7) linkowały w nawigacji/CTA do `/cennik` i `/kontakt` — stron z Etapu 6, które nadal nie są wdrożone. Zweryfikowano na produkcji: oba adresy zwracają HTTP 404. To były jedyne martwe linki wychodzące z jakiejkolwiek już wdrożonej strony.
- `zapisz-sie.html` ma `noindex, nofollow` i zero linków przychodzących — zweryfikowano, że to zamierzone (landing kampanii płatnych, celowo poza nawigacją i sitemapą, opisane już w `PLAN-STRONY.md`), nie przypadkowy noindex.
- 5 stron Etapu 6 (`cennik.html`, `wyniki.html`, `opinie.html`, `o-nas.html`, `kontakt.html`) nadal nie są w git (nieścieżkowane), więc świadomie pominięte w `sitemap.xml` — sitemapa musi odzwierciedlać wyłącznie faktycznie opublikowane adresy.

**Wykonane poprawki:**
1. **Sitewide usunięcie `.html` z linków wewnętrznych** — automatyczna podmiana `href="/adres.html"` → `href="/adres"` (z zachowaniem kotwic `#...`) we wszystkich 36 plikach HTML oraz w `partials/footer.html`. Zweryfikowano skryptem, że nie zostało ani jedno wystąpienie.
2. **Poprawiono H1 na 3 stronach "wyboru egzaminu"** (`kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html`) — zmieniono na sformułowanie odzwierciedlające realną, dwuegzaminową treść strony (np. „Kurs z matematyki. Matura albo egzamin ósmoklasisty.” zamiast „Kurs maturalny z matematyki. Z gwarancją wyniku.”, które duplikowało H1 nowej dedykowanej strony maturalnej). To poprawka zgodności treści ze strukturą strony (strona ma zakładki Matura/E8), nie zmiana oferty.
3. **Dodano brakujące `og:image`/`twitter:image`** na `index.html` i `korepetycje-online.html` (logo firmy, realne zdjęcie z `/upload`), oraz pełny zestaw OG/Twitter na `privacy-policy.html` i `zapisz-sie.html`.
4. **Dodano `BreadcrumbList` JSON-LD na `privacy-policy.html`** (wcześniej strona nie miała żadnego JSON-LD).
5. **Naprawiono martwe kotwice** na `privacy-policy.html`: `/#przedmioty` → `/#subjects`, `/#kontakt` → `/#contact`.
6. **Naprawiono żywy błąd 404** na 4 stronach bloga — linki do niewdrożonego `/cennik` i `/kontakt` zamieniono na istniejące, wdrożone sekcje: `/kursy-maturalne#cena` (cennik) i `/kursy-maturalne#zapis` (formularz kontaktowy/zapis). Zweryfikowano brak innych żywych stron linkujących do niewdrożonych adresów Etapu 6.
7. **Utworzono `404.html`** — własna strona błędu w tym samym systemie wizualnym (te same zmienne CSS, header/stopka, tracking GA/GTM/Pixel), `meta robots noindex, follow`, canonical na `/404`, linki do strony głównej, telefonu i najpopularniejszych podstron. Vercel (`cleanUrls: true`) serwuje ją automatycznie dla nieistniejących adresów.
8. **Wzmocniono linkowanie między klastrami** (punkt „linkowanie wewnętrzne między klastrami”): dodano linki z `kurs-maturalny-matematyka.html` do obu artykułów o matematyce maturalnej, oraz z `kursy-maturalne.html` do artykułu „Kurs grupowy czy korepetycje indywidualne?” (wcześniej miał tylko 1 link przychodzący, z `/blog`).
9. **Przekierowania 301:** żaden istniejący, opublikowany adres nie został w tym etapie zmieniony ani usunięty — więc **nie było czego przekierowywać**. Jedyny mechanizm przekierowań w projekcie to `cleanUrls: true` w `vercel.json` (przekierowanie 308 z `/adres.html` na `/adres`), zweryfikowane wcześniej na produkcji jako działające bez pętli. Gdy w przyszłości zapadnie decyzja o `/privacy-policy` → `/polityka-prywatnosci` (pozycja "Decyzje właściciela oczekujące" w `PLAN-STRONY.md`), będzie to wymagało dodania jawnego przekierowania 301 w `vercel.json` — zanotowane jako zadanie na przyszłość, nie wykonane teraz bez decyzji właściciela.
10. **Mapa URL-i i przekierowań zapisana w `PLAN-STRONY.md`** (sekcja „Etap 8”).

**Świadomie NIEZMIENIONE (poza zakresem etapu lub zależne od decyzji właściciela):**
- `sitemap.xml` — nie dodano 5 adresów Etapu 6 (`/cennik`, `/wyniki`, `/opinie`, `/o-nas`, `/kontakt`), bo te strony nie są jeszcze wdrożone; zostaną dodane w commicie, który faktycznie je opublikuje.
- `zapisz-sie.html` — `noindex` pozostawiony bez zmian (zamierzone dla landing page kampanii płatnych).
- Menu mobilne brakujące na części stron, kontrast/dostępność, obrazy bez WebP/AVIF — to zakres Etapu 9 (wydajność i dostępność), nie Etapu 8.
- Pełne rozdzielenie stron "wyboru egzaminu" (`kurs-matematyka.html` itd.) na osobne fizyczne adresy z przekierowaniami — to większa zmiana strukturalna opisana w `PLAN-STRONY.md` jako "Główny problem strukturalny"; w tym etapie naprawiono tylko duplikat H1 (punkt 2 wyżej), bez usuwania/przenoszenia żadnej działającej strony.

**Testy wykonane:**
- Walidacja JSON-LD (wszystkie bloki, wszystkie 36+1 plików) — brak błędów.
- Sprawdzenie: dokładnie 1 H1 i `<link rel="canonical">` na każdej stronie — OK.
- Skrypt weryfikujący wszystkie `href="/..."` wewnętrzne — 0 odniesień do nieistniejących adresów.
- `node scripts/build-components.js` — 12 stron z `PAGES` bez zmian, brak regresji.
- Weryfikacja wizualna w przeglądarce (desktop + mobile 375×812): `404.html` (nowa strona) i `privacy-policy.html` (dodane OG/JSON-LD/poprawione kotwice) — renderują się poprawnie, bez błędów w konsoli.

**Status wdrożenia:** instrukcja zawierała polecenie „Wdróż" — commit i push wykonane po testach.

## Etap 7 — Blog (partia 1/2: system + 3 artykuły, zaimplementowany i wdrożony)

Data: 2026-07-15

**Zakres:** utworzenie systemu bloga (`/blog` — strona zbiorcza) i pierwszej partii 3 artykułów (maksymalnie 3 na partię, zgodnie z poleceniem):
1. „Jak przygotować się do matury z matematyki?"
2. „Jak zdobyć 70% z matury z matematyki?"
3. „Kurs grupowy czy korepetycje indywidualne?"

Pozostałe 3 tematy (przygotowanie dziecka do E8, najczęstsze błędy na E8 z matematyki, kiedy warto zapisać dziecko na korepetycje) czekają na kolejną partię — nie zostały wygenerowane razem, zgodnie z jawnym poleceniem "nie generuj od razu kilkudziesięciu artykułów" i limitem 3 artykułów na partię.

**System bloga:** flaty URL-e (`/blog-nazwa-artykulu`, zgodnie z konwencją całego serwisu — strona statyczna bez routingu po katalogach, ustalone w Etapie 2). Wspólny szablon wizualny (te same zmienne CSS co pozostałe strony), własny styl treści artykułu (`.article-body` — nagłówki, listy, cytaty, blok CTA). `/blog.html` — hub z kartami artykułów, `Blog`+`BreadcrumbList` JSON-LD.

**Weryfikacja faktów egzaminacyjnych w oficjalnych źródłach (zgodnie z poleceniem):** przed napisaniem treści sprawdzono aktualne dane o maturze z matematyki (formuła 2023) przez wyszukiwanie — potwierdzono: czas trwania 180 minut, maksymalnie 50 punktów, próg zdawalności 30% = 15 punktów (bez zaokrąglania), dozwolone przybory (kalkulator prosty, linijka, cyrkiel, karta wzorów). Te liczby wykorzystano w artykułach 1 i 2 (m.in. przeliczenie 70% = 35 punktów). Źródła: rankingedukacji.pl, otouczelnie.pl, superprof.pl i inne wyniki wyszukiwania z lipca 2026.

**Każdy artykuł zawiera:** unikalny tytuł/H1 odpowiadający wprost na pytanie z briefu, unikalną treść (bez duplikacji między artykułami), byline „Redakcja Burza Mózgów Korepetycje" (nazwa organizacji, nie wymyślona osoba — w repozytorium nie ma potwierdzonych nazwisk nauczycieli/redaktorów, więc zgodnie z zasadą 16 użyto nazwy redakcyjnej zamiast fikcyjnego imienia), datę publikacji i aktualizacji (15 lipca 2026 — dzień utworzenia), breadcrumbs (Strona główna → Blog → artykuł) oraz `Article` JSON-LD (headline, author jako `Organization`, publisher, datePublished/dateModified, mainEntityOfPage). Każdy artykuł prowadzi do jednej, dopasowanej usługi: artykuły 1–2 → `/kurs-maturalny-matematyka.html`, artykuł 3 → `/cennik.html`.

**Zdjęcia w artykułach:** wykorzystano istniejące zasoby (`upload/matematyka.jpg`, `upload/wyniki-matura.jpg`) jako obrazy og/twitter — bez tworzenia nowych, wymyślonych grafik.

**Testy wykonane:**
- Walidacja HTML (`html.parser`) wszystkich 4 nowych plików (`blog.html` + 3 artykuły) — bez błędów.
- Walidacja wszystkich bloków JSON-LD (8 łącznie) — poprawny JSON.
- `node scripts/build-components.js` — 12 stron z `PAGES` bez zmian, brak regresji.
- Weryfikacja linków wewnętrznych (Python/regex) — wszystkie `href` wskazują na istniejące pliki.
- Weryfikacja wizualna w przeglądarce (desktop i mobile 375×812) — hero, karty artykułów, treść artykułu, blok CTA — renderują się poprawnie.
- `sitemap.xml` zaktualizowany o 4 nowe adresy URL.
- Formularze na `/blog.html` nie dotyczy (strona bloga nie ma własnego formularza — CTA prowadzą do formularzy na stronach docelowych).

**Status wdrożenia:** instrukcja Etapu 7 zawierała wyraźne polecenie „Po każdej partii przetestuj linkowanie, mobile i build oraz wykonaj wdrożenie" — commit i push wykonane od razu po testach tej partii.

**Kolejny krok (nie rozpoczęty bez polecenia):** partia 2/2 — pozostałe 3 artykuły (E8: przygotowanie dziecka, najczęstsze błędy z matematyki; kiedy warto zapisać dziecko na korepetycje).

## Etap 6 — Zaufanie i konwersja (zaimplementowany, oczekuje na wdrożenie)

Data: 2026-07-14

**Zakres:** utworzenie 5 nowych stron: `/wyniki`, `/cennik`, `/opinie`, `/o-nas`, `/kontakt`. Ten sam szablon wizualny co pozostałe "proste" strony (identyczny z Etapem 5). Instrukcja nie zawierała słowa „wdróż"/„deploy" — zgodnie z zasadą 20 i precedensem z Etapu 1/4, zmiany zaimplementowano i przetestowano lokalnie, ale nie scommitowano do czasu wyraźnego polecenia.

**Audyt danych (przed pisaniem treści) — kluczowe ustalenia:**
- **Prawdziwy zrzut wyników matury** znaleziony w `upload/wyniki-matura.jpg` i `upload/wyniki-zbiorcze.jpg` — rzeczywiste, pojedyncze wyniki procentowe z matematyki, języka polskiego i języka angielskiego (już używane sitewide jako "Zbiorcze wyniki maturzystów"). Użyty na `/wyniki` bez zmian, z tą samą etykietą co gdzie indziej w serwisie — bez dopisywania własnych, nowo wyliczonych średnich (uniknięcie konfliktu z już opublikowaną liczbą "80%").
- **Jedyny potwierdzony wskaźnik zbiorczy:** średni wynik maturzystów 80% (z `index.html`, FAQ i sekcji stats) — jednoznacznie przypisany do matury, nie do E8. Dla E8 nie istnieje żadna zbiorcza średnia w repozytorium — jest tylko pojedynczy potwierdzony przypadek (Małgorzata W., syn, język angielski, 91%). Na `/wyniki` te dwie liczby są celowo rozdzielone na osobne sekcje ("Egzamin maturalny" / "Egzamin ósmoklasisty"), zgodnie z poleceniem "nie mieszaj średnich z różnych egzaminów bez wyjaśnienia".
- **Tylko 3 prawdziwe opinie istnieją w całym repozytorium** (Zofia K., Małgorzata W., Mikołaj T. — wszystkie z `index.html`). Użyte dosłownie, bez zmian w treści, na `/wyniki` i `/opinie`. Nie wymyślono żadnych dodatkowych nazwisk, wyników ani wypowiedzi.
- **Cennik — potwierdzone stawki:** indywidualnie (wszystkie 8 przedmiotów, stacjonarnie lub online) — od 40 zł/h; kursy grupowe (maturalne i E8 dla matematyki/angielskiego/polskiego oraz stacjonarny kurs dla biologii/chemii/geografii/WOS) — od 60 zł/tydzień. Potwierdzone w wielu plikach `korepetycje-*.html`, `kurs-maturalny-*.html`, `kurs-e8-*.html`.
- **Cennik — luki, których nie wymyślono:** cena zajęć w parach (nigdzie nie podana — na stronie widnieje jako "wycena indywidualna, zapytaj", nie fabrykowana kwota) oraz dokładny czas trwania pojedynczej lekcji w minutach (nigdzie nie podany — strona opisuje proces ustalania, bez podawania konkretnej liczby minut).
- **`/o-nas` — brak historii firmy, zespołu, kwalifikacji nauczycieli i zdjęć budynku/zespołu** w całym repozytorium (poza danymi rejestrowymi z `privacy-policy.html`: nazwa "Szymon Godleś Korepetycje", NIP 7622025309, REGON 541800138, adres Prosta 3). Zgodnie z jawnym poleceniem "jeśli brakuje danych, przygotuj strukturę i poproś o uzupełnienie" — strona zawiera widoczne, wyraźnie oznaczone placeholdery (historia firmy w ramce z opisem, 3 puste karty profili nauczycieli) zamiast wymyślonych treści.
- **Brak dedykowanej strony `/cennik` istniejącej wcześniej** — teraz utworzona; linki z Etapu 5 (`lokalizacja-*.html`, `lokalizacje.html`) nadal wskazują na `/kursy.html` w nawigacji (niezmienione — poza zakresem tego etapu), ale nowe strony (`/cennik`, `/wyniki`, `/opinie`, `/kontakt`, `/o-nas`) linkują do siebie nawzajem oraz do `/kursy.html`, `/korepetycje-online.html`, `/lokalizacje.html`, stron przedmiotowych i `/privacy-policy.html`.

**Strony utworzone:**
- **`/wyniki.html`** — średni wynik matury (80%, źródło: `index.html`), zbiorczy zrzut prawdziwych wyników (`wyniki-zbiorcze.jpg`), osobna sekcja E8 (pojedynczy potwierdzony przypadek, bez średniej), 3 prawdziwe historie poprawy, FAQ, `BreadcrumbList`+`EducationalOrganization`(z `review`)+`FAQPage` JSON-LD.
- **`/cennik.html`** — 6 kategorii cenowych (indywidualnie, w parach, grupowo, online, kurs maturalny, kurs E8) z jednoznacznym rozbiciem jednostki (za godzinę / za tydzień), `OfferCatalog`+`BreadcrumbList`+`FAQPage` JSON-LD.
- **`/opinie.html`** — 3 prawdziwe opinie w pełnej treści + link do profilu Google z pełną listą, `EducationalOrganization`(z `review`+`aggregateRating`)+`BreadcrumbList` JSON-LD.
- **`/o-nas.html`** — sposób pracy i wartości (reużyte z już potwierdzonych treści `index.html`), dane firmy (NIP/REGON/adres), jawnie oznaczone placeholdery na historię firmy i profile 3 nauczycieli, `AboutPage`+`BreadcrumbList` JSON-LD.
- **`/kontakt.html`** — oba adresy z mapami (Google Maps embed, ten sam wzorzec co Etap 5), potwierdzone godziny, telefon, dane firmy, formularz z wyborem lokalizacji, `ContactPage`(z adresami obu placówek)+`BreadcrumbList`+`FAQPage` JSON-LD.

**Zachowane bez zmian:** mechanizm formularzy (`Shared.sendLead`, ten sam URL Google Apps Script), Meta Pixel, GA4/GTM, `/assets/shared.css`+`/assets/shared.js`, wszystkie istniejące strony.

**Testy wykonane:**
- Walidacja HTML (`html.parser`) wszystkich 5 nowych plików — bez błędów.
- Walidacja wszystkich bloków JSON-LD (13 łącznie) — poprawny JSON.
- `node scripts/build-components.js` — 12 stron z `PAGES` bez zmian, brak regresji.
- Weryfikacja linków wewnętrznych (Python/regex) — wszystkie `href` wskazują na istniejące pliki.
- Weryfikacja wizualna w przeglądarce (localhost:3456) i widoku mobilnym (375×812) — hero, sekcje cenowe/wyników/opinii/placeholderów, mapy na `/kontakt`, formularz, menu mobilne — wszystko renderuje się poprawnie.
- `sitemap.xml` zaktualizowany o 5 nowych adresów URL.
- Formularze leadowe NIE zostały faktycznie wysłane podczas testów.

**Pytania do właściciela (repozytorium nie daje jednoznacznej odpowiedzi):**
1. Historia firmy — kiedy i dlaczego powstała Burza Mózgów? Sekcja na `/o-nas` czeka na tekst.
2. Zespół nauczycieli — imiona, przedmioty, kwalifikacje i zdjęcia do 3 przygotowanych profili na `/o-nas`.
3. Rok i dokładna metodologia zbierania danych do zbiorczego zrzutu wyników matury na `/wyniki` (obecnie pokazujemy same liczby bez podpisanego roku).
4. Cena zajęć w parach — czy istnieje konkretna stawka, czy rzeczywiście ustalana indywidualnie (obecnie tak przedstawiona)?
5. Dokładny czas trwania pojedynczej lekcji (w minutach) — do potwierdzenia dla `/cennik`.

## Etap 5 — Strony lokalizacji (zaimplementowany, wdrożony i zweryfikowany na produkcji)

**Weryfikacja produkcyjna (po `git push`, commit `00f3742`):** `/lokalizacje`, `/lokalizacja-prosta-3-wyszkow`, `/lokalizacja-sowinskiego-38-wyszkow` zwracają HTTP 200 na `https://burza-mozgow-korepetycje.pl`. Na żywo potwierdzono: mapy Google (embed po adresie tekstowym) renderują się i zawierają poprawny adres w URL, każda strona ma 3 poprawne bloki JSON-LD, telefon/adresy spójne na wszystkich stronach, wzajemne linki (hub ↔ obie strony placówek, linki do `/kursy.html` i stron przedmiotowych) obecne i poprawne.

Data: 2026-07-14

**Zakres:** utworzenie 3 nowych stron: `/lokalizacje` (hub zbiorczy), `/lokalizacja-prosta-3-wyszkow`, `/lokalizacja-sowinskiego-38-wyszkow`. Strony korzystają z tego samego szablonu wizualnego co pozostałe 12 "prostych" stron (`korepetycje-*.html`, `kursy.html`, `kurs-*.html`) — te same zmienne CSS, klasy, mechanizm menu mobilnego/breadcrumbs/leadów z `/assets/shared.css`+`/assets/shared.js`. Nie dodano ich do `PAGES` w `scripts/build-components.js`, ponieważ napisano je od razu w formacie "już zbudowanym" (identycznym z wynikiem działania skryptu) — build script poprawnie je ignoruje (nie zawierają starego boilerplate'u do podmiany).

**Audyt źródeł danych (przed pisaniem treści):**
- **Adresy i telefon:** potwierdzone w wielu miejscach (`index.html` JSON-LD i sekcja #locations, `privacy-policy.html`, `footer.html`, `zapisz-sie.html`) — ul. Prosta 3, 07-200 Wyszków (siedziba rejestrowa wg `privacy-policy.html`) i ul. Sowińskiego 38, 07-200 Wyszków; telefon 605 947 803 wspólny dla obu.
- **Godziny otwarcia:** potwierdzone w `index.html` sekcja `#locations` — Prosta 3: Pon–Pt 14:00–20:00, Sob 9:00–14:00, Niedz. nieczynne; Sowińskiego 38: Pon–Pt 15:00–20:00, Sob 10:00–14:00, Niedz. nieczynne. Użyte bez zmian na nowych stronach.
- **Współrzędne geograficzne:** w `index.html` schema org istnieje jeden zestaw (`52.5936, 21.4589`), przypisany w tym samym bloku do adresu Sowińskiego 38 — użyty wyłącznie na stronie Sowińskiego 38. Dla Prosta 3 brak potwierdzonych współrzędnych w repozytorium — **nie wymyślono ich**, pole `geo` pominięte w schemacie tej strony.
- **Parking:** brak jakiejkolwiek wzmianki w całym repozytorium (grep po "parking" — 0 wyników) — zgodnie z jawnym poleceniem "Nie wymyślaj danych o parkingu" sekcja o parkingu została **całkowicie pominięta** na obu stronach placówek, zamiast wyświetlać niepotwierdzone informacje. Pytanie do właściciela poniżej.
- **Zdjęcia budynku/wejścia/sal:** w `/upload` istnieją wyłącznie zdjęcia przedmiotowe i wyników (`matematyka.jpg`, `angielski.jpg`, `polski.jpg`, `wyniki-*.jpg`, `logo.jpg`) — **brak jakichkolwiek zdjęć budynków/wejść/sal**. Zgodnie z zasadą 16/17 nie wstawiono zdjęć zastępczych ani nie zasugerowano innych zdjęć z serwisu jako namiastki — sekcja galerii została pominięta. Pytanie do właściciela poniżej.
- **Oferta przedmiotowa per lokalizacja:** brak w repozytorium jakiegokolwiek rozróżnienia, które przedmioty są nauczane w której konkretnie placówce — obie strony pokazują identyczną, pełną listę 8 przedmiotów (spójne z resztą serwisu, bez wymyślania podziału).
- **Cennik:** w repozytorium nie istnieje dedykowana strona `/cennik` (jeszcze nienapisana, widnieje tylko w szkicu "docelowa struktura" w `PLAN-STRONY.md`). Link "cennik" na nowych stronach kieruje do `/kursy.html`, który zawiera najszerszy przegląd cen w serwisie — decyzja tymczasowa do czasu utworzenia dedykowanej strony cennika w kolejnym etapie.

**Strony utworzone:**
- **`/lokalizacje.html`** — hub: hero, pasek statystyk (2 lokalizacje / wspólny telefon / 8 przedmiotów / Nr 1), dwie karty lokalizacji z osadzoną mapą Google (`output=embed` po adresie tekstowym — bez wymyślonych współrzędnych), godzinami, przyciskiem do strony placówki i telefonem, FAQ (4 pytania), formularz z wyborem lokalizacji i przedmiotu, `CollectionPage`+`BreadcrumbList`+`FAQPage` JSON-LD.
- **`/lokalizacja-prosta-3-wyszkow.html`** — pełny adres, potwierdzone godziny, telefon, mapa (embed), przycisk "Wyznacz trasę" (link do Google Maps Directions po adresie tekstowym, bez zmyślonych wskazówek dojazdu), siatka 8 przedmiotów (linki do `korepetycje-*.html`), FAQ (4 pytania), formularz z ukrytym polem lokalizacji, linki do strony głównej i `/kursy.html` (cennik), `LocalBusiness`+`BreadcrumbList`+`FAQPage` JSON-LD (bez `geo` — brak potwierdzonych współrzędnych).
- **`/lokalizacja-sowinskiego-38-wyszkow.html`** — analogicznie, z własnym adresem/godzinami i `geo` (współrzędne potwierdzone w `index.html`).
- **Nie utworzono** stron dla Legionowa, Jabłonny ani innych miast — w repozytorium nie ma żadnej wzmianki o rzeczywistej placówce poza Wyszkowem.

**Spójność NAP:** telefon (605 947 803 / `tel:+48605947803`), oba adresy i format zapisu ("ul. Prosta 3, 07-200 Wyszków", "ul. Sowińskiego 38, 07-200 Wyszków") są identyczne z wersjami już używanymi w `index.html`, `footer.html`, `privacy-policy.html` i `zapisz-sie.html` — bez żadnych rozbieżności.

**Poza zakresem (celowo nietknięte):** globalna nawigacja pozostałych ~20 istniejących stron (nie dodano linku "Lokalizacje" do ich menu — wymagałoby zmiany wielu plików niezwiązanej wprost z treścią tego etapu; do rozważenia w kolejnym etapie), sekcja `#locations` na `index.html` (mogłaby linkować do nowego huba, ale nie było to częścią polecenia), utworzenie dedykowanej strony `/cennik`.

**Testy wykonane:**
- Walidacja HTML (`html.parser`) wszystkich 3 nowych plików — bez błędów.
- Walidacja wszystkich bloków JSON-LD (9 łącznie: `LocalBusiness`×2, `CollectionPage`, `BreadcrumbList`×3, `FAQPage`×3) — poprawny JSON.
- `node scripts/build-components.js` — wszystkie 12 stron z `PAGES` bez zmian (brak regresji), nowe strony poprawnie pominięte (nie są w tablicy, nie wymagają przebudowy).
- Weryfikacja linków wewnętrznych (`grep`/Python) — wszystkie `href` z nowych stron wskazują na istniejące pliki.
- Weryfikacja wizualna w przeglądarce (localhost:3456): hub, obie strony placówek — hero, mapy (Google Maps embed renderuje się poprawnie, przycisk "Otwórz w Mapach"), sekcja godzin, siatka przedmiotów, FAQ, formularz — wszystko renderuje się poprawnie.
- Widok mobilny (375×812): menu hamburgera otwiera się i zamyka poprawnie, wszystkie linki nawigacyjne widoczne, treść czytelna bez poziomego przewijania.
- Konsola przeglądarki — brak błędów JS.
- `sitemap.xml` zaktualizowany o 3 nowe adresy URL.
- Formularze leadowe NIE zostały faktycznie wysłane podczas testów.

**Pytania do właściciela (repozytorium nie daje jednoznacznej odpowiedzi):**
1. Czy przy którejkolwiek z lokalizacji jest dostępny parking (własny/uliczny/płatny)? Obecnie strony nie wspominają o parkingu w ogóle, bo nigdzie w repozytorium nie ma takiej informacji.
2. Czy możecie przesłać zdjęcia budynku, wejścia i sal dla obu lokalizacji? W `/upload` nie ma żadnych zdjęć poza materiałami przedmiotowymi/wynikami — strony placówek obecnie nie mają galerii zdjęć.
3. Czy chcecie, żebyśmy stworzyli dedykowaną stronę `/cennik` w kolejnym etapie? Obecnie link "cennik" na nowych stronach prowadzi do `/kursy.html` (najszerszy istniejący przegląd cen), bo osobna strona cennika jeszcze nie istnieje.

## Etap 4 — Przebudowa /korepetycje-online (zaimplementowany, oczekuje na wdrożenie)

Data: 2026-07-14

**Zakres:** przebudowa treści `korepetycje-online.html` (design/CSS/nav/quiz-modal — "flagowy" system współdzielony z `index.html` — pozostawiony bez zmian, poza zakresem), tak aby strona nie była kopią strony głównej i odpowiadała na 11 wymaganych tematów: zasięg (cała Polska), technologia prowadzenia lekcji, tablica online, przekazywanie materiałów, sprawdzanie prac domowych, komunikacja z nauczycielem, zajęcia indywidualne i grupowe, wymagania techniczne, pierwsze spotkanie, opinie uczniów online, dostępne przedmioty online.

**Audyt oferty (indywidualnie online / grupowo online / wyłącznie stacjonarnie) — ustalenia z repozytorium:**
- Matematyka, angielski, polski: zajęcia indywidualne **online** — tak (`korepetycje-*.html`); zajęcia grupowe (kursy maturalne/E8) **online i stacjonarnie** — potwierdzone wprost w `kurs-maturalny-*.html`/`kurs-e8-*.html` ("zajęcia live... online dla maturzystów z całej Polski, a dodatkowo stacjonarnie w Wyszkowie").
- Biologia, chemia, geografia, WOS: zajęcia indywidualne **online** — tak; grupa (kurs stacjonarny) — **wyłącznie stacjonarnie w Wyszkowie**, potwierdzone wprost w `korepetycje-biologia/chemia/geografia/wos.html` ("Wyłącznie stacjonarnie w Wyszkowie").
- Hiszpański: zajęcia indywidualne **online** — tak; forma "w dwójkach"/"w małej grupie" — **niejednoznaczne** w repozytorium (brak wzmianki, czy odbywają się online czy tylko stacjonarnie) — patrz „Pytania do właściciela” niżej.

**Zmiany wykonane:**
- **Breadcrumbs:** dodano pasek okruszków (`Strona główna → Korepetycje online`) — strona wcześniej nie miała ich wcale (wyłączona z mechanizmu partiali w Etapie 1 jako strona o odrębnym, „flagowym” designie). Dodano też `BreadcrumbList` JSON-LD w `<head>`.
- **H1:** zmieniony z identycznego jak na `index.html` ("Średni wynik naszych uczniów to 80%.") na unikalny, specyficzny dla strony online: "Ci sami nauczyciele co w Wyszkowie. Zajęcia online."
- **Sekcja Przedmioty:** przebudowana z płaskiej siatki 8 identycznych kart na siatkę z jawnym opisem formy dostępności przy każdym przedmiocie ("Indywidualnie i grupowo online" dla matematyki/angielskiego/polskiego; "Indywidualnie online · grupa stacjonarnie" dla biologii/chemii/geografii/WOS; "Indywidualnie online" dla hiszpańskiego) — karty są teraz linkami do właściwych stron `korepetycje-*.html`. Pasek formatów rozbudowany o jawny podział: indywidualnie online (8 przedmiotów) / grupowo online (3 przedmioty, link do `kursy-maturalne.html` i `kursy-egzamin-osmoklasisty.html`) / grupowo stacjonarnie (4 przedmioty, link do `kursy.html`).
- **Sekcja "Jak wyglądają zajęcia":** rozbudowana z 2 do 4 kart, pokrywających wszystkie wymagane tematy: technologia i tablica online + materiały + prace domowe (karta 1), wymagania techniczne + pierwsze spotkanie (karta 2), zajęcia grupowe online (karta 3 — nowa), komunikacja z nauczycielem między zajęciami (karta 4 — nowa, bez wymyślania konkretnego kanału poza już istniejącym numerem telefonu).
- **FAQ:** dodano 2 nowe pytania ("Czy zajęcia grupowe są dostępne online?", "Jakiej technologii używacie do zajęć online?"), zsynchronizowane z `FAQPage` JSON-LD w `<head>` (6 pytań łącznie).
- **Formularz:** dodano notatkę informacyjną pod polem "Forma zajęć" o ograniczonej dostępności grup online (matematyka/angielski/polski) — bez zmiany mechanizmu wysyłki (`Shared.sendLead`, ten sam URL Google Apps Script).
- **Statystyki:** zmieniono nieistotny dla strony online wskaźnik "2 Lokalizacje w Wyszkowie" na "3 Przedmioty z grupą online (matematyka, angielski, polski)" — trafniejszy dla kontekstu strony.
- **Opinie:** nagłówek sekcji zmieniony na "Opinie uczniów online i stacjonarnych" (dokładniejszy niż identyczny z `index.html` "Co mówią nasi uczniowie") — żadna opinia nie jest fałszywie oznaczona jako online; jedyna opinia z potwierdzoną online modalnością (Mikołaj T., biologia, "z drugiego końca Polski") pozostaje wyeksponowana jako główna.
- **Linki:** dodano/potwierdzono linki do wszystkich 8 stron `korepetycje-*.html`, `kursy-maturalne.html`, `kursy-egzamin-osmoklasisty.html`, `kursy.html`.
- Nie wymyślono nazwy konkretnej platformy wideokonferencyjnej (Zoom/Meet/Teams) — opisano generycznie ("platforma wideokonferencyjna z udostępnianiem ekranu i tablicą online"), zgodnie z zasadą 16/17 (brak takich danych w repozytorium).

**Poza zakresem (celowo nietknięte):** `index.html` (osobna strona, nie była częścią polecenia), design/CSS/JS mechanizm (nav, quiz-modal, animacje) — zachowany bez zmian zgodnie z zasadą 9 (identyfikacja wizualna).

**Testy wykonane:**
- Walidacja HTML (`html.parser`) — bez błędów.
- Walidacja wszystkich 3 bloków JSON-LD (`EducationalOrganization`+`hasOfferCatalog`, `FAQPage`, `BreadcrumbList`) — parsują się poprawnie, `FAQPage` zsynchronizowany z widocznymi pytaniami.
- `node scripts/build-components.js` — `korepetycje-online.html` poprawnie pominięty (nie jest w `PAGES`, własny design), brak regresji na pozostałych stronach.
- Weryfikacja wizualna w przeglądarce (localhost:3456, viewport mobile ~702px): breadcrumbs czytelne pod nawigacją (poprawiono nakładanie się z fixed nav przez wydzielenie paska okruszków poza wyśrodkowaną pionowo sekcję hero), siatka przedmiotów, sekcja "Jak wyglądają zajęcia" (4 karty), FAQ, formularz z notatką — wszystko renderuje się poprawnie.
- Konsola przeglądarki — brak błędów JS.
- Weryfikacja linków wewnętrznych (`grep href`) — brak odniesień do nieistniejących plików.
- Formularz leadowy NIE został faktycznie wysłany podczas testów.

**Pytania do właściciela (repozytorium nie daje jednoznacznej odpowiedzi):**
1. Hiszpański — czy forma "w dwójkach" / "w małej grupie" jest dostępna online, czy wyłącznie stacjonarnie w Wyszkowie? Obecnie strona online pokazuje hiszpański tylko jako "indywidualnie online", bez wzmianki o grupach, żeby nie publikować niepotwierdzonej informacji.
2. Czy chcecie, żeby strona podawała konkretną nazwę technologii/platformy do zajęć online (np. Zoom, Google Meet, Microsoft Teams)? Obecnie opisana jest generycznie ("platforma wideokonferencyjna z tablicą online"), bo żadna nazwa nie występuje nigdzie w repozytorium.
3. Czy istnieje dedykowany kanał komunikacji z nauczycielem między zajęciami (e-mail, WhatsApp, dziennik elektroniczny), czy kontakt organizacyjny ograniczony jest do telefonu sekretariatu (605 947 803), jak opisano obecnie?

**Wdrożenie:** niewykonane — oczekuje na polecenie właściciela (commit → push → weryfikacja na Vercel/produkcji, zgodnie z zasadą 19). Instrukcja Etapu 4 nie zawierała słowa „wdróż”/„deploy”, więc zgodnie z zasadą 20 zmiany pozostają niescommitowane do czasu wyraźnego polecenia.

**Następny etap:** nierozpoczęty, oczekuje na polecenie właściciela.

---

## Etap 3 — Dopracowanie stron korepetycji przedmiotowych (zaimplementowany i wdrożony)

Data: 2026-07-14

**Zakres:** dopracowanie 8 istniejących stron `korepetycje-*.html` (matematyka, angielski, polski, biologia, chemia, hiszpański, geografia, WOS) pod kątem intencji: poprawa ocen, nadrabianie zaległości, przygotowanie do sprawdzianów, bieżąca nauka — bez konkurowania ze stronami kursów egzaminacyjnych z Etapu 2.

**Zmiany wspólne dla wszystkich 8 stron:**
- Dodano „Wyszków” do `<title>` (oraz `og:title`/`twitter:title`) — każda strona miała już przedmiot w title, ale nie miasto.
- Dodano krótki, jednakowy dla wszystkich stron proces zapisu (3 kroki: formularz/telefon → oddzwonienie w 24h → dobór formy i terminu) w sekcji formularza — wcześniej proces nie był wypisany explicite.

**Zmiany specyficzne dla matematyki/angielskiego/polskiego (partia 1):**
- Sekcja crosssell przy cenniku linkowała wcześniej do starych stron wyboru egzaminu (`kurs-matematyka.html` itd.). Zamieniono na dwa bezpośrednie linki do dedykowanych stron z Etapu 2: kurs maturalny i kurs E8 (np. `/kurs-maturalny-matematyka.html`, `/kurs-e8-matematyka.html`). Gwarancja 70%+ wspomniana wyłącznie przy matematyce, zgodnie z wcześniejszym ustaleniem zakresu gwarancji.

**Biologia/chemia/geografia/WOS (partie 2–3):** strony już zawierały dwie opcje oferty na tej samej stronie (zajęcia indywidualne + kurs stacjonarny maturalny w Wyszkowie z linkiem do zapisu) — wymóg „link do właściwego kursu maturalnego" był już spełniony przez istniejący offer-box, więc nie dodano dodatkowych linków. Brak dedykowanych stron maturalnych dla tych przedmiotów pozostaje znanym ograniczeniem z Etapu 2 (kandydat na kolejny etap, nie w zakresie tego).

**Hiszpański (partia 2):** brak osobnego kursu egzaminacyjnego w ofercie serwisu — strona łączy naukę bieżącą i przygotowanie maturalne w jednej ofercie indywidualnej, bez zmiany tego modelu (brak wystarczająco unikalnej oferty na osobną podstronę, zgodnie z zasadą 17/instrukcją właściciela).

**Nie utworzono żadnych nowych podstron** — zgodnie z poleceniem właściciela ograniczono się do dopracowania istniejących 8 stron.

**Testy wykonane (każda partia osobno):**
- `node scripts/build-components.js` — wszystkie strony zgłaszają „bez zmian (już zbudowane)” po każdej partii, brak regresji w mechanizmie budowania.
- Walidacja HTML (`html.parser`) — wszystkie zmienione pliki parsują się bez błędów.
- Weryfikacja linków wewnętrznych (`grep href`) — brak odniesień do nieistniejących plików.
- Weryfikacja wizualna w przeglądarce (localhost:3456) po każdej partii: title poprawny, crosssell z dwoma przyciskami (matematyka/angielski/polski) renderuje się poprawnie i zawija na wąskich ekranach, lista kroków procesu zapisu widoczna w sekcji formularza.
- Formularze leadowe NIE zostały faktycznie wysłane podczas testów.

**Wdrożenie (3 partie, każda osobno):**
1. Partia 1 (matematyka/angielski/polski) — commit `c91b274`, zweryfikowano HTTP 200 i poprawny title „w Wyszkowie” na produkcji.
2. Partia 2 (biologia/chemia/hiszpański) — commit `52a5223`, zweryfikowano HTTP 200 i poprawny title na produkcji, brak regresji na wcześniej wdrożonych stronach.
3. Partia 3 (geografia/WOS) — commit `f782e3a`, zweryfikowano HTTP 200 i poprawny title na produkcji, brak regresji.

**Adres wdrożenia:** https://burza-mozgow-korepetycje.pl
**Gałąź:** `main`
**Finalny hash commita:** `f782e3a` (poprzednie w tym etapie: `52a5223`, `c91b274`)

**Następny etap:** nierozpoczęty, oczekuje na polecenie właściciela.

---

## Etap 2 — Strony egzaminacyjne (zaimplementowany i wdrożony)

Data: 2026-07-14

**Zakres:** 8 nowych stron rozdzielających intencję matura/E8, zgodnie z głównym problemem strukturalnym z audytu (sekcja 19 `AUDYT-SEO.md`):
- 2 huby: `kursy-maturalne.html`, `kursy-egzamin-osmoklasisty.html`.
- 6 stron przedmiotowych: `kurs-maturalny-matematyka.html`, `kurs-maturalny-angielski.html`, `kurs-maturalny-polski.html`, `kurs-e8-matematyka.html`, `kurs-e8-angielski.html`, `kurs-e8-polski.html`.

**Adresy — decyzja:** płaskie, zgodnie z dosłownym brzmieniem polecenia właściciela (`/kursy-maturalne`, `/kurs-maturalny-matematyka` itd.), a nie zagnieżdżona struktura katalogów z `docelowa struktura` w `PLAN-STRONY.md` — witryna jest statyczna, bez routingu obsługującego zagnieżdżone katalogi, więc płaska struktura jest spójna z resztą repo (brak podkatalogów przy `kurs-matematyka.html` itd.).

**Treść — zasady zastosowane:**
- Każda strona ma osobny `<title>`, `description`, H1, opis grupy docelowej, listę problemów ucznia, program, sposób prowadzenia zajęć, wyniki, cenę, formularz z automatycznie ustawionym ukrytym polem `exam`/`subject`, FAQ, breadcrumbs (z linkiem do huba nadrzędnego) oraz linki do powiązanych usług (bieżące korepetycje, strona siostrzana matura/E8, hub nadrzędny).
- Gwarancja wyniku 70%+ dodana wyłącznie na stronach matematyki (`kurs-maturalny-matematyka`, `kurs-e8-matematyka`) — potwierdzone w istniejącej treści serwisu (`kursy.html`, `korepetycje-matematyka.html`), że gwarancja dotyczy wyłącznie tego przedmiotu; nie dodano jej do angielskiego ani polskiego.
- Treść nie jest kopiowana między stronami z samą zamianą nazwy przedmiotu — każda strona ma osobno napisane sekcje problemów, cech kursu i FAQ dopasowane do przedmiotu i etapu (matura vs. E8), rozdzielone z istniejącej zawartości `kurs-matematyka.html`/`kurs-angielski.html`/`kurs-polski.html` (zakładki matura/E8), a nie wygenerowane od zera.
- Opinie/wyniki: wykorzystano wyłącznie dane już istniejące w serwisie (np. cytat Zofii K. — matura z matematyki 84%, cytat Małgorzaty W. — E8 z angielskiego 91%, wskaźniki 80%/85%/91%/100+ opinii). Nie wymyślono żadnych nowych opinii, wyników ani danych nauczycieli. Wielkość grup nie jest nigdzie podana — pominięto (brak potwierdzonych danych), zgodnie z zasadą 17.
- Sekcja „Informacje dla rodzica” na `kursy-egzamin-osmoklasisty.html` opisuje wyłącznie proces (kontakt, nagrania, punkt startowy) — bez wymyślonych statystyk.

**Strony wyboru egzaminu (`kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html`):** pozostawione bez zmian merytorycznych, zgodnie z poleceniem właściciela — dodano wyłącznie jedną linię z linkami do nowych stron dedykowanych (matura/E8) w hero, bez usuwania istniejącej zawartości ani przełącznika zakładek.

**`kursy.html`:** dodano linię z linkami do `kursy-maturalne.html` i `kursy-egzamin-osmoklasisty.html` w hero oraz przekierowano linki w siatce „Kursy egzaminacyjne” (zakładki matura/E8) na nowe strony dedykowane zamiast na strony wyboru egzaminu.

**Mechanizm:** nowe strony napisane bezpośrednio w formie „zbudowanej” (z osadzonym `/assets/shared.css`, `/assets/shared.js`, tym samym wzorcem header/mobile-menu/breadcrumbs/stopki co reszta serwisu) — nie dodano ich do `PAGES` w `scripts/build-components.js`, analogicznie jak już zbudowane strony z Etapu 1 (skrypt jest idempotentny i pomija strony zawierające `/assets/shared.js`).

**Testy wykonane:**
- Walidacja HTML (`html.parser`) — wszystkich 8 nowych stron parsuje się bez błędów.
- Walidacja JSON-LD (`json.loads`) — wszystkie bloki `Course`/`FAQPage`/`BreadcrumbList` (3 na stronie przedmiotowej, 2 na hubie) parsują się poprawnie.
- Weryfikacja linków wewnętrznych (`href="/*.html"`) na wszystkich 12 zmienionych/nowych plików — brak odniesień do nieistniejących plików.
- `node scripts/build-components.js` — 12 stron z Etapu 1 zgłasza „bez zmian (już zbudowane)”, potwierdzone brak regresji w mechanizmie budowania.
- Weryfikacja wizualna w przeglądarce (localhost:3456) na `kurs-maturalny-matematyka.html` (768px): hero, breadcrumbs, nawigacja, program i sekcja wyników renderują się zgodnie z resztą serwisu.
- Weryfikacja JS na żywo: `menu-toggle` poprawnie przełącza `aria-expanded`/klasę `open` na `kursy-maturalne.html`; przycisk FAQ poprawnie przełącza klasę `open` na `kurs-e8-matematyka.html`; `window.Shared` zdefiniowany na obu stronach.
- Formularze leadowe NIE zostały faktycznie wysłane podczas testów (uniknięcie fałszywych wpisów w arkuszu Google i fałszywych eventów Meta Pixel na produkcji).
- `git status` przed rozpoczęciem pracy — czyste repo, zweryfikowano że etap 1 (`d70f252`) jest już scommitowany i wypchnięty przed rozpoczęciem etapu 2.

**Znane ograniczenie (do świadomej decyzji, nie blokuje wdrożenia):** biologia, chemia, geografia i WOS nie mają jeszcze osobnych stron maturalnych — `kursy-maturalne.html` linkuje do nich przez istniejący `kursy.html` (zajęcia stacjonarne w Wyszkowie), zgodnie z zakresem tego etapu (8 stron wymienionych w poleceniu). Dodanie dedykowanych stron dla tych 4 przedmiotów to naturalny kandydat na kolejny etap.

**Wdrożenie:**
1. Podczas pobierania zdalnych zmian przed pushem wykryto commit `b04e88a` ("Wymagaj imienia i telefonu w formularzu", tylko `zapisz-sie.html`) — wypchnięty bezpośrednio przez właściciela w trakcie tej sesji, poza zakresem Etapu 2. Zweryfikowano brak konfliktu, zrebase'owano bez konfliktów.
2. Commit `fe567e0` (Etap 2) wypchnięty na `main` — wraz z nim wdrożony na produkcję również Etap 1 (`d70f252`), który wcześniej czekał na wdrożenie.
3. Po redeployu Vercel zweryfikowano na produkcji (curl, kody HTTP): wszystkie 8 nowych stron → **200** (`/kursy-maturalne`, `/kursy-egzamin-osmoklasisty`, `/kurs-maturalny-matematyka`, `/kurs-maturalny-angielski`, `/kurs-maturalny-polski`, `/kurs-e8-matematyka`, `/kurs-e8-angielski`, `/kurs-e8-polski`); strony zmienione (`/kurs-matematyka`, `/kurs-angielski`, `/kurs-polski`, `/kursy`) → **200**, brak regresji; `/zapisz-sie` i `/privacy-policy` (poza zakresem) → **200**, potwierdzone brak wpływu na inne strony.

**Adres wdrożenia:** https://burza-mozgow-korepetycje.pl
**Gałąź:** `main`
**Finalny hash commita:** `fe567e0` (poprzedni: `b04e88a`, `d70f252`)

**Następny etap:** nierozpoczęty, oczekuje na polecenie właściciela.

---

## Etap 1 — Wspólny system komponentów (zaimplementowany, oczekuje na wdrożenie)

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
