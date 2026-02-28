import QRCode from 'qrcode';

const url = window.location.origin;
const canvas = document.getElementById('qr-canvas');
const label = document.getElementById('url-label');
const btn = document.getElementById('fullscreen-btn');

// Size the QR to fill available space without crowding the tagline/plants.
const isMobile = window.innerWidth <= 640;
const reservedV = isMobile ? 200 : 160;
const size = Math.floor(
  Math.min(window.innerWidth * 0.88, window.innerHeight - reservedV)
);

// Render at device pixel ratio for retina sharpness, scale back via CSS.
const dpr = Math.min(window.devicePixelRatio || 1, 3);
QRCode.toCanvas(canvas, url, {
  width: size * dpr,
  margin: 4,                 // full 4-module quiet zone per QR spec
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
});
canvas.style.width = size + 'px';
canvas.style.height = size + 'px';

label.textContent = url.replace(/^https?:\/\//, '');

// ── Wake lock: keep screen on ──────────────────────────────────────────────
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
    } catch { /* permission denied or not supported */ }
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') requestWakeLock();
});

requestWakeLock();

// ── Fullscreen toggle ──────────────────────────────────────────────────────
async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = 'Exit fullscreen';
    } catch { /* not supported */ }
  } else {
    try {
      await document.exitFullscreen();
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = 'Tap or press Enter for fullscreen';
    } catch { /* ignore */ }
  }
}

// Button is the canonical trigger (keyboard + pointer).
btn.addEventListener('click', toggleFullscreen);

// "Tap anywhere" convenience for pointer users — skip the button to avoid
// double-firing, which would immediately re-toggle fullscreen.
document.body.addEventListener('click', (e) => {
  if (!e.target.closest('#fullscreen-btn')) toggleFullscreen();
});

// Sync aria-pressed if the user exits fullscreen via Escape or browser UI.
document.addEventListener('fullscreenchange', () => {
  const inFS = !!document.fullscreenElement;
  btn.setAttribute('aria-pressed', String(inFS));
  btn.textContent = inFS ? 'Exit fullscreen' : 'Tap or press Enter for fullscreen';
});
