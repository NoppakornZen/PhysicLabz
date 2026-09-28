import { PhysicsObject } from './PhysicsObject'
import { PhysicsObjectData, ObjectType, PHYSICS_CONSTANTS } from './constants'
import {
  detectAndResolveAllCollisions,
  resolveGroundCollision,
  resolveBoundaryCollision,
} from './collisions'

export const GROUND_Y = -3.5

// Default bounds before the viewport size is known — overwritten by
// updateBounds() as soon as Scene3D measures the actual view frustum.
export const BOUNDS = { minX: -4.8, maxX: 4.8, maxY: 4.5 }

export class PhysicsWorld {
  objects: PhysicsObject[] = []
  gravity: number = PHYSICS_CONSTANTS.GRAVITY
  // Dynamic play-area walls — kept in sync with the actual camera viewport
  // so objects bounce at the screen edge instead of a fixed world size.
  bounds = { ...BOUNDS }

  // Called by Scene3D whenever the viewport/aspect ratio changes, so
  // objects bounce at the actual screen edge instead of a fixed world size.
  updateBounds(viewW: number, viewH: number): void {
    const margin = 0.12
    this.bounds = {
      minX: -viewW / 2 + margin,
      maxX: viewW / 2 - margin,
      maxY: viewH / 2 - margin,
    }
  }

  // Spawn a new object at a given position
  spawnObject(type: ObjectType, x = 0, y = 2): PhysicsObject {
    const obj = new PhysicsObject(type, { x, y, z: 0 })
    this.objects.push(obj)
    return obj
  }

  removeObject(id: string): void {
    this.objects = this.objects.filter(o => o.id !== id)
  }

  removeAll(): void {
    this.objects = []
  }

  // Main simulation step — called at 60 Hz
  // Uses semi-implicit Euler integration (velocity first, then position)
  // This conserves energy better than explicit Euler for oscillatory systems
  step(): void {
    const dt = PHYSICS_CONSTANTS.DT

    for (const obj of this.objects) {
      obj.prevVelocity = { ...obj.velocity }
      obj.hitFlash = Math.max(0, obj.hitFlash * 0.82)

      if (obj.isGrabbed || obj.isStatic) continue

      // 1. Apply gravity: dv/dt = g downward — F = mg (Newton's 2nd law)
      obj.velocity.y -= this.gravity * dt

      // 2. Apply kinetic friction when sliding on ground (Coulomb model)
      //    F_friction = μ * N = μ * m * g (when N = mg on flat ground)
      //    a_friction = μ * g  opposing motion
      if (obj.isOnGround && obj.friction > 0) {
        const frictionDecel = obj.friction * this.gravity * dt
        if (Math.abs(obj.velocity.x) <= frictionDecel) {
          obj.velocity.x = 0
        } else {
          obj.velocity.x -= Math.sign(obj.velocity.x) * frictionDecel
        }
        obj.velocity.z *= 0.8
      }

      // 3. Integrate position: s = s0 + v*dt
      obj.position.x += obj.velocity.x * dt
      obj.position.y += obj.velocity.y * dt
      obj.position.z += obj.velocity.z * dt
    }

    // 4. Collision detection and resolution
    detectAndResolveAllCollisions(this.objects)

    for (const obj of this.objects) {
      if (!obj.isGrabbed && !obj.isStatic) {
        resolveGroundCollision(obj, GROUND_Y)
        resolveBoundaryCollision(obj, this.bounds)
      }
    }
  }

  // Move a grabbed object to a target position (hand following)
  grabObject(id: string): void {
    const obj = this.objects.find(o => o.id === id)
    if (obj) {
      obj.isGrabbed = true
      obj.velocity = { x: 0, y: 0, z: 0 }
    }
  }

  moveGrabbedObject(id: string, x: number, y: number, vx: number, vy: number): void {
    const obj = this.objects.find(o => o.id === id)
    if (obj && obj.isGrabbed) {
      obj.prevVelocity = { ...obj.velocity }
      obj.position.x = x
      obj.position.y = y
      obj.position.z = 0
      obj.velocity.x = vx
      obj.velocity.y = vy
    }
  }

  releaseObject(id: string, vx: number, vy: number): void {
    const obj = this.objects.find(o => o.id === id)
    if (obj) {
      obj.isGrabbed = false
      // Static objects stay frozen — no throw velocity applied
      if (!obj.isStatic) {
        obj.velocity.x = vx
        obj.velocity.y = vy
      }
    }
  }

  // Find the nearest object to a given world position within grab range
  findNearestInRange(x: number, y: number, maxDist: number): PhysicsObject | null {
    let nearest: PhysicsObject | null = null
    let minDist = maxDist

    for (const obj of this.objects) {
      const dx = obj.position.x - x
      const dy = obj.position.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < minDist) {
        minDist = dist
        nearest = obj
      }
    }

    return nearest
  }

  // Serialize object states for rendering
  getSnapshot(): PhysicsObjectData[] {
    return this.objects.map(obj => ({
      id: obj.id,
      type: obj.type,
      mass: obj.mass,
      position: { ...obj.position },
      velocity: { ...obj.velocity },
      acceleration: { ...obj.acceleration },
      dimensions: { ...obj.dimensions },
      friction: obj.friction,
      color: obj.color,
      isGrabbed: obj.isGrabbed,
      isStatic: obj.isStatic,
      angle: obj.angle,
      hitFlash: obj.hitFlash,
    }))
  }
}
