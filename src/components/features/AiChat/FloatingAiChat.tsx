'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  X,
  Send,
  RotateCcw,
  Maximize2,
  Minimize2,
  Printer,
  Copy,
  Check,
} from 'lucide-react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  isError?: boolean
}

interface FloatingAiChatProps {
  user?: {
    role?: string
    fullName?: string
    username?: string
    userId?: string
  }
}

// Quick suggestions tailored for Petani and Admin
const PETANI_SUGGESTIONS = [
  'Apa saja layanan yang tersedia?',
  'Bagaimana penanganan hama wereng?',
  'Berapa dosis pupuk Urea & NPK?',
  'Kapan jadwal musim tanam berikutnya?',
  'Bagaimana cara mengajukan surat?',
]

const ADMIN_SUGGESTIONS = [
  'Apa saja layanan yang tersedia?',
  'Berapa petani & petak lahan aktif?',
  'Bagaimana status musim tanam saat ini?',
  'Berapa total produksi panen gabah?',
  'Tampilkan rekap kelompok tani.',
]

const DEFAULT_SUGGESTIONS = [
  'Apa saja layanan yang tersedia?',
  'Apa syarat surat domisili?',
  'Bagaimana cara mengajukan surat?',
  'Cek pengajuan saya.',
]

// Markdown-like HTML formatter for AI responses
function formatMarkdown(text: string): string {
  // Convert Markdown Tables
  let formatted = text.replace(/(?:^\|.+?\|\s*$\n?)+/gm, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return tableMatch

    const headerCols = lines[0]
      .split('|')
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    const isSeparator = /^\|[\s\-:|]+\|$/.test(lines[1])
    const bodyStartIndex = isSeparator ? 2 : 1

    let html =
      '<div class="overflow-x-auto my-2 rounded-lg border border-gray-200"><table class="w-full text-xs text-left border-collapse bg-white">'
    html += '<thead class="bg-blue-50/80 text-blue-900 border-b border-gray-200"><tr>'
    headerCols.forEach((col) => {
      html += `<th class="px-2.5 py-1.5 font-semibold border-r last:border-r-0 border-gray-200">${col}</th>`
    })
    html += '</tr></thead><tbody>'

    for (let i = bodyStartIndex; i < lines.length; i++) {
      const rowCols = lines[i]
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      const bg = i % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'
      html += `<tr class="${bg} border-b last:border-b-0 border-gray-100">`
      rowCols.forEach((col) => {
        html += `<td class="px-2.5 py-1.5 text-gray-700 border-r last:border-r-0 border-gray-100">${col}</td>`
      })
      html += '</tr>'
    }

    html += '</tbody></table></div>'
    return html
  })

  // Bold & Italic
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
  formatted = formatted.replace(/\*([^*]+?)\*/g, '<em class="italic">$1</em>')

  // Headers
  formatted = formatted.replace(/^[ \t]*####+[ \t]*(.+)$/gm, '<h4 class="font-bold text-xs text-blue-800 mt-2 mb-1">$1</h4>')
  formatted = formatted.replace(/^[ \t]*###[ \t]*(.+)$/gm, '<h3 class="font-bold text-sm text-gray-900 mt-2.5 mb-1">$1</h3>')
  formatted = formatted.replace(/^[ \t]*##[ \t]*(.+)$/gm, '<h2 class="font-bold text-sm text-blue-900 mt-3 mb-1.5">$1</h2>')
  formatted = formatted.replace(/^[ \t]*#[ \t]*(.+)$/gm, '<h1 class="font-extrabold text-base text-blue-900 mt-3 mb-2">$1</h1>')

  // Cleanup stray hash markers
  formatted = formatted.replace(/#{3,6}\s*/g, '')

  // Lists
  formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-1.5 my-0.5"><span class="font-semibold text-blue-600 shrink-0">$1.</span><span>$2</span></div>')
  formatted = formatted.replace(/^[-•] (.+)$/gm, '<div class="flex items-start gap-1.5 my-0.5"><span class="text-blue-500 shrink-0 leading-tight">•</span><span>$1</span></div>')

  // Blockquotes
  formatted = formatted.replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-blue-500 pl-2.5 my-1.5 text-xs text-gray-600 italic bg-blue-50/30 py-1 rounded-r">$1</blockquote>')

  // Inline Code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>')

  // Line breaks
  formatted = formatted.replace(/\n/g, '<br />')

  return formatted
}

export default function FloatingAiChat({ user }: FloatingAiChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const role = user?.role || 'PETANI'
  const isAdmin = role === 'ADMIN'
  const isPetani = role === 'PETANI'

  const suggestions = isAdmin
    ? ADMIN_SUGGESTIONS
    : isPetani
    ? PETANI_SUGGESTIONS
    : DEFAULT_SUGGESTIONS

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, isLoading, isMaximized, scrollToBottom])

  // Listen for global custom event 'open-ai-chat'
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
    }
    window.addEventListener('open-ai-chat', handleOpen)
    return () => window.removeEventListener('open-ai-chat', handleOpen)
  }, [])

  // Send message handler
  const handleSend = async (customText?: string) => {
    const messageText = (customText ?? input).trim()
    if (!messageText || isLoading) return

    setInput('')

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          role,
          userName: user?.fullName || user?.username,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || `Error ${res.status}`)
      }

      if (json.data?.sessionId) {
        setSessionId(json.data.sessionId)
      }

      const botMessage: ChatMessage = {
        id: json.data?.message?.id || `b-${Date.now()}`,
        role: 'assistant',
        content: json.data?.message?.content || 'Maaf, tidak ada tanggapan dari asisten AI.',
        createdAt: json.data?.message?.createdAt || new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: err.message || 'Gagal menghubungi asisten AI. Silakan coba lagi.',
        createdAt: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setSessionId(undefined)
    setInput('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePrintReport = (content: string) => {
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
            <div>${formatMarkdown(content)}</div>
            <script>window.print();</script>
          </body>
        </html>
      `)
      printWin.document.close()
    }
  }

  return (
    <>
      {/* ── 1. Floating Action Button (FAB) matching Image 2 ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(37,99,235,0.45)] hover:shadow-[0_12px_36px_rgba(37,99,235,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer group"
          title="Buka AI Assistant"
          aria-label="Buka AI Assistant"
        >
          {/* White outline chat speech bubble icon */}
          <svg
            className="w-7 h-7 text-white transition-transform group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* ── 2. Chatbot Popup Window with Expand / Shrink (Perbesar / Perkecil) ── */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isMaximized
              ? 'bottom-2 right-2 sm:bottom-4 sm:right-4 w-[calc(100vw-16px)] sm:w-[860px] md:w-[940px] lg:w-[1040px] max-w-[calc(100vw-24px)] h-[calc(100vh-20px)] sm:h-[calc(100vh-36px)] max-h-[96vh]'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[390px] h-[550px] sm:h-[570px] max-h-[calc(100vh-80px)]'
          }`}
        >
          {/* Header */}
          <div
            onDoubleClick={() => setIsMaximized((prev) => !prev)}
            className="bg-blue-600 px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-white shrink-0 select-none cursor-pointer"
            title="Klik dua kali pada header untuk Perbesar / Perkecil tampilan"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold leading-tight tracking-wide">
                  AI Assistant
                </h3>
                {isMaximized && (
                  <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 hidden sm:inline-block">
                    Mode Layar Lebar
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 font-normal mt-0.5 leading-snug">
                {isAdmin
                  ? 'Siap membantu pelayanan & data pertanian'
                  : 'Siap membantu konsultasi & layanan pertanian'}
              </p>
            </div>

            <div
              className="flex items-center gap-1 -mr-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol Mulai Sesi Baru */}
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Percakapan Baru"
                  aria-label="Mulai Chat Baru"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Tombol Perbesar / Perkecil (Maximize / Minimize) */}
              <button
                onClick={() => setIsMaximized((prev) => !prev)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title={
                  isMaximized
                    ? 'Perkecil Tampilan (Kembalikan Ukuran Normal)'
                    : 'Perbesar Tampilan (Maksimalkan)'
                }
                aria-label={isMaximized ? 'Perkecil Tampilan' : 'Perbesar Tampilan'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* Tombol Tutup (X) */}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsMaximized(false)
                }}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Tutup Chat"
                aria-label="Tutup Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col bg-white">
            {messages.length === 0 ? (
              /* Initial State matching Image 1 */
              <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
                <p className="text-gray-700 text-sm font-medium text-center mb-6">
                  Halo! Saya asisten AI. Ada yang bisa dibantu?
                </p>

                {/* Question Pills vertically stacked & centered */}
                <div
                  className={`flex flex-col items-center gap-2.5 w-full ${
                    isMaximized ? 'max-w-xl' : ''
                  }`}
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="w-auto max-w-[92%] px-4 py-2 text-xs sm:text-sm text-gray-700 bg-white border border-gray-200/90 rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 shadow-2xs transition-all duration-150 text-center cursor-pointer font-normal"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Chat Conversation */
              <div className="flex flex-col space-y-4">
                {messages.map((msg) => {
                  const isReport =
                    msg.role === 'assistant' &&
                    (msg.content.includes('LAPORAN') ||
                      msg.content.includes('PEMERINTAH KABUPATEN') ||
                      msg.content.includes('KANTOR KEPALA DESA') ||
                      msg.content.includes('521.1/LAP-TANI'))

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <div
                          className={`bg-blue-600 text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-sm shadow-xs break-words ${
                            isMaximized ? 'max-w-[70%]' : 'max-w-[85%]'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      ) : (
                        <div
                          className={`text-sm rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs break-words ${
                            isMaximized ? 'max-w-[95%]' : 'max-w-[92%]'
                          } ${
                            msg.isError
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-gray-50 border border-gray-200/80 text-gray-800'
                          }`}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formatMarkdown(msg.content),
                            }}
                          />

                          {/* Tombol Aksi Tambahan untuk Dokumen Laporan Resmi */}
                          {isReport && (
                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200/70">
                              <button
                                onClick={() => handlePrintReport(msg.content)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
                                title="Buka jendela cetak atau simpan ke format PDF"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Cetak / Unduh PDF</span>
                              </button>

                              <button
                                onClick={() => handleCopyText(msg.id, msg.content)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 transition cursor-pointer"
                                title="Salin teks isi laporan ke clipboard"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                    <span className="text-green-600">
                                      Tersalin!
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Salin Teks Laporan</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="self-start bg-gray-50 border border-gray-200/80 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input Area matching Image 1 */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
            <div className="flex-1 flex items-center bg-white border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-full px-4 py-2 shadow-2xs transition-all">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ketik pertanyaan Anda..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/25 cursor-pointer'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              title="Kirim pesan"
              aria-label="Kirim Pesan"
            >
              <Send className="w-4 h-4 translate-x-px -translate-y-px" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
