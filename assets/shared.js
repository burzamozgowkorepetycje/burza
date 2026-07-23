/*
 * Wspólna logika dla podstron Burza Mózgów Korepetycje.
 * Jedno źródło prawdy dla: wysyłki leadów do Google Sheets, statusu formularza,
 * trackingu konwersji (Meta Pixel), obsługi FAQ, płynnego przewijania,
 * trackingu kliknięć w telefon oraz menu mobilnego.
 * Konfiguracja per-strona przez atrybuty data-* na <body>:
 *   data-zrodlo="Landing korepetycje biologia"   (etykieta źródła w arkuszu leadów)
 *   data-tel-source="subject_landing"            (etykieta źródła w evencie Contact)
 */
(function () {
  'use strict';

  var LEADS_URL = 'https://script.google.com/macros/s/AKfycbyAgf3UccAXC7QAohp3tZOb-px3c8bcm-YxRXVCvORw-YtW7Ui8XFkiTxPVXqAuQ_KcBg/exec';

  function zrodlo() {
    return document.body.dataset.zrodlo || document.title;
  }

  // Wysyłka w trybie cors (nie no-cors), bo endpoint Apps Script zwraca
  // Access-Control-Allow-Origin: * na obu hopach przekierowania. Dzięki temu
  // widzimy realny status odpowiedzi: przy padniętym backendzie formularz
  // pokaże błąd i numer telefonu, zamiast po cichu gubić zgłoszenie.
  // Content-Type text/plain jest na liście bezpiecznych, więc nie ma preflightu.
  var SEND_TIMEOUT_MS = 15000;

  async function sendLead(payload) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, SEND_TIMEOUT_MS) : null;

    try {
      var response = await fetch(LEADS_URL, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...payload, data: new Date().toLocaleString('pl-PL'), zrodlo: zrodlo() }),
        signal: controller ? controller.signal : undefined
      });

      if (!response.ok) throw new Error('Backend odpowiedział ' + response.status);

      var text = (await response.text()).trim();
      if (text.indexOf('OK') !== 0) throw new Error('Nieoczekiwana odpowiedź: ' + text.slice(0, 80));

      return text;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'form-status show ' + type;
  }

  function track(event, data) {
    if (typeof fbq !== 'undefined') fbq('track', event, data || {});
    if (typeof gtag !== 'undefined') gtag('event', event, data || {});
  }

  function initFaq() {
    document.querySelectorAll('.faq button').forEach(function (button) {
      button.addEventListener('click', function () {
        button.parentElement.classList.toggle('open');
      });
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      });
    });
  }

  function initTelTracking() {
    var source = document.body.dataset.telSource || 'unknown';
    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.addEventListener('click', function () {
        track('Contact', { contact_type: 'phone', source: source });
      });
    });
  }

  function closeMobileMenu() {
    var panel = document.getElementById('mobileMenu');
    var toggle = document.querySelector('.menu-toggle');
    if (!panel || !panel.classList.contains('open')) return;
    panel.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  var pageLoadTime = Date.now();

  // Podstawowa ochrona przed spamem (bez CAPTCHA): honeypot wstrzykiwany do każdego
  // formularza + minimalny czas od załadowania strony do wysyłki. Blokuje wysyłkę
  // (capture-phase na document, przed handlerem strony) bez żadnego dodatkowego
  // kroku dla prawdziwego użytkownika.
  function initSpamGuard() {
    document.querySelectorAll('form').forEach(function (form) {
      if (form.querySelector('.hp-field')) return;
      var hp = document.createElement('input');
      hp.type = 'text';
      hp.name = 'website';
      hp.autocomplete = 'off';
      hp.tabIndex = -1;
      hp.className = 'hp-field';
      hp.setAttribute('aria-hidden', 'true');
      hp.style.cssText = 'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';
      form.appendChild(hp);
    });
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      var hp = form.querySelector('.hp-field');
      var tooFast = Date.now() - pageLoadTime < 1500;
      if ((hp && hp.value) || tooFast) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  // Tracking mikro-etapów formularza (bez danych osobowych): rozpoczęcie wypełniania
  // (raz na formularz) oraz wybór przedmiotu/egzaminu w polach select.
  function initFormTracking() {
    document.querySelectorAll('form').forEach(function (form) {
      var started = false;
      form.addEventListener('focusin', function () {
        if (started) return;
        started = true;
        track('FormStart', { form: form.id || 'form' });
      });
      form.querySelectorAll('select[name="subject"], select[name="exam"]').forEach(function (select) {
        select.addEventListener('change', function () {
          if (!select.value) return;
          track('SelectContent', { content_type: select.name, value: select.value });
        });
      });
    });
  }

  function initStickyCta() {
    var bar = document.querySelector('.sticky-cta');
    var hero = document.querySelector('.hero');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.getElementById('mobileMenu');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMobileMenu();
    });
  }

  window.Shared = { sendLead: sendLead, showStatus: showStatus, track: track };

  document.addEventListener('DOMContentLoaded', function () {
    initFaq();
    initSmoothScroll();
    initTelTracking();
    initMobileMenu();
    initStickyCta();
    initSpamGuard();
    initFormTracking();
  });
})();
