'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { PhysicsObjectData } from '@/lib/handPhysics/constants'
import { GROUND_Y } from '@/lib/handPhysics/PhysicsWorld'
import { PhysicsWorld } from '@/lib/handPhysics/PhysicsWorld'
import { HandState } from '@/hooks/useHandTracking'
import { getDevicePerformanceProfile } from '@/lib/deviceCapability'

interface Props {
  objectsRef: React.MutableRefObject<PhysicsObjectData[]>
  handStateRef: React.MutableRefObject<HandState>
  worldRef: React.MutableRefObject<PhysicsWorld>
}

type VisualBundle = {
  mesh: THREE.Mesh
  shadow: THREE.Mesh
  trail: THREE.Line
  trailPositions: Float32Array
  trailCount: number
  velArrow: THREE.ArrowHelper
  gravArrow: THREE.ArrowHelper
  baseRadius: number
  trajPoints: THREE.Points
  trajPositions: Float32Array
}

export default function Scene3D({ objectsRef, handStateRef, worldRef }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    const profile = getDevicePerformanceProfile()

    const W = container.clientWidth || window.innerWidth
    const H = container.clientHeight || window.innerHeight
    const aspect = W / H
    const viewH = 9
    let viewW = viewH * aspect

    const isMobileProfile = profile.tier !== 'high'
    const trailLength = profile.trailLength

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-viewW / 2, viewW / 2, viewH / 2, -viewH / 2, 0.1, 100)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({
      antialias: profile.tier === 'high',
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.maxPixelRatio))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.touchAction = 'none'
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85)
    keyLight.position.set(4, 8, 6)
    scene.add(keyLight)
    if (profile.tier === 'high') {
      const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.55)
      rimLight.position.set(-4, 3, 4)
      scene.add(rimLight)
    }

    const gridGroup = new THREE.Group()
    scene.add(gridGroup)

    function rebuildGrid(width: number) {
      while (gridGroup.children.length) {
        const child = gridGroup.children.pop()!
        if ((child as THREE.Line).geometry) (child as THREE.Line).geometry.dispose()
        const mat = (child as THREE.Line).material
        if (mat && !Array.isArray(mat)) mat.dispose()
      }

      const half = width / 2
      const majorDepthSegments: number[] = []
      const minorDepthSegments: number[] = []
      const majorTickSegments: number[] = []
      const minorTickSegments: number[] = []

      for (let x = -Math.floor(half); x <= Math.floor(half); x += 1) {
        const isMajor = x % 2 === 0
        const tickH = isMajor ? 0.18 : 0.1
        const depthTarget = isMajor ? majorDepthSegments : minorDepthSegments
        const tickTarget = isMajor ? majorTickSegments : minorTickSegments
        depthTarget.push(
          x, GROUND_Y + 0.001, -0.2,
          x, GROUND_Y + 0.001, 0.2,
        )
        tickTarget.push(
          x, GROUND_Y, 0,
          x, GROUND_Y + tickH, 0,
        )
      }

      const addSegments = (positions: number[], color: number, opacity: number) => {
        if (positions.length === 0) return
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        gridGroup.add(new THREE.LineSegments(
          geometry,
          new THREE.LineBasicMaterial({ color, transparent: true, opacity })
        ))
      }

      addSegments(majorDepthSegments, 0x00e5ff, 0.22)
      addSegments(minorDepthSegments, 0x148a9c, 0.1)
      addSegments(majorTickSegments, 0x00e5ff, 0.45)
      addSegments(minorTickSegments, 0x00e5ff, 0.22)

      gridGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-half, GROUND_Y, 0),
          new THREE.Vector3(half, GROUND_Y, 0),
        ]),
        new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.55 })
      ))

    }

    rebuildGrid(viewW)

    const stripMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(viewW, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, opacity: 0.14, transparent: true })
    )
    stripMesh.position.set(0, GROUND_Y - 0.04, -0.15)
    scene.add(stripMesh)

    const handCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, profile.handSegments, profile.handSegments),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 })
    )
    const handRing = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.26, profile.ringSegments),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      })
    )
    const handGroup = new THREE.Group()
    handGroup.add(handCore)
    handGroup.add(handRing)
    handGroup.visible = false
    scene.add(handGroup)

    const visualMap = new Map<string, VisualBundle>()

    function makeTrailLine(color: string) {
      const positions = new Float32Array(trailLength * 3)
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setDrawRange(0, 0)
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.55,
      })
      return { line: new THREE.Line(geo, mat), positions }
    }

    function disposeVisual(v: VisualBundle) {
      scene.remove(v.mesh, v.shadow, v.trail, v.velArrow, v.gravArrow, v.trajPoints)
      v.mesh.geometry.dispose()
      ;(v.mesh.material as THREE.Material).dispose()
      v.shadow.geometry.dispose()
      ;(v.shadow.material as THREE.Material).dispose()
      v.trail.geometry.dispose()
      ;(v.trail.material as THREE.Material).dispose()
      v.velArrow.line.geometry.dispose()
      ;(v.velArrow.line.material as THREE.Material).dispose()
      v.velArrow.cone.geometry.dispose()
      ;(v.velArrow.cone.material as THREE.Material).dispose()
      v.gravArrow.line.geometry.dispose()
      ;(v.gravArrow.line.material as THREE.Material).dispose()
      v.gravArrow.cone.geometry.dispose()
      ;(v.gravArrow.cone.material as THREE.Material).dispose()
      v.trajPoints.geometry.dispose()
      ;(v.trajPoints.material as THREE.Material).dispose()
    }

    function createVisual(obj: PhysicsObjectData): VisualBundle {
      let geo: THREE.BufferGeometry
      if (obj.dimensions.radius !== undefined) {
        geo = new THREE.SphereGeometry(obj.dimensions.radius, profile.sphereSegments, profile.sphereSegments)
      } else {
        const w = obj.dimensions.width ?? 0.5
        const h = obj.dimensions.height ?? 0.5
        geo = new THREE.BoxGeometry(w, h, w * 0.7)
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(obj.color),
        roughness: 0.28,
        metalness: 0.22,
        emissive: new THREE.Color(obj.color),
        emissiveIntensity: 0.08,
      })
      const mesh = new THREE.Mesh(geo, mat)

      const r = obj.dimensions.radius ?? Math.max(obj.dimensions.width ?? 0.5, obj.dimensions.height ?? 0.5) * 0.55
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(r * 0.95, isMobileProfile ? 12 : 24),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
      )
      shadow.rotation.x = -Math.PI / 2
      shadow.position.y = GROUND_Y + 0.01

      const { line: trail, positions } = makeTrailLine(obj.color)

      const velArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 0, 0),
        0.01,
        0x7af8ff,
        0.18,
        0.12
      )
      const gravArrow = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 0),
        0.55,
        0xffb347,
        0.14,
        0.1
      )

      scene.add(mesh, shadow, trail, velArrow, gravArrow)
      const baseRadius = obj.dimensions.radius ?? Math.max(obj.dimensions.width ?? 0.5, obj.dimensions.height ?? 0.5) * 0.55

      const MAX_TRAJ = profile.trajectoryPoints
      const trajPositions = new Float32Array(MAX_TRAJ * 3)
      const trajGeo = new THREE.BufferGeometry()
      trajGeo.setAttribute('position', new THREE.BufferAttribute(trajPositions, 3))
      trajGeo.setDrawRange(0, 0)
      const trajMat = new THREE.PointsMaterial({
        color: 0x00e5ff,
        size: 0.07,
        transparent: true,
        opacity: 0.72,
        sizeAttenuation: true,
      })
      const trajPoints = new THREE.Points(trajGeo, trajMat)
      scene.add(trajPoints)

      return { mesh, shadow, trail, trailPositions: positions, trailCount: 0, velArrow, gravArrow, baseRadius, trajPoints, trajPositions }
    }

    function pushTrail(v: VisualBundle, x: number, y: number) {
      if (v.trailCount >= trailLength) {
        v.trailPositions.copyWithin(0, 3)
        v.trailCount = trailLength - 1
      }
      const i = v.trailCount * 3
      v.trailPositions[i] = x
      v.trailPositions[i + 1] = y
      v.trailPositions[i + 2] = 0
      v.trailCount++
      const attr = v.trail.geometry.getAttribute('position') as THREE.BufferAttribute
      attr.needsUpdate = true
      v.trail.geometry.setDrawRange(0, v.trailCount)
    }

    const velocityDirection = new THREE.Vector3()

    function syncMeshes(objects: PhysicsObjectData[]) {
      const liveIds = new Set(objects.map(o => o.id))

      for (const [id, visual] of visualMap) {
        if (!liveIds.has(id)) {
          disposeVisual(visual)
          visualMap.delete(id)
        }
      }

      for (const obj of objects) {
        let v = visualMap.get(obj.id)
        if (!v) {
          v = createVisual(obj)
          visualMap.set(obj.id, v)
        }

        const { mesh, shadow, velArrow, gravArrow } = v
        mesh.position.set(obj.position.x, obj.position.y, 0)

        if (obj.isStatic) {
          mesh.rotation.z = obj.angle
          const sMat = mesh.material as THREE.MeshStandardMaterial
          if (obj.isGrabbed) {
            sMat.emissive.set(0x00e5ff)
            sMat.emissiveIntensity = 0.45
          } else if (obj.hitFlash > 0.05) {
            sMat.emissive.set(0xffffff)
            sMat.emissiveIntensity = obj.hitFlash * 1.5
          } else {
            sMat.emissive.set(obj.color)
            sMat.emissiveIntensity = 0.06
          }
          shadow.position.x = obj.position.x
          shadow.scale.setScalar(0.5)
          ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.1
          velArrow.visible = false
          gravArrow.visible = false
          v.trajPoints.visible = false
          v.trajPoints.geometry.setDrawRange(0, 0)
          continue
        }

        if (!obj.isGrabbed && obj.dimensions.radius !== undefined) {
          mesh.rotation.z -= obj.velocity.x * 0.04
        }

        // Compute how much the object has grown since creation (constant-density scaling)
        const currentRadius = obj.dimensions.radius ?? Math.max(obj.dimensions.width ?? 0.5, obj.dimensions.height ?? 0.5) * 0.55
        const sizeScale = currentRadius / v.baseRadius

        const mat = mesh.material as THREE.MeshStandardMaterial
        if (obj.isGrabbed) {
          const openness = handStateRef.current.handOpenness
          mat.emissive.set(0x00e5ff)
          // Glow intensifies as the object gets heavier
          mat.emissiveIntensity = 0.35 + openness * 0.6
          mesh.scale.setScalar(sizeScale * 1.06)
        } else if (obj.hitFlash > 0.05) {
          mat.emissive.set(0xffffff)
          mat.emissiveIntensity = obj.hitFlash * 2.2
          mesh.scale.setScalar(sizeScale * (1 + obj.hitFlash * 0.12))
        } else {
          mat.emissive.set(obj.color)
          mat.emissiveIntensity = 0.1
          mesh.scale.setScalar(sizeScale)
        }

        const height = Math.max(0, obj.position.y - GROUND_Y)
        const shadowScale = Math.max(0.35, 1 - height * 0.12) * sizeScale
        shadow.position.x = obj.position.x
        shadow.scale.setScalar(shadowScale)
        ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.3 * shadowScale

        const speed = Math.hypot(obj.velocity.x, obj.velocity.y)
        if (!obj.isGrabbed && speed > 0.35) {
          pushTrail(v, obj.position.x, obj.position.y)
          ;(v.trail.material as THREE.LineBasicMaterial).opacity = Math.min(0.7, 0.25 + speed * 0.08)
        } else if (obj.isGrabbed) {
          v.trailCount = 0
          v.trail.geometry.setDrawRange(0, 0)
        }

        if (!obj.isGrabbed && speed > 0.2) {
          velArrow.visible = true
          velocityDirection.set(obj.velocity.x, obj.velocity.y, 0).normalize()
          velArrow.setDirection(velocityDirection)
          velArrow.setLength(Math.min(2.2, 0.35 + speed * 0.18), 0.18, 0.12)
          velArrow.position.set(obj.position.x, obj.position.y, 0.2)
        } else {
          velArrow.visible = false
        }

        if (!obj.isGrabbed) {
          gravArrow.visible = true
          gravArrow.position.set(obj.position.x + 0.35, obj.position.y, 0.15)
          const g = worldRef.current.gravity
          gravArrow.setLength(0.35 + Math.min(1.2, g * 0.04), 0.12, 0.09)
        } else {
          gravArrow.visible = false
        }

        if (obj.isGrabbed) {
          const hs = handStateRef.current
          const speed = Math.hypot(hs.velocity.x, hs.velocity.y)
          if (speed > 1.5) {
            const g = worldRef.current.gravity
            const wb = worldRef.current.bounds
            const stepDt = 0.1
            const MAX_TRAJ = profile.trajectoryPoints
            let count = 0
            const buf = v.trajPositions
            for (let i = 1; i <= MAX_TRAJ; i++) {
              const t = i * stepDt
              const px = obj.position.x + hs.velocity.x * t
              const py = obj.position.y + hs.velocity.y * t - 0.5 * g * t * t
              if (py < GROUND_Y || px < wb.minX || px > wb.maxX) break
              buf[count * 3] = px
              buf[count * 3 + 1] = py
              buf[count * 3 + 2] = 0.3
              count++
            }
            const tAttr = v.trajPoints.geometry.getAttribute('position') as THREE.BufferAttribute
            tAttr.needsUpdate = true
            v.trajPoints.geometry.setDrawRange(0, count)
            v.trajPoints.visible = count > 2
          } else {
            v.trajPoints.geometry.setDrawRange(0, 0)
            v.trajPoints.visible = false
          }
        } else {
          v.trajPoints.geometry.setDrawRange(0, 0)
          v.trajPoints.visible = false
        }
      }
    }

    function syncHand(hs: HandState) {
      if (hs.grabPointWorld) {
        handGroup.visible = true
        handGroup.position.set(hs.grabPointWorld.x, hs.grabPointWorld.y, 0.6)
        const coreMat = handCore.material as THREE.MeshBasicMaterial
        const ringMat = handRing.material as THREE.MeshBasicMaterial
        if (hs.isGrabbing) {
          coreMat.color.set(0xffffff)
          coreMat.opacity = 0.95
          ringMat.color.set(0xffffff)
          ringMat.opacity = 0.8
          handRing.scale.setScalar(1.15 + Math.sin(performance.now() * 0.012) * 0.08)
        } else {
          coreMat.color.set(0x00e5ff)
          coreMat.opacity = 0.75
          ringMat.color.set(0x00e5ff)
          ringMat.opacity = 0.45
          handRing.scale.setScalar(1)
        }
      } else {
        handGroup.visible = false
      }
    }

    worldRef.current.updateBounds(viewW, viewH)

    type PointerSample = { x: number; y: number; time: number }
    let activePointerId: number | null = null
    let pointerGrabbedId: string | null = null
    let pointerSamples: PointerSample[] = []

    const screenToWorld = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      return {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * viewW,
        y: (0.5 - (event.clientY - rect.top) / rect.height) * viewH,
      }
    }

    const getPointerVelocity = () => {
      if (pointerSamples.length < 2) return { x: 0, y: 0 }
      const first = pointerSamples[0]
      const last = pointerSamples[pointerSamples.length - 1]
      const dt = Math.max(0.016, (last.time - first.time) / 1000)
      return {
        x: Math.max(-20, Math.min(20, (last.x - first.x) / dt)),
        y: Math.max(-20, Math.min(20, (last.y - first.y) / dt)),
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (activePointerId !== null || handStateRef.current.hasHand) return
      const point = screenToWorld(event)
      const nearest = worldRef.current.findNearestInRange(point.x, point.y, 1.2)
      if (!nearest) return

      event.preventDefault()
      activePointerId = event.pointerId
      pointerGrabbedId = nearest.id
      pointerSamples = [{ ...point, time: performance.now() }]
      worldRef.current.grabObject(nearest.id)
      worldRef.current.moveGrabbedObject(nearest.id, point.x, point.y, 0, 0)
      objectsRef.current = worldRef.current.getSnapshot()
      renderer.domElement.setPointerCapture(event.pointerId)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId || !pointerGrabbedId) return
      event.preventDefault()
      const point = screenToWorld(event)
      const now = performance.now()
      pointerSamples.push({ ...point, time: now })
      pointerSamples = pointerSamples.filter(sample => now - sample.time <= 120).slice(-6)
      const velocity = getPointerVelocity()
      worldRef.current.moveGrabbedObject(pointerGrabbedId, point.x, point.y, velocity.x, velocity.y)
      objectsRef.current = worldRef.current.getSnapshot()
    }

    const finishPointerInteraction = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId || !pointerGrabbedId) return
      event.preventDefault()
      const velocity = getPointerVelocity()
      worldRef.current.releaseObject(pointerGrabbedId, velocity.x, velocity.y)
      objectsRef.current = worldRef.current.getSnapshot()
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId)
      }
      activePointerId = null
      pointerGrabbedId = null
      pointerSamples = []
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('pointermove', handlePointerMove)
    renderer.domElement.addEventListener('pointerup', finishPointerInteraction)
    renderer.domElement.addEventListener('pointercancel', finishPointerInteraction)

    let animId: number
    let lastRenderTime = 0
    function animate() {
      animId = requestAnimationFrame(animate)
      const now = performance.now()
      if (now - lastRenderTime < 1000 / profile.renderFps) return
      lastRenderTime = now
      syncMeshes(objectsRef.current)
      syncHand(handStateRef.current)
      renderer.render(scene, camera)
    }
    animate()

    function onResize() {
      const el = mountRef.current
      if (!el) return
      const W2 = el.clientWidth
      const H2 = el.clientHeight
      if (!W2 || !H2) return
      renderer.setSize(W2, H2)
      const asp2 = W2 / H2
      viewW = viewH * asp2
      camera.left = -viewW / 2
      camera.right = viewW / 2
      camera.updateProjectionMatrix()
      rebuildGrid(viewW)
      stripMesh.geometry.dispose()
      stripMesh.geometry = new THREE.PlaneGeometry(viewW, 0.08)
      worldRef.current.updateBounds(viewW, viewH)
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('pointermove', handlePointerMove)
      renderer.domElement.removeEventListener('pointerup', finishPointerInteraction)
      renderer.domElement.removeEventListener('pointercancel', finishPointerInteraction)
      for (const v of visualMap.values()) disposeVisual(v)
      visualMap.clear()
      while (gridGroup.children.length) {
        const child = gridGroup.children.pop() as THREE.Line
        child.geometry.dispose()
        const material = child.material
        if (Array.isArray(material)) material.forEach(item => item.dispose())
        else material.dispose()
      }
      stripMesh.geometry.dispose()
      ;(stripMesh.material as THREE.Material).dispose()
      handCore.geometry.dispose()
      ;(handCore.material as THREE.Material).dispose()
      handRing.geometry.dispose()
      ;(handRing.material as THREE.Material).dispose()
      renderer.renderLists.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [objectsRef, handStateRef, worldRef])

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 2 }} />
}
