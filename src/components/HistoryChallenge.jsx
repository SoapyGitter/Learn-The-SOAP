import React, { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E']

export default function HistoryChallenge({ challenge, onComplete, isCompleted, accentClass = 'fuchsia' }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
    setShowExplanation(false)
  }, [challenge.id])

  const ACCENT = {
    fuchsia: {
      selected: 'border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-200',
      correct: 'border-neon bg-neon/10 text-neon',
      wrong: 'border-red-500 bg-red-500/10 text-red-300',
      neutral: 'border-surface-elevated bg-surface hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 text-gray-300',
      label: 'bg-fuchsia-500/20 text-fuchsia-400',
      labelCorrect: 'bg-neon/20 text-neon',
      labelWrong: 'bg-red-500/20 text-red-400',
    },
    indigo: {
      selected: 'border-indigo-500 bg-indigo-500/15 text-indigo-200',
      correct: 'border-neon bg-neon/10 text-neon',
      wrong: 'border-red-500 bg-red-500/10 text-red-300',
      neutral: 'border-surface-elevated bg-surface hover:border-indigo-500/40 hover:bg-indigo-500/5 text-gray-300',
      label: 'bg-indigo-500/20 text-indigo-400',
      labelCorrect: 'bg-neon/20 text-neon',
      labelWrong: 'bg-red-500/20 text-red-400',
    },
  }
  const accent = ACCENT[accentClass] ?? ACCENT.fuchsia

  const handleSelect = (idx) => {
    if (submitted || isCompleted) return
    setSelected(idx)
  }

  const handleSubmit = () => {
    if (selected === null || submitted || isCompleted) return
    setSubmitted(true)
    if (selected === challenge.correctIndex) {
      onComplete?.()
    }
    setTimeout(() => setShowExplanation(true), 400)
  }

  const isCorrect = (idx) => submitted && idx === challenge.correctIndex
  const isWrong = (idx) => submitted && idx === selected && idx !== challenge.correctIndex
  const done = submitted || isCompleted

  const getOptionStyle = (idx) => {
    if (!done) {
      return selected === idx ? accent.selected : accent.neutral
    }
    if (isCorrect(idx)) return accent.correct
    if (isWrong(idx)) return accent.wrong
    return 'border-surface-elevated bg-midnight-800/50 text-gray-600'
  }

  const getLabelStyle = (idx) => {
    if (!done) return selected === idx ? accent.label : 'bg-surface-elevated text-gray-500'
    if (isCorrect(idx)) return accent.labelCorrect
    if (isWrong(idx)) return accent.labelWrong
    return 'bg-surface-elevated text-gray-600'
  }

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Question */}
      <div className="card-raised p-5 border border-surface-elevated">
        <p className="text-sm text-gray-400 font-mono mb-2 uppercase tracking-wider">Question</p>
        <p className="text-base text-white leading-relaxed">{challenge.prompt}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {challenge.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            disabled={done}
            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left
                        transition-all duration-200 cursor-pointer
                        ${done ? 'cursor-default' : 'active:scale-[0.995]'}
                        ${getOptionStyle(idx)}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center
                              text-xs font-bold shrink-0 transition-colors
                              ${getLabelStyle(idx)}`}>
              {OPTION_LABELS[idx]}
            </span>
            <span className="text-sm font-medium leading-snug">{option}</span>
            {isCorrect(idx) && (
              <CheckCircle2 size={16} className="text-neon ml-auto shrink-0" />
            )}
            {isWrong(idx) && (
              <XCircle size={16} className="text-red-400 ml-auto shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Submit button */}
      {!done && (
        <button
          onClick={handleSubmit}
          disabled={selected === null}
          className="btn-primary self-start"
        >
          Submit Answer
        </button>
      )}

      {/* Explanation */}
      {showExplanation && challenge.explanation && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-surface-elevated animate-fade-in">
          <BookOpen size={16} className="text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Explanation</p>
            <p className="text-sm text-gray-300 leading-relaxed">{challenge.explanation}</p>
          </div>
        </div>
      )}

      {/* Correct summary */}
      {done && selected === challenge.correctIndex && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-neon/10 border border-neon/30 animate-fade-in">
          <CheckCircle2 size={20} className="text-neon shrink-0" />
          <span className="text-neon font-semibold text-sm">Correct answer!</span>
        </div>
      )}
      {done && selected !== challenge.correctIndex && !isCompleted && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in">
          <XCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <div className="text-red-400 font-semibold text-sm">Incorrect</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Correct answer: <span className="font-mono text-white">{challenge.options[challenge.correctIndex]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
