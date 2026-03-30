import { useState } from 'react'
import './GoalsTab.css'

function fmt(n) {
  return n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function GoalCard({ goal, availableBalance }) {
  const [expanded, setExpanded] = useState(false)
  const [source, setSource] = useState('balance')
  const pct = Math.round((goal.saved / goal.target) * 100)

  return (
    <div className="goal-card">
      <div className="goal-card__top">
        <div className="goal-card__icon" style={{ background: goal.bg }}>
          {goal.icon}
        </div>
        <div className="goal-card__info">
          <div className="goal-card__name">{goal.name}</div>
          <div className="goal-card__target">Target: ₱ {fmt(goal.target)}</div>
        </div>
        <div className="goal-card__pct" style={{ color: goal.color }}>{pct}%</div>
      </div>

      <div className="goal-card__bar-wrap">
        <div
          className="goal-card__bar"
          style={{ width: `${pct}%`, background: goal.color }}
        />
      </div>

      <div className="goal-card__bottom">
        <div className="goal-card__progress">
          ₱ {fmt(goal.saved)} of ₱ {fmt(goal.target)}
        </div>
        <button
          className="goal-card__add-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '✕ Cancel' : '＋ Add Fund'}
        </button>
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
            <input className="input--goals-amount input--goals" type="number" placeholder="₱ 0.00" />
            <button className="btn btn--goal">Add</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GoalsTab({ data }) {
  const { goals, availableBalance, totalGoals } = data

  return (
    <div className="goals-tab">

      {/* Stats */}
      <div className="goals-stats">
        <div className="gstat">
          <div className="gstat__val" style={{ color: 'var(--purple)' }}>{goals.length}</div>
          <div className="gstat__label">Active Goals</div>
        </div>
        <div className="gstat">
          <div className="gstat__val" style={{ color: 'var(--blue)' }}>₱ {totalGoals.toLocaleString()}</div>
          <div className="gstat__label">Total Saved</div>
        </div>
        <div className="gstat">
          <div className="gstat__val" style={{ color: 'var(--green)' }}>1</div>
          <div className="gstat__label">Completed</div>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="goals-list">
        <div className="goals-list__hdr">
          <span className="goals-list__title">My Goals</span>
          <span className="goals-list__link">+ New Goal</span>
        </div>
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            availableBalance={availableBalance}
          />
        ))}
      </div>

      {/* Tip */}
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