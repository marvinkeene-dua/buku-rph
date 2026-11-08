// Satu sumber kebenaran untuk keadaan aplikasi. Paparan membaca dari sini dan memanggil
// simpanSemua() selepas mengubah S.rph.
import { contoh } from './lib/rph.js';
import { baca, tulis } from './storan.js';
import { toast } from './ui/toast.js';

const tersimpan = baca('rancangan', null);

export const S = {
  rph: tersimpan ?? contoh(),
  profil: baca('profil', { nama: '', sekolah: '' }),
  tema: baca('tema', 'gelap'),
  tapis: { q: '', status: 'semua' },
};

/** Keadaan penyunting: salinan kerja, dan sama ada ia sudah pernah disimpan. */
export const ed = { draf: null, disimpan: false, pemasa: null };

export function simpanSemua() {
  if (!tulis('rancangan', S.rph)) toast('Storan pelayar penuh. Eksport sandaran dalam Tetapan.');
}

if (!tersimpan) simpanSemua();
