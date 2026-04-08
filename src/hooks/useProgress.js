import { useState, useEffect, useCallback } from 'react'
import { SUBJECTS } from '../data/curriculum'

/**
 * STORAGE KEY bumped to v2 — incompatible shape change.
 *
 * State shape:
 * {
 *   [subjectId]: {
 *     currentLevelIndex: number,          // which level the user is actively working on
 *     levels: {
 *       [levelId]: {
 *         theoryRead:             boolean, // has scrolled + clicked "I Understand"
 *         highestCompletedIndex:  number,  // index of last solved challenge (-1 = none)
 *         completedIds:           string[] // set of completed IDs (for idempotency)
 *       }
 *     }
 *   }
 * }
 *
 * Derived values (not stored, computed on read):
 *   highestUnlockedIndex = theoryRead ? highestCompletedIndex + 1 : -1
 *
 * Challenge status for index i:
 *   COMPLETED → i <= highestCompletedIndex
 *   CURRENT   → i === highestCompletedIndex + 1  AND  theoryRead
 *   LOCKED    → everything else
 */

const STORAGE_KEY = 'lms_progress_v2'

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

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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
    // Ensure levels map exists
    if (!saved[subjectId].levels) {
      saved[subjectId].levels = {}
    }
    // Backfill any new levels added to curriculum later
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

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    const saved = loadFromStorage()
    return saved ? mergeWithDefaults(saved) : buildInitialState()
  })

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (e) {
      console.warn('Progress save failed:', e)
    }
  }, [progress])

  // ── Getters ─────────────────────────────────────────────

  /** Raw level state */
  const getLevelState = useCallback((subjectId, levelId) => {
    return progress[subjectId]?.levels?.[levelId] ?? buildInitialLevelState()
  }, [progress])

  /**
   * Has the user read the theory for this level?
   */
  const isTheoryRead = useCallback((subjectId, levelId) => {
    return getLevelState(subjectId, levelId).theoryRead
  }, [getLevelState])

  /**
   * Highest challenge INDEX the user can access (0-based).
   * -1  → theory not yet read (no challenges accessible)
   *  N  → challenges 0..N are accessible; N is the active unsolved one
   */
  const getHighestUnlockedIndex = useCallback((subjectId, levelId) => {
    const ls = getLevelState(subjectId, levelId)
    if (!ls.theoryRead) return -1
    return ls.highestCompletedIndex + 1
  }, [getLevelState])

  /**
   * 'completed' | 'current' | 'locked'
   */
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

  /** { completed, required, pct } */
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

  /**
   * Mark theory as read → unlocks challenge 0.
   */
  const markTheoryRead = useCallback((subjectId, levelId) => {
    setProgress(prev => {
      const ls = prev[subjectId]?.levels?.[levelId]
      if (!ls || ls.theoryRead) return prev  // already read
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

  /**
   * Complete a challenge.
   * challengeIndex MUST equal highestCompletedIndex + 1 (the current active challenge).
   * Silently ignores out-of-order attempts.
   * Returns { alreadyDone, newLevelUnlocked }
   */
  const completeChallenge = useCallback((subjectId, levelId, challengeIndex, challengeId) => {
    let alreadyDone = false
    let newLevelUnlocked = false

    setProgress(prev => {
      const subState = prev[subjectId]
      if (!subState) return prev

      const ls = subState.levels?.[levelId]
      if (!ls) return prev

      // Idempotent
      if (ls.completedIds.includes(challengeId)) {
        alreadyDone = true
        return prev
      }

      // Strictly sequential — only the CURRENT challenge can be solved
      const expectedIndex = ls.highestCompletedIndex + 1
      if (challengeIndex !== expectedIndex) return prev

      const newHighest = challengeIndex
      const newCompletedIds = [...ls.completedIds, challengeId]

      // Check if the whole level is now done (unlocks next level)
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

  /**
   * Hard reset everything.
   */
  const resetProgress = useCallback(() => {
    const fresh = buildInitialState()
    setProgress(fresh)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const resetSubject = useCallback((subjectId) => {
    setProgress(prev => ({
      ...prev,
      [subjectId]: buildInitialState()[subjectId],
    }))
  }, [])

  return {
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
