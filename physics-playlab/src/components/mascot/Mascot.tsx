'use client'
import styles from './Mascot.module.css'

export type MascotPose =
  | 'idle'
  | 'teaching'
  | 'hinting'
  | 'celebrating'
  | 'sad'
  | 'running'
  | 'flying'

interface MascotProps {
  pose?: MascotPose
  size?: number
  className?: string
}

export default function Mascot({ pose = 'idle', size = 120, className = '' }: MascotProps) {
  // Map poses to actual background-removed assets
  const poseImages: Record<MascotPose, string> = {
    idle: '/images/mascot/front.png',
    teaching: '/images/mascot/read.png',
    hinting: '/images/mascot/think.png',
    celebrating: '/images/mascot/front.png', // Or mascot_full1.png if preferred
    sad: '/images/mascot/front.png',
    running: '/images/mascot/right.png',
    flying: '/images/mascot/read.png',
  }

  const imgSrc = poseImages[pose] || poseImages.idle

  return (
    <div
      className={`${styles.mascotWrapper} ${styles[`pose--${pose}`]} ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Nuto the owl — ${pose}`}
    >
      <img
        src={imgSrc}
        alt={`Mascot Nuto in ${pose} pose`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
        className={styles.mascotImg}
      />
    </div>
  )
}
