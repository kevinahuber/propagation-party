import { supabase } from './supabase.js';
import { randomPalette } from './colors.js';
import { refreshGallery } from './gallery.js';

export function createDrawingSection() {
  const drawSection = document.createElement('div');
  drawSection.className = 'draw-section';

  const drawLabel = document.createElement('label');
  drawLabel.textContent = 'Draw a picture';
  drawSection.appendChild(drawLabel);

  const canvasWrapper = document.createElement('div');
  canvasWrapper.className = 'draw-canvas-wrapper';

  const canvas = document.createElement('canvas');
  canvas.className = 'draw-canvas';
  canvas.width = 400;
  canvas.height = 200;
  canvasWrapper.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;

  const palette = document.createElement('div');
  palette.className = 'draw-palette';

  const colors = randomPalette(6);
  let currentColor = colors[0];

  colors.forEach((color, i) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch' + (i === 0 ? ' active' : '');
    swatch.style.background = color;
    swatch.setAttribute('aria-label', color === '#ffffff' ? 'Eraser' : 'Color ' + color);
    swatch.addEventListener('click', () => {
      palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      currentColor = color;
    });
    palette.appendChild(swatch);
  });

  canvasWrapper.appendChild(palette);
  drawSection.appendChild(canvasWrapper);

  // Controls
  const drawControls = document.createElement('div');
  drawControls.className = 'draw-controls';

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'notes-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
  drawControls.appendChild(clearBtn);

  const saveDrawBtn = document.createElement('button');
  saveDrawBtn.type = 'button';
  saveDrawBtn.className = 'notes-btn';
  saveDrawBtn.textContent = 'Post it';
  drawControls.appendChild(saveDrawBtn);

  const drawStatus = document.createElement('p');
  drawStatus.className = 'form-status';
  drawStatus.setAttribute('role', 'status');
  drawStatus.setAttribute('aria-live', 'polite');
  drawControls.appendChild(drawStatus);

  drawSection.appendChild(drawControls);

  // Save handler
  saveDrawBtn.addEventListener('click', async () => {
    const dataUrl = canvas.toDataURL('image/png');
    saveDrawBtn.disabled = true;
    saveDrawBtn.textContent = 'Posting...';
    drawStatus.textContent = '';
    drawStatus.className = 'form-status';
    try {
      const result = await supabase.from('drawings').insert({ id: crypto.randomUUID(), drawing: dataUrl });
      if (result.error) {
        drawStatus.textContent = 'Failed: ' + (result.error.message || JSON.stringify(result.error));
        drawStatus.className = 'form-status form-status--error';
        saveDrawBtn.disabled = false;
        saveDrawBtn.textContent = 'Post it';
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveDrawBtn.disabled = false;
        saveDrawBtn.textContent = 'Posted!';
        setTimeout(() => { saveDrawBtn.textContent = 'Post it'; }, 2000);
        refreshGallery();
      }
    } catch (err) {
      drawStatus.textContent = 'Failed to save. Try again.';
      drawStatus.className = 'form-status form-status--error';
      saveDrawBtn.disabled = false;
      saveDrawBtn.textContent = 'Post it';
    }
  });

  // Draw events
  let drawing = false;
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }
  canvas.addEventListener('mousedown', e => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
  });
  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  });
  canvas.addEventListener('mouseup', () => { drawing = false; });
  canvas.addEventListener('mouseleave', () => { drawing = false; });
  canvas.addEventListener('touchstart', e => {
    e.preventDefault(); drawing = true;
    const pos = getPos(e);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = currentColor;
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  }, { passive: false });
  canvas.addEventListener('touchend', () => { drawing = false; });

  return drawSection;
}
