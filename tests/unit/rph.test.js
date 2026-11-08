import { describe, expect, it } from 'vitest';
import {
  SEMAKAN, bacaSandaran, contoh, kelengkapan, kosong, kumpulMengikutTarikh,
  ralatMasa, ralatRefleksi, ringkasan, salinUntukKelasLain, status, tapis,
} from '../../src/lib/rph.js';
import { esc } from '../../src/lib/teks.js';

const HARI = '2026-11-09'; // Isnin

/** A plan that passes all ten checks. */
const lengkap = (o = {}) => ({
  ...kosong(HARI),
  subjek: 'Sains', kelas: '5 Cemerlang', tajuk: 'Rantai makanan', sp: '4.1.2',
  objektif: ['Membina rantai makanan.'], kriteria: ['Empat hidupan disusun betul.'],
  induksi: 'Video sawah padi.', langkah: ['Kerja kumpulan.'], penutup: 'Rumusan.',
  ...o,
});

describe('kelengkapan', () => {
  it('counts a new plan as incomplete', () => {
    const k = kelengkapan(kosong(HARI));
    expect(k.jumlah).toBe(SEMAKAN.length);
    expect(k.selesai).toBe(1); // only the default date and time pass
  });
  it('ignores list rows that are only whitespace', () => {
    const r = lengkap({ objektif: ['   ', ''] });
    expect(kelengkapan(r).item.find((i) => i.id === 'objektif').ok).toBe(false);
  });
  it('fails the time check when the lesson ends before it starts', () => {
    const r = lengkap({ mula: '10:00', tamat: '09:00' });
    expect(kelengkapan(r).item.find((i) => i.id === 'tarikh').ok).toBe(false);
  });
});

describe('status', () => {
  it('is draf until all ten checks pass, then sedia', () => {
    expect(status(kosong(HARI), HARI)).toBe('draf');
    expect(status(lengkap(), HARI)).toBe('sedia');
  });
  it('is lewat for a past lesson with no reflection, complete or not', () => {
    expect(status(lengkap({ tarikh: '2026-11-06' }), HARI)).toBe('lewat');
    expect(status(kosong('2026-11-06'), HARI)).toBe('lewat');
  });
  it('is selesai once any reflection is written, even for a past or incomplete plan', () => {
    expect(status(kosong('2026-11-06'), HARI)).toBe('lewat');
    expect(status({ ...kosong('2026-11-06'), refleksi: { capai: '', jumlah: '', catatan: 'Ok' } }, HARI)).toBe('selesai');
    expect(status({ ...kosong(HARI), refleksi: { capai: '20', jumlah: '', catatan: '' } }, HARI)).toBe('selesai');
  });
  it('does not count a whitespace-only reflection', () => {
    expect(status({ ...kosong('2026-11-06'), refleksi: { capai: ' ', jumlah: '', catatan: '  ' } }, HARI)).toBe('lewat');
  });
});

describe('validation', () => {
  it('flags an end time at or before the start time', () => {
    expect(ralatMasa(lengkap({ mula: '09:00', tamat: '09:00' }))).toMatch(/selepas masa mula/);
    expect(ralatMasa(lengkap())).toBeNull();
  });
  it('flags more pupils achieving the objective than are in the class', () => {
    expect(ralatRefleksi(lengkap({ refleksi: { capai: '31', jumlah: '30', catatan: '' } }))).toMatch(/melebihi/);
    expect(ralatRefleksi(lengkap({ refleksi: { capai: '30', jumlah: '30', catatan: '' } }))).toBeNull();
    expect(ralatRefleksi(lengkap({ refleksi: { capai: '31', jumlah: '', catatan: '' } }))).toBeNull();
  });
});

describe('tapis', () => {
  const a = lengkap({ id: 'a', tarikh: '2026-11-09', mula: '10:30', tajuk: 'Rantai makanan' });
  const b = lengkap({ id: 'b', tarikh: '2026-11-09', mula: '08:00', subjek: 'Matematik', tajuk: 'Pecahan' });
  const c = lengkap({ id: 'c', tarikh: '2026-11-06', tajuk: 'Litar' });

  it('sorts newest date first, then by start time', () => {
    expect(tapis([c, a, b], { q: '', status: 'semua' }, HARI).map((r) => r.id)).toEqual(['b', 'a', 'c']);
  });
  it('searches subject, class and title, case-insensitively', () => {
    expect(tapis([a, b, c], { q: 'MATEM', status: 'semua' }, HARI).map((r) => r.id)).toEqual(['b']);
    expect(tapis([a, b, c], { q: '  rantai ', status: 'semua' }, HARI).map((r) => r.id)).toEqual(['a']);
  });
  it('filters by derived status', () => {
    expect(tapis([a, b, c], { q: '', status: 'lewat' }, HARI).map((r) => r.id)).toEqual(['c']);
  });
});

describe('kumpulMengikutTarikh', () => {
  it('groups consecutive plans by date', () => {
    const g = kumpulMengikutTarikh([lengkap({ tarikh: '2026-11-09' }), lengkap({ tarikh: '2026-11-09' }), lengkap({ tarikh: '2026-11-06' })]);
    expect(g.map((x) => [x.tarikh, x.item.length])).toEqual([['2026-11-09', 2], ['2026-11-06', 1]]);
  });
});

describe('ringkasan', () => {
  it('counts statuses and lessons in the current Monday-to-Sunday week', () => {
    const { kira, mingguIni } = ringkasan(contoh(HARI), HARI);
    expect(kira).toEqual({ semua: 4, draf: 1, sedia: 1, selesai: 1, lewat: 1 });
    // Today, yesterday (Sunday, previous week) and three days ago (Friday, previous week).
    expect(mingguIni).toBe(2);
  });
});

describe('salinUntukKelasLain', () => {
  it('keeps the lesson content but clears the class and reflection', () => {
    const asal = lengkap({ refleksi: { capai: '20', jumlah: '30', catatan: 'Baik' } });
    const salinan = salinUntukKelasLain(asal);
    expect(salinan.id).not.toBe(asal.id);
    expect(salinan.kelas).toBe('');
    expect(salinan.refleksi).toEqual({ capai: '', jumlah: '', catatan: '' });
    expect(salinan.objektif).toEqual(asal.objektif);
    salinan.objektif.push('x');
    expect(asal.objektif).toHaveLength(1); // deep copy
  });
});

describe('bacaSandaran', () => {
  it('accepts the exported object shape with profile', () => {
    const { rancangan, profil } = bacaSandaran({ versi: 1, profil: { nama: 'Aina', sekolah: 'SK X' }, rancangan: [lengkap()] });
    expect(rancangan).toHaveLength(1);
    expect(profil).toEqual({ nama: 'Aina', sekolah: 'SK X' });
  });
  it('accepts a bare array and fills fields missing from older backups', () => {
    const { rancangan, profil } = bacaSandaran([{ id: 'x1', tarikh: '2026-01-05', tajuk: 'Lama' }]);
    expect(profil).toBeNull();
    expect(rancangan[0].objektif).toEqual(['']);
    expect(rancangan[0].refleksi).toEqual({ capai: '', jumlah: '', catatan: '' });
    expect(rancangan[0].tajuk).toBe('Lama');
  });
  it('rejects files that are not backups', () => {
    expect(() => bacaSandaran({ nope: 1 })).toThrow(/Tiada senarai/);
    expect(() => bacaSandaran([{ id: 'x', tarikh: '9/11/2026' }])).toThrow(/Rekod 1/);
    expect(() => bacaSandaran(null)).toThrow();
  });
});

describe('esc', () => {
  it('escapes HTML so user text cannot inject markup', () => {
    expect(esc('<img src=x onerror="alert(1)">')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(esc(null)).toBe('');
  });
});
