// @ts-check
// Lapisan domain: model RPH, status, semakan kelengkapan, carian dan sandaran.
// Tiada akses DOM atau storan di sini, supaya semuanya boleh diuji secara terus.

import { ada, uid } from './teks.js';
import { awalMinggu, hariIni, minit, tambahHari } from './tarikh.js';

/**
 * @typedef {{ capai: string, jumlah: string, catatan: string }} Refleksi
 * @typedef {{
 *   id: string, subjek: string, kelas: string, tarikh: string, mula: string, tamat: string,
 *   minggu: string, tema: string, tajuk: string, sk: string, sp: string,
 *   objektif: string[], kriteria: string[], induksi: string, langkah: string[], penutup: string,
 *   bbm: string, emk: string[], pak21: string[], pentaksiran: string[],
 *   refleksi: Refleksi, dikemaskini: string
 * }} RPH
 * @typedef {'draf' | 'sedia' | 'selesai' | 'lewat'} Status
 * @typedef {'objektif' | 'kriteria' | 'langkah'} MedanSenarai
 * @typedef {'emk' | 'pak21' | 'pentaksiran'} MedanPilihan
 */

export const EMK = ['Bahasa', 'Nilai murni', 'Kelestarian alam sekitar', 'Sains dan teknologi', 'Patriotisme', 'Kreativiti dan inovasi', 'Keusahawanan', 'Teknologi maklumat', 'Kelestarian global', 'Pendidikan kewangan'];
export const PAK21 = ['Peta i-Think', 'Soalan KBAT', 'Think-pair-share', 'Gallery walk', 'Pembelajaran berasaskan projek', 'Main peranan', 'Kerja berkumpulan'];
export const PENTAKSIRAN = ['Pemerhatian', 'Lisan', 'Lembaran kerja', 'Kuiz', 'Hasil kerja', 'Pembentangan'];
export const SUBJEK = ['Bahasa Melayu', 'Bahasa Inggeris', 'Matematik', 'Sains', 'Sejarah', 'Pendidikan Islam', 'Pendidikan Moral', 'Reka Bentuk dan Teknologi', 'Pendidikan Jasmani', 'Pendidikan Seni Visual', 'Muzik', 'Geografi'];

/** @type {Record<Status, string>} */
export const LABEL_STATUS = { draf: 'Draf', sedia: 'Sedia diajar', selesai: 'Selesai', lewat: 'Perlu refleksi' };

/** @param {string} [tarikh] @returns {RPH} */
export function kosong(tarikh = hariIni()) {
  return {
    id: uid(), subjek: '', kelas: '', tarikh, mula: '08:00', tamat: '09:00', minggu: '', tema: '', tajuk: '',
    sk: '', sp: '', objektif: [''], kriteria: [''], induksi: '', langkah: ['', ''], penutup: '',
    bbm: '', emk: [], pak21: [], pentaksiran: [], refleksi: { capai: '', jumlah: '', catatan: '' },
    dikemaskini: new Date().toISOString(),
  };
}

/** @param {string} id @param {string} label @param {(r: RPH) => boolean} test */
const semak = (id, label, test) => ({ id, label, test });

/** Sepuluh perkara yang menjadikan RPH sedia diajar. */
export const SEMAKAN = [
  semak('subjek', 'Mata pelajaran', (r) => ada(r.subjek)),
  semak('kelas', 'Kelas', (r) => ada(r.kelas)),
  semak('tarikh', 'Tarikh dan masa', (r) => ada(r.tarikh) && minit(r.mula, r.tamat) > 0),
  semak('tajuk', 'Tajuk', (r) => ada(r.tajuk)),
  semak('sp', 'Standard pembelajaran', (r) => ada(r.sp)),
  semak('objektif', 'Objektif', (r) => r.objektif.some(ada)),
  semak('kriteria', 'Kriteria kejayaan', (r) => r.kriteria.some(ada)),
  semak('induksi', 'Set induksi', (r) => ada(r.induksi)),
  semak('langkah', 'Langkah aktiviti', (r) => r.langkah.some(ada)),
  semak('penutup', 'Penutup', (r) => ada(r.penutup)),
];

/** @param {RPH} r */
export function kelengkapan(r) {
  const item = SEMAKAN.map(({ id, label, test }) => ({ id, label, ok: test(r) }));
  return { item, selesai: item.filter((i) => i.ok).length, jumlah: item.length };
}

/** @param {RPH} r */
export const sudahRefleksi = (r) => ada(r.refleksi.catatan) || ada(r.refleksi.capai);

/**
 * Status diterbitkan, tidak disimpan: refleksi menandakan selesai; kelas lepas tanpa refleksi
 * perlu perhatian; selebihnya sedia jika semua sepuluh semakan lulus.
 * @param {RPH} r @param {string} [hari]
 * @returns {Status}
 */
export function status(r, hari = hariIni()) {
  if (sudahRefleksi(r)) return 'selesai';
  if (r.tarikh < hari) return 'lewat';
  return kelengkapan(r).selesai === SEMAKAN.length ? 'sedia' : 'draf';
}

/** @param {RPH} r @returns {string | null} */
export function ralatMasa(r) {
  return r.mula && r.tamat && minit(r.mula, r.tamat) <= 0 ? 'Masa tamat mesti selepas masa mula.' : null;
}

/** @param {RPH} r @returns {string | null} */
export function ralatRefleksi(r) {
  const { capai, jumlah } = r.refleksi;
  if (!ada(capai) || !ada(jumlah)) return null;
  return Number(capai) > Number(jumlah) ? 'Bilangan yang mencapai objektif tidak boleh melebihi jumlah murid.' : null;
}

/**
 * Tapis dan susun: tarikh terbaru dahulu, kemudian ikut masa mula.
 * @param {RPH[]} senarai
 * @param {{ q: string, status: Status | 'semua' }} tapisan
 * @param {string} [hari]
 */
export function tapis(senarai, tapisan, hari = hariIni()) {
  const q = tapisan.q.trim().toLowerCase();
  return senarai
    .filter((r) => tapisan.status === 'semua' || status(r, hari) === tapisan.status)
    .filter((r) => !q || [r.subjek, r.kelas, r.tajuk, r.tema, r.sp].some((x) => String(x).toLowerCase().includes(q)))
    .sort((a, b) => b.tarikh.localeCompare(a.tarikh) || a.mula.localeCompare(b.mula));
}

/** Kumpulkan senarai yang sudah disusun mengikut tarikh. @param {RPH[]} senarai */
export function kumpulMengikutTarikh(senarai) {
  /** @type {{ tarikh: string, item: RPH[] }[]} */
  const kumpulan = [];
  for (const r of senarai) {
    const akhir = kumpulan[kumpulan.length - 1];
    if (akhir && akhir.tarikh === r.tarikh) akhir.item.push(r);
    else kumpulan.push({ tarikh: r.tarikh, item: [r] });
  }
  return kumpulan;
}

/** @param {RPH[]} senarai @param {string} [hari] */
export function ringkasan(senarai, hari = hariIni()) {
  /** @type {Record<Status | 'semua', number>} */
  const kira = { semua: senarai.length, draf: 0, sedia: 0, selesai: 0, lewat: 0 };
  for (const r of senarai) kira[status(r, hari)]++;
  const isnin = awalMinggu(hari);
  const ahad = tambahHari(isnin, 6);
  const mingguIni = senarai.filter((r) => r.tarikh >= isnin && r.tarikh <= ahad).length;
  return { kira, mingguIni };
}

/** Salinan untuk kelas lain: ID baru, kelas dan refleksi dikosongkan. @param {RPH} r @returns {RPH} */
export function salinUntukKelasLain(r) {
  return {
    ...JSON.parse(JSON.stringify(r)),
    id: uid(),
    kelas: '',
    refleksi: { capai: '', jumlah: '', catatan: '' },
    dikemaskini: new Date().toISOString(),
  };
}

/**
 * Sahkan dan normalkan fail sandaran. Menerima tatasusunan atau { rancangan, profil }.
 * Medan yang hilang diisi lalai supaya sandaran versi lama masih boleh dibaca.
 * @param {unknown} data
 * @returns {{ rancangan: RPH[], profil: { nama: string, sekolah: string } | null }}
 */
export function bacaSandaran(data) {
  const obj = /** @type {any} */ (data);
  const arr = Array.isArray(obj) ? obj : obj?.rancangan;
  if (!Array.isArray(arr)) throw new Error('Tiada senarai rancangan dalam fail.');
  const rancangan = arr.map((r, i) => {
    if (!r || typeof r.id !== 'string' || typeof r.tarikh !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.tarikh)) {
      throw new Error(`Rekod ${i + 1} tiada id atau tarikh yang sah.`);
    }
    const asas = kosong(r.tarikh);
    return { ...asas, ...r, refleksi: { ...asas.refleksi, ...r.refleksi } };
  });
  const p = Array.isArray(obj) ? null : obj?.profil;
  return { rancangan, profil: p ? { nama: String(p.nama || ''), sekolah: String(p.sekolah || '') } : null };
}

/** Data contoh, relatif kepada `hari` supaya senarai sentiasa kelihatan semasa. @param {string} [h] @returns {RPH[]} */
export function contoh(h = hariIni()) {
  /** @param {Partial<RPH>} o @returns {RPH} */
  const a = (o) => ({ ...kosong(), ...o, id: uid() });
  return [
    a({ subjek: 'Bahasa Melayu', kelas: '4 Bestari', tarikh: h, mula: '08:00', tamat: '09:00', minggu: '42', tema: 'Kebersihan dan kesihatan', tajuk: 'Membaca dan memahami petikan',
      sk: '2.2 Membaca, memahami dan menaakul bahan bukan sastera dan bahan sastera.', sp: '2.2.1 Membaca dan memahami maklumat yang tersurat dan tersirat dalam petikan.',
      objektif: ['Menyatakan tiga isi penting petikan dengan betul.', 'Menjawab dua soalan pemahaman tersirat secara bertulis.'],
      kriteria: ['Menyenaraikan sekurang-kurangnya tiga isi penting.', 'Menjawab dua soalan tersirat dengan ayat lengkap.'],
      induksi: 'Guru menunjukkan gambar kantin sekolah dan bertanya apa yang murid perhatikan.',
      langkah: ['Murid membaca petikan secara mekanis, kemudian secara senyap.', 'Murid berbincang dalam kumpulan dan mengisi peta buih tentang isi penting.', 'Wakil kumpulan membentangkan peta buih; guru membetulkan isi yang kurang tepat.'],
      penutup: 'Murid menjawab dua soalan tersirat dalam buku latihan. Guru merumuskan nilai menjaga kebersihan.',
      bbm: 'Petikan bercetak, kad gambar, kertas mahjong', emk: ['Bahasa', 'Nilai murni'], pak21: ['Peta i-Think', 'Kerja berkumpulan'], pentaksiran: ['Lisan', 'Lembaran kerja'] }),
    a({ subjek: 'Sains', kelas: '5 Cemerlang', tarikh: h, mula: '10:30', tamat: '11:30', minggu: '42', tema: 'Sains hayat', tajuk: 'Rantai makanan',
      sk: '4.1 Interaksi antara hidupan.', sp: '', objektif: ['Membina satu rantai makanan dengan sekurang-kurangnya empat hidupan.'], kriteria: [''],
      induksi: 'Tayangan video pendek tentang hidupan di sawah padi.', langkah: ['', ''], penutup: '', pak21: ['Soalan KBAT'] }),
    a({ subjek: 'Matematik', kelas: '4 Bestari', tarikh: tambahHari(h, -1), mula: '09:00', tamat: '10:00', minggu: '42', tema: 'Nombor dan operasi', tajuk: 'Pecahan setara',
      sk: '2.1 Pecahan.', sp: '2.1.2 Menentukan pecahan setara bagi pecahan wajar.',
      objektif: ['Menentukan dua pecahan setara bagi satu pecahan wajar menggunakan gambar rajah.'], kriteria: ['Menulis dua pecahan setara dengan betul bagi tiga soalan.'],
      induksi: 'Guru memotong sekeping roti kepada dua, kemudian kepada empat.', langkah: ['Murid melipat kertas untuk menunjukkan 1/2 = 2/4 = 4/8.', 'Murid melengkapkan jadual pecahan setara secara berpasangan.'],
      penutup: 'Kuiz tiga soalan pada papan putih mini.', bbm: 'Kertas warna, papan putih mini', emk: ['Kreativiti dan inovasi'], pak21: ['Think-pair-share'], pentaksiran: ['Kuiz', 'Pemerhatian'],
      refleksi: { capai: '26', jumlah: '30', catatan: 'Empat murid masih keliru antara pengangka dan penyebut. Bimbingan semula esok semasa aktiviti pengayaan.' } }),
    a({ subjek: 'Sains', kelas: '5 Cemerlang', tarikh: tambahHari(h, -3), mula: '10:30', tamat: '11:30', minggu: '41', tema: 'Sains fizikal', tajuk: 'Litar elektrik bersiri',
      sk: '6.1 Elektrik.', sp: '6.1.3 Membina litar bersiri dan menerangkan kecerahan mentol.',
      objektif: ['Membina litar bersiri dengan dua mentol.'], kriteria: ['Mentol menyala dan murid menerangkan perubahan kecerahan.'],
      induksi: 'Guru menyalakan lampu suluh dan bertanya bagaimana ia berfungsi.', langkah: ['Murid membina litar dalam kumpulan.', 'Murid merekod kecerahan mentol dalam jadual.'],
      penutup: 'Rumusan bersama tentang litar bersiri.', bbm: 'Bateri, wayar, mentol, suis', emk: ['Sains dan teknologi'], pak21: ['Kerja berkumpulan'], pentaksiran: ['Hasil kerja'] }),
  ];
}
