import React, { useEffect, useRef } from 'react'
import { CheckCircle2, Lock, Unlock, BookOpen } from 'lucide-react'

/**
 * ChallengeSidebar
 *
 * Renders a vertical scrollable list of all challenges in a level.
 * Status per challenge:
 *   'completed' → ✅  green, clickable
 *   'current'   → 🔓  accent-colored, pulsing ring, clickable
 *   'locked'    → 🔒  grayed out, NOT clickable
 *
 * Auto-scrolls to keep the active item in view.
 */

const ACCENT = {
  indigo: {
    current: 'bg-indigo-500/15 border-indigo-500/50 ring-1 ring-indigo-500/30',
    currentText: 'text-indigo-300',
    currentNum: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    barFill: 'bg-indigo-500',
  },
  emerald: {
    current: 'bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/30',
    currentText: 'text-emerald-300',
    currentNum: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    barFill: 'bg-emerald-500',
  },
  amber: {
    current: 'bg-amber-500/15 border-amber-500/50 ring-1 ring-amber-500/30',
    currentText: 'text-amber-300',
    currentNum: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    barFill: 'bg-amber-500',
  },
  fuchsia: {
    current: 'bg-fuchsia-500/15 border-fuchsia-500/50 ring-1 ring-fuchsia-500/30',
    currentText: 'text-fuchsia-300',
    currentNum: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40',
    barFill: 'bg-fuchsia-500',
  },
}

function StatusIcon({ status, index, accentClass }) {
  const a = ACCENT[accentClass] ?? ACCENT.emerald

  if (status === 'completed') {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0
                       bg-neon/20 border border-neon/40">
        <CheckCircle2 size={14} className="text-neon" />
      </div>
    )
  }
  if (status === 'current') {
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                        border ${a.currentNum} animate-pulse-neon`}>
        <Unlock size={12} className={a.currentText} />
      </div>
    )
  }
  // locked
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0
                     bg-midnight-800 border border-midnight-700">
      <Lock size={12} className="text-gray-700" />
    </div>
  )
}

function SidebarItem({ challenge, index, status, isActive, onClick, accentClass }) {
  const ref = useRef(null)
  const a = ACCENT[accentClass] ?? ACCENT.emerald

  // Expose ref to parent for scroll-into-view
  const isClickable = status !== 'locked'

  const rowClass = [
    'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 select-none',
    isActive
      ? a.current
      : status === 'completed'
        ? 'border-transparent hover:bg-surface-raised/40 cursor-pointer'
        : status === 'current'
          ? 'border-transparent hover:bg-surface-raised/30 cursor-pointer'
          : 'border-transparent opacity-40 cursor-not-allowed',
  ].join(' ')

  return (
    <div ref={ref} data-index={index}>
      <button
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        className={rowClass}
        title={status === 'locked' ? `Complete challenge ${index} to unlock` : challenge.title}
      >
        <StatusIcon status={status} index={index} accentClass={accentClass} />

        <div className="flex-1 min-w-0 text-left">
          <div className={`text-xs font-medium leading-tight truncate
                            ${status === 'completed' ? 'text-gray-400' :
                              status === 'current' ? 'text-white' :
                              'text-gray-600'}`}>
            {challenge.title}
          </div>
          <div className="text-[10px] text-gray-600 capitalize mt-0.5">
            #{index + 1} · {challenge.difficulty}
          </div>
        </div>
      </button>
    </div>
  )
}

export default function ChallengeSidebar({
  challenges,
  activeIndex,
  onSelect,
  getChallengeStatus,  // (index) => 'completed' | 'current' | 'locked'
  levelProgress,       // { completed, required, pct }
  accentClass,
  onShowTheory,
}) {
  const containerRef = useRef(null)
  const activeRef = useRef(null)
  const a = ACCENT[accentClass] ?? ACCENT.emerald

  // Auto-scroll to keep active item visible
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const activeEl = container.querySelector(`[data-index="${activeIndex}"]`)
    if (!activeEl) return

    const containerRect = container.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()
    const isAbove = elRect.top < containerRect.top + 40
    const isBelow = elRect.bottom > containerRect.bottom - 40

    if (isAbove || isBelow) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIndex])

  const completedCount = levelProgress?.completed ?? 0
  const requiredCount = levelProgress?.required ?? challenges.length
  const pct = levelProgress?.pct ?? 0

  return (
    <div className="flex flex-col h-full w-60 shrink-0 border-r border-surface-elevated bg-midnight-800/30">
      {/* Header */}
      <div className="px-3 pt-4 pb-3 border-b border-surface-elevated">
        {/* Progress */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">Progress</span>
          <span className={`text-xs font-mono font-bold ${a.currentText}`}>
            {completedCount}/{requiredCount}
          </span>
        </div>
        <div className="progress-bar-track mb-3">
          <div
            className={`progress-bar-fill ${a.barFill}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Theory revisit link */}
        {onShowTheory && (
          <button
            onClick={onShowTheory}
            className="flex items-center gap-1.5 text-[10px] text-gray-600 hover:text-gray-400 transition-colors w-full"
          >
            <BookOpen size={10} />
            Review Theory
          </button>
        )}
      </div>

      {/* Challenge list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5"
      >
        {challenges.map((ch, idx) => {
          const status = getChallengeStatus(idx)
          return (
            <SidebarItem
              key={ch.id}
              challenge={ch}
              index={idx}
              status={status}
              isActive={idx === activeIndex && status !== 'locked'}
              onClick={() => onSelect(idx)}
              accentClass={accentClass}
            />
          )
        })}
      </div>

      {/* Footer count */}
      <div className="px-3 py-2.5 border-t border-surface-elevated">
        <p className="text-[10px] text-gray-600 text-center">
          {challenges.length} challenges total
        </p>
      </div>
    </div>
  )
}
