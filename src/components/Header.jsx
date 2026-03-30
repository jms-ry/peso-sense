import './Header.css'

export default function Header({ onSettings }) {
  return (
    <header className="header">
      <div className="header__logo">
        <div className="header__logo-icon">₱</div>
        <div className="header__logo-text">
          Peso<span>Sense</span>
        </div>
      </div>
      <div className="header__right">
        <button className="header__export-btn" onClick={onSettings}>
          Export / Import Data
        </button>
      </div>
    </header>
  )
}