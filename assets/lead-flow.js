/*
 * Wspólne zakończenie wysyłki leada dla całego serwisu.
 * Jedno miejsce, w którym:
 *   1) zapamiętujemy gclid/fbclid/utm na 90 dni (także gdy formularz jest
 *      na innej stronie niż ta, na którą trafiła reklama),
 *   2) dokładamy te parametry do każdego formularza jako pola ukryte
 *      i do payloadu leada (LeadFlow.enrich) - stąd trafiają do arkusza,
 *   3) odpalamy Meta Lead: piksel w przeglądarce + Conversions API
 *      (/api/meta-lead) z tym samym event_id, żeby Meta zdeduplikowała
 *      oba źródła w jedno zdarzenie,
 *   4) wypychamy do dataLayer zdarzenie lead_form_submit,
 *   5) przekierowujemy na /dziekujemy — to tam GTM odpala konwersję Google Ads
 *      i kluczowe zdarzenie GA4 (reguła na URL), więc redirect jest warunkiem
 *      mierzenia kampanii, a nie kosmetyką.
 *
 * Ładowany na każdej stronie z formularzem, przed /assets/shared.js.
 * Wywoływany z jednego punktu: Shared.sendLead (podstrony) i window.postLead
 * (index.html, korepetycje-online.html, zapisz-sie.html).
 *
 * Meta Lead odpala się WYŁĄCZNIE tutaj. Strona /dziekujemy nie może odpalać
 * drugiego fbq('track','Lead') - podwoiłaby leady w Menedżerze zdarzeń.
 */
(function () {
  'use strict';

  var ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORE_KEY = 'bm_attr';
  var TTL_MS = 90 * 24 * 60 * 60 * 1000; // okno atrybucji Google/Meta
  var CAPI_URL = '/api/meta-lead';

  function readStore() {
    var raw = null;
    try { raw = localStorage.getItem(STORE_KEY); } catch (e) { /* tryb prywatny */ }
    if (!raw) {
      try { raw = sessionStorage.getItem(STORE_KEY); } catch (e) { /* j.w. */ }
    }
    try {
      var parsed = JSON.parse(raw || '{}');
      // Format sprzed wersji z TTL: płaski obiekt z kluczami atrybucji.
      if (!parsed || typeof parsed !== 'object') return {};
      if (!parsed.data) return { ts: Date.now(), data: parsed };
      if (parsed.ts && Date.now() - parsed.ts > TTL_MS) return {};
      return parsed;
    } catch (e) { return {}; }
  }

  function writeStore(store) {
    var raw = JSON.stringify(store);
    try { localStorage.setItem(STORE_KEY, raw); } catch (e) { /* tryb prywatny */ }
    try { sessionStorage.setItem(STORE_KEY, raw); } catch (e) { /* j.w. */ }
  }

  // Pusta wartość nigdy nie nadpisuje zapamiętanej: wejście z linku bez utm
  // nie może skasować atrybucji z kliknięcia w reklamę sprzed kilku dni.
  function capture() {
    var store = readStore();
    var data = store.data || {};
    try {
      var params = new URLSearchParams(window.location.search);
      var changed = false;
      ATTR_KEYS.forEach(function (key) {
        var value = params.get(key);
        if (value) { data[key] = value; changed = true; }
      });
      if (!data.landing_page) {
        data.landing_page = window.location.href.split('#')[0];
        changed = true;
      }
      if (changed) writeStore({ ts: store.ts || Date.now(), data: data });
    } catch (e) { /* brak storage - lead i tak przechodzi */ }
    return data;
  }

  var attribution = capture();

  function cookie(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : '';
  }

  function fbp() { return cookie('_fbp'); }

  // Gdy piksel nie zdążył ustawić _fbc (albo go zablokowano), a w URL było
  // fbclid, budujemy wartość w formacie wymaganym przez Meta.
  function fbc() {
    var value = cookie('_fbc');
    if (value) return value;
    var clickId = attribution.fbclid;
    return clickId ? 'fb.1.' + Date.now() + '.' + clickId : '';
  }

  function uuid() {
    try {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) { /* starsza przeglądarka */ }
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  // Jeden identyfikator na jedno zgłoszenie: ten sam trafia do piksela,
  // do CAPI i do arkusza. Bez tego Meta policzyłaby lead dwa razy.
  var pendingEventId = '';
  function eventId() {
    if (!pendingEventId) pendingEventId = 'lead_' + uuid();
    return pendingEventId;
  }

  function query() {
    return ATTR_KEYS.filter(function (key) { return attribution[key]; })
      .map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(attribution[key]);
      }).join('&');
  }

  // Slug strony, z której wyszedł lead - trafia do dataLayer jako form_location.
  function slug() {
    var path = window.location.pathname.replace(/\.html$/, '').replace(/^\/+|\/+$/g, '');
    return path || 'index';
  }

  // Atrybucja dojeżdża do arkusza razem z leadem (klucze spoza LEAD_FIELDS
  // Apps Script dokleja na końcu wiersza, po nazwach kolumn).
  function enrich(payload) {
    var out = {};
    Object.keys(payload || {}).forEach(function (key) { out[key] = payload[key]; });
    ATTR_KEYS.forEach(function (key) { out[key] = attribution[key] || ''; });
    out.landing_page = attribution.landing_page || '';
    out.event_id = eventId();
    // Jedna kolumna „gclid / fbclid" w arkuszu: Google ma pierwszeństwo.
    out.klik = attribution.gclid || attribution.fbclid || '';
    return out;
  }

  function hiddenFields() {
    var fields = {};
    ATTR_KEYS.forEach(function (key) { if (attribution[key]) fields[key] = attribution[key]; });
    if (attribution.landing_page) fields.landing_page = attribution.landing_page;
    var browserId = fbp();
    var clickCookie = fbc();
    if (browserId) fields.fbp = browserId;
    if (clickCookie) fields.fbc = clickCookie;
    return fields;
  }

  function decorateForms() {
    var fields = hiddenFields();
    document.querySelectorAll('form').forEach(function (form) {
      Object.keys(fields).forEach(function (key) {
        if (form.querySelector('input[name="' + key + '"]')) return;
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });
      if (form.querySelector('input[name="event_id"]')) return;
      var idField = document.createElement('input');
      idField.type = 'hidden';
      idField.name = 'event_id';
      form.appendChild(idField);
      // event_id powstaje dopiero przy wysyłce - wpisujemy go w fazie
      // przechwytywania, zanim handler formularza zbierze dane.
      form.addEventListener('submit', function () { idField.value = eventId(); }, true);
    });
  }

  var sent = {};

  // Piksel + CAPI, oba z tym samym event_id. keepalive, bo zaraz po tym
  // startuje redirect na /dziekujemy i zwykły fetch zostałby ubity.
  function fireLead(payload) {
    payload = payload || {};
    var id = eventId();
    if (sent[id]) return;
    sent[id] = true;

    var category = attribution.utm_content || 'brak';
    try {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', { content_name: 'formularz', content_category: category }, { eventID: id });
      }
    } catch (e) { console.error('[lead] piksel:', e && e.message); }

    try {
      fetch(CAPI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event_id: id,
          event_source_url: window.location.href.split('#')[0],
          imie: payload.imie || '',
          email: payload.email || '',
          telefon: payload.telefon || '',
          fbp: fbp(),
          fbc: fbc(),
          utm_source: attribution.utm_source || '',
          utm_content: attribution.utm_content || ''
        })
      }).catch(function (err) {
        // Konwersja serwerowa nie może wywrócić wysyłki formularza.
        console.error('[lead] capi:', err && err.message);
      });
    } catch (e) { console.error('[lead] capi:', e && e.message); }

    // Kolejne zgłoszenie z tej samej karty (gdy redirect nie zdążył się wykonać)
    // dostaje świeży identyfikator - inaczej Meta uznałaby je za duplikat.
    pendingEventId = '';
  }

  function complete(payload, formLocation) {
    payload = payload || {};
    fireLead(payload);
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
    fireLead: fireLead,
    enrich: enrich,
    eventId: eventId,
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
