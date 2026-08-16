/*
 * Conversions API — serwerowy odpowiednik pikselowego zdarzenia Lead.
 *
 * Przeglądarka odpala fbq('track','Lead', …, {eventID}) i równolegle strzela
 * tutaj z tym samym event_id. Meta łączy oba w jedno zdarzenie (deduplikacja),
 * więc lead liczy się raz, ale dociera nawet wtedy, gdy piksel zablokuje
 * adblock albo ITP.
 *
 * Dane osobowe nigdy nie idą do Meta jawnie: telefon/e-mail/imię hashujemy
 * SHA-256 tutaj, na serwerze. Token żyje wyłącznie w zmiennych środowiskowych
 * Vercela (META_CAPI_TOKEN) i nigdy nie trafia do przeglądarki.
 *
 * Zmienne środowiskowe:
 *   META_PIXEL_ID        — ID piksela (to samo co w partials/tracking-head.html)
 *   META_CAPI_TOKEN      — token dostępu z Events Manager → Conversions API
 *   META_TEST_EVENT_CODE — opcjonalnie, tylko na czas testu w „Testuj zdarzenia"
 */

const crypto = require('crypto');

const GRAPH_VERSION = 'v21.0';
const SEND_TIMEOUT_MS = 2000;

// Prosty limit na IP: front strzela raz na wysłany formularz, więc kilkanaście
// zdarzeń na minutę to już bot. Pamięć instancji lambdy - wystarczy, żeby
// odciąć pętlę ze skryptu, a nie udaje rozproszonego rate limitera.
const RATE_LIMIT = { max: 12, windowMs: 60000 };
const hits = new Map();

function sha256(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function hashText(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized ? [sha256(normalized)] : undefined;
}

function hashEmail(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized || normalized.indexOf('@') === -1) return undefined;
  return [sha256(normalized)];
}

// Meta chce same cyfry z kodem kraju. Numery ze strony są polskie i zwykle
// zapisane bez prefiksu ("605 947 803"), więc 9 cyfr dostaje 48 z przodu.
function hashPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length === 11 && digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 9) digits = '48' + digits;
  if (digits.length < 10 || digits.length > 15) return undefined;
  return [sha256(digits)];
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '');
  const first = forwarded.split(',')[0].trim();
  return first || req.socket?.remoteAddress || undefined;
}

function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT.windowMs) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 500) {
      for (const [key, value] of hits) {
        if (now - value.start > RATE_LIMIT.windowMs) hits.delete(key);
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return null; }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; if (raw.length > 20000) req.destroy(); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch (e) { resolve(null); }
    });
    req.on('error', () => resolve(null));
  });
}

function str(value, max) {
  if (value === undefined || value === null) return '';
  return String(value).slice(0, max || 200);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  // Odpowiadamy zawsze 202 i nie blokujemy użytkownika: brak konfiguracji,
  // błąd Meta czy timeout nie mogą wywrócić wysyłki formularza.
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  const ip = clientIp(req);
  if (rateLimited(ip)) return res.status(202).json({ ok: true });

  const body = await readBody(req);
  if (!body || typeof body !== 'object') return res.status(202).json({ ok: true });

  const eventId = str(body.event_id, 100);
  const phone = hashPhone(body.telefon);
  const email = hashEmail(body.email);

  // Bez event_id nie da się zdeduplikować z pikselem, a bez telefonu/e-maila
  // Meta i tak nie dopasuje leada do użytkownika - taki strzał byłby szumem.
  if (!eventId || (!phone && !email)) return res.status(202).json({ ok: true });

  if (!pixelId || !token) {
    console.error('[capi] brak META_PIXEL_ID lub META_CAPI_TOKEN - zdarzenie pominiete');
    return res.status(202).json({ ok: true });
  }

  const userData = {
    em: email,
    ph: phone,
    fn: hashText(body.imie),
    client_ip_address: ip,
    client_user_agent: str(req.headers['user-agent'], 500)
  };
  if (body.fbp) userData.fbp = str(body.fbp, 200);
  if (body.fbc) userData.fbc = str(body.fbc, 400);
  Object.keys(userData).forEach((key) => { if (!userData[key]) delete userData[key]; });

  const payload = {
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: str(body.event_source_url, 500) || undefined,
      action_source: 'website',
      user_data: userData,
      custom_data: {
        content_name: 'formularz',
        content_category: str(body.utm_content, 200) || 'brak',
        lead_source: str(body.utm_source, 200) || 'brak'
      }
    }]
  };
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const response = await fetch(
      'https://graph.facebook.com/' + GRAPH_VERSION + '/' + pixelId +
        '/events?access_token=' + encodeURIComponent(token),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }
    );
    if (!response.ok) {
      const text = await response.text();
      console.error('[capi] Meta odpowiedziala ' + response.status + ': ' + text.slice(0, 300));
    }
  } catch (err) {
    console.error('[capi] wysylka nieudana:', err && err.name, err && err.message);
  } finally {
    clearTimeout(timer);
  }

  return res.status(202).json({ ok: true });
};
