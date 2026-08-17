#!/usr/bin/env node
/* Kontrola unikalnych intencji, fraz i kluczowych połączeń między stronami. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://burza-mozgow-korepetycje.pl';
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function normalize(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function capture(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function fileForPath(pathname) {
  if (pathname === '/') return 'index.html';
  if (pathname === '/jablonna') return 'jablonna/index.html';
  return pathname.slice(1) + '.html';
}

function includesTerm(value, term) {
  return normalize(value).includes(normalize(term));
}

const sitemap = read('sitemap.xml');
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => new URL(match[1]).pathname.replace(/\/$/, '') || '/');
const intentMap = JSON.parse(read('seo-intent-map.json'));
const pages = intentMap.pages || {};
const mappedPaths = Object.keys(pages);

for (const pathname of sitemapPaths) {
  if (!pages[pathname]) errors.push(`${pathname}: brak wpisu w seo-intent-map.json`);
}
for (const pathname of mappedPaths) {
  if (!sitemapPaths.includes(pathname)) errors.push(`${pathname}: wpis w mapie nie istnieje w sitemap.xml`);
}

const keywords = new Map();
for (const [pathname, page] of Object.entries(pages)) {
  const keyword = normalize(page.primaryKeyword);
  if (!keyword) errors.push(`${pathname}: brak primaryKeyword`);
  if (keywords.has(keyword)) errors.push(`${pathname}: primaryKeyword powiela ${keywords.get(keyword)}`);
  else keywords.set(keyword, pathname);

  if (!page.intent || !page.cluster || !page.role) errors.push(`${pathname}: brak intent, cluster lub role`);
  if (page.parent && !pages[page.parent]) errors.push(`${pathname}: nieistniejący parent ${page.parent}`);

  const file = fileForPath(pathname);
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');
  const title = capture(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = capture(html, /<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i);
  const description = capture(html, /<meta\s+name="description"\s+content="([^"]*)"/i);

  for (const term of page.titleTerms || []) {
    if (!includesTerm(title, term)) errors.push(`${pathname}: title nie zawiera „${term}”`);
  }
  for (const term of page.h1Terms || []) {
    if (!includesTerm(h1, term)) errors.push(`${pathname}: H1 nie zawiera „${term}”`);
  }
  for (const term of page.forbiddenMetaTerms || []) {
    if (includesTerm(description, term)) errors.push(`${pathname}: description zawiera zakazaną frazę „${term}”`);
  }
  for (const href of page.requiredLinks || []) {
    const pattern = new RegExp(`href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'#?]`);
    if (!pattern.test(html)) errors.push(`${pathname}: brak wymaganego linku do ${href}`);
  }
}

if (errors.length) {
  errors.forEach((message) => console.error(`FAIL: ${message}`));
  console.error(`\nIntent QA: ${errors.length} błędów.`);
  process.exit(1);
}

console.log(`Intent QA: OK — ${mappedPaths.length} unikalne intencje dla ${sitemapPaths.length} URL-i.`);
