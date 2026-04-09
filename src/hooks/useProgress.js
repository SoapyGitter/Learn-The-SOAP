import { useState, useEffect, useCallback } from 'react'
import { SUBJECTS } from '../data/curriculum'

/**
 * Progress is stored per-user. The storage key is:
 *   lms_progress_v2_<userId>   (when a user is logged in)
 *   lms_progress_v2            (legacy fallback)
 *
 * State shape:
 * {
 *   [subjectId]: {
 *     currentLevelIndex: number,
 *     levels: {
 *       [levelId]: {
 *         theoryRead:             boolean,
 *         highestCompletedIndex:  number,
 *         completedIds:           string[]
 *       }
 *     }
 *   }
 * }
 */

function storageKey(userId) {
  return userId ? `lms_progress_v2_${userId}` : 'lms_progress_v2'
}

// ── Initial state builder ─────────────────────────────────

function buildInitialLevelState() {
  return {
    theoryRead: false,
    highestCompletedIndex: -1,
    completedIds: [],
  }
}

function buildInitialState() {
  const state = {}
  for (const subject of SUBJECTS) {
    state[subject.id] = {
      currentLevelIndex: 0,
      levels: {},
    }
    for (const level of subject.levels) {
      state[subject.id].levels[level.id] = buildInitialLevelState()
    }
  }
  return state
}

// ── Storage helpers ───────────────────────────────────────

function loadFromStorage(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function mergeWithDefaults(saved) {
  const defaults = buildInitialState()
  for (const subjectId of Object.keys(defaults)) {
    if (!saved[subjectId]) {
      saved[subjectId] = defaults[subjectId]
      continue
    }
    if (!saved[subjectId].levels) {
      saved[subjectId].levels = {}
    }
    const subject = SUBJECTS.find(s => s.id === subjectId)
    for (const level of subject.levels) {
      if (!saved[subjectId].levels[level.id]) {
        saved[subjectId].levels[level.id] = buildInitialLevelState()
      }
    }
  }
  return saved
}

// ── Hook ─────────────────────────────────────────────────

export function useProgress(userId) {
  const [progress, setProgress] = useState(() => {
    const saved = loadFromStorage(userId)
    return saved ? mergeWithDefaults(saved) : buildInitialState()
  })

  // Reload when the logged-in user changes
  useEffect(() => {
    const saved = loadFromStorage(userId)
    setProgress(saved ? mergeWithDefaults(saved) : buildInitialState())
  }, [userId])

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(progress))
    } catch (e) {
      console.warn('Progress save failed:', e)
    }
  }, [progress, userId])

  // ── Getters ─────────────────────────────────────────────

  const getLevelState = useCallback((subjectId, levelId) => {
    return progress[subjectId]?.levels?.[levelId] ?? buildInitialLevelState()
  }, [progress])

  const isTheoryRead = useCallback((subjectId, levelId) => {
    return getLevelState(subjectId, levelId).theoryRead
  }, [getLevelState])

  const getHighestUnlockedIndex = useCallback((subjectId, levelId) => {
    const ls = getLevelState(subjectId, levelId)
    if (!ls.theoryRead) return -1
    return ls.highestCompletedIndex + 1
  }, [getLevelState])

  const getChallengeStatus = useCallback((subjectId, levelId, challengeIndex) => {
    const ls = getLevelState(subjectId, levelId)
    if (!ls.theoryRead) return 'locked'
    if (challengeIndex <= ls.highestCompletedIndex) return 'completed'
    if (challengeIndex === ls.highestCompletedIndex + 1) return 'current'
    return 'locked'
  }, [getLevelState])

  const isChallengeCompleted = useCallback((subjectId, levelId, challengeId) => {
    return getLevelState(subjectId, levelId).completedIds.includes(challengeId)
  }, [getLevelState])

  const getLevelProgress = useCallback((subjectId, levelId) => {
    const subject = SUBJECTS.find(s => s.id === subjectId)
    if (!subject) return { completed: 0, required: 0, pct: 0 }
    const level = subject.levels.find(l => l.id === levelId)
    if (!level) return { completed: 0, required: 0, pct: 0 }
    const ls = getLevelState(subjectId, levelId)
    const completed = ls.completedIds.length
    const required = level.requiredToPass
    const pct = Math.min(100, Math.round((completed / required) * 100))
    return { completed, required, pct }
  }, [getLevelState])

  const getCurrentLevelIndex = useCallback((subjectId) => {
    return progress[subjectId]?.currentLevelIndex ?? 0
  }, [progress])

  const isLevelUnlocked = useCallback((subjectId, levelIndex) => {
    return levelIndex <= (progress[subjectId]?.currentLevelIndex ?? 0)
  }, [progress])

  const getTotalCompleted = useCallback((subjectId) => {
    const subState = progress[subjectId]
    if (!subState) return 0
    return Object.values(subState.levels).reduce(
      (sum, ls) => sum + (ls.completedIds?.length ?? 0), 0
    )
  }, [progress])

  // ── Mutators ─────────────────────────────────────────────

  const markTheoryRead = useCallback((subjectId, levelId) => {
    setProgress(prev => {
      const ls = prev[subjectId]?.levels?.[levelId]
      if (!ls || ls.theoryRead) return prev
      return {
        ...prev,
        [subjectId]: {
          ...prev[subjectId],
          levels: {
            ...prev[subjectId].levels,
            [levelId]: { ...ls, theoryRead: true },
          },
        },
      }
    })
  }, [])

  const completeChallenge = useCallback((subjectId, levelId, challengeIndex, challengeId) => {
    let alreadyDone = false
    let newLevelUnlocked = false

    setProgress(prev => {
      const subState = prev[subjectId]
      if (!subState) return prev

      const ls = subState.levels?.[levelId]
      if (!ls) return prev

      if (ls.completedIds.includes(challengeId)) {
        alreadyDone = true
        return prev
      }

      const expectedIndex = ls.highestCompletedIndex + 1
      if (challengeIndex !== expectedIndex) return prev

      const newHighest = challengeIndex
      const newCompletedIds = [...ls.completedIds, challengeId]

      const subject = SUBJECTS.find(s => s.id === subjectId)
      const level = subject?.levels.find(l => l.id === levelId)
      const levelIndex = subject?.levels.findIndex(l => l.id === levelId) ?? -1
      let newCurrentLevelIndex = subState.currentLevelIndex

      if (
        newCompletedIds.length >= (level?.requiredToPass ?? Infinity) &&
        levelIndex === subState.currentLevelIndex &&
        levelIndex < subject.levels.length - 1
      ) {
        newCurrentLevelIndex = levelIndex + 1
        newLevelUnlocked = true
      }

      return {
        ...prev,
        [subjectId]: {
          ...subState,
          currentLevelIndex: newCurrentLevelIndex,
          levels: {
            ...subState.levels,
            [levelId]: {
              ...ls,
              highestCompletedIndex: newHighest,
              completedIds: newCompletedIds,
            },
          },
        },
      }
    })

    return { alreadyDone, newLevelUnlocked }
  }, [])

  const resetProgress = useCallback(() => {
    const fresh = buildInitialState()
    setProgress(fresh)
    localStorage.removeItem(storageKey(userId))
  }, [userId])

  const resetSubject = useCallback((subjectId) => {
    setProgress(prev => ({
      ...prev,
      [subjectId]: buildInitialState()[subjectId],
    }))
  }, [])

  return {
    // expose raw progress (used in App.jsx for toast level index)
    progress,
    // getters
    isTheoryRead,
    getHighestUnlockedIndex,
    getChallengeStatus,
    isChallengeCompleted,
    getLevelProgress,
    getCurrentLevelIndex,
    isLevelUnlocked,
    getTotalCompleted,
    getLevelState,
    // mutators
    markTheoryRead,
    completeChallenge,
    resetProgress,
    resetSubject,
  }
}
