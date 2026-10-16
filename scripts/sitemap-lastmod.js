#!/usr/bin/env node
/*
 * Aktualizuje <lastmod> w sitemap.xml na podstawie historii git.
 * Data = ostatni commit zmieniający plik strony; plik z niezacommitowanymi
 * zmianami dostaje dzisiejszą datę. Uruchamiać lokalnie (npm run build),
 * nie na Vercelu - tam repo jest płytkim klonem i historia jest niepełna.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const ORIGIN = 'https://burza-mozgow-korepetycje.pl';

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function fileForLoc(loc) {
  const p = loc.replace(ORIGIN, '').replace(/^\//, '');
  if (p === '') return 'index.html';
  if (fs.existsSync(path.join(ROOT, p, 'index.html'))) return path.join(p, 'index.html');
  return p + '.html';
}

function lastmodFor(file) {
  if (git(['status', '--porcelain', '--', file])) return new Date().toISOString().slice(0, 10);
  return git(['log', '-1', '--format=%cs', '--', file]);
}

const xml = fs.readFileSync(SITEMAP, 'utf8');
let changed = 0;
const out = xml.replace(
  /(<loc>([^<]+)<\/loc>\s*<lastmod>)([^<]+)(<\/lastmod>)/g,
  (match, before, loc, current, after) => {
    const file = fileForLoc(loc);
    if (!fs.existsSync(path.join(ROOT, file))) {
      console.warn(`[sitemap] brak pliku dla ${loc} (${file})`);
      return match;
    }
    const date = lastmodFor(file);
    if (!date || date === current) return match;
    changed++;
    return before + date + after;
  }
);

if (changed) fs.writeFileSync(SITEMAP, out, 'utf8');
console.log(`[sitemap] zaktualizowano lastmod: ${changed}`);
