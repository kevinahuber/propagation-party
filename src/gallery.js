import { supabase } from './supabase.js';

const shownIds = new Set();

async function fetchAndRender() {
  const { data, error } = await supabase
    .from('drawings')
    .select('id, drawing')
    .order('created_at', { ascending: true });

  if (error || !data?.length) return;

  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  let added = 0;
  data.forEach(row => {
    if (shownIds.has(row.id)) return;
    if (!/^data:image\/(png|jpeg|gif|webp);base64,/.test(row.drawing)) return; // reject svg and non-base64 data URLs
    shownIds.add(row.id);
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
    added++;
  });

  if (added > 0) {
    const section = document.getElementById('gallery-section');
    if (section) section.hidden = false;
  }
}

export const loadGallery = fetchAndRender;
export const refreshGallery = fetchAndRender;
