import { defineConfig } from 'vite';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { event } from './event.config.js';

// Token map — every {{TOKEN}} used in HTML files
const tokens = {
  EVENT_NAME:              event.name,
  EVENT_DATE:              event.date,
  EVENT_DATE_LONG:         event.dateLong,
  EVENT_YEAR:              event.year,
  EVENT_TIME:              event.timeDisplay,
  EVENT_TIME_SHORT:        event.timeShort,
  EVENT_LOCATION:          event.location,
  EVENT_LOCATION_SHORT:    event.locationShort,
  EVENT_URL:               event.url,
  EVENT_DOMAIN:            event.domain,
  EVENT_OG_TITLE:          event.ogTitle,
  EVENT_OG_DESCRIPTION:    event.ogDescription,
  EVENT_OG_IMAGE:          event.ogImageUrl,
  EVENT_OG_IMAGE_ALT:      event.ogImageAlt,
  EVENT_TWITTER_DESC:      event.twitterDescription,
  EVENT_META_DESCRIPTION:  event.metaDescription,
  EVENT_THANKS_DESC:       event.thanksDescription,
  EVENT_GOOGLE_CAL_URL:    event.googleCalUrl,
};

function icsContent() {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${event.name}//EN`,
    'BEGIN:VEVENT',
    `DTSTART;TZID=${event.timezone}:${event.dateIso}T${event.startTimeIso}`,
    `DTEND;TZID=${event.timezone}:${event.dateIso}T${event.endTimeIso}`,
    `SUMMARY:${event.name}`,
    `LOCATION:${event.location}`,
    'DESCRIPTION:Plant propagation party! Bring your clippings and seedlings to swap.',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function eventPlugin() {
  return {
    name: 'event-config',

    // Runs at dev-server start and before every build —
    // writes public/event.ics so Vite serves/copies the fresh version.
    buildStart() {
      writeFileSync(resolve('public/event.ics'), icsContent());
    },

    // Replace {{TOKEN}} in every HTML page at build and dev serve time.
    transformIndexHtml(html) {
      return Object.entries(tokens).reduce(
        (out, [key, val]) => out.replaceAll(`{{${key}}}`, val),
        html
      );
    },
  };
}

export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [eventPlugin()],
  build: {
    rollupOptions: {
      input: {
        main:   'index.html',
        thanks: 'thanks.html',
        qr:     'qr.html',
      },
    },
  },
});
