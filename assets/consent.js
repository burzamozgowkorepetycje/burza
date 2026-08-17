(function () {
  'use strict';
  if (!window.BMConsent) return;

  var root = document.createElement('section');
  root.className = 'bm-consent';
  root.hidden = true;
  root.setAttribute('aria-label', 'Ustawienia prywatności');
  root.innerHTML =
    '<div class="bm-consent__panel" role="dialog" aria-modal="true" aria-labelledby="bm-consent-title">' +
      '<div data-bm-view="intro">' +
        '<h2 class="bm-consent__title" id="bm-consent-title">Twoja prywatność</h2>' +
        '<p class="bm-consent__copy">Niezbędne mechanizmy obsługują stronę i formularze. Za Twoją zgodą używamy także statystyk Google oraz narzędzi reklamowych Google i Meta. Szczegóły znajdziesz w <a href="/privacy-policy">polityce prywatności</a>.</p>' +
        '<div class="bm-consent__actions">' +
          '<button class="bm-consent__button bm-consent__button--primary" type="button" data-bm-action="accept">Akceptuję wszystkie</button>' +
          '<button class="bm-consent__button" type="button" data-bm-action="reject">Tylko niezbędne</button>' +
          '<button class="bm-consent__button" type="button" data-bm-action="preferences">Ustawienia</button>' +
        '</div>' +
      '</div>' +
      '<div data-bm-view="preferences" hidden>' +
        '<h2 class="bm-consent__title">Ustawienia prywatności</h2>' +
        '<p class="bm-consent__copy">Możesz zmienić tę decyzję w dowolnym momencie.</p>' +
        '<div class="bm-consent__preferences">' +
          '<label class="bm-consent__toggle"><strong>Niezbędne</strong><input type="checkbox" checked disabled><small>Zapamiętanie wyboru, bezpieczeństwo i działanie formularzy.</small></label>' +
          '<label class="bm-consent__toggle"><strong>Analityczne</strong><input type="checkbox" data-bm-consent="analytics"><small>Pomagają mierzyć korzystanie ze strony w Google Analytics 4.</small></label>' +
          '<label class="bm-consent__toggle"><strong>Marketingowe</strong><input type="checkbox" data-bm-consent="marketing"><small>Pomagają mierzyć reklamy Google i Meta oraz ich konwersje.</small></label>' +
        '</div>' +
        '<div class="bm-consent__actions">' +
          '<button class="bm-consent__button bm-consent__button--primary" type="button" data-bm-action="save">Zapisz wybór</button>' +
          '<button class="bm-consent__button" type="button" data-bm-action="back">Wróć</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  var settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'bm-consent-settings';
  settings.textContent = 'Ustawienia prywatności';
  settings.hidden = true;

  function view(name) {
    root.querySelector('[data-bm-view="intro"]').hidden = name !== 'intro';
    root.querySelector('[data-bm-view="preferences"]').hidden = name !== 'preferences';
  }

  function open(preferences) {
    var state = window.BMConsent.get();
    root.querySelector('[data-bm-consent="analytics"]').checked = state.analytics;
    root.querySelector('[data-bm-consent="marketing"]').checked = state.marketing;
    view(preferences ? 'preferences' : 'intro');
    root.hidden = false;
    settings.hidden = true;
    setTimeout(function () {
      var first = root.querySelector(preferences ? '[data-bm-action="save"]' : '[data-bm-action="accept"]');
      if (first) first.focus();
    }, 0);
  }

  function close() {
    root.hidden = true;
    settings.hidden = false;
  }

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-bm-action]');
    if (!button) return;
    var action = button.getAttribute('data-bm-action');
    if (action === 'accept') { window.BMConsent.acceptAll(); close(); }
    if (action === 'reject') { window.BMConsent.rejectAll(); close(); }
    if (action === 'preferences') open(true);
    if (action === 'back') view('intro');
    if (action === 'save') {
      window.BMConsent.save({
        analytics: root.querySelector('[data-bm-consent="analytics"]').checked,
        marketing: root.querySelector('[data-bm-consent="marketing"]').checked
      });
      close();
    }
  });

  settings.addEventListener('click', function () { open(true); });
  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-bm-consent-open]')) { event.preventDefault(); open(true); }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !root.hidden && window.BMConsent.get().decided) close();
  });

  document.body.appendChild(root);
  document.body.appendChild(settings);
  if (window.BMConsent.get().decided) settings.hidden = false;
  else open(false);
})();
