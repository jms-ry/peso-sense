# 💰 PesoSense — Money Spending Tracker

A lightweight, privacy-first money tracking web app built for everyday Filipinos. PesoSense helps you monitor your spending, set savings goals, and make sense of where your money goes — all without creating an account.

## 🌐 Live Demo

[peso-sense.vercel.app](https://peso-sense.vercel.app)

## 📸 Screenshots

<img width="792" height="858" alt="image" src="https://github.com/user-attachments/assets/74ba0d62-c558-4021-80bb-dcba5155646c" />


## 🚀 Features

### 💸 Expenses
- Log expenses by category (Food, Fare, Bills, Groceries, Health, Leisure, Clothing, Other)
- Available balance automatically deducted on every logged expense
- Spending breakdown with visual progress bars per category
- Recent transactions list (last 10) with swipe-to-undo support
- Show/hide spending breakdown and transactions for a cleaner view

### 🎯 Goals
- Create named savings goals with a target amount and custom icon
- Fund goals from available balance or as a new fund
- Goals are capped — cannot exceed target amount, cannot be overfunded
- Completed goals are marked and locked from further contributions
- Only unfunded goals can be deleted — prevents accidental data loss
- Goals sorted by status: active first, completed last

### 🏦 Savings
- Add to savings from available balance or as new funds
- Withdraw savings back to available balance anytime
- Savings history with show/hide toggle
- Savings statistics: total added, total withdrawn, percentage of total funds

### 📊 Funds Overview
- Total Funds = Available Balance + Goals + Savings
- Segmented progress bar showing allocation across expenses, goals, and savings
- Add Funds modal with income source selection (Salary, Business, Regalo, Other)

### 💡 Smart Insights
- Up to 2 dynamic insights generated from real spending data
- Detects: low balance, dominant spending categories, overspending on leisure/clothing, missing savings, neglected goals, nearly complete goals, spending pace projection
- Always visible in the Expenses tab for constant financial awareness

### 📄 PDF Transaction Report
- Financial statement report group by month
- Bar graph that shows expenses, goals, and savings data in each month

### 📤 Export / Import Data
- Export all data as a `.json` backup file
- Import a backup to restore or sync data across devices
- Confirmation guard before replacing existing data
- Toast notification on successful import

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite                     |
| Styling   | Pure CSS with CSS custom properties |
| State     | React Context + localStorage        |
| Fonts     | Plus Jakarta Sans (Google Fonts)    |
| Deploy    | Vercel                              |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/jms-ry/peso-sense.git
cd peso-sense

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## 🗄 Data Schema

All data is stored locally in the browser under the key `pesosense_data`:

```json
{
  "funds": {
    "totalFunds": 0,
    "availableBalance": 0,
    "totalGoals": 0,
    "totalSavings": 0,
    "totalExpenses": 0
  },
  "transactions": [],
  "goals": [],
  "savings": {
    "total": 0,
    "totalAdded": 0,
    "totalWithdrawn": 0,
    "savingsHistory": []
  },
  "meta": {
    "createdAt": "",
    "lastUpdated": "",
    "version": 1
  }
}
```

---

## ⚙️ How It Works

### Money Flow

```
Add Funds → Available Balance increases → Total Funds increases
Log Expense → Available Balance decreases → Total Expenses increases
Fund Goal (from balance) → Available Balance decreases → Goal saved increases
Fund Goal (new fund) → Total Funds increases → Goal saved increases
Add Savings (from balance) → Available Balance decreases → Total Savings increases
Add Savings (new fund) → Total Funds increases → Total Savings increases
Withdraw Savings → Total Savings decreases → Available Balance increases
```

### Insights Engine

The insights engine evaluates 10 rules on every render and surfaces the top 2 most critical insights by priority:

| Priority | Type | Trigger |
|---|---|---|
| 1 | 🚨 Danger | Available balance is zero |
| 2 | ⚠️ Warning | Over 80% of spendable funds used |
| 3 | ⚠️ Warning | Spending pace will exhaust balance in < 5 days |
| 4 | 💡 Tip | Single category over 50% of expenses |
| 5 | 💡 Tip | Leisure or Clothing over 20% of expenses |
| 6 | 💡 Tip | No savings added yet |
| 7 | 💡 Tip | Savings below 10% of total funds |
| 8 | ✅ Success | A goal is over 90% complete |
| 9 | 💡 Tip | A goal hasn't been funded in 7+ days |
| 10 | 📝 Reminder | No expenses logged today |

---

## 🔒 Privacy

PesoSense stores all data **locally in your browser** using `localStorage`. No data is ever sent to a server, no account is required, and no tracking is performed.

> ⚠️ **Important:** Clearing your browser data will permanently delete your PesoSense data. Use **Export / Import Data** in the header to back up your data regularly and sync across devices.

---

## 📱 Syncing Across Devices

Since PesoSense has no backend, syncing is done manually:

1. On your current device, click **Export / Import Data** in the header
2. Click **Download Backup** — a `.json` file will be saved
3. On your new device, open PesoSense and click **Export / Import Data**
4. Click **Choose Backup File** and select the downloaded `.json`
5. Confirm the import — your data will be restored
