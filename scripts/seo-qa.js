#!/usr/bin/env node
/* Automatyczny smoke test technicznego SEO dla dokumentów z sitemap.xml. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://burza-mozgow-korepetycje.pl';
const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function count(html, regex) {
  return (html.match(regex) || []).length;
}

function capture(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function fileForUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/$/, '');
  if (!pathname) return 'index.html';
  if (pathname === '/jablonna') return 'jablonna/index.html';
  return pathname.slice(1) + '.html';
}

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

const robots = read('robots.txt');
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail('robots.txt nie wskazuje kanonicznej sitemapy');
if (!/User-agent:\s*\*/i.test(robots) || !/Allow:\s*\//i.test(robots)) fail('robots.txt nie zezwala botom na serwis');

const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
if (!sitemap.startsWith('<?xml')) fail('sitemap.xml nie ma deklaracji XML');
if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) fail('sitemap.xml ma zły namespace');
if (urls.length !== new Set(urls).size) fail('sitemap.xml zawiera powielone URL-e');
if (lastmods.length !== urls.length) fail('nie każdy URL sitemapy ma lastmod');
lastmods.forEach((date) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`niepoprawny lastmod: ${date}`); });

const seenTitles = new Map();
const seenDescriptions = new Map();

urls.forEach((url) => {
  if (!url.startsWith(ORIGIN + '/') && url !== ORIGIN) fail(`URL poza domeną kanoniczną: ${url}`);
  const file = fileForUrl(url);
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    fail(`${url}: brak pliku ${file}`);
    return;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const title = capture(html, /<title>([^<]+)<\/title>/i);
  const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = capture(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const robotsMeta = capture(html, /<meta\s+name="robots"\s+content="([^"]+)"/i);

  if (!title) fail(`${file}: brak title`);
  if (title.length > 60) fail(`${file}: title ma ${title.length} znaków`);
  if (!description) fail(`${file}: brak meta description`);
  if (description.length > 160) fail(`${file}: description ma ${description.length} znaków`);
  if (description && description.length < 90) warn(`${file}: krótki description (${description.length} znaków)`);
  if (canonical !== url) fail(`${file}: canonical „${canonical}” nie zgadza się z sitemapą „${url}”`);
  if (/noindex/i.test(robotsMeta)) fail(`${file}: URL z sitemapy ma noindex`);
  if (count(html, /<h1(?:\s|>)/gi) !== 1) fail(`${file}: liczba H1 ≠ 1`);
  if (count(html, /<!-- BM tracking start -->/g) !== 1) fail(`${file}: tracking nie jest osadzony dokładnie raz`);
  if (count(html, /<!-- BM head assets start -->/g) !== 1) fail(`${file}: favicon/CMP nie są osadzone dokładnie raz`);
  if (!html.includes('rel="icon"') || !html.includes('/assets/icons/favicon-192.png')) fail(`${file}: brak favicon`);
  if (html.includes('facebook.com/tr?') || /<noscript>\s*<iframe[^>]*googletagmanager/i.test(html)) fail(`${file}: tracking noscript omija zgodę`);
  if (/\[ZDJĘCIE|\[PRZEDMIOT|\[IMIĘ|DO UZUPEŁNIENIA/i.test(html)) fail(`${file}: pozostał placeholder`);

  const jsonScripts = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  jsonScripts.forEach((match, index) => {
    try { JSON.parse(match[1]); }
    catch (error) { fail(`${file}: niepoprawny JSON-LD #${index + 1} (${error.message})`); }
  });

  if (seenTitles.has(title)) warn(`${file}: title powiela ${seenTitles.get(title)}`);
  else seenTitles.set(title, file);
  if (seenDescriptions.has(description)) warn(`${file}: description powiela ${seenDescriptions.get(description)}`);
  else seenDescriptions.set(description, file);
});

const redirects = JSON.parse(read('vercel.json')).redirects || [];
const wwwRedirect = redirects.find((redirect) =>
  redirect.has && redirect.has.some((condition) => condition.type === 'host' && condition.value === 'www.burza-mozgow-korepetycje.pl')
);
if (!wwwRedirect || wwwRedirect.permanent !== true || wwwRedirect.destination !== `${ORIGIN}/:path*`) {
  fail('vercel.json nie ma trwałego przekierowania www → domena kanoniczna');
}

['favicon.ico', 'assets/icons/favicon-32.png', 'assets/icons/favicon-192.png', 'assets/icons/apple-touch-icon.png'].forEach((file) => {
  if (!fs.existsSync(path.join(ROOT, file))) fail(`brak pliku ${file}`);
});

warnings.forEach((message) => console.warn(`WARN: ${message}`));
if (errors.length) {
  errors.forEach((message) => console.error(`FAIL: ${message}`));
  console.error(`\nSEO QA: ${errors.length} błędów, ${warnings.length} ostrzeżeń.`);
  process.exit(1);
}

console.log(`SEO QA: OK — ${urls.length} URL-i z sitemapy, 0 błędów, ${warnings.length} ostrzeżeń.`);
