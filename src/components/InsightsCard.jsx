import './InsightsCard.css'

const TYPE_STYLES = {
  danger:   { bg: 'var(--red-bg2)',    border: 'rgba(248,113,113,0.2)',  titleColor: 'var(--red)'    },
  warning:  { bg: 'var(--amber-bg2)',  border: 'rgba(251,191,36,0.2)',   titleColor: 'var(--amber)'  },
  success:  { bg: 'var(--green-bg2)',  border: 'rgba(52,211,153,0.2)',   titleColor: 'var(--green)'  },
  tip:      { bg: 'var(--blue-bg)',    border: 'rgba(108,142,255,0.15)', titleColor: 'var(--blue)'   },
  reminder: { bg: 'var(--purple-bg)',  border: 'rgba(192,132,252,0.15)', titleColor: 'var(--purple)' },
}

export default function InsightsCard({ insights }) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="insights-card">
      {insights.map(insight => {
        const style = TYPE_STYLES[insight.type] ?? TYPE_STYLES.tip
        return (
          <div
            key={insight.id}
            className="insight-item"
            style={{
              background:   style.bg,
              borderColor:  style.border,
            }}
          >
            <span className="insight-item__icon">{insight.icon}</span>
            <div>
              <div
                className="insight-item__title"
                style={{ color: style.titleColor }}
              >
                {insight.title}
              </div>
              <div className="insight-item__text">{insight.text}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}