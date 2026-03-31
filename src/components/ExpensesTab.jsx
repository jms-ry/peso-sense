import { useState } from 'react'
import { useApp } from '../context/AppContext'
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

export default function ExpensesTab() {
  const { data, logExpense } = useApp()
  const { transactions = [], funds = {} } = data ?? {}

  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [setError] = useState('')
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [showTransactions, setShowTransactions] = useState(true)
  const amt = parseFloat(amount)
  const exceedsBalance = amt > (funds.availableBalance ?? 0)
  const canAdd = amt > 0 && !exceedsBalance
 
  const handleAdd = () => {
  if (!canAdd) return

  logExpense({
    amount: amt,
    category: selectedCat.label,
    icon: selectedCat.icon,
    name: selectedCat.label,
  })

  setAmount('')
}
  // Build breakdown from transactions
  const expenseTransactions = transactions.filter(tx => tx.type === 'expense')
  const totalSpent = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0)

  const breakdownMap = {}
  for (const tx of expenseTransactions) {
    if (!breakdownMap[tx.category]) {
      breakdownMap[tx.category] = { icon: tx.icon, amount: 0 }
    }
    breakdownMap[tx.category].amount += tx.amount
  }

  const breakdown = Object.entries(breakdownMap)
    .map(([category, { icon, amount }]) => ({
      category,
      icon,
      amount,
      pct: totalSpent ? Math.round((amount / totalSpent) * 100) : 0,
      color: CATEGORIES.find(c => c.label === category)?.color ?? 'var(--muted)',
    }))
    .sort((a, b) => b.amount - a.amount)

  const CATEGORY_COLORS = {
    'Food':          'var(--amber)',
    'Fare':          'var(--blue)',
    'Bills':         'var(--red)',
    'Groceries':     'var(--green)',
    'Health':        'var(--teal)',
    'Leisure':       'var(--pink)',
    'Clothing':      'var(--purple)',
    'Other':         'var(--muted-l)',
  }

  return (
    <div className="expenses-tab">

      {/* Log Expense */}
      <div className="log-panel">
        <div className="log-panel__label">Log Expense</div>
        <div className="log-panel__categories">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className={`cat-btn ${selectedCat.id === cat.id ? 'cat-btn--active' : ''}`}
              onClick={() => { setSelectedCat(cat); setError('') }}
            >
              <span className="cat-btn__icon">{cat.icon}</span>
              <span className="cat-btn__label">{cat.label}</span>
            </div>
          ))}
        </div>
        <div className="log-panel__input-row">
          <input
            className="input--expenses-amount"
            type="number"
            placeholder="₱ 0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canAdd && handleAdd()}
          />
          <button
            className={`btn btn--expenses ${canAdd ? '' : 'btn--disabled'}`}
            onClick={handleAdd}
            disabled={!canAdd}
          >
            Add Expense
          </button>
        </div>
        {exceedsBalance && amt > 0 && (
          <div className="log-panel__error">
            <span>
              Amount exceeds available balance of ₱ {fmt(funds.availableBalance ?? 0)}.
            </span>
          </div>
        )}
      </div>

      {/* Spending Breakdown */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Spending Breakdown</span>
          <span className="card__toggle" onClick={() => setShowBreakdown(!showBreakdown)}>
            {showBreakdown ? '▲ Hide' : '▼ Show'}
          </span>
        </div>
        {showBreakdown && (
          breakdown.length === 0
            ? <div className="empty-state">No expenses logged yet.</div>
            : breakdown.map((exp, i) => (
              <div key={i} className="breakdown-item">
                <div className="breakdown-icon" style={{ background: `${CATEGORY_COLORS[exp.category] ?? 'var(--muted)'}1A` }}>
                  {exp.icon}
                </div>
                <div className="breakdown-info">
                  <div className="breakdown-name">{exp.category}</div>
                  <div className="breakdown-bar-wrap">
                    <div
                      className="breakdown-bar"
                      style={{ width: `${exp.pct}%`, background: CATEGORY_COLORS[exp.category] ?? 'var(--muted)' }}
                    />
                  </div>
                </div>
                <div className="breakdown-right">
                  <div className="breakdown-amount">₱ {fmt(exp.amount)}</div>
                  <div className="breakdown-pct">{exp.pct}%</div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Insight */}
      <div className="insight">
        <span className="insight__icon">💡</span>
        <div>
          <div className="insight__title">Track every peso</div>
          <div className="insight__text">
            Logging expenses consistently helps you understand where your money goes
            and make smarter spending decisions over time.
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Recent Transactions</span>
          <span className="card__toggle" onClick={() => setShowTransactions(!showTransactions)}>
            {showTransactions ? '▲ Hide' : '▼ Show'}
          </span>
        </div>
        {showTransactions && (
          transactions.length === 0
            ? <div className="empty-state">No transactions yet.</div>
            : transactions.slice(0, 10).map(tx => (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: `${CATEGORY_COLORS[tx.category] ?? 'var(--blue)'}1A` }}>
                  {tx.icon}
                </div>
                <div className="tx-info">
                  <div className="tx-name">{tx.name}</div>
                  <div className="tx-meta">{tx.category} · {formatDate(tx.date)}</div>
                </div>
                <div className={`tx-amount tx-amount--${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'} ₱ {fmt(tx.amount)}
                </div>
              </div>
            ))
        )}
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