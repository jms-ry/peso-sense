import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import './SettingsModal.css'

export default function SettingsModal({ onClose }) {
  const { data, updateData } = useApp()
  const [importError, setImportError]   = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [pendingData, setPendingData]   = useState(null)
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  // ── EXPORT ──────────────────────────────────────────────────
  const handleExport = () => {
    const exportData = {
      ...data,
      meta: {
        ...data.meta,
        exportedAt: new Date().toISOString(),
        version: 1,
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })

    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().split('T')[0]

    link.href     = url
    link.download = `pesosense-backup-${date}.json`
    link.click()
    URL.revokeObjectURL(url)

    showToast('Data exported successfully', 'success')
  }

  // ── IMPORT ──────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportError('')
    setImportSuccess(false)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!validateImport(parsed)) {
          setImportError('Invalid file format. Please use a PesoSense backup file.')
          return
        }
        setPendingData(parsed)
        setShowConfirm(true)
      } catch {
        setImportError('Could not read file. Make sure it is a valid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const validateImport = (parsed) => {
    return (
      parsed &&
      typeof parsed === 'object' &&
      parsed.funds &&
      Array.isArray(parsed.transactions) &&
      Array.isArray(parsed.goals) &&
      parsed.savings
    )
  }

  const handleConfirmImport = () => {
    updateData(pendingData)
    setShowConfirm(false)
    setPendingData(null)

    showToast('Data imported successfully', 'success')
  }

  const handleCancelImport = () => {
    setShowConfirm(false)
    setPendingData(null)
  }

  const lastExport = data?.meta?.exportedAt
    ? new Date(data.meta.exportedAt).toLocaleDateString('en-PH', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>

        <div className="settings-modal__header">
          <h2 className="settings-modal__title">Export / Import Data</h2>
          <button className="settings-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-modal__body">

          {/* Export */}
          <div className="settings-section">
            <div className="settings-section__icon">📤</div>
            <div className="settings-section__content">
              <div className="settings-section__title">Export Data</div>
              <div className="settings-section__desc">
                Download all your PesoSense data as a JSON backup file.
                Use this to sync your data to another device or browser.
              </div>
              {lastExport && (
                <div className="settings-section__meta">
                  Last exported: {lastExport}
                </div>
              )}
              <button className="settings-btn settings-btn--export" onClick={handleExport}>
                Download Backup
              </button>
            </div>
          </div>

          <div className="settings-divider" />

          {/* Import */}
          <div className="settings-section">
            <div className="settings-section__icon">📥</div>
            <div className="settings-section__content">
              <div className="settings-section__title">Import Data</div>
              <div className="settings-section__desc">
                Restore a previous backup or sync data from another device.
                This will <strong>replace</strong> your current data.
              </div>
              {importError && (
                <div className="settings-feedback settings-feedback--error">
                  ⚠ {importError}
                </div>
              )}
              <button
                className="settings-btn settings-btn--import"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Backup File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

        </div>

        {/* Confirm import overlay */}
        {showConfirm && (
          <div className="settings-confirm">
            <div className="settings-confirm__icon">⚠️</div>
            <div className="settings-confirm__title">Replace current data?</div>
            <div className="settings-confirm__desc">
              This will permanently replace all your current transactions, goals,
              and savings with the imported backup. This cannot be undone.
            </div>
            <div className="settings-confirm__actions">
              <button className="settings-confirm__cancel" onClick={handleCancelImport}>
                Cancel
              </button>
              <button className="settings-confirm__proceed" onClick={handleConfirmImport}>
                Yes, Replace Data
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}