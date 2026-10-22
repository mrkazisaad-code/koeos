# Koeos website

A single-page static site built from *Koeos website: design and content specification* (21 Oct 2026). The only server dependency is the contact form endpoint.

## Hosting

- **GitHub Pages, custom domain `koeos.io`.** `.github/workflows/deploy.yml` builds the site from the repository root on every push to `main` and publishes `dist/`. In Settings → Pages, Source must be **GitHub Actions**.
- `public/CNAME` keeps `koeos.io` in the published output. The domain itself is set in Settings → Pages.
- The previous HTML site is archived, unchanged, in `legacy-site-backup/`. It is not published. Its old page URLs (`/contact.html`, `/team.html` and so on) redirect to the matching section of the new page (`public/*.html`). The full pre-migration state is also on the branch `backup/legacy-site-before-astro`.

## Commands

```sh
npm install
npm run dev          # Astro dev server (the form endpoint is not available here)
npm run build        # static build to dist/ + content guardrails
npm run preview      # serves dist/ with /api/contact on http://localhost:4321 (console delivery)
npm run check:content -- --release   # fails while owner items below are still open
npm run gen:map      # regenerate the A7 Europe outline (build-time only)
npm run gen:og       # regenerate og.png and PNG icons
```

QA scripts (need `npm run preview` running): `node qa/shots.mjs [--w=360,768] [--reduced] [--nojs]` for screenshots, and `node qa/interact.mjs` for the interaction checks (popovers, dialogs, menu, header, form, reduced motion, no-JS).

## Architecture

- **Astro 5, static output, TypeScript.** No UI framework. All CSS is inlined into the HTML, so the first response carries the styles.
- **Design tokens** are CSS custom properties in `src/styles/global.css`: palette, fluid type scale (mobile value at 360px up to desktop value at 1440px), spacing, grid and motion timings.
- **Fonts** are self-hosted Latin-subset WOFF2 files (`public/fonts`): Schibsted Grotesk 500/700, IBM Plex Sans 400/600 and IBM Plex Mono 500. They use `font-display: swap`, the two heading weights are preloaded, and the fallback faces carry metric overrides so the font swap causes no layout shift. The page makes no requests to Google.
- **Sections** live one per component in `src/components/sections/`. The copy follows section 7 of the spec word for word.
- **Diagrams** are inline SVG (A3 to A7). A4 and A8 are drawn in the DOM, and A1 uses one 2D canvas. The A6 and A7 diagrams each come in two compositions (wide and compact) so their labels stay at about 11px on every screen, rather than shrinking.
- **The HTML holds the final state** of every scene: drawn lines, lit nodes, outcome counters and final figures. Initial states are applied only under `html.js.motion`. The `motion` class is set by a tiny inline script when `prefers-reduced-motion` is not `reduce`. With JavaScript off or reduced motion on, every section renders complete.
- **JavaScript** is one module of about 7.6 KB gzip (`src/scripts/`). Each enhancement runs inside a try/catch. If one fails, the page drops back to the static final state.
- **Source markers** use the native Popover API. Click, tap, keyboard, Escape and outside click all work without JavaScript. The script adds positioning next to the marker and opening on hover.
- **Contact form**:
  - `server/contact/` holds a provider-agnostic handler built on web-standard `Request`/`Response`, with shared validation (also used in the browser), a honeypot, rate limiting (5 per IP per 10 minutes, using a salted hash of the IP and never the raw address) and pluggable delivery (email API or webhook).
  - `functions/api/contact.ts` is the Cloudflare Pages adapter. To change provider, write a new adapter around `handleContact`.
  - Nothing is stored beyond the time it takes to deliver the message.
  - Without JavaScript the form posts natively and the handler returns a minimal HTML page.

### Form delivery: Google Apps Script

The form posts to a Google Apps Script web app (`CONTACT_ENDPOINT` in `src/config/site.ts`). The script validates each enquiry, filters spam, rate-limits it and emails it to the inbox set in its `RECIPIENT` script property. It stores nothing.

- **Script source:** `docs/contact-form-apps-script.gs`, a copy of what is deployed. After editing the script in Google, use **Deploy > Manage deployments > pencil > Version: New version > Deploy**. That keeps the same URL; a "New deployment" creates a new URL that would need updating here.
- **With JavaScript:** the form sends JSON as `text/plain`, a "simple" request, so the browser does not need a preflight that Apps Script cannot answer. The script replies with `{ status, ok, errors }` and the form shows inline errors or the success message.
- **Without JavaScript:** the form posts normally and the script returns a short confirmation page with a link back.
- **Rate limits:** at most 20 messages an hour across the site and 3 an hour per email address. Apps Script does not see visitors' IP addresses.

The handler in `server/contact/` stays as the alternative for a host that runs server functions.

### Deploying the form on Cloudflare Pages (alternative host)

Set `EMAIL_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` and `RATE_SALT`, and optionally a `RATE_KV` KV binding, which shares rate limits across instances. You can set `CONTACT_WEBHOOK_URL` to deliver to a webhook instead. Use an EU-region mail provider.

## Owner decisions (Oct 2026)

- Acquisition wording on the logistics card: confirmed and shown.
- “180 people”: confirmed.
- Source 3 (Sequoia): kept pointing at sequoiacap.com. Its unverified URL and date are a non-blocking build note.
- Source 7: now the European Commission’s own page (around 14% of GDP, around €2 trillion), so the copy reads “about 14% of GDP”.
- Privacy notice: approved. Revisit it once the form provider is chosen.

Still to confirm: the contact email (`info@koeos.io`, as on the previous site) in `src/config/site.ts`.

## Content revision (22 Oct 2026)

Implements *koeos.io revision spec: content and hero animation*. Copy changed in every section except 04. Section 07 is now “From Luxembourg, into Europe”. The sources list is down to five entries, and the metadata is updated (title, description, social tags, social image). Other changes:

- **Hero field:** a fixed box, max 640 × 420 in the right column on desktop. Below 1024px it sits under the buttons at full width, with height 0.6 × width. It is sized by a ResizeObserver. Gates are at 0.18–0.72, and the revenue curve is flatter (x 0.74–0.98, rise 0.28).
- **Counters:** one element each, holding the final value, so text extraction reads every figure once.
- **Ticker:** the loop copy is cloned in JavaScript and marked aria-hidden.
- **Contact form:** the old “starting point” labels map to the new ones in `server/contact/validate.ts`.
