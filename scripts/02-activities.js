function card(i) {
  const c = h('article', 'card rv');
  const m = h('div', 'media');
  if (i.image) { const im = h('img'); im.src = i.image; im.alt = i.judul || ''; im.loading = 'lazy'; m.appendChild(im); }
  else m.appendChild(h('span', 'jp-mark', '活'));
  const b = h('div', 'cbody');
  const meta = h('div', 'meta');
  meta.append(h('span', null, i.kategori || 'Kegiatan'), h('span', null, fmtDate(i.tanggal)));
  b.append(meta, h('h3', 'serif', i.judul || 'Tanpa judul'), h('p', 'desc', i.deskripsi || ''), h('p', 'unit', i.unit || ''));
  c.append(m, b);
  return c;
}

function render() {
  const chips = $('#chips'), grid = $('#grid');
  const cats = ['Semua', ...new Set(items.map(i => i.kategori).filter(Boolean))];
  chips.innerHTML = '';
  if (cats.length > 1) cats.forEach(c => {
    const b = h('button', c === filter ? 'on' : '', c);
    b.onclick = () => { filter = c; render(); };
    chips.appendChild(b);
  });
  grid.innerHTML = '';
  const list = items.filter(i => filter === 'Semua' || i.kategori === filter);
  if (!list.length) grid.appendChild(h('div', 'empty', db ? 'Belum ada kegiatan yang diunggah.' : 'Daftar kegiatan belum tersedia.'));
  list.forEach(i => grid.appendChild(card(i)));

  renderLayers();
  renderGallery();
  renderDocs();
  renderScan();
  observe();
}

const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 }) : null;
function observe() {
  document.querySelectorAll('.rv:not(.in)').forEach(el => { io ? io.observe(el) : el.classList.add('in'); });
}



$('#btnLihat').onclick = () => document.getElementById('kegiatan').scrollIntoView({ behavior: 'smooth' });
