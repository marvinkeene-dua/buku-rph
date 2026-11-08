import { esc } from '../lib/teks.js';
import { IKON } from './ikon.js';

/**
 * Makluman ringkas di bucu skrin. Berhenti sementara apabila tetikus di atasnya.
 * @param {string} mesej
 * @param {{ label: string, fn: () => void }} [tindakan] contohnya Buat asal
 */
export function toast(mesej, tindakan) {
  const box = document.getElementById('toasts');
  if (!box) return;
  while (box.children.length >= 3) box.firstElementChild.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<p>${esc(mesej)}</p>${tindakan ? `<button type="button" class="toast__aksi">${esc(tindakan.label)}</button>` : ''}<button type="button" class="toast__tutup" aria-label="Tutup makluman">${IKON.x}</button>`;

  const tutup = () => el.remove();
  let pemasa = setTimeout(tutup, 4500);
  el.addEventListener('mouseenter', () => clearTimeout(pemasa));
  el.addEventListener('mouseleave', () => { pemasa = setTimeout(tutup, 2500); });
  el.querySelector('.toast__aksi')?.addEventListener('click', () => { tindakan.fn(); tutup(); });
  el.querySelector('.toast__tutup').addEventListener('click', tutup);
  box.appendChild(el);
}
