const { getSmartLocalResponse } = require('./src/services/aiService.ts');

const queries = [
  'siapa lahan yang paling luas',
  'lahan mana yang paling luas',
  'siapa yang punya lahan paling luas',
  'lahan terluas',
  'siapa lahan yang paling kecil',
  'siapa panen paling banyak',
  'semua menu yang ada di setiap dashboard',
  'apa saja menu yang ada di setiap dashoard',
  'apa saja menu di dashboard admin',
  'apa saja menu di dashboard desa',
  'apa saja menu di dashboard petani',
  'apa fungsi menu peta lahan gis',
  'apa fungsi menu musim tanam',
  'apa fungsi menu data master user',
  'apa fungsi menu lahan pertanian',
  'apa fungsi menu aktivitas budidaya',
  'apa fungsi menu data panen',
  'apa fungsi menu kelompok tani',
  'apa fungsi menu konfigurasi sistem',
  'apa fungsi menu edukasi',
  'apa fungsi menu profil',
  'ada menu apa saja di si padi'
];

let failed = 0;
queries.forEach(q => {
  const resp = getSmartLocalResponse(q, { role: 'ADMIN' });
  const isGeneric = resp.includes('Saya siap membantu data pertanian Desa Cirebon Girang (Kelompok Tani, Anggota, Lahan, Musim Tanam, Hasil Panen) serta konsultasi budidaya padi sawah');
  if (isGeneric) {
    console.log('FAILED GENERIC:', q);
    failed++;
  } else {
    console.log('SUCCESS:', q);
    console.log('->', resp.split('\n')[0]);
  }
});

console.log('TOTAL QUERIES:', queries.length, 'FAILED:', failed);
if (failed > 0) process.exit(1);
