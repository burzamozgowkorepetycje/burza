# Status projektu

## Ostatni etap: Etap 5 — Strony lokalizacji (zaimplementowany, wdrożony i zweryfikowany na produkcji)

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
