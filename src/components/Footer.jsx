import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__disclaimer">
        <span className="footer__icon">⚠️</span>
        <p className="footer__text">
          Your data is stored locally in this browser only.{' '}
          <strong>Clearing your browser data will permanently delete it.</strong>{' '}
          To sync across devices, use <span className="footer__highlight">Export / Import Data</span> in the header to download and re-upload your data on another device.
        </p>
      </div>
      <p className="footer__credit">PesoSense · Money Spending Tracker</p>
    </footer>
  )
}