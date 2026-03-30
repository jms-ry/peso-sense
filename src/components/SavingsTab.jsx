import { useState } from 'react'
import './SavingsTab.css'

function fmt(n) {
  const num = parseFloat(n) || 0
  return Math.abs(num).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function SavingsTab({ data }) {
  const {
    funds: {
      totalSavings     = 0,
      availableBalance = 0,
      totalFunds       = 0,
    } = {},
    savings: {
      totalAdded       = 0,
      totalWithdrawn   = 0,
      savingsHistory   = [],
    } = {},
  } = data ?? {}
  const savingsPct = totalFunds ? Math.round((totalSavings / totalFunds) * 100) : 0
  const [addExpanded, setAddExpanded] = useState(false)
  const [withdrawExpanded, setWithdrawExpanded] = useState(false)
  const [source, setSource] = useState('balance')

  const handleAddToggle = () => {
    setAddExpanded(!addExpanded)
    setWithdrawExpanded(false)
  }

  const handleWithdrawToggle = () => {
    setWithdrawExpanded(!withdrawExpanded)
    setAddExpanded(false)
  }

  return (
    <div className="savings-tab">

      {/* Savings hero */}
      <div className="savings-hero">
        <div className="savings-hero__glow" />
        <div className="savings-hero__label">Total Savings</div>
        <div className="savings-hero__amount">₱ {fmt(totalSavings)}</div>
        <div className="savings-hero__sub">Accumulated this month</div>
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
              onClick={() => setSource('balance')}
            >
              <div className="source-opt__icon">💰</div>
              <div className="source-opt__label">Available Balance</div>
            </div>
            <div
              className={`source-opt ${source === 'new' ? 'source-opt--active-teal' : ''}`}
              onClick={() => setSource('new')}
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
            <input className="input--savings-amount input--teal" type="number" placeholder="₱ 0.00" />
            <button className="btn btn--savings">Add</button>
          </div>
        </div>
      )}

      {/* Withdraw prompt */}
      {withdrawExpanded && (
        <div className="savings-prompt savings-prompt--withdraw">
          <div className="savings-prompt__label">Withdraw from Savings</div>
          <div className="savings-prompt__note">
            Transfer savings to your available balance.
            You have <span>₱ {fmt(totalSavings)}</span> in savings. Amount must not exceed this.
          </div>
          <div className="savings-prompt__input-row">
            <input className="input--savings-withdraw-amount input--teal" type="number" placeholder="₱ 0.00" />
            <button className="btn btn--savings">Transfer</button>
          </div>
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
          <div className="sstat__val" style={{ color: 'var(--blue)' }}>
            {savingsPct}%
          </div>
          <div className="sstat__label">of Total Funds</div>
        </div>
      </div>

      {/* Savings history */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Savings History</span>
          <span className="card__link">See all</span>
        </div>
        {savingsHistory.map(tx => (
          <div key={tx.id} className="tx-item">
            <div className="tx-icon" style={{ background: tx.bg }}>{tx.icon}</div>
            <div className="tx-info">
              <div className="tx-name">{tx.name}</div>
              <div className="tx-meta">{tx.meta}</div>
            </div>
            <div className={`tx-amount tx-amount--${tx.type}`}>
              {tx.amount > 0 ? '+' : '-'} ₱ {fmt(tx.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="insight insight--teal">
        <span className="insight__icon">🏦</span>
        <div>
          <div className="insight__title insight__title--teal">Save at least 20% of your income</div>
          <div className="insight__text">
            Financial advisors recommend saving 20% of every paycheck.
            You're currently at {savingsPct}% — great job keeping it up!
          </div>
        </div>
      </div>

    </div>
  )
}