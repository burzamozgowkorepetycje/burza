/*
 * Wspólne zakończenie wysyłki leada dla całego serwisu.
 * Jedno miejsce, w którym:
 *   1) zapamiętujemy gclid/utm na czas całej sesji (także gdy formularz jest
 *      na innej stronie niż ta, na którą trafiła reklama),
 *   2) dokładamy te parametry do każdego formularza jako pola ukryte,
 *   3) wypychamy do dataLayer zdarzenie lead_form_submit,
 *   4) przekierowujemy na /dziekujemy — to tam GTM odpala konwersję Google Ads
 *      i kluczowe zdarzenie GA4 (reguła na URL), więc redirect jest warunkiem
 *      mierzenia kampanii, a nie kosmetyką.
 *
 * Ładowany na każdej stronie z formularzem, przed /assets/shared.js.
 * Wywoływany z jednego punktu: Shared.sendLead (podstrony) i window.postLead
 * (index.html, korepetycje-online.html, zapisz-sie.html).
 */
(function () {
  'use strict';

  var ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORE_KEY = 'bm_attr';

  function readStore() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; }
  }

  function capture() {
    var store = readStore();
    try {
      var params = new URLSearchParams(window.location.search);
      var changed = false;
      ATTR_KEYS.forEach(function (key) {
        var value = params.get(key);
        if (value) { store[key] = value; changed = true; }
      });
      if (changed) sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) { /* prywatne okno / brak sessionStorage - lead i tak przechodzi */ }
    return store;
  }

  var attribution = capture();

  function query() {
    return Object.keys(attribution).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(attribution[key]);
    }).join('&');
  }

  // Slug strony, z której wyszedł lead - trafia do dataLayer jako form_location.
  function slug() {
    var path = window.location.pathname.replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
    return path || 'index';
  }

  // Atrybucja dojeżdża też do arkusza z leadami, nie tylko do GTM.
  function decorateForms() {
    var keys = Object.keys(attribution);
    if (!keys.length) return;
    document.querySelectorAll('form').forEach(function (form) {
      keys.forEach(function (key) {
        if (form.querySelector('input[name="' + key + '"]')) return;
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = attribution[key];
        form.appendChild(input);
      });
    });
  }

  function complete(payload, formLocation) {
    payload = payload || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'lead_form_submit',
      form_location: formLocation || slug(),
      subject: payload.przedmiot || payload.subject || '',
      location: payload.lokalizacja || payload.location || ''
    });
    var q = query();
    window.location.assign('/dziekujemy' + (q ? '?' + q : ''));
    // Nawigacja już trwa. Obietnica, która nigdy się nie rozwiązuje, zostawia
    // przycisk w stanie „Wysyłanie…" - zamiast mignąć komunikatem inline,
    // którego i tak nikt nie zdąży przeczytać przed przeładowaniem strony.
    return new Promise(function () {});
  }

  window.LeadFlow = {
    complete: complete,
    attribution: attribution,
    query: query,
    slug: slug
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateForms);
  } else {
    decorateForms();
  }
})();
