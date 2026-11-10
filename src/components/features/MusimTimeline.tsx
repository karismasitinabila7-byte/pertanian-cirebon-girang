import React from 'react'
import { Calendar, Sprout, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react'

interface MusimTimelineProps {
  tanggalMulai: string | Date
  tanggalTanam: string | Date
  estimasiPanen: string | Date
  status: string
  compact?: boolean
}

export function MusimTimeline({
  tanggalMulai,
  tanggalTanam,
  estimasiPanen,
  status,
  compact = false
}: MusimTimelineProps) {
  const dMulai = new Date(tanggalMulai)
  const dTanam = new Date(tanggalTanam)
  const dPanen = new Date(estimasiPanen)
  const now = new Date()

  // Calculate Days After Planting (Hari Setelah Tanam - HST)
  const diffTimeTanam = now.getTime() - dTanam.getTime()
  const hst = Math.floor(diffTimeTanam / (1000 * 60 * 60 * 24))

  // Calculate total duration (tanam to panen)
  const totalDays = Math.max(1, Math.floor((dPanen.getTime() - dTanam.getTime()) / (1000 * 60 * 60 * 24)))
  const progressPercent = Math.min(100, Math.max(0, Math.round((hst / totalDays) * 100)))

  // Determine stage active state
  const isPerencanaan = status === 'PERENCANAAN'
  const isBerjalan = status === 'BERJALAN'
  const isSelesai = status === 'SELESAI'
  const isGagal = status === 'GAGAL'

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
            Tanam: <strong>{formatDate(dTanam)}</strong>
          </span>
          <span className="text-gray-500 flex items-center">
            Panen: <strong>{formatDate(dPanen)}</strong>
          </span>
        </div>

        {isBerjalan && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
              <span>HST: {hst > 0 ? `${hst} Hari` : 'Hari Ini'}</span>
              <span>{progressPercent}% Menuju Panen</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-6">
      {/* Header with HST badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-green-600" />
          <h4 className="text-sm font-bold text-gray-900">Timeline Siklus Tanam Padi</h4>
        </div>

        {isBerjalan && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sprout className="h-3.5 w-3.5 mr-1.5 text-emerald-600 animate-pulse" />
            Umur Tanaman: {hst > 0 ? `${hst} HST (Hari Setelah Tanam)` : 'Mulai Tanam'}
          </div>
        )}

        {isSelesai && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
            Panen Telah Selesai
          </div>
        )}

        {isGagal && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
            Musim Gagal / Puso
          </div>
        )}

        {isPerencanaan && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Tahap Perencanaan
          </div>
        )}
      </div>

      {/* Visual Step Progress Bar */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10">
          {/* Step 1: Persiapan */}
          <div className={`p-4 rounded-xl border transition-all ${
            isPerencanaan 
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-sm' 
              : isBerjalan || isSelesai 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isPerencanaan ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-700'
              }`}>
                Tahap 1
              </span>
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <h5 className="text-sm font-bold text-gray-900">Persiapan Lahan</h5>
            <p className="text-xs text-gray-500 mt-1">
              Mulai: <span className="font-semibold text-gray-800">{formatDate(dMulai)}</span>
            </p>
          </div>

          {/* Step 2: Penanaman */}
          <div className={`p-4 rounded-xl border transition-all ${
            isBerjalan 
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm' 
              : isSelesai 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isBerjalan ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-700'
              }`}>
                Tahap 2
              </span>
              <Sprout className="h-4 w-4 text-emerald-600" />
            </div>
            <h5 className="text-sm font-bold text-gray-900">Masa Tanam</h5>
            <p className="text-xs text-gray-500 mt-1">
              Tanam: <span className="font-semibold text-gray-800">{formatDate(dTanam)}</span>
            </p>
          </div>

          {/* Step 3: Panen */}
          <div className={`p-4 rounded-xl border transition-all ${
            isSelesai 
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-sm' 
              : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isSelesai ? 'bg-purple-200 text-purple-900' : 'bg-gray-200 text-gray-700'
              }`}>
                Tahap 3
              </span>
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
            </div>
            <h5 className="text-sm font-bold text-gray-900">Estimasi Panen</h5>
            <p className="text-xs text-gray-500 mt-1">
              Panen: <span className="font-semibold text-gray-800">{formatDate(dPanen)}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar (Visible during BERJALAN) */}
        {isBerjalan && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-emerald-900">
              <span>Progres Siklus Pertumbuhan</span>
              <span>{progressPercent}% (Est. {totalDays} Hari Total)</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
