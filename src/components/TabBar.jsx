import './TabBar.css'

const TABS = [
  { id: 'expenses', icon: '💸', label: 'Expenses' },
  { id: 'goals',    icon: '🎯', label: 'Goals'    },
  { id: 'savings',  icon: '🏦', label: 'Savings'  },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="tabbar">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tabbar__btn ${activeTab === tab.id ? 'tabbar__btn--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tabbar__icon">{tab.icon}</span>
          <span className="tabbar__label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}