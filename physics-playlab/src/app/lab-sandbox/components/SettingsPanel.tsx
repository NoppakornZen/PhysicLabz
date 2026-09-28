import styles from './SettingsPanel.module.css'

interface Props {
  gravity: number
  onGravityChange: (g: number) => void
  onReset: () => void
}

export default function SettingsPanel({ gravity, onGravityChange, onReset }: Props) {
  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <span className={styles.title}>Settings</span>
      </div>

      <label className={styles.control}>
        <div className={styles.labelRow}>
          <span>Gravity (g)</span>
          <span className={styles.value}>{gravity.toFixed(1)} m/s²</span>
        </div>
        <input
          type="range"
          min={0}
          max={25}
          step={0.1}
          value={Math.min(gravity, 25)}
          onChange={e => onGravityChange(parseFloat(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.presets}>
          <button
            type="button"
            onClick={() => onGravityChange(1.6)}
            className={`${styles.preset} ${Math.abs(gravity - 1.6) < 0.05 ? styles.presetActive : ''}`}
          >
            Moon
          </button>
          <button
            type="button"
            onClick={() => onGravityChange(9.8)}
            className={`${styles.preset} ${Math.abs(gravity - 9.8) < 0.05 ? styles.presetActive : ''}`}
          >
            Earth
          </button>
          <button
            type="button"
            onClick={() => onGravityChange(24.8)}
            className={`${styles.preset} ${Math.abs(gravity - 24.8) < 0.05 ? styles.presetActive : ''}`}
          >
            Jupiter
          </button>
        </div>
      </label>

      <button onClick={onReset} className={styles.resetBtn}>
        Reset All
      </button>
    </div>
  )
}
