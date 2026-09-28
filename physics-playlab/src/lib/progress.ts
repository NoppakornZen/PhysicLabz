// ===== PROGRESS SYSTEM (localStorage) =====
'use client'

export interface IslandProgress {
  learnDone: boolean
  labDone: boolean
  quizScore: number // -1 = not attempted
  flagPlanted: boolean
}

export interface UserProgress {
  userName: string
  islandProgress: Record<string, IslandProgress>
}

const STORAGE_KEY = 'physics_playlab_progress'

const DEFAULT_ISLAND_PROGRESS: IslandProgress = {
  learnDone: false,
  labDone: false,
  quizScore: -1,
  flagPlanted: false,
}

const SUB_ISLAND_IDS = [
  'horizontal-motion',
  'vertical-motion',
  'projectile-motion',
  'newton-1',
  'newton-2',
  'newton-3',
]

export function initProgress(userName: string): UserProgress {
  const progress: UserProgress = {
    userName,
    islandProgress: Object.fromEntries(
      SUB_ISLAND_IDS.map(id => [id, { ...DEFAULT_ISLAND_PROGRESS }])
    ),
  }
  saveProgress(progress)
  return progress
}

export function getProgress(): UserProgress | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProgress
  } catch {
    return null
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function updateIslandProgress(
  islandId: string,
  update: Partial<IslandProgress>
): void {
  const progress = getProgress()
  if (!progress) return
  progress.islandProgress[islandId] = {
    ...(progress.islandProgress[islandId] || DEFAULT_ISLAND_PROGRESS),
    ...update,
  }
  // Auto-plant flag if score >= 5 (1+ stars)
  if (update.quizScore !== undefined && update.quizScore >= 5) {
    progress.islandProgress[islandId].flagPlanted = true
  }
  saveProgress(progress)
}

export function getUserName(): string {
  const progress = getProgress()
  return progress?.userName ?? 'นักเรียน'
}

export function isIslandUnlocked(islandId: string): boolean {
  const progress = getProgress()
  if (!progress) return false

  // Straight Motion islands
  const unlockMap: Record<string, string | null> = {
    'horizontal-motion': null, // always unlocked
    'vertical-motion': 'horizontal-motion',
    'projectile-motion': 'vertical-motion',
    'newton-1': null, // always unlocked
    'newton-2': 'newton-1',
    'newton-3': 'newton-2',
  }

  const requires = unlockMap[islandId]
  if (requires === null) return true

  const requiredProgress = progress.islandProgress[requires]
  return requiredProgress?.flagPlanted === true
}

export function getIslandStatus(islandId: string): 'locked' | 'available' | 'in-progress' | 'completed' {
  const progress = getProgress()
  if (!progress) return 'locked'

  if (!isIslandUnlocked(islandId)) return 'locked'

  const ip = progress.islandProgress[islandId]
  if (!ip) return 'available'

  if (ip.flagPlanted) return 'completed'
  if (ip.learnDone || ip.labDone || ip.quizScore >= 0) return 'in-progress'

  return 'available'
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getUnlockSeen(): string[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('pp_unlock_seen') || '[]')
}

export function markUnlockSeen(islandId: string): void {
  const seen = getUnlockSeen()
  if (!seen.includes(islandId))
    localStorage.setItem('pp_unlock_seen', JSON.stringify([...seen, islandId]))
}
