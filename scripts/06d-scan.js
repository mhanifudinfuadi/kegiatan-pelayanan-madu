/* ---- Card scan sakura cyber ---- */
(function () {
  var track = document.getElementById('scTrack'), stage = document.getElementById('scStage');
  if (!track || !stage) return;
  var speedLabel = document.getElementById('scSpeed'), empty = document.getElementById('scEmpty');
  var S = { speed: 55, paused: false, hover: false, last: 0, offset: 0, visible: true, cards: [] };
  var KANJI = '桜光夢風雲龍水火空心和道未来電脳夜花月雪京炎鋼刃森海星景';
  var HIRA = 'あいうえおさくらかぜひかりゆめほしつきはなこころ';
  var KATA = 'カタカナネオンサイバーデータヨルユメキラ';
  var CODE = KANJI + HIRA + KATA;
  function rnd(s) { return s.charAt(Math.floor(Math.random() * s.length)); }

  function buildCard(it) {
    var c = h('article', 'sc-card');
    var chip = h('div', 'sc-chip');
    var photo = h('div', 'sc-photo');
    if (it.image) photo.style.backgroundImage = 'url("' + String(it.image).replace(/"/g, '%22') + '")';
    var gl = h('div', 'sc-glyphs');
    for (var i = 0; i < 130; i++) gl.appendChild(h('span', null, rnd(CODE)));
    var edge = h('span', 'sc-edge');
    var info = h('div', 'sc-info');
    info.append(h('div', 'sc-tag', (it.kategori || 'Kegiatan') + ' / ' + fmtDate(it.tanggal)),
                h('h2', null, it.judul || 'Tanpa judul'), h('p', null, it.unit || ''));
    c.append(chip, photo, gl, edge, info);
    return c;
  }

  function petals() {
    var root = document.getElementById('scPetals');
    var n = matchMedia('(max-width:600px)').matches ? 10 : 15;
    for (var i = 0; i < n; i++) {
      var p = h('i', 'sc-petal');
      p.style.left = Math.random() * 100 + '%';
      p.style.top = (-Math.random() * 500) + 'px';
      p.style.animationDuration = (8 + Math.random() * 10) + 's';
      p.style.animationDelay = (-Math.random() * 14) + 's';
      p.style.opacity = String(0.25 + Math.random() * 0.5);
      root.appendChild(p);
    }
  }

  function cardW() { var c = track.querySelector('.sc-card'); return c ? c.getBoundingClientRect().width : 260; }
  function gapPx() { return parseFloat(getComputedStyle(track).columnGap) || 34; }

  window.renderScan = function () {
    track.innerHTML = ''; S.cards = []; S.offset = 0;
    if (!items.length) {
      empty.hidden = false;
      empty.textContent = db ? 'Belum ada dokumentasi.' : 'Dokumentasi belum tersedia.';
      return;
    }
    empty.hidden = true;
    var sets = Math.max(3, Math.ceil(10 / items.length));
    for (var s = 0; s < sets; s++) items.forEach(function (it) {
      var c = buildCard(it); track.appendChild(c); S.cards.push(c);
    });
  };

  function frame(t) {
    requestAnimationFrame(frame);
    if (!S.last) S.last = t;
    var dt = Math.min((t - S.last) / 1000, 0.04); S.last = t;
    if (!S.visible || !S.cards.length) return;
    if (!S.paused) {
      S.offset -= S.speed * (S.hover ? 0.35 : 1) * dt;
      var loop = items.length * (cardW() + gapPx());
      if (S.offset <= -loop) S.offset += loop;
      track.style.transform = 'translate3d(' + S.offset + 'px,-50%,0)';
    }
    var beamX = stage.getBoundingClientRect().left + stage.clientWidth * 0.30;
    S.cards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (beamX - rect.left) / rect.width));
      var photo = card.querySelector('.sc-photo');
      photo.style.clipPath = 'inset(0 0 0 ' + (p * 100) + '%)';
      photo.style.opacity = String(0.88 - p * 0.12);
      var edge = card.querySelector('.sc-edge');
      edge.style.left = (p * 100) + '%';
      edge.style.opacity = (p > 0.015 && p < 0.985) ? '1' : '0';
      var th = p * 10;
      card.querySelectorAll('.sc-glyphs span').forEach(function (g, i) {
        var col = i % 10, scanned = col < th;
        g.style.color = scanned ? 'rgba(255,224,239,.58)' : 'rgba(242,155,189,.12)';
        g.style.textShadow = (col >= th - 0.8 && col < th + 0.6 && p > 0 && p < 1)
          ? '0 0 9px rgba(255,190,218,.95), 0 0 18px rgba(242,155,189,.55)' : 'none';
      });
    });
  }

  stage.addEventListener('pointerenter', function () { S.hover = true; });
  stage.addEventListener('pointerleave', function () { S.hover = false; });
  document.getElementById('scToggle').onclick = function (e) {
    S.paused = !S.paused; e.currentTarget.textContent = S.paused ? 'Lanjutkan animasi' : 'Jeda animasi';
    if (!S.paused) S.last = 0;
  };
  document.getElementById('scSlower').onclick = function () { S.speed = Math.max(15, S.speed - 10); speedLabel.textContent = S.speed + ' px/detik'; };
  document.getElementById('scFaster').onclick = function () { S.speed = Math.min(100, S.speed + 10); speedLabel.textContent = S.speed + ' px/detik'; };
  new IntersectionObserver(function (es) { S.visible = es[0].isIntersecting; }).observe(stage);
  petals();
  requestAnimationFrame(frame);
})();
