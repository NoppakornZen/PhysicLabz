import { ObjectType, Vector3D, OBJECT_PRESETS, PHYSICS_CONSTANTS } from './constants'

export class PhysicsObject {
  id: string
  type: ObjectType
  mass: number
  position: Vector3D
  velocity: Vector3D
  prevVelocity: Vector3D
  dimensions: { width?: number; height?: number; depth?: number; radius?: number }
  friction: number
  color: string
  isGrabbed: boolean
  isOnGround: boolean
  isStatic: boolean
  angle: number
  spawnTime: number
  hitFlash: number

  constructor(type: ObjectType, spawnPosition: Vector3D) {
    this.id = Math.random().toString(36).slice(2, 9)
    const preset = OBJECT_PRESETS[type]
    this.type = type
    this.mass = preset.mass
    this.position = { ...spawnPosition }
    this.velocity = { x: 0, y: 0, z: 0 }
    this.prevVelocity = { x: 0, y: 0, z: 0 }
    this.dimensions = { ...preset.dimensions }
    this.friction = preset.friction
    this.color = preset.color
    this.isGrabbed = false
    this.isOnGround = false
    this.isStatic = preset.isStatic
    this.angle = preset.angle
    this.spawnTime = Date.now()
    this.hitFlash = 0
  }

  // Effective radius for collision detection.
  // Spheres use exact radius. Boxes use inscribed radius (half of max dimension)
  // so the visual face aligns with the physics boundary on flat surfaces.
  get radius(): number {
    if (this.dimensions.radius !== undefined) return this.dimensions.radius
    const w = (this.dimensions.width ?? 0.5) / 2
    const h = (this.dimensions.height ?? 0.5) / 2
    return Math.max(w, h)
  }

  // Acceleration derived from velocity delta over DT
  get acceleration(): Vector3D {
    const dt = PHYSICS_CONSTANTS.DT
    return {
      x: (this.velocity.x - this.prevVelocity.x) / dt,
      y: (this.velocity.y - this.prevVelocity.y) / dt,
      z: (this.velocity.z - this.prevVelocity.z) / dt,
    }
  }

  // Net force = ma (Newton's 2nd law, exact)
  get force(): Vector3D {
    const a = this.acceleration
    return {
      x: this.mass * a.x,
      y: this.mass * a.y,
      z: this.mass * a.z,
    }
  }

  // Speed magnitude |v|
  get speed(): number {
    const { x, y, z } = this.velocity
    return Math.sqrt(x * x + y * y + z * z)
  }

  // Net force magnitude |F|
  get forceMagnitude(): number {
    const { x, y, z } = this.force
    return Math.sqrt(x * x + y * y + z * z)
  }

  // Acceleration magnitude |a|
  get accelerationMagnitude(): number {
    const { x, y, z } = this.acceleration
    return Math.sqrt(x * x + y * y + z * z)
  }

  // Half-extents for AABB (same for all axes)
  get halfExtent(): number {
    return this.radius
  }
}
