function tickClock() {
  const n = new Date();
  $('#clock').textContent = n.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' · ' + n.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}
tickClock(); setInterval(tickClock, 1000);
