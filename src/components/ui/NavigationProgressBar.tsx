'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Start progress bar
  const startProgress = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    setVisible(true)
    setProgress(20)

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + 15
        if (prev < 85) return prev + 5
        if (prev < 95) return prev + 1
        return prev
      })
    }, 150)
  }

  // Complete progress bar
  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(100)

    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 250)
  }

  // On pathname or searchParams change, complete progress
  useEffect(() => {
    completeProgress()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [pathname, searchParams])

  // Listen to clicks on any internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      const targetAttr = target.getAttribute('target')

      // Ignore external links, downloads, hash links, or modified clicks
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }

      // If clicking the current path, don't trigger
      const currentFull = window.location.pathname + window.location.search
      if (href === currentFull || href === window.location.pathname) {
        return
      }

      startProgress()
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  )
}
