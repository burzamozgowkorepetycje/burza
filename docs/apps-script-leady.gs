/**
 * Odbiornik leadów z formularzy strony -> arkusz "Burza Korepetycje".
 *
 * Wersja do wklejenia w edytorze Apps Script (Rozszerzenia -> Apps Script)
 * i wdrożenia jako aplikacja internetowa. Trzymamy ją w repo, żeby nie była
 * jedyną kopią w chmurze.
 *
 * Różnica wobec poprzedniej wersji: wiersz jest budowany według NAZW kolumn
 * z nagłówka arkusza, a nie według kolejności kluczy w JSON-ie. Dzięki temu
 * dodanie pola w dowolnym formularzu nigdy nie przesunie istniejących kolumn
 * (to był powód rozjechanych wierszy z 08-11.08.2026).
 *
 * Wdrożenie: Wdróż -> Nowe wdrożenie -> Aplikacja internetowa,
 * "Wykonaj jako: ja", "Kto ma dostęp: wszyscy". Adres /exec musi zostać ten
 * sam co w LEADS_URL w /assets/shared.js - inaczej podmień go też na stronie.
 */

var SHEET_ID = '1loFevb1dLn9bJx7mVy2ehWQ70GZUMgKFdJHi_SRw3Fk';
var SHEET_NAME = '';        // pusty = pierwsza zakładka
var HEADER_SEARCH_ROWS = 5; // w ilu pierwszych wierszach szukać nagłówka

// Klucz z JSON-a -> nagłówek kolumny w arkuszu.
// Ta lista musi się zgadzać z LEAD_FIELDS w /assets/shared.js.
var FIELD_TO_HEADER = {
  imie:         'Imię',
  email:        'E-mail',
  telefon:      'Telefon',
  klasa:        'Klasa',
  etap:         'Etap',
  typEgzaminu:  'Typ egzaminu',
  przedmiot:    'Przedmiot',
  poziom:       'Poziom',
  cel:          'Cel',
  pilnosc:      'Pilność',
  forma:        'Forma',
  zgodaTelefon: 'Zgoda tel.',
  zgodaEmail:   'Zgoda e-mail',
  wiadomosc:    'Wiadomość',
  zrodlo:       'Źródło',
  data:         'Data'
};

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // dwa zgłoszenia w tej samej sekundzie nie nadpiszą się
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    var header = getHeader(sheet);

    // Kolumny, których jeszcze nie ma w nagłówku, dopisujemy na końcu -
    // nowe pole w formularzu nie wymaga ręcznej zmiany w arkuszu.
    Object.keys(FIELD_TO_HEADER).forEach(function (field) {
      var name = FIELD_TO_HEADER[field];
      if (header.names.indexOf(name) === -1) {
        header.names.push(name);
        sheet.getRange(header.row, header.names.length).setValue(name);
      }
    });

    var row = header.names.map(function (name) {
      var field = headerToField(name);
      if (!field) return '';                       // kolumna własna, np. notatki - nie ruszamy
      var value = payload[field];
      if (value === undefined || value === null) return '';
      if (typeof value === 'boolean') return value ? 'tak' : 'nie';
      return String(value);
    });

    sheet.appendRow(row);
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
  var file = SpreadsheetApp.openById(SHEET_ID);
  return SHEET_NAME ? file.getSheetByName(SHEET_NAME) : file.getSheets()[0];
}

function getHeader(sheet) {
  var rows = sheet.getRange(1, 1, HEADER_SEARCH_ROWS, sheet.getMaxColumns()).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].indexOf(FIELD_TO_HEADER.imie) !== -1) {
      var names = rows[i].map(function (cell) { return String(cell).trim(); });
      while (names.length && !names[names.length - 1]) names.pop(); // utnij puste z prawej
      return { row: i + 1, names: names };
    }
  }
  throw new Error('Nie znalazlem wiersza naglowka (brak kolumny "' + FIELD_TO_HEADER.imie + '")');
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

/** Uruchom raz z edytora, żeby sprawdzić dopasowanie kolumn bez wysyłki z formularza. */
function testDopasowanieKolumn() {
  var header = getHeader(getSheet());
  var nieznane = header.names.filter(function (n) { return n && !headerToField(n); });
  console.log('Wiersz naglowka: ' + header.row);
  console.log('Kolumny: ' + header.names.join(' | '));
  console.log('Kolumny spoza szablonu (zostana puste): ' + (nieznane.join(', ') || 'brak'));
}
