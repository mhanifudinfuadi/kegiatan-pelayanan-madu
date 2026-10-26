(async () => {
  db = window.firebaseDb ? window.firebaseDb() : null;
  if (db) {
    db.collection('activities').onSnapshot(snap => { items = toArray(snap); render(); });
    db.collection('site').onSnapshot(snap => {
      const c = toArray(snap).find(x => x.id === 'caption');
      if (c && c.text) $('#caption').textContent = c.text;
    });
  } else {
    render();
  }
  observe();
})();
