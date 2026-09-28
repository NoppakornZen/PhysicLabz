import { PhysicsObject } from './PhysicsObject'
import { PHYSICS_CONSTANTS } from './constants'

function spheresOverlap(a: PhysicsObject, b: PhysicsObject): boolean {
  const dx = a.position.x - b.position.x
  const dy = a.position.y - b.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist < a.radius + b.radius
}

// Resolve object-object collision using exact 1D elastic collision formula
// with coefficient of restitution e (energy loss model)
// Reference: Halliday & Resnick, Fundamentals of Physics, ch. 9
//   v1' = ((m1 - e*m2)*v1 + (1+e)*m2*v2) / (m1+m2)
//   v2' = ((m2 - e*m1)*v2 + (1+e)*m1*v1) / (m1+m2)
export function resolveObjectCollision(a: PhysicsObject, b: PhysicsObject): void {
  if (a.isGrabbed && b.isGrabbed) return

  const dx = b.position.x - a.position.x
  const dy = b.position.y - a.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const minDist = a.radius + b.radius

  if (dist >= minDist || dist === 0) return

  const nx = dx / dist
  const ny = dy / dist

  const dvx = a.velocity.x - b.velocity.x
  const dvy = a.velocity.y - b.velocity.y
  const dvDotN = dvx * nx + dvy * ny

  if (dvDotN < 0) return

  const m1 = a.isGrabbed ? Infinity : a.mass
  const m2 = b.isGrabbed ? Infinity : b.mass
  const e = PHYSICS_CONSTANTS.RESTITUTION

  const j = (1 + e) * dvDotN / (1 / m1 + 1 / m2)

  if (!a.isGrabbed) {
    a.velocity.x -= (j / m1) * nx
    a.velocity.y -= (j / m1) * ny
  }
  if (!b.isGrabbed) {
    b.velocity.x += (j / m2) * nx
    b.velocity.y += (j / m2) * ny
  }

  a.hitFlash = 1
  b.hitFlash = 1

  const overlap = minDist - dist
  if (!a.isGrabbed && !b.isGrabbed) {
    a.position.x -= (overlap / 2) * nx
    a.position.y -= (overlap / 2) * ny
    b.position.x += (overlap / 2) * nx
    b.position.y += (overlap / 2) * ny
  } else if (!a.isGrabbed) {
    a.position.x -= overlap * nx
    a.position.y -= overlap * ny
  } else if (!b.isGrabbed) {
    b.position.x += overlap * nx
    b.position.y += overlap * ny
  }
}

// Sphere vs axis-aligned box (wall / platform)
function resolveStaticBoxCollision(dyn: PhysicsObject, box: PhysicsObject): void {
  if (dyn.isGrabbed) return
  const hw = (box.dimensions.width ?? 0.5) / 2
  const hh = (box.dimensions.height ?? 0.5) / 2

  const cx = Math.max(box.position.x - hw, Math.min(box.position.x + hw, dyn.position.x))
  const cy = Math.max(box.position.y - hh, Math.min(box.position.y + hh, dyn.position.y))
  const dx = dyn.position.x - cx
  const dy = dyn.position.y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist >= dyn.radius || dist === 0) return

  const nx = dx / dist
  const ny = dy / dist

  dyn.position.x += nx * (dyn.radius - dist)
  dyn.position.y += ny * (dyn.radius - dist)

  const vDotN = dyn.velocity.x * nx + dyn.velocity.y * ny
  if (vDotN < 0) {
    const e = PHYSICS_CONSTANTS.RESTITUTION
    dyn.velocity.x -= (1 + e) * vDotN * nx
    dyn.velocity.y -= (1 + e) * vDotN * ny
  }

  dyn.hitFlash = 1
  box.hitFlash = 1
}

// Sphere vs oriented ramp (line-segment with thickness)
// Ramp surface is a box rotated by `ramp.angle`, treated as a capsule in 2D.
function resolveStaticRampCollision(dyn: PhysicsObject, ramp: PhysicsObject): void {
  if (dyn.isGrabbed) return
  const halfLen = (ramp.dimensions.width ?? 2.0) / 2
  const halfThick = (ramp.dimensions.height ?? 0.22) / 2
  const θ = ramp.angle
  const cosA = Math.cos(θ)
  const sinA = Math.sin(θ)

  const rx = dyn.position.x - ramp.position.x
  const ry = dyn.position.y - ramp.position.y

  // Project into ramp local space: x = along surface, y = perpendicular (positive = above)
  const localX = rx * cosA + ry * sinA
  const localY = -rx * sinA + ry * cosA

  const clampedX = Math.max(-halfLen, Math.min(halfLen, localX))
  const dLocalX = localX - clampedX
  const dLocalY = localY

  const dist = Math.sqrt(dLocalX * dLocalX + dLocalY * dLocalY)
  const minDist = halfThick + dyn.radius

  if (dist >= minDist || dist === 0) return

  // Normal in local space → world space
  const nLocalX = dLocalX / dist
  const nLocalY = dLocalY / dist
  const nx = nLocalX * cosA - nLocalY * sinA
  const ny = nLocalX * sinA + nLocalY * cosA

  dyn.position.x += nx * (minDist - dist)
  dyn.position.y += ny * (minDist - dist)

  const vDotN = dyn.velocity.x * nx + dyn.velocity.y * ny
  if (vDotN < 0) {
    const e = PHYSICS_CONSTANTS.RESTITUTION
    dyn.velocity.x -= (1 + e) * vDotN * nx
    dyn.velocity.y -= (1 + e) * vDotN * ny
  }

  dyn.hitFlash = 1
  ramp.hitFlash = 1
}

function resolveStaticObjectCollision(dyn: PhysicsObject, stat: PhysicsObject): void {
  if (stat.type === 'ramp') {
    resolveStaticRampCollision(dyn, stat)
  } else {
    resolveStaticBoxCollision(dyn, stat)
  }
}

export function resolveGroundCollision(obj: PhysicsObject, groundY: number): void {
  if (obj.isGrabbed) return

  const bottom = obj.position.y - obj.radius

  if (bottom <= groundY) {
    obj.position.y = groundY + obj.radius

    const e = PHYSICS_CONSTANTS.RESTITUTION
    const bounceThreshold = 0.15

    if (Math.abs(obj.velocity.y) < bounceThreshold) {
      obj.velocity.y = 0
      obj.isOnGround = true
    } else {
      obj.velocity.y = -obj.velocity.y * e
      obj.isOnGround = true
    }
  } else {
    obj.isOnGround = false
  }
}

export function resolveBoundaryCollision(obj: PhysicsObject, bounds: {
  minX: number
  maxX: number
  maxY: number
}): void {
  if (obj.isGrabbed) return

  const e = PHYSICS_CONSTANTS.RESTITUTION

  if (obj.position.x - obj.radius < bounds.minX) {
    obj.position.x = bounds.minX + obj.radius
    obj.velocity.x = Math.abs(obj.velocity.x) * e
  }

  if (obj.position.x + obj.radius > bounds.maxX) {
    obj.position.x = bounds.maxX - obj.radius
    obj.velocity.x = -Math.abs(obj.velocity.x) * e
  }

  if (obj.position.y + obj.radius > bounds.maxY) {
    obj.position.y = bounds.maxY - obj.radius
    if (obj.velocity.y > 0) obj.velocity.y = -obj.velocity.y * 0.3
  }
}

export function detectAndResolveAllCollisions(objects: PhysicsObject[]): void {
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i]
      const b = objects[j]

      if (a.isStatic && !b.isStatic) {
        resolveStaticObjectCollision(b, a)
      } else if (b.isStatic && !a.isStatic) {
        resolveStaticObjectCollision(a, b)
      } else if (!a.isStatic && !b.isStatic && spheresOverlap(a, b)) {
        resolveObjectCollision(a, b)
      }
      // static vs static: no interaction
    }
  }
}
