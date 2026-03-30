import { useState } from 'react'
import AddFundsModal from './AddFundsModal'
import './FundsCard.css'

function fmt(n) {
  const num = parseFloat(n) || 0
  return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FundsCard({ data }) {
  const [showModal, setShowModal] = useState(false)

  const {
    totalFunds       = 0,
    availableBalance = 0,
    totalExpenses    = 0,
    totalGoals       = 0,
    totalSavings     = 0,
  } = data?.funds ?? {}

  const expPct  = totalFunds ? Math.round((totalExpenses / totalFunds) * 100) : 0
  const goalPct = totalFunds ? Math.round((totalGoals    / totalFunds) * 100) : 0
  const savPct  = totalFunds ? Math.round((totalSavings  / totalFunds) * 100) : 0
  const freePct = totalFunds ? 100 - expPct - goalPct - savPct : 0

  return (
    <>
      <div className="funds-card">
        <div className="funds-card__glow" />
        <div className="funds-card__glow2" />

        <div className="funds-card__top">
          <div className="funds-card__balances">
            <div className="funds-card__avail-label">Available Balance</div>
            <div className="funds-card__avail-amount">₱ {fmt(availableBalance)}</div>
            <div className="funds-card__total-label">
              of total funds <span className="funds-card__total-amount">₱ {fmt(totalFunds)}</span>
            </div>
          </div>
          <button className="funds-card__add-btn" onClick={() => setShowModal(true)}>
            ＋ Add Funds
          </button>
        </div>

        <div className="funds-card__seg-wrap">
          <div className="funds-card__seg funds-card__seg--expense" style={{ flex: expPct  || 1 }} />
          <div className="funds-card__seg funds-card__seg--goals"   style={{ flex: goalPct || 0 }} />
          <div className="funds-card__seg funds-card__seg--savings" style={{ flex: savPct  || 0 }} />
          {freePct > 0 && <div className="funds-card__seg funds-card__seg--free" style={{ flex: freePct }} />}
        </div>

        <div className="funds-card__legend">
          <div className="legend-item">
            <div className="legend-dot legend-dot--expense" />
            <span>Expenses {expPct}%</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--goals" />
            <span>Goals {goalPct}%</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--savings" />
            <span>Savings {savPct}%</span>
          </div>
          {freePct > 0 && (
            <div className="legend-item">
              <div className="legend-dot legend-dot--free" />
              <span>Free {freePct}%</span>
            </div>
          )}
        </div>

        <div className="funds-card__stats">
          <div className="funds-stat">
            <div className="funds-stat__val funds-stat__val--red">₱ {fmt(totalExpenses)}</div>
            <div className="funds-stat__label">Expenses</div>
          </div>
          <div className="funds-stat">
            <div className="funds-stat__val funds-stat__val--blue">₱ {fmt(totalGoals)}</div>
            <div className="funds-stat__label">In Goals</div>
          </div>
          <div className="funds-stat">
            <div className="funds-stat__val funds-stat__val--green">₱ {fmt(totalSavings)}</div>
            <div className="funds-stat__label">Savings</div>
          </div>
        </div>
      </div>

      {showModal && <AddFundsModal onClose={() => setShowModal(false)} />}
    </>
  )
}