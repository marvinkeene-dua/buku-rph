// @ts-check
// Semua tarikh disimpan sebagai rentetan kalendar tempatan "YYYY-MM-DD".
// Ia tidak pernah melalui UTC, jadi tarikh tidak beralih sehari di zon waktu +08:00.

export const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
export const BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

/** @param {number} n */
const pad = (n) => String(n).padStart(2, '0');

/** @param {Date} d @returns {string} */
export const keISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Tengah hari tempatan, supaya tambah atau tolak hari tidak tersilap di sempadan waktu jimat siang.
 * @param {string} s YYYY-MM-DD
 */
export const dariISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

/** @param {Date} [kini] */
export const hariIni = (kini = new Date()) => keISO(kini);

/** @param {string} s @param {number} n */
export const tambahHari = (s, n) => {
  const d = dariISO(s);
  d.setDate(d.getDate() + n);
  return keISO(d);
};

/** Bilangan hari dari `a` ke `b`. @param {string} a @param {string} b */
export const bezaHari = (a, b) => Math.round((dariISO(b).getTime() - dariISO(a).getTime()) / 864e5);

/** @param {string} s */
export const fmtTarikh = (s) => {
  const d = dariISO(s);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
};

/** @param {string} s */
export const fmtHari = (s) => {
  const d = dariISO(s);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`;
};

/** @param {Date} d */
export const fmtMasa = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * Tempoh dalam minit antara dua masa "HH:MM". Negatif jika `b` sebelum `a`; 0 jika kosong.
 * @param {string} a @param {string} b
 */
export const minit = (a, b) => {
  if (!a || !b) return 0;
  const [h1, m1] = a.split(':').map(Number);
  const [h2, m2] = b.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
};

/** @param {string} s @param {string} [rujukan] */
export const labelRelatif = (s, rujukan = hariIni()) => {
  const n = bezaHari(rujukan, s);
  if (n === 0) return 'Hari ini';
  if (n === -1) return 'Semalam';
  if (n === 1) return 'Esok';
  return n > 0 ? `Dalam ${n} hari` : `${-n} hari lalu`;
};

/** Isnin bagi minggu yang mengandungi `s` (minggu persekolahan bermula Isnin). @param {string} s */
export const awalMinggu = (s) => tambahHari(s, -((dariISO(s).getDay() + 6) % 7));
