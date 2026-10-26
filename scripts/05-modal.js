const reqModal = $('#reqModal');
const closeReq = () => { reqModal.hidden = true; };
$('#openReq').onclick = () => { reqModal.hidden = false; };
$('#closeReq').onclick = closeReq;
reqModal.onclick = e => { if (e.target === reqModal) closeReq(); };
addEventListener('keydown', e => { if (e.key === 'Escape') closeReq(); });
$('#reqSend').onclick = () => {
  if (!$('#rNama').value.trim() || !$('#rPesan').value.trim()) return;
  $('#reqForm').hidden = true; $('#reqOk').hidden = false;
};
