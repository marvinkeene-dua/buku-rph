// @ts-check

/** @type {Record<string, string>} */
const ENTITI = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Lepaskan teks pengguna sebelum dimasukkan ke dalam HTML.
 * @param {unknown} s
 * @returns {string}
 */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENTITI[c]);

/** ID pendek, unik dalam satu pelayar. Hanya huruf kecil dan digit (selamat untuk URL). */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/**
 * @template T
 * @param {T} o
 * @returns {T}
 */
export const clone = (o) => JSON.parse(JSON.stringify(o));

/**
 * Benar jika nilai mempunyai teks selain ruang kosong.
 * @param {unknown} s
 */
export const ada = (s) => String(s ?? '').trim() !== '';
