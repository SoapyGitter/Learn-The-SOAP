import React, { useState, useRef, useEffect, useCallback } from 'react'
import { CheckCircle2, ChevronDown, BookOpen, ArrowRight, Lightbulb } from 'lucide-react'

// ── Markdown-lite renderer ────────────────────────────────
// Handles **bold**, inline code `x`, and \n line breaks.
// Full markdown would require a dependency — this is enough for our content.

function renderInline(text) {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Inline code: `text`
    const codeMatch = remaining.match(/`([^`]+)`/)

    const boldPos = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity
    const codePos = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity

    if (boldPos === Infinity && codePos === Infinity) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    if (boldPos <= codePos) {
      if (boldPos > 0) parts.push(<span key={key++}>{remaining.slice(0, boldPos)}</span>)
      parts.push(<strong key={key++} className="text-white font-semibold">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldPos + boldMatch[0].length)
    } else {
      if (codePos > 0) parts.push(<span key={key++}>{remaining.slice(0, codePos)}</span>)
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-midnight-800 text-neon font-mono text-[0.85em]">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codePos + codeMatch[0].length)
    }
  }
  return parts
}

function TheoryContent({ text }) {
  return (
    <div className="text-sm text-gray-300 leading-relaxed space-y-2">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        // Numbered list: "1. text"
        const numMatch = line.match(/^(\d+)\.\s+(.+)/)
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2.5 ml-2">
              <span className="text-gray-600 font-mono text-xs mt-0.5 shrink-0 w-4">{numMatch[1]}.</span>
              <span>{renderInline(numMatch[2])}</span>
            </div>
          )
        }
        // Bullet: "• text"
        if (line.startsWith('•')) {
          return (
            <div key={i} className="flex gap-2.5 ml-2">
              <span className="text-gray-600 mt-1.5 shrink-0">•</span>
              <span>{renderInline(line.slice(1).trim())}</span>
            </div>
          )
        }
        // Code block line (indented with spaces or part of ```)
        if (line.startsWith('  ') || line.startsWith('\t')) {
          return (
            <div key={i} className="font-mono text-xs text-emerald-300 bg-midnight-950 px-3 py-0.5 rounded">
              {line}
            </div>
          )
        }
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

// ── Section component ─────────────────────────────────────

function TheorySection({ section, index, accentClass, isLast }) {
  const [expanded, setExpanded] = useState(true)

  const ACCENT_TEXT = {
    indigo: 'text-indigo-400', emerald: 'text-emerald-400',
    amber: 'text-amber-400', fuchsia: 'text-fuchsia-400',
  }[accentClass] ?? 'text-emerald-400'

  const ACCENT_BG = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/20',
  }[accentClass] ?? 'bg-emerald-500/10 border-emerald-500/20'

  return (
    <div className={`rounded-xl border border-surface-elevated overflow-hidden
                     ${!isLast ? 'mb-3' : ''}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-raised/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full ${ACCENT_BG} border flex items-center justify-center
                             text-xs font-mono font-bold ${ACCENT_TEXT} shrink-0`}>
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold text-white">{section.heading}</h3>
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-surface-elevated">
          <div className="pt-4">
            <TheoryContent text={section.content} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Key Points panel ──────────────────────────────────────

function KeyPoints({ points, accentClass }) {
  const ACCENT = {
    indigo: { dot: 'bg-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-500/5 border-indigo-500/20' },
    emerald: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
    amber: { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
    fuchsia: { dot: 'bg-fuchsia-400', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/5 border-fuchsia-500/20' },
  }[accentClass] ?? {}

  return (
    <div className={`rounded-xl border p-5 ${ACCENT.bg}`}>
      <div className={`flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-widest ${ACCENT.text}`}>
        <Lightbulb size={13} />
        Key Points to Remember
      </div>
      <ul className="space-y-2.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${ACCENT.dot} mt-1.5 shrink-0`} />
            <span className="text-sm text-gray-300 leading-snug">{renderInline(point)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Scroll progress indicator ─────────────────────────────

function ScrollProgressBar({ pct, accentClass }) {
  const BAR = {
    indigo: 'bg-indigo-500', emerald: 'bg-emerald-500',
    amber: 'bg-amber-500', fuchsia: 'bg-fuchsia-500',
  }[accentClass] ?? 'bg-emerald-500'

  return (
    <div className="h-0.5 bg-midnight-800 w-full">
      <div
        className={`h-full ${BAR} transition-all duration-200`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Main TheoryPage ───────────────────────────────────────

export default function TheoryPage({ level, accentClass, onComplete, alreadyRead, sideBySide = false }) {
  const { theory } = level
  const scrollRef = useRef(null)
  const bottomRef = useRef(null)
  const [scrollPct, setScrollPct] = useState(0)
  const [reachedBottom, setReachedBottom] = useState(alreadyRead ?? false)
  const [confirmed, setConfirmed] = useState(false)

  const ACCENT_TEXT = {
    indigo: 'text-indigo-400', emerald: 'text-emerald-400',
    amber: 'text-amber-400', fuchsia: 'text-fuchsia-400',
  }[accentClass] ?? 'text-emerald-400'

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    const pct = scrollHeight <= clientHeight
      ? 100
      : Math.round((scrollTop / (scrollHeight - clientHeight)) * 100)
    setScrollPct(pct)
    if (pct >= 92) setReachedBottom(true)
  }, [])

  // Also fire once on mount in case content is short enough to not need scrolling
  useEffect(() => {
    handleScroll()
  }, [handleScroll])

  const handleConfirm = () => {
    if (!reachedBottom) return
    setConfirmed(true)
    setTimeout(() => onComplete?.(), 400)
  }

  if (!theory) {
    // No theory defined — pass straight through
    if (!sideBySide) onComplete?.()
    return null
  }

  return (
    <div className="flex flex-col h-full animate-slide-up">
      {/* Scroll progress bar */}
      {!sideBySide && <ScrollProgressBar pct={scrollPct} accentClass={accentClass} />}

      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-0 custom-scrollbar"
      >
        {/* Header */}
        <div className="mb-8">
          <div className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2 ${ACCENT_TEXT}`}>
            <BookOpen size={12} />
            Theory — {level.title}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{theory.title}</h1>
          <p className="text-sm text-gray-500">
            Read through this material before tackling the challenges.
            {!sideBySide && !reachedBottom && (
              <span className="ml-1 text-gray-600">Scroll to the bottom to unlock challenges.</span>
            )}
          </p>
        </div>

        {/* Sections */}
        <div className="mb-6">
          {theory.sections.map((section, i) => (
            <TheorySection
              key={i}
              section={section}
              index={i}
              accentClass={accentClass}
              isLast={i === theory.sections.length - 1}
            />
          ))}
        </div>

        {/* Key points */}
        {theory.keyPoints?.length > 0 && (
          <div className="mb-8">
            <KeyPoints points={theory.keyPoints} accentClass={accentClass} />
          </div>
        )}

        {/* Bottom anchor — used for scroll detection */}
        <div ref={bottomRef} className="pb-2" />

        {/* CTA */}
        {!sideBySide && (
          <div className={`sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-midnight-900 via-midnight-900/95 to-transparent`}>
            {!reachedBottom ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-surface-elevated">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ChevronDown size={15} className="animate-bounce text-gray-600" />
                  Scroll to bottom to unlock challenges
                </div>
                <span className="text-xs font-mono text-gray-600">{scrollPct}%</span>
              </div>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={confirmed}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl
                            font-semibold text-sm transition-all duration-300
                            ${confirmed
                              ? 'bg-neon/20 border border-neon/40 text-neon cursor-default'
                              : 'bg-neon text-midnight-900 hover:bg-neon-dim shadow-neon active:scale-[0.99]'
                            }`}
              >
                {confirmed ? (
                  <><CheckCircle2 size={16} /> Loading challenges…</>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    I Understand — Start Challenges
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
