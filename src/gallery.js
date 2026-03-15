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
