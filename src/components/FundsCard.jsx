import './FundsCard.css'

function fmt(n) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FundsCard({ data }) {
  const { totalFunds, availableBalance, totalExpenses, totalGoals, totalSavings } = data

  const expPct  = Math.round((totalExpenses / totalFunds) * 100)
  const goalPct = Math.round((totalGoals    / totalFunds) * 100)
  const savPct  = Math.round((totalSavings  / totalFunds) * 100)
  const freePct = 100 - expPct - goalPct - savPct

  return (
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
        <button className="funds-card__add-btn">＋ Add Funds</button>
      </div>

      <div className="funds-card__seg-wrap">
        {freePct > 0 && <div className="funds-card__seg funds-card__seg--free" style={{ flex: freePct }} />}
        <div className="funds-card__seg funds-card__seg--goals"   style={{ flex: goalPct }} />
        <div className="funds-card__seg funds-card__seg--savings" style={{ flex: savPct  }} />
        <div className="funds-card__seg funds-card__seg--expense" style={{ flex: expPct  }} />
      </div>

      <div className="funds-card__legend">
        {freePct > 0 && (
          <div className="legend-item">
            <div className="legend-dot legend-dot--free" />
            <span>Free {freePct}%</span>
          </div>
        )}
        <div className="legend-item">
          <div className="legend-dot legend-dot--goals" />
          <span>Goals {goalPct}%</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot--savings" />
          <span>Savings {savPct}%</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot legend-dot--expense" />
          <span>Expenses {expPct}%</span>
        </div>
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
  )
}