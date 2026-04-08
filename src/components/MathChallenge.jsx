import React, { useState, useRef, useEffect } from 'react'
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, RotateCcw } from 'lucide-react'

function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/')
}

function checkAnswer(userInput, challenge) {
  const normalized = normalizeAnswer(userInput)
  const correct = normalizeAnswer(challenge.answer)
  if (normalized === correct) return true

  // Check aliases
  if (challenge.answerAliases) {
    return challenge.answerAliases.some(alias => normalizeAnswer(alias) === normalized)
  }
  return false
}

export default function MathChallenge({ challenge, onComplete, isCompleted, accentClass = 'indigo' }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | correct | wrong
  const [showHint, setShowHint] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    setInput('')
    setStatus('idle')
    setShowHint(false)
    setAttempts(0)
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [challenge.id])

  const ACCENT = {
    indigo: { text: 'text-indigo-400', border: 'border-indigo-500', ring: 'focus:ring-indigo-500/30' },
    emerald: { text: 'text-emerald-400', border: 'border-emerald-500', ring: 'focus:ring-emerald-500/30' },
    amber: { text: 'text-amber-400', border: 'border-amber-500', ring: 'focus:ring-amber-500/30' },
    fuchsia: { text: 'text-fuchsia-400', border: 'border-fuchsia-500', ring: 'focus:ring-fuchsia-500/30' },
  }[accentClass] ?? {}

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (status === 'correct' || isCompleted) return
    if (!input.trim()) return

    setAttempts(a => a + 1)

    if (checkAnswer(input, challenge)) {
      setStatus('correct')
      onComplete?.()
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus('idle'), 1200)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const handleReset = () => {
    setInput('')
    setStatus('idle')
    setShowHint(false)
    inputRef.current?.focus()
  }

  const done = status === 'correct' || isCompleted

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Problem statement */}
      <div className="card-raised p-5 border border-surface-elevated">
        <div className="font-mono text-base text-white leading-relaxed whitespace-pre-wrap">
          {challenge.prompt}
        </div>
      </div>

      {/* Hint */}
      {challenge.hint && (
        <div>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-amber-progress transition-colors"
            >
              <Lightbulb size={13} />
              Show hint
            </button>
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-progress/5 border border-amber-progress/20">
              <Lightbulb size={14} className="text-amber-progress mt-0.5 shrink-0" />
              <span className="text-sm text-amber-200/80">{challenge.hint}</span>
            </div>
          )}
        </div>
      )}

      {/* Answer input */}
      {!done ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              className={`input-field pr-12 transition-all duration-200
                ${status === 'wrong' ? 'border-red-500 ring-1 ring-red-500/30 animate-[shake_0.3s_ease]' : ''}
                ${status === 'correct' ? 'border-neon ring-1 ring-neon/30' : ''}`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {status === 'wrong' && (
              <XCircle size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="btn-primary flex items-center gap-2">
              Check Solution
              <ChevronRight size={14} />
            </button>
            {attempts > 0 && (
              <button type="button" onClick={handleReset} className="btn-secondary flex items-center gap-1.5">
                <RotateCcw size={13} />
                Retry
              </button>
            )}
            {attempts > 1 && (
              <span className="text-xs text-gray-600 font-mono">{attempts} attempts</span>
            )}
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-neon/10 border border-neon/30 animate-fade-in">
          <CheckCircle2 size={20} className="text-neon shrink-0" />
          <div>
            <div className="text-neon font-semibold text-sm">Correct!</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Answer: <span className="font-mono text-white">{challenge.answer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
