import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  isBerapaQuery,
  isSiapaQuery,
  getMatchedLocalResponse,
  normalizeIndonesianQuery
} from '../src/services/aiService'

const mockContext: any = {
  userId: 'user_admin',
  namaLengkap: 'Karisma Siti Nabila',
  role: 'ADMIN',
  statsDesa: {
    totalUsers: 6,
    usersByRole: { admin: 1, perangkatDesa: 1, petani: 4 },
    totalPetani: 4,
    totalPoktan: 3,
    totalLahan: 4,
    totalLuasHa: 6.0,
    totalLuasM2: 60000,
    totalMusim: 5,
    musimBerjalan: 3,
    totalPanenTon: 14.5,
    totalPanenKg: 14500,
    totalAktivitas: 8
  }
}

test('Rule 1: isBerapaQuery detects quantity keywords', () => {
  assert.equal(isBerapaQuery('berapa total pengguna'), true)
  assert.equal(isBerapaQuery('jumlah kelompok tani'), true)
  assert.equal(isBerapaQuery('ada berapa petani'), true)
  assert.equal(isBerapaQuery('siapa saja petani'), false)
})

test('Rule 2: isSiapaQuery detects subject name keywords', () => {
  assert.equal(isSiapaQuery('siapa nama kepala desa'), true)
  assert.equal(isSiapaQuery('siapa admin sistem'), true)
  assert.equal(isSiapaQuery('siapa ketua poktan sri rejeki'), true)
  assert.equal(isSiapaQuery('berapa total pengguna'), false)
})

test('Rule 3: "berapa" responds with numbers and statistics', () => {
  const res = getMatchedLocalResponse('berapa total pengguna', mockContext)
  assert.ok(res !== null)
  assert.match(res, /6 orang/i)
  assert.match(res, /Administrator/i)
})

test('Rule 4: "siapa" responds with names without dumping credentials', () => {
  const res = getMatchedLocalResponse('siapa kepala desa', mockContext)
  assert.ok(res !== null)
  assert.match(res, /Bapak Karsiman, S\.Sos/i)

  const adminRes = getMatchedLocalResponse('siapa admin', mockContext)
  assert.ok(adminRes !== null)
  assert.match(adminRes, /Karisma Siti Nabila/i)
})

test('Rule 5: Lecturer defense questions receive comprehensive structured answers', () => {
  const archRes = getMatchedLocalResponse('apa arsitektur tech stack sistem ini', mockContext)
  assert.ok(archRes !== null)
  assert.match(archRes, /Next\.js 15/i)
  assert.match(archRes, /Prisma ORM/i)
  assert.match(archRes, /TiDB Cloud Serverless/i)

  const dbRes = getMatchedLocalResponse('bagaimana struktur database dan 13 tabel', mockContext)
  assert.ok(dbRes !== null)
  assert.match(dbRes, /13 Tabel Relasional/i)

  const secRes = getMatchedLocalResponse('bagaimana sistem keamanan dan autentikasi', mockContext)
  assert.ok(secRes !== null)
  assert.match(secRes, /bcryptjs/i)
  assert.match(secRes, /HttpOnly/i)
})

test('Rule 6: Query normalization resolves Indonesian typos & slang', () => {
  assert.equal(normalizeIndonesianQuery('brp total pengguna'), 'berapa total pengguna')
  assert.equal(normalizeIndonesianQuery('syp ketua poktan'), 'siapa ketua kelompok tani')
  assert.equal(normalizeIndonesianQuery('siapa aj petani'), 'siapa saja petani')
})
