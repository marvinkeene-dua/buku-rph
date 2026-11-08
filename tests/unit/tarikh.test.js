import { describe, expect, it } from 'vitest';
import { awalMinggu, bezaHari, fmtHari, fmtTarikh, hariIni, keISO, labelRelatif, minit, tambahHari } from '../../src/lib/tarikh.js';

describe('keISO / hariIni', () => {
  it('uses the local calendar date, not UTC', () => {
    // 00:30 on 1 Jan in local time is still 31 Dec in UTC for any zone ahead of UTC.
    expect(keISO(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    expect(hariIni(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09');
  });
});

describe('tambahHari', () => {
  it('crosses month and year boundaries', () => {
    expect(tambahHari('2026-01-31', 1)).toBe('2026-02-01');
    expect(tambahHari('2026-12-31', 1)).toBe('2027-01-01');
    expect(tambahHari('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('handles leap years', () => {
    expect(tambahHari('2028-02-28', 1)).toBe('2028-02-29');
  });
});

describe('bezaHari', () => {
  it('counts calendar days in either direction', () => {
    expect(bezaHari('2026-11-09', '2026-11-12')).toBe(3);
    expect(bezaHari('2026-11-09', '2026-11-06')).toBe(-3);
    expect(bezaHari('2026-12-30', '2027-01-02')).toBe(3);
  });
});

describe('minit', () => {
  it('returns the lesson length in minutes', () => {
    expect(minit('08:00', '09:00')).toBe(60);
    expect(minit('10:30', '11:05')).toBe(35);
  });
  it('is negative when the end is before the start, and 0 when empty', () => {
    expect(minit('09:00', '08:30')).toBe(-30);
    expect(minit('', '09:00')).toBe(0);
  });
});

describe('labelRelatif', () => {
  const ref = '2026-11-09';
  it.each([
    ['2026-11-09', 'Hari ini'],
    ['2026-11-08', 'Semalam'],
    ['2026-11-10', 'Esok'],
    ['2026-11-12', 'Dalam 3 hari'],
    ['2026-11-04', '5 hari lalu'],
  ])('%s → %s', (tarikh, label) => {
    expect(labelRelatif(tarikh, ref)).toBe(label);
  });
});

describe('awalMinggu', () => {
  it('returns the Monday of the school week', () => {
    expect(awalMinggu('2026-11-09')).toBe('2026-11-09'); // Isnin
    expect(awalMinggu('2026-11-13')).toBe('2026-11-09'); // Jumaat
    expect(awalMinggu('2026-11-15')).toBe('2026-11-09'); // Ahad belongs to the week that started Monday
  });
});

describe('formatting', () => {
  it('formats dates in Malay', () => {
    expect(fmtTarikh('2026-11-09')).toBe('9 November 2026');
    expect(fmtHari('2026-08-31')).toBe('Isnin, 31 Ogos');
  });
});
