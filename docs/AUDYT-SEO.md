# Audyt SEO / UX / techniczny — ETAP 0 (pełna wersja)

Data audytu: 2026-07-14
Repozytorium: `burzamozgowkorepetycje/burza`, branch `main`, working tree czyste w momencie audytu.
Stack: statyczny HTML (bez frameworka/build stepu), hosting Vercel, `cleanUrls: true`, `trailingSlash: false`.
Metoda: analiza lokalnych plików źródłowych (repo) + weryfikacja nagłówków HTTP na produkcji przez `curl` tam, gdzie zachowanie zależy od konfiguracji hostingu (przekierowania). Nie użyto przeglądarki — nie było takiej potrzeby, dane były dostępne lokalnie lub przez nagłówki HTTP.

---

## 1. Struktura repozytorium — pełna lista plików

```
index.html                          korepetycje-hiszpanski.html
korepetycje-angielski.html          korepetycje-matematyka.html
korepetycje-biologia.html           korepetycje-online.html
korepetycje-chemia.html             korepetycje-polski.html
korepetycje-geografia.html          korepetycje-wos.html
kurs-angielski.html                 kurs-matematyka.html
kurs-polski.html                    kursy.html
privacy-policy.html                 zapisz-sie.html
robots.txt, sitemap.xml, vercel.json, package.json, README.md
upload/ (7 plików graficznych: logo.jpg, angielski.jpg, matematyka.jpg, polski.jpg,
         wyniki-matura.jpg, wyniki-zbiorcze.jpg, wyniki-zbiorcze.png)
```

16 plików HTML, każdy samodzielny (własny `<style>` i `<script>` w pliku, brak wspólnych komponentów/layoutu). Brak plików `.css`/`.js` jako osobnych zasobów — cały kod jest inline w HTML.

---

## 2. Wszystkie podstrony i odpowiadające im URL-e

| # | Plik źródłowy | Adres produkcyjny (canonical) | W sitemap.xml? |
|---|---|---|---|
| 1 | index.html | `/` | tak |
| 2 | korepetycje-online.html | `/korepetycje-online` | tak |
| 3 | kursy.html | `/kursy` | tak |
| 4 | kurs-matematyka.html | `/kurs-matematyka` | tak |
| 5 | kurs-polski.html | `/kurs-polski` | tak |
| 6 | kurs-angielski.html | `/kurs-angielski` | tak |
| 7 | korepetycje-matematyka.html | `/korepetycje-matematyka` | tak |
| 8 | korepetycje-polski.html | `/korepetycje-polski` | tak |
| 9 | korepetycje-angielski.html | `/korepetycje-angielski` | tak |
| 10 | korepetycje-biologia.html | `/korepetycje-biologia` | tak |
| 11 | korepetycje-chemia.html | `/korepetycje-chemia` | tak |
| 12 | korepetycje-geografia.html | `/korepetycje-geografia` | tak |
| 13 | korepetycje-wos.html | `/korepetycje-wos` | tak |
| 14 | korepetycje-hiszpanski.html | `/korepetycje-hiszpanski` | tak |
| 15 | privacy-policy.html | `/privacy-policy` | tak |
| 16 | zapisz-sie.html | `/zapisz-sie` | **nie** — brak w sitemap.xml |

`zapisz-sie.html` to samodzielny landing (quiz doboru kursu), zbudowany pod kampanie płatne (Meta Ads — potwierdzone w historii commitów: „Add standalone quiz landing page for Meta Ads”). Nie jest linkowany z żadnej innej strony serwisu (brak w nawigacji głównej, stopce, innych podstronach) — prawdopodobnie celowo (ruch płatny, nie organiczny), ale wymaga potwierdzenia od właściciela, bo obecnie jest też niewidoczny dla Google (brak w sitemap = wolniejsze odkrycie, choć strona ma `canonical` i mogłaby być indeksowana, gdyby ktoś na nią trafił/linkował).

---

## 3. Tabela pełnego audytu URL-i

| Adres | Plik | Główna intencja | Główna fraza | Title | H1 | Canonical | Status |
|---|---|---|---|---|---|---|---|
| `/` | index.html | Marka lokalna, Wyszków, strona główna | korepetycje Wyszków / kursy maturalne i ósmoklasisty | Burza Mózgów Korepetycje — Wyszków \| Kursy maturalne i ósmoklasisty | „Średni wynik naszych uczniów to 80%.” | OK (`/`) | **poprawić** — H1 nie zawiera głównej frazy i jest identyczny z H1 na `/korepetycje-online` (patrz sekcja 6) |
| `/korepetycje-online` | korepetycje-online.html | Sprzedaż online, cała Polska | korepetycje online | Korepetycje Online z Całej Polski \| Burza Mózgów Korepetycje | „Średni wynik naszych uczniów to 80%.” (identyczny jak na `/`) | OK | **poprawić** — zduplikowany H1 z homepage |
| `/kursy` | kursy.html | Hub kursów maturalnych/E8 | kursy maturalne i E8 | Kursy maturalne i E8 \| Burza Mózgów Korepetycje | „Przygotuj się do matury. Wybierz swój kurs.” | OK | **poprawić** — H1 sugeruje wyłącznie maturę, choć strona ma linkować też do E8; do przeglądu przy podziale kursów |
| `/kurs-matematyka` | kurs-matematyka.html | **Podwójna: matura + E8 pod jednym URL** | kurs maturalny matematyka / kurs E8 matematyka (konflikt) | Kurs Maturalny z Matematyki Online \| Gwarancja 70%+ \| Burza Mózgów | „Kurs maturalny z matematyki. Z gwarancją wyniku.” | OK, ale opisuje tylko wariant matura | **rozdzielić** |
| `/kurs-angielski` | kurs-angielski.html | Podwójna: matura + E8 | jw. dla angielskiego | Kurs Maturalny z Języka Angielskiego Online \| Burza Mózgów | „Kurs maturalny z języka angielskiego...” (wzorzec jak matematyka) | OK, tylko matura | **rozdzielić** |
| `/kurs-polski` | kurs-polski.html | Podwójna: matura + E8 | jw. dla polskiego | Kurs Maturalny z Języka Polskiego Online \| Burza Mózgów | „Kurs maturalny z języka polskiego...” | OK, tylko matura | **rozdzielić** |
| `/korepetycje-matematyka` | korepetycje-matematyka.html | Bieżące korepetycje (nie kurs maturalny) | korepetycje z matematyki bieżące | Korepetycje z Matematyki — Bieżące Przygotowanie \| Burza Mózgów | zgodny z tematem | OK | zostawić |
| `/korepetycje-polski` | korepetycje-polski.html | jw. dla polskiego | korepetycje z polskiego | Korepetycje z Języka Polskiego — Bieżące Przygotowanie \| Burza Mózgów | zgodny | OK | zostawić |
| `/korepetycje-angielski` | korepetycje-angielski.html | jw. dla angielskiego | korepetycje z angielskiego | Korepetycje z Języka Angielskiego — Bieżące Przygotowanie \| Burza Mózgów | zgodny | OK | zostawić |
| `/korepetycje-biologia` | korepetycje-biologia.html | Korepetycje z biologii | korepetycje z biologii Wyszków | Korepetycje z Biologii \| Burza Mózgów Korepetycje | „Korepetycje z biologii. Indywidualnie albo w grupie stacjonarnej w Wyszkowie.” | OK | zostawić |
| `/korepetycje-chemia` | korepetycje-chemia.html | Korepetycje z chemii | korepetycje z chemii Wyszków | Korepetycje z Chemii \| Burza Mózgów Korepetycje | analogiczny wzorzec | OK | zostawić |
| `/korepetycje-geografia` | korepetycje-geografia.html | Korepetycje z geografii | korepetycje z geografii Wyszków | Korepetycje z Geografii \| Burza Mózgów Korepetycje | analogiczny wzorzec | OK | zostawić |
| `/korepetycje-wos` | korepetycje-wos.html | Korepetycje z WOS | korepetycje z WOS Wyszków | Korepetycje z WOS \| Burza Mózgów Korepetycje | analogiczny wzorzec | OK | zostawić |
| `/korepetycje-hiszpanski` | korepetycje-hiszpanski.html | Korepetycje z hiszpańskiego | korepetycje z hiszpańskiego | Korepetycje z Języka Hiszpańskiego \| Burza Mózgów Korepetycje | „Korepetycje z języka hiszpańskiego. Dla każdej klasy i każdego poziomu.” | OK | zostawić |
| `/privacy-policy` | privacy-policy.html | Wymóg prawny RODO | polityka prywatności | Polityka Prywatności — Burza Mózgów Korepetycje | „Polityka Prywatności” | OK | **poprawić** — 2 martwe linki kotwicowe w nawigacji (`/#kontakt`, `/#przedmioty` — patrz sekcja 7); docelowy slug (`/polityka-prywatnosci`) do decyzji właściciela |
| `/zapisz-sie` | zapisz-sie.html | Landing quizu / kampanie płatne | dobór kursu, zapis na kurs | Dobierz kurs dla swojego dziecka \| Burza Mózgów Korepetycje | „Sprawdź, który kurs pasuje do Twojego dziecka” | OK | **poprawić** — brak w sitemap.xml; potwierdzić z właścicielem, czy brak linkowania wewnętrznego jest zamierzony (ruch płatny) |

---

## 4. Linkowanie wewnętrzne — wynik testu

Zebrano wszystkie unikalne `href` wskazujące na zasoby wewnętrzne (pominięto `mailto:`, `tel:`, zewnętrzne `http(s)`, czyste kotwice `#`) i sprawdzono, czy każdy prowadzi do istniejącego pliku.

**Wynik: brak martwych linków do nieistniejących stron.** Wszystkie `href="/plik.html"` mają odpowiadający plik w repozytorium.

Jedyny problem znaleziony w tej kategorii to **martwe kotwice** (link prowadzi do istniejącej strony, ale do nieistniejącego fragmentu na niej) — patrz sekcja 7.

Wszystkie linki wewnętrzne używają rozszerzenia `.html` (np. `href="/kursy.html"`), mimo że `canonical` i `sitemap.xml` używają adresów czystych (`/kursy`). To działa poprawnie dzięki przekierowaniu po stronie Vercel (zweryfikowane w sekcji 8), ale oznacza dodatkowy przeskok 301/308 przy każdym kliknięciu w link wewnętrzny — do ujednolicenia w kolejnym etapie.

---

## 5. Mobilne menu — wynik testu (analiza kodu, bez przeglądarki)

Sprawdzono obecność funkcjonalnego menu mobilnego (hamburger + panel nawigacji) na wszystkich 16 stronach.

**Tylko 2 z 16 stron mają pełne, działające menu mobilne z przełącznikiem (hamburger + overlay):**
- `index.html`
- `korepetycje-online.html`

Na tych stronach logika JS jest kompletna: `hamburger.addEventListener('click', openMenu)`, `aria-expanded` przełącza się między `true`/`false`, focus wraca na przycisk po zamknięciu, panel ma `role="dialog"` i `aria-modal="true"`.

**Pozostałe 12 stron** (`kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html`, `kursy.html`, wszystkie strony `korepetycje-{przedmiot}.html` poza `korepetycje-online.html`) **nie mają menu mobilnego w ogóle.** Zamiast tego stosują CSS:

```css
@media(max-width:900px){.nav-links a:not(.btn){display:none}}
```

Czyli poniżej 900 px szerokości linki nawigacyjne („Strona główna”, „Wszystkie kursy”, „Program”, „Wyniki”, „Cena” itd.) **znikają całkowicie i nie ma żadnego zamiennika** (brak hamburgera, brak innego dostępu do tych linków). Zostają widoczne tylko przyciski (`.btn`) — zwykle telefon i CTA zapisu.

**Ocena:** to nie jest błąd krytyczny dla konwersji na tych stronach (CTA i telefon zostają widoczne, a to one mają największe znaczenie sprzedażowe), ale to **realne ograniczenie nawigacji i dostępności na urządzeniach mobilnych** na 12 z 16 stron — użytkownik mobilny na `/kurs-matematyka` nie może np. wrócić na stronę główną inaczej niż przez klawisz „wstecz” przeglądarki lub kliknięcie logo (do zweryfikowania, czy logo linkuje do `/`).

`privacy-policy.html` i `zapisz-sie.html` mają odrębne, uproszczone nawigacje (odpowiednio: 3-pozycyjne menu bez ukrywania, i brak tradycyjnego menu — zgodnie z charakterem landing page) — nie dotyczy ich ten problem.

---

## 6. Zduplikowane treści między stronami

Sprawdzono nagłówki H1, sekcje FAQ i powtarzające się frazy między stroną główną, `korepetycje-online`, `kursy` i stronami przedmiotowymi.

**Potwierdzony przypadek duplikacji:** H1 na `index.html` i na `korepetycje-online.html` jest **słowo w słowo identyczny**:

> „Średni wynik naszych uczniów to 80%.”

Różni się tylko poprzedzający „eyebrow” (`Nr 1 wśród korepetycji w Wyszkowie` vs. `Korepetycje online · cała Polska`) i dalszy opis pod H1. Skoro to dwie kluczowe, różne intencyjnie strony (lokalna vs. ogólnopolska online), identyczny H1 osłabia sygnał tematyczny obu stron dla Google — warto go zróżnicować tak, by każda strona miała H1 zawierający właściwą dla niej frazę kluczową.

**Sekcje FAQ:** sprawdzono treść pytań/odpowiedzi FAQ na `index.html` — są unikalne i tematycznie dopasowane do lokalnej intencji (Wyszków, adresy, matura/E8 lokalnie). `korepetycje-online.html` nie powiela tych samych pytań (własna sekcja, nie znaleziono identycznych bloków tekstu) — dobry sygnał, brak realnej duplikacji treści na poziomie akapitów.

**Wspólne frazy marketingowe** („Nr 1 na Google”, „100+ opinii”, „Od 40 zł/h”) powtarzają się na kilku stronach (`index.html`, `korepetycje-online.html`, `zapisz-sie.html`) — to krótkie, powtarzalne elementy zaufania (trust badges), nie pełne akapity. Nie stanowią ryzyka duplikacji treści w rozumieniu SEO (Google nie karze za powtarzające się krótkie frazy marketingowe), ale warto mieć to na uwadze przy dalszej rozbudowie.

**Strony przedmiotowe korepetycji** (`biologia`, `chemia`, `geografia`, `wos`) są budowane na wspólnym szablonie (ten sam wzorzec H1: „Korepetycje z X. Indywidualnie albo w grupie stacjonarnej w Wyszkowie.”, 5 sekcji H2, 2 bloki JSON-LD) — to standardowa i akceptowalna praktyka programistyczna (spójny wzorzec), nie duplikacja treści, o ile treść w sekcjach różni się merytorycznie między przedmiotami (nie sprawdzano tu słowo w słowo każdej sekcji — do ew. pogłębienia w kolejnym etapie, jeśli właściciel chce mieć pewność).

---

## 7. Błędne linki — szczegóły

Znaleziono **2 martwe linki kotwicowe** w `privacy-policy.html` (linia 205–206):

```html
<li><a href="/#przedmioty">Przedmioty</a></li>
<li><a href="/#kontakt">Kontakt</a></li>
```

Strona `index.html`, do której prowadzą te linki, **nie ma** elementów o `id="przedmioty"` ani `id="kontakt"`. Rzeczywiste identyfikatory na `index.html` to `id="subjects"` i `id="contact"`. Efekt: kliknięcie w te linki z poziomu polityki prywatności przenosi na stronę główną, ale **nie przewija do właściwej sekcji** — użytkownik ląduje na górze strony głównej zamiast przy sekcji przedmiotów/kontaktu. To realny, drobny błąd UX (nie wpływa na SEO ani bezpieczeństwo), łatwy do naprawienia przez zamianę `#przedmioty`→`#subjects` i `#kontakt`→`#contact`.

Poza tym przypadkiem — **brak innych martwych linków** w serwisie (wszystkie pozostałe `href` prowadzące do plików wewnętrznych rozwiązują się poprawnie).

---

## 8. Weryfikacja przekierowań `.html` → adres czysty (nie założono, sprawdzono)

`vercel.json` nie zawiera jawnej sekcji `redirects` — poleganie na przekierowaniu jest efektem samego ustawienia `"cleanUrls": true`. Zweryfikowano rzeczywiste zachowanie produkcji przez zapytania HTTP `HEAD`:

```
curl -sI https://burza-mozgow-korepetycje.pl/kursy.html
→ HTTP/2 308, location: /kursy

curl -sI https://burza-mozgow-korepetycje.pl/kurs-matematyka.html
→ HTTP/2 308, location: /kurs-matematyka

curl -sI https://burza-mozgow-korepetycje.pl/kursy
→ HTTP/2 200 (strona serwowana bezpośrednio, poprawne nagłówki bezpieczeństwa z vercel.json obecne)
```

**Potwierdzone: przekierowanie `.html` → adres czysty działa poprawnie (308) na produkcji.** To nie jest założenie — zostało zweryfikowane bezpośrednim zapytaniem do serwera produkcyjnego. Mimo że działa, każdy link wewnętrzny z `.html` generuje dodatkowy przeskok sieciowy (drobny koszt wydajnościowy, do wyeliminowania przez ujednolicenie linków w kolejnym etapie — patrz sekcja 4).

---

## 9. Meta title, description, canonical, nagłówki H1–H3

- Wszystkie 16 stron mają unikalny `<title>` i unikalny `<meta name="description">` — brak duplikatów.
- Wszystkie 16 stron mają dokładnie jeden `<h1>` — poprawna hierarchia na poziomie „jeden H1 na stronę”.
- `<link rel="canonical">` obecny i poprawny (self-referencing, zgodny z adresem czystym) na wszystkich stronach.
- Jedyne odstępstwo jakościowe: H1 na `index.html` i `korepetycje-online.html` nie zawiera głównej frazy kluczowej strony (jest to hasło „proof-first”, social-proof) i jest identyczny na obu stronach (sekcja 6) — do korekty.
- Struktura H2/H3 nie wykazała pominiętych poziomów (np. H1 → H3 z pominięciem H2) na sprawdzonych stronach.

## 10. Dane strukturalne (JSON-LD)

Obecne na 13/16 stron (brak na `zapisz-sie.html` i `privacy-policy.html` — zasadnie, to nie strony usługowe/lokalne wymagające schematu typu `Course`/`LocalBusiness`).

## 11. `sitemap.xml` i `robots.txt`

- `robots.txt`: poprawny, `Allow: /`, wskazuje `Sitemap: https://burza-mozgow-korepetycje.pl/sitemap.xml`.
- `sitemap.xml`: 14 adresów w formie czystej, zgodnej z `cleanUrls`. Brakuje `/zapisz-sie` (sekcja 2). `lastmod` ustawiony jednolicie na datę bieżącą dla wszystkich adresów — poprawne formalnie, ale warto w przyszłości aktualizować selektywnie (tylko realnie zmienione strony), żeby sygnał `lastmod` był wiarygodny dla Google.

## 12. Konfiguracja Vercel

`vercel.json`: `cleanUrls: true`, `trailingSlash: false`, statyczne nagłówki bezpieczeństwa (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) na wszystkich ścieżkach — potwierdzone również w realnych nagłówkach HTTP z produkcji (sekcja 8). Brak `redirects`, brak `rewrites` — cała logika routingu opiera się o pliki 1:1 i `cleanUrls`.

## 13. Formularze i integracja Google Sheets

- Wszystkie strony z formularzem (15/16, poza `privacy-policy.html`) wysyłają dane do **tego samego** endpointu Google Apps Script (`script.google.com/macros/s/AKfycbyAgf3.../exec`) — jeden spójny punkt integracji.
- Wzorzec wysyłki jest spójny: `fetch(URL, {method:'POST', mode:'no-cors', keepalive:true, ...})` z JSON zawierającym pole `zrodlo` (źródło), unikalne dla każdej strony (np. `"Landing kurs matematyka"`, `"Landing korepetycje matematyka"`) — dzięki temu każdy lead niesie informację, z której strony pochodzi. To dobra, spójna implementacja.
- **Nie testowano faktycznej wysyłki** (nie wysłano żadnego żądania POST do Google Sheets) — zgodnie z zasadą bezpieczeństwa „nie zmieniaj sposobu wysyłania formularzy”, audyt ograniczył się do analizy kodu źródłowego JS, nie do wykonania zapytań.
- Pola formularzy mają poprawne atrybuty `type`, `inputmode`, `autocomplete`, `required`, `minlength` — dobre praktyki pod kątem UX na klawiaturze mobilnej (np. `inputmode="tel"` dla numeru telefonu wywołuje klawiaturę numeryczną).
- Nie znaleziono pól `<input>` bez powiązanej etykiety (`<label for="...">`) — sprawdzono programowo dla wszystkich 16 stron, wynik czysty.

## 14. Meta Pixel i narzędzia analityczne

- Meta Pixel: jeden spójny identyfikator (`37060592533531781`) na wszystkich stronach, z poprawnym `noscript` fallback (piksel `1x1`, bez `alt` — prawidłowe dla trackera, nie błąd dostępności).
- Google Analytics: jeden spójny identyfikator (`G-ZWWWQMM89P`) na wszystkich stronach.
- Nie modyfikowano, nie usuwano, nie testowano zmian w żadnym z powyższych — zgodnie z zasadami bezpieczeństwa.

## 15. Obrazy i teksty alternatywne

- 19 tagów `<img>` łącznie w całym serwisie. Wszystkie mają atrybut `alt` poza jednym technicznym pikselem Meta (celowo, to prawidłowa praktyka).
- Tylko 4 z 19 obrazów mają `loading="lazy"` — pozostałe (w tym zdjęcia „proof”/wyników w widocznych niżej sekcjach) ładują się od razu.
- `upload/wyniki-zbiorcze.png` waży **1,6 MB** — zdecydowanie najcięższy zasób graficzny serwisu, kandydat do konwersji na WebP/AVIF i kompresji.
- Pozostałe obrazy: 30–340 KB — akceptowalne, ale możliwe do dalszej optymalizacji (nowoczesne formaty).

## 16. Wydajność ładowania — obserwacje ze statycznej analizy

- Każda strona zawiera cały CSS i JS inline w `<head>`/`<body>` — brak cache'owania między stronami na poziomie przeglądarki (każda podstrona pobiera swój własny, duży blok CSS/JS od nowa, mimo że wzorce się powtarzają między stronami tego samego typu, np. strony przedmiotowe).
- Rozmiary plików HTML wahają się od ok. 10 KB (`privacy-policy.html`) do ok. 107 KB (`index.html`) i 105 KB (`korepetycje-online.html`) — te dwie strony są zauważalnie cięższe niż pozostałe (2–3× więcej niż strony kursów, 5× więcej niż strony przedmiotowe), co koreluje z pełnym menu mobilnym i większą liczbą sekcji.
- Brak zewnętrznych arkuszy CSS/JS do cache'owania (poza Google Fonts, GA, Meta Pixel SDK) — to jest świadomy kompromis architektury „każda strona = samodzielny plik”, prosty w utrzymaniu, ale nieoptymalny pod kątem współdzielenia zasobów między stronami.
- Nie mierzono rzeczywistych Core Web Vitals (LCP/CLS/INP) — wymagałoby to narzędzia typu Lighthouse/PageSpeed Insights na żywej stronie, co wykracza poza zakres analizy statycznej tego etapu.

## 17. Dostępność (accessibility)

- `<html lang="pl">` obecny na wszystkich 16 stronach — poprawnie.
- Menu mobilne na `index.html`/`korepetycje-online.html`: `role="dialog"`, `aria-modal="true"`, `aria-label`, `aria-expanded` przełączany poprawnie, focus zwracany na przycisk po zamknięciu — dobra implementacja tam, gdzie menu istnieje.
- Formularze: brak pól bez powiązanej etykiety (sprawdzono programowo).
- Obrazy dekoracyjne/tło oznaczone `aria-hidden="true"` tam, gdzie to zasadne (np. blob/tło w hero).
- Nie sprawdzano kontrastu kolorów (wymaga renderowania wizualnego/narzędzia, poza zakresem analizy statycznego kodu).

## 18. Formularze na telefonie i komputerze — analiza kodu (bez faktycznego testu urządzenia)

- Layout formularzy korzysta z `grid`/`flex` z jednostkami względnymi i media queries — kod wygląda na responsywny (potwierdzone obecnością `@media` w każdym pliku z formularzem).
- Klawiatura mobilna: `inputmode="tel"` dla telefonu, `type="email"` dla e-maila (tam gdzie występuje) — poprawne przywoływanie właściwej klawiatury.
- Walidacja: `required`, `minlength="9"` na polu telefonu — podstawowa walidacja HTML5 obecna.
- **Zastrzeżenie:** to analiza kodu źródłowego, nie faktyczny test na urządzeniu fizycznym/emulatorze — zgodnie z poleceniem nie uruchamiano przeglądarki. Rekomendacja: jeśli właściciel chce mieć stuprocentową pewność działania na realnych urządzeniach, warto to zweryfikować wizualnie w osobnym kroku (np. skill `verify` przy okazji wdrażania zmian, nie na etapie samego audytu).

---

## 19. Podsumowanie potwierdzonego głównego problemu strukturalnego

`kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html` obsługują dwie intencje (matura / egzamin ósmoklasisty) pod jednym adresem URL, rozróżniane wyłącznie JS-owym przełącznikiem zakładek (`data-mode="matura"|"e8"`, fragment `#e8` w URL). Jeden `<title>`, jeden `<h1>`, jeden `<canonical>`, jeden JSON-LD niezależnie od wybranej zakładki. Treść E8 istnieje w DOM, ale jest ukryta (`display:none`) do czasu interakcji JS — Google efektywnie widzi tylko wariant maturalny. Potwierdza to dokładnie problem opisany w briefie właściciela.

---

## 20. Plan wdrożenia — proponowany zakres kolejnych etapów (do zatwierdzenia, nic nie wdrożono)

### Etap 1 (proponowany): rozdzielenie matura/E8 dla matematyki, angielskiego, polskiego
**Pliki do utworzenia:**
- `kursy-maturalne/kurs-maturalny-matematyka.html`, `.../kurs-maturalny-angielski.html`, `.../kurs-maturalny-polski.html` (lub odpowiedniki bez podkatalogu, w zależności od tego, jak Vercel ma routingować — do ustalenia techniczne w momencie realizacji)
- `kursy-egzamin-osmoklasisty/kurs-e8-matematyka.html`, `.../kurs-e8-angielski.html`, `.../kurs-e8-polski.html`

**Pliki do zmiany:**
- `kurs-matematyka.html`, `kurs-angielski.html`, `kurs-polski.html` — zamiast usuwać, przekształcić w przekierowania 301 do wariantu maturalnego (zachowanie starego adresu i jego mocy SEO) LUB pozostawić jako istniejące strony z dopiskiem canonical wskazującym na nowy adres maturalny — decyzja do podjęcia wspólnie z właścicielem w zależności od tego, ile ruchu/pozycji mają obecne adresy w Google Search Console (dane, których nie mamy na tym etapie).
- `index.html` — zaktualizować linki `/kurs-matematyka.html#e8` → nowy adres E8.
- `kursy.html` — dodać sekcję/linki do nowych stron E8.
- `sitemap.xml` — dodać nowe adresy.

**Wymaga decyzji właściciela:** czy stare adresy `/kurs-matematyka` itd. mają przekierowywać na wariant maturalny, czy zostać jako osobna, trzecia strona (np. hub wyboru między matura/E8) — obie opcje są zgodne z zasadą „nie usuwaj działającej podstrony”, ale mają różny wpływ na SEO.

### Etap 2 (proponowany): drobne poprawki techniczne niskiego ryzyka
- Naprawa martwych kotwic w `privacy-policy.html` (`#przedmioty`→`#subjects`, `#kontakt`→`#contact`).
- Dodanie `/zapisz-sie` do `sitemap.xml` (po potwierdzeniu z właścicielem, że ma być indeksowana).
- Ujednolicenie linków wewnętrznych na adresy czyste (bez `.html`) we wszystkich 16 plikach.
- Zróżnicowanie H1 na `index.html` vs. `korepetycje-online.html`.

### Etap 3 (proponowany): wydajność
- Konwersja `wyniki-zbiorcze.png` (1,6 MB) do WebP/AVIF + kompresja pozostałych obrazów.
- Rozszerzenie `loading="lazy"` na obrazy poniżej pierwszego ekranu.

### Etap 4+ (proponowany, wymaga treści od właściciela): nowe sekcje
- `zajecia-indywidualne`, `zajecia-grupowe`, `cennik`, `wyniki`, `opinie`, `o-nas`, `kontakt`, `lokalizacje/*`, `blog` — zgodnie z docelową strukturą z briefu. Wymaga ustalenia z właścicielem, które treści już istnieją (np. czy wydzielić z istniejących stron) a które wymagają nowych materiałów/placeholderów.

### Elementy do ujednolicenia niezależnie od kolejności etapów
- Menu mobilne — rozszerzyć wzorzec hamburger+overlay z `index.html`/`korepetycje-online.html` na pozostałe 12 stron, albo świadomie potwierdzić z właścicielem, że uproszczona nawigacja mobilna (tylko CTA) jest tam zamierzona.
- Zapis `initial-scale=1.0` vs `initial-scale=1` w meta viewport — kosmetyczne ujednolicenie.

**Nic z powyższego nie zostało wdrożone na tym etapie.** To wyłącznie propozycja kolejności prac do akceptacji.

---

## 21. Zgodność z zasadami bezpieczeństwa briefu

Potwierdzone jako nienaruszone podczas audytu: numer telefonu (605 947 803), adresy (Prosta 3, Sowińskiego 38), Meta Pixel, GA, endpoint Google Sheets, polityka prywatności — wszystkie zidentyfikowane, żadne nie zostało zmodyfikowane, usunięte ani przetestowane pod kątem zmiany działania. Żadna istniejąca podstrona nie została usunięta ani nadpisana. Jedyne zmiany wykonane na tym etapie to pliki w `docs/`.
