import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './AddFundsModal.css'

const SOURCES = [
  { id: 'salary',   icon: '💼', label: 'Salary'     },
  { id: 'business', icon: '🏪', label: 'Business'   },
  { id: 'regalo',   icon: '🎁', label: 'Regalo'     },
  { id: 'other',    icon: '➕', label: 'Other'       },
]

export default function AddFundsModal({ onClose }) {
  const { addFunds } = useApp()
  const [source, setSource] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const canSubmit = source && parseFloat(amount) > 0

  const handleSubmit = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Please enter a valid amount.'); return }
    if (!source)          { setError('Please select an income source.'); return }

    const src = SOURCES.find(s => s.id === source)
    addFunds({
      amount: amt,
      category: src.label,
      icon: src.icon,
      name: `${src.label} received`,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal__header">
          <h2 className="modal__title">Add Funds</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          <div className="modal__label">Income Source</div>
          <div className="modal__sources">
            {SOURCES.map(src => (
              <div
                key={src.id}
                className={`source-btn ${source === src.id ? 'source-btn--active' : ''}`}
                onClick={() => setSource(src.id)}
              >
                <span className="source-btn__icon">{src.icon}</span>
                <span className="source-btn__label">{src.label}</span>
              </div>
            ))}
          </div>

          <div className="modal__label">Amount</div>
          <input
            className="modal__amount-input"
            type="number"
            placeholder="₱ 0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setError('') }}
          />

          {error && <div className="modal__error">{error}</div>}
        </div>

        <div className="modal__footer">
          <button className="modal__cancel" onClick={onClose}>Cancel</button>
          <button
            className={`modal__submit ${canSubmit ? 'modal__submit--active' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Add Funds
          </button>
        </div>

      </div>
    </div>
  )
}