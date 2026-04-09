import React, { useState } from 'react'
import { Zap, User, Lock, AlertCircle, ArrowRight, UserPlus } from 'lucide-react'

export default function AuthPage({ onLogin, onRegister }) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result
    if (tab === 'login') {
      result = onLogin(username, password)
    } else {
      result = onRegister(username, password)
    }

    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  const switchTab = (t) => {
    setTab(t)
    setError('')
    setUsername('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-midnight-900 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-neon/10 border border-neon/20">
          <Zap size={20} className="text-neon" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">
          Learn<span className="text-neon">SOAP</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm card border border-surface-elevated p-6 animate-slide-up">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-midnight-900 border border-surface-elevated mb-6">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === 'login'
                ? 'bg-neon text-midnight-900'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === 'register'
                ? 'bg-neon text-midnight-900'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Register
          </button>
        </div>

        {/* Heading */}
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-white">
            {tab === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {tab === 'login'
              ? 'Sign in to continue your learning journey.'
              : 'Register to start mastering new skills.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="your_username"
                autoComplete="username"
                autoFocus
                className="input-field w-full pl-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="input-field w-full pl-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
              <AlertCircle size={13} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 mt-1"
          >
            {tab === 'login' ? (
              <><ArrowRight size={14} /> Sign In</>
            ) : (
              <><UserPlus size={14} /> Create Account</>
            )}
          </button>
        </form>

        {/* Switch hint */}
        <p className="text-xs text-gray-600 text-center mt-4">
          {tab === 'login' ? (
            <>No account?{' '}
              <button onClick={() => switchTab('register')} className="text-neon hover:underline">
                Register here
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => switchTab('login')} className="text-neon hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <p className="text-[11px] text-gray-700 mt-6">
        Progress is saved locally per account.
      </p>
    </div>
  )
}
