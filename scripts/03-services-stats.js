function setCount(el, to) {
  if (!el) return;
  const from = parseInt(el.textContent) || 0, t0 = performance.now();
  (function step(now) {
    const p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
function renderLayers() {
  const srows = $('#srows');
  if (!srows) return;
  const cats = {};
  items.forEach(i => { if (i.kategori) cats[i.kategori] = (cats[i.kategori] || 0) + 1; });
  srows.innerHTML = '';
  const keys = Object.keys(cats);
  if (!keys.length) srows.appendChild(h('li', 'empty', db ? 'Belum ada layanan.' : 'Layanan belum tersedia.'));
  keys.forEach((k, n) => {
    const li = h('li', 'srow rv');
    li.append(h('span', 'idx', String(n + 1).padStart(2, '0')), h('h3', null, k), h('span', 'cnt', cats[k] + ' kegiatan'), h('span', 'go', '→'));
    li.onclick = () => { filter = k; render(); document.getElementById('kegiatan').scrollIntoView({ behavior: 'smooth' }); };
    srows.appendChild(li);
  });
  setCount($('#sKeg'), items.length);
  setCount($('#sUnit'), new Set(items.map(i => i.unit).filter(Boolean)).size);
  setCount($('#sKat'), keys.length);
}
