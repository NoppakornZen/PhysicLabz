import { ObjectType } from '@/lib/handPhysics/constants'
import styles from './ObjectBox.module.css'

const DYNAMIC_OBJECTS = [
  { id: 'friction-box' as ObjectType, name: 'Friction Box', sub: 'μ = 0.3, m = 2 kg', color: '#ff9800' },
  { id: 'ball' as ObjectType, name: 'Ball', sub: 'No friction, m = 0.5 kg', color: '#4caf50' },
  { id: 'projectile' as ObjectType, name: 'Projectile', sub: 'Launch by throwing', color: '#2196f3' },
]

const STATIC_OBJECTS = [
  { id: 'wall' as ObjectType, name: 'Wall', sub: 'Static · vertical', color: '#607d8b' },
  { id: 'platform' as ObjectType, name: 'Platform', sub: 'Static · horizontal', color: '#607d8b' },
  { id: 'ramp' as ObjectType, name: 'Ramp', sub: 'Static · 30° incline', color: '#78909c' },
]

interface Props {
  onSpawn: (id: ObjectType) => void
  count: number
  max: number
}

export default function ObjectBox({ onSpawn, count, max }: Props) {
  return (
    <div className={styles.objectBox}>
      <div className={styles.header}>
        <span className={styles.title}>Objects</span>
        <span className={styles.counter}>{count} / {max}</span>
      </div>
      <div className={styles.list}>
        {DYNAMIC_OBJECTS.map(obj => (
          <button
            key={obj.id}
            className={styles.item}
            onClick={() => onSpawn(obj.id)}
            disabled={count >= max}
            style={{ '--obj-color': obj.color } as React.CSSProperties}
          >
            <span className={styles.dot} />
            <span className={styles.info}>
              <span className={styles.name}>{obj.name}</span>
              <span className={styles.sub}>{obj.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={styles.sectionLabel}>Arena</div>
      <div className={styles.list}>
        {STATIC_OBJECTS.map(obj => (
          <button
            key={obj.id}
            className={`${styles.item} ${styles.staticItem}`}
            onClick={() => onSpawn(obj.id)}
            style={{ '--obj-color': obj.color } as React.CSSProperties}
          >
            <span className={`${styles.dot} ${styles.staticDot}`} />
            <span className={styles.info}>
              <span className={styles.name}>{obj.name}</span>
              <span className={styles.sub}>{obj.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
