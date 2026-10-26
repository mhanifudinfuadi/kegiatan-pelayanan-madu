const pw = document.getElementById('petals');
for (let i = 0; i < 24; i++) {
  const p = document.createElement('span');
  p.className = 'petal';
  const s = 8 + Math.random() * 10;
  p.style.left = Math.random() * 100 + '%';
  p.style.width = s + 'px';
  p.style.height = s * 1.2 + 'px';
  p.style.animationDuration = (9 + Math.random() * 9) + 's';
  p.style.animationDelay = (-Math.random() * 15) + 's';
  pw.appendChild(p);
}
