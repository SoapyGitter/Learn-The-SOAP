import { useState, useCallback } from 'react'

const USERS_KEY = 'lms_users'
const SESSION_KEY = 'lms_session'

// ── Storage helpers ───────────────────────────────────────

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (e) {
    console.warn('Failed to save users:', e)
  }
}

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null
  } catch {
    return null
  }
}

// Simple encoding — not real security, this is a client-only app
function encode(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

// ── Hook ─────────────────────────────────────────────────

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => loadSession())

  /**
   * Register a new user.
   * Returns { success: true } or { error: string }
   */
  const register = useCallback((username, password) => {
    const trimmed = username.trim()
    if (!trimmed) return { error: 'Username is required.' }
    if (trimmed.length < 3) return { error: 'Username must be at least 3 characters.' }
    if (!password) return { error: 'Password is required.' }
    if (password.length < 4) return { error: 'Password must be at least 4 characters.' }

    const key = trimmed.toLowerCase()
    const users = loadUsers()

    if (users[key]) return { error: 'Username already taken.' }

    users[key] = {
      username: trimmed,
      passwordHash: encode(password),
      createdAt: Date.now(),
    }

    saveUsers(users)
    localStorage.setItem(SESSION_KEY, key)
    setCurrentUser(key)
    return { success: true }
  }, [])

  /**
   * Log in an existing user.
   * Returns { success: true } or { error: string }
   */
  const login = useCallback((username, password) => {
    const key = username.trim().toLowerCase()
    if (!key) return { error: 'Username is required.' }
    if (!password) return { error: 'Password is required.' }

    const users = loadUsers()
    const user = users[key]

    if (!user) return { error: 'No account found with that username.' }
    if (user.passwordHash !== encode(password)) return { error: 'Incorrect password.' }

    localStorage.setItem(SESSION_KEY, key)
    setCurrentUser(key)
    return { success: true }
  }, [])

  /**
   * Log out the current user.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
  }, [])

  /**
   * Get display name for the current user.
   */
  const getDisplayName = useCallback(() => {
    if (!currentUser) return null
    const users = loadUsers()
    return users[currentUser]?.username ?? currentUser
  }, [currentUser])

  return { currentUser, register, login, logout, getDisplayName }
}
