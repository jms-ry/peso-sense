import { useState, useEffect, useRef } from 'react';
import './Header.css';

export default function Header({ onSettings, onDownloadReport }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header__logo">
        <div className="header__logo-icon">₱</div>
        <div className="header__logo-text">
          Peso<span>Sense</span>
        </div>
      </div>

      <div className="header__right" ref={dropdownRef}>
        <div className="header__dropdown-container">
          <button 
            className={`header__settings-btn ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            Settings
          </button>

          {isOpen && (
            <div className="header__dropdown-menu">
              <button className="header__dropdown-item" onClick={() => { onSettings(); setIsOpen(false); }}>
                <span className="item-icon">💾</span> Export / Import Data
              </button>
              <button className="header__dropdown-item" onClick={() => { onDownloadReport(); setIsOpen(false); }}>
                <span className="item-icon">📄</span> Download Report
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}