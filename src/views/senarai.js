import { LABEL_STATUS, kumpulMengikutTarikh, ringkasan, status, tapis } from '../lib/rph.js';
import { ada, esc } from '../lib/teks.js';
import { fmtHari, hariIni, labelRelatif, minit } from '../lib/tarikh.js';
import { S } from '../keadaan.js';
import { IKON } from '../ui/ikon.js';

/** @param {import('../lib/rph.js').RPH} r */
export const lencana = (r) => {
  const s = status(r);
  return `<span class="badge badge--${s}">${LABEL_STATUS[s]}</span>`;
};

const TAPISAN = [['semua', 'Semua'], ['lewat', 'Perlu refleksi'], ['draf', 'Draf'], ['sedia', 'Sedia'], ['selesai', 'Selesai']];

function baris(r) {
  const tempoh = minit(r.mula, r.tamat);
  return `
    <a class="row" href="#lihat-${r.id}">
      <div class="row__time tnum">${esc(r.mula)}–${esc(r.tamat)}<small>${tempoh > 0 ? `${tempoh} minit` : ''}</small></div>
      <div style="min-width:0">
        <p class="row__title">${esc(r.tajuk || 'Tanpa tajuk')}</p>
        <p class="row__meta">${esc([r.subjek, r.kelas].filter(ada).join(' · ') || 'Mata pelajaran belum diisi')}</p>
      </div>
      ${lencana(r)}
    </a>`;
}

export function paparSenarai() {
  const h = hariIni();
  const { kira, mingguIni } = ringkasan(S.rph, h);
  const kumpulan = kumpulMengikutTarikh(tapis(S.rph, S.tapis, h));

  const butangTapis = TAPISAN.map(([id, label]) => `
    <button type="button" data-tapis="${id}" aria-pressed="${S.tapis.status === id}">${label}<span class="n ${id === 'lewat' && kira.lewat ? 'n--alert' : ''}">${kira[id]}</span></button>`).join('');

  let isi;
  if (kumpulan.length) {
    isi = kumpulan.map((g) => `
      <section class="daygroup" aria-label="${esc(fmtHari(g.tarikh))}">
        <div class="dayhead"><h2>${esc(fmtHari(g.tarikh))}</h2><span>${esc(labelRelatif(g.tarikh, h))}</span></div>
        ${g.item.map(baris).join('')}
      </section>`).join('');
  } else if (!S.rph.length) {
    isi = `<div class="empty"><h2>Belum ada RPH</h2><p>Mulakan dengan rancangan untuk kelas pertama anda hari ini.</p><a class="btn btn--primary" href="#baru">Tulis RPH pertama</a></div>`;
  } else {
    const q = S.tapis.q.trim();
    isi = `<div class="empty"><h2>Tiada padanan</h2><p>${q ? `Tiada RPH mengandungi “${esc(q)}”.` : 'Tiada RPH dalam kategori ini.'}</p><button class="btn btn--secondary" type="button" data-action="reset-tapis">Papar semua</button></div>`;
  }

  document.getElementById('app').innerHTML = `
    <div class="view">
      <div class="pagehead">
        <div>
          <p class="eyebrow">${esc(fmtHari(h))}</p>
          <h1>Rancangan pengajaran</h1>
          <p class="lead">${kira.lewat ? `${kira.lewat} kelas yang sudah berlalu belum ada refleksi.` : 'Semua kelas yang sudah berlalu ada refleksi.'}</p>
        </div>
      </div>
      <section class="strip" aria-label="Ringkasan">
        <div><p class="k">Jumlah RPH</p><p class="v figure">${S.rph.length}</p></div>
        <div><p class="k">Minggu ini</p><p class="v figure">${mingguIni}<small>kelas</small></p></div>
        <div><p class="k">Sedia diajar</p><p class="v figure">${kira.sedia}</p></div>
        <div class="${kira.lewat ? 'alert' : ''}"><p class="k">Perlu refleksi</p><p class="v figure">${kira.lewat}</p></div>
      </section>
      <section class="card">
        <div class="toolbar">
          <div class="search">
            ${IKON.search}
            <label class="sr-only" for="cari">Cari RPH</label>
            <input class="field" id="cari" type="search" placeholder="Cari tajuk, subjek atau kelas" value="${esc(S.tapis.q)}" autocomplete="off" />
            ${S.tapis.q ? '' : '<kbd aria-hidden="true">/</kbd>'}
          </div>
          <div class="segmented" role="group" aria-label="Tapis mengikut status">${butangTapis}</div>
        </div>
        ${isi}
      </section>
    </div>`;

  const cari = document.getElementById('cari');
  cari.addEventListener('input', () => {
    S.tapis.q = cari.value;
    const pos = cari.selectionStart;
    paparSenarai();
    const baru = document.getElementById('cari');
    baru.focus();
    baru.setSelectionRange(pos, pos);
  });
}
