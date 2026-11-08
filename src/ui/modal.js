const BOLEH_FOKUS = 'button:not([disabled]), input:not([disabled]):not([hidden]), select, textarea, a[href]';

/**
 * Dialog modal yang boleh diakses: perangkap fokus, Escape menutup, fokus dipulangkan.
 * @param {string} html kandungan; mesti ada unsur dengan id="dlg-t" sebagai tajuk
 * @param {{ onMount?: (dlg: HTMLElement, tutup: () => void) => void }} [pilihan]
 * @returns {() => void} fungsi tutup
 */
export function modal(html, { onMount } = {}) {
  const sebelum = document.activeElement;
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="scrim"></div><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-t" tabindex="-1">${html}</div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  const dlg = ov.querySelector('.dialog');

  function kunci(e) {
    if (e.key === 'Escape') { e.preventDefault(); tutup(); return; }
    if (e.key !== 'Tab') return;
    const f = [...dlg.querySelectorAll(BOLEH_FOKUS)];
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  function tutup() {
    ov.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', kunci);
    sebelum?.focus?.();
  }

  document.addEventListener('keydown', kunci);
  ov.querySelector('.scrim').addEventListener('click', tutup);
  (dlg.querySelector('input, select, textarea') || dlg.querySelector('.btn--primary') || dlg).focus();
  onMount?.(dlg, tutup);
  return tutup;
}
