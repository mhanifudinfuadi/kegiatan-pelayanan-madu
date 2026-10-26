const $ = s => document.querySelector(s);
const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
let items = [], filter = 'Semua', db = null;

async function cap(name) {
  try { return window.claude ? await window.claude.use(name) : null; } catch (e) { return null; }
}

function toArray(snap) {
  const docs = snap?.docs ?? snap ?? [];
  const arr = Array.isArray(docs) ? docs : Object.values(docs);
  return arr.map(d => ({ id: d.id, ...(d.data ? d.data() : d) }))
            .sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
}

function fmtDate(t) {
  if (!t) return '';
  return new Date(t + 'T00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
