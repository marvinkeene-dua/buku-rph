import { bacaSandaran, contoh } from '../lib/rph.js';
import { esc } from '../lib/teks.js';
import { hariIni } from '../lib/tarikh.js';
import { S, simpanSemua } from '../keadaan.js';
import { tulis } from '../storan.js';
import { modal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const ubah = () => window.dispatchEvent(new Event('rph:ubah'));

export function bukaTetapan() {
  const p = S.profil;
  modal(`
    <h2 id="dlg-t">Tetapan</h2>
    <p class="sub">Nama guru dan sekolah dicetak pada setiap RPH.</p>
    <form id="f-profil" novalidate class="stack">
      <div><label class="label" for="p-nama">Nama guru</label><input class="field" id="p-nama" autocomplete="name" value="${esc(p.nama)}" placeholder="Contoh: Nur Aina binti Ahmad" /></div>
      <div><label class="label" for="p-sekolah">Sekolah</label><input class="field" id="p-sekolah" autocomplete="organization" value="${esc(p.sekolah)}" placeholder="Contoh: SK Taman Desa" /></div>
      <div class="foot" style="margin-top:8px"><button class="btn btn--primary" type="submit">Simpan</button></div>
    </form>
    <hr />
    <p class="label">Sandaran</p>
    <p class="hint" style="margin:0 0 14px">Semua RPH disimpan dalam pelayar ini sahaja. Eksport fail sandaran sebelum menukar komputer.</p>
    <div class="actions">
      <button class="btn btn--secondary btn--sm" type="button" id="p-eksport">Eksport sandaran</button>
      <button class="btn btn--secondary btn--sm" type="button" id="p-import-btn">Import sandaran</button>
      <input type="file" id="p-import" accept="application/json,.json" hidden />
      <button class="btn btn--danger btn--sm" type="button" id="p-reset">Set semula contoh</button>
    </div>
    <p class="error" id="p-ralat" hidden></p>`, {
    onMount(dlg, tutup) {
      const $ = (s) => dlg.querySelector(s);

      $('#f-profil').addEventListener('submit', (e) => {
        e.preventDefault();
        S.profil = { nama: $('#p-nama').value.trim(), sekolah: $('#p-sekolah').value.trim() };
        tulis('profil', S.profil);
        tutup();
        toast('Tetapan disimpan.');
        ubah();
      });

      $('#p-eksport').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({ versi: 1, profil: S.profil, rancangan: S.rph }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `rph-sandaran-${hariIni()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast(`${S.rph.length} RPH dieksport.`);
      });

      $('#p-import-btn').addEventListener('click', () => $('#p-import').click());
      $('#p-import').addEventListener('change', async (e) => {
        const fail = e.target.files[0];
        if (!fail) return;
        const ralat = $('#p-ralat');
        try {
          const { rancangan, profil } = bacaSandaran(JSON.parse(await fail.text()));
          const lama = S.rph;
          S.rph = rancangan;
          if (profil) { S.profil = profil; tulis('profil', profil); }
          simpanSemua();
          tutup();
          ubah();
          toast(`${rancangan.length} RPH diimport.`, { label: 'Buat asal', fn: () => { S.rph = lama; simpanSemua(); ubah(); } });
        } catch (err) {
          ralat.hidden = false;
          ralat.textContent = `Fail ini bukan sandaran Buku RPH yang sah. ${err instanceof SyntaxError ? 'Ia bukan JSON.' : err.message}`;
        }
      });

      $('#p-reset').addEventListener('click', () => {
        const lama = S.rph;
        S.rph = contoh();
        simpanSemua();
        tutup();
        location.hash = '#senarai';
        ubah();
        toast('Data contoh dimuat semula.', { label: 'Buat asal', fn: () => { S.rph = lama; simpanSemua(); ubah(); } });
      });
    },
  });
}
