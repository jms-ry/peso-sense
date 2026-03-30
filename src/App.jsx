import { useState } from 'react'
import Header from './components/Header'
import FundsCard from './components/FundsCard'
import TabBar from './components/TabBar'
import ExpensesTab from './components/ExpensesTab'
import GoalsTab from './components/GoalsTab'
import SavingsTab from './components/SavingsTab'
import Footer from './components/Footer'
import './App.css'

const DUMMY_DATA = {
  totalFunds: 12450,
  availableBalance: 5212.50,
  totalExpenses: 6100,
  totalGoals: 3487.50,
  totalSavings: 2500,

  expenses: [
    { id: 1, category: 'Food',           icon: '🍚', color: 'var(--amber)',  amount: 3355, pct: 55 },
    { id: 2, category: 'Transportation', icon: '🚌', color: 'var(--blue)',   amount: 1342, pct: 22 },
    { id: 3, category: 'Bills',          icon: '🏠', color: 'var(--red)',    amount: 854,  pct: 14 },
    { id: 4, category: 'Leisure',        icon: '🎮', color: 'var(--pink)',   amount: 549,  pct: 9  },
  ],

  transactions: [
    { id: 1,  icon: '🍱', bg: 'var(--amber-bg)',  name: 'Lunch — Carinderia',      meta: 'Food · Today, 12:30 PM',   amount: -85,    type: 'expense'  },
    { id: 2,  icon: '🚌', bg: 'var(--blue-bg)',   name: 'Jeepney fare',             meta: 'Fare · Today, 7:15 AM',    amount: -14,    type: 'expense'  },
    { id: 3,  icon: '🎯', bg: 'var(--purple-bg)', name: 'Added to Laptop Fund',     meta: 'Goal · Yesterday, 9 PM',   amount: -500,   type: 'goal'     },
    { id: 4,  icon: '💸', bg: 'var(--green-bg)',  name: 'Monthly salary',           meta: 'Income · Mar 1',           amount: 8000,   type: 'income'   },
    { id: 5,  icon: '🏦', bg: 'var(--teal-bg)',   name: 'Added to Savings',         meta: 'Savings · Mar 1',          amount: -1000,  type: 'savings'  },
  ],

  goals: [
    { id: 1, icon: '💻', bg: 'var(--blue-bg)',   name: 'New Laptop',   target: 35000, saved: 15750, color: 'var(--blue)'   },
    { id: 2, icon: '✈️', bg: 'var(--pink-bg)',   name: 'Vacation Fund',target: 15000, saved: 2700,  color: 'var(--pink)'   },
    { id: 3, icon: '📱', bg: 'var(--amber-bg)',  name: 'New Phone',    target: 20000, saved: 400,   color: 'var(--amber)'  },
  ],

  savingsHistory: [
    { id: 1, icon: '🏦', bg: 'var(--teal-bg)',  name: 'Added to savings',      meta: 'From balance · Mar 15', amount: 500,   type: 'income'  },
    { id: 2, icon: '↓',  bg: 'var(--red-bg)',   name: 'Withdrawal — emergency',meta: 'To balance · Mar 10',   amount: -1000, type: 'expense' },
    { id: 3, icon: '🏦', bg: 'var(--teal-bg)',  name: 'Added to savings',      meta: 'New fund · Mar 1',      amount: 2000,  type: 'income'  },
  ],

  savingsStats: {
    totalAdded: 3500,
    totalWithdrawn: 1000,
    pctOfFunds: 20,
  },
}

export default function App() {
  const [activeTab, setActiveTab] = useState('expenses')

  const handleSettings = () => {
    // Export/Import modal — to be implemented in next phase
    alert('Export / Import coming soon!')
  }

  return (
    <div className="app">
      <div className="app__inner">
        <Header onSettings={handleSettings}/>
        <main className="app__main">
          <FundsCard data={DUMMY_DATA} />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'expenses' && <ExpensesTab data={DUMMY_DATA} />}
          {activeTab === 'goals'    && <GoalsTab    data={DUMMY_DATA} />}
          {activeTab === 'savings'  && <SavingsTab  data={DUMMY_DATA} />}
        </main>
        <Footer />
      </div>
    </div>
  )
}