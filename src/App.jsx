import React, { useState } from 'react'
import { Settings, RotateCcw, X, Zap } from 'lucide-react'
import Dashboard from './components/Dashboard'
import SubjectView from './components/SubjectView'
import { useProgress } from './hooks/useProgress'

// ── Dev Reset Modal ───────────────────────────────────────

function ResetModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card border border-red-800/40 p-6 w-full max-w-sm animate-slide-up">
        <button onClick={onCancel} className="absolute top-3 right-3 text-gray-600 hover:text-gray-400">
          <X size={16} />
        </button>
        <h3 className="text-base font-semibold text-white mb-1">Reset All Progress?</h3>
        <p className="text-sm text-gray-500 mb-5">
          This will erase all completed challenges and unlock states permanently.
        </p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="btn-danger flex-1">Yes, Reset Everything</button>
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Top Navigation Bar ────────────────────────────────────

function NavBar({ onGoHome, onShowReset, view }) {
  return (
    <nav className="sticky top-0 z-40 bg-midnight-900/95 backdrop-blur border-b border-surface-elevated">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group"
        >
          <div className="p-1.5 rounded-lg bg-neon/10 border border-neon/20 group-hover:bg-neon/15 transition-colors">
            <Zap size={14} className="text-neon" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            Learn<span className="text-neon">SOAP</span>
          </span>
        </button>

        {/* Breadcrumb */}
        {view !== 'dashboard' && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="hover:text-gray-300 cursor-pointer transition-colors"
              onClick={onGoHome}
            >
              Dashboard
            </span>
            <span>/</span>
            <span className="text-gray-300 capitalize">{view}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onShowReset}
            title="Reset progress (dev)"
            className="p-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-surface transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Unlock Toast ──────────────────────────────────────────

function UnlockToast({ message, onDismiss }) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3
                    bg-neon text-midnight-900 rounded-xl font-medium text-sm
                    shadow-neon animate-slide-up">
      <Zap size={16} className="shrink-0" />
      {message}
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  )
}

// ── App Root ──────────────────────────────────────────────

export default function App() {
  const progressHook = useProgress()
  const [view, setView] = useState('dashboard') // 'dashboard' | subjectId
  const [showReset, setShowReset] = useState(false)
  const [toast, setToast] = useState(null)

  // Wrap completeChallenge to show unlock toasts
  // Signature: (subjectId, levelId, challengeIndex, challengeId)
  const wrappedCompleteChallenge = (subjectId, levelId, challengeIndex, challengeId) => {
    const result = progressHook.completeChallenge(subjectId, levelId, challengeIndex, challengeId)
    if (result?.newLevelUnlocked) {
      const subject = progressHook.progress[subjectId]
      const newIdx = (subject?.currentLevelIndex ?? 1)
      setToast(`Level ${newIdx + 1} Unlocked! Keep going!`)
    }
    return result
  }

  const enrichedHook = {
    ...progressHook,
    completeChallenge: wrappedCompleteChallenge,
  }

  const handleReset = () => {
    progressHook.resetProgress()
    setShowReset(false)
    setView('dashboard')
  }

  return (
    <div className="min-h-screen bg-midnight-900">
      <NavBar
        onGoHome={() => setView('dashboard')}
        onShowReset={() => setShowReset(true)}
        view={view}
      />

      <main>
        {view === 'dashboard' ? (
          <Dashboard
            onSelectSubject={setView}
            progressHook={enrichedHook}
          />
        ) : (
          <SubjectView
            subjectId={view}
            onBack={() => setView('dashboard')}
            progressHook={enrichedHook}
          />
        )}
      </main>

      {showReset && (
        <ResetModal
          onConfirm={handleReset}
          onCancel={() => setShowReset(false)}
        />
      )}

      {toast && (
        <UnlockToast message={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}
