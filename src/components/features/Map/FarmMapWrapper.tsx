'use client'

import dynamic from 'next/dynamic'
import type { FarmPlot } from './FarmMap'

export interface FarmMapProps {
  initialPlots?: FarmPlot[]
  height?: string
  showControls?: boolean
  selectedPlotId?: string | null
  onSelectPlot?: (plot: FarmPlot | null) => void
}

const FarmMap = dynamic(() => import('./FarmMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[640px] rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-3">
      <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-gray-500">Memuat peta interaktif GIS...</span>
    </div>
  ),
})

export default function FarmMapWrapper(props: FarmMapProps) {
  return <FarmMap {...props} />
}
