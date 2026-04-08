import React from 'react'
import {
  Calculator, Code2, GitBranch, BookOpen,
  Lock, ChevronRight, Flame, Trophy, Zap
} from 'lucide-react'
import { SUBJECTS } from '../data/curriculum'

const ICON_MAP = {
  Calculator,
  Code2,
  GitBranch,
  BookOpen,
}

const ACCENT_STYLES = {
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    bar: 'bg-indigo-500',
    badge: 'bg-indigo-500/20 text-indigo-300',
    glow: 'shadow-[0_0_20px_rgba(129,140,248,0.15)]',
    ring: 'ring-indigo-500/50',
  },
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    ring: 'ring-emerald-500/50',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/20 text-amber-300',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    ring: 'ring-amber-500/50',
  },
  fuchsia: {
    border: 'border-fuchsia-500/30',
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-400',
    bar: 'bg-fuchsia-500',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300',
    glow: 'shadow-[0_0_20px_rgba(232,121,249,0.15)]',
    ring: 'ring-fuchsia-500/50',
  },
}

function SubjectCard({ subject, onSelect, getLevelProgress, getCurrentLevelIndex, isLevelUnlocked, getTotalCompleted }) {
  const Icon = ICON_MAP[subject.icon] ?? Code2
  const accent = ACCENT_STYLES[subject.accentClass] ?? ACCENT_STYLES.emerald
  const currentLevelIndex = getCurrentLevelIndex(subject.id)
  const currentLevel = subject.levels[currentLevelIndex]
  const levelProgress = getLevelProgress(subject.id, currentLevel?.id)
  const totalDone = getTotalCompleted(subject.id)
  const allLevelsDone = currentLevelIndex >= subject.levels.length - 1 && levelProgress.pct >= 100

  return (
    <div
      className={`card border ${accent.border} ${accent.glow} hover:ring-1 ${accent.ring}
                  transition-all duration-300 cursor-pointer animate-slide-up group`}
      onClick={() => onSelect(subject.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(subject.id)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${accent.bg} border ${accent.border}`}>
            <Icon size={24} className={accent.text} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`tag ${accent.badge}`}>
              Level {currentLevelIndex + 1} / {subject.levels.length}
            </span>
            {allLevelsDone && (
              <span className="tag bg-neon/20 text-neon text-[10px]">
                <Trophy size={10} /> MASTERED
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-gray-100">
          {subject.label}
        </h2>
        <p className="text-xs text-gray-500 mb-4 line-clamp-1">
          {currentLevel?.description}
        </p>

        {/* Active Level Progress */}
        {currentLevel && (
          <>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-500 font-mono">
                {currentLevel.title}
              </span>
              <span className={`text-xs font-mono font-bold ${accent.text}`}>
                {levelProgress.completed} / {levelProgress.required}
              </span>
            </div>
            <div className="progress-bar-track mb-4">
              <div
                className={`progress-bar-fill ${accent.bar}`}
                style={{ width: `${levelProgress.pct}%` }}
              />
            </div>
          </>
        )}

        {/* Level Map (mini) */}
        <div className="flex items-center gap-1.5 mb-4">
          {subject.levels.map((level, idx) => {
            const unlocked = isLevelUnlocked(subject.id, idx)
            const lp = getLevelProgress(subject.id, level.id)
            const complete = lp.pct >= 100
            const active = idx === currentLevelIndex
            return (
              <div key={level.id} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                    border transition-all duration-300
                    ${complete ? `${accent.bg} ${accent.border} ${accent.text}` :
                      active ? `${accent.bg} ${accent.border} ${accent.text} ring-1 ${accent.ring}` :
                      unlocked ? 'bg-surface-elevated border-surface-elevated text-gray-400' :
                      'bg-midnight-800 border-midnight-700 text-gray-600'}`}
                >
                  {complete ? '✓' : unlocked ? idx + 1 : <Lock size={8} />}
                </div>
                {idx < subject.levels.length - 1 && (
                  <div className={`h-px w-4 ${unlocked ? accent.bar : 'bg-midnight-700'} opacity-50`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className={`flex items-center justify-between pt-3 border-t ${accent.border}`}>
          <span className="text-xs text-gray-600 font-mono">
            {totalDone} solved total
          </span>
          <div className={`flex items-center gap-1 text-xs font-medium ${accent.text}
                           group-hover:gap-2 transition-all duration-200`}>
            Start practicing
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsBar({ getLevelProgress, getCurrentLevelIndex, getTotalCompleted }) {
  const totalSolved = SUBJECTS.reduce((sum, s) => sum + getTotalCompleted(s.id), 0)
  const activeLevels = SUBJECTS.filter(s => getTotalCompleted(s.id) > 0).length

  return (
    <div className="flex items-center gap-6 mb-8 p-4 card border border-surface-elevated">
      <div className="flex items-center gap-2">
        <Flame size={18} className="text-amber-progress" />
        <div>
          <div className="text-xl font-bold text-white font-mono">{totalSolved}</div>
          <div className="text-xs text-gray-500">total solved</div>
        </div>
      </div>
      <div className="w-px h-8 bg-surface-elevated" />
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-neon" />
        <div>
          <div className="text-xl font-bold text-white font-mono">{activeLevels}</div>
          <div className="text-xs text-gray-500">subjects started</div>
        </div>
      </div>
      <div className="w-px h-8 bg-surface-elevated" />
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-indigo-400" />
        <div>
          <div className="text-xl font-bold text-white font-mono">{SUBJECTS.length}</div>
          <div className="text-xs text-gray-500">total subjects</div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ onSelectSubject, progressHook }) {
  const {
    getLevelProgress,
    getCurrentLevelIndex,
    isLevelUnlocked,
    getTotalCompleted,
  } = progressHook

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-neon tracking-widest uppercase">
            Mastery Learning System
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Study Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Complete the required challenges in each level to unlock the next.
        </p>
      </div>

      {/* Global Stats */}
      <StatsBar
        getLevelProgress={getLevelProgress}
        getCurrentLevelIndex={getCurrentLevelIndex}
        getTotalCompleted={getTotalCompleted}
      />

      {/* Subject Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUBJECTS.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onSelect={onSelectSubject}
            getLevelProgress={getLevelProgress}
            getCurrentLevelIndex={getCurrentLevelIndex}
            isLevelUnlocked={isLevelUnlocked}
            getTotalCompleted={getTotalCompleted}
          />
        ))}
      </div>
    </div>
  )
}
