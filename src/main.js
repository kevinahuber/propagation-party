import { showConfirmation } from './confirmation.js';
import { initForm } from './rsvp-form.js';
import { loadGallery } from './gallery.js';
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
loadGallery();
initCursors();
