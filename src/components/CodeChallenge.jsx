import React, { useState, useEffect } from 'react'
import {
  CheckCircle2, XCircle, Lightbulb, Play, ChevronDown, ChevronUp,
  Loader2, FlaskConical, BookOpen
} from 'lucide-react'
import WebCompiler from './WebCompiler'
import { validateCode, runTestCases, loadPyodide } from '../utils/CompilerUtility'

function normalizeOutput(str) {
  return (str ?? '').trim().replace(/\r\n/g, '\n').replace(/\n+$/, '')
}

// ── Examples Panel ─────────────────────────────────────────

function ExamplesPanel({ examples }) {
  if (!examples || examples.length === 0) return null
  return (
    <div className="rounded-lg border border-surface-elevated bg-midnight-900 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-surface-elevated">
        <BookOpen size={12} className="text-gray-600" />
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Examples</span>
      </div>
      <div className="divide-y divide-surface-elevated">
        {examples.map((ex, i) => (
          <div key={i} className="px-3 py-2 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Input</div>
              <pre className="text-gray-300 whitespace-pre-wrap">{ex.input}</pre>
            </div>
            <div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Output</div>
              <pre className="text-neon/80 whitespace-pre-wrap">{ex.output}</pre>
            </div>
            {ex.note && (
              <div className="col-span-2 text-[10px] text-gray-600 italic">{ex.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Test Cases Panel ──────────────────────────────────────

function TestCaseRow({ result, index }) {
  const { call, expected, actual, passed, error } = result
  return (
    <div className={`flex items-start gap-2 px-3 py-2 text-xs font-mono
                     ${passed ? '' : 'bg-red-500/5'}`}>
      <div className="mt-0.5 shrink-0">
        {passed
          ? <CheckCircle2 size={12} className="text-neon" />
          : <XCircle size={12} className="text-red-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-gray-400 truncate">
          <span className="text-gray-600">#{index + 1}</span>{' '}
          {call}
        </div>
        {!passed && (
          <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-gray-600">expected: </span>
              <span className="text-neon/70">{expected}</span>
            </div>
            <div>
              <span className="text-gray-600">got: </span>
              <span className="text-red-400">{error || actual || '(empty)'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TestResultsPanel({ results, running }) {
  if (running) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-surface-elevated text-xs text-gray-500">
        <Loader2 size={12} className="animate-spin" />
        Running test cases…
      </div>
    )
  }
  if (!results || results.length === 0) return null

  const passed = results.filter(r => r.passed).length
  const total = results.length
  const allPassed = passed === total

  return (
    <div className={`rounded-lg border overflow-hidden ${
      allPassed ? 'border-neon/30' : 'border-red-500/30'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 text-xs
                       ${allPassed ? 'bg-neon/5' : 'bg-red-500/5'}`}>
        <div className="flex items-center gap-1.5">
          <FlaskConical size={12} className={allPassed ? 'text-neon' : 'text-red-400'} />
          <span className={`font-medium ${allPassed ? 'text-neon' : 'text-red-400'}`}>
            {allPassed ? 'All tests passed' : `${passed}/${total} tests passed`}
          </span>
        </div>
        <span className="text-gray-600">{total} test cases</span>
      </div>
      {/* Rows */}
      <div className="divide-y divide-surface-elevated max-h-52 overflow-y-auto">
        {results.map((r, i) => (
          <TestCaseRow key={i} result={r} index={i} />
        ))}
      </div>
    </div>
  )
}

// ── Output Match (for stdout comparison) ─────────────────

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

// ── Main Component ────────────────────────────────────────

export default function CodeChallenge({ challenge, onComplete, isCompleted, accentClass = 'emerald' }) {
  const [code, setCode] = useState(challenge.starterCode ?? '')
  const [lines, setLines] = useState([])
  const [running, setRunning] = useState(false)
  const [submitResult, setSubmitResult] = useState(null) // null | 'correct' | 'wrong'
  const [showHint, setShowHint] = useState(false)
  const [showExpected, setShowExpected] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const [hasRun, setHasRun] = useState(false)
  const [actualOutput, setActualOutput] = useState('')
  const [testResults, setTestResults] = useState(null)
  const [runningTests, setRunningTests] = useState(false)

  const hasTestCases = challenge.testCases && challenge.testCases.length > 0
  const hasExamples = challenge.examples && challenge.examples.length > 0

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
    setTestResults(null)
    setRunningTests(false)
    setShowExamples(true)
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
    setTestResults(null)
  }

  const handleCheckSolution = async () => {
    if (running) return
    setRunning(true)
    setLines([])
    setSubmitResult(null)
    setHasRun(true)
    setTestResults(null)

    const expected = challenge.expectedOutput
    const language = challenge.language ?? 'javascript'

    // Run visible code for terminal output
    const codeResult = await validateCode(language, code, expected)

    const newLines = []
    if (codeResult.actualOutput) {
      newLines.push({ type: 'log', text: codeResult.actualOutput })
    }
    if (codeResult.error) {
      newLines.push({ type: 'error', text: `✖ ${codeResult.error}` })
    }
    if (newLines.length === 0) {
      newLines.push({ type: 'info', text: '(no output)' })
    }
    setLines(newLines)
    setActualOutput(codeResult.actualOutput || '')
    setRunning(false)

    // Run hidden test cases
    if (hasTestCases) {
      setRunningTests(true)
      const tcResults = await runTestCases(language, code, challenge.testCases)
      setTestResults(tcResults)
      setRunningTests(false)

      const allPassed = tcResults.length > 0 && tcResults.every(r => r.passed)
      if (allPassed) {
        setSubmitResult('correct')
        onComplete?.()
      } else {
        setSubmitResult('wrong')
      }
    } else {
      // Fall back to stdout comparison
      if (codeResult.passed) {
        setSubmitResult('correct')
        onComplete?.()
      } else {
        setSubmitResult('wrong')
      }
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

      {/* Examples */}
      {hasExamples && (
        <div>
          <button
            onClick={() => setShowExamples(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors mb-2"
          >
            {showExamples ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showExamples ? 'Hide examples' : 'Show examples'} ({challenge.examples.length})
          </button>
          {showExamples && <ExamplesPanel examples={challenge.examples} />}
        </div>
      )}

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

      {/* Expected output toggle (only shown when no test cases) */}
      {!hasTestCases && (
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
      )}

      {/* Output comparison (stdout, only when no test cases) */}
      {!hasTestCases && hasRun && submitResult && !running && (
        <OutputMatch expected={challenge.expectedOutput} actual={actualOutput} />
      )}

      {/* Test cases results */}
      {hasTestCases && (hasRun || runningTests) && (
        <TestResultsPanel results={testResults} running={runningTests} />
      )}

      {/* Submit button + result */}
      {!done ? (
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheckSolution}
            disabled={running || runningTests}
            className="btn-primary flex items-center gap-2"
          >
            {(running || runningTests) ? (
              <><Loader2 size={14} className="animate-spin" /> Testing…</>
            ) : (
              <><Play size={14} className="fill-current" /> Check Solution</>
            )}
          </button>
          {submitResult === 'wrong' && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <XCircle size={12} />
              {hasTestCases ? 'Some tests failed' : "Output doesn't match"}
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
