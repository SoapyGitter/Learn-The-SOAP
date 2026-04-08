import React, { useState, useEffect } from 'react'
import {
  CheckCircle2, XCircle, Lightbulb, Play, AlertTriangle, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import WebCompiler from './WebCompiler'
import { validateCode, loadPyodide } from '../utils/CompilerUtility'

function normalizeOutput(str) {
  return (str ?? '').trim().replace(/\r\n/g, '\n').replace(/\n+$/, '')
}

function OutputMatch({ expected, actual }) {
  const match = normalizeOutput(actual) === normalizeOutput(expected)
  return (
    <div className={`p-3 rounded-lg border text-xs font-mono
                     ${match ? 'bg-neon/5 border-neon/30' : 'bg-red-500/5 border-red-500/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        {match
          ? <CheckCircle2 size={13} className="text-neon" />
          : <XCircle size={13} className="text-red-400" />
        }
        <span className={match ? 'text-neon' : 'text-red-400'}>
          {match ? 'Output matches expected' : 'Output does not match'}
        </span>
      </div>
      {!match && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <div className="text-gray-600 uppercase tracking-wider text-[10px] mb-1">Expected</div>
            <pre className="text-gray-300 whitespace-pre-wrap bg-midnight-900 rounded p-2">
              {normalizeOutput(expected)}
            </pre>
          </div>
          <div>
            <div className="text-gray-600 uppercase tracking-wider text-[10px] mb-1">Got</div>
            <pre className="text-red-300 whitespace-pre-wrap bg-midnight-900 rounded p-2">
              {normalizeOutput(actual) || '(empty)'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CodeChallenge({ challenge, onComplete, isCompleted, accentClass = 'emerald' }) {
  const [code, setCode] = useState(challenge.starterCode ?? '')
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)
  const [submitResult, setSubmitResult] = useState(null) // null | 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false)
  const [showExpected, setShowExpected] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [actualOutput, setActualOutput] = useState('')

  // Preload pyodide if python
  useEffect(() => {
    if (challenge.language === 'python') {
      loadPyodide()
    }
  }, [challenge.language])

  useEffect(() => {
    setCode(challenge.starterCode ?? '')
    setLines([])
    setRunning(false)
    setSubmitResult(null)
    setHasRun(false)
    setActualOutput('')
    setShowHint(false)
  }, [challenge.id, challenge.starterCode])

  const ACCENT = {
    emerald: { badge: 'bg-emerald-500/20 text-emerald-300' },
    amber: { badge: 'bg-amber-500/20 text-amber-300' },
  }[accentClass] ?? { badge: 'bg-emerald-500/20 text-emerald-300' }

  const handleReset = () => {
    setCode(challenge.starterCode ?? '')
    setLines([])
    setSubmitResult(null)
    setHasRun(false)
    setActualOutput('')
  }

  const handleCheckSolution = async () => {
    if (running) return
    setRunning(true)
    setLines([])
    setSubmitResult(null)
    setHasRun(true)

    const expected = challenge.expectedOutput
    const language = challenge.language ?? 'javascript'

    const result = await validateCode(language, code, expected)
    
    const newLines = []
    if (result.actualOutput) {
      newLines.push({ type: 'log', text: result.actualOutput })
    }
    if (result.error) {
      newLines.push({ type: 'error', text: `✖ ${result.error}` })
    }
    if (newLines.length === 0) {
      newLines.push({ type: 'info', text: '(no output)' })
    }
    setLines(newLines)
    setActualOutput(result.actualOutput || '')
    setRunning(false)

    if (result.passed) {
      setSubmitResult('correct')
      onComplete?.()
    } else {
      setSubmitResult('wrong')
    }
  }

  const done = submitResult === 'correct' || isCompleted

  return (
    <div className="flex flex-col gap-4 h-full animate-slide-up">
      {/* Problem */}
      <div className="card-raised p-4 border border-surface-elevated">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm text-white leading-relaxed">{challenge.prompt}</p>
          <div className="flex gap-1 shrink-0">
            <span className={`tag ${ACCENT.badge} text-[10px]`}>
              {challenge.language?.toUpperCase()}
            </span>
            <span className={`tag ${
              challenge.difficulty === 'easy' ? 'bg-neon/10 text-neon/70' :
              challenge.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            } text-[10px]`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        {/* Hint */}
        {challenge.hint && (
          <button
            onClick={() => setShowHint(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-progress transition-colors"
          >
            <Lightbulb size={12} />
            {showHint ? 'Hide hint' : 'Show hint'}
          </button>
        )}
        {showHint && challenge.hint && (
          <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-amber-progress/5 border border-amber-progress/20 animate-fade-in">
            <Lightbulb size={12} className="text-amber-progress mt-0.5 shrink-0" />
            <span className="text-xs text-amber-200/80">{challenge.hint}</span>
          </div>
        )}
      </div>

      {/* Compiler — takes remaining height */}
      <div className="flex-1 min-h-[380px]">
        <WebCompiler
          language={challenge.language ?? 'javascript'}
          code={code}
          setCode={setCode}
          initialCode={challenge.starterCode ?? ''}
          lines={lines}
          running={running}
          readOnly={done}
          onReset={handleReset}
        />
      </div>

      {/* Expected output toggle */}
      <div>
        <button
          onClick={() => setShowExpected(v => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          {showExpected ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showExpected ? 'Hide expected output' : 'Show expected output'}
        </button>
        {showExpected && (
          <div className="mt-2 p-3 rounded-lg bg-midnight-900 border border-surface-elevated animate-fade-in">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Expected Output</p>
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
              {challenge.expectedOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Output comparison */}
      {hasRun && submitResult && !running && (
        <OutputMatch expected={challenge.expectedOutput} actual={actualOutput} />
      )}

      {/* Submit button + result */}
      {!done ? (
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckSolution}
            disabled={running}
            className="btn-primary flex items-center gap-2"
          >
            {running ? (
              <><Loader2 size={14} className="animate-spin" /> Testing...</>
            ) : (
              <><Play size={14} className="fill-current" /> Check Solution</>
            )}
          </button>
          {submitResult === 'wrong' && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <XCircle size={12} />
              Output doesn't match
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-neon/10 border border-neon/30 animate-fade-in">
          <CheckCircle2 size={20} className="text-neon shrink-0" />
          <div>
            <div className="text-neon font-semibold text-sm">Challenge Complete!</div>
            <div className="text-xs text-gray-400 mt-0.5">Move to the next challenge to keep your streak.</div>
          </div>
        </div>
      )}
    </div>
  )
}
