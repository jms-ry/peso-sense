import { createContext, useContext } from 'react'
import { useStorage } from '../hooks/useStorage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { data, updateData } = useStorage()

  // ── ADD FUNDS ──────────────────────────────────────────────
  function addFunds({ amount, category, icon, name }) {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return

    const tx = {
      id: crypto.randomUUID(),
      type: 'income',
      category,
      icon,
      name,
      amount: amt,
      date: new Date().toISOString(),
    }

    updateData(prev => ({
      ...prev,
      funds: {
        ...prev.funds,
        totalFunds:       prev.funds.totalFunds + amt,
        availableBalance: prev.funds.availableBalance + amt,
      },
      transactions: [tx, ...prev.transactions],
    }))
  }

  // ── LOG EXPENSE ────────────────────────────────────────────
  function logExpense({ amount, category, icon, name }) {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (amt > data.funds.availableBalance) return

    const tx = {
      id: crypto.randomUUID(),
      type: 'expense',
      category,
      icon,
      name: name || category,
      amount: amt,
      date: new Date().toISOString(),
    }

    updateData(prev => ({
      ...prev,
      funds: {
        ...prev.funds,
        availableBalance: prev.funds.availableBalance - amt,
        totalExpenses:    prev.funds.totalExpenses + amt,
      },
      transactions: [tx, ...prev.transactions],
    }))
  }

  // ── ADD GOAL ───────────────────────────────────────────────
  function addGoal({ name, target, icon, bg, color }) {
    const goal = {
      id: crypto.randomUUID(),
      name,
      target: parseFloat(target),
      saved: 0,
      icon,
      bg,
      color,
      createdAt: new Date().toISOString(),
    }

    updateData(prev => ({
      ...prev,
      goals: [...prev.goals, goal],
    }))
  }

  // ── FUND GOAL ──────────────────────────────────────────────
  function fundGoal({ goalId, amount, source }) {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (source === 'balance' && amt > data.funds.availableBalance) return

    // guard: cannot fund a completed goal
    const goal = data.goals.find(g => g.id === goalId)
    if (!goal) return
    if (goal.saved >= goal.target) return

    // cap the amount to not exceed the remaining target
    const remaining = goal.target - goal.saved
    const finalAmt = Math.min(amt, remaining)

    const tx = {
      id: crypto.randomUUID(),
      type: 'goal',
      category: 'Goal',
      icon: '🎯',
      name: `Added to ${goal.name}`,
      amount: finalAmt,
      date: new Date().toISOString(),
    }

    updateData(prev => ({
      ...prev,
      funds: {
        ...prev.funds,
        totalFunds:       source === 'new' ? prev.funds.totalFunds + finalAmt : prev.funds.totalFunds,
        availableBalance: source === 'balance' ? prev.funds.availableBalance - finalAmt : prev.funds.availableBalance,
        totalGoals:       prev.funds.totalGoals + finalAmt,
      },
      goals: prev.goals.map(g =>
        g.id === goalId ? { ...g, saved: g.saved + finalAmt } : g
      ),
      transactions: [tx, ...prev.transactions],
    }))
  }

  // ── ADD SAVINGS ────────────────────────────────────────────
  function addSavings({ amount, source }) {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (source === 'balance' && amt > data.funds.availableBalance) return

    const entry = {
      id: crypto.randomUUID(),
      type: 'add',
      amount: amt,
      source,
      date: new Date().toISOString(),
    }

    const tx = {
      id: crypto.randomUUID(),
      type: 'savings',
      category: 'Savings',
      icon: '🏦',
      name: 'Added to Savings',
      amount: amt,
      date: new Date().toISOString(),
    }

    updateData(prev => ({
      ...prev,
      funds: {
        ...prev.funds,
        totalFunds:       source === 'new' ? prev.funds.totalFunds + amt : prev.funds.totalFunds,
        availableBalance: source === 'balance' ? prev.funds.availableBalance - amt : prev.funds.availableBalance,
        totalSavings:     prev.funds.totalSavings + amt,
      },
      savings: {
        ...prev.savings,
        total:      prev.savings.total + amt,
        totalAdded: prev.savings.totalAdded + amt,
        history:    [entry, ...prev.savings.history],
      },
      transactions: [tx, ...prev.transactions],
    }))
  }

  // ── WITHDRAW SAVINGS ───────────────────────────────────────
  function withdrawSavings({ amount }) {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (amt > data.savings.total) return

    const entry = {
      id: crypto.randomUUID(),
      type: 'withdraw',
      amount: amt,
      source: 'savings',
      date: new Date().toISOString(),
    }

    const tx = {
      id: crypto.randomUUID(),
      type: 'withdrawal',
      category: 'Savings',
      icon: '↓',
      name: 'Withdrawal from Savings',
      amount: amt,
      date: new Date().toISOString(),
    }

    updateData(prev => ({
      ...prev,
      funds: {
        ...prev.funds,
        availableBalance: prev.funds.availableBalance + amt,
        totalSavings:     prev.funds.totalSavings - amt,
      },
      savings: {
        ...prev.savings,
        total:           prev.savings.total - amt,
        totalWithdrawn:  prev.savings.totalWithdrawn + amt,
        history:         [entry, ...prev.savings.history],
      },
      transactions: [tx, ...prev.transactions],
    }))
  }

  // ── DELETE GOAL ────────────────────────────────────────────
  function deleteGoal(goalId) {
    const goal = data.goals.find(g => g.id === goalId)
    if (!goal) return

    if(goal.saved > 0) return
    
    updateData(prev => ({
      ...prev,
      funds: {
        ...prev.funds,
        totalGoals:       prev.funds.totalGoals - goal.saved,
        availableBalance: prev.funds.availableBalance + goal.saved,
      },
      goals: prev.goals.filter(g => g.id !== goalId),
    }))
  }

  return (
    <AppContext.Provider value={{
      data,
      addFunds,
      logExpense,
      addGoal,
      fundGoal,
      addSavings,
      withdrawSavings,
      deleteGoal,
      updateData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}