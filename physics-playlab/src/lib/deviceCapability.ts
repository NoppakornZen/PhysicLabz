export type QualityTier = 'high' | 'medium' | 'low'

export interface DevicePerformanceProfile {
  tier: QualityTier
  cameraWidth: number
  cameraHeight: number
  inferenceFrameInterval: number
  renderFps: number
  maxPixelRatio: number
  sphereSegments: number
  handSegments: number
  ringSegments: number
  trailLength: number
  trajectoryPoints: number
  uiUpdateIntervalMs: number
}

type NavigatorWithDeviceMemory = Navigator & { deviceMemory?: number }

const PROFILES: Record<QualityTier, DevicePerformanceProfile> = {
  high: {
    tier: 'high',
    cameraWidth: 640,
    cameraHeight: 480,
    inferenceFrameInterval: 1,
    renderFps: 60,
    maxPixelRatio: 2,
    sphereSegments: 32,
    handSegments: 20,
    ringSegments: 32,
    trailLength: 48,
    trajectoryPoints: 30,
    uiUpdateIntervalMs: 100,
  },
  medium: {
    tier: 'medium',
    cameraWidth: 320,
    cameraHeight: 240,
    inferenceFrameInterval: 2,
    renderFps: 30,
    maxPixelRatio: 1,
    sphereSegments: 20,
    handSegments: 16,
    ringSegments: 24,
    trailLength: 24,
    trajectoryPoints: 15,
    uiUpdateIntervalMs: 100,
  },
  low: {
    tier: 'low',
    cameraWidth: 256,
    cameraHeight: 192,
    inferenceFrameInterval: 3,
    renderFps: 24,
    maxPixelRatio: 1,
    sphereSegments: 16,
    handSegments: 12,
    ringSegments: 20,
    trailLength: 18,
    trajectoryPoints: 12,
    uiUpdateIntervalMs: 150,
  },
}

let cachedProfile: DevicePerformanceProfile | null = null

function getQualityOverride(): QualityTier | null {
  const value = new URLSearchParams(window.location.search).get('quality')
  return value === 'high' || value === 'medium' || value === 'low' ? value : null
}

export function getDevicePerformanceProfile(): DevicePerformanceProfile {
  if (cachedProfile) return cachedProfile
  if (typeof window === 'undefined') return PROFILES.medium

  const override = getQualityOverride()
  if (override) {
    cachedProfile = PROFILES[override]
    return cachedProfile
  }

  const nav = navigator as NavigatorWithDeviceMemory
  const memory = nav.deviceMemory
  const cores = navigator.hardwareConcurrency || 4
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const compactViewport = Math.min(window.innerWidth, window.innerHeight) < 900
  const mobileLike = coarsePointer || compactViewport
  const pixelLoad = window.innerWidth * window.innerHeight * Math.min(window.devicePixelRatio || 1, 2) ** 2

  let tier: QualityTier = 'high'
  if (
    mobileLike &&
    ((memory !== undefined && memory <= 4) || cores <= 4 || pixelLoad > 4_000_000)
  ) {
    tier = 'low'
  } else if (mobileLike || (memory !== undefined && memory <= 6) || cores <= 6) {
    tier = 'medium'
  }

  cachedProfile = PROFILES[tier]
  return cachedProfile
}
