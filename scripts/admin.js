/* Halaman admin: login, tambah dan hapus kegiatan, caption hero.
   Penulisan hanya diizinkan untuk ADMIN_UID (lihat firestore.rules dan storage.rules). */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var db = window.firebaseDb ? window.firebaseDb() : null;
  if (!db) { $('#msg').textContent = 'Konfigurasi Firebase belum diisi di scripts/firebase-config.js.'; return; }
  var auth = firebase.auth(), storage = firebase.storage();
  var unsubs = [];

  function msg(t) { $('#msg').textContent = t; }

  auth.onAuthStateChanged(function (user) {
    var isAdmin = !!user && user.uid === ADMIN_UID;
    $('#login').hidden = isAdmin;
    $('#panel').hidden = !isAdmin;
    $('#logout').hidden = !user;
    if (user && !isAdmin) { msg('Akun ini tidak punya akses admin.'); auth.signOut(); return; }
    if (isAdmin) start();
    else { unsubs.forEach(function (u) { u(); }); unsubs = []; }
  });

  $('#loginBtn').onclick = function () {
    msg('');
    auth.signInWithEmailAndPassword($('#email').value.trim(), $('#pass').value)
      .catch(function (e) { msg('Login gagal: ' + e.message); });
  };
  $('#logout').onclick = function () { auth.signOut(); };

  function start() {
    unsubs.forEach(function (u) { u(); });
    unsubs = [
      db.collection('activities').onSnapshot(renderList),
      db.collection('site').doc('caption').onSnapshot(function (d) {
        $('#capNow').textContent = 'Caption saat ini: ' + ((d.exists && d.data().text) || '(belum diisi)');
      })
    ];
  }

  function renderList(snap) {
    var list = $('#alist'); list.innerHTML = '';
    snap.docs.slice().sort(function (a, b) {
      return String(b.data().tanggal || '').localeCompare(String(a.data().tanggal || ''));
    }).forEach(function (d) {
      var row = document.createElement('div'); row.className = 'arow';
      var span = document.createElement('span'); span.textContent = d.data().judul || 'Tanpa judul';
      var del = document.createElement('button'); del.textContent = 'Hapus';
      del.onclick = function () { removeItem(d.id, d.data().image); };
      row.append(span, del); list.append(row);
    });
  }

  function removeItem(id, imageUrl) {
    if (!confirm('Hapus kegiatan ini?')) return;
    db.collection('activities').doc(id).delete()
      .then(function () {
        if (imageUrl) storage.refFromURL(imageUrl).delete().catch(function () {});
        msg('Kegiatan dihapus.');
      })
      .catch(function (e) { msg('Gagal menghapus: ' + e.message); });
  }

  $('#saveBtn').onclick = async function () {
    var judul = $('#fJudul').value.trim();
    if (!judul) return msg('Judul wajib diisi.');
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    var image = '', f = $('#fFoto').files[0];
    try {
      if (f) {
        if (f.size > 5 * 1024 * 1024) return msg('Foto maksimal 5 MB.');
        var ref = storage.ref('activities/' + id + '/' + f.name.replace(/[^\w.\-]/g, '_'));
        await ref.put(f, { contentType: f.type });
        image = await ref.getDownloadURL();
      }
      await db.collection('activities').doc(id).set({
        judul: judul, tanggal: $('#fTanggal').value, unit: $('#fUnit').value.trim(),
        kategori: $('#fKategori').value.trim(), deskripsi: $('#fDeskripsi').value.trim(),
        image: image, createdAt: Date.now()
      });
      ['#fJudul', '#fTanggal', '#fUnit', '#fKategori', '#fDeskripsi'].forEach(function (s) { $(s).value = ''; });
      $('#fFoto').value = '';
      msg('Kegiatan tersimpan.');
    } catch (e) { msg('Gagal menyimpan: ' + e.message); }
  };

  $('#capBtn').onclick = function () {
    var t = $('#fCaption').value.trim();
    if (!t) return msg('Caption kosong.');
    db.collection('site').doc('caption').set({ text: t })
      .then(function () { $('#fCaption').value = ''; msg('Caption tersimpan.'); })
      .catch(function (e) { msg('Gagal menyimpan caption: ' + e.message); });
  };
})();
