# Plan klastra podstron: Jabłonna / Legionowo (16.10.2026)

Stan dziś: 6 stron Jabłonny (`/jablonna`, `/angielski`, `/kursy-maturalne-e8`,
`/korepetycje-matematyka`, `/egzamin-osmoklasisty`, `/kurs-maturalny`) przy ~35 stronach Wyszkowa.
Cel: **~30 stron Jabłonny w 5 falach**, każda z własną frazą i treścią.

Oferta, na której wolno budować (z `/jablonna`): matematyka, polski i angielski w grupach
i indywidualnie; biologia, chemia, fizyka, geografia, historia i WOS **tylko indywidualnie**;
angielski dla dzieci od 6 lat, młodzieży i dorosłych; pon-pt 14:00-20:00; od 50 zł/h;
bez gwarancji wyniku. **Hiszpańskiego w Jabłonnie nie ma** - nie robimy tej strony.

## Zasady (żeby Google nie uznał klastra za spam)

1. Jedna strona = jedna intencja, pilnowana przez `seo-intent-map.json` i `npm run seo:check`.
2. Żadnego kopiowania tekstu z odpowiednika w Wyszkowie. Wspólne mogą być tylko adres, godziny, formularz i stopka.
3. Każda strona ma co najmniej jeden element, którego nie ma nigdzie indziej: przykładowe zadania,
   program, harmonogram grupy, FAQ z prawdziwych pytań rodziców z sekretariatu.
4. **Nie robimy stron „korepetycje Chotomów / Wieliszew / Nieporęt / Nowy Dwór”.** Bez placówki
   w tych miejscowościach to klasyczne doorway pages (polityka spamowa Google). Zamiast nich jest
   jedna strona dojazdu (fala 4).
5. Fakty tylko z istniejących stron albo od właściciela: bez wymyślonych nauczycieli, opinii, szkół i wyników.
6. 3-5 stron tygodniowo, po każdej fali sprawdzenie w Search Console (indeksacja, wyświetlenia na „legionowo”).

## Fala 1: przedmioty główne i angielski (5 stron)

| Adres | Fraza główna | Czym się różni |
|---|---|---|
| `/jablonna/korepetycje-polski` | korepetycje z polskiego Legionowo | Lektury, wypracowania, czytanie ze zrozumieniem; klasy 4-8 i liceum |
| `/jablonna/korepetycje-angielski` | korepetycje z angielskiego Legionowo | Bieżący materiał szkolny i sprawdziany; `/jablonna/angielski` zostaje stroną szkoły językowej |
| `/jablonna/angielski-dla-dzieci` | angielski dla dzieci Legionowo | 6-12 lat, nauka przez mówienie, grupy popołudniowe |
| `/jablonna/angielski-dla-doroslych` | angielski dla dorosłych Legionowo | Wieczorami do 20:00, od zera, powrót do języka, praca |
| `/jablonna/korepetycje-dla-liceum` | korepetycje liceum Legionowo | Dla uczniów LO i technikum: kilka przedmiotów u jednego dostawcy |

Po tej fali `/jablonna/angielski` linkuje do stron dla dzieci i dorosłych zamiast kotwic `#dzieci` i `#dorosli`.

## Fala 2: kursy egzaminacyjne per przedmiot (7 stron)

| Adres | Fraza główna |
|---|---|
| `/jablonna/kurs-e8-matematyka` | kurs ósmoklasisty matematyka Legionowo |
| `/jablonna/kurs-e8-polski` | kurs ósmoklasisty polski Legionowo |
| `/jablonna/kurs-e8-angielski` | kurs ósmoklasisty angielski Legionowo |
| `/jablonna/kurs-maturalny-matematyka` | kurs maturalny matematyka Legionowo |
| `/jablonna/kurs-maturalny-matematyka-rozszerzona` | matura rozszerzona matematyka Legionowo |
| `/jablonna/kurs-maturalny-polski` | kurs maturalny polski Legionowo |
| `/jablonna/kurs-maturalny-angielski` | kurs maturalny angielski Legionowo |

`/jablonna/egzamin-osmoklasisty` i `/jablonna/kurs-maturalny` stają się hubami tych stron.
Unikalna treść: dzień i godzina grupy w Jabłonnie, liczba wolnych miejsc, typy zadań z arkuszy CKE.

## Fala 3: pozostałe przedmioty, tylko indywidualnie (6 stron)

`/jablonna/korepetycje-biologia`, `-chemia`, `-fizyka`, `-geografia`, `-historia`, `-wos`.
Fraza: „korepetycje z X Legionowo”. Akcent na rozszerzenie maturalne i konkretne działy.
Fizyki i historii nie ma w Wyszkowie, więc to nowe frazy dla całego serwisu.
**Warunek:** właściciel potwierdza, że ma prowadzących dla każdego przedmiotu w Jabłonnie.

## Fala 4: strony zaufania i decyzji (5 stron)

| Adres | Po co | Czego potrzeba od właściciela |
|---|---|---|
| `/jablonna/cennik` | „korepetycje Legionowo cena” | Ceny wg formy: indywidualnie, w dwójce, w grupie |
| `/jablonna/opinie` | Dowód społeczny lokalnie | Prawdziwe opinie rodziców z Jabłonny (z Profilu Firmy w Google) |
| `/jablonna/nauczyciele` | Zaufanie, E-E-A-T | Imiona, przedmioty, doświadczenie, zdjęcia (za zgodą) |
| `/jablonna/dojazd` | Dojazd z Legionowa, Chotomowa, Wieliszewa, Nieporętu, Nowego Dworu | Potwierdzenie: parking, przystanki, czasy dojazdu |
| `/jablonna/wolne-terminy` | Konwersja | Grafik wolnych okienek (można zasilać z kalendarza) |

## Fala 5: treści lokalne na blogu (6 wpisów)

| Wpis | Fraza | Źródło danych |
|---|---|---|
| Progi punktowe liceów w Legionowie 2026 | progi punktowe Legionowo | Komunikaty szkół / starostwa legionowskiego |
| Szkoły średnie w Legionowie - przegląd dla ósmoklasisty | licea Legionowo | Strony szkół (profile klas) |
| Rekrutacja do szkół średnich 2027 na Mazowszu - terminy | rekrutacja 2027 mazowieckie | Zarządzenie Mazowieckiego Kuratora Oświaty |
| Wyniki egzaminu ósmoklasisty w powiecie legionowskim | wyniki E8 powiat legionowski | OKE Warszawa |
| Wyniki matur w szkołach Legionowa | matura Legionowo wyniki | OKE Warszawa / ranking szkół |
| Ile punktów trzeba na liceum w Legionowie - kalkulator | kalkulator punktów rekrutacja | Przelicznik z rozporządzenia (już jest na `/jablonna/egzamin-osmoklasisty`) |

Te wpisy przyciągają rodziców ósmoklasistów z powiatu, a stamtąd linkujemy do kursów E8 i maturalnych.
Dane z ostatniego rocznika, z podanym źródłem i datą.

## Podsumowanie

| Fala | Stron | Warunek startu |
|---|---|---|
| 1 | 5 | Brak, wszystkie fakty już są |
| 2 | 7 | Dni i godziny grup w Jabłonnie |
| 3 | 6 | Potwierdzenie prowadzących |
| 4 | 5 | Ceny, opinie, nauczyciele |
| 5 | 6 | Brak, dane publiczne |
| **Razem** | **29** | Jabłonna: 6 → 35 stron |

Do tego w każdej fali: wpisy w `sitemap.xml` i `seo-intent-map.json`, linki z hubów i stopki,
blok „Mieszkasz w Legionowie?” na odpowiedniku w Wyszkowie, przekierowania starych slugów w `vercel.json`.
