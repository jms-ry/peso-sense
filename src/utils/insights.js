export function generateInsights(data) {
  const insights = []

  const {
    funds: {
      availableBalance = 0,
      totalFunds       = 0,
      totalExpenses    = 0,
      totalSavings     = 0,
    } = {},
    transactions = [],
    goals        = [],
    savings: {
      totalAdded = 0,
    } = {},
  } = data ?? {}

  // ── helpers ──────────────────────────────────────────────
  const expenseTransactions = transactions.filter(t => t.type === 'expense')

  const categoryTotals = {}
  for (const tx of expenseTransactions) {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayOfMonth    = new Date().getDate()
  const daysInMonth   = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - dayOfMonth

  // ── Rule 1 — Zero balance ─────────────────────────────────
  if (totalFunds > 0 && availableBalance <= 0) {
    insights.push({
      id:    'zero-balance',
      type:  'danger',
      icon:  '🚨',
      title: 'Available balance is empty',
      text:  'You have no available balance left. Add funds or withdraw from savings to continue tracking.',
    })
  }

  // ── Rule 2 — Balance nearly exhausted (>80% spent) ───────
  if (
    totalFunds > 0 &&
    availableBalance > 0 &&
    totalExpenses > 0 &&
    (totalExpenses / (totalExpenses + availableBalance)) >= 0.8
  ) {
    const pct = Math.round((totalExpenses / (totalExpenses + availableBalance)) * 100)
    insights.push({
      id:    'balance-low',
      type:  'warning',
      icon:  '⚠️',
      title: `${pct}% of spendable funds used`,
      text:  'You\'ve used most of your available balance. Consider adding more funds or reducing spending.',
    })
  }

  // ── Rule 3 — Spending pace ────────────────────────────────
  if (dayOfMonth > 3 && totalExpenses > 0 && availableBalance > 0) {
    const dailyRate     = totalExpenses / dayOfMonth
    const projectedLeft = availableBalance / dailyRate

    if (projectedLeft < 5 && projectedLeft >= 0) {
      insights.push({
        id:    'spending-pace',
        type:  'warning',
        icon:  '📉',
        title: `Balance may run out in ~${Math.ceil(projectedLeft)} day${Math.ceil(projectedLeft) === 1 ? '' : 's'}`,
        text:  `At your current spending rate of ₱ ${dailyRate.toLocaleString('en-PH', { maximumFractionDigits: 0 })}/day, your balance could be depleted soon.`,
      })
    }
  }

  // ── Rule 4 — Single category dominates ───────────────────
  if (totalExpenses > 0) {
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0]

    if (topCategory) {
      const [name, amount] = topCategory
      const pct = Math.round((amount / totalExpenses) * 100)
      if (pct >= 50) {
        insights.push({
          id:    'category-dominant',
          type:  'tip',
          icon:  '💡',
          title: `${name} is ${pct}% of your spending`,
          text:  `${name} takes up more than half your expenses. Consider if there are ways to reduce this category.`,
        })
      }
    }
  }

  // ── Rule 5 — Leisure or Clothing overspending ─────────────
  if (totalExpenses > 0) {
    for (const cat of ['Leisure', 'Clothing']) {
      const amt = categoryTotals[cat] || 0
      const pct = Math.round((amt / totalExpenses) * 100)
      if (pct >= 20) {
        insights.push({
          id:    `discretionary-${cat.toLowerCase()}`,
          type:  'tip',
          icon:  '💡',
          title: `${cat} spending is at ${pct}%`,
          text:  `${cat} accounts for ${pct}% of your expenses. Review if this aligns with your financial goals.`,
        })
      }
    }
  }

  // ── Rule 6 — No savings yet ───────────────────────────────
  if (totalFunds > 0 && totalAdded === 0) {
    insights.push({
      id:    'no-savings',
      type:  'tip',
      icon:  '🏦',
      title: 'You haven\'t saved anything yet',
      text:  'Even saving a small amount consistently builds a strong financial habit. Try setting aside ₱ 100 today.',
    })
  }

  // ── Rule 7 — Low savings rate ─────────────────────────────
  if (totalFunds > 0 && totalAdded > 0) {
    const savingsPct = Math.round((totalSavings / totalFunds) * 100)
    if (savingsPct < 10) {
      insights.push({
        id:    'low-savings',
        type:  'tip',
        icon:  '🏦',
        title: `Savings at ${savingsPct}% of total funds`,
        text:  'Financial advisors recommend keeping at least 20% in savings. Try allocating more when you add funds.',
      })
    }
  }

  // ── Rule 8 — Goal nearly complete ────────────────────────
  const nearlyDoneGoal = goals.find(g =>
    g.target > 0 &&
    g.saved < g.target &&
    (g.saved / g.target) >= 0.9
  )

  if (nearlyDoneGoal) {
    const pct = Math.round((nearlyDoneGoal.saved / nearlyDoneGoal.target) * 100)
    insights.push({
      id:    `goal-almost-${nearlyDoneGoal.id}`,
      type:  'success',
      icon:  '🎯',
      title: `"${nearlyDoneGoal.name}" is ${pct}% complete!`,
      text:  `You're so close! Only ₱ ${(nearlyDoneGoal.target - nearlyDoneGoal.saved).toLocaleString('en-PH', { minimumFractionDigits: 2 })} more to reach your goal.`,
    })
  }

  // ── Rule 9 — Goal not funded in 7+ days ──────────────────
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const neglectedGoal = goals.find(g => {
    if (g.saved <= 0 || g.saved >= g.target) return false
    const goalTxs = transactions.filter(
      tx => tx.type === 'goal' && tx.name.includes(g.name)
    )
    if (goalTxs.length === 0) return false
    const lastFunded = new Date(goalTxs[0].date)
    return lastFunded < sevenDaysAgo
  })

  if (neglectedGoal) {
    insights.push({
      id:    `goal-neglected-${neglectedGoal.id}`,
      type:  'tip',
      icon:  '🎯',
      title: `"${neglectedGoal.name}" needs attention`,
      text:  `You haven't added to this goal in over 7 days. A small contribution keeps your momentum going.`,
    })
  }

  // ── Rule 10 — No expenses logged today ───────────────────
  const loggedToday = expenseTransactions.some(tx => {
    const txDate = new Date(tx.date)
    txDate.setHours(0, 0, 0, 0)
    return txDate.getTime() === today.getTime()
  })

  if (totalFunds > 0 && !loggedToday && totalExpenses > 0) {
    insights.push({
      id:    'no-log-today',
      type:  'reminder',
      icon:  '📝',
      title: 'No expenses logged today',
      text:  'Keep your tracker accurate by logging today\'s spending.',
    })
  }

  // ── Return top 2 by priority ──────────────────────────────
  const PRIORITY = ['danger', 'warning', 'success', 'tip', 'reminder']
  return insights
    .sort((a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type))
    .slice(0, 2)
}