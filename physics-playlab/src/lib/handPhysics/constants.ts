// Physics constants for hand tracking sandbox

export const PHYSICS_CONSTANTS = {
  // Gravity (m/s²) - Earth standard
  GRAVITY: 9.8,

  // Time step for physics simulation (60 Hz)
  DT: 1 / 60,

  // Coefficient of restitution (bounciness)
  RESTITUTION: 0.7,

  // Friction coefficients
  FRICTION_BOX: 0.3,  // Wood on wood
  FRICTION_BALL: 0.0,  // No friction for sphere

  // Simulation bounds (meters)
  BOUNDS: {
    width: 10,
    height: 8,
    depth: 10
  },

  // Object limits
  MAX_OBJECTS: 3
} as const

// Object type definitions
export type ObjectType = 'friction-box' | 'ball' | 'projectile' | 'wall' | 'platform' | 'ramp'

export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface PhysicsObjectData {
  id: string
  type: ObjectType
  mass: number
  position: Vector3D
  velocity: Vector3D
  acceleration: Vector3D
  dimensions: {
    width?: number
    height?: number
    depth?: number
    radius?: number
  }
  friction: number
  color: string
  isGrabbed: boolean
  isStatic: boolean
  angle: number
  hitFlash: number
}

// Object presets matching the 3 physics concepts
export const OBJECT_PRESETS: Record<ObjectType, Omit<PhysicsObjectData, 'id' | 'position' | 'velocity' | 'acceleration' | 'isGrabbed'>> = {
  'friction-box': {
    type: 'friction-box',
    mass: 2.0,
    dimensions: { width: 0.5, height: 0.5, depth: 0.5 },
    friction: PHYSICS_CONSTANTS.FRICTION_BOX,
    color: '#ff9800',
    isStatic: false,
    angle: 0,
    hitFlash: 0,
  },
  'ball': {
    type: 'ball',
    mass: 0.5,
    dimensions: { radius: 0.3 },
    friction: 0,
    color: '#4caf50',
    isStatic: false,
    angle: 0,
    hitFlash: 0,
  },
  'projectile': {
    type: 'projectile',
    mass: 1.0,
    dimensions: { radius: 0.2 },
    friction: 0,
    color: '#2196f3',
    isStatic: false,
    angle: 0,
    hitFlash: 0,
  },
  'wall': {
    type: 'wall',
    mass: 1,
    dimensions: { width: 0.3, height: 2.2 },
    friction: 0.4,
    color: '#607d8b',
    isStatic: true,
    angle: 0,
    hitFlash: 0,
  },
  'platform': {
    type: 'platform',
    mass: 1,
    dimensions: { width: 2.2, height: 0.22 },
    friction: 0.3,
    color: '#607d8b',
    isStatic: true,
    angle: 0,
    hitFlash: 0,
  },
  'ramp': {
    type: 'ramp',
    mass: 1,
    dimensions: { width: 2.2, height: 0.22 },
    friction: 0.25,
    color: '#607d8b',
    isStatic: true,
    angle: Math.PI / 6,
    hitFlash: 0,
  },
}
