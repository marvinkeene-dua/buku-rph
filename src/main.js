import './styles.css';
import { ada } from './lib/teks.js';
import { S, ed } from './keadaan.js';
import { tulis } from './storan.js';
import { IKON } from './ui/ikon.js';
import { paparSenarai } from './views/senarai.js';
import { paparPenyunting, simpanJikaPerlu, kendaliKlik, kendaliInput, kendaliKekunci } from './views/penyunting.js';
import { paparPratonton } from './views/pratonton.js';
import { bukaTetapan } from './views/tetapan.js';

const $ = (s) => document.querySelector(s);

// ——— Tema dan jenama ———
function pasangTema() {
  document.documentElement.dataset.theme = S.tema;
  $('meta[name="theme-color"]').content = S.tema === 'cerah' ? '#faf9f6' : '#0c0b0a';
  const b = $('#btn-tema');
  const gelap = S.tema === 'gelap';
  b.innerHTML = gelap ? IKON.sun : IKON.moon;
  b.setAttribute('aria-label', gelap ? 'Tukar ke tema putih' : 'Tukar ke tema hitam');
  b.title = gelap ? 'Tema putih' : 'Tema hitam';
}

function pasangProfil() {
  const { nama, sekolah } = S.profil;
  $('#brand-sub').textContent = [nama, sekolah].filter(ada).join(' · ') || 'Rancangan pengajaran harian';
}

// ——— Laluan ———
// Hash rata (#baru, #edit-<id>, #lihat-<id>) supaya pautan berfungsi pada GitHub Pages,
// fail tempatan dan bingkai yang hanya membenarkan #nama ringkas.
const LALUAN = /^(baru|edit|lihat)(?:-([a-z0-9]+))?$/;

function laluan() {
  simpanJikaPerlu();
  const padan = location.hash.slice(1).match(LALUAN);
  const [jalan, id] = padan ? [padan[1], padan[2]] : ['senarai'];
  if (jalan !== 'edit' && jalan !== 'baru') ed.draf = null;

  if (jalan === 'baru') paparPenyunting(null);
  else if (jalan === 'edit') paparPenyunting(id);
  else if (jalan === 'lihat') paparPratonton(id);
  else paparSenarai();

  const tajukRph = id && S.rph.find((r) => r.id === id)?.tajuk;
  document.title = jalan === 'baru' ? 'RPH baru · Buku RPH' : tajukRph ? `${tajukRph} · Buku RPH` : 'Buku RPH';
  $('#btn-baru').hidden = jalan === 'baru';
  pasangProfil();
  window.scrollTo(0, 0);
}

// ——— Peristiwa global (satu pendengar setiap jenis, didelegasikan) ———
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  const { action } = t.dataset;

  if (action === 'tema') {
    S.tema = S.tema === 'gelap' ? 'cerah' : 'gelap';
    tulis('tema', S.tema);
    pasangTema();
  } else if (action === 'tetapan') bukaTetapan();
  else if (action === 'cetak') window.print();
  else if (action === 'reset-tapis') {
    S.tapis = { q: '', status: 'semua' };
    paparSenarai();
  } else if (t.dataset.tapis) {
    S.tapis.status = t.dataset.tapis;
    paparSenarai();
    $(`[data-tapis="${t.dataset.tapis}"]`)?.focus();
  } else if (t.hasAttribute('data-jump')) {
    e.preventDefault();
    $(t.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else kendaliKlik(t);
});

document.addEventListener('input', (e) => kendaliInput(e.target));

document.addEventListener('keydown', (e) => {
  const dalamMedan = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
  if (e.key === '/' && !dalamMedan && $('#cari')) {
    e.preventDefault();
    $('#cari').focus();
    return;
  }
  kendaliKekunci(e);
});

window.addEventListener('hashchange', () => {
  laluan();
  // Pindahkan fokus ke kandungan untuk pembaca skrin, kecuali paparan sudah memfokuskan medan.
  if (!$('#app').contains(document.activeElement)) $('#utama').focus({ preventScroll: true });
});
window.addEventListener('rph:ubah', laluan);
window.addEventListener('pagehide', simpanJikaPerlu);

$('[data-action="tetapan"]').innerHTML = IKON.sliders;
pasangTema();
laluan();
