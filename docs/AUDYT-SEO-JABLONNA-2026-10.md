# Audyt SEO: widoczność Jabłonna / Legionowo (16.10.2026)

Zakres: kod repo `burza-mozgow` (stan po `f615073`) + odpowiedzi produkcji (`curl`).
Nie sprawdzono: Google Search Console, Profilu Firmy w Google (GBP), rzeczywistych pozycji w Google PL.

## Werdykt

Technicznie strona jest w dobrym stanie: canonicale, robots, noindex na stronach
technicznych, przekierowania www i `.html`, schema, mapy, szybkie odpowiedzi (0,1-0,3 s).
Problem z Jabłonną leży gdzie indziej:

1. **Jabłonna ma 3 adresy, Wyszków ~35.** Wszystkie strony przedmiotów, kursów i bloga
   celują w Wyszków. Na frazy „korepetycje z matematyki Legionowo”, „kurs E8 Legionowo”,
   „angielski dla dzieci Jabłonna” nie mamy żadnej dedykowanej strony.
2. **Część serwisu nadal mówi, że Jabłonna „rusza 1 września”** i podaje inne godziny niż
   strona placówki. Google i klienci widzą sprzeczne dane.
3. **O mapach (local pack) decyduje Profil Firmy w Google, nie strona.** Bez osobnego,
   zweryfikowanego profilu dla Zegrzyńskiej 22 z opiniami nie wejdziemy do „3 pinezek”.

Konkurencja w wynikach na „korepetycje Legionowo” jest słaba: głównie OLX i portale
z ofertami pracy, brak wyraźnego lokalnego centrum korepetycji. To dobra okazja.

## A. Błędy do poprawy od razu (kod)

| # | Gdzie | Problem | Poprawka |
|---|---|---|---|
| A1 | `lokalizacje.html` (karta Jabłonny, og/twitter, FAQ) | „Nowość · od 1 września”, „Start zajęć 1 września”, FAQ: „rusza 1 września”, „Ile lokalizacji ma… w Wyszkowie? Dwie” | Przepisać na stan obecny: placówka działa, kursy trwają, można dołączyć |
| A2 | `lokalizacje.html` vs `jablonna/*.html` | Godziny Jabłonny: 8:00-20:00 na /lokalizacje, 14:00-20:00 na /jablonna i w schema | Ujednolicić (do potwierdzenia przez właściciela) i tak samo wpisać w GBP |
| A3 | `lokalizacje.html` title | „Lokalizacje - Korepetycje Wyszków” | „Lokalizacje: Wyszków i Jabłonna (Legionowo) \| Burza Mózgów” |
| A4 | `kontakt.html` title/description | Tylko Wyszków („oba adresy”) | Dopisać Jabłonnę, trzy adresy |
| A5 | `sitemap.xml` | `lastmod` 17.08 dla 42 adresów, choć Jabłonna zmieniła się 6.10 | Generować `lastmod` z `git log` w `scripts/build-components.js` |
| A6 | Schema `/jablonna` | Brak `@id`, `geo`, `hasMap`, `image`, `sameAs` (GBP, FB) | Uzupełnić; współrzędne i link do mapy wziąć z GBP, nie zgadywać |
| A7 | `index.html` | Jedyny link do /jablonna ma anchor „Zobacz szczegóły” | Anchor „Korepetycje w Jabłonnie i Legionowie” |
| A8 | `korepetycje-online.html` | Brak linku do Jabłonny | Dodać w sekcji „wolisz stacjonarnie?” |
| A9 | `vercel.json` | `/korepetycje-matematyka-jablonna` i `/korepetycje-polski-jablonna` → kotwice na /jablonna | Po zbudowaniu stron z sekcji B przepiąć na nowe adresy |
| A10 | `index.html` | 184 KB, z czego 77 KB inline CSS | Wydzielić CSS do `assets/` (cache); niski priorytet, bo strona i tak szybko odpowiada |

## B. Klaster treści Jabłonna / Legionowo (najważniejsze dla pozycji)

Każda strona musi mieć **własną treść** (inne pytania, program, przykłady, FAQ),
a nie skopiowany szablon z podmienioną nazwą miasta. Inaczej Google uzna je za doorway pages.

| Priorytet | Adres | Fraza główna | Uwagi |
|---|---|---|---|
| 1 | `/jablonna/korepetycje-matematyka` | korepetycje z matematyki Legionowo / Jabłonna | Najczęściej szukany przedmiot |
| 1 | `/jablonna/egzamin-osmoklasisty` | kurs E8 Legionowo | Wydzielić z `kursy-maturalne-e8` (dwie intencje na jednym URL) |
| 1 | `/jablonna/kurs-maturalny` | kurs maturalny Legionowo | j.w. |
| 2 | `/jablonna/korepetycje-polski` | korepetycje z polskiego Legionowo | |
| 2 | `/jablonna/angielski-dla-dzieci` | angielski dla dzieci Legionowo | Obecnie sekcja `#dzieci` na /jablonna/angielski |
| 2 | `/blog-progi-punktowe-licea-legionowo-2026` | progi punktowe Legionowo | Mocna fraza lokalna rodziców ósmoklasistów; dane z oficjalnych komunikatów szkół/powiatu |
| 3 | `/blog-dojazd-zegrzynska-22-z-legionowa` lub sekcja na /jablonna | dojazd, parking, komunikacja | Wiarygodność „5 minut od Legionowa” |

Na stronie `/jablonna` dodać: lista szkół, z których przychodzą uczniowie (tylko prawdziwe),
zdjęcia sali przy Zegrzyńskiej, imiona prowadzących, opinie rodziców z Jabłonny/Legionowa.

Linkowanie: w każdej stronie przedmiotu w Wyszkowie blok „Mieszkasz w Legionowie lub
Jabłonnie?” z linkiem do odpowiednika w `/jablonna/…`; w stopce kolumna „Jabłonna” z 3-4 linkami.

## C. Poza kodem (decyduje o mapach Google)

1. **Profil Firmy w Google dla Zegrzyńskiej 22**: osobny od Wyszkowa, kategoria główna
   „Korepetytor” lub „Centrum korepetycji”, godziny zgodne ze stroną, link do `/jablonna`
   z UTM, zdjęcia sali i wejścia, posty co tydzień, sekcja Q&A, usługi z cenami „od 50 zł/h”.
2. **Opinie z Jabłonny**: prosić rodziców kursantów z Zegrzyńskiej o opinię na tym
   profilu (link skrócony w SMS/mailu po miesiącu zajęć). Cel: 20+ do końca roku.
3. **Spójny NAP** (nazwa, adres, telefon) w: Facebook (lokalizacja), Bing Places, Apple Maps,
   Panorama Firm, pkt.pl, lokalne grupy i portale Legionowa/gminy Jabłonna.
4. **Search Console**: sprawdzić indeksację 3 stron Jabłonny i zapytania z „legionowo”;
   po wdrożeniu B zgłosić sitemapę ponownie.

## Do decyzji właściciela

- Prawdziwe godziny w Jabłonnie (14-20 czy 8-20, sobota?).
- Czy jest osobny Profil Firmy w Google dla Zegrzyńskiej 22 i pod jaką nazwą.
- Kolejność stron z sekcji B i czy rozbijamy `/jablonna/kursy-maturalne-e8` na dwie.
