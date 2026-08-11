/**
 * ARCHIWUM - kod, który działał w projekcie Apps Script do 11.08.2026.
 * Zapisany przed podmianą, żeby dało się wrócić. Nie wdrażać.
 *
 * Problem: wiersz był budowany jako 8 sztywnych pozycji od kolumny A.
 * Pola, których tu nie ma (email, poziom, cel, pilnosc, typEgzaminu, zrodlo,
 * zgody), były po cichu wyrzucane - formularz je wysyłał, arkusz ich nie
 * zapisywał. Nagłówek arkusza opisywał jeszcze starszy układ, przez co
 * kolumny od F w prawo były opisane o jedną za daleko.
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const row = sheet.getLastRow() + 1;

  // Kolumna B (telefon) jako tekst — żeby "+48 111 111 111" nie stało się formułą
  sheet.getRange(row, 2).setNumberFormat('@');

  sheet.getRange(row, 1, 1, 8).setValues([[
    data.imie,
    data.telefon,
    data.przedmiot,
    data.forma,
    data.wiadomosc,
    data.data,
    data.klasa || '',   // G — konkretna klasa (np. "Klasa 6")
    data.etap || ''     // H — etap nauki (np. "Klasa 4-8", "Liceum")
  ]]);

  return ContentService.createTextOutput('OK');
}
