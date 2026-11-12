'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Settings,
  Bot,
  Mail,
  Bell,
  Sparkles,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  MessageSquare,
  Server,
  Key,
  Shield,
  HelpCircle,
  Zap,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react'

export default function AdminKonfigurasiPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'notifikasi' | 'desa'>('ai')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [showApiKey, setShowApiKey] = useState(false)
  const [showSmtpPass, setShowSmtpPass] = useState(false)
  const [showWaToken, setShowWaToken] = useState(false)

  // AI Settings
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini')
  const [aiApiKey, setAiApiKey] = useState('')
  const [aiGeminiModel, setAiGeminiModel] = useState('gemini-3.0-flash')
  const [aiOpenAiModel, setAiOpenAiModel] = useState('gpt-4o-mini')
  const [aiPersona, setAiPersona] = useState<'ramah_sunda' | 'agronomi_formal' | 'penyuluh_ringkas'>('ramah_sunda')
  const [aiEnablePetaniConsultation, setAiEnablePetaniConsultation] = useState(true)
  const [aiEnableFertilizerRecommendation, setAiEnableFertilizerRecommendation] = useState(true)
  const [aiEnableLocalFallback, setAiEnableLocalFallback] = useState(true)

  // Notification Settings
  const [notificationTargetEmail, setNotificationTargetEmail] = useState('karismasitinabila7@gmail.com')
  const [defaultWhatsAppNumber, setDefaultWhatsAppNumber] = useState('6285797864834')
  const [waGatewayProvider, setWaGatewayProvider] = useState<'fonnte' | 'wablas' | 'webhook'>('fonnte')
  const [waApiToken, setWaApiToken] = useState('')
  const [waApiUrl, setWaApiUrl] = useState('https://api.fonnte.com/send')
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpFromName, setSmtpFromName] = useState('SI PADI')
  const [smtpFromEmail, setSmtpFromEmail] = useState('Karismasitinabila7@gmail.com')
  const [notifyOnFertilizationAlert, setNotifyOnFertilizationAlert] = useState(true)
  const [notifyOnHarvestAlert, setNotifyOnHarvestAlert] = useState(true)
  const [notifyOnPestWeatherAlert, setNotifyOnPestWeatherAlert] = useState(true)
  const [notifyOnNewSeason, setNotifyOnNewSeason] = useState(true)
  const [notifyOnNewHarvest, setNotifyOnNewHarvest] = useState(true)

  // Desa Settings
  const [appName, setAppName] = useState('Platform Pertanian Padi Desa Cirebon Girang (SI PADI)')
  const [villageName, setVillageName] = useState('Desa Cirebon Girang')
  const [districtName, setDistrictName] = useState('Kecamatan Talun')
  const [regencyName, setRegencyName] = useState('Kabupaten Cirebon')
  const [adminContactName, setAdminContactName] = useState('Karisma Siti Nabila')
  const [adminContactPhone, setAdminContactPhone] = useState('0812-3456-7890')

  // Live Test State
  const [testingAi, setTestingAi] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{
    success: boolean
    latencyMs?: number
    responseSample?: string
    error?: string
    isFallback?: boolean
    provider?: string
    model?: string
    apiError?: string
    hasApiKey?: boolean
  } | null>(null)

  const [testingEmail, setTestingEmail] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean
    message?: string
    gmailUrl?: string
    error?: string
    isSimulated?: boolean
  } | null>(null)

  const [testingWa, setTestingWa] = useState(false)
  const [waTestResult, setWaTestResult] = useState<{
    success: boolean
    sentAutomatically?: boolean
    isNotConfigured?: boolean
    message?: string
    waUrl?: string
    error?: string
    target?: string
    provider?: string
  } | null>(null)

  // Fetch current settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          const d = res.data
          setAiProvider(d.aiProvider || 'gemini')
          setAiApiKey(d.aiApiKey || '')
          setAiGeminiModel(
            !d.aiGeminiModel || ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].includes(d.aiGeminiModel)
              ? 'gemini-3.0-flash'
              : d.aiGeminiModel
          )
          setAiOpenAiModel(d.aiOpenAiModel || 'gpt-4o-mini')
          setAiPersona(d.aiPersona || 'ramah_sunda')
          setAiEnablePetaniConsultation(d.aiEnablePetaniConsultation ?? true)
          setAiEnableFertilizerRecommendation(d.aiEnableFertilizerRecommendation ?? true)
          setAiEnableLocalFallback(d.aiEnableLocalFallback ?? true)

          setNotificationTargetEmail(d.notificationTargetEmail || 'karismasitinabila7@gmail.com')
          setDefaultWhatsAppNumber(d.defaultWhatsAppNumber || '6285797864834')
          setWaGatewayProvider(d.waGatewayProvider || 'fonnte')
          setWaApiToken(d.waApiToken || '')
          setWaApiUrl(d.waApiUrl || 'https://api.fonnte.com/send')
          setSmtpHost(d.smtpHost || 'smtp.gmail.com')
          setSmtpPort(d.smtpPort || 587)
          setSmtpUser(d.smtpUser || '')
          setSmtpPass(d.smtpPass || '')
          setSmtpFromName(d.smtpFromName || 'SI PADI Desa Cirebon Girang')
          setSmtpFromEmail(d.smtpFromEmail || 'Karismasitinabila7@gmail.com')
          setNotifyOnFertilizationAlert(d.notifyOnFertilizationAlert ?? true)
          setNotifyOnHarvestAlert(d.notifyOnHarvestAlert ?? true)
          setNotifyOnPestWeatherAlert(d.notifyOnPestWeatherAlert ?? true)
          setNotifyOnNewSeason(d.notifyOnNewSeason ?? true)
          setNotifyOnNewHarvest(d.notifyOnNewHarvest ?? true)

          setAppName(d.appName || 'Platform Pertanian Padi Desa Cirebon Girang (SI PADI)')
          setVillageName(d.villageName || 'Desa Cirebon Girang')
          setDistrictName(d.districtName || 'Kecamatan Talun')
          setRegencyName(d.regencyName || 'Kabupaten Cirebon')
          setAdminContactName(d.adminContactName || 'Karisma Siti Nabila')
          setAdminContactPhone(d.adminContactPhone || '0812-3456-7890')
        }
      })
      .catch((err) => console.error('Error loading settings:', err))
      .finally(() => setLoading(false))
  }, [])

  // Save all settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setStatusMsg(null)

    try {
      const payload = {
        aiProvider,
        aiApiKey,
        aiGeminiModel,
        aiOpenAiModel,
        aiPersona,
        aiEnablePetaniConsultation,
        aiEnableFertilizerRecommendation,
        aiEnableLocalFallback,

        notificationTargetEmail,
        defaultWhatsAppNumber,
        waGatewayProvider,
        waApiToken,
        waApiUrl,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
        smtpFromName,
        smtpFromEmail,
        notifyOnFertilizationAlert,
        notifyOnHarvestAlert,
        notifyOnPestWeatherAlert,
        notifyOnNewSeason,
        notifyOnNewHarvest,

        appName,
        villageName,
        districtName,
        regencyName,
        adminContactName,
        adminContactPhone,
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatusMsg({
          type: 'success',
          text: 'Konfigurasi sistem berhasil disimpan dan langsung aktif di seluruh layanan!',
        })
      } else {
        setStatusMsg({
          type: 'error',
          text: data.error || 'Gagal menyimpan konfigurasi.',
        })
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Terjadi gangguan jaringan saat menyimpan pengaturan.',
      })
    } finally {
      setSaving(false)
    }
  }

  // Test AI Connection
  const handleTestAi = async () => {
    setTestingAi(true)
    setAiTestResult(null)
    try {
      const res = await fetch('/api/settings/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: aiApiKey,
          provider: aiProvider,
          model: aiProvider === 'gemini' ? aiGeminiModel : aiOpenAiModel,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setAiTestResult({
          success: true,
          latencyMs: data.latencyMs,
          responseSample: data.responseSample,
          isFallback: data.isFallback,
          provider: data.provider,
          model: data.model,
          apiError: data.apiError,
          hasApiKey: data.hasApiKey,
        })
      } else {
        setAiTestResult({
          success: false,
          error: data.error || 'Gagal terhubung dengan engine AI.',
        })
      }
    } catch (err: any) {
      setAiTestResult({
        success: false,
        error: err.message || 'Gagal menghubungi server.',
      })
    } finally {
      setTestingAi(false)
    }
  }

  // Test Email
  const handleTestEmail = async () => {
    setTestingEmail(true)
    setEmailTestResult(null)
    try {
      const res = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: notificationTargetEmail }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setEmailTestResult({
          success: true,
          message: data.result?.note || `Email uji coba berhasil diproses ke ${notificationTargetEmail}!`,
          gmailUrl: data.gmailUrl,
          isSimulated: data.result?.isSimulated,
        })
      } else {
        setEmailTestResult({
          success: false,
          error: data.error || 'Gagal mengirim email uji coba.',
        })
      }
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        error: err.message || 'Terjadi kesalahan saat pengiriman email.',
      })
    } finally {
      setTestingEmail(false)
    }
  }

  // Test WhatsApp Gateway Otomatis
  const handleTestWa = async () => {
    setTestingWa(true)
    setWaTestResult(null)
    try {
      const res = await fetch('/api/settings/test-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: defaultWhatsAppNumber,
          token: waApiToken,
          provider: waGatewayProvider,
          apiUrl: waApiUrl,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setWaTestResult({
          success: true,
          sentAutomatically: Boolean(data.sentAutomatically),
          isNotConfigured: Boolean(data.isNotConfigured),
          message:
            data.note ||
            (data.sentAutomatically
              ? `Pesan WhatsApp uji coba berhasil dikirim OTOMATIS ke ${data.target}!`
              : 'Token Gateway WA belum diatur.'),
          waUrl: data.waUrl,
          target: data.target,
          provider: data.provider,
        })
      } else {
        setWaTestResult({
          success: false,
          sentAutomatically: false,
          error: data.error || 'Gagal mengirim pesan WhatsApp uji coba.',
          waUrl: data.waUrl,
        })
      }
    } catch (err: any) {
      setWaTestResult({
        success: false,
        sentAutomatically: false,
        error: err.message || 'Terjadi kesalahan saat menguji gateway WhatsApp.',
      })
    } finally {
      setTestingWa(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2.5 text-sm text-gray-500 font-semibold">
          <Loader2 className="animate-spin text-emerald-600" size={20} />
          <span>Memuat Konfigurasi Sistem...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Settings size={22} />
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
              Konfigurasi & Pengaturan Sistem
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kelola parameter kecerdasan buatan (AI Assistant), notifikasi Email & WhatsApp, serta identitas sistem Desa Cirebon Girang.
          </p>
        </div>

        <button
          onClick={() => handleSaveSettings()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm hover:shadow transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyimpan Konfigurasi...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Simpan Seluruh Pengaturan</span>
            </>
          )}
        </button>
      </div>

      {/* ── Status Banner ── */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bot size={16} />
          <span>Kecerdasan Buatan (AI)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">Aktif</span>
        </button>

        <button
          onClick={() => setActiveTab('notifikasi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'notifikasi'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Mail size={16} />
          <span>Notifikasi Email & WA</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">Terhubung</span>
        </button>

        <button
          onClick={() => setActiveTab('desa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'desa'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 size={16} />
          <span>Profil & Identitas Desa</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: KECERDASAN BUATAN (AI ASSISTANT)                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span>Penyedia Engine AI (AI Provider & Model)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Pilih provider utama yang digunakan untuk menjawab konsultasi budidaya padi, hama tanaman, dan perhitungan takaran pupuk.
              </p>
            </div>

            {/* Provider Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setAiProvider('gemini')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                  aiProvider === 'gemini'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                  G
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Google Gemini</h3>
                    {aiProvider === 'gemini' && (
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Aktif Digunakan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Model multimodal generasi terbaru dari Google dengan respon kilat dan penalaran agrikultur tinggi.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setAiProvider('openai')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                  aiProvider === 'openai'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm flex-shrink-0">
                  OA
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">OpenAI (ChatGPT)</h3>
                    {aiProvider === 'openai' && (
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Aktif Digunakan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Model GPT-4o-mini / GPT-4o yang handal untuk penalaran natural language dan instruksi kompleks.
                  </p>
                </div>
              </div>
            </div>

            {/* Model & API Key Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Model AI yang Digunakan:
                </label>
                {aiProvider === 'gemini' ? (
                  <select
                    value={aiGeminiModel}
                    onChange={(e) => setAiGeminiModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                  >
                    <option value="gemini-3.0-flash">gemini-3.0-flash (Terbaru &amp; Direkomendasikan)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Cepat &amp; Stabil)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Analisis Mendalam)</option>
                  </select>
                ) : (
                  <select
                    value={aiOpenAiModel}
                    onChange={(e) => setAiOpenAiModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Efisien & Responsif)</option>
                    <option value="gpt-4o">gpt-4o (Model Flagship)</option>
                  </select>
                )}
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Model dapat diganti sewaktu-waktu sesuai kebutuhan analisis lapangan.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span>API Key {aiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'}:</span>
                  <a
                    href={
                      aiProvider === 'gemini'
                        ? 'https://aistudio.google.com/apikey'
                        : 'https://platform.openai.com/api-keys'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Dapatkan API Key</span>
                    <ExternalLink size={10} />
                  </a>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <Key size={14} />
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder={
                      aiProvider === 'gemini'
                        ? 'AIzaSy...'
                        : 'sk-proj-...'
                    }
                    className="w-full pl-8 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    title={showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Kunci API disimpan dengan aman di server dan tidak pernah diekspos ke publik.
                </span>
              </div>
            </div>

            {/* Persona & Nada Bicara AI */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-800 mb-2">
                Gaya Bahasa & Persona Asisten AI Desa:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setAiPersona('ramah_sunda')}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    aiPersona === 'ramah_sunda'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="font-bold">🌾 Ramah & Santun (Sunda/Cirebon)</p>
                  <p className="text-[11px] font-normal text-gray-500 mt-1">
                    Gaya bertutur hangat, merangkul petani lokal, dan sopan ala pedesaan Cirebon Girang.
                  </p>
                </div>

                <div
                  onClick={() => setAiPersona('agronomi_formal')}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    aiPersona === 'agronomi_formal'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="font-bold">🔬 Pakar Agronomi & Peneliti</p>
                  <p className="text-[11px] font-normal text-gray-500 mt-1">
                    Fokus pada data teknis ilmiah, takaran NPK/Urea, dan referensi varietas Inpari/Ciherang.
                  </p>
                </div>

                <div
                  onClick={() => setAiPersona('penyuluh_ringkas')}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    aiPersona === 'penyuluh_ringkas'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="font-bold">📋 Penyuluh Lapangan Ringkas</p>
                  <p className="text-[11px] font-normal text-gray-500 mt-1">
                    Jawaban praktis to-the-point dengan instruksi langkah-demi-langkah yang mudah dipraktikkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Fitur AI Toggles */}
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <label className="block text-xs font-bold text-gray-800">
                Fitur AI yang Diaktifkan di Platform:
              </label>

              <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiEnablePetaniConsultation}
                    onChange={(e) => setAiEnablePetaniConsultation(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Konsultasi AI untuk Petani</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiEnableFertilizerRecommendation}
                    onChange={(e) => setAiEnableFertilizerRecommendation(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Rekomendasi Pemupukan Cerdas (HST)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiEnableLocalFallback}
                    onChange={(e) => setAiEnableLocalFallback(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Fallback Super Engine Agronomi Lokal</span>
                </label>
              </div>
            </div>

            {/* Uji Koneksi AI */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Uji Coba Koneksi AI Langsung</h4>
                  <p className="text-[11px] text-gray-500">
                    Kirimkan prompt uji coba ke engine {aiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI'} untuk memverifikasi kesiapan respon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestAi}
                  disabled={testingAi}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {testingAi ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Menguji Engine...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={13} className="text-amber-400" />
                      <span>Uji Koneksi AI</span>
                    </>
                  )}
                </button>
              </div>

              {aiTestResult && (
                <div
                  className={`mt-3 p-4 rounded-xl border text-xs transition-all ${
                    !aiTestResult.success
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : !aiTestResult.isFallback
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                      : aiTestResult.apiError
                      ? 'bg-sky-50 border-sky-200 text-sky-950'
                      : 'bg-blue-50 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-bold flex items-center gap-1.5 text-xs">
                      {!aiTestResult.success ? (
                        <>
                          <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
                          <span>Koneksi AI Gagal Dihubungi</span>
                        </>
                      ) : !aiTestResult.isFallback ? (
                        <>
                          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                          <span>✓ API Key Valid & Terhubung ke Google Gemini Cloud ({aiTestResult.latencyMs} ms)</span>
                        </>
                      ) : aiTestResult.apiError ? (
                        <>
                          <CheckCircle size={15} className="text-sky-600 flex-shrink-0" />
                          <span>✓ API Key Tersimpan — Super Engine Lokal Siap Melayani ({aiTestResult.latencyMs} ms)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={15} className="text-blue-600 flex-shrink-0" />
                          <span>Super Engine Pengetahuan Lokal Aktif ({aiTestResult.latencyMs} ms)</span>
                        </>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!aiTestResult.isFallback ? (
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          Cloud Gemini Live ({aiTestResult.model || 'gemini-3.0-flash'})
                        </span>
                      ) : aiTestResult.apiError ? (
                        <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full font-bold">
                          Hybrid Engine Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                          Offline Knowledge Engine
                        </span>
                      )}
                    </div>
                  </div>

                  {aiTestResult.apiError && (
                    <div className="p-2 mb-2 rounded bg-sky-100/70 text-sky-900 text-[11px]">
                      Info Server Cloud: {aiTestResult.apiError.includes('503') || aiTestResult.apiError.includes('high demand')
                        ? 'Server model Google Gemini sedang padat sementara, sistem otomatis melayani via Super Engine Lokal.'
                        : aiTestResult.apiError}
                    </div>
                  )}

                  {!aiTestResult.isFallback && (
                    <p className="text-[11px] text-emerald-800 mb-1.5 font-medium">
                      Sampel jawaban langsung dari Google Gemini API untuk petani Desa Cirebon Girang:
                    </p>
                  )}

                  <div className="text-xs text-gray-800 leading-relaxed font-sans bg-white/90 p-3 rounded-lg border border-gray-200 shadow-2xs whitespace-pre-line">
                    {aiTestResult.responseSample || aiTestResult.error}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: NOTIFIKASI EMAIL & WHATSAPP                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'notifikasi' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-emerald-700" />
                <span>Penerima & Server Pengiriman Notifikasi</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Atur alamat email pengawas, nomor WhatsApp tujuan default, dan konfigurasi server pengiriman SMTP.
              </p>
            </div>

            {/* Target Utama Email & WA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80">
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  Alamat Email Admin / Pengawas Utama:
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-2.5 text-emerald-700" />
                  <input
                    type="email"
                    value={notificationTargetEmail}
                    onChange={(e) => setNotificationTargetEmail(e.target.value)}
                    placeholder="karismasitinabila7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <span className="text-[11px] text-gray-600 mt-1 block">
                  Seluruh rangkuman dan peringatan dini pertanian akan dikirimkan ke email ini.
                </span>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80">
                <label className="block text-xs font-bold text-emerald-950 mb-1.5">
                  Nomor WhatsApp Default Pengurus Desa:
                </label>
                <div className="relative">
                  <MessageSquare size={15} className="absolute left-3 top-2.5 text-emerald-700" />
                  <input
                    type="text"
                    value={defaultWhatsAppNumber}
                    onChange={(e) => setDefaultWhatsAppNumber(e.target.value)}
                    placeholder="6285797864834"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                  />
                </div>
                <span className="text-[11px] text-gray-600 mt-1 block">
                  Nomor tujuan default pesan peringatan dini saat dikirim via WhatsApp.
                </span>
              </div>
            </div>

            {/* Pengaturan Server Email SMTP */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <Server size={14} className="text-sky-600" />
                    <span>Konfigurasi Server SMTP (Google Mail / Custom)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Gunakan Sandi Aplikasi (App Password) Gmail untuk pengiriman email otomatis tanpa batas.
                  </p>
                </div>
                <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                  SMTP Port: {smtpPort}
                </span>
              </div>
              <div className="p-3.5 bg-sky-50/90 border border-sky-200 rounded-2xl text-xs space-y-1.5 mb-3.5">
                <div className="font-bold flex items-center gap-1.5 text-sky-950">
                  <Info size={14} className="text-sky-700 flex-shrink-0" />
                  <span>Agar Pengirim Tampil Sebagai &quot;SI PADI&quot; (Bukan Nama / Foto Akun Google Pribadi)</span>
                </div>
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  Email harus dikirimkan langsung oleh sistem aplikasi melalui SMTP di bawah ini. Masukkan Akun Pengirim dan <strong>Sandi Aplikasi Google (16 huruf)</strong>, lalu klik <em>Simpan Konfigurasi</em>. Dengan begitu, notifikasi akan langsung terkirim otomatis ke kotak masuk penerima dengan nama <strong>SI PADI</strong> dan ikon logo netral, persis seperti layanan resmi desa.
                </p>
                <p className="text-[10px] text-sky-700 italic">
                  Catatan: Mengirim manual melalui tombol draft Gmail pribadi akan menampilkan foto profil dan nama akun Google pribadi Anda karena Anda mengirim dari HP sendiri.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    SMTP Host:
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    SMTP Port:
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="587"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Nama Pengirim Email (From Name):
                  </label>
                  <input
                    type="text"
                    value={smtpFromName}
                    onChange={(e) => setSmtpFromName(e.target.value)}
                    placeholder="SI PADI"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Nama yang tampil di inbox penerima Gmail (contoh: <strong>SI PADI</strong>).
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Akun Pengirim (SMTP User):
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="email-anda@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Sandi Aplikasi (SMTP App Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPass ? 'text' : 'password'}
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="16 karakter Sandi Aplikasi Google (contoh: abcd efgh ijkl mnop)"
                      className="w-full p-2.5 pr-10 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPass(!showSmtpPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showSmtpPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pengaturan WhatsApp Gateway Otomatis */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-600" />
                    <span>Konfigurasi WhatsApp Gateway Otomatis (Server-to-WhatsApp)</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Agar notifikasi &amp; broadcast terkirim otomatis ke nomor WhatsApp tujuan tanpa membuka WhatsApp Web secara manual.
                  </p>
                </div>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold self-start sm:self-center ${
                    waApiToken.trim()
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {waApiToken.trim() ? `Aktif (${waGatewayProvider.toUpperCase()})` : 'Token Belum Diisi'}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-1.5 mb-3.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <Info size={14} className="text-emerald-700 flex-shrink-0" />
                  <span>Cara Mengaktifkan Pengiriman WhatsApp Otomatis (Gratis / Trial via Fonnte)</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  1. Daftar / login di{' '}
                  <a
                    href="https://fonnte.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline hover:text-emerald-700"
                  >
                    fonnte.com
                  </a>{' '}
                  (tersedia paket gratis/trial), lalu tambahkan device &amp; scan QR WhatsApp desa/admin.
                  <br />
                  2. Salin <strong>API Token Device</strong> dari dashboard Fonnte, tempel di kolom <em>Token API Gateway</em> di bawah, lalu klik <strong>Simpan Konfigurasi</strong>.
                  <br />
                  3. Setiap peringatan dini atau broadcast dari admin akan langsung terkirim otomatis oleh server ke nomor WhatsApp petani/tujuan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Provider Gateway WA:
                  </label>
                  <select
                    value={waGatewayProvider}
                    onChange={(e) => {
                      const val = e.target.value as 'fonnte' | 'wablas' | 'webhook'
                      setWaGatewayProvider(val)
                      if (val === 'fonnte' && (!waApiUrl || waApiUrl.includes('wablas'))) {
                        setWaApiUrl('https://api.fonnte.com/send')
                      } else if (val === 'wablas' && (!waApiUrl || waApiUrl.includes('fonnte'))) {
                        setWaApiUrl('https://solo.wablas.com/api/send-message')
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                  >
                    <option value="fonnte">Fonnte (Direkomendasikan)</option>
                    <option value="wablas">Wablas</option>
                    <option value="webhook">Custom Webhook URL (JSON)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Token API Gateway / Device Key:
                  </label>
                  <div className="relative">
                    <input
                      type={showWaToken ? 'text' : 'password'}
                      value={waApiToken}
                      onChange={(e) => setWaApiToken(e.target.value)}
                      placeholder="Masukkan Token API dari Fonnte / Wablas (contoh: aBcDeFg123456...)"
                      className="w-full p-2.5 pr-10 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWaToken(!showWaToken)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showWaToken ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Endpoint API URL Gateway:
                  </label>
                  <input
                    type="text"
                    value={waApiUrl}
                    onChange={(e) => setWaApiUrl(e.target.value)}
                    placeholder="https://api.fonnte.com/send"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Pemicu Notifikasi Otomatis */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                Pemicu Notifikasi Otomatis yang Diaktifkan:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={notifyOnFertilizationAlert}
                    onChange={(e) => setNotifyOnFertilizationAlert(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>💧 Notifikasi Jadwal Pemupukan (HST 10, 25, 45)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={notifyOnHarvestAlert}
                    onChange={(e) => setNotifyOnHarvestAlert(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌾 Notifikasi Estimasi Panen (H-14 & Hari H)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={notifyOnPestWeatherAlert}
                    onChange={(e) => setNotifyOnPestWeatherAlert(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🛡️ Notifikasi Peringatan Hama Wereng & Cuaca</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={notifyOnNewSeason}
                    onChange={(e) => setNotifyOnNewSeason(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌱 Notifikasi Pendaftaran Musim Tanam Baru</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-gray-100 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={notifyOnNewHarvest}
                    onChange={(e) => setNotifyOnNewHarvest(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🌾 Notifikasi Pencatatan Hasil Panen Baru</span>
                </label>
              </div>
            </div>

            {/* Uji Coba Pengiriman WhatsApp Otomatis */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Uji Coba Pengiriman WhatsApp Otomatis</h4>
                  <p className="text-[11px] text-gray-500">
                    Kirimkan pesan WhatsApp uji coba otomatis melalui server ke <strong>{defaultWhatsAppNumber}</strong> menggunakan konfigurasi Gateway di atas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestWa}
                  disabled={testingWa}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {testingWa ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Mengirim WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={13} />
                      <span>Kirim WA Uji Coba</span>
                    </>
                  )}
                </button>
              </div>

              {waTestResult && (
                <div
                  className={`mt-3 p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    waTestResult.success
                      ? waTestResult.sentAutomatically
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {waTestResult.success ? (
                      waTestResult.sentAutomatically ? (
                        <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
                      )
                    ) : (
                      <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
                    )}
                    <span className="leading-relaxed">{waTestResult.message || waTestResult.error}</span>
                  </div>
                  {!waTestResult.sentAutomatically && waTestResult.waUrl && (
                    <a
                      href={waTestResult.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline flex-shrink-0 text-[11px]"
                    >
                      <span>Fallback WA Web</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Uji Coba Pengiriman Email */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Uji Coba Pengiriman Email Notifikasi</h4>
                  <p className="text-[11px] text-gray-500">
                    Kirimkan email uji coba langsung ke <strong>{notificationTargetEmail}</strong> untuk memastikan template HTML dan router berjalan lancar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {testingEmail ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Mengirim Email...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={13} />
                      <span>Kirim Email Uji Coba</span>
                    </>
                  )}
                </button>
              </div>

              {emailTestResult && (
                <div
                  className={`mt-3 p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    emailTestResult.success
                      ? emailTestResult.isSimulated
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {emailTestResult.success ? (
                      emailTestResult.isSimulated ? (
                        <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
                      )
                    ) : (
                      <AlertCircle size={15} className="text-rose-600 flex-shrink-0" />
                    )}
                    <span className="leading-relaxed">{emailTestResult.message || emailTestResult.error}</span>
                  </div>
                  {emailTestResult.gmailUrl && (
                    <a
                      href={emailTestResult.gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka draft manual di Gmail (Catatan: Pengiriman manual via Gmail akan menampilkan nama akun Google pribadi Anda)"
                      className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-gray-700 underline flex-shrink-0 text-[11px]"
                    >
                      <span>Draft Manual Gmail</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: PROFIL & IDENTITAS DESA                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'desa' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-700" />
                <span>Identitas Wilayah Desa & Koordinator Sistem</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Informasi ini ditampilkan pada judul aplikasi, footer laporan, kop surat notifikasi, dan template email resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Nama Aplikasi / Sistem:
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Nama Desa:
                </label>
                <input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kecamatan:
                </label>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kabupaten / Kota:
                </label>
                <input
                  type="text"
                  value={regencyName}
                  onChange={(e) => setRegencyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Koordinator Administrator Sistem:
                </label>
                <input
                  type="text"
                  value={adminContactName}
                  onChange={(e) => setAdminContactName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Kontak Telepon Pengaduan / Bantuan Teknis:
                </label>
                <input
                  type="text"
                  value={adminContactPhone}
                  onChange={(e) => setAdminContactPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveSettings()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Perubahan Identitas Desa</span>
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
