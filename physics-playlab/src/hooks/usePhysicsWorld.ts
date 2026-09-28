'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { PhysicsWorld } from '@/lib/handPhysics/PhysicsWorld'
import { ObjectType, PhysicsObjectData, PHYSICS_CONSTANTS } from '@/lib/handPhysics/constants'
import { getDevicePerformanceProfile } from '@/lib/deviceCapability'
import { HandState } from './useHandTracking'

// Consecutive non-grabbing frames required before releasing a held object.
const RELEASE_FRAMES = 10

// Consecutive hand-absent frames required before dropping a held object.
// Prevents brief sensor dropouts (fast motion, occlusion) from dropping the object.
const HAND_LOST_FRAMES = 15

// Constant-density mass scaling: m ∝ r³, so r ∝ m^(1/3).
// Caps absolute mass at MAX_MASS_KG so objects don't grow unbounded across grabs.
const MAX_MASS_KG = 80
type GrabBase = { mass: number; radius?: number; width?: number; height?: number }

function applyMassScale(
  world: PhysicsWorld,
  id: string,
  openness: number,
  bases: Map<string, GrabBase>
): void {
  const base = bases.get(id)
  if (!base) return
  const obj = world.objects.find(o => o.id === id)
  if (!obj) return

  // openness 0→ no change, 1→ 6× base mass (captured at this grab's start)
  const multiplier = 1 + 5 * openness
  const targetMass = Math.min(MAX_MASS_KG, base.mass * multiplier)
  const dimScale = Math.cbrt(targetMass / base.mass)

  obj.mass = targetMass
  if (base.radius !== undefined) obj.dimensions.radius = base.radius * dimScale
  if (base.width !== undefined) obj.dimensions.width = base.width * dimScale
  if (base.height !== undefined) obj.dimensions.height = base.height * dimScale
}

export function usePhysicsWorld(handState: HandState) {
  const worldRef = useRef(new PhysicsWorld())
  const objectsRef = useRef<PhysicsObjectData[]>([])
  const [objects, setObjects] = useState<PhysicsObjectData[]>([])
  const [gravity, setGravityState] = useState(9.8)
  const grabbedIdRef = useRef<string | null>(null)
  const prevGrabbingRef = useRef(false)
  const releaseCounterRef = useRef(0)
  const handLostCounterRef = useRef(0)
  // Snapshot velocity at the first non-grabbing frame — by RELEASE_FRAMES the hand
  // has already slowed to near-zero, so we preserve the peak throw velocity.
  const throwVelRef = useRef({ x: 0, y: 0 })
  // Rolling window of velocities while grabbing — used to pick peak throw speed
  const velHistoryRef = useRef<Array<{ x: number; y: number }>>([])
  const handStateRef = useRef(handState)
  useEffect(() => {
    handStateRef.current = handState
  }, [handState])
  // Base dimensions captured at grab-start so openness is applied as a multiplier
  // from the initial state of that grab, not compounding each frame.
  type GrabBase = { mass: number; radius?: number; width?: number; height?: number }
  const grabBaseRef = useRef(new Map<string, GrabBase>())

  const setGravity = useCallback((g: number) => {
    worldRef.current.gravity = g
    setGravityState(g)
  }, [])

  const spawnObject = useCallback((type: ObjectType) => {
    const world = worldRef.current
    const dynamicCount = world.objects.filter(o => !o.isStatic).length
    const STATIC_TYPES: ObjectType[] = ['wall', 'platform', 'ramp']
    const isStatic = STATIC_TYPES.includes(type)
    if (!isStatic && dynamicCount >= PHYSICS_CONSTANTS.MAX_OBJECTS) return

    let x = 0, y = 2
    if (type === 'wall') { x = 0; y = 0 }
    else if (type === 'platform') { x = 0; y = -1.2 }
    else if (type === 'ramp') { x = -1.5; y = -2.0 }
    else {
      const count = dynamicCount
      x = (count - 1) * 1.8
    }
    world.spawnObject(type, x, y)
  }, [])

  const removeAll = useCallback(() => {
    worldRef.current.removeAll()
    grabbedIdRef.current = null
    releaseCounterRef.current = 0
    objectsRef.current = []
    grabBaseRef.current.clear()
    setObjects([])
  }, [])

  useEffect(() => {
    const world = worldRef.current
    const profile = getDevicePerformanceProfile()
    let animId: number
    const fixedStep = PHYSICS_CONSTANTS.DT
    const maxFrameDelta = 0.1
    const maxSubSteps = 6
    let lastFrameTime = performance.now()
    let accumulator = 0
    let lastUiUpdate = 0

    function loop(now: number) {
      animId = requestAnimationFrame(loop)
      const { grabPointWorld, isGrabbing, velocity, hasHand } = handStateRef.current

      if (!hasHand) {
        if (grabbedIdRef.current) {
          handLostCounterRef.current++
          if (handLostCounterRef.current >= HAND_LOST_FRAMES) {
            world.releaseObject(grabbedIdRef.current, 0, 0)
            grabbedIdRef.current = null
            handLostCounterRef.current = 0
            prevGrabbingRef.current = false
            releaseCounterRef.current = 0
          }
          // else: keep holding — sensor briefly lost, object stays frozen in place
        } else {
          prevGrabbingRef.current = false
          releaseCounterRef.current = 0
          handLostCounterRef.current = 0
        }
      } else if (grabPointWorld) {
        handLostCounterRef.current = 0
        if (isGrabbing) {
          // Any grabbing frame resets the release debounce counter
          releaseCounterRef.current = 0

          if (!prevGrabbingRef.current) {
            // Grab start: clear velocity history, find nearest object
            velHistoryRef.current = []
            const nearest = world.findNearestInRange(grabPointWorld.x, grabPointWorld.y, 1.5)
            if (nearest) {
              world.grabObject(nearest.id)
              grabbedIdRef.current = nearest.id
              grabBaseRef.current.set(nearest.id, {
                mass: nearest.mass,
                radius: nearest.dimensions.radius,
                width: nearest.dimensions.width,
                height: nearest.dimensions.height,
              })
            }
          } else if (grabbedIdRef.current) {
            world.moveGrabbedObject(grabbedIdRef.current, grabPointWorld.x, grabPointWorld.y, velocity.x, velocity.y)
            applyMassScale(world, grabbedIdRef.current, handStateRef.current.handOpenness, grabBaseRef.current)
            // Keep rolling window of last 8 velocities to find peak on release
            velHistoryRef.current.push({ x: velocity.x, y: velocity.y })
            if (velHistoryRef.current.length > 8) velHistoryRef.current.shift()
          }
          prevGrabbingRef.current = true
        } else {
          // Not grabbing — debounce before releasing
          if (grabbedIdRef.current) {
            releaseCounterRef.current++
            if (releaseCounterRef.current === 1) {
              // Pick the highest-speed frame from the grab history as throw velocity
              // This avoids the hand deceleration that happens between gesture peak and finger open
              let best = { x: velocity.x, y: velocity.y }
              let bestSpeed = Math.hypot(velocity.x, velocity.y)
              for (const v of velHistoryRef.current) {
                const s = Math.hypot(v.x, v.y)
                if (s > bestSpeed) { bestSpeed = s; best = v }
              }
              throwVelRef.current = best
            }
            if (releaseCounterRef.current >= RELEASE_FRAMES) {
              world.releaseObject(grabbedIdRef.current, throwVelRef.current.x, throwVelRef.current.y)
              grabbedIdRef.current = null
              releaseCounterRef.current = 0
              prevGrabbingRef.current = false
            } else {
              world.moveGrabbedObject(grabbedIdRef.current, grabPointWorld.x, grabPointWorld.y, velocity.x, velocity.y)
            }
          } else {
            prevGrabbingRef.current = false
            releaseCounterRef.current = 0
          }

        }
      }

      const frameDelta = Math.min(maxFrameDelta, Math.max(0, (now - lastFrameTime) / 1000))
      lastFrameTime = now
      accumulator += frameDelta

      let steps = 0
      while (accumulator >= fixedStep && steps < maxSubSteps) {
        world.step()
        objectsRef.current = world.getSnapshot()
        accumulator -= fixedStep
        steps++
      }

      if (steps === maxSubSteps) accumulator = 0
      if (steps > 0 && objectsRef.current.length > 0 && now - lastUiUpdate >= profile.uiUpdateIntervalMs) {
        lastUiUpdate = now
        setObjects(objectsRef.current)
      }
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  return { objects, objectsRef, worldRef, gravity, setGravity, spawnObject, removeAll }
}
