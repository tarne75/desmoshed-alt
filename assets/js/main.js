/* ==========================================================================
   Desmo Shed — main.js
   Vanilla ES2020+. Zero dependencies. No build step.

   ── PHASE 1 (now) ─────────────────────────────────────────────────────────
   Every content block below lives in SOURCES with an empty `csv` and an
   inline `rows` array. The site renders from `rows`.

   ── PHASE 2 (Google Sheets) ───────────────────────────────────────────────
   Publish the sheet tab:  File ▸ Share ▸ Publish to web ▸ <tab> ▸ CSV
   Paste the resulting URL into the matching `csv` field. Nothing else
   changes — `loadRows()` fetches and parses the CSV, and the inline `rows`
   stay put as an offline fallback if the fetch ever fails.

   IMPORTANT: the object keys below are the column headers your sheet must
   use, spelled exactly the same way (case-insensitive, whitespace-trimmed).
   Tables build their columns from whatever keys the data actually has, so
   adding a column in the sheet adds a column on the page.
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. DATA SOURCES
   -------------------------------------------------------------------------- */
const SOURCES = {

  /* Header strip of approvals ------------------------------------------- */
  trust: {
    csv: '',
    rows: [
      { Item: 'Genuine Ducati OEM parts' },
      { Item: 'Rexxer authorised dealer' },
      { Item: 'Bike Trac authorised dealer' },
      { Item: 'Motul official stockist' },
      { Item: 'MUPO race suspension' },
      { Item: 'STM clutches' }
    ]
  },

  /* Three service pillars — wording carried over from the original site -- */
  services: {
    csv: '',
    rows: [
      {
        Title: 'Servicing and Repairs',
        Summary: 'Annual, belt, desmo service or total engine rebuild we cover all aspects. We use only genuine Ducati OEM parts.',
        Points: 'Full Ducati tooling kit|Track preparation and modifications|Diagnostics and fault finding',
        Icon: 'spanner'
      },
      {
        Title: 'Tuning and Remapping',
        Summary: "We are London's only Rexxer custom software authorised dealer. More power and smoother throttle response with Rexxer mappings.",
        Points: 'Latest tuning software|Custom maps to your bike|Smoother, cleaner fuelling',
        Icon: 'gauge'
      },
      {
        Title: 'Accessories and Customisation',
        Summary: 'We can supply and fit Ducati performance accessories. We are an authorised Bike Trac dealer and official Motul lubricant stockist.',
        Points: 'MUPO race suspension|STM clutches|Bike Trac supply and fitting',
        Icon: 'sparks'
      }
    ]
  },

  /* Services & fees table.
     Columns are derived from these keys — add or remove one and the table
     follows. `Price` renders in the accent/mono style automatically.        */
  fees: {
    csv: '',
    rows: [
      { Service: 'Annual service',              Includes: 'Oil and filter, fluid levels, brakes, chain and sprockets, full safety check, service light reset', Interval: 'Every 12 months / 6,000 mi', Price: 'POA' },
      { Service: 'Belt service',                Includes: 'Cam belt replacement, tensioner check and belt tensioning to Ducati spec',                          Interval: 'Every 2 yrs / 12,000 mi',   Price: 'POA' },
      { Service: 'Desmo service',               Includes: 'Full valve clearance check and adjustment, opener and closer shims, belts and fluids',              Interval: 'Every 4 yrs / 15–18,000 mi', Price: 'POA' },
      { Service: 'Engine rebuild',              Includes: 'Strip, inspection, machining, genuine OEM parts, reassembly and running-in',                        Interval: 'As required',               Price: 'POA' },
      { Service: 'Diagnostics and fault finding', Includes: 'Dealer-level diagnostics, live data, fault code read and clear, written findings',                Interval: 'As required',               Price: 'POA' },
      { Service: 'Rexxer custom remapping',     Includes: 'Custom Rexxer map written to your bike, exhaust and filter configurations supported',               Interval: 'One-off',                   Price: 'POA' },
      { Service: 'Clutch service or upgrade',   Includes: 'Slipper or wet clutch inspection, plate replacement, STM upgrades supplied and fitted',             Interval: 'As required',               Price: 'POA' },
      { Service: 'Suspension service and setup', Includes: 'MUPO supply and fitting, rebuild of existing units, sag and damping set to rider weight',          Interval: 'Every 2 yrs / as required',  Price: 'POA' },
      { Service: 'Brake and clutch fluid change', Includes: 'Full system flush, bleed and pressure check, DOT 4 fluid',                                        Interval: 'Every 2 years',             Price: 'POA' },
      { Service: 'Coolant change',              Includes: 'Drain, flush and refill, cap and hose inspection, pressure test',                                   Interval: 'Every 2 years',             Price: 'POA' },
      { Service: 'Tyre supply and fitting',     Includes: 'Supply, fit and balance, valve and disposal included',                                              Interval: 'As required',               Price: 'POA' },
      { Service: 'Track day preparation',       Includes: 'Safety check, fluids, lockwiring, tyre and suspension setup, geometry',                             Interval: 'Per event',                 Price: 'POA' },
      { Service: 'Bike Trac supply and fitting', Includes: 'Authorised supply, installation and activation of Bike Trac tracking',                             Interval: 'One-off',                   Price: 'POA' },
      { Service: 'Accessory supply and fitting', Includes: 'Ducati Performance and aftermarket parts sourced, fitted and set up',                              Interval: 'As required',               Price: 'POA' },
      { Service: 'Pre-purchase inspection',     Includes: 'Independent condition and history assessment with a written report',                                Interval: 'One-off',                   Price: 'POA' }
    ]
  },

  /* Gallery. `File` is a filename inside assets/img/gallery/.
     `json` wins over `rows`: scripts/fetch-images.sh rebuilds
     assets/img/gallery/index.json every time it runs, so adding, removing,
     reordering or re-captioning photos is a JSON edit, not a code edit.
     The `rows` below are only the fallback for a first load before the
     script has ever been run.                                              */
  gallery: {
    csv: '',
    json: 'assets/img/gallery/index.json',
    rows: [
      { File: 'gallery-01.jpg', Caption: 'In the workshop' },
      { File: 'gallery-02.jpg', Caption: 'Ducati on the bench' },
      { File: 'gallery-03.jpg', Caption: 'Service in progress' },
      { File: 'gallery-04.jpg', Caption: 'Desmo Shed, New Barnet' },
      { File: 'gallery-05.jpg', Caption: 'Genuine Ducati OEM parts' },
      { File: 'gallery-06.jpg', Caption: 'Engine work' },
      { File: 'gallery-07.jpg', Caption: 'Rexxer mapping setup' },
      { File: 'gallery-08.jpg', Caption: 'Finished and ready to collect' }
    ]
  },

  /* Opening hours — from the Google Business listing ---------------------- */
  hours: {
    csv: '',
    rows: [
      { Day: 'Monday',    Hours: '9:00am – 5:00pm' },
      { Day: 'Tuesday',   Hours: '9:00am – 5:00pm' },
      { Day: 'Wednesday', Hours: '9:00am – 5:00pm' },
      { Day: 'Thursday',  Hours: '9:00am – 5:00pm' },
      { Day: 'Friday',    Hours: '9:00am – 5:00pm' },
      { Day: 'Saturday',  Hours: '9:00am – 12:00pm' },
      { Day: 'Sunday',    Hours: 'Closed' }
    ]
  },

  /* FAQ — new content, not on the original site --------------------------- */
  faq: {
    csv: '',
    rows: [
      { Question: 'Do you only work on Ducatis?',
        Answer: 'Ducati is what we do. The full factory tooling, the diagnostics and the parts supply are all built around the marque, which is why we can take on belt, desmo and engine work that general workshops pass on.' },
      { Question: 'Will an independent service affect my warranty?',
        Answer: 'No. Under UK and EU block exemption rules a manufacturer warranty stays valid as long as the work is carried out to schedule with parts of matching quality. We service to Ducati schedules using genuine Ducati OEM parts and stamp your book.' },
      { Question: 'How often does a Ducati need a belt or desmo service?',
        Answer: 'It varies by model and year, so check your book — but as a rule belts are on a two-year cycle and the desmo service comes round on mileage or every four years, whichever lands first. Send us your model and mileage and we will tell you exactly where you are.' },
      { Question: 'How do I get a price?',
        Answer: 'Ring +44 7590 608 704 or use the enquiry form with your model, year and mileage. Prices depend on the bike and its condition, so we quote properly rather than guessing, and you get a firm figure before any work starts.' },
      { Question: 'What is Rexxer remapping and do I need it?',
        Answer: 'Rexxer writes a custom map to your ECU rather than a generic file, so fuelling is matched to your exhaust, filter and how the bike is actually used. You get more power and a much smoother throttle. We are London’s only authorised Rexxer dealer.' },
      { Question: 'Can you supply and fit parts I have bought elsewhere?',
        Answer: 'Usually yes, though we would rather supply them — we can source Ducati Performance and quality aftermarket parts, and we stand behind what we fit. Ask us before you buy and we will tell you if it is the right part for your bike.' },
      { Question: 'Where exactly are you?',
        Answer: 'Rear of 20 Greenhill Parade, New Barnet, Barnet EN5 1EU. The workshop sits behind the parade — follow the map on this page and come round the back.' },
      { Question: 'Do I need to book?',
        Answer: 'Yes please. We are a small independent workshop and bench space is limited, so get in touch before you ride over.' }
    ]
  },

  /* Customer reviews (Google, via the business listing) -------------------- */
  reviews: {
    csv: '',
    rows: [
      { Quote: 'Just had my Ducati M821 serviced and mapped by Artur. Excellent service and great value for money. Artur is the best go-faster accessory you can get for your bike!',
        Author: 'Pasq B.', Source: 'Google', Rating: '5' },
      { Quote: 'Artur knows Ducatis like no other. He diagnosed it for free, found it was a £30 cable that was broken, and brought my 8 year old Ducati back to being as good as new.',
        Author: 'Sab K.', Source: 'Google', Rating: '5' },
      { Quote: 'Had a fantastic experience at Desmo Shed. Arthur gave me a warm welcome, the work was carried out efficiently and professionally, and his knowledge of the brand is outstanding.',
        Author: 'Andy N.', Source: 'Google', Rating: '5' }
    ]
  }
};

/* Headline figures read off the Google Business listing (checked 21 Aug 2026).
   These are a point-in-time snapshot — bump them when the listing moves on. */
const LISTING = { rating: '5.0', reviews: '137' };

const GALLERY_DIR  = 'assets/img/gallery/';
const PLACEHOLDER  = 'assets/img/placeholder.svg';
const FORM_ENDPOINT = 'https://formspree.io/f/xwvndkow';

/* Contact fallbacks, used when the form cannot reach Formspree.
   The canonical copies of these live in index.html — if the number or address
   ever changes, grep for "447590608704" and "desmoshed@outlook.com" and change
   every hit, including the WhatsApp links and the JSON-LD block. */
const FALLBACK_CONTACT = 'call +44 7590 608 704, message us on WhatsApp, or email desmoshed@outlook.com';

/* --------------------------------------------------------------------------
   2. Tiny helpers
   -------------------------------------------------------------------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Slugify a column header into a stable attribute value. */
const slug = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Build an element from a tag, props and children. */
function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Inline SVG icon set (kept tiny — no sprite request). */
const ICONS = {
  spanner: '<path d="M14.8 6.2a4 4 0 0 0 5 5l-8.6 8.6a2.4 2.4 0 0 1-3.4-3.4Z"/><path d="M14.8 6.2 17.4 3.6a5.2 5.2 0 0 1 3 6.6"/>',
  gauge:   '<path d="M4 17a9 9 0 1 1 16 0"/><path d="m12 14 4-4"/><circle cx="12" cy="15" r="1.6"/>',
  sparks:  '<path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9Z"/><path d="M18.5 15.5 19.3 18l2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8Z"/>',
  star:    '<path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8Z"/>'
};
const icon = (name, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spanner}</svg>`;

const starsHTML = (n = 5) =>
  Array.from({ length: Math.round(Number(n) || 5) },
    () => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS.star}</svg>`).join('');

/* --------------------------------------------------------------------------
   3. CSV → rows
       RFC 4180-ish: quoted fields, embedded commas, newlines and "" escapes.
       First non-empty line is the header row; each subsequent row becomes an
       object keyed by those headers. This is the whole "Sheets library".
   -------------------------------------------------------------------------- */
function parseCSV(text) {
  const src = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const rows = [];
  let row = [], field = '', quoted = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else {
      field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }

  const cleaned = rows.filter(r => r.some(v => String(v).trim() !== ''));
  if (cleaned.length < 2) return [];

  const headers = cleaned[0].map(h => String(h).trim());
  return cleaned.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = String(r[i] ?? '').trim(); });
    return obj;
  });
}

/**
 * Resolve a SOURCES entry to an array of row objects.
 *
 * Precedence: `csv` (a published Google Sheet) → `json` (a local manifest)
 * → `rows` (built into this file). Each step falls through to the next if it
 * fails, so a missing sheet or manifest degrades to yesterday's content rather
 * than to an empty section.
 */
async function loadRows(source) {
  if (!source) return [];

  if (source.csv) {
    try {
      const res = await fetch(source.csv, { cache: 'no-store', credentials: 'omit' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const parsed = parseCSV(await res.text());
      if (parsed.length) return parsed;
      throw new Error('sheet returned no rows');
    } catch (err) {
      console.warn('[desmoshed] CSV load failed, falling through:', source.csv, err);
    }
  }

  if (source.json) {
    try {
      const res = await fetch(source.json, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const parsed = await res.json();
      if (Array.isArray(parsed) && parsed.length) return parsed;
      throw new Error('manifest returned no rows');
    } catch (err) {
      console.warn('[desmoshed] JSON load failed, using built-in rows:', source.json, err);
    }
  }

  return Array.isArray(source.rows) ? source.rows : [];
}

/* --------------------------------------------------------------------------
   4. Renderers — all shape themselves around the data they are given
   -------------------------------------------------------------------------- */

/** Approvals strip. */
function renderTrust(rows) {
  const host = $('#trustItems');
  if (!host) return;
  host.replaceChildren(...rows.map(r => el('li', { text: r.Item || Object.values(r)[0] || '' })));
}

/** Service pillar cards. */
function renderServices(rows) {
  const host = $('#servicesGrid');
  if (!host) return;
  host.setAttribute('aria-busy', 'false');
  if (!rows.length) { host.replaceChildren(el('p', { class: 'is-loading', text: 'Services coming soon.' })); return; }

  host.replaceChildren(...rows.map((r, i) => {
    const points = String(r.Points || '').split('|').map(s => s.trim()).filter(Boolean);
    return el('article', { class: 'card reveal', style: `--reveal-delay:${i * 90}ms` },
      el('div', { class: 'service__icon', html: icon(r.Icon || 'spanner') }),
      el('h3', { class: 'service__title', text: r.Title || '' }),
      el('p',  { class: 'service__body',  text: r.Summary || '' }),
      points.length ? el('ul', { class: 'service__points' }, points.map(p => el('li', { text: p }))) : null
    );
  }));
}

/**
 * Generic table renderer.
 * Columns are the union of keys across all rows, in first-seen order — so the
 * table is driven entirely by how many data points the source actually has.
 */
function renderTable(host, rows, caption) {
  if (!host) return;
  host.setAttribute('aria-busy', 'false');
  if (!rows.length) { host.replaceChildren(el('p', { class: 'is-loading', style: 'padding-inline:1.15rem', text: 'Nothing to show yet.' })); return; }

  const cols = [];
  rows.forEach(r => Object.keys(r).forEach(k => { if (k && !cols.includes(k)) cols.push(k); }));

  const table = el('table', { class: 'data-table' },
    caption ? el('caption', { text: caption }) : null,
    el('thead', {}, el('tr', {}, cols.map(c => el('th', { scope: 'col', text: c })))),
    el('tbody', {}, rows.map(r =>
      el('tr', {}, cols.map(c =>
        el('td', { 'data-col': slug(c), 'data-label': c, text: r[c] ?? '—' })
      ))
    ))
  );
  host.replaceChildren(table);
}

/** Gallery grid — 3 across on desktop, and every tile opens the lightbox. */
let GALLERY = [];
function renderGallery(rows) {
  const host = $('#galleryGrid');
  if (!host) return;
  host.setAttribute('aria-busy', 'false');

  GALLERY = rows.map(r => ({
    src: /^https?:\/\//.test(r.File || '') ? r.File : GALLERY_DIR + (r.File || ''),
    caption: r.Caption || ''
  }));

  if (!GALLERY.length) { host.replaceChildren(el('p', { class: 'is-loading', text: 'Photos coming soon.' })); return; }

  host.replaceChildren(...GALLERY.map((item, i) => {
    const img = el('img', {
      src: item.src,
      alt: item.caption || 'Desmo Shed workshop photo',
      loading: i < 3 ? 'eager' : 'lazy',
      decoding: 'async',
      width: '800', height: '600'
    });
    img.addEventListener('error', () => { if (img.src.indexOf(PLACEHOLDER) === -1) img.src = PLACEHOLDER; }, { once: true });

    return el('button', {
      class: 'tile reveal',
      type: 'button',
      style: `--reveal-delay:${(i % 3) * 80}ms`,
      'aria-label': `Open image ${i + 1} of ${GALLERY.length}${item.caption ? ': ' + item.caption : ''}`,
      onclick: () => openLightbox(i)
    }, img, item.caption ? el('span', { class: 'tile__caption', text: item.caption }) : null);
  }));
}

/** Opening hours, with today highlighted. */
function renderHours(rows) {
  const host = $('#hoursList');
  if (!host) return;
  host.setAttribute('aria-busy', 'false');
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' });

  host.replaceChildren(...rows.map(r => {
    const day = r.Day || '';
    const hrs = r.Hours || '';
    return el('div', {
      class: 'hours__row',
      'data-today': day.toLowerCase() === today.toLowerCase() ? 'true' : null,
      'data-closed': /closed/i.test(hrs) ? 'true' : null
    },
      el('span', { class: 'hours__day',  text: day }),
      el('span', { class: 'hours__time', text: hrs })
    );
  }));
}

/** FAQ accordion built on <details>. */
function renderFaq(rows) {
  const host = $('#faqList');
  if (!host) return;
  host.setAttribute('aria-busy', 'false');
  if (!rows.length) { host.replaceChildren(); return; }

  host.replaceChildren(...rows.map(r =>
    el('details', { class: 'faq__item', name: 'faq' },
      el('summary', { class: 'faq__q', text: r.Question || '' }),
      el('div', { class: 'faq__a' }, el('p', { text: r.Answer || '' }))
    )
  ));
}

/** Review cards. */
function renderReviews(rows) {
  const host = $('#quotes');
  if (!host) return;
  host.replaceChildren(...rows.map(r =>
    el('figure', { class: 'quote' },
      el('blockquote', { class: 'quote__text', text: r.Quote || '' }),
      el('figcaption', { class: 'quote__meta' },
        el('span', { class: 'stars', html: starsHTML(r.Rating || 5), 'aria-hidden': 'true' }),
        el('span', { text: `${r.Author || 'Verified customer'} · ${r.Source || 'Google'}` })
      )
    )
  ));
}

/* --------------------------------------------------------------------------
   5. UI behaviour
   -------------------------------------------------------------------------- */

/** Sticky-header shadow once the page has moved. */
function initHeaderState() {
  const header = $('#header');
  if (!header) return;
  const set = () => header.setAttribute('data-scrolled', String(window.scrollY > 8));
  set();
  window.addEventListener('scroll', set, { passive: true });
}

/** Mobile nav panel. */
function initNavToggle() {
  const btn = $('#navToggle');
  const nav = $('#nav');
  if (!btn || !nav) return;

  const close = () => { btn.setAttribute('aria-expanded', 'false'); nav.setAttribute('data-open', 'false'); };
  const open  = () => { btn.setAttribute('aria-expanded', 'true');  nav.setAttribute('data-open', 'true'); };

  btn.addEventListener('click', () =>
    btn.getAttribute('aria-expanded') === 'true' ? close() : open());

  nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 960) close(); });
  close();
}

/** Reveal-on-scroll. Safe to call again after rendering new nodes. */
let revealObserver = null;
function observeReveals(root = document) {
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.reveal', root).forEach(n => n.classList.add('is-visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }
  $$('.reveal:not(.is-visible)', root).forEach(n => revealObserver.observe(n));
}

/** Scrollspy: mark the nav link for the section currently in view. */
function initScrollspy() {
  const links = $$('.nav__link[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const sections = Array.from(byId.keys()).map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const visible = new Map();
  const headerH = () =>
    parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 76;

  const paint = () => {
    let best = null, bestRatio = 0;
    visible.forEach((ratio, id) => { if (ratio > bestRatio) { bestRatio = ratio; best = id; } });
    byId.forEach((a, id) => {
      if (id === best) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
    paint();
  }, {
    rootMargin: `-${headerH() + 8}px 0px -45% 0px`,
    threshold: [0, 0.15, 0.35, 0.6, 0.9]
  });

  sections.forEach(s => io.observe(s));
}

/* --------------------------------------------------------------------------
   6. Lightbox — native <dialog>: focus trap, Esc and inertness are free
   -------------------------------------------------------------------------- */
let lbIndex = 0;

function openLightbox(index) {
  const dlg = $('#lightbox');
  if (!dlg || !GALLERY.length) return;
  showLightbox(index);
  if (typeof dlg.showModal === 'function') dlg.showModal();
  else dlg.setAttribute('open', '');           // very old browsers: inline fallback
}

function showLightbox(index) {
  lbIndex = ((index % GALLERY.length) + GALLERY.length) % GALLERY.length;
  const item = GALLERY[lbIndex];
  const img = $('#lightboxImg');
  img.src = item.src;
  img.alt = item.caption || 'Desmo Shed workshop photo';
  img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };
  $('#lightboxCaption').textContent = item.caption || '';
  $('#lightboxCount').textContent = `${lbIndex + 1} / ${GALLERY.length}`;
}

function initLightbox() {
  const dlg = $('#lightbox');
  if (!dlg) return;

  $('#lbClose').addEventListener('click', () => dlg.close());
  $('#lbPrev').addEventListener('click', () => showLightbox(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showLightbox(lbIndex + 1));

  // Click the backdrop (i.e. outside the figure) to dismiss.
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); showLightbox(lbIndex + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); showLightbox(lbIndex - 1); }
  });

  // Lock background scroll while open.
  dlg.addEventListener('close', () => { document.body.style.overflow = ''; });
  const obs = new MutationObserver(() => {
    document.body.style.overflow = dlg.open ? 'hidden' : '';
  });
  obs.observe(dlg, { attributes: true, attributeFilter: ['open'] });
}

/* --------------------------------------------------------------------------
   7. Formspree — AJAX submit, no page navigation
   -------------------------------------------------------------------------- */
function initForm() {
  const form   = $('#contactForm');
  const status = $('#formStatus');
  const submit = $('#formSubmit');
  if (!form) return;

  const say = (state, msg) => {
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = msg;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      say('err', 'Please fill in the required fields so we can get back to you.');
      return;
    }
    if (form.elements._gotcha && form.elements._gotcha.value) return; // honeypot

    const original = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.hidden = true;

    try {
      const res = await fetch(form.action || FORM_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        form.reset();
        say('ok', 'Thanks — your enquiry is with us. We usually reply within one working day.');
      } else {
        const data = await res.json().catch(() => ({}));
        const detail = data.errors ? data.errors.map(x => x.message).join(', ') : '';
        say('err', detail || `Something went wrong sending that. Please ${FALLBACK_CONTACT}.`);
      }
    } catch (err) {
      console.error('[desmoshed] form submit failed', err);
      say('err', `We could not reach the server. Please ${FALLBACK_CONTACT}.`);
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
}

/* --------------------------------------------------------------------------
   8. Boot
   -------------------------------------------------------------------------- */
async function boot() {
  // Static bits first — these never block on data.
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  $$('[data-stars]').forEach(n => { n.innerHTML = starsHTML(n.dataset.stars); });
  const ratingEl = $('[data-stat-value]');
  if (ratingEl) ratingEl.textContent = LISTING.rating;
  const reviewsEl = $('[data-stat="reviews"]');
  if (reviewsEl) reviewsEl.textContent = LISTING.reviews;

  initHeaderState();
  initNavToggle();
  initLightbox();
  initForm();
  observeReveals();

  // Then the data-driven sections, in parallel.
  const [trust, services, fees, gallery, hours, faq, reviews] = await Promise.all([
    loadRows(SOURCES.trust),
    loadRows(SOURCES.services),
    loadRows(SOURCES.fees),
    loadRows(SOURCES.gallery),
    loadRows(SOURCES.hours),
    loadRows(SOURCES.faq),
    loadRows(SOURCES.reviews)
  ]);

  renderTrust(trust);
  renderServices(services);
  renderTable($('#feesTable'), fees, 'All work quoted before it starts. Prices vary by model, mileage and condition.');
  renderGallery(gallery);
  renderHours(hours);
  renderFaq(faq);
  renderReviews(reviews);

  observeReveals();   // pick up the nodes we just created
  initScrollspy();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
