import { useState } from 'react'
import { useApp } from './context/AppContext'
import Header from './components/Header'
import FundsCard from './components/FundsCard'
import TabBar from './components/TabBar'
import ExpensesTab from './components/ExpensesTab'
import GoalsTab from './components/GoalsTab'
import SavingsTab from './components/SavingsTab'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const { data } = useApp()
  const [activeTab, setActiveTab] = useState('expenses')

  const handleSettings = () => {
    alert('Export / Import coming soon!')
  }

  return (
    <div className="app">
      <div className="app__inner">
        <Header onSettings={handleSettings} />
        <main className="app__main">
          <FundsCard data={data} />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'expenses' && <ExpensesTab />}
          {activeTab === 'goals'    && <GoalsTab    />}
          {activeTab === 'savings'  && <SavingsTab  />}
        </main>
        <Footer />
      </div>
    </div>
  )
}