# Drawing Gallery Web Component Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the gallery from imperative DOM manipulation into a self-initializing `<drawing-gallery>` light DOM web component.

**Architecture:** Single custom element (`DrawingGallery extends HTMLElement`) that renders its own markup in `connectedCallback`, fetches from supabase, and manages loader/grid visibility. Light DOM so existing CSS works unchanged.

**Tech Stack:** Vanilla JS (Custom Elements v1), Supabase JS client

---

## Chunk 1: Implementation

### Task 1: Rewrite gallery.js as custom element

**Files:**
- Modify: `src/gallery.js` (full rewrite)

- [ ] **Step 1: Rewrite `src/gallery.js`**

Replace entire file with the `DrawingGallery` custom element class and `refreshGallery` export:

```js
import { supabase } from './supabase.js';

class DrawingGallery extends HTMLElement {
  #shownIds = new Set();
  #initialized = false;

  connectedCallback() {
    if (this.#initialized) return;
    this.#initialized = true;
    this.className = 'gallery';

    this.innerHTML = `
      <h2 id="gallery-heading">Guest drawings <small>(can add upon RSVP)</small></h2>
      <div class="gallery-loader" role="status" hidden>
        <svg class="gallery-loader-svg" width="80" height="160" viewBox="0 0 80 160" fill="none" aria-hidden="true">
          <line class="loader-stem" x1="40" y1="75" x2="40" y2="35" stroke="#2e6b34" stroke-width="2.5" stroke-linecap="round"/>
          <path class="loader-leaf-l" d="M40 50c-4-2-6-6-5-10 4 0 7 3 8 7" fill="#2e6b34"/>
          <path class="loader-leaf-r" d="M40 42c3-3 7-4 10-3-1 4-4 6-7 7" fill="#4a9e52"/>
          <line class="loader-root-tap" x1="40" y1="75" x2="40" y2="130" stroke="#795548" stroke-width="2.5" stroke-linecap="round" pathLength="1"/>
          <path class="loader-root-l" d="M40 78 Q28 98 18 128" stroke="#795548" stroke-width="2" stroke-linecap="round" pathLength="1"/>
          <path class="loader-root-r" d="M40 78 Q52 98 62 128" stroke="#795548" stroke-width="2" stroke-linecap="round" pathLength="1"/>
          <path class="loader-root-il" d="M40 82 Q33 98 28 120" stroke="#795548" stroke-width="1.5" stroke-linecap="round" pathLength="1"/>
          <path class="loader-root-ir" d="M40 82 Q47 98 52 120" stroke="#795548" stroke-width="1.5" stroke-linecap="round" pathLength="1"/>
        </svg>
        <span class="sr-only">Loading drawings...</span>
      </div>
      <div class="gallery-grid" hidden></div>
    `;

    this.setAttribute('role', 'region');
    this.setAttribute('aria-labelledby', 'gallery-heading');
    this.#fetch(true);
  }

  async #fetch(isFirstLoad) {
    const loader = this.querySelector('.gallery-loader');
    const grid = this.querySelector('.gallery-grid');

    if (isFirstLoad) {
      this.hidden = false;
      loader.hidden = false;
    }

    const { data, error } = await supabase
      .from('drawings')
      .select('id, drawing')
      .order('created_at', { ascending: true });

    loader.hidden = true;

    if (!error && data?.length) {
      data.forEach(row => {
        if (this.#shownIds.has(row.id)) return;
        if (!/^data:image\/(png|jpeg|gif|webp);base64,/.test(row.drawing)) return;
        this.#shownIds.add(row.id);
        const img = document.createElement('img');
        img.src = row.drawing;
        img.alt = 'Guest drawing';
        img.className = 'gallery-img';
        img.loading = 'lazy';

        const link = document.createElement('a');
        link.href = row.drawing;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', 'Open drawing in new tab');
        link.addEventListener('click', e => {
          e.preventDefault();
          fetch(row.drawing)
            .then(r => r.blob())
            .then(blob => {
              const url = URL.createObjectURL(blob);
              const tab = window.open(url, '_blank');
              tab?.addEventListener('pagehide', () => URL.revokeObjectURL(url));
            });
        });
        link.appendChild(img);
        grid.appendChild(link);
      });
      grid.hidden = false;
    } else if (isFirstLoad) {
      this.hidden = true;
    }
  }

  refresh() {
    this.#fetch(false);
  }
}

customElements.define('drawing-gallery', DrawingGallery);

export function refreshGallery() {
  document.querySelector('drawing-gallery')?.refresh();
}
```

### Task 2: Update index.html

**Files:**
- Modify: `index.html:147-163`

- [ ] **Step 2: Replace gallery section in `index.html`**

Replace lines 147-163 (the entire `<section class="gallery" ...>...</section>` block) with:

```html
    <drawing-gallery hidden></drawing-gallery>
```

### Task 3: Update main.js

**Files:**
- Modify: `src/main.js:3,17`

- [ ] **Step 3: Remove `loadGallery` import and call from `src/main.js`**

Remove line 3 (`import { loadGallery } from './gallery.js';`) and line 17 (`loadGallery();`).

Add `import './gallery.js';` to register the custom element (side-effect import).

Updated `main.js`:

```js
import { showConfirmation } from './confirmation.js';
import { initForm } from './rsvp-form.js';
import './gallery.js';
import { initCursors } from './cursors.js';

// Restore confirmation if already submitted this session
try {
  const saved = sessionStorage.getItem('rsvp');
  if (saved) {
    const data = JSON.parse(saved);
    const section = document.querySelector('.rsvp-section');
    if (section) showConfirmation(section, data.name, null, data.rsvp, data.guests, data.notes);
  }
} catch (e) {}

initForm();
initCursors();
```

### Task 4: Verify no changes needed in drawing.js

**Files:**
- Read: `src/drawing.js:3,100`

- [ ] **Step 4: Confirm `drawing.js` still works**

`drawing.js` line 3 imports `{ refreshGallery }` from `./gallery.js` and calls it on line 100. The new `gallery.js` exports the same `refreshGallery` function — no changes needed.

### Task 5: Manual smoke test

- [ ] **Step 5: Open the page in browser and verify**

Run: `npx vite` (or however the dev server starts)

Verify:
1. Page loads — gallery section is hidden initially
2. If drawings exist in supabase, they appear in the grid after loading
3. Loader SVG animation shows during fetch on first load
4. If no drawings, the component stays hidden
5. After submitting a drawing, `refreshGallery()` adds it to the grid without a loader

### Task 6: Commit

- [ ] **Step 6: Commit all changes**

```bash
git add src/gallery.js index.html src/main.js
git commit -m "Convert gallery to <drawing-gallery> web component

Co-locates markup and fetch logic into a self-initializing custom element.
Light DOM preserves existing CSS. drawing.js integration unchanged."
```
