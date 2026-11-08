import { EMK, PAK21, PENTAKSIRAN, SUBJEK, kelengkapan, kosong, ralatMasa, ralatRefleksi, salinUntukKelasLain } from '../lib/rph.js';
import { ada, clone, esc } from '../lib/teks.js';
import { fmtHari, fmtMasa, minit } from '../lib/tarikh.js';
import { S, ed, simpanSemua } from '../keadaan.js';
import { IKON } from '../ui/ikon.js';
import { toast } from '../ui/toast.js';
import { lencana } from './senarai.js';
import { tiadaJumpa } from './pratonton.js';

const $ = (s) => document.querySelector(s);
const PH = { objektif: 'Objektif yang boleh diukur', kriteria: 'Kriteria kejayaan', langkah: 'Langkah aktiviti' };
const TUNDA_SIMPAN = 500;

// ——— Templat medan ———
const medan = (id, label, dalam) => `<div><label class="label" for="f-${id}">${label}</label>${dalam}<p class="error" id="e-${id}" hidden></p></div>`;
const input = (id, nilai, attr = '') => `<input class="field" id="f-${id}" data-f="${id}" value="${esc(nilai)}" ${attr} />`;
const teks = (id, nilai, ph = '', rows = 3) => `<textarea class="field" id="f-${id}" data-f="${id}" rows="${rows}" placeholder="${esc(ph)}">${esc(nilai)}</textarea>`;
const cip = (kunci, opsyen) => `<div class="chips" role="group">${opsyen.map((o) =>
  `<button type="button" class="chip" data-chip="${kunci}" data-v="${esc(o)}" aria-pressed="${ed.draf[kunci].includes(o)}">${esc(o)}</button>`).join('')}</div>`;

function senaraiHTML(kunci) {
  const arr = ed.draf[kunci];
  return arr.map((v, i) => `
    <div class="list-item">
      <span class="num" aria-hidden="true">${i + 1}</span>
      <div><label class="sr-only" for="f-${kunci}-${i}">${PH[kunci]} ${i + 1}</label>
      <textarea class="field" id="f-${kunci}-${i}" data-list="${kunci}" data-i="${i}" rows="2" style="min-height:52px" placeholder="${esc(PH[kunci])}">${esc(v)}</textarea></div>
      <div class="tools">
        <button type="button" class="tool" data-move="${kunci}" data-i="${i}" data-d="-1" aria-label="Naikkan item ${i + 1}" ${i === 0 ? 'disabled' : ''}>${IKON.up}</button>
        <button type="button" class="tool" data-move="${kunci}" data-i="${i}" data-d="1" aria-label="Turunkan item ${i + 1}" ${i === arr.length - 1 ? 'disabled' : ''}>${IKON.down}</button>
        <button type="button" class="tool tool--del" data-del="${kunci}" data-i="${i}" aria-label="Buang item ${i + 1}" ${arr.length === 1 ? 'disabled' : ''}>${IKON.x}</button>
      </div>
    </div>`).join('');
}
const lukisSenarai = (kunci) => { $(`#list-${kunci}`).innerHTML = senaraiHTML(kunci); };

// ——— Paparan ———
export function paparPenyunting(id) {
  const asal = id ? S.rph.find((r) => r.id === id) : null;
  if (id && !asal) return tiadaJumpa();
  ed.draf = asal ? clone(asal) : kosong();
  ed.disimpan = Boolean(asal);
  const d = ed.draf;

  document.getElementById('app').innerHTML = `
    <div class="view">
      <div class="pagehead">
        <div>
          <p class="eyebrow"><a class="link" href="#senarai">Semua RPH</a></p>
          <h1 id="ed-tajuk"></h1>
          <p class="lead" id="ed-lead"></p>
        </div>
      </div>
      <div class="editor">
        <form id="borang" novalidate autocomplete="off">
          <section class="card section" id="s-maklumat">
            <h2>Maklumat kelas</h2><p class="sub">Siapa, bila dan apa yang diajar.</p>
            <div class="stack">
              <div class="grid2">
                ${medan('subjek', 'Mata pelajaran', input('subjek', d.subjek, 'list="dl-subjek" placeholder="Contoh: Sains"'))}
                ${medan('kelas', 'Kelas', input('kelas', d.kelas, 'placeholder="Contoh: 5 Cemerlang"'))}
              </div>
              <div class="grid3">
                ${medan('tarikh', 'Tarikh', input('tarikh', d.tarikh, 'type="date"'))}
                ${medan('mula', 'Mula', input('mula', d.mula, 'type="time" step="300"'))}
                ${medan('tamat', 'Tamat', input('tamat', d.tamat, 'type="time" step="300"'))}
              </div>
              <div class="grid3">
                ${medan('tajuk', 'Tajuk', input('tajuk', d.tajuk, 'placeholder="Contoh: Rantai makanan"'))}
                ${medan('tema', 'Tema atau bidang', input('tema', d.tema, 'placeholder="Contoh: Sains hayat"'))}
                ${medan('minggu', 'Minggu', input('minggu', d.minggu, 'type="number" inputmode="numeric" min="1" max="52"'))}
              </div>
            </div>
          </section>

          <section class="card section" id="s-standard">
            <h2>Standard</h2><p class="sub">Salin daripada Dokumen Standard Kurikulum dan Pentaksiran.</p>
            <div class="stack">
              ${medan('sk', 'Standard kandungan', teks('sk', d.sk, 'Contoh: 4.1 Interaksi antara hidupan.', 2))}
              ${medan('sp', 'Standard pembelajaran', teks('sp', d.sp, 'Contoh: 4.1.2 Membina rantai makanan.', 2))}
            </div>
          </section>

          <section class="card section" id="s-objektif">
            <h2>Objektif dan kriteria kejayaan</h2><p class="sub">Satu baris untuk setiap objektif. Tulis apa yang murid boleh lakukan, bukan apa yang guru ajar.</p>
            <p class="prefix">Pada akhir pembelajaran, murid dapat:</p>
            <div class="list" id="list-objektif"></div>
            <button type="button" class="add" data-add="objektif">${IKON.plus} Tambah objektif</button>
            <div style="height:28px"></div>
            <p class="prefix">Murid berjaya jika dapat:</p>
            <div class="list" id="list-kriteria"></div>
            <button type="button" class="add" data-add="kriteria">${IKON.plus} Tambah kriteria</button>
          </section>

          <section class="card section" id="s-aktiviti">
            <h2>Aktiviti</h2><p class="sub">Set induksi, langkah demi langkah, kemudian penutup.</p>
            <div class="stack">
              ${medan('induksi', 'Set induksi', teks('induksi', d.induksi, 'Cara menarik perhatian murid pada lima minit pertama', 2))}
              <div><p class="label">Langkah pengajaran</p><div class="list" id="list-langkah"></div>
              <button type="button" class="add" data-add="langkah">${IKON.plus} Tambah langkah</button></div>
              ${medan('penutup', 'Penutup', teks('penutup', d.penutup, 'Rumusan, latihan ringkas atau refleksi murid', 2))}
            </div>
          </section>

          <section class="card section" id="s-elemen">
            <h2>Bahan dan elemen</h2><p class="sub">Pilih yang benar-benar digunakan dalam kelas ini.</p>
            <div class="stack">
              ${medan('bbm', 'Bahan bantu mengajar', teks('bbm', d.bbm, 'Contoh: Kad gambar, video, lembaran kerja', 2))}
              <div><p class="label">Elemen merentas kurikulum</p>${cip('emk', EMK)}</div>
              <div><p class="label">Strategi PAK21 dan KBAT</p>${cip('pak21', PAK21)}</div>
              <div><p class="label">Kaedah pentaksiran</p>${cip('pentaksiran', PENTAKSIRAN)}</div>
            </div>
          </section>

          <section class="card section" id="s-refleksi">
            <h2>Refleksi</h2><p class="sub">Isi selepas kelas. RPH ditanda selesai sebaik refleksi ditulis.</p>
            <div class="stack">
              <div class="reflect">
                <label class="sr-only" for="f-capai">Murid mencapai objektif</label>
                <input class="field tnum" id="f-capai" data-r="capai" type="number" inputmode="numeric" min="0" value="${esc(d.refleksi.capai)}" placeholder="0" />
                <span>daripada</span>
                <label class="sr-only" for="f-jumlah">Jumlah murid</label>
                <input class="field tnum" id="f-jumlah" data-r="jumlah" type="number" inputmode="numeric" min="0" value="${esc(d.refleksi.jumlah)}" placeholder="0" />
                <span>murid mencapai objektif.</span>
              </div>
              <p class="error" id="e-capai" hidden></p>
              <div><label class="label" for="f-catatan">Catatan dan tindakan susulan</label>
              <textarea class="field" id="f-catatan" data-r="catatan" rows="3" placeholder="Apa yang berjaya, apa yang perlu diulang, murid yang perlu bimbingan">${esc(d.refleksi.catatan)}</textarea></div>
            </div>
          </section>
        </form>

        <aside class="side" aria-label="Status RPH">
          <div class="card">
            <div class="side-head">
              <p class="muted">Kelengkapan</p>
              <span id="ed-badge"></span>
            </div>
            <p class="figure side-skor" id="ed-skor"></p>
            <div class="progress"><span id="ed-bar"></span></div>
            <ul class="checks" id="ed-checks"></ul>
            <p class="saved" id="ed-saved" aria-live="polite"></p>
            <div class="side-actions">
              <a class="btn btn--primary btn--block" href="#lihat-${d.id}">${IKON.eye} Pratonton dan cetak</a>
              <button class="btn btn--secondary btn--block" type="button" data-action="duplikat">${IKON.copy} Salin untuk kelas lain</button>
              <button class="btn btn--danger btn--block" type="button" data-action="padam">${IKON.trash} Padam RPH</button>
            </div>
          </div>
          <nav class="card outline" aria-label="Bahagian">
            <a href="#s-maklumat" data-jump>Maklumat kelas</a><a href="#s-standard" data-jump>Standard</a><a href="#s-objektif" data-jump>Objektif</a>
            <a href="#s-aktiviti" data-jump>Aktiviti</a><a href="#s-elemen" data-jump>Bahan dan elemen</a><a href="#s-refleksi" data-jump>Refleksi</a>
          </nav>
        </aside>
      </div>
      <datalist id="dl-subjek">${SUBJEK.map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
    </div>`;

  ['objektif', 'kriteria', 'langkah'].forEach(lukisSenarai);
  kemasSisi();
  tunjukRalat();
  if (!asal) $('#f-subjek').focus();
}

/** Tunjuk atau sembunyikan ralat di bawah medannya, dengan aria-invalid. */
function tetapRalat(medanId, ralatId, mesej) {
  const e = $(`#${ralatId}`);
  const f = $(`#${medanId}`);
  e.hidden = !mesej;
  e.textContent = mesej || '';
  if (mesej) {
    f.setAttribute('aria-invalid', 'true');
    f.setAttribute('aria-describedby', ralatId);
  } else {
    f.removeAttribute('aria-invalid');
    f.removeAttribute('aria-describedby');
  }
}

function tunjukRalat() {
  tetapRalat('f-tamat', 'e-tamat', ralatMasa(ed.draf));
  tetapRalat('f-capai', 'e-capai', ralatRefleksi(ed.draf));
}

function kemasSisi() {
  const d = ed.draf;
  const { item, selesai, jumlah } = kelengkapan(d);
  $('#ed-skor').innerHTML = `${selesai}<span> / ${jumlah}</span>`;
  $('#ed-bar').style.width = `${(selesai / jumlah) * 100}%`;
  $('#ed-badge').innerHTML = lencana(d);
  $('#ed-checks').innerHTML = item.map((h) => h.ok
    ? `<li><span class="ok">${IKON.check}${esc(h.label)}</span></li>`
    : `<li><button type="button" data-fokus="${h.id}">${IKON.circle}${esc(h.label)}</button></li>`).join('');

  const tempoh = minit(d.mula, d.tamat);
  const lead = [d.subjek, d.kelas, d.tarikh ? fmtHari(d.tarikh) : '', tempoh > 0 ? `${d.mula}–${d.tamat}` : ''].filter(ada).join(' · ');
  $('#ed-lead').textContent = lead || 'Isi maklumat kelas untuk bermula.';
  $('#ed-tajuk').textContent = d.tajuk || (ed.disimpan ? 'Tanpa tajuk' : 'RPH baru');
  if (!ed.disimpan) tetapPenunjuk('menunggu', 'Disimpan automatik sebaik anda mula menaip');
}

function tetapPenunjuk(keadaan, teks) {
  const sv = $('#ed-saved');
  if (!sv) return;
  sv.className = keadaan === 'disimpan' ? 'saved' : 'saved is-wait';
  sv.innerHTML = `<i></i>${esc(teks)}`;
}

function berubah() {
  ed.draf.dikemaskini = new Date().toISOString();
  kemasSisi();
  tunjukRalat();
  tetapPenunjuk('menunggu', 'Menyimpan…');
  clearTimeout(ed.pemasa);
  ed.pemasa = setTimeout(simpanDraf, TUNDA_SIMPAN);
}

/** Tulis salinan kerja ke storan. RPH baru hanya disimpan selepas perubahan pertama. */
export function simpanDraf() {
  clearTimeout(ed.pemasa);
  ed.pemasa = null;
  if (!ed.draf) return;
  const i = S.rph.findIndex((r) => r.id === ed.draf.id);
  if (i >= 0) S.rph[i] = clone(ed.draf);
  else S.rph.push(clone(ed.draf));
  simpanSemua();
  if (!ed.disimpan) {
    ed.disimpan = true;
    history.replaceState(null, '', `#edit-${ed.draf.id}`);
  }
  tetapPenunjuk('disimpan', `Disimpan ${fmtMasa(new Date())}`);
}

/** Simpan jika ada perubahan yang belum ditulis (dipanggil sebelum meninggalkan penyunting). */
export function simpanJikaPerlu() {
  if (ed.draf && ed.pemasa) simpanDraf();
}

function padam() {
  const id = ed.draf.id;
  clearTimeout(ed.pemasa);
  ed.pemasa = null;
  ed.draf = null;
  const i = S.rph.findIndex((r) => r.id === id);
  location.hash = '#senarai';
  if (i < 0) return;
  const [item] = S.rph.splice(i, 1);
  simpanSemua();
  toast(`“${item.tajuk || 'Tanpa tajuk'}” dipadam.`, {
    label: 'Buat asal',
    fn: () => { S.rph.splice(i, 0, item); simpanSemua(); window.dispatchEvent(new Event('rph:ubah')); },
  });
}

function duplikat() {
  simpanDraf();
  const salinan = salinUntukKelasLain(ed.draf);
  S.rph.push(salinan);
  simpanSemua();
  location.hash = `#edit-${salinan.id}`;
  toast('Salinan dibuat. Isi kelas untuk salinan ini.');
  setTimeout(() => $('#f-kelas')?.focus(), 50);
}

function fokusMedan(id) {
  const d = ed.draf;
  const sasaran = { objektif: '#f-objektif-0', kriteria: '#f-kriteria-0', langkah: '#f-langkah-0', tarikh: ada(d.tarikh) ? '#f-tamat' : '#f-tarikh' }[id] || `#f-${id}`;
  const el = $(sasaran);
  if (!el) return;
  const kurangGerak = matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: kurangGerak ? 'auto' : 'smooth', block: 'center' });
  el.focus({ preventScroll: true });
}

// ——— Peristiwa (didelegasikan dari main.js) ———

/** @returns {boolean} benar jika klik dikendalikan di sini */
export function kendaliKlik(t) {
  if (!ed.draf) return false;
  const d = ed.draf;
  const { action, chip, add, del, move, fokus } = t.dataset;

  if (action === 'padam') padam();
  else if (action === 'duplikat') duplikat();
  else if (chip) {
    const arr = d[chip];
    const i = arr.indexOf(t.dataset.v);
    if (i >= 0) arr.splice(i, 1); else arr.push(t.dataset.v);
    t.setAttribute('aria-pressed', String(i < 0));
    berubah();
  } else if (add) {
    d[add].push('');
    lukisSenarai(add);
    berubah();
    $(`#f-${add}-${d[add].length - 1}`).focus();
  } else if (del) {
    const i = Number(t.dataset.i);
    d[del].splice(i, 1);
    lukisSenarai(del);
    berubah();
    $(`#f-${del}-${Math.min(i, d[del].length - 1)}`).focus();
  } else if (move) {
    const i = Number(t.dataset.i);
    const j = i + Number(t.dataset.d);
    const arr = d[move];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    lukisSenarai(move);
    berubah();
    const btn = $(`[data-move="${move}"][data-i="${j}"][data-d="${t.dataset.d}"]`);
    (btn && !btn.disabled ? btn : $(`#f-${move}-${j}`)).focus();
  } else if (fokus) fokusMedan(fokus);
  else return false;
  return true;
}

export function kendaliInput(t) {
  if (!ed.draf) return;
  if (t.dataset.f) ed.draf[t.dataset.f] = t.value;
  else if (t.dataset.list) ed.draf[t.dataset.list][Number(t.dataset.i)] = t.value;
  else if (t.dataset.r) ed.draf.refleksi[t.dataset.r] = t.value;
  else return;
  berubah();
}

/** Enter dalam senarai menambah item baru di bawah; Cmd/Ctrl+S menyimpan serta-merta. */
export function kendaliKekunci(e) {
  if (!ed.draf) return;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    simpanDraf();
    toast('Disimpan.');
  } else if (e.key === 'Enter' && !e.shiftKey && e.target.dataset?.list) {
    e.preventDefault();
    const k = e.target.dataset.list;
    const i = Number(e.target.dataset.i);
    ed.draf[k].splice(i + 1, 0, '');
    lukisSenarai(k);
    berubah();
    $(`#f-${k}-${i + 1}`).focus();
  }
}
