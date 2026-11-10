'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Map, 
  Sprout, 
  Tractor, 
  FileText, 
  Bot,
  Wheat,
  X,
  Menu,
  UserCheck,
  User,
  Compass,
  BookOpen,
  Settings
} from 'lucide-react'

type Role = 'ADMIN' | 'PERANGKAT_DESA' | 'PETANI'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: Role[]
}

const navItems: NavItem[] = [
  // Admin & Perangkat Desa
  { label: 'Dashboard Admin', href: '/admin', icon: Home, roles: ['ADMIN'] },
  { label: 'Dashboard Desa', href: '/desa', icon: Home, roles: ['PERANGKAT_DESA'] },
  
  // Petani
  { label: 'Beranda Petani', href: '/petani', icon: Home, roles: ['PETANI'] },

  // Peta Interaktif GIS (Fitur Unggulan)
  { label: 'Peta Lahan GIS', href: '/peta', icon: Compass, roles: ['ADMIN', 'PERANGKAT_DESA', 'PETANI'] },

  // General Shared Data
  { label: 'Kelompok Tani', href: '/admin/kelompok-tani', icon: Users, roles: ['ADMIN'] },
  { label: 'Kelompok Tani', href: '/desa/kelompok-tani', icon: Users, roles: ['PERANGKAT_DESA'] },
  { label: 'Kelompok Saya', href: '/petani/kelompok-tani', icon: Users, roles: ['PETANI'] },

  // Data Petani
  { label: 'Data Petani', href: '/admin/petani', icon: Users, roles: ['ADMIN'] },
  { label: 'Data Petani', href: '/desa/petani', icon: Users, roles: ['PERANGKAT_DESA'] },
  
  // Data Master Database Pengguna (Admin only)
  { label: 'Data Master User', href: '/admin/users', icon: UserCheck, roles: ['ADMIN'] },

  // Lahan Pertanian
  { label: 'Lahan Pertanian', href: '/admin/lahan', icon: Map, roles: ['ADMIN'] },
  { label: 'Lahan Pertanian', href: '/desa/lahan', icon: Map, roles: ['PERANGKAT_DESA'] },
  { label: 'Lahan Saya', href: '/petani/lahan', icon: Map, roles: ['PETANI'] },
  
  // Musim Tanam
  { label: 'Musim Tanam', href: '/admin/musim-tanam', icon: Sprout, roles: ['ADMIN'] },
  { label: 'Musim Tanam', href: '/desa/musim-tanam', icon: Sprout, roles: ['PERANGKAT_DESA'] },
  { label: 'Musim Tanam Saya', href: '/petani/musim-tanam', icon: Sprout, roles: ['PETANI'] },

  // Aktivitas Budidaya
  { label: 'Aktivitas Budidaya', href: '/admin/aktivitas', icon: Tractor, roles: ['ADMIN'] },
  { label: 'Aktivitas Budidaya', href: '/desa/aktivitas', icon: Tractor, roles: ['PERANGKAT_DESA'] },
  { label: 'Aktivitas Budidaya', href: '/petani/aktivitas', icon: Tractor, roles: ['PETANI'] },

  // Data Panen
  { label: 'Data Panen', href: '/admin/panen', icon: Wheat, roles: ['ADMIN'] },
  { label: 'Rekap Panen', href: '/desa/panen', icon: Wheat, roles: ['PERANGKAT_DESA'] },
  { label: 'Hasil Panen Saya', href: '/petani/panen', icon: Wheat, roles: ['PETANI'] },
  
  // Pusat Edukasi & Panduan Tani
  { label: 'Edukasi & Panduan', href: '/edukasi', icon: BookOpen, roles: ['ADMIN', 'PERANGKAT_DESA', 'PETANI'] },

  // Profil Pengguna (Masing-masing role)
  { label: 'Profil Saya', href: '/admin/profil', icon: User, roles: ['ADMIN'] },
  { label: 'Profil Saya', href: '/desa/profil', icon: User, roles: ['PERANGKAT_DESA'] },
  { label: 'Profil Saya', href: '/petani/profil', icon: User, roles: ['PETANI'] },

  // Pengaturan & Konfigurasi Sistem (Admin only)
  { label: 'Konfigurasi Sistem', href: '/admin/konfigurasi', icon: Settings, roles: ['ADMIN'] },
]

export function Sidebar({
  role,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: {
  role?: Role
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  // Clear navigating state when pathname changes or after timeout
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  useEffect(() => {
    if (!navigatingTo) return
    const timer = setTimeout(() => setNavigatingTo(null), 1200)
    return () => clearTimeout(timer)
  }, [navigatingTo])

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => 
    role ? item.roles.includes(role) : false
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-50 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 bg-green-800 text-white transform transition-all duration-300 ease-in-out md:static md:inset-0 ${
          isCollapsed ? 'w-64 md:w-20' : 'w-64 md:w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header Sidebar: SI PADI + Garis 3 Hamburger */}
        <div
          className={`flex items-center h-16 bg-green-900 border-b border-green-700 transition-all duration-300 ${
            isCollapsed ? 'justify-between px-3 md:justify-center md:px-2 md:gap-1.5' : 'justify-between px-4'
          }`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Sprout className="h-6 w-6 text-green-300 flex-shrink-0" />
            <span
              className={`text-lg font-bold tracking-wider truncate transition-all duration-200 ${
                isCollapsed ? 'md:hidden inline-block' : 'inline-block'
              }`}
            >
              SI PADI
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Tombol Garis 3 di samping tulisan SI PADI (Desktop & Tablet Toggle) */}
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-green-200 hover:text-white hover:bg-green-800 transition flex items-center justify-center focus:outline-hidden"
              title={isCollapsed ? 'Tampilkan Menu (Garis 3)' : 'Sembunyikan Menu (Garis 3)'}
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile close button (X) */}
            <button
              onClick={onClose}
              className="md:hidden text-green-200 hover:text-white p-1 rounded-lg ml-1"
              title="Tutup Menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Daftar Menu Navigasi: Dari Dashboard sampai dengan Profil Saya */}
        <div
          className={`py-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] overflow-x-hidden ${
            isCollapsed ? 'px-3 md:px-2' : 'px-3'
          }`}
        >
          {filteredNavItems.map((item) => {
            const isDashboardRoot =
              item.href === '/admin' || item.href === '/desa' || item.href === '/petani'
            const isActive = isDashboardRoot
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const isNavigating = navigatingTo === item.href && !isActive
            const Icon = item.icon
            
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center rounded-xl transition-all duration-150 ${
                    isCollapsed
                      ? 'px-3 py-3 md:justify-center md:px-0'
                      : 'px-3 py-3'
                  } ${
                    isActive
                      ? 'bg-green-700 text-white shadow-xs font-semibold'
                      : isNavigating
                      ? 'bg-green-700/60 text-white shadow-xs font-medium animate-pulse'
                      : 'text-green-100 hover:bg-green-700/80 hover:text-white'
                  }`}
                  onClick={() => {
                    if (pathname !== item.href) {
                      setNavigatingTo(item.href)
                    }
                    if (window.innerWidth < 768) {
                      onClose()
                    }
                  }}
                  title={item.label}
                >
                  <Icon
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                      isCollapsed ? 'md:mr-0 mr-3' : 'mr-3'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      isCollapsed ? 'md:hidden inline-block' : 'inline-block'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Floating Tooltip saat sidebar mengecil (desktop mode) */}
                {isCollapsed && (
                  <div className="hidden md:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-gray-900/95 text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 border border-gray-700/60 backdrop-blur-xs items-center">
                    <span>{item.label}</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-px border-4 border-transparent border-r-gray-900/95" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
