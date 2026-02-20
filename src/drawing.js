import { supabase } from './supabase.js';
import { randomPalette } from './colors.js';
import { refreshGallery } from './gallery.js';

export function createDrawingSection() {
  let rsvpDrawing;
  try { rsvpDrawing = JSON.parse(sessionStorage.getItem('rsvp')).drawing; } catch (e) {}

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

  if (rsvpDrawing) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = rsvpDrawing;
  }

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
  saveDrawBtn.textContent = rsvpDrawing ? 'Update drawing' : 'Save drawing';
  drawControls.appendChild(saveDrawBtn);

  const drawStatus = document.createElement('p');
  drawStatus.className = 'form-status';
  drawStatus.setAttribute('role', 'status');
  drawStatus.setAttribute('aria-live', 'polite');
  drawControls.appendChild(drawStatus);

  drawSection.appendChild(drawControls);

  // Save handler
  let drawingId;
  try { drawingId = JSON.parse(sessionStorage.getItem('rsvp')).drawingId; } catch (e) {}

  saveDrawBtn.addEventListener('click', async () => {
    const dataUrl = canvas.toDataURL('image/png');
    saveDrawBtn.disabled = true;
    saveDrawBtn.textContent = 'Saving...';
    drawStatus.textContent = '';
    drawStatus.className = 'form-status';
    try {
      let result;
      if (drawingId) {
        result = await supabase.from('drawings').update({ drawing: dataUrl }).eq('id', drawingId);
      } else {
        const newId = crypto.randomUUID();
        result = await supabase.from('drawings').insert({ id: newId, drawing: dataUrl });
        if (!result.error) drawingId = newId;
      }
      if (result.error) {
        drawStatus.textContent = 'Failed: ' + (result.error.message || JSON.stringify(result.error));
        drawStatus.className = 'form-status form-status--error';
        saveDrawBtn.disabled = false;
        saveDrawBtn.textContent = 'Save drawing';
      } else {
        try {
          const saved = JSON.parse(sessionStorage.getItem('rsvp'));
          saved.drawing = dataUrl;
          saved.drawingId = drawingId;
          sessionStorage.setItem('rsvp', JSON.stringify(saved));
        } catch (e) {}
        saveDrawBtn.disabled = false;
        saveDrawBtn.textContent = 'Saved!';
        setTimeout(() => { saveDrawBtn.textContent = 'Update drawing'; }, 2000);
        refreshGallery();
      }
    } catch (err) {
      drawStatus.textContent = 'Failed to save. Try again.';
      drawStatus.className = 'form-status form-status--error';
      saveDrawBtn.disabled = false;
      saveDrawBtn.textContent = 'Save drawing';
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
