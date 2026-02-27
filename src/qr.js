import QRCode from 'qrcode';

const url = window.location.origin;
const canvas = document.getElementById('qr-canvas');
const label = document.getElementById('url-label');
const hint = document.getElementById('tap-hint');

// Size the QR code to fill the smaller viewport dimension
const size = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.85);

QRCode.toCanvas(canvas, url, {
  width: size,
  margin: 2,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#000000',
    light: '#ffffff',
  },
});

label.textContent = url.replace(/^https?:\/\//, '');

// Keep screen on via Wake Lock API
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
    } catch {
      // Silently ignore — not supported or permission denied
    }
  }
}

// Re-acquire wake lock if page becomes visible again (e.g. after tab switch)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

requestWakeLock();

// Fullscreen on tap/click (requires user gesture)
async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      hint.style.display = 'none';
    } catch {
      // Not supported or denied
    }
  } else {
    try {
      await document.exitFullscreen();
      hint.style.display = '';
    } catch {
      // Ignore
    }
  }
}

document.body.addEventListener('click', toggleFullscreen);
document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') toggleFullscreen();
});
