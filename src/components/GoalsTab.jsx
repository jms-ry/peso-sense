import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './GoalsTab.css'

function fmt(n) {
  const num = parseFloat(n) || 0
  return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const GOAL_ICONS = [
  { icon: '💻', label: 'Laptop',   bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
  { icon: '📱', label: 'Phone',    bg: 'var(--amber-bg)',  color: 'var(--amber)'  },
  { icon: '✈️', label: 'Travel',   bg: 'var(--pink-bg)',   color: 'var(--pink)'   },
  { icon: '🏠', label: 'Home',     bg: 'var(--green-bg)',  color: 'var(--green)'  },
  { icon: '🚗', label: 'Vehicle',  bg: 'var(--teal-bg)',   color: 'var(--teal)'   },
  { icon: '📚', label: 'Education',bg: 'var(--purple-bg)', color: 'var(--purple)' },
  { icon: '💍', label: 'Wedding',  bg: 'var(--pink-bg)',   color: 'var(--pink)'   },
  { icon: '🎯', label: 'Other',    bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
]

function NewGoalForm({ onClose }) {
  const { addGoal } = useApp()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0])

  const canSubmit = name.trim() && parseFloat(target) > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    addGoal({
      name: name.trim(),
      target: parseFloat(target),
      icon: selectedIcon.icon,
      bg: selectedIcon.bg,
      color: selectedIcon.color,
    })
    onClose()
  }

  return (
    <div className="new-goal-form">
      <div className="new-goal-form__label">Goal Icon</div>
      <div className="new-goal-form__icons">
        {GOAL_ICONS.map(g => (
          <div
            key={g.label}
            className={`icon-btn ${selectedIcon.label === g.label ? 'icon-btn--active' : ''}`}
            onClick={() => setSelectedIcon(g)}
            style={selectedIcon.label === g.label ? { background: g.bg, borderColor: g.color + '66' } : {}}
          >
            <span>{g.icon}</span>
            <span className="icon-btn__label">{g.label}</span>
          </div>
        ))}
      </div>

      <div className="new-goal-form__label">Goal Name</div>
      <input
        className="new-goal-form__input"
        type="text"
        placeholder="e.g. New Laptop Fund"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={40}
      />

      <div className="new-goal-form__label">Target Amount</div>
      <input
        className="new-goal-form__input new-goal-form__input--amount"
        type="number"
        placeholder="₱ 0.00"
        value={target}
        onChange={e => setTarget(e.target.value)}
      />

      <div className="new-goal-form__actions">
        <button className="new-goal-form__cancel" onClick={onClose}>Cancel</button>
        <button
          className={`new-goal-form__submit ${canSubmit ? 'new-goal-form__submit--active' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Create Goal
        </button>
      </div>
    </div>
  )
}

function GoalCard({ goal }) {
  const { data, fundGoal, deleteGoal } = useApp()
  const availableBalance = data?.funds?.availableBalance ?? 0

  const [expanded, setExpanded] = useState(false)
  const [source, setSource] = useState('balance')
  const [amount, setAmount] = useState('')

  const pct = goal.target ? Math.round((goal.saved / goal.target) * 100) : 0
  const amt = parseFloat(amount)
  const exceedsBalance = source === 'balance' && amt > availableBalance
  const canAdd = amt > 0 && !exceedsBalance
  const isCompleted = goal.saved >= goal.target
  const hasProgress = goal.saved > 0
  const canDelete = goal.saved === 0

  const handleAdd = () => {
    if (!canAdd) return
    fundGoal({ goalId: goal.id, amount: amt, source })
    setAmount('')
    setExpanded(false)
  }

  return (
    <div className="goal-card">
      <div className="goal-card__top">
        <div className="goal-card__icon" style={{ background: goal.bg }}>{goal.icon}</div>
        <div className="goal-card__info">
          <div className="goal-card__name">{goal.name}</div>
          <div className="goal-card__target">Target: ₱ {fmt(goal.target)}</div>
        </div>
        <div className="goal-card__pct" style={{ color: goal.color }}>{pct}%</div>
      </div>

      <div className="goal-card__bar-wrap">
        <div className="goal-card__bar" style={{ width: `${pct}%`, background: goal.color }} />
      </div>

      <div className="goal-card__bottom">
        <div className="goal-card__progress">₱ {fmt(goal.saved)} of ₱ {fmt(goal.target)}</div>
        <div className="goal-card__actions">
          {/* Add button (only if not completed) */}
          {!isCompleted && (
            <button
              className="goal-card__add-btn"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '✕' : '＋'}
            </button>
          )}

          {/* Delete button (only if no progress) */}
          {canDelete && (
            <button
              className="goal-card__delete-btn"
              onClick={() => deleteGoal(goal.id)}
              title="Delete goal"
            >
              🗑
            </button>
          )}

          {/* Completed indicator */}
          {isCompleted && (
            <div className="goal-card__done">✔ Completed</div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="goal-card__prompt">
          <div className="goal-card__prompt-label">Where is this fund coming from?</div>
          <div className="goal-card__source-row">
            <div
              className={`source-goals-opt ${source === 'balance' ? 'source-goals-opt--active' : ''}`}
              onClick={() => setSource('balance')}
            >
              <div className="source-goals-opt__icon">💰</div>
              <div className="source-goals-opt__label">Available Balance</div>
            </div>
            <div
              className={`source-goals-opt ${source === 'new' ? 'source-goals-opt--active' : ''}`}
              onClick={() => setSource('new')}
            >
              <div className="source-goals-opt__icon">➕</div>
              <div className="source-goals-opt__label">New Fund</div>
            </div>
          </div>

          <div className="goal-card__prompt-note">
            {source === 'balance'
              ? <>Using available balance. You have <span>₱ {fmt(availableBalance)}</span> available.</>
              : <>New money will be added to your total funds and allocated to this goal.</>
            }
          </div>

          <div className="goal-card__prompt-input">
            <input
              className="input--goals-amount input--goals"
              type="number"
              placeholder="₱ 0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdd && handleAdd()}
            />
            <button
              className={`btn btn--goal ${!canAdd ? 'btn--disabled' : ''}`}
              onClick={handleAdd}
              disabled={!canAdd}
            >
              Add
            </button>
          </div>
          {exceedsBalance && amt > 0 && (
            <div className="goal-card__error">
              Amount exceeds available balance of ₱&nbsp;{fmt(availableBalance)}.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function GoalsTab() {
  const { data } = useApp()
  const [showNewForm, setShowNewForm] = useState(false)

  const goals = data?.goals ?? []
  const totalGoals = data?.funds?.totalGoals ?? 0
  const completed = goals.filter(g => g.saved >= g.target).length

  return (
    <div className="goals-tab">

      <div className="goals-stats">
        <div className="gstat">
          <div className="gstat__val" style={{ color: 'var(--purple)' }}>{goals.length}</div>
          <div className="gstat__label">Active Goals</div>
        </div>
        <div className="gstat">
          <div className="gstat__val" style={{ color: 'var(--blue)' }}>₱ {fmt(totalGoals)}</div>
          <div className="gstat__label">Total Saved</div>
        </div>
        <div className="gstat">
          <div className="gstat__val" style={{ color: 'var(--green)' }}>{completed}</div>
          <div className="gstat__label">Completed</div>
        </div>
      </div>

      <div className="goals-list">
        <div className="goals-list__hdr">
          <span className="goals-list__title">My Goals</span>
          <span
            className="goals-list__link"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            {showNewForm ? '✕ Cancel' : '+ New Goal'}
          </span>
        </div>

        {showNewForm && (
          <NewGoalForm onClose={() => setShowNewForm(false)} />
        )}

        {goals.length === 0 && !showNewForm && (
          <div className="empty-state">No goals yet. Create one to get started!</div>
        )}

        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <div className="insight insight--purple">
        <span className="insight__icon">🎯</span>
        <div>
          <div className="insight__title insight__title--purple">Tip: Automate your contributions</div>
          <div className="insight__text">
            Set aside a fixed amount for each goal every time you receive income.
            Even ₱ 200/week adds up to ₱ 800/month toward your goals.
          </div>
        </div>
      </div>

    </div>
  )
}