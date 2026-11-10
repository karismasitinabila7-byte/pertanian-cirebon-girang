import { NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/lib/session'

export async function POST() {
  try {
    const session = await getSession()
    if (!session) {
      // Already logged out or not authenticated — return ok
      return NextResponse.json({ success: true })
    }

    await deleteSession()
    return NextResponse.json({ success: true, message: 'Berhasil logout' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat logout' },
      { status: 500 }
    )
  }
}
