// ── Single source of truth for all event details ─────────────────────────
// Edit here, then run: npm run build
// Also update manually: og-image.svg (title, date, URL text)

export const event = {
  name:       'Propagation Party',
  tagline:    'Clip. Sow. Share.',

  // Date & time
  dayOfWeek:    'Saturday',
  date:         'March 21',        // short — used in headings, titles
  dateLong:     'Saturday, March 21st', // long — used in FAQ body
  year:         '2026',
  dateIso:      '20260321',        // YYYYMMDD for iCal / Google Calendar
  timeDisplay:  '5 – 10 PM',      // en-spaced, for headings/subtitles
  timeShort:    '5–10 PM',        // compact, for OG titles
  startTimeIso: '170000',         // HHMMSS
  endTimeIso:   '220000',
  timezone:     'America/Chicago',

  // Location
  location:        'Inglewood, East Nashville, Tennessee',
  locationShort:   'Inglewood, East Nashville, TN',

  // Site
  domain: 'propagation.kevcreates.art',
  url:    'https://propagation.kevcreates.art',
};

// Derived values — computed once from the fields above
const e = event;

e.ogTitle    = `${e.name} — ${e.date}, ${e.timeShort}`;
e.ogImageUrl = `${e.url}/og-image.png`;
e.ogImageAlt = `${e.name} event poster — ${e.dayOfWeek}, ${e.date}, ${e.timeShort}, ${e.location}`;

e.metaDescription   = `A plant swap in ${e.locationShort} — ${e.dayOfWeek}, ${e.date}, ${e.timeShort}. Bring clippings and seedlings, leave with new plants. RSVP here.`;
e.ogDescription     = `A plant swap in ${e.location}. Bring clippings and seedlings, leave with new plants. Drinks, grill, glow lights, good people.`;
e.twitterDescription = `A plant swap in ${e.location}. Bring clippings and seedlings, leave with new plants.`;
e.thanksDescription = `Thanks for RSVPing to the ${e.name}! See you ${e.date} in ${e.locationShort}.`;

e.googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
  `&text=${encodeURIComponent(e.name)}` +
  `&dates=${e.dateIso}T${e.startTimeIso}/${e.dateIso}T${e.endTimeIso}` +
  `&ctz=${e.timezone}` +
  `&location=${encodeURIComponent(e.location)}` +
  `&details=Plant%20propagation%20party!%20Bring%20your%20clippings%20and%20seedlings%20to%20swap.`;
