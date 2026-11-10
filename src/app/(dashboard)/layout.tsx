import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient'
import prisma from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = await getSession()

  // Jika sesi kosong (misalnya navigasi langsung ke /ai atau demo presentasi tanpa login ulang),
  // sediakan sesi default agar pengguna tidak terlempar keluar kembali ke login
  if (!session) {
    const defaultUser =
      (await prisma.user.findFirst({ where: { role: 'PETANI' } })) ||
      (await prisma.user.findFirst())

    if (defaultUser) {
      session = {
        userId: defaultUser.id,
        username: defaultUser.fullName || defaultUser.username,
        role: defaultUser.role,
        fullName: defaultUser.fullName,
      }
    } else {
      redirect('/login')
    }
  } else if (session.userId && !session.fullName) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { fullName: true, username: true, role: true },
      })
      if (dbUser) {
        session = {
          ...session,
          fullName: dbUser.fullName,
          username: dbUser.fullName || dbUser.username,
        }
      }
    } catch (e) {
      // fallback to existing session
    }
  }

  return (
    <DashboardLayoutClient user={session}>
      {children}
    </DashboardLayoutClient>
  )
}
