import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

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
  waGatewayProvider: 'fonnte' | 'wablas' | 'webhook'
  waApiToken: string
  waApiUrl: string
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
const SYSTEM_SETTING_KEY = 'app_settings'

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: (process.env.AI_PROVIDER as any) || 'gemini',
  aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  aiGeminiModel: process.env.AI_GEMINI_MODEL || 'gemini-3.0-flash',
  aiOpenAiModel: process.env.AI_OPENAI_MODEL || 'gpt-4o-mini',
  aiPersona: 'ramah_sunda',
  aiEnablePetaniConsultation: true,
  aiEnableFertilizerRecommendation: true,
  aiEnableLocalFallback: true,

  notificationTargetEmail: process.env.NOTIFICATION_TARGET_EMAIL || 'karismasitinabila7@gmail.com',
  defaultWhatsAppNumber: process.env.DEFAULT_WA_NUMBER || '6285797864834',
  waGatewayProvider: (process.env.WA_GATEWAY_PROVIDER as any) || 'fonnte',
  waApiToken: process.env.WA_API_TOKEN || process.env.FONNTE_TOKEN || '',
  waApiUrl: process.env.WA_API_URL || 'https://api.fonnte.com/send',
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

function syncSettingsToProcessEnv(updated: AppSettings) {
  if (updated.aiProvider) process.env.AI_PROVIDER = updated.aiProvider
  if (updated.aiApiKey) process.env.AI_API_KEY = updated.aiApiKey
  if (updated.aiGeminiModel) process.env.AI_GEMINI_MODEL = updated.aiGeminiModel
  if (updated.aiOpenAiModel) process.env.AI_OPENAI_MODEL = updated.aiOpenAiModel
  if (updated.notificationTargetEmail) process.env.NOTIFICATION_TARGET_EMAIL = updated.notificationTargetEmail
  if (updated.defaultWhatsAppNumber) process.env.DEFAULT_WA_NUMBER = updated.defaultWhatsAppNumber
  if (updated.waGatewayProvider) process.env.WA_GATEWAY_PROVIDER = updated.waGatewayProvider
  if (updated.waApiToken) process.env.WA_API_TOKEN = updated.waApiToken
  if (updated.waApiUrl) process.env.WA_API_URL = updated.waApiUrl
  if (updated.smtpHost) process.env.SMTP_HOST = updated.smtpHost
  if (updated.smtpPort) process.env.SMTP_PORT = String(updated.smtpPort)
  if (updated.smtpUser) process.env.SMTP_USER = updated.smtpUser
  if (updated.smtpPass) process.env.SMTP_PASS = updated.smtpPass
  if (updated.smtpFromName) process.env.SMTP_FROM_NAME = updated.smtpFromName
  if (updated.smtpFromEmail) process.env.SMTP_FROM_EMAIL = updated.smtpFromEmail
}

/**
 * Membaca pengaturan aktif aplikasi secara sinkron (fallback file JSON / env).
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
 * Membaca pengaturan aktif aplikasi dari Database (TiDB/MySQL) dengan fallback file JSON / env.
 * Penting untuk environment serverless seperti Vercel agar konfigurasi persisten.
 */
export async function getAppSettingsAsync(): Promise<AppSettings> {
  const fileFallback = getAppSettings()
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: SYSTEM_SETTING_KEY },
    })
    if (record?.value) {
      const parsed = JSON.parse(record.value)
      const merged: AppSettings = { ...fileFallback, ...parsed }
      if (!merged.aiGeminiModel || ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].includes(merged.aiGeminiModel)) {
        merged.aiGeminiModel = 'gemini-3.0-flash'
      }
      // Jika env server memiliki API key sementara DB kosong, gunakan env
      if (!merged.aiApiKey && (process.env.AI_API_KEY || process.env.GEMINI_API_KEY)) {
        merged.aiApiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || ''
      }
      if (!merged.smtpUser && process.env.SMTP_USER) merged.smtpUser = process.env.SMTP_USER
      if (!merged.smtpPass && process.env.SMTP_PASS) merged.smtpPass = process.env.SMTP_PASS
      if (!merged.waApiToken && (process.env.WA_API_TOKEN || process.env.FONNTE_TOKEN)) {
        merged.waApiToken = process.env.WA_API_TOKEN || process.env.FONNTE_TOKEN || ''
      }
      return merged
    }
  } catch (err) {
    console.warn('Reading settings from DB failed, using file/env defaults:', (err as any)?.message)
  }
  return fileFallback
}

/**
 * Menyimpan pembaruan pengaturan aplikasi secara sinkron dan menyinkronkan runtime process.env
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
  } catch (err) {
    console.warn('Could not write app_settings.json (expected on read-only serverless FS):', (err as any)?.message)
  }

  syncSettingsToProcessEnv(updated)
  return updated
}

/**
 * Menyimpan pembaruan pengaturan aplikasi secara permanen ke Database (TiDB/MySQL) + file lokal jika writable.
 */
export async function saveAppSettingsAsync(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getAppSettingsAsync()
  const updated: AppSettings = {
    ...current,
    ...newSettings,
  }

  try {
    await prisma.systemSetting.upsert({
      where: { key: SYSTEM_SETTING_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: SYSTEM_SETTING_KEY, value: JSON.stringify(updated) },
    })
  } catch (err) {
    console.error('Error saving settings to DB:', err)
  }

  try {
    const dir = path.dirname(SETTINGS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8')
  } catch {
    // Abaikan error read-only filesystem di Vercel
  }

  syncSettingsToProcessEnv(updated)
  return updated
}
