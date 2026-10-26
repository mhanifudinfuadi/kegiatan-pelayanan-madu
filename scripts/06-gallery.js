const galleryIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
}, { threshold: 0.35 }) : null;

function renderGallery() {
  const wrap = $('#stackWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!items.length) {
    const l = h('article', 'layer dark');
    l.style.zIndex = 1;
    l.appendChild(h('p', 'lempty', db ? 'Belum ada kegiatan untuk ditampilkan.' : 'Kegiatan belum tersedia.'));
    wrap.appendChild(l);
    return;
  }
  items.forEach((it, n) => {
    const lay = h('article', n % 2 ? 'layer dark' : 'layer light');
    lay.style.zIndex = n + 1;
    lay.appendChild(h('div', 'ghost-w', it.kategori || 'Kegiatan'));
    const inner = h('div', 'inner');
    const media = h('div', 'lmedia');
    if (it.image) { const im = h('img'); im.src = it.image; im.alt = it.judul || ''; im.loading = 'lazy'; media.appendChild(im); }
    else media.appendChild(h('span', 'jp-mark', '活'));
    const txt = h('div', 'ltxt');
    const meta = h('div', 'lmeta');
    meta.append(h('span', null, it.kategori || 'Kegiatan'), h('span', null, fmtDate(it.tanggal)));
    const title = h('h3', 'ltitle');
    title.appendChild(h('span', null, it.judul || 'Tanpa judul'));
    txt.append(meta, h('p', 'lnum', String(n + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0')), title,
      h('p', 'ldesc', it.deskripsi || ''), h('p', 'lunit', it.unit || ''));
    inner.append(media, txt);
    lay.append(inner);
    wrap.appendChild(lay);
    if (galleryIO) galleryIO.observe(lay); else lay.classList.add('on');
  });
  stackScroll();
}

function stackScroll() {
  const lays = document.querySelectorAll('.layer');
  lays.forEach((l, i) => {
    const next = lays[i + 1];
    const inner = l.querySelector('.inner');
    if (!next || !inner) return;
    const top = next.getBoundingClientRect().top;
    const p = Math.max(0, Math.min(1, 1 - top / innerHeight));
    inner.style.transform = 'scale(' + (1 - 0.08 * p) + ')';
    inner.style.opacity = String(1 - 0.5 * p);
  });
}
let stackTick = false;
addEventListener('scroll', () => {
  if (stackTick) return;
  stackTick = true;
  requestAnimationFrame(() => { stackScroll(); stackTick = false; });
}, { passive: true });
