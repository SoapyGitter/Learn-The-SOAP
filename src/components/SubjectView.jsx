import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowLeft, Lock, CheckCircle2, ChevronRight,
  Calculator, Code2, GitBranch, BookOpen, Zap, Trophy,
  Sparkles
} from 'lucide-react'
import { SUBJECTS } from '../data/curriculum'
import MathChallenge from './MathChallenge'
import HistoryChallenge from './HistoryChallenge'
import CodeChallenge from './CodeChallenge'
import ChallengeSidebar from './ChallengeSidebar'
import TheoryPage from './TheoryPage'
import SplitLayout from './SplitLayout'

const ICON_MAP = { Calculator, Code2, GitBranch, BookOpen }

const ACCENT_STYLES = {
  indigo: {
    text: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10',
    badge: 'bg-indigo-500/20 text-indigo-300', bar: 'bg-indigo-500',
    activeTab: 'border-indigo-500 text-indigo-400', ring: 'ring-indigo-500/30',
    glow: 'shadow-[0_0_30px_rgba(129,140,248,0.2)]',
  },
  emerald: {
    text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-300', bar: 'bg-emerald-500',
    activeTab: 'border-emerald-500 text-emerald-400', ring: 'ring-emerald-500/30',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
  amber: {
    text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-300', bar: 'bg-amber-500',
    activeTab: 'border-amber-500 text-amber-400', ring: 'ring-amber-500/30',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
  },
  fuchsia: {
    text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/10',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300', bar: 'bg-fuchsia-500',
    activeTab: 'border-fuchsia-500 text-fuchsia-400', ring: 'ring-fuchsia-500/30',
    glow: 'shadow-[0_0_30px_rgba(232,121,249,0.2)]',
  },
}

// ── Challenge dispatcher ──────────────────────────────────

function ChallengeDispatcher({ challenge, onComplete, isCompleted, accentClass }) {
  if (!challenge) return null
  const props = { challenge, onComplete, isCompleted, accentClass }
  switch (challenge.type) {
    case 'math':    return <MathChallenge {...props} />
    case 'history': return <HistoryChallenge {...props} />
    case 'code':
    case 'algo':    return <CodeChallenge {...props} />
    default: return <div className="text-red-400 text-sm">Unknown type: {challenge.type}</div>
  }
}

// ── Success overlay (auto-advance flash) ─────────────────

function SuccessFlash({ challenge, onDismiss, isLastChallenge, isLastLevel }) {
  // Store latest onDismiss in a ref so the timer never needs to restart
  const dismissRef = useRef(onDismiss)
  useEffect(() => { dismissRef.current = onDismiss }, [onDismiss])

  // Start the timer ONCE on mount — it will always call the latest onDismiss
  useEffect(() => {
    const t = setTimeout(() => dismissRef.current?.(), 2000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center
                    bg-midnight-900/80 backdrop-blur-sm animate-fade-in rounded-xl">
      <div className="flex flex-col items-center gap-4 text-center px-8 animate-slide-up">
        <div className="p-5 rounded-full bg-neon/20 border-2 border-neon/40 shadow-neon">
          <CheckCircle2 size={40} className="text-neon" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white mb-1">
            {isLastLevel ? 'Level Complete!' : 'Solved!'}
          </div>
          <div className="text-sm text-gray-400">
            {isLastChallenge && !isLastLevel
              ? 'Last challenge — next level unlocked!'
              : isLastLevel
                ? 'You\'ve completed all challenges in this level!'
                : 'Advancing to the next challenge…'}
          </div>
        </div>
        <div className="flex items-center gap-1 text-neon text-xs font-mono">
          <Sparkles size={12} />
          +1 solved
        </div>
      </div>
    </div>
  )
}

// ── Main SubjectView ──────────────────────────────────────

export default function SubjectView({ subjectId, onBack, progressHook }) {
  const {
    isTheoryRead,
    getHighestUnlockedIndex,
    getChallengeStatus: getChallengeStatusRaw,
    isChallengeCompleted,
    getLevelProgress,
    getCurrentLevelIndex,
    isLevelUnlocked,
    markTheoryRead,
    completeChallenge,
  } = progressHook

  const subject = SUBJECTS.find(s => s.id === subjectId)
  if (!subject) return null

  const accent = ACCENT_STYLES[subject.accentClass] ?? ACCENT_STYLES.emerald
  const Icon = ICON_MAP[subject.icon] ?? Code2

  const currentLevelIndex = getCurrentLevelIndex(subjectId)

  // ── Level selection ──
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(currentLevelIndex)
  const level = subject.levels[selectedLevelIndex]
  const levelId = level?.id

  // ── Challenge selection (always clamped to unlocked range) ──
  const highestUnlocked = getHighestUnlockedIndex(subjectId, levelId)
  // clamp: never allow index > highestUnlocked (the "URL hack" protection)
  const clampToActive = useCallback((idx) => {
    const max = Math.max(0, highestUnlocked)
    return Math.min(idx, max)
  }, [highestUnlocked])

  const [selectedChallengeIndex, setSelectedChallengeIndex_] = useState(
    () => Math.max(0, highestUnlocked)
  )

  const setSelectedChallengeIndex = useCallback((idx) => {
    setSelectedChallengeIndex_(clampToActive(idx))
  }, [clampToActive])

  // ── View mode: 'theory' | 'challenges' ──
  const theoryRead = isTheoryRead(subjectId, levelId)
  const [viewMode, setViewMode] = useState(theoryRead ? 'challenges' : 'theory')

  // ── Success flash state ──
  const [showSuccess, setShowSuccess] = useState(false)
  // Stores the index that was just completed so the auto-advance knows where to go,
  // even if the user clicks a sidebar item during the flash.
  const justCompletedIndexRef = useRef(null)

  // When level changes, reset to theory gate or active challenge
  useEffect(() => {
    const read = isTheoryRead(subjectId, levelId)
    setViewMode(read ? 'challenges' : 'theory')
    const hu = getHighestUnlockedIndex(subjectId, levelId)
    setSelectedChallengeIndex_(Math.max(0, hu))
    setShowSuccess(false)
    justCompletedIndexRef.current = null
  }, [selectedLevelIndex, levelId])

  // Re-clamp if unlocked index changes (e.g. after completing a challenge)
  useEffect(() => {
    setSelectedChallengeIndex_(prev => Math.min(prev, Math.max(0, highestUnlocked)))
  }, [highestUnlocked])

  // ── Derived values ──
  const challenges = level?.challenges ?? []
  const challenge = challenges[selectedChallengeIndex] ?? null
  const levelProgress = getLevelProgress(subjectId, levelId)
  const isCompleted = challenge ? isChallengeCompleted(subjectId, levelId, challenge.id) : false
  const isLastChallenge = selectedChallengeIndex === challenges.length - 1
  const isLastLevel = selectedLevelIndex === subject.levels.length - 1

  // getChallengeStatus wrapper that takes an index
  const getChallengeStatus = useCallback((idx) => {
    return getChallengeStatusRaw(subjectId, levelId, idx)
  }, [getChallengeStatusRaw, subjectId, levelId])

  // ── Handlers ──

  const handleTheoryComplete = useCallback(() => {
    markTheoryRead(subjectId, levelId)
    setViewMode('challenges')
    setSelectedChallengeIndex_(0)
  }, [subjectId, levelId, markTheoryRead])

  const handleChallengeComplete = useCallback(() => {
    if (!challenge) return
    completeChallenge(subjectId, levelId, selectedChallengeIndex, challenge.id)
    justCompletedIndexRef.current = selectedChallengeIndex
    setShowSuccess(true)
  }, [challenge, subjectId, levelId, selectedChallengeIndex, completeChallenge])

  // Called by SuccessFlash after the 2-second timer — advances from the completed index
  const handleSuccessDismiss = useCallback(() => {
    setShowSuccess(false)
    const completedIdx = justCompletedIndexRef.current
    justCompletedIndexRef.current = null
    if (completedIdx !== null && completedIdx < challenges.length - 1) {
      setSelectedChallengeIndex_(completedIdx + 1)
    }
  }, [challenges.length])

  const handleSidebarSelect = useCallback((idx) => {
    const status = getChallengeStatus(idx)
    if (status === 'locked') return
    // If the success flash is showing, cancel it and navigate directly
    if (showSuccess) {
      setShowSuccess(false)
      justCompletedIndexRef.current = null
    }
    setSelectedChallengeIndex_(idx)
  }, [getChallengeStatus, showSuccess])

  const handleLevelSelect = useCallback((idx) => {
    if (!isLevelUnlocked(subjectId, idx)) return
    setSelectedLevelIndex(idx)
  }, [isLevelUnlocked, subjectId])

  // Cancel success flash on unmount
  useEffect(() => () => {
    justCompletedIndexRef.current = null
  }, [])

  const unlocked = isLevelUnlocked(subjectId, selectedLevelIndex)

  return (
    <div className="h-[calc(100vh-48px)] flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-surface-elevated bg-midnight-900 shrink-0">
        <button onClick={onBack} className="btn-secondary flex items-center gap-1.5 text-xs">
          <ArrowLeft size={13} />
          Dashboard
        </button>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${accent.bg} border ${accent.border}`}>
          <Icon size={14} className={accent.text} />
          <span className={`text-sm font-semibold ${accent.text}`}>{subject.label}</span>
        </div>

        {/* Level tabs */}
        <div className="flex items-center border-l border-surface-elevated pl-3 gap-0 overflow-x-auto">
          {subject.levels.map((lv, idx) => {
            const locked = !isLevelUnlocked(subjectId, idx)
            const lp = getLevelProgress(subjectId, lv.id)
            const active = idx === selectedLevelIndex
            return (
              <button
                key={lv.id}
                onClick={() => handleLevelSelect(idx)}
                disabled={locked}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                             border-b-2 whitespace-nowrap transition-colors duration-150
                             ${active ? accent.activeTab : 'border-transparent text-gray-500 hover:text-gray-400'}
                             ${locked ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {locked && <Lock size={9} />}
                {lv.title}
                {lp.pct >= 100 && <Trophy size={9} className="text-neon" />}
              </button>
            )
          })}
        </div>

        {/* Right: progress pill */}
        <div className="ml-auto shrink-0 flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 progress-bar-track">
              <div className={`progress-bar-fill ${accent.bar}`} style={{ width: `${levelProgress.pct}%` }} />
            </div>
            <span className={`text-xs font-mono ${accent.text}`}>
              {levelProgress.completed}/{levelProgress.required}
            </span>
          </div>
          {levelProgress.pct >= 100 && (
            <span className="flex items-center gap-1 text-neon text-xs">
              <Zap size={11} /> Done
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {!unlocked ? (
        <LockedLevel
          subject={subject}
          selectedLevelIndex={selectedLevelIndex}
          currentLevelIndex={currentLevelIndex}
          onReturnToActive={() => handleLevelSelect(currentLevelIndex)}
        />
      ) : (
        <SplitLayout
          progressPct={levelProgress.pct}
          leftPane={
            level?.theory ? (
              <TheoryPage
                level={level}
                accentClass={subject.accentClass}
                alreadyRead={true}
                sideBySide={true}
              />
            ) : null
          }
          rightPane={
            <div className="flex h-full min-h-0 overflow-hidden">
              {/* Sidebar */}
              <ChallengeSidebar
                challenges={challenges}
                activeIndex={selectedChallengeIndex}
                onSelect={handleSidebarSelect}
                getChallengeStatus={getChallengeStatus}
                levelProgress={levelProgress}
                accentClass={subject.accentClass}
              />

              {/* Main challenge panel */}
              <div className="flex-1 min-w-0 overflow-y-auto relative">
                {/* Success flash overlay */}
                {showSuccess && (
                  <SuccessFlash
                    challenge={challenge}
                    onDismiss={handleSuccessDismiss}
                    isLastChallenge={isLastChallenge}
                    isLastLevel={isLastLevel}
                  />
                )}

                <div className="p-6 flex flex-col gap-4 h-full">
                  {/* Challenge header */}
                  {challenge && (
                    <div className="flex items-start justify-between gap-3 shrink-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-600">
                            #{selectedChallengeIndex + 1} of {challenges.length}
                          </span>
                          <span className={`tag text-[10px] ${
                            challenge.difficulty === 'easy' ? 'bg-neon/10 text-neon/70' :
                            challenge.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
                        {challenge.tags?.length > 0 && (
                          <div className="flex gap-1.5 mt-1.5">
                            {challenge.tags.map(tag => (
                              <span key={tag} className="tag bg-surface-elevated text-gray-500 text-[10px]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Next button (shown when solved and not last) */}
                      {isCompleted && !isLastChallenge && !showSuccess && (
                        <button
                          onClick={() => setSelectedChallengeIndex_(selectedChallengeIndex + 1)}
                          className="btn-primary flex items-center gap-1.5 text-xs shrink-0"
                        >
                          Next Challenge <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* The actual challenge */}
                  <div className="flex-1 min-h-0">
                    <ChallengeDispatcher
                      challenge={challenge}
                      onComplete={handleChallengeComplete}
                      isCompleted={isCompleted}
                      accentClass={subject.accentClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          }
        />
      )}
    </div>
  )
}

// ── Locked level placeholder ──────────────────────────────

function LockedLevel({ subject, selectedLevelIndex, currentLevelIndex, onReturnToActive }) {
  const prevLevel = subject.levels[selectedLevelIndex - 1]
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20">
      <div className="p-6 rounded-full bg-surface-raised border border-surface-elevated">
        <Lock size={36} className="text-gray-500" />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="text-xl font-bold text-white mb-2">Level Locked</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Complete{' '}
          <span className="text-white font-medium">{prevLevel?.requiredToPass}</span>{' '}
          challenges in{' '}
          <span className="text-white font-medium">{prevLevel?.title ?? 'the previous level'}</span>{' '}
          to unlock this level.
        </p>
      </div>
      <button onClick={onReturnToActive} className="btn-secondary">
        Return to Active Level
      </button>
    </div>
  )
}
