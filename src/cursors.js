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
      // 🪴 Share — bouquet of plant cuttings, hotspot at bundle base
      canvas.width = 72;
      canvas.height = 72;

      const bx = 36, by = 62; // bundle base / hotspot

      // Each stem: tip x/y, stem color, leaf color, leaf side (+1 right, -1 left), leaf position along stem
      const stems = [
        { tx: 36, ty:  4, sc: '#1a3a1a', lc: '#2e6b34', ls:  1, lp: 0.42 },
        { tx: 20, ty:  8, sc: '#2e6b34', lc: '#4a8c3f', ls: -1, lp: 0.45 },
        { tx: 52, ty:  8, sc: '#3d6b32', lc: '#5a8c3f', ls:  1, lp: 0.45 },
        { tx:  8, ty: 22, sc: '#4a7c3f', lc: '#8ab55a', ls: -1, lp: 0.48 },
        { tx: 64, ty: 22, sc: '#2d5a27', lc: '#6b9e45', ls:  1, lp: 0.48 },
      ];

      stems.forEach(({ tx, ty, sc, lc, ls, lp }) => {
        const dx = tx - bx, dy = ty - by;
        const len = Math.sqrt(dx * dx + dy * dy);
        // perpendicular unit vector for leaf direction
        const px = -dy / len * ls, py = dx / len * ls;
        // leaf base point along stem
        const lx = bx + dx * lp, ly = by + dy * lp;

        // Stem (slightly curved via quadratic)
        ctx.save();
        ctx.strokeStyle = sc;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(bx + dx * 0.5 + px * 4, by + dy * 0.5 + py * 4, tx, ty);
        ctx.stroke();

        // Leaf
        ctx.fillStyle = lc;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.quadraticCurveTo(lx + px * 11 + dx / len * 4, ly + py * 11 + dy / len * 4, lx + dx / len * 10, ly + dy / len * 10);
        ctx.quadraticCurveTo(lx + px * 5, ly + py * 5, lx, ly);
        ctx.fill();
        ctx.restore();
      });

      // Twine binding
      ctx.save();
      ctx.strokeStyle = '#8b6914';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx - 7, by - 6);
      ctx.bezierCurveTo(bx - 5, by - 10, bx + 5, by - 10, bx + 7, by - 6);
      ctx.stroke();
      ctx.restore();

      hx = bx; hy = by;
    }

    const url = `url(${canvas.toDataURL()}) ${hx} ${hy}, pointer`;
    word.addEventListener('mouseenter', () => { word.style.cursor = url; });
    word.addEventListener('mouseleave', () => { word.style.cursor = ''; });
  });
}
