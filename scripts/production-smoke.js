#!/usr/bin/env node
/* Weryfikacja wdrożonej produkcji. Wymaga Node 18+ (wbudowany fetch). */
'use strict';

const ORIGIN = (process.env.SEO_ORIGIN || 'https://burza-mozgow-korepetycje.pl').replace(/\/$/, '');
const WWW_ORIGIN = ORIGIN.replace('://', '://www.');
const errors = [];

function fail(message) { errors.push(message); }
function capture(html, regex) { return (html.match(regex) || [])[1] || ''; }

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(url, {
      ...options,
      redirect: options.redirect || 'follow',
      headers: { 'cache-control': 'no-cache', 'user-agent': 'BurzaMozgow-SEO-QA/1.0', ...(options.headers || {}) },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function text(url) {
  const response = await request(url);
  if (!response.ok) fail(`${url}: HTTP ${response.status}`);
  return { response, body: await response.text() };
}

async function main() {
  const www = await request(WWW_ORIGIN + '/', { redirect: 'manual' });
  if (www.status !== 308) fail(`www → apex: oczekiwano 308, jest ${www.status}`);
  if (www.headers.get('location') !== ORIGIN + '/') fail(`www → apex: zły Location (${www.headers.get('location')})`);

  const favicon = await request(ORIGIN + '/favicon.ico');
  if (!favicon.ok) fail(`/favicon.ico: HTTP ${favicon.status}`);
  if (!/image|icon/i.test(favicon.headers.get('content-type') || '')) fail('/favicon.ico: zły Content-Type');

  const robots = await text(ORIGIN + '/robots.txt');
  if (!robots.body.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail('robots.txt nie wskazuje kanonicznej sitemapy');

  const sitemap = await text(ORIGIN + '/sitemap.xml');
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (urls.length !== 43) fail(`sitemap.xml: oczekiwano 43 URL-i, jest ${urls.length}`);
  if (urls.length !== new Set(urls).size) fail('sitemap.xml zawiera duplikaty');

  const queue = urls.slice();
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const url = queue.shift();
      let result;
      try { result = await text(url); }
      catch (error) { fail(`${url}: ${error.message}`); continue; }
      const html = result.body;
      const title = capture(html, /<title>([^<]*)<\/title>/i).trim();
      const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i).trim();
      const canonical = capture(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i).trim();
      if (!title || title.length > 60) fail(`${url}: title ma ${title.length} znaków`);
      if (!description || description.length > 160) fail(`${url}: description ma ${description.length} znaków`);
      if (canonical !== url) fail(`${url}: canonical = ${canonical || 'brak'}`);
      if ((html.match(/<h1(?:\s|>)/gi) || []).length !== 1) fail(`${url}: liczba H1 ≠ 1`);
      if (!html.includes('<!-- BM tracking start -->')) fail(`${url}: brak Consent Mode/tracking`);
      if (!html.includes('/assets/icons/favicon-192.png')) fail(`${url}: brak favicon`);
      if (/\[ZDJĘCIE|\[PRZEDMIOT|\[IMIĘ|DO UZUPEŁNIENIA/i.test(html)) fail(`${url}: pozostał placeholder`);
      if (html.includes('facebook.com/tr?') || /<noscript>\s*<iframe[^>]*googletagmanager/i.test(html)) fail(`${url}: tracking noscript omija zgodę`);
    }
  });
  await Promise.all(workers);

  for (const asset of ['/assets/consent.js', '/assets/consent.css', '/assets/icons/favicon-192.png']) {
    const response = await request(ORIGIN + asset);
    if (!response.ok) fail(`${asset}: HTTP ${response.status}`);
  }

  if (errors.length) {
    errors.forEach((message) => console.error(`FAIL: ${message}`));
    console.error(`\nProduction smoke: ${errors.length} błędów.`);
    process.exit(1);
  }
  console.log(`Production smoke: OK — ${urls.length} URL-i, redirect 308, favicon i CMP dostępne.`);
}

main().catch((error) => {
  console.error(`FAIL: ${error.stack || error.message}`);
  process.exit(1);
});
