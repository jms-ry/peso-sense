import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { generateInsights } from '../utils/insights'
import InsightsCard from './InsightsCard'
import { useToast } from '../context/ToastContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

function SwipeableTransaction({ tx, onUndo, colorMap }) {
  const [swiped, setSwiped]     = useState(false)
  const startXRef               = useRef(null)
  const containerRef            = useRef(null)

  const SWIPE_THRESHOLD = 60

  // ── Touch ──────────────────────────────────────────────────
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (startXRef.current === null) return
    const diff = startXRef.current - e.changedTouches[0].clientX
    if (diff > SWIPE_THRESHOLD)  setSwiped(true)
    if (diff < -SWIPE_THRESHOLD) setSwiped(false)
    startXRef.current = null
  }

  // ── Mouse ──────────────────────────────────────────────────
  const handleMouseDown = (e) => {
    startXRef.current = e.clientX
  }

  const handleMouseUp = (e) => {
    if (startXRef.current === null) return
    const diff = startXRef.current - e.clientX
    if (diff > SWIPE_THRESHOLD)  setSwiped(true)
    if (diff < -SWIPE_THRESHOLD) setSwiped(false)
    startXRef.current = null
  }

  return (
    <div className="swipeable-wrap" ref={containerRef}>
      <div
        className={`swipeable-content ${swiped ? 'swipeable-content--swiped' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="tx-item">
          <div
            className="tx-icon"
            style={{ background: `${colorMap[tx.category] ?? 'var(--blue)'}1A` }}
          >
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
      </div>
      <div className={`swipeable-actions ${swiped ? 'swipeable-actions--visible' : ''}`}>
        <button
          className="undo-btn"
          onClick={() => { onUndo(tx); setSwiped(false) }}
        >
          ↩ Undo
        </button>
      </div>
    </div>
  )
}

export default function ExpensesTab() {
  const { data, logExpense, undoTransaction } = useApp()
  const { transactions = [], funds = {} } = data ?? {}

  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [showTransactions, setShowTransactions] = useState(true)
  const amt = parseFloat(amount)
  const exceedsBalance = amt > (funds.availableBalance ?? 0)
  const canAdd = amt > 0 && !exceedsBalance
  const insights = generateInsights(data)
  const { showToast } = useToast()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const handleAdd = () => {
  if (!canAdd) return

  logExpense({
    amount: amt,
    category: selectedCat.label,
    icon: selectedCat.icon,
    name: selectedCat.label,
  })

  setAmount('')
  showToast(`Logged ₱${amt.toFixed(2)} for ${selectedCat.label}!`, 'success')
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

  function groupByMonth(transactions) {
    return transactions.reduce((acc, tx) => {
      const date = new Date(tx.date)
      const key = date.toLocaleString('en-PH', { month: 'long', year: 'numeric' })

      if (!acc[key]) acc[key] = []
      acc[key].push(tx)

      return acc
    }, {})
  }
  function handleExportPDF() {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.text('Transaction Report', 14, 15)

    doc.setFontSize(10)
    doc.text(`Generated on ${new Date().toLocaleDateString('en-PH')}`, 14, 22)

    let y = 30

    const grouped = groupByMonth(transactions)

    Object.entries(grouped).forEach(([month, txs]) => {
      // Month Header
      doc.setFontSize(12)
      doc.text(month, 14, y)
      y += 4

      // Table
      autoTable(doc, {
        startY: y,
        head: [['Name', 'Category', 'Date', 'Type', 'Amount']],
        body: txs.map(tx => [
          tx.name,
          tx.category,
          formatDate(tx.date),
          tx.type,
          `₱ ${fmt(Math.abs(tx.amount.toFixed(2)))}`
        ]),
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [30, 30, 30],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 14, right: 14 },
      })

      // Move cursor after table
      y = doc.lastAutoTable.finalY + 10

      // Page break if needed
      if (y > 260) {
        doc.addPage()
        y = 20
      }
    })

    doc.save('transactions-report.pdf')
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
              Amount exceeds available balance of ₱&nbsp;{fmt(funds.availableBalance ?? 0)}.
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

      <InsightsCard insights={insights} />

      {/* Recent Transactions */}
      <div className="card">
        <div className="card__hdr">
          <span className="card__title">Recent Transactions</span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="card__link" onClick={handleExportPDF}>
              View All
            </span>

            <span className="card__toggle" onClick={() => setShowTransactions(!showTransactions)}>
              {showTransactions ? '▲ Hide' : '▼ Show'}
            </span>
          </div>
        </div>
        {showTransactions && transactions.length > 0 && (
          <div className="undo-hint">
            {isMobile 
              ? 'Swipe left a transaction to see undo option.' 
              : 'Drag left a transaction to see undo option.'}
          </div>
        )}
        {showTransactions && (
          transactions.length === 0
            ? <div className="empty-state">No transactions yet.</div>
          : transactions.slice(0, 10).map(tx => (
            <SwipeableTransaction
              key={tx.id}
              tx={tx}
              onUndo={undoTransaction}
              colorMap={CATEGORY_COLORS}
            />
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