export function initCursors() {
  document.querySelectorAll('.tagline-word').forEach(word => {
    const emoji = word.getAttribute('data-emoji');
    if (!emoji) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 56;
    ctx.font = '22px serif';
    ctx.textAlign = 'left';

    let hx, hy;

    function drawStem(x, y1, y2) {
      ctx.save();
      ctx.strokeStyle = '#2e6b34'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x, y1); ctx.stroke();
      ctx.fillStyle = '#2e6b34';
      ctx.beginPath();
      ctx.moveTo(x, y1 + 22); ctx.bezierCurveTo(x - 10, y1 + 16, x - 12, y1 + 6, x - 8, y1 + 2);
      ctx.bezierCurveTo(x - 2, y1 + 14, x, y1 + 20, x, y1 + 22); ctx.fill();
      ctx.fillStyle = '#4a9e52';
      ctx.beginPath();
      ctx.moveTo(x, y1 + 10); ctx.bezierCurveTo(x + 10, y1 + 6, x + 12, y1 - 2, x + 8, y1 - 4);
      ctx.bezierCurveTo(x + 2, y1 + 8, x, y1 + 10, x, y1 + 10); ctx.fill();
      ctx.restore();
    }

    if (emoji === '✂️') {
      drawStem(52, 6, 52);
      ctx.fillText('✂️', 18, 38);
      hx = 42; hy = 26;
    } else if (emoji === '🌱') {
      ctx.fillStyle = '#5d4037';
      ctx.beginPath(); ctx.ellipse(32, 50, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('🌱', 20, 50);
      hx = 32; hy = 50;
    } else {
      // 🪴 Share — bundle of cuttings, cursor tip is itself a cutting
      ctx.save();
      ctx.strokeStyle = '#4a7c3f'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 22); ctx.stroke();
      ctx.fillStyle = '#2d5a27';
      ctx.beginPath(); ctx.moveTo(8, 10); ctx.bezierCurveTo(0, 8, -2, 2, 2, 0);
      ctx.bezierCurveTo(8, 4, 10, 8, 8, 10); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#5a8c3f'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(28, 4); ctx.lineTo(42, 24); ctx.stroke();
      ctx.fillStyle = '#8ab55a';
      ctx.beginPath(); ctx.moveTo(34, 12); ctx.bezierCurveTo(28, 8, 28, 2, 32, 2);
      ctx.bezierCurveTo(38, 4, 36, 10, 34, 12); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#3d6b32'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(14, 32); ctx.lineTo(44, 34); ctx.stroke();
      ctx.fillStyle = '#4a7c3f';
      ctx.beginPath(); ctx.moveTo(22, 28); ctx.bezierCurveTo(18, 22, 22, 18, 26, 20);
      ctx.bezierCurveTo(28, 26, 24, 30, 22, 28); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = '#5c3a1a'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(36, 38); ctx.lineTo(52, 52); ctx.stroke();
      ctx.fillStyle = '#7a4a28';
      ctx.beginPath(); ctx.ellipse(40, 42, 4, 2.5, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      hx = 0; hy = 0;
    }

    const url = `url(${canvas.toDataURL()}) ${hx} ${hy}, pointer`;
    word.addEventListener('mouseenter', () => { word.style.cursor = url; });
    word.addEventListener('mouseleave', () => { word.style.cursor = ''; });
  });
}
