/*
 * Wspólne zakończenie wysyłki leada dla całego serwisu.
 * Jedno miejsce, w którym:
 *   1) po zgodzie marketingowej zapamiętujemy gclid/fbclid/utm na 90 dni
 *      (także gdy formularz jest na innej stronie niż strona wejścia),
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
 * Meta Lead odpala się WYŁĄCZNIE tutaj i WYŁĄCZNIE po zgodzie marketingowej.
 * Strona /dziekujemy nie może odpalać drugiego fbq('track','Lead') -
 * podwoiłaby leady w Menedżerze zdarzeń.
 */
(function () {
  'use strict';

  var ATTR_KEYS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var STORE_KEY = 'bm_attr';
  var TTL_MS = 90 * 24 * 60 * 60 * 1000; // okno atrybucji Google/Meta
  var CAPI_URL = '/api/meta-lead';

  function marketingAllowed() {
    return !!(window.BMConsent && window.BMConsent.allows('marketing'));
  }

  function readStore() {
    if (!marketingAllowed()) return {};
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
    if (!marketingAllowed()) return;
    var raw = JSON.stringify(store);
    try { localStorage.setItem(STORE_KEY, raw); } catch (e) { /* tryb prywatny */ }
    try { sessionStorage.setItem(STORE_KEY, raw); } catch (e) { /* j.w. */ }
  }

  function clearStore() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* tryb prywatny */ }
    try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* j.w. */ }
  }

  // Pusta wartość nigdy nie nadpisuje zapamiętanej: wejście z linku bez utm
  // nie może skasować atrybucji z kliknięcia w reklamę sprzed kilku dni.
  function capture() {
    if (!marketingAllowed()) return {};
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

  var attribution = {};
  function setAttribution(next) {
    Object.keys(attribution).forEach(function (key) { delete attribution[key]; });
    Object.keys(next || {}).forEach(function (key) { attribution[key] = next[key]; });
  }
  setAttribution(capture());

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
    if (!marketingAllowed()) return fields;
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
      // przechwytywania, zanim handler formularza zbierze dane. Przy okazji
      // zapamiętujemy formularz, żeby complete() znało jego form_id i typ.
      form.addEventListener('submit', function () {
        idField.value = eventId();
        pendingForm = form;
      }, true);
    });
  }

  function removeAttributionFields() {
    var names = ATTR_KEYS.concat(['landing_page', 'fbp', 'fbc']);
    document.querySelectorAll('form').forEach(function (form) {
      names.forEach(function (name) {
        var field = form.querySelector('input[name="' + name + '"]');
        if (field && field.type === 'hidden') field.remove();
      });
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

    // Zgłoszenie nadal trafia do arkusza, ale Meta Pixel i CAPI są opcjonalnym
    // marketingiem i nie mogą dostać danych bez świadomej zgody użytkownika.
    if (!marketingAllowed()) {
      pendingEventId = '';
      return;
    }

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

  // Jedno zdarzenie leada w całym serwisie: generate_lead. Parametry są
  // opisowe (przedmiot, lokalizacja, typ) i nie zawierają identyfikatorów
  // reklamowych ani danych osobowych, więc leci zawsze - także bez zgody
  // marketingowej. Consent Mode sam decyduje, czy ping będzie z cookies.
  var FORM_ID_BY_SLUG = {
    'index': 'hero',
    'zapisz-sie': 'zapisz-sie',
    'jablonna': 'hub-jablonna',
    'jablonna/angielski': 'jablonna-angielski',
    'jablonna/kursy-maturalne-e8': 'jablonna-kursy',
    'diagnoza': 'diagnoza',
    'kursy-maturalne': 'kursy-maturalne',
    'kursy-egzamin-osmoklasisty': 'kursy-e8',
    'korepetycje-matematyka': 'korepetycje-matma',
    'korepetycje-online': 'online'
  };

  var pendingForm = null;

  function formId() {
    if (pendingForm && pendingForm.dataset && pendingForm.dataset.formId) {
      return pendingForm.dataset.formId;
    }
    return FORM_ID_BY_SLUG[slug()] || slug();
  }

  // Cztery wartości, o które prosi raportowanie: kurs / korepetycje /
  // angielski / diagnoza. Strona i przedmiot wystarczą, żeby je rozstrzygnąć.
  function typ(payload) {
    if (pendingForm && pendingForm.dataset && pendingForm.dataset.typ) {
      return pendingForm.dataset.typ;
    }
    var path = slug();
    var subject = String(payload.przedmiot || payload.subject || '').toLowerCase();
    if (path.indexOf('diagnoza') > -1) return 'diagnoza';
    if (path.indexOf('kurs') > -1) return 'kurs';
    if (subject.indexOf('angielski') > -1 || path.indexOf('angielski') > -1) return 'angielski';
    return 'korepetycje';
  }

  // Formularze podają lokalizację w kilku wariantach („Jabłonna – Legionowo",
  // „Do ustalenia"); raport chce czterech stałych wartości.
  function lokalizacja(payload) {
    var value = String(payload.lokalizacja || payload.location || '').toLowerCase();
    if (value.indexOf('jabłonn') > -1 || value.indexOf('jablonn') > -1 || value.indexOf('legionow') > -1) return 'Jabłonna';
    if (value.indexOf('wyszk') > -1) return 'Wyszków';
    if (value.indexOf('online') > -1) return 'Online';
    return 'Do ustalenia';
  }

  function complete(payload, formLocation) {
    payload = payload || {};
    fireLead(payload);

    var params = {
      form_id: formId(),
      lokalizacja: lokalizacja(payload),
      przedmiot: payload.przedmiot || payload.subject || '',
      typ: typ(payload)
    };
    // GA4 (i AW jako drugi cel konfiguracji gtag - tam to zwykłe zdarzenie,
    // nie konwersja; konwersję Ads odpala GTM na lead_form_success).
    try {
      if (typeof gtag === 'function') gtag('event', 'generate_lead', params);
    } catch (e) { console.error('[lead] generate_lead:', e && e.message); }

    window.dataLayer = window.dataLayer || [];
    // Ta sama nazwa w dataLayer, żeby dało się na niej oprzeć trigger w GTM.
    window.dataLayer.push({
      event: 'generate_lead',
      form_id: params.form_id,
      form_location: formLocation || slug(),
      lokalizacja: params.lokalizacja,
      przedmiot: params.przedmiot,
      typ: params.typ
    });
    pendingForm = null;
    var q = query();
    var target = '/dziekujemy' + (q ? '?' + q : '');

    // Redirect musi poczekać na tagi. Konwersja Google Ads wisi w GTM na
    // lead_form_success, wypchniętym chwilę wcześniej; przy natychmiastowym
    // window.location.assign() w tym samym takcie GTM może nie zdążyć jej
    // wysłać. eventCallback puszcza nas dalej, gdy tagi się wykonają,
    // a timer jest wyjściem awaryjnym, gdyby GTM nie wstał.
    var navigated = false;
    function go() {
      if (navigated) return;
      navigated = true;
      window.location.assign(target);
    }
    window.dataLayer.push({ event: 'bm_lead_ready', eventCallback: go, eventTimeout: 1500 });
    setTimeout(go, 1600);
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

  window.addEventListener('bm:consent-updated', function (event) {
    if (event.detail && event.detail.marketing) {
      setAttribution(capture());
      decorateForms();
    } else {
      clearStore();
      setAttribution({});
      removeAttributionFields();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateForms);
  } else {
    decorateForms();
  }
})();
