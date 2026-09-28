'use client'

import { MissionDefinition, MissionMetrics } from '@/lib/sandboxMissions'
import styles from './MissionPanel.module.css'

interface Props {
  mission: MissionDefinition
  missionIndex: number
  total: number
  hypothesis: number | null
  metrics: MissionMetrics
  progress: number
  running: boolean
  complete: boolean
  onHypothesisChange: (index: number) => void
  onStart: () => void
  onRetry: () => void
  onNext: () => void
}

export default function MissionPanel({
  mission,
  missionIndex,
  total,
  hypothesis,
  metrics,
  progress,
  running,
  complete,
  onHypothesisChange,
  onStart,
  onRetry,
  onNext,
}: Props) {
  return (
    <section className={styles.panel} aria-labelledby="missionTitle">
      <div className={styles.topline}>
        <span className={styles.counter}>ภารกิจ {missionIndex + 1}/{total}</span>
        <span className={styles.concept}>{mission.concept}</span>
      </div>

      <h2 id="missionTitle" className={styles.title}>{mission.title}</h2>
      <p className={styles.prompt}>{mission.prompt}</p>

      {!running && !complete && (
        <div className={styles.hypothesis}>
          <p className={styles.sectionTitle}>ตั้งสมมติฐานก่อนทดลอง</p>
          <div className={styles.choices}>
            {mission.hypothesis.map((choice, index) => (
              <button
                type="button"
                key={choice}
                className={`${styles.choice} ${hypothesis === index ? styles.choiceActive : ''}`}
                aria-pressed={hypothesis === index}
                onClick={() => onHypothesisChange(index)}
              >
                <span className={styles.choiceMark}>{String.fromCharCode(65 + index)}</span>
                {choice}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={hypothesis === null}
            onClick={onStart}
          >
            เตรียมฉากและเริ่มทดลอง
          </button>
        </div>
      )}

      {running && (
        <div className={styles.running}>
          <div className={styles.progressRow}>
            <span>หลักฐานที่เก็บได้</span>
            <strong>{progress}%</strong>
          </div>
          <div className={styles.progressTrack} aria-label={`ความคืบหน้า ${progress}%`}>
            <span className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <ul className={styles.evidenceList}>
            {mission.evidence.map((item, index) => (
              <li key={item} className={progress >= ((index + 1) / mission.evidence.length) * 100 ? styles.evidenceDone : ''}>
                <span className={styles.check}>{progress >= ((index + 1) / mission.evidence.length) * 100 ? 'ผ่าน' : 'รอ'}</span>
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.measurements}>
            <div><span>ความสูงสูงสุด</span><strong>{metrics.maxHeight.toFixed(2)} m</strong></div>
            <div><span>ความเร็วสูงสุด</span><strong>{metrics.maxSpeed.toFixed(2)} m/s</strong></div>
            <div><span>พลังงานสูงสุด</span><strong>{metrics.maxKinetic.toFixed(1)} J</strong></div>
          </div>
          <button type="button" className={styles.secondaryBtn} onClick={onRetry}>เริ่มภารกิจนี้ใหม่</button>
        </div>
      )}

      {complete && (
        <div className={styles.complete} role="status">
          <span className={styles.completeBadge}>เก็บหลักฐานครบแล้ว</span>
          <h3>ผลทดลองสอดคล้องกับข้อมูลที่วัดได้</h3>
          <p>
            {mission.id === 'gravity' && 'เมื่อวัตถุตก แรงโน้มถ่วงทำให้ความเร็วเพิ่มขึ้นอย่างต่อเนื่อง จึงเห็นค่า v สูงขึ้นเมื่อความสูงลดลง'}
            {mission.id === 'moon' && 'ค่า g ที่น้อยลงทำให้ความเร็วเปลี่ยนช้าลง วัตถุจึงอยู่กลางอากาศนานกว่าบนโลก'}
            {mission.id === 'energy' && 'พลังงานจลน์ขึ้นกับกำลังสองของความเร็ว การเพิ่มความเร็วเล็กน้อยจึงทำให้พลังงานเพิ่มขึ้นมาก'}
          </p>
          <div className={styles.resultFormula}>
            {mission.id === 'energy' ? 'K = ½mv²' : 'v = u + gt'}
          </div>
          <button type="button" className={styles.primaryBtn} onClick={onNext}>
            {missionIndex === total - 1 ? 'กลับไปทดลองอิสระ' : 'ไปภารกิจถัดไป'}
          </button>
        </div>
      )}
    </section>
  )
}
