'use client'
 
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import NavigationProgressBar from '@/components/ui/NavigationProgressBar'

const FloatingAiChat = dynamic(
  () => import('@/components/features/AiChat/FloatingAiChat'),
  { ssr: false }
)

export default function DashboardLayoutClient({
  user,
  children,
}: {
  user: any
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sipadi_sidebar_collapsed')
      if (saved !== null) {
        setIsCollapsed(saved === 'true')
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('sipadi_sidebar_collapsed', String(next))
      } catch (e) {}
      return next
    })
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Top Route Progress Bar for Instant Feedback */}
      <NavigationProgressBar />

      {/* Sidebar */}
      <Sidebar
        role={user?.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300">
        <Header user={user} onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Floating AI Chatbot Widget (Sesuai Referensi Gambar) */}
      <FloatingAiChat user={user} />
    </div>
  )
}

