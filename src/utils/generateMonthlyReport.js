import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Chart, BarController, BarElement, CategoryScale, LinearScale } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale)

/**
 * UTILITY FUNCTIONS
 */

// Format currency with standard accounting decimals
const formatCurrency = (amount) => {
  return `PHP ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Format the transaction description to read like a sentence
const formatAction = (t) => {
  if (t.type === 'expense') return 'Spent on ' + t.name
  if (t.type === 'goal') return t.name
  if (t.type === 'savings') return t.name
  if (t.type === 'withdrawal') return t.name
  if (t.type === 'income') return 'Added as funds '
  return t.name || ''
}

/**
 * CHART GENERATION
 * Creates a bar chart as a Base64 image
 */
const generateMultiMonthChart = async (labels, expenses, goals, savings) => {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 300
  const ctx = canvas.getContext('2d')

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Expenses',
          data: expenses,
          backgroundColor: '#D9534F', 
          borderRadius: 4,
          maxBarThickness: 30
        },
        {
          label: 'Goals',
          data: goals,
          backgroundColor: '#5BC0DE', 
          borderRadius: 4,
          maxBarThickness: 30
        },
        {
          label: 'Savings',
          data: savings,
          backgroundColor: '#5CB85C',
          borderRadius: 4,
          maxBarThickness: 30
        }
      ]
    },
    options: {
      animation: false,
      responsive: false,
      plugins: {
        legend: { display: false } 
      },
      scales: {
        y: { 
          beginAtZero: true,
          grid: { color: '#EAEAEA' },
          ticks: { 
            font: { size: 10 },
            callback: (value) => 'PHP ' + value.toLocaleString() 
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: 'bold' } }
        }
      }
    }
  })

  // Brief delay to allow Chart.js to finish rendering
  await new Promise(res => setTimeout(res, 150))
  const image = chart.toBase64Image()
  chart.destroy()
  return image
}

/**
 * MAIN EXPORT FUNCTION
 */
export async function generateMonthlyReport(data) {
  const doc = new jsPDF()

  // Group transactions by month
  const grouped = {}
  data.transactions.forEach(t => {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })

  const sortedKeys = Object.keys(grouped).sort()
  let currentY = 20

   
  // DOCUMENT HEADER
   
  doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(44, 62, 80)
  doc.text('PesoSense', 14, currentY)
  
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(127, 140, 141)
  doc.text('STATEMENT OF ACCOUNT', 14, currentY + 6)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, currentY + 11)
  
  currentY += 20
  doc.setDrawColor(189, 195, 199).setLineWidth(0.5).line(14, currentY, 196, currentY)
  currentY += 10

  // Arrays for the final overview chart
  const labels = []
  const expensesArr = []
  const goalsArr = []
  const savingsArr = []

   
  // MONTHLY TABLES
   
  for (const key of sortedKeys) {
    const [year, month] = key.split('-')
    const monthName = new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'long' })
    const transactions = grouped[key].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Calculate totals for chart arrays
    let expTotal = 0, goalTotal = 0, saveTotal = 0
    transactions.forEach(t => {
      if (t.type === 'expense') expTotal += t.amount
      if (t.type === 'goal') goalTotal += t.amount
      if (t.type === 'savings') saveTotal += t.amount
      if (t.type === 'withdrawal') saveTotal -= t.amount
    })

    labels.push(`${monthName.substring(0, 3)} ${year}`)
    expensesArr.push(expTotal)
    goalsArr.push(goalTotal)
    savingsArr.push(saveTotal)

    // Check for page overflow
    if (currentY > 230) {
      doc.addPage()
      currentY = 20
    }

    // Month Header
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(44, 62, 80)
    doc.text(`${monthName} ${year} Activity`, 14, currentY)
    currentY += 6

    // Table Implementation
    autoTable(doc, {
      startY: currentY,
      head: [['Amount', 'Action', 'Date']],
      body: transactions.map(t => [
        formatCurrency(t.amount),
        formatAction(t),
        new Date(t.date).toLocaleDateString('en-PH', { month: 'short', day: '2-digit' })
      ]),
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' }, 
        1: { cellWidth: 'auto' },                
        2: { cellWidth: 30, halign: 'right' }  
      },
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, textColor: [60, 60, 60] },
      headStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didDrawPage: (data) => {
        currentY = data.cursor.y
      }
    })

    currentY += 15
  }

   
  // FINANCIAL OVERVIEW PAGE
   
  doc.addPage()
  currentY = 20

  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(44, 62, 80)
  doc.text('Overall Monthly Summary', 14, currentY)
  currentY += 10

  // Manual Color Legend Key
  doc.setFontSize(9).setFont('helvetica', 'normal')
  
  // Expenses (Red)
  doc.setFillColor(217, 83, 79).rect(14, currentY, 4, 4, 'F')
  doc.text('Expenses', 20, currentY + 3.2)

  // Goals (Blue)
  doc.setFillColor(91, 192, 222).rect(45, currentY, 4, 4, 'F')
  doc.text('Goals', 51, currentY + 3.2)

  // Savings (Green)
  doc.setFillColor(92, 184, 92).rect(72, currentY, 4, 4, 'F')
  doc.text('Savings', 78, currentY + 3.2)

  currentY += 10

  const chartImg = await generateMultiMonthChart(labels, expensesArr, goalsArr, savingsArr)
  if (chartImg) {
    // Subtle frame for the chart
    doc.setDrawColor(230).setLineWidth(0.1).rect(14, currentY, 180, 90)
    doc.addImage(chartImg, 'PNG', 14, currentY, 180, 90)
  }

   
  // GLOBAL FOOTER
   
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(150, 150, 150)

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(`Page ${i} of ${pageCount} | PesoSense Financial Report`, 196, 285, { align: 'right' })
  }

  // Final Action
  doc.save('PesoSense_Financial_Statement.pdf')
}