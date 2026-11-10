'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  ChevronDown,
  Sprout,
  Lightbulb,
  TriangleAlert,
  ShieldAlert,
  Droplets,
  CalendarDays,
  Tractor,
  History,
  MessageSquare,
  Trash2,
  Plus,
  X,
  Clock,
  Sparkles
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  isError?: boolean
}

export interface ChatSessionHistory {
  id: string
  topik: string
  createdAt: string
  updatedAt: string
  _count?: { messages: number }
  lastMessageSnippet?: string
}

export const ADMIN_EXAMPLE_QUESTIONS = [
  'Apa saja layanan yang tersedia?',
  'Berapa petani yang bergabung dalam sistem saat ini?',
  'Berapa total petak sawah aktif dan luas baku lahan?',
  'Berapa jumlah pengguna terdaftar berdasarkan role?',
  'Tampilkan rekapitulasi kelompok tani dan anggotanya',
  'Bagaimana status musim tanam yang sedang berjalan?',
  'Berapa total produksi panen gabah yang tercatat?',
  'Buatkan Laporan Rekapitulasi Pertanian Padi Desa Cirebon Girang',
]

export const DESA_EXAMPLE_QUESTIONS = [
  'Apa saja layanan yang tersedia?',
  'Berapa petani yang bergabung dalam sistem saat ini?',
  'Berapa total petak sawah aktif dan luas baku lahan?',
  'Tampilkan rekapitulasi 3 kelompok tani dan anggotanya',
  'Bagaimana status musim tanam berjalan se-Desa Cirebon Girang?',
  'Berapa total produksi panen gabah di Desa Cirebon Girang?',
  'Tampilkan log aktivitas budidaya sawah terbaru',
]

export const PETANI_EXAMPLE_QUESTIONS = [
  'Apa saja layanan yang tersedia?',
  'Bagaimana penanganan hama wereng batang coklat (WBC)?',
  'Bagaimana cara membasmi tikus sawah dan sundep/beluk?',
  'Berapa dosis pupuk Urea & NPK Phonska per HST di sawah?',
  'Padi saya daunnya menguning dan akarnya hitam asam-asaman, bagaimana solusinya?',
  'Apa syarat surat domisili?',
  'Bagaimana cara mengajukan surat?',
  'Kapan jadwal tanam Musim Rendeng (MT1) dan estimasi panennya?',
]

// ─── Markdown-like renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string) {
  // Convert Markdown Tables to HTML Table before replacing newlines
  text = text.replace(/(?:^\|.+?\|\s*$\n?)+/gm, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) return tableMatch

    const headerCols = lines[0].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    const isSeparator = /^\|[\s\-:|]+\|$/.test(lines[1])
    const bodyStartIndex = isSeparator ? 2 : 1

    let tableHtml = '<div style="overflow-x:auto;margin:0.75rem 0;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;border:1px solid #cbd5e1;background:#ffffff;border-radius:8px;overflow:hidden;">'
    tableHtml += '<thead style="background:#f0fdf4;border-bottom:2px solid #86efac;"><tr>'
    headerCols.forEach(col => {
      tableHtml += `<th style="padding:6px 10px;text-align:left;font-weight:600;color:#166534;border:1px solid #cbd5e1;">${col}</th>`
    })
    tableHtml += '</tr></thead><tbody>'

    for (let i = bodyStartIndex; i < lines.length; i++) {
      const rowCols = lines[i].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      const bg = (i % 2 === 0) ? '#f8fafc' : '#ffffff'
      tableHtml += `<tr style="background:${bg};border-bottom:1px solid #f1f5f9;">`
      rowCols.forEach(col => {
        tableHtml += `<td style="padding:6px 10px;color:#334155;border:1px solid #cbd5e1;">${col}</td>`
      })
      tableHtml += '</tr>'
    }

    tableHtml += '</tbody></table></div>'
    return tableHtml
  })

  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic: *text*
  text = text.replace(/\*([^*]+?)\*/g, '<em>$1</em>')
  // Headers: ####, ###, ##, #
  text = text.replace(/^[ \t]*####+[ \t]*(.+)$/gm, '<h4 class="ai-h4" style="font-size:0.95rem;font-weight:700;margin:0.5rem 0 0.2rem;color:#166534;">$1</h4>')
  text = text.replace(/^[ \t]*###[ \t]*(.+)$/gm, '<h3 class="ai-h3" style="font-size:1.05rem;font-weight:700;margin:0.6rem 0 0.25rem;color:#0e3d29;">$1</h3>')
  text = text.replace(/^[ \t]*##[ \t]*(.+)$/gm, '<h2 class="ai-h2" style="font-size:1.15rem;font-weight:700;margin:0.8rem 0 0.25rem;color:#0a291b;">$1</h2>')
  text = text.replace(/^[ \t]*#[ \t]*(.+)$/gm, '<h1 class="ai-h1" style="font-size:1.25rem;font-weight:800;margin:0.85rem 0 0.35rem;color:#14532d;border-bottom:2px solid #bbf7d0;padding-bottom:4px;">$1</h1>')

  // Hilangkan sisa tanda #### atau ### agar tidak pernah muncul secara mentah di balon chat
  text = text.replace(/#{3,6}\s*/g, '')
  // Horizontal rule
  text = text.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #cbd5e1;margin:0.75rem 0;" />')
  // Numbered list items
  text = text.replace(/^(\d+)\. (.+)$/gm, '<li class="ai-li-num" style="margin-bottom:0.25rem;"><span class="ai-num" style="font-weight:600;color:#166534;">$1.</span> $2</li>')
  // Bullet list items
  text = text.replace(/^[-•] (.+)$/gm, '<li class="ai-li-dot" style="margin-bottom:0.25rem;padding-left:0.25rem;">$1</li>')
  // Blockquote: > text
  text = text.replace(/^> (.+)$/gm, '<blockquote class="ai-quote" style="border-left:3px solid #10b981;padding-left:0.75rem;margin:0.5rem 0;color:#475569;font-style:italic;">$1</blockquote>')
  // Code / formulas: `code`
  text = text.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.875em;color:#0f766e;">$1</code>')
  // Line breaks
  text = text.replace(/\n/g, '<br />')

  return text
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'

  if (isUser) {
    return (
      <div className="ai-msg ai-msg-user">
        <div className="ai-bubble ai-bubble-user">
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        </div>
        <div className="ai-avatar ai-avatar-user" title="Pengguna / Petani">
          <User size={16} />
        </div>
      </div>
    )
  }

  const isReport = msg.content.includes('LAPORAN') || msg.content.includes('521.1/LAP-TANI')

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    const printWin = window.open('', '_blank')
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Laporan Resmi Pertanian Desa Cirebon Girang</title>
            <style>
              body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #111; line-height: 1.6; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
              th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; }
              th { background: #f0f0f0; font-weight: bold; }
              h1 { font-size: 18px; text-align: center; margin-bottom: 4px; text-transform: uppercase; }
              h2, h3 { font-size: 15px; text-align: center; margin-top: 0; }
              hr { border: none; border-top: 2px solid #000; margin: 16px 0; }
              @media print {
                body { padding: 15mm; }
              }
            </style>
          </head>
          <body>
            <div>${renderMarkdown(msg.content)}</div>
            <script>window.print();</script>
          </body>
        </html>
      `)
      printWin.document.close()
    }
  }

  return (
    <div className="ai-msg ai-msg-assistant">
      <div className="ai-avatar ai-avatar-bot" title="AI Assistant Cirebon Girang">
        <Bot size={16} />
      </div>
      {msg.isError ? (
        <div className="ai-bubble ai-bubble-error">
          <div className="ai-error-header">
            <TriangleAlert size={15} />
            <span>Terjadi Kesalahan</span>
          </div>
          <p>{msg.content}</p>
        </div>
      ) : (
        <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
          <div
            className="ai-bubble ai-bubble-bot"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
          {isReport && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginLeft: '4px' }}>
              <button
                onClick={handleCopy}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {copied ? '✓ Berhasil Disalin' : '📋 Salin Teks Laporan'}
              </button>
              <button
                onClick={handlePrint}
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#065f46',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🖨️ Cetak / Unduh Dokumen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="ai-msg ai-msg-assistant">
      <div className="ai-avatar ai-avatar-bot">
        <Bot size={16} />
      </div>
      <div className="ai-bubble ai-bubble-bot ai-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export interface InitialStats {
  totalPetani?: number
  totalLahan?: number
  lahanAktif?: number
  totalPoktan?: number
  totalPanenTon?: number
  totalUsers?: number
  musimBerjalan?: number
}

interface AiChatClientProps {
  role?: string
  userName?: string
  initialSessionId?: string
  initialMessages?: ChatMessage[]
  externalPrompt?: string
  initialStats?: InitialStats
}

export default function AiChatClient({
  role,
  userName,
  initialSessionId,
  initialMessages = [],
  initialStats,
}: AiChatClientProps) {
  const isAdmin = role === 'ADMIN'
  const isDesa = role === 'PERANGKAT_DESA'
  const exampleQuestions = isAdmin
    ? ADMIN_EXAMPLE_QUESTIONS
    : isDesa
    ? DESA_EXAMPLE_QUESTIONS
    : PETANI_EXAMPLE_QUESTIONS
  const [stats, setStats] = useState<InitialStats>(
    initialStats || {
      totalPetani: 4,
      totalLahan: 8,
      lahanAktif: 8,
      totalPoktan: 3,
      totalPanenTon: 20.0,
      totalUsers: 6,
      musimBerjalan: 6,
    }
  )
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId)
  const [error, setError] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(true)

  // Chat History Sidebar State
  const [showHistory, setShowHistory] = useState(false)
  const [sessions, setSessions] = useState<ChatSessionHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Fetch session history from API & localStorage sync
  const fetchSessionHistory = useCallback(async () => {
    try {
      setHistoryLoading(true)
      const res = await fetch('/api/ai/chat')
      const json = await res.json()

      if (res.ok && Array.isArray(json.data)) {
        const mappedSessions: ChatSessionHistory[] = json.data.map((s: any) => ({
          id: s.id,
          topik: s.topik || 'Konsultasi Pertanian Padi',
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          _count: s._count,
          lastMessageSnippet: s.messages?.[0]?.content ? s.messages[0].content.slice(0, 70) : undefined
        }))
        setSessions(mappedSessions)
        try {
          localStorage.setItem('si_padi_ai_sessions', JSON.stringify(mappedSessions))
        } catch {}
      } else {
        // Fallback from localStorage
        const cached = localStorage.getItem('si_padi_ai_sessions')
        if (cached) setSessions(JSON.parse(cached))
      }
    } catch (err) {
      console.warn('Gagal memuat riwayat sesi chat:', err)
      const cached = localStorage.getItem('si_padi_ai_sessions')
      if (cached) setSessions(JSON.parse(cached))
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessionHistory()
  }, [fetchSessionHistory])

  // Load specific session messages
  const loadSession = async (targetSessionId: string) => {
    try {
      setIsLoading(true)
      setShowHistory(false)
      setError(null)
      setShowExamples(false)

      const res = await fetch(`/api/ai/chat?sessionId=${targetSessionId}`)
      const json = await res.json()

      if (res.ok && json.data) {
        setSessionId(targetSessionId)
        const loadedMsgs: ChatMessage[] = (json.data.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          createdAt: m.createdAt,
        }))
        setMessages(loadedMsgs)
      } else {
        throw new Error(json.error || 'Gagal memuat sesi percakapan')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // Delete session
  const deleteSession = async (e: React.MouseEvent, targetSessionId: string) => {
    e.stopPropagation()
    if (!confirm('Hapus riwayat tanya-jawab sesi ini?')) return

    try {
      await fetch(`/api/ai/chat?sessionId=${targetSessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== targetSessionId))

      if (sessionId === targetSessionId) {
        handleNewChat()
      }
    } catch (err) {
      console.error('Gagal menghapus sesi:', err)
    }
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text ?? input).trim()
      if (!messageText || isLoading) return

      setInput('')
      setError(null)
      setShowExamples(false)

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: messageText,
        createdAt: new Date().toISOString(),
      }

      setMessages(prev => [...prev, userMsg])
      setIsLoading(true)

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, sessionId, role, userName }),
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || `Error ${res.status}`)
        }

        const { data } = json
        if (data.sessionId) {
          setSessionId(data.sessionId)
          // Refresh session list to include this question snippet
          fetchSessionHistory()
        }

        const botMsg: ChatMessage = {
          id: data.message?.id || `b-${Date.now()}`,
          role: 'assistant',
          content: data.message?.content || 'Maaf, tidak ada jawaban dari sistem.',
          createdAt: data.message?.createdAt || new Date().toISOString(),
        }
        setMessages(prev => [...prev, botMsg])
      } catch (err: any) {
        const errMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: err.message || 'Gagal menghubungi layanan AI. Silakan coba lagi.',
          createdAt: new Date().toISOString(),
          isError: true,
        }
        setMessages(prev => [...prev, errMsg])
        setError(err.message)
      } finally {
        setIsLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    },
    [input, isLoading, sessionId, fetchSessionHistory]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSessionId(undefined)
    setError(null)
    setShowExamples(true)
    setInput('')
    setShowHistory(false)
    inputRef.current?.focus()
  }

  return (
    <div className="ai-chat-wrapper" style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* ── Header ── */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          <div className="ai-header-icon" style={{ background: isAdmin ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : undefined }}>
            <Bot size={20} />
          </div>
          <div>
            <h2 className="ai-header-title">
              {isAdmin ? 'Asisten Pintar Administrator Pertanian' : 'Konsultasi AI Pertanian Cirebon Girang'}
            </h2>
            <p className="ai-header-sub">
              {isAdmin
                ? 'Terintegrasi Langsung dengan Seluruh Database Desa Cirebon Girang'
                : 'Layanan Asisten Cerdas Budidaya Padi Desa Cirebon Girang'}
            </p>
          </div>
        </div>
        <div className="ai-chat-header-actions">
          {isAdmin && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#ffffff',
              }}
              title="Koneksi live database aktif dan siap menyajikan data real-time"
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
              <span>Database Terhubung (Live)</span>
            </div>
          )}

          {/* Button Toggle Riwayat Percakapan (Requirement 3.1) */}
          <button
            className="ai-new-chat-btn"
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: showHistory ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
            }}
            title="Buka daftar riwayat percakapan sebelumnya"
          >
            <History size={14} />
            <span>Riwayat ({sessions.length})</span>
          </button>

          <button className="ai-new-chat-btn" onClick={handleNewChat} title="Mulai sesi tanya jawab baru">
            <RefreshCw size={14} />
            <span>Sesi Baru</span>
          </button>
        </div>
      </div>

      {/* ── Chat Container with Optional History Drawer ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Drawer / Sidebar Riwayat Percakapan (Requirement 3.1) */}
        {showHistory && (
          <div
            style={{
              width: '280px',
              maxWidth: '85vw',
              background: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 20,
              boxShadow: '4px 0 12px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={16} className="text-emerald-700" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  Riwayat Percakapan AI
                </span>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
              <button
                onClick={handleNewChat}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '8px',
                  color: '#065f46',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={14} />
                <span>+ Mulai Percakapan Baru</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
              {historyLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                  Memuat riwayat...
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                  <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>Belum ada riwayat percakapan.</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.7rem' }}>Kirim pertanyaan untuk memulai sesi.</p>
                </div>
              ) : (
                sessions.map(s => {
                  const isActive = sessionId === s.id
                  const dateStr = new Date(s.updatedAt || s.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div
                      key={s.id}
                      onClick={() => loadSession(s.id)}
                      style={{
                        padding: '9px 10px',
                        marginBottom: '4px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isActive ? '#dcfce7' : '#ffffff',
                        border: isActive ? '1px solid #86efac' : '1px solid #f1f5f9',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.background = '#f1f5f9'
                      }}
                      onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.background = '#ffffff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: isActive ? '#14532d' : '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {s.lastMessageSnippet || s.topik}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Clock size={11} style={{ color: '#94a3b8' }} />
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{dateStr}</span>
                          </div>
                        </div>
                        <button
                          onClick={e => deleteSession(e, s.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            padding: '2px',
                            borderRadius: '4px',
                          }}
                          title="Hapus sesi ini"
                          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── Messages Area ── */}
        <div className="ai-messages-area" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem', color: '#64748b' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid #a7f3d0', boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.15)' }}>
                <Bot size={32} />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Sparkles size={13} className="text-emerald-600" />
                <span>{isAdmin ? 'Asisten Pintar Administrator Pertanian' : 'AI Assistant Pertanian Padi'}</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                {isAdmin ? 'Pusat Supervisi & Analisis Data Pertanian SI PADI' : 'Konsultasi Budidaya Padi Desa Cirebon Girang'}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '540px', lineHeight: 1.5, margin: '0 auto 1.25rem' }}>
                {isAdmin
                  ? 'Terintegrasi langsung dengan database desa Cirebon Girang: data petani, inventarisasi sawah, kelembagaan kelompok tani, musim tanam, produksi panen, hingga penerbitan laporan resmi desa.'
                  : 'Konsultasikan kendala sawah Anda, gejala hama wereng/sundep, dosis pupuk Urea & NPK, atau perkiraan panen.'}
              </p>

              {isAdmin && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', maxWidth: '640px', marginBottom: '1.25rem' }}>
                  <button
                    onClick={() => sendMessage('Berapa petani yang bergabung dalam sistem saat ini?')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    title="Klik untuk menanyakan rekapitulasi data petani"
                  >
                    <span>👥</span>
                    <span><strong>{stats.totalPetani ?? 4}</strong> Petani Terdaftar</span>
                  </button>

                  <button
                    onClick={() => sendMessage('Berapa total petak sawah aktif dan luas baku lahan?')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    title="Klik untuk menanyakan rincian petak sawah aktif"
                  >
                    <span>🌾</span>
                    <span><strong>{stats.lahanAktif ?? 8}</strong> Petak Sawah Aktif</span>
                  </button>

                  <button
                    onClick={() => sendMessage('Tampilkan rekapitulasi kelompok tani dan anggotanya')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    title="Klik untuk menanyakan data kelompok tani"
                  >
                    <span>🏢</span>
                    <span><strong>{stats.totalPoktan ?? 3}</strong> Kelompok Tani</span>
                  </button>

                  <button
                    onClick={() => sendMessage('Berapa total produksi panen gabah yang tercatat?')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    title="Klik untuk menanyakan rekapitulasi panen"
                  >
                    <span>⚖️</span>
                    <span><strong>{stats.totalPanenTon ?? 20.0} Ton</strong> Panen Gabah</span>
                  </button>

                  <button
                    onClick={() => sendMessage('Berapa jumlah pengguna terdaftar berdasarkan role?')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#10b981'
                      e.currentTarget.style.background = '#f0fdf4'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.background = '#ffffff'
                    }}
                    title="Klik untuk menanyakan akun pengguna terdaftar"
                  >
                    <span>👤</span>
                    <span><strong>{stats.totalUsers ?? 6}</strong> Akun Pengguna</span>
                  </button>

                  <button
                    onClick={() => sendMessage('Tampilkan ringkasan statistik operasional sistem')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      border: '1px dashed #059669',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#065f46',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#d1fae5'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#ecfdf5'
                    }}
                    title="Klik untuk menampilkan ringkasan eksekutif seluruh sistem"
                  >
                    <span>📊</span>
                    <span>Ringkasan Eksekutif Sistem</span>
                  </button>
                </div>
              )}

              {sessions.length > 0 && (
                <button
                  onClick={() => setShowHistory(true)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <History size={14} className="text-emerald-700" />
                  <span>Lihat Riwayat Percakapan Sebelumnya ({sessions.length})</span>
                </button>
              )}
            </div>
          ) : (
            messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))
          )}

          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Quick Examples ── */}
      {showExamples && !isLoading && (
        <div className="ai-examples" style={{ padding: '0.65rem 1rem', borderTop: '1px solid #f1f5f9', background: '#fcfdfc' }}>
          <div className="ai-examples-header" style={{ marginBottom: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: '#166534' }}>
              <Lightbulb size={14} className="text-emerald-600" />
              <span>
                {isAdmin
                  ? 'Pertanyaan Cepat untuk Administrator (Data Riil & Laporan):'
                  : 'Pertanyaan Cepat untuk Petani (Hama, Pemupukan & Sawah):'}
              </span>
            </div>
            <button
              className="ai-examples-toggle"
              onClick={() => setShowExamples(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
              title="Sembunyikan saran"
            >
              <span>Tutup</span>
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="ai-examples-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {exampleQuestions.map(q => (
              <button
                key={q}
                className="ai-example-chip"
                onClick={() => sendMessage(q)}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: '1px solid #d1fae5',
                  background: '#f0fdf4',
                  color: '#166534',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#dcfce7'
                  e.currentTarget.style.borderColor = '#86efac'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f0fdf4'
                  e.currentTarget.style.borderColor = '#d1fae5'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="ai-input-area">
        <div className="ai-input-box">
          <textarea
            ref={inputRef}
            className="ai-input"
            placeholder={
              isAdmin
                ? 'Tanyakan jumlah petani, petak sawah aktif, kelompok tani, hasil panen, laporan resmi desa...'
                : 'Tanyakan identitas AI, hama wereng/sundep, takaran pupuk, jadwal panen...'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            disabled={isLoading}
          />
          <button
            className="ai-send-btn"
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            title="Kirim pertanyaan (Enter)"
          >
            {isLoading ? <Loader2 size={18} className="ai-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="ai-input-hint">
          {isAdmin
            ? 'Tekan Enter untuk kirim · Akses Penuh Database SI PADI Desa Cirebon Girang · Tanpa Batas Limit'
            : 'Tekan Enter untuk kirim · Khusus ranah pertanian padi Desa Cirebon Girang · Chat tanpa batas limit'}
        </p>
      </div>
    </div>
  )
}
