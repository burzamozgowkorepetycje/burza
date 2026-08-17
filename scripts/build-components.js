#!/usr/bin/env node
/*
 * Build-time component injector — czysty Node, zero zależności.
 * Wstrzykuje wspólne fragmenty (nagłówek/nav/menu mobilne, stopka, tracking)
 * z /partials do wskazanych stron w /, generuje breadcrumbs i podłącza
 * /assets/shared.css + /assets/shared.js. Wynik to nadal w pełni statyczny,
 * wyrenderowany HTML — brak renderowania treści przez JS w przeglądarce.
 *
 * Źródło prawdy do edycji: /partials/*.html, /assets/shared.css, /assets/shared.js.
 * Uruchamiane automatycznie przy każdym buildzie (npm run build / Vercel buildCommand).
 * Idempotentne — wielokrotne uruchomienie na już zbudowanym pliku nic nie psuje.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PARTIALS = path.join(ROOT, 'partials');

// Strony objęte etapem 1 (wspólny header/nav/menu mobilne/stopka/tracking).
// index.html, korepetycje-online.html (własny, już działający system nawigacji),
// zapisz-sie.html (celowo minimalistyczny landing kampanii płatnych) i
// privacy-policy.html (strona prawna bez nawigacji) pozostają poza zakresem etapu 1.
const PAGES = [
  'korepetycje-biologia.html',
  'korepetycje-chemia.html',
  'korepetycje-geografia.html',
  'korepetycje-wos.html',
  'korepetycje-hiszpanski.html',
  'korepetycje-matematyka.html',
  'korepetycje-angielski.html',
  'korepetycje-polski.html',
  'kursy.html',
  'kurs-matematyka.html',
  'kurs-angielski.html',
  'kurs-polski.html'
];

const trackingHead = read('tracking-head.html');
const gtmNoscript = read('gtm-noscript.html');
const footerPartial = read('footer.html');
const headAssets = read('head-assets.html');

function read(name) {
  return fs.readFileSync(path.join(PARTIALS, name), 'utf8').trim();
}

function must(condition, message) {
  if (!condition) throw new Error(message);
}

function replaceOnce(html, regex, replacement, label, file) {
  const matches = html.match(regex);
  must(matches, `[${file}] nie znaleziono sekcji: ${label}`);
  return html.replace(regex, replacement);
}

function buildBreadcrumbLabel(html) {
  const m = html.match(/<title>([^<]*)<\/title>/);
  must(m, 'brak <title>');
  return m[1].split('|')[0].trim();
}

function buildHeader(navLinksInner) {
  // navLinksInner = oryginalna zawartość <nav class="nav-links">...</nav> danej strony (bez zmian).
  return (
    '<header class="wrap nav">\n' +
    '    <a class="brand" href="/"><img class="brand-logo" src="upload/logo.jpg" alt="Logo Burza Mózgów Korepetycje"><span>Burza Mózgów Korepetycje</span></a>\n' +
    '    <nav class="nav-links">' + navLinksInner + '</nav>\n' +
    '    <button class="menu-toggle" type="button" aria-label="Otwórz menu" aria-expanded="false" aria-controls="mobileMenu"><span></span></button>\n' +
    '  </header>\n' +
    '  <nav class="mobile-menu" id="mobileMenu" aria-label="Menu mobilne">' + navLinksInner + '</nav>'
  );
}

function buildBreadcrumbs(pageLabel, canonicalUrl) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Strona główna', item: 'https://burza-mozgow-korepetycje.pl/' },
      { '@type': 'ListItem', position: 2, name: pageLabel, item: canonicalUrl }
    ]
  };
  return (
    '\n  <nav class="breadcrumbs wrap" aria-label="Okruszki"><ol>' +
    '<li><a href="/">Strona główna</a></li>' +
    '<li aria-current="page">' + pageLabel + '</li>' +
    '</ol></nav>\n' +
    '  <script type="application/ld+json">' + JSON.stringify(jsonLd) + '</script>'
  );
}

function processPage(file) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  if (html.includes('/assets/shared.js')) {
    console.log(`[${file}] bez zmian (już zbudowane)`);
    return;
  }

  // 1) Tracking head (GTM/GA/Meta Pixel) -> partial jedno źródło prawdy.
  html = replaceOnce(
    html,
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js[\s\S]*?fbq\('track','PageView'\);\s*<\/script>/,
    trackingHead,
    'tracking head (GTM/GA/Pixel)',
    file
  );

  // 2) GTM noscript iframe -> partial.
  html = replaceOnce(
    html,
    /<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html[\s\S]*?<\/noscript>/,
    gtmNoscript,
    'GTM noscript iframe',
    file
  );

  // 3) shared.css link tuż przed </head> (jeśli jeszcze nie ma).
  if (!html.includes('/assets/shared.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/shared.css">\n</head>');
  }

  // 4) Header + menu mobilne (nav-links strony zachowane bez zmian, dodany hamburger + panel mobilny).
  const headerMatch = html.match(/<header class="wrap nav">[\s\S]*?<\/header>/);
  must(headerMatch, `[${file}] nie znaleziono <header class="wrap nav">`);
  const navInnerMatch = headerMatch[0].match(/<nav class="nav-links">([\s\S]*?)<\/nav>/);
  must(navInnerMatch, `[${file}] nie znaleziono nav-links w headerze`);
  html = html.replace(headerMatch[0], buildHeader(navInnerMatch[1]));

  // 5) Breadcrumbs zaraz po header/mobile-menu (dane z <title>, bez wymyślania treści).
  if (!html.includes('class="breadcrumbs')) {
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)">/);
    must(canonicalMatch, `[${file}] brak <link rel="canonical">`);
    const label = buildBreadcrumbLabel(html);
    const anchor = '<nav class="mobile-menu" id="mobileMenu" aria-label="Menu mobilne">' + navInnerMatch[1] + '</nav>';
    must(html.includes(anchor), `[${file}] nie znaleziono panelu mobile-menu do zakotwiczenia breadcrumbs`);
    html = html.replace(anchor, anchor + buildBreadcrumbs(label, canonicalMatch[1]));
  }

  // 6) Stopka -> partial (treść identyczna, teraz z jednego źródła).
  html = replaceOnce(
    html,
    /<footer class="wrap footer">[\s\S]*?<\/footer>/,
    footerPartial,
    'footer',
    file
  );

  // 7) shared.js przed skryptem strony (Shared musi być zdefiniowany zanim strona go użyje).
  if (!html.includes('/assets/shared.js')) {
    const footerIdx = html.indexOf(footerPartial);
    must(footerIdx !== -1, `[${file}] nie znaleziono osadzonej stopki do zakotwiczenia shared.js`);
    const afterFooter = html.slice(footerIdx);
    const scriptTagMatch = afterFooter.match(/<script>(?=[\s\S]*?async function sendLead)/);
    must(scriptTagMatch, `[${file}] nie znaleziono <script> ze skryptem strony (sendLead) po stopce`);
    const insertAt = footerIdx + scriptTagMatch.index;
    html = html.slice(0, insertAt) + '<script src="/assets/shared.js"></script>\n  ' + html.slice(insertAt);
  }

  // 8) Usunięcie z inline <script> boilerplate'u, który teraz żyje w shared.js,
  //    i przełączenie wywołań na Shared.sendLead / Shared.track / Shared.showStatus.
  html = html.replace(
    /const LEADS_URL='[^']*';\s*/,
    ''
  );
  html = html.replace(
    /async function sendLead\(payload\)\{[\s\S]*?zrodlo:'[^']*'\s*\}\)\}\);?\s*\}\s*/,
    ''
  );
  html = html.replace(
    /function showStatus\(element,message,type\)\{[^}]*\}\s*/,
    ''
  );
  html = html.replace(
    /function track\(event,data=\{\}\)\{[^}]*\}\s*/,
    ''
  );
  html = html.replace(
    /document\.querySelectorAll\('\.faq button'\)\.forEach\([^;]*;\s*/,
    ''
  );
  html = html.replace(
    /document\.querySelectorAll\('a\[href\^="#"\]'\)\.forEach\([\s\S]*?\}\)\);\s*/,
    ''
  );
  const telTrackMatch = html.match(/document\.querySelectorAll\('a\[href\^="tel:"\]'\)\.forEach\([\s\S]*?source:'([^']*)'\}\)\)\);/);
  must(telTrackMatch, `[${file}] nie znaleziono trackingu kliknięć telefonu`);
  const telSource = telTrackMatch[1];
  html = html.replace(telTrackMatch[0], '');
  html = html.replace(/await sendLead\(/g, 'await Shared.sendLead(');
  html = html.replace(/\btrack\('Lead'/g, "Shared.track('Lead'");
  html = html.replace(/\bshowStatus\(/g, 'Shared.showStatus(');

  // 9) Konfiguracja per-strona dla shared.js: źródło leada + etykieta trackingu telefonu na <body>.
  const zrodloMatch = original.match(/zrodlo:'([^']*)'/);
  must(zrodloMatch, `[${file}] nie znaleziono oryginalnego zrodlo`);
  html = html.replace(
    /<body>/,
    `<body data-zrodlo="${zrodloMatch[1]}" data-tel-source="${telSource}">`
  );

  if (html === original) {
    console.log(`[${file}] bez zmian (już zbudowane)`);
    return;
  }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`[${file}] OK`);
}

PAGES.forEach(processPage);

// Tracking, zgody i favicon muszą być identyczne na wszystkich publicznych
// dokumentach, nie tylko na stronach objętych wspólnym headerem. Ten przebieg
// jest celowo wykonywany zawsze, także na wcześniej zbudowanych plikach.
const GLOBAL_PAGES = fs.readdirSync(ROOT)
  .filter((file) => file.endsWith('.html') && file !== 'redesign.html')
  .concat(
    fs.readdirSync(path.join(ROOT, 'jablonna'))
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join('jablonna', file))
  );

function refreshGlobalHead(file) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  const currentTracking = /\s*<!-- BM tracking start -->[\s\S]*?<!-- BM tracking end -->\s*/;
  const legacyTracking = /\s*<!-- Google (?:Analytics 4|tag \(gtag\.js\)) -->[\s\S]*?<!-- Meta Pixel Code -->\s*<script>[\s\S]*?<\/script>\s*(?:<noscript>\s*<img[\s\S]*?facebook\.com\/tr[\s\S]*?<\/noscript>)?\s*/;

  if (currentTracking.test(html)) {
    html = html.replace(currentTracking, '\n  ' + trackingHead + '\n');
  } else if (legacyTracking.test(html)) {
    html = html.replace(legacyTracking, '\n  ' + trackingHead + '\n');
  } else {
    must(html.includes('</head>'), `[${file}] brak </head> do osadzenia trackingu`);
    html = html.replace('</head>', '  ' + trackingHead + '\n</head>');
  }

  // Fallbacki noscript nie potrafią zebrać zgody, dlatego nie uruchamiamy
  // w nich ani GTM, ani Meta. Rozwiązuje to też niepoprawny <noscript><img>
  // umieszczony wcześniej w <head> strony głównej i strony online.
  html = html.replace(
    /\s*(?:<!-- Google Tag Manager \(noscript\) -->\s*)?<noscript>\s*<iframe[^>]*googletagmanager\.com\/ns\.html[\s\S]*?<\/noscript>\s*/g,
    '\n'
  );
  html = html.replace(
    /\s*<noscript>\s*<img[\s\S]*?facebook\.com\/tr[\s\S]*?<\/noscript>\s*/g,
    '\n'
  );

  const currentHeadAssets = /\s*<!-- BM head assets start -->[\s\S]*?<!-- BM head assets end -->\s*/;
  html = html.replace(currentHeadAssets, '\n');
  must(html.includes('</head>'), `[${file}] brak </head> do osadzenia favicon i CMP`);
  html = html.replace('</head>', '  ' + headAssets + '\n</head>');

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`[${file}] tracking/favicon/consent OK`);
  }
}

GLOBAL_PAGES.forEach(refreshGlobalHead);
console.log('Build komponentów i wspólnego head zakończony.');
