'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Filter, RefreshCw } from 'lucide-react'
import type { DesaDashboardData } from '@/services/desaDashboardService'

interface Props {
  data: DesaDashboardData
}

export function DashboardFilters({ data }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = useCallback((key: string, value: string) => {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set(key, value)
    else sp.delete(key)
    // reset other filter when switching kelompok
    if (key === 'kelompok') sp.delete('tahun')
    startTransition(() => {
      router.replace(`${pathname}?${sp.toString()}`)
    })
  }, [params, pathname, router])

  const reset = () => {
    startTransition(() => router.replace(pathname))
  }

  const hasFilter = !!data.filterKelompokId || !!data.filterTahun

  return (
    <div className="desa-filter-bar">
      <div className="desa-filter-left">
        <Filter size={15} className="desa-filter-icon" />
        <span className="desa-filter-label">Filter:</span>

        {/* Kelompok Tani */}
        <select
          value={data.filterKelompokId}
          onChange={e => update('kelompok', e.target.value)}
          className="desa-select"
          disabled={isPending}
        >
          <option value="">Semua Kelompok Tani</option>
          {data.kelompokList.map(k => (
            <option key={k.id} value={k.id}>
              {k.nama} — {k.wilayah}
            </option>
          ))}
        </select>

        {/* Tahun / Periode */}
        <select
          value={data.filterTahun ?? ''}
          onChange={e => update('tahun', e.target.value)}
          className="desa-select"
          disabled={isPending}
        >
          <option value="">Semua Periode</option>
          {data.tahunTersedia.map(y => (
            <option key={y} value={y}>Tahun {y}</option>
          ))}
        </select>
      </div>

      {hasFilter && (
        <button className="desa-reset-btn" onClick={reset} disabled={isPending}>
          <RefreshCw size={13} />
          Reset Filter
        </button>
      )}

      {isPending && (
        <span className="desa-loading-pill">Memuat data...</span>
      )}
    </div>
  )
}
