/**
 * Odbiornik leadów z formularzy strony -> arkusz "Burza Korepetycje".
 *
 * Kopia kodu, który jest wdrożony w projekcie Apps Script przypiętym do
 * arkusza (Rozszerzenia -> Apps Script). Trzymamy ją w repo, żeby nie była
 * jedyną kopią w chmurze. Poprzednia wersja: apps-script-leady-POPRZEDNIA-WERSJA.gs
 *
 * Zmiana wobec poprzedniej: wiersz jest budowany według NAZW kolumn z nagłówka
 * arkusza, a nie jako sztywne 8 pozycji od kolumny A. Dzięki temu dodanie pola
 * w formularzu nie przesuwa kolumn ani nie gubi danych - brakujące nagłówki
 * skrypt dopisuje sam.
 *
 * Wdrożenie zmian: Wdróż -> Zarządzaj wdrożeniami -> ołówek -> Wersja: Nowa.
 * Adres /exec musi zostać ten sam, bo jest wpisany w /assets/shared.js.
 */

// Klucz z JSON-a -> nagłówek kolumny w arkuszu.
// Ta lista musi się zgadzać z LEAD_FIELDS w /assets/shared.js.
var FIELD_TO_HEADER = {
  imie:         'Imię',
  telefon:      'Telefon',
  przedmiot:    'Przedmiot',
  forma:        'Forma',
  lokalizacja:  'Lokalizacja',
  wiadomosc:    'Wiadomość',
  data:         'Data',
  klasa:        'Klasa',
  etap:         'Etap',
  email:        'E-mail',
  typEgzaminu:  'Typ egzaminu',
  poziom:       'Poziom',
  cel:          'Cel',
  pilnosc:      'Pilność',
  zgodaTelefon: 'Zgoda tel.',
  zgodaEmail:   'Zgoda e-mail',
  zrodlo:       'Źródło'
};

// Kolumny prowadzone ręcznie - skrypt ich nie dotyka przy dopisywaniu leada.
var KOLUMNY_RECZNE = ['Notatki'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // dwa zgłoszenia w tej samej sekundzie nie nadpiszą się
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    var header = getHeader(sheet);

    dopiszBrakujaceNaglowki(sheet, header);

    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 2).setNumberFormat('@'); // telefon jako tekst, nie formuła

    var values = header.names.map(function (name) {
      var field = headerToField(name);
      if (!field) return '';
      var value = payload[field];
      if (value === undefined || value === null) return '';
      if (typeof value === 'boolean') return value ? 'tak' : 'nie';
      return String(value);
    });

    sheet.getRange(row, 1, 1, values.length).setValues([values]);
    return ok('OK');
  } catch (err) {
    // Front rozpoznaje sukces po prefiksie "OK", więc błąd musi wyglądać inaczej.
    console.error(err);
    return ok('ERROR ' + err);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ok('OK - endpoint dziala, leady przyjmuje tylko POST');
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function getHeader(sheet) {
  var rows = sheet.getRange(1, 1, 5, sheet.getMaxColumns()).getValues();
  for (var i = 0; i < rows.length; i++) {
    var names = rows[i].map(function (cell) { return String(cell).trim(); });
    if (names.indexOf(FIELD_TO_HEADER.imie) !== -1) {
      while (names.length && !names[names.length - 1]) names.pop();
      return { row: i + 1, names: names };
    }
  }
  throw new Error('Nie znalazlem wiersza naglowka (brak kolumny ' + FIELD_TO_HEADER.imie + ')');
}

function dopiszBrakujaceNaglowki(sheet, header) {
  Object.keys(FIELD_TO_HEADER).forEach(function (field) {
    var name = FIELD_TO_HEADER[field];
    if (header.names.indexOf(name) === -1) {
      header.names.push(name);
      sheet.getRange(header.row, header.names.length).setValue(name);
    }
  });
}

function headerToField(name) {
  var found = '';
  Object.keys(FIELD_TO_HEADER).forEach(function (field) {
    if (FIELD_TO_HEADER[field] === name) found = field;
  });
  return found;
}

function ok(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

/* ── Funkcje jednorazowe, uruchamiane ręcznie z edytora ────────────────────
   Zostawione w pliku jako ślad tego, co zrobiono z danymi 11.08.2026.
   Są idempotentne - drugie uruchomienie nic już nie zmieni.               */

/**
 * Wiersze sprzed 08.08.2026 zapisała starsza wersja skryptu, która wstawiała
 * datę do kolumny G zamiast F. Przesuwa je o jedną kolumnę w lewo (G:J -> F:I),
 * żeby cały arkusz miał jeden układ. Rozpoznaje je po pustym F i niepustym G.
 */
function migracja1_wyrownajStareWiersze() {
  var sheet = getSheet();
  var last = sheet.getLastRow();
  var range = sheet.getRange(2, 6, last - 1, 5); // F:J
  var values = range.getValues();
  var przesuniete = 0;

  var out = values.map(function (r) {
    var pusteF = String(r[0]).trim() === '';
    var jestG = String(r[1]).trim() !== '';
    if (pusteF && jestG) {
      przesuniete++;
      return [r[1], r[2], r[3], r[4], ''];
    }
    return r;
  });

  range.setValues(out);
  console.log('Przesunietych wierszy: ' + przesuniete);
}

/** Ustawia nagłówki zgodne z FIELD_TO_HEADER + kolumną ręczną na Notatki. */
function migracja2_ustawNaglowki() {
  var sheet = getSheet();
  var docelowe = [
    'Imię', 'Telefon', 'Przedmiot', 'Forma', 'Wiadomość', 'Data',
    'Klasa', 'Etap', 'Notatki'
  ];
  sheet.getRange(1, 1, 1, docelowe.length).setValues([docelowe]);
  dopiszBrakujaceNaglowki(sheet, getHeader(sheet));
  console.log('Naglowki: ' + getHeader(sheet).names.join(' | '));
}

/**
 * Po migracji 1 stare daty trafiły do kolumny F z formatem "tylko dzień".
 * Godzina w wartości została - to kwestia wyświetlania. Wymusza pełny format.
 */
function migracja4_formatujKolumneData() {
  var sheet = getSheet();
  var kolumna = getHeader(sheet).names.indexOf('Data') + 1;
  sheet.getRange(2, kolumna, sheet.getMaxRows() - 1, 1).setNumberFormat('dd.MM.yyyy, HH:mm:ss');
  console.log('Sformatowano kolumne nr ' + kolumna);
}

/** Usuwa wiersze testowe oznaczone w treści jako do usunięcia. */
function migracja3_usunWierszeTestowe() {
  var sheet = getSheet();
  var values = sheet.getRange(1, 1, sheet.getLastRow(), 5).getValues();
  var usuniete = 0;

  for (var i = values.length - 1; i >= 1; i--) {
    var wiersz = values[i].join(' ').toLowerCase();
    if (wiersz.indexOf('prosze usunac') !== -1 || wiersz.indexOf('proszę usunąć') !== -1) {
      sheet.deleteRow(i + 1);
      usuniete++;
    }
  }
  console.log('Usunietych wierszy testowych: ' + usuniete);
}
