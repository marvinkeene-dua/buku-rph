// localStorage boleh gagal (mod peribadi, storan penuh, disekat); aplikasi mesti terus berfungsi.
const AWALAN = 'rph.v1.';

export function baca(kunci, lalai) {
  try {
    const v = localStorage.getItem(AWALAN + kunci);
    return v ? JSON.parse(v) : lalai;
  } catch {
    return lalai;
  }
}

export function tulis(kunci, nilai) {
  try {
    localStorage.setItem(AWALAN + kunci, JSON.stringify(nilai));
    return true;
  } catch {
    return false;
  }
}
