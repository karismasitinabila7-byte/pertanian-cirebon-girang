import fs from 'fs'
import path from 'path'

export interface AppSettings {
  // ── 1. PENGATURAN KECERDASAN BUATAN (AI ASSISTANT) ──
  aiProvider: 'gemini' | 'openai'
  aiApiKey: string
  aiGeminiModel: string
  aiOpenAiModel: string
  aiPersona: 'ramah_sunda' | 'agronomi_formal' | 'penyuluh_ringkas'
  aiEnablePetaniConsultation: boolean
  aiEnableFertilizerRecommendation: boolean
  aiEnableLocalFallback: boolean

  // ── 2. PENGATURAN NOTIFIKASI EMAIL & WHATSAPP ──
  notificationTargetEmail: string
  defaultWhatsAppNumber: string
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPass: string
  smtpFromName: string
  smtpFromEmail: string
  notifyOnFertilizationAlert: boolean
  notifyOnHarvestAlert: boolean
  notifyOnPestWeatherAlert: boolean
  notifyOnNewSeason: boolean
  notifyOnNewHarvest: boolean

  // ── 3. IDENTITAS & DESA ──
  appName: string
  villageName: string
  districtName: string
  regencyName: string
  adminContactName: string
  adminContactPhone: string
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'app_settings.json')

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: (process.env.AI_PROVIDER as any) || 'gemini',
  aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  aiGeminiModel: process.env.AI_GEMINI_MODEL || 'gemini-2.0-flash',
  aiOpenAiModel: process.env.AI_OPENAI_MODEL || 'gpt-4o-mini',
  aiPersona: 'ramah_sunda',
  aiEnablePetaniConsultation: true,
  aiEnableFertilizerRecommendation: true,
  aiEnableLocalFallback: true,

  notificationTargetEmail: process.env.NOTIFICATION_TARGET_EMAIL || 'karismasitinabila7@gmail.com',
  defaultWhatsAppNumber: '6285797864834',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFromName: process.env.SMTP_FROM_NAME || 'SI PADI',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || 'Karismasitinabila7@gmail.com',
  notifyOnFertilizationAlert: true,
  notifyOnHarvestAlert: true,
  notifyOnPestWeatherAlert: true,
  notifyOnNewSeason: true,
  notifyOnNewHarvest: true,

  appName: 'Platform Pertanian Padi Desa Cirebon Girang (SI PADI)',
  villageName: 'Desa Cirebon Girang',
  districtName: 'Kecamatan Talun',
  regencyName: 'Kabupaten Cirebon',
  adminContactName: 'Karisma Siti Nabila',
  adminContactPhone: '0812-3456-7890',
}

/**
 * Membaca pengaturan aktif aplikasi. Jika ada file app_settings.json, gunakan file tersebut.
 */
export function getAppSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8')
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (err) {
    console.error('Error reading app_settings.json, falling back to defaults:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

/**
 * Menyimpan pembaruan pengaturan aplikasi dan menyinkronkan runtime process.env
 */
export function saveAppSettings(newSettings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings()
  const updated: AppSettings = {
    ...current,
    ...newSettings,
  }

  try {
    const dir = path.dirname(SETTINGS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8')

    // Sinkronkan ke process.env secara real-time
    if (updated.aiProvider) process.env.AI_PROVIDER = updated.aiProvider
    if (updated.aiApiKey) process.env.AI_API_KEY = updated.aiApiKey
    if (updated.aiGeminiModel) process.env.AI_GEMINI_MODEL = updated.aiGeminiModel
    if (updated.aiOpenAiModel) process.env.AI_OPENAI_MODEL = updated.aiOpenAiModel
    if (updated.notificationTargetEmail) process.env.NOTIFICATION_TARGET_EMAIL = updated.notificationTargetEmail
    if (updated.smtpHost) process.env.SMTP_HOST = updated.smtpHost
    if (updated.smtpPort) process.env.SMTP_PORT = String(updated.smtpPort)
    if (updated.smtpUser) process.env.SMTP_USER = updated.smtpUser
    if (updated.smtpPass) process.env.SMTP_PASS = updated.smtpPass
    if (updated.smtpFromName) process.env.SMTP_FROM_NAME = updated.smtpFromName
    if (updated.smtpFromEmail) process.env.SMTP_FROM_EMAIL = updated.smtpFromEmail
  } catch (err) {
    console.error('Error saving app_settings.json:', err)
  }

  return updated
}
