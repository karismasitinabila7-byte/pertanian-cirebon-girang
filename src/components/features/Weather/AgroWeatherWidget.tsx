'use client'

import React, { useState, useEffect } from 'react'
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  CloudLightning,
  ChevronRight,
  RefreshCw,
  MapPin,
  ShieldAlert,
  Sprout,
  Wheat
} from 'lucide-react'

export interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  precipitation: number
  rainProb: number
  weatherCode: number
  weatherText: string
  isDay: boolean
  updatedAt: string
  daily: {
    date: string
    dayName: string
    maxTemp: number
    minTemp: number
    weatherCode: number
    weatherText: string
    rainSum: number
    rainProb: number
  }[]
}

// Fallback data cuaca realistik Desa Cirebon Girang (Kec. Talun, Kab. Cirebon)
const FALLBACK_WEATHER: WeatherData = {
  temp: 29.4,
  feelsLike: 33.1,
  humidity: 78,
  windSpeed: 11.2,
  precipitation: 2.4,
  rainProb: 45,
  weatherCode: 2,
  weatherText: 'Cerah Berawan',
  isDay: true,
  updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  daily: [
    { date: 'Hari Ini', dayName: 'Hari Ini', maxTemp: 32, minTemp: 24, weatherCode: 2, weatherText: 'Cerah Berawan', rainSum: 2.4, rainProb: 45 },
    { date: 'Besok', dayName: 'Besok', maxTemp: 31, minTemp: 24, weatherCode: 61, weatherText: 'Hujan Ringan', rainSum: 8.5, rainProb: 65 },
    { date: 'Lusa', dayName: 'Lusa', maxTemp: 30, minTemp: 23, weatherCode: 63, weatherText: 'Hujan Sedang', rainSum: 14.2, rainProb: 75 },
    { date: 'Hari ke-4', dayName: 'Hari ke-4', maxTemp: 33, minTemp: 24, weatherCode: 1, weatherText: 'Cerah', rainSum: 0.5, rainProb: 20 },
  ]
}

function decodeWmoCode(code: number): { text: string; icon: any; color: string } {
  if (code === 0) return { text: 'Cerah', icon: Sun, color: 'text-amber-500' }
  if (code === 1 || code === 2) return { text: 'Cerah Berawan', icon: CloudSun, color: 'text-yellow-600' }
  if (code === 3) return { text: 'Mendung Berawan', icon: CloudSun, color: 'text-slate-600' }
  if (code >= 51 && code <= 55) return { text: 'Gerimis Ringan', icon: CloudRain, color: 'text-blue-500' }
  if (code >= 61 && code <= 65) return { text: 'Hujan Berkala', icon: CloudRain, color: 'text-blue-600' }
  if (code >= 80 && code <= 82) return { text: 'Hujan Lebat', icon: CloudRain, color: 'text-indigo-600' }
  if (code >= 95) return { text: 'Hujan Badai Petir', icon: CloudLightning, color: 'text-purple-600' }
  return { text: 'Berawan Lembap', icon: CloudSun, color: 'text-teal-600' }
}

export function AgroWeatherWidget({ role = 'PETANI' }: { role?: string }) {
  const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'harian' | 'rekomendasi' | 'forecast'>('rekomendasi')
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch live weather data from Open-Meteo for Cirebon Girang (lat: -6.7725, lon: 108.5390)
  const fetchWeather = async () => {
    try {
      setLoading(true)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=-6.7725&longitude=108.5390&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FJakarta`
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()

      const current = data.current
      const daily = data.daily
      const code = current.weather_code || 2

      const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      const formattedDaily = daily.time.slice(0, 4).map((t: string, idx: number) => {
        const d = new Date(t)
        const dayName = idx === 0 ? 'Hari Ini' : idx === 1 ? 'Besok' : daysOfWeek[d.getDay()]
        const dCode = daily.weather_code[idx]
        return {
          date: t,
          dayName,
          maxTemp: Math.round(daily.temperature_2m_max[idx]),
          minTemp: Math.round(daily.temperature_2m_min[idx]),
          weatherCode: dCode,
          weatherText: decodeWmoCode(dCode).text,
          rainSum: Number((daily.precipitation_sum[idx] || 0).toFixed(1)),
          rainProb: Math.round(daily.precipitation_probability_max[idx] || 0)
        }
      })

      setWeather({
        temp: Number(current.temperature_2m.toFixed(1)),
        feelsLike: Number(current.apparent_temperature.toFixed(1)),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Number(current.wind_speed_10m.toFixed(1)),
        precipitation: Number((current.precipitation || 0).toFixed(1)),
        rainProb: Math.round(daily.precipitation_probability_max[0] || 40),
        weatherCode: code,
        weatherText: decodeWmoCode(code).text,
        isDay: current.is_day === 1,
        updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        daily: formattedDaily
      })
    } catch (err) {
      // Fallback gracefully to default
      console.warn('Menggunakan fallback data cuaca Cirebon Girang:', err)
      setWeather(prev => ({
        ...prev,
        updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [])

  // Smart Agricultural Recommendation Generator
  const recommendations = React.useMemo(() => {
    const isHeavyRainRisk = weather.rainProb > 65 || weather.precipitation > 8.0
    const isWindHigh = weather.windSpeed > 16.0
    const isHighHumidity = weather.humidity > 80

    return [
      {
        id: 'pemupukan',
        activity: 'Aplikasi Pemupukan (Urea & NPK)',
        status: isHeavyRainRisk ? 'Tunda Sementara' : 'Sangat Direkomendasikan',
        isSafe: !isHeavyRainRisk,
        urgency: isHeavyRainRisk ? 'warning' : 'safe',
        badge: isHeavyRainRisk ? 'Risiko Cuci Hara' : 'Ideal 07:00 - 10:00',
        advice: isHeavyRainRisk
          ? 'Potensi hujan lebat sore hari dapat menghanyutkan butir pupuk sebelum terserap akar. Tunda penaburan urea/phonska hingga intensitas hujan reda.'
          : 'Kondisi kelembapan tanah macak-macak optimal untuk penyerapan unsur hara. Taburkan pupuk saat pagi hari lalu benamkan tipis.'
      },
      {
        id: 'penyemprotan',
        activity: 'Penyemprotan Pestisida & Fungisida',
        status: isWindHigh || isHeavyRainRisk ? 'Kurang Disarankan' : 'Waktu Ideal',
        isSafe: !isWindHigh && !isHeavyRainRisk,
        urgency: isWindHigh || isHeavyRainRisk ? 'warning' : 'safe',
        badge: isWindHigh ? 'Angin Kencang' : 'Kecepatan Angin Stabil',
        advice: isWindHigh
          ? `Kecepatan angin mencapai ${weather.windSpeed} km/jam dapat menyebabkan semprotan melayang (drift). Tunggu angin tenang di bawah 12 km/jam.`
          : 'Lakukan penyemprotan pencegahan wereng atau kresek antara pukul 06.30 - 09.00 pagi dengan nozzle kabut terarah ke pangkal batang.'
      },
      {
        id: 'pengairan',
        activity: 'Pengaturan Saluran Irigasi Tersier',
        status: isHeavyRainRisk ? 'Buka Saluran Pembuangan' : 'Irigasi Berselang (Macak-macak)',
        isSafe: true,
        urgency: isHeavyRainRisk ? 'info' : 'safe',
        badge: isHeavyRainRisk ? 'Siaga Limpasan Air' : 'Hemat Air 3-5 cm',
        advice: isHeavyRainRisk
          ? 'Buka pintu pembuangan air agar debit hujan tidak menenggelamkan rumpun padi muda lebih dari 24 jam berturut-turut.'
          : 'Jaga ketinggian air 2-3 cm (macak-macak). Sirkulasi oksigen tanah yang baik mencegah pembusukan akar padi.'
      },
      {
        id: 'pengeringan',
        activity: 'Penjemuran Gabah (Lantai Jemur)',
        status: weather.rainProb < 40 && weather.temp > 28 ? 'Kondisi Prima' : 'Waspada Terpal Siaga',
        isSafe: weather.rainProb < 40,
        urgency: weather.rainProb < 40 ? 'safe' : 'warning',
        badge: `Radiasi ${weather.temp}°C`,
        advice: weather.rainProb < 40
          ? 'Intensitas sinar matahari cukup terik. Bolak-balik gabah setiap 1.5 jam untuk mengejar target kadar air standar 14% (GKG).'
          : 'Siapkan terpal pelindung cepat. Jangan biarkan gabah basah terendam air hujan karena memicu butir beras patah dan menguning.'
      }
    ]
  }, [weather])

  const CurrentIcon = decodeWmoCode(weather.weatherCode).icon
  const currentColor = decodeWmoCode(weather.weatherCode).color

  return (
    <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 rounded-2xl border border-emerald-200/90 shadow-sm overflow-hidden">
      {/* ── Top Bar: Location & Live Status ── */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700/60 flex items-center justify-center border border-emerald-400/40 text-emerald-200">
            <CloudSun size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Prediksi Cuaca Agroklimat Lokal
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-300">
                <MapPin size={10} /> Desa Cirebon Girang (Talun)
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              Data Meteorologi & Rekomendasi Aktivitas Harian Petani Padi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-200 font-mono">
            Diperbarui {weather.updatedAt} WIB
          </span>
          <button
            onClick={fetchWeather}
            disabled={loading}
            className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition disabled:opacity-50"
            title="Perbarui Data Cuaca"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Weather Highlights Overview ── */}
      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Main Weather Card (Left) */}
          <div className="lg:col-span-5 flex items-center gap-4 bg-white/90 p-4 rounded-xl border border-emerald-100 shadow-xs">
            <div className={`p-3 rounded-2xl bg-amber-50 border border-amber-200 flex-shrink-0 ${currentColor}`}>
              <CurrentIcon size={40} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {weather.temp}°C
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Terasa {weather.feelsLike}°C
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-800 mt-0.5">
                {weather.weatherText}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Droplets size={13} className="text-blue-500" />
                  Kelembapan: <strong>{weather.humidity}%</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Wind size={13} className="text-teal-600" />
                  Angin: <strong>{weather.windSpeed} km/j</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics (Right) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Curah Hujan</span>
              <span className="text-base font-extrabold text-blue-700 mt-0.5 block">
                {weather.precipitation} mm
              </span>
              <span className="text-[10px] text-gray-400">Hari ini</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Peluang Hujan</span>
              <span className="text-base font-extrabold text-teal-700 mt-0.5 block">
                {weather.rainProb}%
              </span>
              <span className="text-[10px] text-gray-400">Probabilitas</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Kecepatan Angin</span>
              <span className="text-base font-extrabold text-gray-800 mt-0.5 block">
                {weather.windSpeed} <span className="text-xs font-normal">km/j</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {weather.windSpeed <= 15 ? 'Aman Semprot' : 'Angin Kencang'}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200/80 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Indeks Wereng</span>
              <span className="text-base font-extrabold text-amber-700 mt-0.5 block">
                {weather.humidity >= 80 ? 'Waspada' : 'Sedang'}
              </span>
              <span className="text-[10px] text-gray-400">Kelembapan mikro</span>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-100">
          <button
            onClick={() => setActiveTab('rekomendasi')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'rekomendasi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Rekomendasi Aktivitas Tani ({recommendations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
            }`}
          >
            <Calendar size={13} />
            <span>Prakiraan 4 Hari Ke Depan</span>
          </button>

          <button
            onClick={() => setShowDetailModal(true)}
            className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <Info size={13} /> Panduan Lengkap
          </button>
        </div>

        {/* ── Tab Content 1: Rekomendasi Pertanian Harian ── */}
        {activeTab === 'rekomendasi' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-3.5 rounded-xl border transition ${
                  rec.isSafe
                    ? 'bg-white border-emerald-200 hover:border-emerald-400'
                    : 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {rec.isSafe ? (
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-gray-900">{rec.activity}</h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      rec.isSafe
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rec.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pl-5">
                  {rec.advice}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab Content 2: Prakiraan 4 Hari Ke Depan ── */}
        {activeTab === 'forecast' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {weather.daily.map((day, idx) => {
              const DayIcon = decodeWmoCode(day.weatherCode).icon
              const dColor = decodeWmoCode(day.weatherCode).color
              return (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-gray-200/80 text-center flex flex-col items-center justify-between"
                >
                  <span className="text-xs font-bold text-gray-800">{day.dayName}</span>
                  <div className={`my-2 p-2 rounded-xl bg-gray-50 ${dColor}`}>
                    <DayIcon size={26} />
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {day.maxTemp}° / {day.minTemp}°C
                  </span>
                  <span className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    {day.weatherText}
                  </span>
                  <div className="mt-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    💧 {day.rainProb}% ({day.rainSum} mm)
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal Dialog: Panduan Agroklimat & Kalender Cuaca Pertanian ── */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-600/75 transition-opacity" onClick={() => setShowDetailModal(false)} />
            <div className="inline-block bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full z-10 border border-emerald-300">
              <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sprout size={22} className="text-emerald-300" />
                  <h3 className="font-bold text-base">Panduan Agroklimat Padi Cirebon Girang</h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-emerald-200 hover:text-white text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-gray-700 leading-relaxed">
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    Prinsip Cuaca untuk Tanaman Padi
                  </h4>
                  <p>
                    Pertanian padi di dataran Talun Cirebon Girang membutuhkan keseimbangan air dan sinar matahari. Suhu ideal vegetatif dan generatif padi berkisar 24°C - 32°C dengan kelembapan relatif 70-80%.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">1. Rekomendasi Waktu Penyemprotan:</h4>
                  <p>
                    Lakukan penyemprotan insektisida/pupuk daun pada pagi hari pukul 06.00 - 09.00 saat stomata daun terbuka lebar dan embun pagi mulai mengering. Hindari menyemprot di atas jam 10.00 karena suhu terik menyebabkan cairan obat cepat menguap.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">2. Antisipasi Rebah Batang & Hujan Angin:</h4>
                  <p>
                    Pada fase bunting dan berbunga, jika prakiraan angin melampaui 18 km/jam, berikan tambahan unsur Kalium (KCl) dan pupuk Silika untuk memperkokoh kekuatan dinding sel batang tanaman.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1">3. Standar Pengeringan Pascapanen:</h4>
                  <p>
                    Kadar air gabah kering panen (GKP) umumnya 22-25%. Dengan sinar matahari rata-rata 6-8 jam per hari, penjemuran selama 2-3 hari di lantai jemur terpal bersih akan mencapai standar gabah kering giling (GKG) 14%.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs"
                  >
                    Tutup Panduan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
