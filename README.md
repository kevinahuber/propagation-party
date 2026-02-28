# Propagation Party

Event site for Kevin's plant propagation party — March 21, 5–10 PM, Inglewood, East Nashville.

**Live:** https://propagation.kevcreates.art

---

## Stack

- **Vite** — build tool, dev server (port 5174)
- **Vanilla JS** — no framework, ES modules
- **Supabase** — RSVP storage + drawing gallery (see `src/supabase.js`)
- **`qrcode`** npm package — QR canvas rendering on `/qr`
- **Uncial Antiqua** — self-hosted web font for `<h1>` (`/fonts/uncial-antiqua.woff2`)
- Deployed via **GitHub Pages** from the `dist/` directory

---

## Pages & Routes

| Route | File | Purpose |
|---|---|---|
| `/` | `index.html` | RSVP form + FAQ + guest drawing gallery |
| `/thanks` | `thanks.html` | Post-RSVP confirmation + add-to-calendar links |
| `/qr` | `qr.html` | Fullscreen QR code for display/projection |

---

## Dev

```sh
npm run dev      # starts at http://localhost:5174
npm run build    # outputs to dist/
npm run preview  # preview the build locally
```

---

## Key Files

```
index.html          Main RSVP page
thanks.html         Post-RSVP confirmation
qr.html             QR display page (self-contained styles, no styles.css)
styles.css          All styles for index + thanks
src/
  main.js           Entry: wires up form, gallery, cursors
  rsvp-form.js      RSVP form logic + Supabase submission
  confirmation.js   Post-submit confirmation state
  gallery.js        Guest drawing gallery (loads from Supabase storage)
  drawing.js        Canvas drawing tool shown after RSVP
  cursors.js        Custom plant cursor animations
  colors.js         Drawing palette color definitions
  supabase.js       Supabase client (URL + publishable key)
  qr.js             QR canvas generation, wake lock, fullscreen toggle
public/
  CNAME             propagation.kevcreates.art
  robots.txt        Disallow all (private invite site)
  event.ics         Calendar file for Apple/Outlook download
  og-image.svg      Source for OG image (og-image.png in dist)
fonts/
  uncial-antiqua.woff2
```

---

## Design System

| Token | Value | Use |
|---|---|---|
| `--accent` | `#e91e8c` (light) / `#ff6eb4` (dark) | Pink — CTAs, tagline, focus rings |
| `--highlight` | `#ffe14d` (light) / `#4a3d00` (dark) | Yellow — selected radio, stepper bg |
| `--bg` | `#fffdf5` / `#0e0e0e` | Page background |
| `--text` | `#1a1a1a` / `#e8e8e8` | Body text |
| `--border` / `--shadow` | `#1a1a1a` / `#e8e8e8` | Hard neo-brutalist borders + box-shadows |
| Green dark | `#2e6b34` | Plant stems, icon accents |
| Green mid | `#4a9e52` | Plant leaves |

**Fonts:** `Uncial Antiqua` for `<h1>`, system monospace (`SF Mono`, Menlo, Consolas) for everything else.

**Aesthetic:** neo-brutalist — hard borders, offset box-shadows (`4px 4px 0`), no border-radius, uppercase tracking, custom plant cursors.

---

## Supabase

Config lives in `src/supabase.js` — publishable anon key, safe to commit.

Tables:
- `rsvps` — name, phone, rsvp (Yes/No/Maybe), additional_guests, notes, website (honeypot)

Storage bucket:
- `drawings` — guest drawing PNGs, loaded in the gallery section

---

## Accessibility Standards

- WCAG AA contrast throughout (minimum 4.54:1 for body text, 3:1 for large text)
- Semantic HTML: `<main>`, `<header>`, `<nav>`, `<section>`, `<fieldset>`, `<legend>`
- Skip navigation link on index + thanks
- All interactive elements keyboard-accessible with `:focus-visible` rings
- `aria-live="polite"` on form status
- `aria-hidden="true"` on all decorative elements (custom cursors, plant SVGs)
- `prefers-reduced-motion` respected on all CSS animations
- `prefers-color-scheme` dark mode supported on index + thanks (QR page forces light)

---

## Common Tasks

**Update the event date/time/location:** Edit the `<p class="subtitle">` in `index.html` and `thanks.html`, and the Google Calendar link in `thanks.html`.

**Add a FAQ item:** Add a `<details>/<summary>` pair inside `.faq` in `index.html`.

**Add to the drawing palette:** Edit `src/colors.js`.

**Change the OG image:** Replace `og-image.png` in `dist/` (source SVG is `public/og-image.svg`).
