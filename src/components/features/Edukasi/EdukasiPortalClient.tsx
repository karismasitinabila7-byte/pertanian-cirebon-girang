'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  User,
  Calendar,
  Sparkles,
  Bot,
  Printer,
  Bookmark,
  Share2,
  ChevronRight,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sprout,
  Wheat,
  ShieldAlert
} from 'lucide-react'

export interface ArticleItem {
  id: string
  judul: string
  isi: string
  kategori: string
  gambar?: string | null
  status: string
  tanggalPublikasi?: string | null
  namaPenulis: string
  readTime?: string
  createdAt?: string
}

interface EdukasiPortalClientProps {
  initialArticles: ArticleItem[]
  userRole?: string
}

const CATEGORIES = [
  'Semua Panduan',
  'Hama & Penyakit',
  'Pupuk',
  'Budidaya Padi',
  'Cuaca',
  'Bantuan Pertanian',
  'Kegiatan Desa'
]

export default function EdukasiPortalClient({
  initialArticles,
  userRole = 'PETANI'
}: EdukasiPortalClientProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles)
  const [selectedCategory, setSelectedCategory] = useState('Semua Panduan')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New Article Form
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Hama & Penyakit')
  const [newImage, setNewImage] = useState('')
  const [newContent, setNewContent] = useState('')

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      // Category filter
      if (selectedCategory !== 'Semua Panduan' && art.kategori !== selectedCategory) {
        return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = art.judul.toLowerCase().includes(q)
        const matchBody = art.isi.toLowerCase().includes(q)
        const matchAuthor = art.namaPenulis.toLowerCase().includes(q)
        if (!matchTitle && !matchBody && !matchAuthor) return false
      }

      return true
    })
  }, [articles, selectedCategory, searchQuery])

  // Featured Hero Article (first article or matched)
  const featuredArticle = useMemo(() => {
    if (articles.length === 0) return null
    return (
      articles.find(a => a.kategori === 'Hama & Penyakit') ||
      articles[0]
    )
  }, [articles])

  // Toggle Bookmark
  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Handle Create Article Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/edukasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: newTitle,
          isi: newContent,
          kategori: newCategory,
          gambar: newImage || null
        })
      })

      const json = await res.json()
      if (res.ok && json.data) {
        setArticles(prev => [json.data, ...prev])
        setIsCreateOpen(false)
        setNewTitle('')
        setNewContent('')
        setNewImage('')
        alert('Panduan baru berhasil diterbitkan!')
      } else {
        alert(json.error || 'Gagal menerbitkan panduan')
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper untuk formatting isi artikel markdown sederhana
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim()
          if (!trimmed) return <div key={idx} className="h-1" />

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-emerald-950 mt-4 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block" />
                {trimmed.replace('### ', '')}
              </h3>
            )
          }

          // Heading 2
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-extrabold text-emerald-950 mt-5 mb-2 pb-1 border-b border-emerald-100">
                {trimmed.replace('## ', '')}
              </h2>
            )
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <div key={idx} className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-xl text-amber-900 text-xs my-2 flex items-start gap-2">
                <Lightbulb size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>{trimmed.replace('> ', '')}</div>
              </div>
            )
          }

          // Bullet List
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-2 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                <span>{trimmed.replace(/^[-*]\s+/, '')}</span>
              </div>
            )
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const num = trimmed.match(/^\d+/)?.[0]
            const text = trimmed.replace(/^\d+\.\s+/, '')
            return (
              <div key={idx} className="flex items-start gap-2 ml-1 my-1.5 bg-gray-50/80 p-2 rounded-lg">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {num}
                </span>
                <span className="text-gray-800 font-medium">{text}</span>
              </div>
            )
          }

          return <p key={idx}>{trimmed}</p>
        })}
      </div>
    )
  }

  // Get color for category badges
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Hama & Penyakit':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'Pupuk':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Budidaya Padi':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Cuaca':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header & Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <BookOpen size={14} className="text-blue-700" />
            <span>Pusat Informasi & Edukasi Praktis Tani</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Panduan Budidaya Padi & Penanggulangan Hama
          </h1>
          <p className="mt-1 text-sm text-gray-600 max-w-3xl">
            Kumpulan panduan teknis, tips pemupukan berimbang, strategi pengendalian hama wereng & tikus, serta manajemen pascapanen gabah untuk petani Desa Cirebon Girang.
          </p>
        </div>

        {userRole !== 'PETANI' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition flex-shrink-0"
          >
            <Plus size={15} />
            <span>Tulis Panduan Baru</span>
          </button>
        )}
      </div>

      {/* ── Featured Hero Guide (If available) ── */}
      {featuredArticle && selectedCategory === 'Semua Panduan' && !searchQuery && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Highlight Utama
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {featuredArticle.kategori}
                </span>
                <span className="text-xs text-emerald-200 flex items-center gap-1">
                  <Clock size={12} /> {featuredArticle.readTime || '4 menit baca'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {featuredArticle.judul}
              </h2>

              <p className="text-emerald-100/90 text-sm line-clamp-2 max-w-2xl leading-relaxed">
                {featuredArticle.isi.slice(0, 220)}...
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setActiveArticle(featuredArticle)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition"
                >
                  <span>Baca Panduan Lengkap</span>
                  <ArrowRight size={15} />
                </button>

                {userRole !== 'PERANGKAT_DESA' && (
                  <Link
                    href={`/ai?prompt=${encodeURIComponent(`Jelaskan cara penanggulangan hama terkait artikel: ${featuredArticle.judul}`)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl transition border border-white/20"
                  >
                    <Bot size={15} className="text-emerald-300" />
                    <span>Konsultasi AI</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
              {featuredArticle.gambar ? (
                <img
                  src={featuredArticle.gambar}
                  alt={featuredArticle.judul}
                  className="w-full h-56 object-cover rounded-2xl shadow-lg border-2 border-emerald-400/30"
                />
              ) : (
                <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-800 flex items-center justify-center border-2 border-emerald-400/30 text-emerald-300">
                  <Sprout size={64} className="opacity-75" />
                </div>
              )}
            </div>
          </div>

          {/* Decorative backdrop */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}

      {/* ── Search Bar & Category Filter Pills ── */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari panduan (contoh: wereng coklat, urea, jajar legowo, kadar air, panen)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-xs text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Article Cards Grid ── */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
          <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">Tidak ada artikel panduan yang cocok</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau pilih kategori lain seperti Hama & Penyakit atau Pemupukan.
          </p>
          <button
            onClick={() => { setSelectedCategory('Semua Panduan'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map(article => {
            const isBookmarked = bookmarkedIds.includes(article.id)
            return (
              <div
                key={article.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
              >
                {/* Thumbnail Image */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  {article.gambar ? (
                    <img
                      src={article.gambar}
                      alt={article.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600">
                      <Sprout size={48} />
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-xs ${getCategoryBadgeClass(
                      article.kategori
                    )}`}
                  >
                    {article.kategori}
                  </span>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleBookmark(article.id)
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md transition shadow-xs ${
                      isBookmarked
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-white/80 text-gray-600 hover:text-amber-500'
                    }`}
                    title="Simpan Panduan"
                  >
                    <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {article.readTime || '3 menit'}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">{article.namaPenulis}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-800 transition line-clamp-2 leading-snug">
                      {article.judul}
                    </h3>

                    <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                      {article.isi.replace(/###|##|>|\*|-/g, '')}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveArticle(article)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 group/btn"
                    >
                      <span>Baca Panduan</span>
                      <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition" />
                    </button>

                    {userRole !== 'PERANGKAT_DESA' && (
                      <Link
                        href={`/ai?prompt=${encodeURIComponent(`Tolong beri ringkasan praktis dan langkah-langkah dari panduan: ${article.judul}`)}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Tanya AI tentang materi ini"
                      >
                        <Bot size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Full Reading Modal Dialog ── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-xs transition-opacity" onClick={() => setActiveArticle(null)} />
            
            <div className="inline-block bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl sm:w-full z-10 border border-gray-200">
              {/* Header Image if available */}
              {activeArticle.gambar && (
                <div className="relative h-56 w-full">
                  <img
                    src={activeArticle.gambar}
                    alt={activeArticle.judul}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition"
                  >
                    <X size={18} />
                  </button>
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider mb-2 inline-block">
                      {activeArticle.kategori}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black leading-tight">
                      {activeArticle.judul}
                    </h2>
                  </div>
                </div>
              )}

              {/* Header fallback without image */}
              {!activeArticle.gambar && (
                <div className="p-6 bg-emerald-900 text-white flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-emerald-200 uppercase tracking-wider mb-2 inline-block">
                      {activeArticle.kategori}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black leading-tight">
                      {activeArticle.judul}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="text-emerald-300 hover:text-white p-1 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              {/* Meta information strip */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-gray-700">
                    <User size={13} className="text-gray-400" />
                    {activeArticle.namaPenulis}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {activeArticle.readTime || '3 menit baca'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                    title="Cetak Panduan"
                  >
                    <Printer size={15} />
                  </button>
                  <button
                    onClick={() => toggleBookmark(activeArticle.id)}
                    className={`p-1.5 hover:bg-gray-200 rounded-lg transition ${
                      bookmarkedIds.includes(activeArticle.id) ? 'text-amber-500' : 'text-gray-600'
                    }`}
                    title="Simpan Panduan"
                  >
                    <Bookmark size={15} className={bookmarkedIds.includes(activeArticle.id) ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>

              {/* Scrollable Formatted Content */}
              <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto">
                {renderFormattedContent(activeArticle.isi)}

                {/* Consultation AI Box (Hanya untuk Petani & Admin) */}
                {userRole !== 'PERANGKAT_DESA' && (
                  <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                        <Bot size={22} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">
                          Ada pertanyaan seputar kendala di lahan Anda?
                        </h4>
                        <p className="text-[11px] text-emerald-800">
                          Konsultasikan langsung dengan asisten AI Pertanian Desa Cirebon Girang.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/ai?prompt=${encodeURIComponent(`Saya membaca artikel "${activeArticle.judul}". Bagaimana rekomendasi aplikasinya jika tanaman padi saya berumur 45 HST di Cirebon Girang?`)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex-shrink-0 shadow-xs"
                    >
                      <span>Tanya AI Sekarang</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Dialog: Buat Panduan Baru (Admin & Perangkat Desa) ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/60 transition-opacity" onClick={() => setIsCreateOpen(false)} />
            <div className="inline-block bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full z-10 border border-gray-200">
              <div className="p-5 bg-emerald-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-300" />
                  <h3 className="font-bold text-base">Terbitkan Artikel / Panduan Tani Baru</h3>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="text-emerald-200 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Judul Panduan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Cara Menghitung Kebutuhan Pupuk NPK Musim Gadu"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Kategori Panduan *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="Hama & Penyakit">Hama & Penyakit</option>
                      <option value="Pupuk">Pupuk</option>
                      <option value="Budidaya Padi">Budidaya Padi</option>
                      <option value="Cuaca">Cuaca</option>
                      <option value="Bantuan Pertanian">Bantuan Pertanian</option>
                      <option value="Kegiatan Desa">Kegiatan Desa</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">URL Gambar Header (Opsional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Isi Materi / Panduan Praktis *</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Tuliskan langkah-langkah, dosis, atau anjuran praktis..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 font-sans"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Tip: Gunakan format teks sederhana seperti ### Judul Bagian, - Poin materi, atau &gt; Tips penting.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menerbitkan...' : 'Terbitkan Panduan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
