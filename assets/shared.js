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

  async function sendLead(payload) {
    await fetch(LEADS_URL, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, data: new Date().toLocaleString('pl-PL'), zrodlo: zrodlo() })
    });
  }

  function showStatus(element, message, type) {
    element.textContent = message;
    element.className = 'form-status show ' + type;
  }

  function track(event, data) {
    if (typeof fbq !== 'undefined') fbq('track', event, data || {});
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
  });
})();
