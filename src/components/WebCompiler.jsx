import React, { useState, useEffect, useRef } from 'react'
import { Terminal, RotateCcw, Loader2 } from 'lucide-react'
import CodeEditor from './CodeEditor'

// ──────────────────────────────────────────────────────────
//  TerminalOutput — renders lines with colour coding
// ──────────────────────────────────────────────────────────

function TerminalOutput({ lines, running }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="terminal flex-1 min-h-0 overflow-auto">
      {lines.length === 0 && !running && (
        <span className="text-gray-600 select-none">// Output will appear here…</span>
      )}
      {lines.map((line, i) => (
        <div
          key={i}
          className={`terminal-line ${line.type === 'error' ? 'error' : line.type === 'success' ? 'success' : line.type === 'info' ? 'info' : ''}`}
        >
          {line.text}
        </div>
      ))}
      {running && (
        <div className="flex items-center gap-2 text-amber-progress mt-1">
          <Loader2 size={12} className="animate-spin" />
          <span className="text-xs">Running…</span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

// ──────────────────────────────────────────────────────────
//  WebCompiler — the main split-pane compiler component
// ──────────────────────────────────────────────────────────

export default function WebCompiler({
  language = 'javascript',
  code,
  setCode,
  initialCode,
  lines,
  running,
  readOnly = false,
  onReset
}) {
  return (
    <div className="flex flex-col h-full gap-0 rounded-xl overflow-hidden border border-surface-elevated">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-midnight-800 border-b border-surface-elevated">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            {language === 'python' ? '🐍 Python' : '⚡ JavaScript'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            disabled={running || readOnly}
            title="Reset to starter code"
            className="btn-secondary text-xs px-2 py-1 flex items-center gap-1"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-col flex-1 min-h-0 lg:flex-row">
        {/* Code editor */}
        <div className="flex-1 min-h-0 overflow-auto bg-midnight-950">
          <CodeEditor
            value={code}
            onChange={readOnly ? undefined : setCode}
            language={language}
            readOnly={readOnly}
          />
        </div>

        {/* Divider */}
        <div className="h-px lg:h-auto lg:w-px bg-surface-elevated" />

        {/* Terminal output */}
        <div className="flex flex-col w-full lg:w-80 xl:w-96 min-h-[160px] lg:min-h-0 bg-midnight-950">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-elevated">
            <Terminal size={12} className="text-gray-600" />
            <span className="text-xs font-mono text-gray-600">OUTPUT</span>
          </div>
          <div className="flex-1 p-3 overflow-auto">
            <TerminalOutput lines={lines} running={running} />
          </div>
        </div>
      </div>
    </div>
  )
}
