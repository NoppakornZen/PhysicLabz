// ===== PHYSICS ENGINE — Deterministic, formula-based =====
// Fixed timestep: 1/60s
// All calculations use exact physics formulas, no approximation

export const GRAVITY = 9.8 // m/s²
export const DT = 1 / 60 // fixed timestep

// ===== KINEMATICS =====

export interface KinematicsResult {
  v: number      // final velocity (m/s)
  s: number      // displacement (m)
  time: number   // time (s)
}

/** v = u + at */
export function calcFinalVelocity(u: number, a: number, t: number): number {
  return u + a * t
}

/** s = ut + 0.5*a*t² */
export function calcDisplacement(u: number, a: number, t: number): number {
  return u * t + 0.5 * a * t * t
}

/** v² = u² + 2as → v */
export function calcVelocityFromDistance(u: number, a: number, s: number): number {
  const v2 = u * u + 2 * a * s
  return v2 >= 0 ? Math.sqrt(v2) : 0
}

/** Time to stop: t = (0 - u) / a */
export function calcTimeToStop(u: number, a: number): number {
  if (a === 0) return Infinity
  const t = -u / a
  return t > 0 ? t : 0
}

// ===== VERTICAL MOTION =====

/** h_max = u²/(2g) */
export function calcMaxHeight(u: number): number {
  return (u * u) / (2 * GRAVITY)
}

/** Time to reach max height: t = u/g */
export function calcTimeToMaxHeight(u: number): number {
  return u / GRAVITY
}

/** Total flight time (thrown up): T = 2u/g */
export function calcTotalFlightTime(u: number): number {
  return (2 * u) / GRAVITY
}

/** Free fall velocity after time t: v = g*t */
export function calcFreeFallVelocity(t: number): number {
  return GRAVITY * t
}

/** Free fall distance: h = 0.5*g*t² */
export function calcFreeFallDistance(t: number): number {
  return 0.5 * GRAVITY * t * t
}

// ===== PROJECTILE MOTION =====

export interface ProjectileState {
  x: number
  y: number
  vx: number
  vy: number
  t: number
}

export function initProjectile(v0: number, angleDeg: number): ProjectileState {
  const angle = (angleDeg * Math.PI) / 180
  return {
    x: 0,
    y: 0,
    vx: v0 * Math.cos(angle),
    vy: v0 * Math.sin(angle),
    t: 0,
  }
}

/** Step projectile simulation by dt */
export function stepProjectile(state: ProjectileState, dt: number): ProjectileState {
  const newVy = state.vy - GRAVITY * dt
  return {
    x: state.x + state.vx * dt,
    y: state.y + state.vy * dt - 0.5 * GRAVITY * dt * dt,
    vx: state.vx,
    vy: newVy,
    t: state.t + dt,
  }
}

/** Analytical: projectile position at time t */
export function projectileAt(v0: number, angleDeg: number, t: number): { x: number; y: number } {
  const angle = (angleDeg * Math.PI) / 180
  const vx = v0 * Math.cos(angle)
  const vy = v0 * Math.sin(angle)
  return {
    x: vx * t,
    y: vy * t - 0.5 * GRAVITY * t * t,
  }
}

/** Range: R = v0²·sin(2θ)/g */
export function calcRange(v0: number, angleDeg: number): number {
  const angle = (angleDeg * Math.PI) / 180
  return (v0 * v0 * Math.sin(2 * angle)) / GRAVITY
}

/** Max height of projectile: h = (v0·sinθ)²/(2g) */
export function calcProjectileMaxHeight(v0: number, angleDeg: number): number {
  const angle = (angleDeg * Math.PI) / 180
  const vy0 = v0 * Math.sin(angle)
  return (vy0 * vy0) / (2 * GRAVITY)
}

/** Time of flight: T = 2v0·sinθ/g */
export function calcTimeOfFlight(v0: number, angleDeg: number): number {
  const angle = (angleDeg * Math.PI) / 180
  return (2 * v0 * Math.sin(angle)) / GRAVITY
}

// ===== NEWTON'S LAWS =====

/** F = ma → a */
export function calcAcceleration(netForce: number, mass: number): number {
  if (mass <= 0) return 0
  return netForce / mass
}

/** Newton's 3rd: reaction force */
export function calcReactionForce(actionForce: number): number {
  return -actionForce
}

// ===== 1D SIMULATION STATE =====
export interface SimState1D {
  x: number    // position (m)
  v: number    // velocity (m/s)
  a: number    // acceleration (m/s²)
  t: number    // elapsed time (s)
}

/** Euler integration step for 1D */
export function step1D(state: SimState1D, dt: number): SimState1D {
  return {
    x: state.x + state.v * dt + 0.5 * state.a * dt * dt,
    v: state.v + state.a * dt,
    a: state.a,
    t: state.t + dt,
  }
}

/** Build full trajectory array for horizontal motion */
export function buildHorizontalTrajectory(
  u: number,
  a: number,
  totalTime: number
): SimState1D[] {
  const steps: SimState1D[] = []
  let state: SimState1D = { x: 0, v: u, a, t: 0 }
  const numSteps = Math.ceil(totalTime / DT)
  for (let i = 0; i <= numSteps; i++) {
    steps.push({ ...state })
    state = step1D(state, DT)
    // Stop if velocity reverses direction (from positive to negative) due to deceleration
    if (a < 0 && state.v <= 0 && u > 0) {
      state.v = 0
      state.a = 0
      steps.push({ ...state })
      break
    }
  }
  return steps
}

/** Build full trajectory for projectile */
export function buildProjectileTrajectory(
  v0: number,
  angleDeg: number
): ProjectileState[] {
  const steps: ProjectileState[] = []
  let state = initProjectile(v0, angleDeg)
  const maxTime = calcTimeOfFlight(v0, angleDeg)
  const numSteps = Math.ceil(maxTime / DT)
  for (let i = 0; i <= numSteps; i++) {
    steps.push({ ...state })
    state = stepProjectile(state, DT)
    if (state.y < -0.01) break
  }
  return steps
}
