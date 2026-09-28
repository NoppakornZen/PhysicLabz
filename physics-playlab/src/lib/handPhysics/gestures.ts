// MediaPipe Hands landmark indices
// Reference: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
const WRIST = 0
const THUMB_TIP = 4
const INDEX_TIP = 8
const MIDDLE_TIP = 12
const MIDDLE_MCP = 9

export interface Landmark {
  x: number
  y: number
  z: number
}

export interface GestureResult {
  grabPointNormalized: { x: number; y: number } | null
  isGrabbing: boolean
  confidence: number
  handOpenness: number
}

function dist2D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// How extended the middle finger is (0 = curled, 1 = fully raised).
// Only the middle finger controls mass — thumb+index stay pinched for grab.
function computeHandOpenness(landmarks: Landmark[]): number {
  const handSize = dist2D(landmarks[WRIST], landmarks[MIDDLE_MCP])
  if (handSize === 0) return 0
  const tipToMcp = dist2D(landmarks[MIDDLE_TIP], landmarks[MIDDLE_MCP])
  // curled ≈ 0.2 × handSize, fully extended ≈ 0.9 × handSize
  return Math.max(0, Math.min(1, (tipToMcp / handSize - 0.2) / 0.7))
}

// Pinch thresholds as a fraction of hand size, with hysteresis: once
// grabbing, the fingers must open wider than GRAB_ON before releasing.
// This prevents single noisy frames near the boundary from causing the
// object to flicker in and out of the grabbed state.
const GRAB_ON = 0.24
const GRAB_OFF = 0.46

// Detect pinch: thumb tip and index tip distance relative to hand size.
// `wasGrabbing` applies hysteresis so borderline frames don't flicker.
function isPinching(landmarks: Landmark[], wasGrabbing: boolean): boolean {
  const thumbTip = landmarks[THUMB_TIP]
  const indexTip = landmarks[INDEX_TIP]

  // Hand size reference: distance from wrist to middle finger MCP
  const handSize = dist2D(landmarks[WRIST], landmarks[MIDDLE_MCP])
  if (handSize === 0) return false

  const pinchRatio = dist2D(thumbTip, indexTip) / handSize
  const threshold = wasGrabbing ? GRAB_OFF : GRAB_ON
  return pinchRatio < threshold
}

export function recognizeGesture(
  landmarks: Landmark[],
  confidence: number,
  wasGrabbing = false
): GestureResult {
  const thumbTip = landmarks[THUMB_TIP]
  const indexTip = landmarks[INDEX_TIP]

  const grabbing = isPinching(landmarks, wasGrabbing)

  // Grab point: midpoint between thumb and index tips
  const grabPoint = {
    x: (thumbTip.x + indexTip.x) / 2,
    y: (thumbTip.y + indexTip.y) / 2,
  }

  return {
    grabPointNormalized: grabPoint,
    isGrabbing: grabbing,
    confidence,
    handOpenness: computeHandOpenness(landmarks),
  }
}
