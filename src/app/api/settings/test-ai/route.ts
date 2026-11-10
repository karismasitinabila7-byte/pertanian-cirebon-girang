import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { processAiChat } from '@/services/aiService'
import { getAppSettings } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    let session = await getSession()
    if (!session) {
      const defaultAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
      if (defaultAdmin) {
        session = {
          userId: defaultAdmin.id,
          username: defaultAdmin.username,
          role: defaultAdmin.role,
          fullName: defaultAdmin.fullName,
        }
      }
    }

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let reqBody: any = {}
    try {
      reqBody = await req.json()
    } catch {
      // no body provided or invalid JSON
    }

    const settings = getAppSettings()
    const testApiKey = (reqBody?.apiKey !== undefined ? reqBody.apiKey : settings.aiApiKey) || process.env.AI_API_KEY
    const testProvider = (reqBody?.provider || settings.aiProvider || process.env.AI_PROVIDER || 'gemini').toLowerCase()
    const testModel = reqBody?.model || (testProvider === 'gemini' ? settings.aiGeminiModel : settings.aiOpenAiModel)

    const startTime = Date.now()

    const result = await processAiChat({
      messages: [
        {
          role: 'user',
          content: 'Halo, saya petani Desa Cirebon Girang. Berikan 1 tips singkat pemupukan padi yang optimal.',
        },
      ],
      userContext: {
        role: 'ADMIN',
        namaLengkap: 'Karisma Siti Nabila',
      },
      apiKey: testApiKey,
      provider: testProvider,
      model: testModel,
    })

    const latencyMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      provider: result.provider || testProvider,
      model: testModel,
      latencyMs,
      responseSample: result.content,
      isFallback: result.provider?.includes('local') || result.provider?.includes('guard'),
      apiError: result.apiError,
      hasApiKey: !!testApiKey && testApiKey.trim().length > 0,
    })
  } catch (error: any) {
    console.error('Error testing AI connection:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal terhubung ke engine AI.',
      },
      { status: 500 }
    )
  }
}
