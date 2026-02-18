import { supabase } from './supabase.js';

export async function loadGallery() {
  const { data, error } = await supabase
    .from('drawings')
    .select('drawing')
    .order('created_at', { ascending: true });

  if (error || !data?.length) return;

  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  data.forEach(row => {
    const img = document.createElement('img');
    img.src = row.drawing;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = 'gallery-img';
    img.loading = 'lazy';
    grid.appendChild(img);
  });

  const section = document.getElementById('gallery-section');
  if (section) section.hidden = false;
}
