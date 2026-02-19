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
    shownIds.add(row.id);
    const img = document.createElement('img');
    img.src = row.drawing;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'gallery-img';
    img.loading = 'lazy';
    grid.appendChild(img);
    added++;
  });

  if (added > 0) {
    const section = document.getElementById('gallery-section');
    if (section) section.hidden = false;
  }
}

export const loadGallery = fetchAndRender;
export const refreshGallery = fetchAndRender;
