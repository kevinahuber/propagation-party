import { createDrawingSection } from './drawing.js';
import { event } from '../event.config.js';

export function showConfirmation(section, rsvpName, rsvpPhone, rsvpResponse, rsvpGuests, rsvpNotes) {
  section.textContent = '';

  const heading = document.createElement('h2');
  heading.className = 'thank-you';
  heading.textContent = 'Thanks, ' + rsvpName + '!';
  section.appendChild(heading);

  // Calendar links
  const nav = document.createElement('nav');
  nav.className = 'cal-links';
  nav.setAttribute('aria-label', 'Add to calendar');

  const gcal = document.createElement('a');
  gcal.href = event.googleCalUrl;
  gcal.className = 'cal-link';
  gcal.target = '_blank';
  gcal.rel = 'noopener noreferrer';
  gcal.textContent = 'Google Calendar';
  nav.appendChild(gcal);

  const ics = document.createElement('a');
  ics.href = '/event.ics';
  ics.className = 'cal-link';
  ics.download = '';
  ics.textContent = 'Apple / Outlook';
  nav.appendChild(ics);

  section.appendChild(nav);

  // RSVP summary
  const dl = document.createElement('dl');
  dl.className = 'rsvp-summary';

  const fields = [
    ['Name', rsvpName],
    ['Response', rsvpResponse],
    ...(rsvpGuests > 0 ? [['Additional guests', String(rsvpGuests)]] : []),
    ...(rsvpNotes ? [['Notes', rsvpNotes]] : []),
  ];
  fields.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    dl.appendChild(dt);
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.appendChild(dd);
  });

  section.appendChild(dl);

  // Drawing
  section.appendChild(createDrawingSection());

  // Return
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'reset-btn';
  reset.textContent = 'Return to RSVP';
  reset.addEventListener('click', () => {
    try { sessionStorage.removeItem('rsvp'); } catch (e) {}
    location.reload();
  });
  section.appendChild(reset);
}
