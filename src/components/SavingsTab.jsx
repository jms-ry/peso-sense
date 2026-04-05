import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import './SavingsTab.css'

function fmt(n) {
  const num = parseFloat(n) || 0
  return Math.abs(num).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (isToday)     return `Today, ${time}`
  if (isYesterday) return `Yesterday, ${time}`
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) + `, ${time}`
}

export default function SavingsTab() {
  const { data, addSavings, withdrawSavings } = useApp()
  const [showHistory, setShowHistory] = useState(true)
 const { showToast } = useToast()

  const {
    funds: {
      totalSavings     = 0,
      availableBalance = 0,
      totalFunds       = 0,
    } = {},
    savings: {
      totalAdded     = 0,
      totalWithdrawn = 0,
      savingsHistory = [],
    } = {},
  } = data ?? {}

  const savingsPct = totalFunds ? Math.round((totalSavings / totalFunds) * 100) : 0

  const [addExpanded,      setAddExpanded]      = useState(false)
  const [withdrawExpanded, setWithdrawExpanded] = useState(false)
  const [source,           setSource]           = useState('balance')
  const [addAmount,        setAddAmount]        = useState('')
  const [withdrawAmount,   setWithdrawAmount]   = useState('')

  const addAmt      = parseFloat(addAmount)
  const withdrawAmt = parseFloat(withdrawAmount)

  const addExceedsBalance  = source === 'balance' && addAmt > availableBalance
  const canAdd             = addAmt > 0 && !addExceedsBalance
  const withdrawExceeds    = withdrawAmt > totalSavings
  const canWithdraw        = withdrawAmt > 0 && !withdrawExceeds

  const handleAdd = () => {
    if (!canAdd) return
    addSavings({ amount: addAmt, source })
    setAddAmount('')
    setAddExpanded(false)
    showToast(`₱${addAmt.toFixed(2)} added to savings`, 'success')
  }

  const handleWithdraw = () => {
    if (!canWithdraw) return
    withdrawSavings({ amount: withdrawAmt })
    setWithdrawAmount('')
    setWithdrawExpanded(false)
    showToast(`₱${withdrawAmt.toFixed(2)} withdrawn`, 'success')
  }

  const handleAddToggle = () => {
    setAddExpanded(!addExpanded)
    setWithdrawExpanded(false)
    setAddAmount('')
  }

  const handleWithdrawToggle = () => {
    setWithdrawExpanded(!withdrawExpanded)
    setAddExpanded(false)
    setWithdrawAmount('')
  }

  return (
    <div className="savings-tab">

      {/* Savings hero */}
      <div className="savings-hero">
        <div className="savings-hero__glow" />
        <div className="savings-hero__label">Total Savings</div>
        <div className="savings-hero__amount">₱ {fmt(totalSavings)}</div>
        <div className="savings-hero__sub">
          {savingsPct}% of total funds
        </div>
        <div className="savings-hero__actions">
          <button
            className={`savings-btn savings-btn--add ${addExpanded ? 'savings-btn--active' : ''}`}
            onClick={handleAddToggle}
          >
            {addExpanded ? '✕ Cancel' : '＋ Add to Savings'}
          </button>
          <button
            className={`savings-btn savings-btn--withdraw ${withdrawExpanded ? 'savings-btn--active-withdraw' : ''}`}
            onClick={handleWithdrawToggle}
            disabled={totalSavings <= 0}
          >
            {withdrawExpanded ? '✕ Cancel' : '↓ Withdraw'}
          </button>
        </div>
      </div>

      {/* Add to Savings prompt */}
      {addExpanded && (
        <div className="savings-prompt savings-prompt--add">
          <div className="savings-prompt__label">Where is this fund coming from?</div>
          <div className="savings-prompt__source-row">
            <div
              className={`source-opt ${source === 'balance' ? 'source-opt--active-teal' : ''}`}
              onClick={() => { setSource('balance'); setAddAmount('') }}
            >
              <div className="source-opt__icon">💰</div>
              <div className="source-opt__label">Available Balance</div>
            </div>
            <div
              className={`source-opt ${source === 'new' ? 'source-opt--active-teal' : ''}`}
              onClick={() => { setSource('new'); setAddAmount('') }}
            >
              <div className="source-opt__icon">➕</div>
              <div className="source-opt__label">New Fund</div>
            </div>
          </div>
          <div className="savings-prompt__note">
            {source === 'balance'
              ? <>Using available balance. You have <span>₱ {fmt(availableBalance)}</span> available.</>
              : <>New money will be added to your total funds and allocated to savings.</>
            }
          </div>
          <div className="savings-prompt__input-row">
            <input
              className="input--savings-amount input--teal"
              type="number"
              placeholder="₱ 0.00"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdd && handleAdd()}
            />
            <button
              className={`btn btn--savings ${!canAdd ? 'btn--disabled' : ''}`}
              onClick={handleAdd}
              disabled={!canAdd}
            >
              Add
            </button>
          </div>
          {addExceedsBalance && addAmt > 0 && (
            <div className="savings-prompt__error">
              Amount exceeds available balance of ₱&nbsp;{fmt(availableBalance)}.
            </div>
          )}
        </div>
      )}

      {/* Withdraw prompt */}
      {withdrawExpanded && (
        <div className="savings-prompt savings-prompt--withdraw">
          <div className="savings-prompt__label">Withdraw from Savings</div>
          <div className="savings-prompt__note">
            Transfer savings to your available balance.
            You have <span>₱ {fmt(totalSavings)}</span> in savings.
          </div>
          <div className="savings-prompt__input-row">
            <input
              className="input--savings-amount input--teal"
              type="number"
              placeholder="₱ 0.00"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canWithdraw && handleWithdraw()}
            />
            <button
              className={`btn btn--savings ${!canWithdraw ? 'btn--disabled' : ''}`}
              onClick={handleWithdraw}
              disabled={!canWithdraw}
            >
              Transfer
            </button>
          </div>
          {withdrawExceeds && withdrawAmt > 0 && (
            <div className="savings-prompt__error">
              Amount exceeds total savings of ₱&nbsp;{fmt(totalSavings)}.
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="savings-stats">
        <div className="sstat">
          <div className="sstat__val" style={{ color: 'var(--green)' }}>₱ {fmt(totalAdded)}</div>
          <div className="sstat__label">Total Added</div>
        </div>
        <div className="sstat">
          <div className="sstat__val" style={{ color: 'var(--red)' }}>₱ {fmt(totalWithdrawn)}</div>
          <div className="sstat__label">Withdrawn</div>
        </div>
        <div className="sstat">
          <div className="sstat__val" style={{ color: 'var(--blue)' }}>{savingsPct}%</div>
          <div className="sstat__label">of Total Funds</div>
        </div>
      </div>

      {/* Savings history */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Savings History</span>
          <span
            className="card__toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? '▲ Hide' : '▼ Show'}
          </span>
        </div>
        {showHistory && (
          savingsHistory.length === 0 ? (
            <div className="empty-state">No savings history yet.</div>
          ) : (
            savingsHistory.slice(0, 10).map(entry => (
              <div key={entry.id} className="tx-item">
                <div
                  className="tx-icon"
                  style={{ background: entry.type === 'add' ? 'var(--teal-bg)' : 'var(--red-bg)' }}
                >
                  {entry.type === 'add' ? '🏦' : '↓'}
                </div>
                <div className="tx-info">
                  <div className="tx-name">
                    {entry.type === 'add'
                      ? `Added to savings ${entry.source === 'new' ? '(new fund)' : '(from balance)'}`
                      : 'Withdrawal to balance'
                    }
                  </div>
                  <div className="tx-meta">{formatDate(entry.date)}</div>
                </div>
                <div className={`tx-amount ${entry.type === 'add' ? 'tx-amount--income' : 'tx-amount--expense'}`}>
                  {entry.type === 'add' ? '+' : '-'} ₱ {fmt(entry.amount)}
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Tip */}
      <div className="insight insight--teal">
        <span className="insight__icon">🏦</span>
        <div>
          <div className="insight__title insight__title--teal">
            Save at least 20% of your income
          </div>
          <div className="insight__text">
            Financial advisors recommend saving 20% of every paycheck.
            {savingsPct > 0
              ? ` You're currently at ${savingsPct}% — ${savingsPct >= 20 ? 'great job keeping it up!' : 'keep pushing toward 20%!'}`
              : ' Start small — even ₱ 100 a week builds a strong habit.'
            }
          </div>
        </div>
      </div>

    </div>
  )
}