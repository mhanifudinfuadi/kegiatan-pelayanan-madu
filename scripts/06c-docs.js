/* ---- Dokumentasi: kartu bergeser di footer ---- */
function renderDocs() {
  var track = document.getElementById('docsTrack');
  if (!track) return;
  track.innerHTML = '';
  if (!items.length) {
    track.appendChild(h('div', 'dempty', db ? 'Belum ada dokumentasi.' : 'Dokumentasi belum tersedia.'));
  } else {
    items.forEach(function (it) {
      var c = h('article', 'dcard');
      var m = h('div', 'dm');
      if (it.image) { var im = h('img'); im.src = it.image; im.alt = it.judul || ''; im.loading = 'lazy'; m.appendChild(im); }
      var b = h('div', 'db');
      b.append(h('span', 'dmeta', (it.kategori || 'Kegiatan') + ' · ' + fmtDate(it.tanggal)),
               h('h4', null, it.judul || 'Tanpa judul'), h('p', 'dunit', it.unit || ''));
      c.append(m, b);
      track.appendChild(c);
    });
  }
  updateDocsBar();
}
function docsStep(dir) {
  var t = document.getElementById('docsTrack');
  var card = t.querySelector('.dcard');
  t.scrollBy({ left: dir * ((card ? card.offsetWidth : 300) + 20), behavior: 'smooth' });
}
function updateDocsBar() {
  var t = document.getElementById('docsTrack'), bar = document.getElementById('docsBar');
  if (!t || !bar || !t.scrollWidth) return;
  bar.style.width = (t.clientWidth / t.scrollWidth * 100) + '%';
  bar.style.left = (t.scrollLeft / t.scrollWidth * 100) + '%';
}
(function () {
  var prev = document.getElementById('dPrev'), next = document.getElementById('dNext'), track = document.getElementById('docsTrack');
  if (!prev || !next || !track) return;
  prev.onclick = function () { docsStep(-1); };
  next.onclick = function () { docsStep(1); };
  track.addEventListener('scroll', updateDocsBar, { passive: true });
  addEventListener('resize', updateDocsBar);
})();
