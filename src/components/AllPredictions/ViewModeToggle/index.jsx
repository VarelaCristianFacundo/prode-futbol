import styles from './ViewModeToggle.module.css'

const ViewModeToggle = ({ viewMode, onChange }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
      <label className={styles.viewModeToggle} aria-label="Toggle View Mode">
        <input
          type="checkbox"
          checked={viewMode === 'by-match'}
          onChange={e => onChange(e.target.checked ? 'by-match' : 'by-user')}
        />
        <span>👤 Por usuario</span>
        <span>⚽ Por partido</span>
      </label>
    </div>
  )
}

export default ViewModeToggle
