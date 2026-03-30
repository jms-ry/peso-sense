import { useState } from 'react'
import './ExpensesTab.css'

const CATEGORIES = [
  { id: 'food',      icon: '🍚', label: 'Food'      },
  { id: 'fare',      icon: '🚌', label: 'Fare'       },
  { id: 'bills',     icon: '🏠', label: 'Bills'      },
  { id: 'groceries', icon: '🛒', label: 'Groceries'  },
  { id: 'health',    icon: '💊', label: 'Health'     },
  { id: 'leisure',   icon: '🎮', label: 'Leisure'    },
  { id: 'clothing',  icon: '👕', label: 'Clothing'   },
  { id: 'other',     icon: '➕', label: 'Other'      },
]

function fmt(n) {
  return Math.abs(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ExpensesTab({ data }) {
  const { expenses, transactions } = data
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [showTransactions, setShowTransactions] = useState(true)

  return (
    <div className="expenses-tab">

      {/* Log Expense */}
      <div className="log-panel">
        <div className="log-panel__label">Log Expense</div>
        <div className="log-panel__categories">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.id} className={`cat-btn ${i === 0 ? 'cat-btn--active' : ''}`}>
              <span className="cat-btn__icon">{cat.icon}</span>
              <span className="cat-btn__label">{cat.label}</span>
            </div>
          ))}
        </div>
        <div className="log-panel__input-row">
          <input className="input--expenses-amount" type="number" placeholder="₱ 0.00" />
          <button className="btn btn--expenses">Add Expense</button>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Spending Breakdown</span>
          <span
            className="card__toggle"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {showBreakdown ? '▲ Hide' : '▼ Show'}
          </span>
        </div>
        {showBreakdown && expenses.map(exp => (
          <div key={exp.id} className="breakdown-item">
            <div className="breakdown-icon" style={{ background: `${exp.color}1A` }}>
              {exp.icon}
            </div>
            <div className="breakdown-info">
              <div className="breakdown-name">{exp.category}</div>
              <div className="breakdown-bar-wrap">
                <div
                  className="breakdown-bar"
                  style={{ width: `${exp.pct}%`, background: exp.color }}
                />
              </div>
            </div>
            <div className="breakdown-right">
              <div className="breakdown-amount">₱ {fmt(exp.amount)}</div>
              <div className="breakdown-pct">{exp.pct}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div className="insight">
        <span className="insight__icon">💡</span>
        <div>
          <div className="insight__title">Food is your biggest expense</div>
          <div className="insight__text">
            At 55% of total spending, food costs are high. Consider meal prepping
            or buying from wet markets to save ₱ 500–800/month.
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Recent Transactions</span>
          <span
            className="card__toggle"
            onClick={() => setShowTransactions(!showTransactions)}
          >
            {showTransactions ? '▲ Hide' : '▼ Show'}
          </span>
        </div>
        {showTransactions && transactions.map(tx => (
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

      {/* Tips */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">💡 Money Tips</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">🛒</span>
          <div className="tip-info">
            <div className="tip-name">Buy from wet markets</div>
            <div className="tip-desc">vs supermarkets for fresh produce</div>
          </div>
          <div className="tip-savings">Save ₱ 600/mo</div>
        </div>
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <div className="tip-info">
            <div className="tip-name">Unplug idle appliances</div>
            <div className="tip-desc">Reduce your electric bill</div>
          </div>
          <div className="tip-savings">Save ₱ 200/mo</div>
        </div>
        <div className="tip-item">
          <span className="tip-icon">📱</span>
          <div className="tip-info">
            <div className="tip-name">Use free WiFi when available</div>
            <div className="tip-desc">Skip daily mobile data top-ups</div>
          </div>
          <div className="tip-savings">Save ₱ 150/mo</div>
        </div>
      </div>

    </div>
  )
}