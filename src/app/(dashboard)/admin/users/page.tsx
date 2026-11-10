'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  Edit2,
  Trash2,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Landmark,
  Sprout,
  RefreshCw,
  Database
} from 'lucide-react'

interface UserItem {
  id: string
  username: string
  email: string | null
  fullName: string
  phone: string | null
  role: 'ADMIN' | 'PERANGKAT_DESA' | 'PETANI'
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  petani?: {
    id: string
    nik: string | null
    alamat: string
    kelompokTani?: { id: string; nama: string } | null
  } | null
}

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    desaCount: 0,
    petaniCount: 0,
    activeCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 })

  // Modal Create
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'PETANI',
    password: '',
    isActive: true,
    alamat: 'Desa Cirebon Girang'
  })

  // Modal Edit / Change Role
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'PETANI',
    password: '',
    isActive: true
  })

  // Kelompok Tani options for creating Petani
  const [kelompokList, setKelompokList] = useState<{ id: string; nama: string }[]>([])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter !== 'ALL') params.set('role', roleFilter)
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('limit', '10')

      const res = await fetch(`/api/users?${params.toString()}`)
      const json = await res.json()

      if (res.ok) {
        setUsers(json.data || [])
        setStats(json.stats || {})
        setPagination(json.pagination || { total: 0, totalPages: 1, limit: 10 })
      } else {
        setError(json.error || 'Gagal memuat daftar pengguna')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetch('/api/kelompok-tani?limit=100')
      .then(res => res.json())
      .then(json => setKelompokList(json.data || []))
      .catch(() => {})
  }, [])

  const handleOpenCreate = () => {
    setCreateForm({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'PETANI',
      password: '',
      isActive: true,
      alamat: 'Desa Cirebon Girang'
    })
    setCreateError('')
    setIsCreateOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal membuat pengguna')

      setIsCreateOpen(false)
      setSuccessMessage(`Akun ${createForm.username} (${createForm.role}) berhasil ditambahkan!`)
      await fetchUsers()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user)
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      password: '',
      isActive: user.isActive
    })
    setEditError('')
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setEditLoading(true)
    setEditError('')

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memperbarui pengguna')

      setIsEditOpen(false)
      setSuccessMessage(`Akun ${editingUser.username} berhasil diperbarui (Hak akses: ${editForm.role})!`)
      await fetchUsers()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      setEditError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal mengubah status akun')

      setSuccessMessage(`Status akun ${user.username} diubah menjadi ${!user.isActive ? 'Aktif' : 'Nonaktif'}`)
      await fetchUsers()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`APAKAH ANDA YAKIN ingin menghapus akun "${user.username}" (${user.fullName})?\n\nSemua data yang terkait dengan pengguna ini akan dihapus secara permanen.`)) {
      return
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal menghapus pengguna')

      setSuccessMessage(`Akun pengguna ${user.username} berhasil dihapus`)
      await fetchUsers()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="h-3 w-3 text-purple-600" />
            Administrator
          </span>
        )
      case 'PERANGKAT_DESA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Landmark className="h-3 w-3 text-blue-600" />
            Perangkat Desa
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sprout className="h-3 w-3 text-emerald-600" />
            Petani
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Database className="h-3 w-3 text-emerald-600" />
              Database Master Terhubung (Live)
            </span>
            <span className="text-xs text-gray-400">• SQLite dev.db</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data Master User & Rekapitulasi Pengguna</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola seluruh master data akun pengguna, hak akses multi-role (Administrator, Perangkat Desa, Petani), dan keanggotaan kelompok tani binaan secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="inline-flex items-center justify-center px-3.5 py-2 border border-gray-300 rounded-lg shadow-2xs text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Muat ulang data database secara real-time"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Tambah Pengguna Baru
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm shadow-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4 border-l-4 border-l-gray-800 shadow-2xs hover:shadow transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Akun</p>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.totalUsers}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{stats.activeCount} Akun Aktif Terverifikasi</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600 shadow-2xs hover:shadow transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Administrator</p>
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-purple-800 mt-1">{stats.adminCount}</p>
          <p className="text-[11px] text-purple-600 mt-0.5">Akses Tata Kelola Penuh</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-600 shadow-2xs hover:shadow transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Perangkat Desa</p>
            <Landmark className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-800 mt-1">{stats.desaCount}</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Pengawasan Wilayah Desa</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 shadow-2xs hover:shadow transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Petani Bergabung</p>
            <Sprout className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 mt-1">{stats.petaniCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Tergabung dalam Poktan</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-teal-600 col-span-2 lg:col-span-1 shadow-2xs hover:shadow transition">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Tingkat Keaktifan</p>
            <CheckCircle className="h-4 w-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold text-teal-800 mt-1">
            {stats.totalUsers > 0 ? `${Math.round((stats.activeCount / stats.totalUsers) * 100)}%` : '100%'}
          </p>
          <p className="text-[11px] text-teal-600 mt-0.5">Kondisi Operasional Prima</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative rounded-md shadow-sm sm:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Cari nama, username, email, telepon..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
            >
              <option value="ALL">Semua Hak Akses (Role)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
              <option value="PERANGKAT_DESA">Perangkat Desa (PERANGKAT_DESA)</option>
              <option value="PETANI">Petani (PETANI)</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
            >
              <option value="ALL">Semua Status Akun</option>
              <option value="ACTIVE">Akun Aktif</option>
              <option value="INACTIVE">Akun Nonaktif</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg text-red-700 bg-red-50 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pengguna
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hak Akses (Role)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kelembagaan / Poktan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kontak (Email / Telp)
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Terakhir Login
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data master database pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">Tidak ada pengguna yang cocok dengan kriteria pencarian.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0 border border-emerald-300">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.fullName || user.username}</div>
                          <div className="text-xs text-gray-500 font-mono">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'PETANI' ? (
                        user.petani?.kelompokTani?.nama ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Users className="h-3 w-3 text-emerald-600" />
                            {user.petani.kelompokTani.nama}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-amber-700 bg-amber-50 border border-amber-200">
                            Petani Mandiri
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400 italic">Pemerintah Desa</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      <div>{user.email || '-'}</div>
                      <div className="text-gray-400 mt-0.5">{user.phone || '-'}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title="Klik untuk mengubah status aktif / nonaktif"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          user.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-red-600" />
                            Nonaktif
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {user.lastLoginAt ? (
                        new Date(user.lastLoginAt).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })
                      ) : (
                        <span className="text-gray-400 italic">Belum pernah</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition"
                          title="Ubah Data & Hak Akses"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Halaman <span className="font-semibold text-gray-900">{page}</span> dari <span className="font-semibold text-gray-900">{pagination.totalPages}</span> (Total {pagination.total} Pengguna)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Berikutnya <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Tambah Pengguna Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsCreateOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-green-800 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-green-300" />
                  Tambah Akun Pengguna Baru
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-green-200 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {createError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. johan_tani"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bapak Johan Arifin"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Hak Akses (Role) *</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 bg-white font-medium"
                    >
                      <option value="PETANI">PETANI (Petani Sawah)</option>
                      <option value="PERANGKAT_DESA">PERANGKAT_DESA (Aparatur Desa)</option>
                      <option value="ADMIN">ADMIN (Super Administrator)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Password Baru *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Email (Opsional)</label>
                    <input
                      type="email"
                      placeholder="user@gmail.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Nomor Telepon / WA</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCreate"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveCreate" className="text-sm font-medium text-gray-700">
                    Aktifkan akun ini segera setelah dibuat
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50 shadow-sm"
                  >
                    {createLoading ? 'Menyimpan...' : 'Buat Akun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Pengguna & Hak Akses (Role Switcher) */}
      {isEditOpen && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsEditOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              <div className="flex justify-between items-center px-6 py-4 bg-blue-900 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-300" />
                  Ubah Hak Akses & Data Pengguna: @{editingUser.username}
                </h3>
                <button onClick={() => setIsEditOpen(false)} className="text-blue-200 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {editError}
                  </div>
                )}

                {/* Role Switcher Section (Promote / Change Role Dynamically) */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-blue-900 uppercase">
                    Hak Akses / Peran Sistem (Role Assignment)
                  </label>
                  <p className="text-xs text-blue-700">
                    Pilih tingkat wewenang akun ini dalam sistem platform SI PADI Cirebon Girang:
                  </p>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="block w-full border border-blue-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white font-bold text-gray-900"
                  >
                    <option value="PETANI">🌾 PETANI — Kelola Petak Sawah & Siklus Musim Tanam Mandiri</option>
                    <option value="PERANGKAT_DESA">🏛️ PERANGKAT_DESA — Monitoring Agregat Desa & Rekapitulasi Panen</option>
                    <option value="ADMIN">🛡️ ADMIN — Otoritas Penuh Sistem & Manajemen Akun</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Nomor Telepon / WA</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Email Akun</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase">Reset Password (Opsional)</label>
                    <input
                      type="password"
                      placeholder="Kosongkan jika tidak diganti"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700">
                    Status Akun Aktif (Dapat Login ke Sistem)
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 shadow-sm"
                  >
                    {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
