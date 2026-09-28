import { ObjectType, PhysicsObjectData } from './handPhysics/constants'

export type MissionId = 'gravity' | 'moon' | 'energy'

export interface MissionDefinition {
  id: MissionId
  title: string
  shortTitle: string
  concept: string
  prompt: string
  hypothesis: string[]
  object: ObjectType
  gravity: number
  evidence: string[]
}

export interface MissionMetrics {
  maxHeight: number
  maxSpeed: number
  maxKinetic: number
  released: boolean
  landed: boolean
  elapsed: number
}

export const SANDBOX_MISSIONS: MissionDefinition[] = [
  {
    id: 'gravity',
    title: 'ภารกิจ 01 · ตกอย่างไรให้เร็วขึ้น',
    shortTitle: 'ตกอิสระ',
    concept: 'แรงโน้มถ่วง',
    prompt: 'ถ้าปล่อยลูกบอลจากที่สูง ความเร็วจะเปลี่ยนอย่างไรเมื่อเวลาผ่านไป?',
    hypothesis: ['ความเร็วเพิ่มขึ้นเรื่อย ๆ', 'ความเร็วคงที่', 'ความเร็วลดลง'],
    object: 'ball',
    gravity: 9.8,
    evidence: ['ความสูงเริ่มต้นอย่างน้อย 1.5 m', 'ปล่อยลูกบอลจากการจับหรือเมาส์', 'ความเร็วสูงสุดอย่างน้อย 3 m/s'],
  },
  {
    id: 'moon',
    title: 'ภารกิจ 02 · โลกหรือดวงจันทร์',
    shortTitle: 'แรงโน้มถ่วงต่างดาว',
    concept: 'การเปรียบเทียบ g',
    prompt: 'บนดวงจันทร์ วัตถุจะใช้เวลาตกนานกว่าโลกจริงหรือไม่?',
    hypothesis: ['นานกว่าโลก', 'เท่ากับโลก', 'สั้นกว่าโลก'],
    object: 'ball',
    gravity: 1.6,
    evidence: ['ตั้งค่า g = 1.6 m/s²', 'ปล่อยลูกบอลจากความสูงอย่างน้อย 1 m', 'ลูกบอลลอยอยู่ในฉากอย่างน้อย 0.9 วินาที'],
  },
  {
    id: 'energy',
    title: 'ภารกิจ 03 · ส่งพลังงานให้วัตถุ',
    shortTitle: 'พลังงานจลน์',
    concept: 'พลังงานจลน์',
    prompt: 'ทำให้วัตถุมีพลังงานจลน์อย่างน้อย 12 J ด้วยการโยนเพียงครั้งเดียว',
    hypothesis: ['เพิ่มความเร็วทำให้พลังงานเพิ่มมาก', 'เพิ่มความเร็วไม่มีผล', 'มวลอย่างเดียวกำหนดพลังงาน'],
    object: 'projectile',
    gravity: 9.8,
    evidence: ['ปล่อย projectile ด้วยการโยนหรือปัด', 'ความเร็วสูงสุดอย่างน้อย 5 m/s', 'พลังงานจลน์สูงสุดอย่างน้อย 12 J'],
  },
]

export function getMissionProgress(mission: MissionDefinition, metrics: MissionMetrics): number {
  const checks = mission.id === 'gravity'
    ? [metrics.maxHeight >= 1.5, metrics.released, metrics.maxSpeed >= 3]
    : mission.id === 'moon'
      ? [metrics.maxHeight >= 1, mission.gravity < 2, metrics.elapsed >= 0.9]
      : [metrics.released, metrics.maxSpeed >= 5, metrics.maxKinetic >= 12]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function isMissionComplete(mission: MissionDefinition, metrics: MissionMetrics): boolean {
  if (mission.id === 'gravity') return metrics.maxHeight >= 1.5 && metrics.released && metrics.maxSpeed >= 3
  if (mission.id === 'moon') return metrics.maxHeight >= 1 && mission.gravity < 2 && metrics.elapsed >= 0.9
  return metrics.released && metrics.maxSpeed >= 5 && metrics.maxKinetic >= 12
}

export function measureObjects(objects: PhysicsObjectData[], previous: MissionMetrics, dt: number): MissionMetrics {
  if (!objects.length) return previous
  const target = objects[0]
  const speed = Math.hypot(target.velocity.x, target.velocity.y)
  const height = Math.max(0, target.position.y + 3.5)
  const kinetic = 0.5 * target.mass * speed * speed
  const wasGrabbed = target.isGrabbed
  const released = previous.released || (!wasGrabbed && previous.elapsed > 0.05)
  const landed = previous.landed || (height < 0.42 && speed < 0.18 && released)
  return {
    maxHeight: Math.max(previous.maxHeight, height),
    maxSpeed: Math.max(previous.maxSpeed, speed),
    maxKinetic: Math.max(previous.maxKinetic, kinetic),
    released,
    landed,
    elapsed: previous.elapsed + dt,
  }
}

export const EMPTY_METRICS: MissionMetrics = {
  maxHeight: 0,
  maxSpeed: 0,
  maxKinetic: 0,
  released: false,
  landed: false,
  elapsed: 0,
}
