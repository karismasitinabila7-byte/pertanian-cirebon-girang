'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Layers,
  Sprout,
  Wheat,
  Users,
  Search,
  Filter,
  Info,
  Maximize2,
  RotateCcw,
  Compass,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowRight,
  ExternalLink,
  Satellite,
  Map as MapIcon
} from 'lucide-react'

export interface FarmPlot {
  id: string
  namaLahan: string
  luasLahan: number
  satuanLuas: string
  luasHektar: number
  lokasi: string
  latitude: number | null
  longitude: number | null
  status: string
  catatan?: string | null
  isOwned?: boolean
  petani?: {
    id: string
    namaLengkap: string
    nomorTelepon: string
    alamat: string
    kelompokTani?: {
      id: string
      nama: string
      wilayah: string
      ketua: string
    } | null
  } | null
  musimAktif?: {
    id: string
    namaMusim: string
    varietasPadi: string
    tanggalTanam: string | Date
    estimasiPanen: string | Date
    status: string
    panen?: {
      jumlahProduksi: number
      satuan: string
      tanggalPanen: string | Date
    } | null
  } | null
  riwayatMusim?: any[]
}

interface FarmMapProps {
  initialPlots?: FarmPlot[]
  height?: string
  showControls?: boolean
  selectedPlotId?: string | null
  onSelectPlot?: (plot: FarmPlot | null) => void
}

// Koordinat Pusat Desa Cirebon Girang (Kec. Talun, Kab. Cirebon)
const CIREBON_GIRANG_CENTER: [number, number] = [-6.7725, 108.5390]

// Batas Polygon Blok Pertanian Desa Cirebon Girang (GIS Zones)
const BLOK_POLYGONS = [
  {
    name: 'Blok Manis (Dusun Karang Anyar)',
    color: '#10b981',
    fillColor: '#10b981',
    desc: 'Hamparan Sawah Irigasi Teknis Sekunder Cipager',
    coords: [
      [-6.7700, 108.5320],
      [-6.7705, 108.5400],
      [-6.7760, 108.5390],
      [-6.7755, 108.5310]
    ] as [number, number][]
  },
  {
    name: 'Blok Wage (Dusun Girang Hilir)',
    color: '#3b82f6',
    fillColor: '#3b82f6',
    desc: 'Hamparan Sawah Produktif Varietas Ciherang & Inpari',
    coords: [
      [-6.7730, 108.5400],
      [-6.7735, 108.5470],
      [-6.7810, 108.5460],
      [-6.7800, 108.5390]
    ] as [number, number][]
  },
  {
    name: 'Blok Pahing (Dusun Cirebon Ilir)',
    color: '#f59e0b',
    fillColor: '#f59e0b',
    desc: 'Zona Percontohan Pupuk Organik & Irigasi Berselang',
    coords: [
      [-6.7650, 108.5330],
      [-6.7645, 108.5410],
      [-6.7705, 108.5400],
      [-6.7700, 108.5320]
    ] as [number, number][]
  }
]

export default function FarmMap({
  initialPlots = [],
  height = '620px',
  showControls = true,
  selectedPlotId = null,
  onSelectPlot
}: FarmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const polygonLayerRef = useRef<any>(null)
  const tempMarkerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)

  const getLeaflet = async () => {
    if (leafletRef.current) return leafletRef.current
    const L = await import('leaflet')
    leafletRef.current = L
    return L
  }

  const [plots, setPlots] = useState<FarmPlot[]>(initialPlots)
  const [loading, setLoading] = useState(initialPlots.length === 0)
  const [activePlot, setActivePlot] = useState<FarmPlot | null>(null)
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets')
  const [searchQuery, setSearchQuery] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showPolygons, setShowPolygons] = useState(true)
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)

  // Fetch data lahan jika initialPlots kosong
  useEffect(() => {
    if (initialPlots.length > 0) {
      setPlots(initialPlots)
      setLoading(false)
      return
    }

    const fetchGisPlots = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/peta/lahan')
        const json = await res.json()
        if (res.ok && json.data) {
          setPlots(json.data)
        }
      } catch (err) {
        console.error('Error fetching GIS farm plots:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGisPlots()
  }, [initialPlots])

  // Filtered plots
  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      // Filter Kelompok
      if (kelompokFilter !== 'ALL') {
        if (plot.petani?.kelompokTani?.id !== kelompokFilter) return false
      }

      // Filter Status
      if (statusFilter !== 'ALL') {
        const musimStatus = plot.musimAktif?.status || 'TIDAK_AKTIF'
        if (musimStatus !== statusFilter) return false
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = plot.namaLahan.toLowerCase().includes(q)
        const matchFarmer = plot.petani?.namaLengkap.toLowerCase().includes(q) || false
        const matchVariety = plot.musimAktif?.varietasPadi?.toLowerCase().includes(q) || false
        const matchLocation = plot.lokasi.toLowerCase().includes(q)
        if (!matchName && !matchFarmer && !matchVariety && !matchLocation) return false
      }

      return true
    })
  }, [plots, kelompokFilter, statusFilter, searchQuery])

  // Get unique kelompok tani list for filter dropdown
  const kelompokOptions = useMemo(() => {
    const map = new Map<string, string>()
    plots.forEach(p => {
      if (p.petani?.kelompokTani) {
        map.set(p.petani.kelompokTani.id, p.petani.kelompokTani.nama)
      }
    })
    return Array.from(map.entries()).map(([id, nama]) => ({ id, nama }))
  }, [plots])

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (!mapContainerRef.current) return
      if (typeof window === 'undefined') return

      const L = await getLeaflet()
      if (!isMounted) return

      setIsLeafletLoaded(true)

      // Destroy previous map if exists
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop()
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
        } catch (e) {}
        mapInstanceRef.current = null
      }

      // Create new map
      const map = L.map(mapContainerRef.current, {
        center: CIREBON_GIRANG_CENTER,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      })

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Add Attribution Control custom
      L.control.attribution({
        position: 'bottomleft',
        prefix: 'SI PADI &copy; Pemdes Cirebon Girang | OpenStreetMap | Esri'
      }).addTo(map)

      // Tile layers
      const streetTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      })

      const satelliteTile = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      )

      if (mapType === 'satellite') {
        satelliteTile.addTo(map)
      } else {
        streetTile.addTo(map)
      }

      // Layer groups
      const markersLayer = L.layerGroup().addTo(map)
      const polygonLayer = L.layerGroup().addTo(map)

      markersLayerRef.current = markersLayer
      polygonLayerRef.current = polygonLayer
      mapInstanceRef.current = map

      // Map click listener: Coordinate inspector
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        setClickCoords({ lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) })

        if (tempMarkerRef.current) {
          map.removeLayer(tempMarkerRef.current)
        }

        const tempIcon = L.divIcon({
          className: 'custom-temp-pin',
          html: `
            <div style="background: #2563eb; color: white; border-radius: 9999px; padding: 6px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
              <span style="font-size: 14px; font-weight: bold;">+</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })

        const tMarker = L.marker([lat, lng], { icon: tempIcon }).addTo(map)
        tMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: #1e3a8a; display: block; margin-bottom: 4px;">📍 Titik Koordinat Terpilih</strong>
            <div>Lat: <b>${lat.toFixed(6)}</b></div>
            <div>Lng: <b>${lng.toFixed(6)}</b></div>
            <div style="margin-top: 6px; font-size: 11px; color: #64748b;">Wilayah Persawahan Desa Cirebon Girang</div>
          </div>
        `).openPopup()
        tempMarkerRef.current = tMarker
      })
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop()
          mapInstanceRef.current.off()
          mapInstanceRef.current.remove()
        } catch (e) {}
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Switch Base Layer (Street vs Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Dynamically update tiles
    getLeaflet().then((L) => {
      if (!mapInstanceRef.current) return
      map.eachLayer((layer: any) => {
        if (layer._url) {
          map.removeLayer(layer)
        }
      })

      if (mapType === 'satellite') {
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 18 }
        ).addTo(map)
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map)
      }
    })
  }, [mapType])

  // Render Polygons for Agricultural Blocks
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerRef.current) return
    const polygonLayer = polygonLayerRef.current
    polygonLayer.clearLayers()

    if (!showPolygons) return

    getLeaflet().then((L) => {
      if (!mapInstanceRef.current || !polygonLayerRef.current) return
      BLOK_POLYGONS.forEach(b => {
        const poly = L.polygon(b.coords, {
          color: b.color,
          fillColor: b.fillColor,
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '4, 6'
        }).addTo(polygonLayer)

        poly.bindTooltip(
          `<div style="font-weight: bold; font-size: 11px; color: #0f172a;">${b.name}</div><div style="font-size: 10px; color: #475569;">${b.desc}</div>`,
          { sticky: true, className: 'custom-poly-tooltip' }
        )
      })
    })
  }, [showPolygons, isLeafletLoaded])

  // Render Farmland Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return
    const markersLayer = markersLayerRef.current
    markersLayer.clearLayers()

    getLeaflet().then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return
      filteredPlots.forEach(plot => {
        if (!plot.latitude || !plot.longitude) return

        const isPlotSelected = activePlot?.id === plot.id
        const musim = plot.musimAktif
        const statusMusim = musim?.status || 'TIDAK_AKTIF'

        // Color coding:
        // BERJALAN = Green
        // SELESAI = Amber / Gold
        // PERENCANAAN = Blue
        // TIDAK_AKTIF = Slate
        let bgColor = '#10b981' // emerald
        let iconGlyph = '🌾'
        let statusLabel = 'Sedang Ditanami'

        if (statusMusim === 'SELESAI') {
          bgColor = '#f59e0b'
          iconGlyph = '✨'
          statusLabel = 'Telah Panen'
        } else if (statusMusim === 'PERENCANAAN') {
          bgColor = '#3b82f6'
          iconGlyph = '🌱'
          statusLabel = 'Fase Persiapan'
        } else if (plot.status === 'TIDAK_AKTIF') {
          bgColor = '#64748b'
          iconGlyph = '🍂'
          statusLabel = 'Masa Bera / Istirahat'
        }

        const borderStyle = plot.isOwned
          ? 'border: 3px solid #facc15; box-shadow: 0 0 12px rgba(250, 204, 21, 0.8);'
          : isPlotSelected
          ? 'border: 3px solid #ffffff; box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);'
          : 'border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);'

        const customHtml = `
          <div style="
            position: relative;
            background: ${bgColor};
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            ${borderStyle}
          ">
            <span style="
              transform: rotate(45deg);
              font-size: 16px;
              line-height: 1;
            ">${iconGlyph}</span>
            ${plot.isOwned ? `
              <div style="
                position: absolute;
                top: -6px;
                right: -6px;
                background: #facc15;
                color: #854d0e;
                font-size: 9px;
                font-weight: 800;
                padding: 1px 4px;
                border-radius: 9999px;
                border: 1px solid white;
                transform: rotate(45deg);
              ">SAYA</div>
            ` : ''}
          </div>
        `

        const customIcon = L.divIcon({
          className: 'custom-farm-marker',
          html: customHtml,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38]
        })

        const marker = L.marker([plot.latitude, plot.longitude], { icon: customIcon }).addTo(markersLayer)

        // Popup Content
        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 2px; min-width: 230px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 700; background: ${bgColor}20; color: ${bgColor}; padding: 2px 8px; border-radius: 9999px;">
                ${statusLabel}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: #047857;">
                ${plot.luasHektar} Ha (${plot.luasLahan.toLocaleString('id-ID')} m²)
              </span>
            </div>
            
            <h4 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; line-height: 1.2;">
              ${plot.namaLahan}
            </h4>
            
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
              📍 ${plot.lokasi}
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 8px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #64748b;">Pemilik:</span>
                <strong style="color: #1e293b;">${plot.petani?.namaLengkap || 'Petani Mandiri'}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span style="color: #64748b;">Kelompok:</span>
                <span style="color: #047857; font-weight: 600;">${plot.petani?.kelompokTani?.nama || '-'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b;">Varietas Padi:</span>
                <strong style="color: #0f172a;">${musim?.varietasPadi || 'Ciherang / Inpari'}</strong>
              </div>
            </div>

            <button 
              id="btn-select-${plot.id}"
              style="
                width: 100%;
                background: #047857;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
              "
            >
              Lihat Analisis Detail Petak &rarr;
            </button>
          </div>
        `

        marker.bindPopup(popupContent)

        marker.on('click', () => {
          setActivePlot(plot)
          if (onSelectPlot) onSelectPlot(plot)
        })

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-${plot.id}`)
          if (btn) {
            btn.onclick = () => {
              setActivePlot(plot)
              if (onSelectPlot) onSelectPlot(plot)
            }
          }
        })
      })
    })
  }, [filteredPlots, activePlot, isLeafletLoaded])

  // Handle selectedPlotId from prop
  useEffect(() => {
    if (selectedPlotId && plots.length > 0) {
      const found = plots.find(p => p.id === selectedPlotId)
      if (found) {
        handleFlyToPlot(found)
      }
    }
  }, [selectedPlotId, plots])

  // Fly to plot helper
  const handleFlyToPlot = (plot: FarmPlot) => {
    setActivePlot(plot)
    if (onSelectPlot) onSelectPlot(plot)

    if (mapInstanceRef.current && plot.latitude && plot.longitude) {
      mapInstanceRef.current.flyTo([plot.latitude, plot.longitude], 17, {
        animate: true,
        duration: 1.2
      })
    }
  }

  // Reset to default center
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CIREBON_GIRANG_CENTER, 15, {
        animate: true,
        duration: 1.0
      })
    }
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
      {/* ── Top Header & Filter Bar ── */}
      {showControls && (
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 z-10 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2 text-white">
                Peta GIS Sebaran Lahan Sawah
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Desa Cirebon Girang
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Visualisasi titik petak sawah, kelompok tani, varietas padi, dan batas wilayah pertanian
              </p>
            </div>
          </div>

          {/* Quick Filter Inputs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Plot */}
            <div className="relative min-w-[170px] flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari lahan/petani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 placeholder:text-slate-400"
              />
            </div>

            {/* Filter Kelompok Tani */}
            <select
              value={kelompokFilter}
              onChange={(e) => setKelompokFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Poktan</option>
              {kelompokOptions.map(k => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>

            {/* Filter Status Tanam */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="BERJALAN">Aktif Ditanami</option>
              <option value="PERENCANAAN">Fase Persiapan</option>
              <option value="SELESAI">Sudah Panen</option>
            </select>

            {/* Toggle Satellite / Street */}
            <button
              onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                mapType === 'satellite'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Ganti Jenis Peta (Satelit vs Standar)"
            >
              {mapType === 'satellite' ? <Satellite size={14} /> : <MapIcon size={14} />}
              <span>{mapType === 'satellite' ? 'Satelit Esri' : 'Peta Jalan'}</span>
            </button>

            {/* Reset View */}
            <button
              onClick={handleResetView}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Reset Tampilan ke Pusat Desa"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Map Canvas ── */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white">
            <div className="inline-flex items-center gap-3 bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 shadow-lg">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Memuat peta GIS lahan Cirebon Girang...</span>
            </div>
          </div>
        )}

        {/* Floating Quick Legend & Stats Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-xs pointer-events-none">
          {/* Stats Bar */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-200 shadow-md text-xs pointer-events-auto flex items-center gap-4">
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Titik Lahan</span>
              <span className="font-extrabold text-emerald-800 text-sm">{filteredPlots.length} Petak</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Luas</span>
              <span className="font-extrabold text-emerald-800 text-sm">
                {(filteredPlots.reduce((sum, p) => sum + (p.luasLahan || 0), 0) / 10000).toFixed(2)} Ha
              </span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Aktif Tanam</span>
              <span className="font-extrabold text-teal-700 text-sm">
                {filteredPlots.filter(p => p.musimAktif?.status === 'BERJALAN').length} MT
              </span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-gray-200 shadow-sm text-[11px] pointer-events-auto">
            <span className="font-bold text-gray-800 block mb-1.5 text-[10px] uppercase tracking-wider">Status Lahan</span>
            <div className="grid grid-cols-2 gap-1.5 text-gray-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span>Aktif Tanam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span>Persiapan/Bibit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span>Panen Selesai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 flex-shrink-0" />
                <span>Masa Bera</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-gray-600 font-semibold">
                <input
                  type="checkbox"
                  checked={showPolygons}
                  onChange={(e) => setShowPolygons(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                Batas Blok Wilayah
              </label>
            </div>
          </div>
        </div>

        {/* Selected Plot Drawer Card (Floating at bottom or top right) */}
        {activePlot && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-10 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-emerald-300 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {activePlot.musimAktif?.status === 'BERJALAN' ? 'Musim Tanam Aktif' : 'Status: ' + (activePlot.musimAktif?.status || activePlot.status)}
                  </span>
                  {activePlot.isOwned && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      Lahan Milik Anda
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-gray-900 leading-tight">
                  {activePlot.namaLahan}
                </h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-gray-400" />
                  {activePlot.lokasi}
                </p>
              </div>

              <button
                onClick={() => {
                  setActivePlot(null)
                  if (onSelectPlot) onSelectPlot(null)
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
              <div>
                <span className="text-gray-500 text-[10px] block">Petani Pengelola</span>
                <strong className="text-gray-900 block truncate">
                  {activePlot.petani?.namaLengkap || 'Petani Mandiri'}
                </strong>
                <span className="text-[11px] text-emerald-700 truncate block">
                  {activePlot.petani?.kelompokTani?.nama || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Luas Petak Sawah</span>
                <strong className="text-gray-900 block">
                  {activePlot.luasHektar} Ha
                </strong>
                <span className="text-[11px] text-gray-500">
                  {activePlot.luasLahan.toLocaleString('id-ID')} m²
                </span>
              </div>
            </div>

            {activePlot.musimAktif && (
              <div className="mt-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[11px]">Varietas Padi:</span>
                  <span className="font-bold text-gray-800">{activePlot.musimAktif.varietasPadi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[11px]">Musim:</span>
                  <span className="font-medium text-emerald-800 text-[11px] truncate max-w-[170px]">
                    {activePlot.musimAktif.namaMusim}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[11px]">Estimasi Panen:</span>
                  <span className="font-semibold text-amber-700">
                    {new Date(activePlot.musimAktif.estimasiPanen).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              {activePlot.petani?.nomorTelepon && (
                <a
                  href={`tel:${activePlot.petani.nomorTelepon}`}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs flex items-center justify-center transition"
                  title="Hubungi Petani"
                >
                  <Phone size={14} />
                </a>
              )}
              <Link
                href={`/admin/lahan/${activePlot.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-xs"
              >
                <span>Buka Detail Lahan</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Strip: Quick Plot Thumbnails ── */}
      <div className="p-3 bg-gray-50 border-t border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sprout size={14} className="text-emerald-600" />
            Petak Lahan Terpilih:
          </span>
          {plots.slice(0, 8).map(plot => (
            <button
              key={plot.id}
              onClick={() => handleFlyToPlot(plot)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
                activePlot?.id === plot.id
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${plot.musimAktif?.status === 'BERJALAN' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="truncate max-w-[120px]">{plot.namaLahan}</span>
              <span className="text-[10px] opacity-75 font-mono">({plot.luasHektar} Ha)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
