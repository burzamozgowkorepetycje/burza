# Burza Mózgów Korepetycje — Wyszków

Strona internetowa centrum korepetycji **Burza Mózgów** w Wyszkowie.
Kursy maturalne i przygotowanie do egzaminu ósmoklasisty.

## Typ projektu

Statyczna strona HTML z podstronami i wspólnymi komponentami w `partials/`
oraz `assets/`. Build działa w czystym Node i nie ma zależności npm.

## Podgląd lokalny

```bash
npm install        # nic nie instaluje (brak zależności)
npm run dev        # uruchamia lokalny serwer na http://localhost:3000
```

lub po prostu otwórz `index.html` w przeglądarce.

## Build

```bash
npm run build      # synchronizuje wspólny tracking, favicon, zgody i komponenty
```

## Deployment

Hostowana na [Vercel](https://vercel.com) jako strona statyczna.
Konfiguracja w `vercel.json` (framework: brak, katalog wyjściowy: `.`).
Każdy `git push` na gałąź `main` automatycznie aktualizuje stronę.

## Pomiar leadów (Meta CAPI + atrybucja)

Cała logika siedzi w `assets/lead-flow.js` (front) i `api/meta-lead.js` (serwer).
Przy wysyłce formularza powstaje jeden `event_id`, który idzie równolegle do:
piksela (`fbq('track','Lead', …, {eventID})`), Conversions API i arkusza leadów.
Meta łączy oba źródła w jedno zdarzenie — dlatego **`/dziekujemy` nie może
odpalać drugiego `fbq('track','Lead')`**.

Po zgodzie marketingowej `gclid`, `fbclid` i `utm_*` zapamiętujemy na 90 dni
w `localStorage`, dokładamy
do każdego formularza jako pola ukryte i do payloadu leada — trafiają do arkusza
(kolumna zbiorcza `gclid / fbclid`), co pozwala importować konwersje offline
do Google Ads i Meta. Nagłówki arkusza dopisuje sam `docs/apps-script-leady.gs`
(po zmianie trzeba wdrożyć nową wersję skryptu: Wdróż → Zarządzaj wdrożeniami).

Zmienne środowiskowe na Vercelu (Project → Settings → Environment Variables):

| Zmienna | Skąd | Uwagi |
| --- | --- | --- |
| `META_PIXEL_ID` | Events Manager → piksel → Ustawienia | ten sam numer co w `partials/tracking-head.html` |
| `META_CAPI_TOKEN` | Events Manager → Conversions API → „Wygeneruj token dostępu" | **nigdy w repo** |
| `META_TEST_EVENT_CODE` | Events Manager → „Testuj zdarzenia" | tylko na czas testu, potem usunąć |

Bez tych zmiennych strona działa normalnie — endpoint tylko loguje pominięcie.

## Zgody i Consent Mode v2

`partials/tracking-head.html` ustawia wszystkie zgody analityczne i reklamowe
na `denied` przed załadowaniem Google tag i GTM. Interfejs zgód znajduje się
w `assets/consent.js` i `assets/consent.css`. Meta Pixel, Meta CAPI oraz trwała
atrybucja kampanii uruchamiają się wyłącznie po zgodzie marketingowej.

Zmiana w partialu jest propagowana na wszystkie publiczne dokumenty przez
`npm run build`. Nie należy dodawać osobnych skryptów GA, GTM lub Meta bezpośrednio
do pojedynczych plików HTML.

Test: wejdź na `/jablonna?utm_source=test&gclid=TEST123&fbclid=TEST456`, wyślij
formularz i sprawdź w „Testuj zdarzenia", czy jest **jedno** zdarzenie Lead
z dwoma źródłami (Przeglądarka + Serwer) i statusem „Zdeduplikowano".
