import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pesosense_data'

const DEFAULT_STATE = {
  funds: {
    totalFunds: 0,
    availableBalance: 0,
    totalGoals: 0,
    totalSavings: 0,
    totalExpenses: 0,
  },
  expenses: [],
  transactions: [],
  goals: [],
  savings: {
    total: 0,
    totalAdded: 0,
    totalWithdrawn: 0,
    savingsHistory: [],
  },
  meta: {
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    version: 1,
  },
}

function migrateData(data) {
  // fix corrupted savings shape
  if ('savingsTotal' in data.savings) {
    data.savings = {
      ...data.savings,
      total: data.savings.savingsTotal,
    }
    delete data.savings.savingsTotal
  }
  return data
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return migrateData(parsed)
  } catch {
    return DEFAULT_STATE
  }
}

function saveToStorage(data) {
  try {
    const updated = {
      ...data,
      meta: { ...data.meta, lastUpdated: new Date().toISOString() },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return data
  }
}

export function useStorage() {
  const [data, setData] = useState(loadFromStorage)

  useEffect(() => {
    saveToStorage(data)
  }, [data])

  const updateData = (updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }

  return { data, updateData }
}