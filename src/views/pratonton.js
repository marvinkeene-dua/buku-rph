import { sudahRefleksi } from '../lib/rph.js';
import { ada, esc } from '../lib/teks.js';
import { HARI, dariISO, fmtHari, fmtTarikh, minit } from '../lib/tarikh.js';
import { S } from '../keadaan.js';
import { IKON } from '../ui/ikon.js';
import { lencana } from './senarai.js';

const KOSONG = '<span class="kosong">Belum diisi</span>';
const v = (s) => (ada(s) ? `<span class="pre">${esc(s)}</span>` : KOSONG);
const ol = (arr) => {
  const isi = arr.filter(ada);
  return isi.length ? `<ol>${isi.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : KOSONG;
};
const senarai = (arr) => (arr.length ? esc(arr.join(', ')) : '<span class="kosong">Tiada</span>');

function refleksi(r) {
  if (!sudahRefleksi(r)) return '<span class="kosong">Diisi selepas kelas</span>';
  const { capai, jumlah, catatan } = r.refleksi;
  return [
    ada(capai) ? `<p>${esc(capai)}${ada(jumlah) ? ` daripada ${esc(jumlah)}` : ''} murid mencapai objektif.</p>` : '',
    ada(catatan) ? `<p class="pre" style="margin-top:6px">${esc(catatan)}</p>` : '',
  ].join('');
}

/** Paparan dokumen bercetak A4, dalam susun atur jadual RPH yang lazim di sekolah. */
export function paparPratonton(id) {
  const r = S.rph.find((x) => x.id === id);
  if (!r) return tiadaJumpa();
  const p = S.profil;
  const tempoh = minit(r.mula, r.tamat);
  const masa = `${fmtTarikh(r.tarikh)}, ${HARI[dariISO(r.tarikh).getDay()]} · ${r.mula}–${r.tamat}${tempoh > 0 ? ` (${tempoh} minit)` : ''}${ada(r.minggu) ? ` · Minggu ${r.minggu}` : ''}`;

  document.getElementById('app').innerHTML = `
    <div class="view">
      <div class="pagehead no-print">
        <div>
          <p class="eyebrow"><a class="link" href="#senarai">Semua RPH</a></p>
          <h1>${esc(r.tajuk || 'Tanpa tajuk')}</h1>
          <p class="lead">${esc([r.subjek, r.kelas, fmtHari(r.tarikh)].filter(ada).join(' · '))} &nbsp;${lencana(r)}</p>
        </div>
        <div class="actions">
          <a class="btn btn--secondary" href="#edit-${r.id}">${IKON.edit} Sunting</a>
          <button class="btn btn--primary" type="button" data-action="cetak">${IKON.print} Cetak atau simpan PDF</button>
        </div>
      </div>
      <article class="paper">
        <header class="doc-head">
          <p>${esc(p.sekolah || 'Nama sekolah')}</p>
          <h1>Rancangan Pengajaran Harian</h1>
          <p>${esc(p.nama ? `Guru: ${p.nama}` : 'Nama guru')}</p>
        </header>
        <div class="paper__scroll">
        <table>
          <tbody>
            <tr><th>Mata pelajaran</th><td>${v(r.subjek)}</td></tr>
            <tr><th>Kelas</th><td>${v(r.kelas)}</td></tr>
            <tr><th>Tarikh dan masa</th><td class="tnum">${esc(masa)}</td></tr>
            <tr><th>Tema</th><td>${v(r.tema)}</td></tr>
            <tr><th>Tajuk</th><td>${v(r.tajuk)}</td></tr>
            <tr><th>Standard kandungan</th><td>${v(r.sk)}</td></tr>
            <tr><th>Standard pembelajaran</th><td>${v(r.sp)}</td></tr>
            <tr><th>Objektif</th><td><p class="lead-in">Pada akhir pembelajaran, murid dapat:</p>${ol(r.objektif)}</td></tr>
            <tr><th>Kriteria kejayaan</th><td><p class="lead-in">Murid berjaya jika dapat:</p>${ol(r.kriteria)}</td></tr>
            <tr class="sec"><th colspan="2">Aktiviti</th></tr>
            <tr><th>Set induksi</th><td>${v(r.induksi)}</td></tr>
            <tr><th>Langkah pengajaran</th><td>${ol(r.langkah)}</td></tr>
            <tr><th>Penutup</th><td>${v(r.penutup)}</td></tr>
            <tr class="sec"><th colspan="2">Bahan dan elemen</th></tr>
            <tr><th>Bahan bantu mengajar</th><td>${v(r.bbm)}</td></tr>
            <tr><th>Elemen merentas kurikulum</th><td>${senarai(r.emk)}</td></tr>
            <tr><th>PAK21 dan KBAT</th><td>${senarai(r.pak21)}</td></tr>
            <tr><th>Pentaksiran</th><td>${senarai(r.pentaksiran)}</td></tr>
            <tr class="sec"><th colspan="2">Refleksi</th></tr>
            <tr><th>Refleksi guru</th><td>${refleksi(r)}</td></tr>
          </tbody>
        </table>
        </div>
        <div class="sign"><div>Tandatangan guru</div><div>Disemak oleh</div></div>
      </article>
    </div>`;
}

export function tiadaJumpa() {
  document.getElementById('app').innerHTML = `
    <div class="view card empty" style="margin-top:24px">
      <h2>RPH ini tiada</h2>
      <p>Mungkin ia telah dipadam atau pautan tidak lengkap.</p>
      <a class="btn btn--primary" href="#senarai">Kembali ke senarai</a>
    </div>`;
}
