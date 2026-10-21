import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://ounyjjhwbqttjrtsmtjw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bnlqamh3YnF0dGpydHNtdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzE1MzYsImV4cCI6MjA4OTkwNzUzNn0.0wgVlGfJEbDpjyH_eZKJt5OCgyB99WzgO-XGC4BGyl4'
)

const tableName = 'ComplainDataOperator'

// Variabel simpan instance chart agar bisa di-destroy jika re-render
let trendChartInstance = null
let typeChartInstance = null
let revisedNameChartInstance = null
let topOperatorChartInstance = null

// Palette Warna Soft & Konsisten
const softColors = {
  primary: '#60a5fa',      // Soft Blue
  primaryBorder: '#3b82f6',
  secondary: '#38bdf8',    // Soft Sky Blue
  accent: '#818cf8',       // Soft Indigo
  success: '#34d399',      // Soft Emerald
  warning: '#fbbf24',      // Soft Amber
  slate: '#94a3b8',        // Soft Slate
  background: 'rgba(96, 165, 250, 0.15)'
}

// Helper function untuk standardisasi teks SN
function standardizeText(text) {
  if (!text) return 'UNKNOWN'
  return String(text)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')
}

// Helper function untuk format nama tampilan (Capitalized Case)
function formatDisplayName(text) {
  if (!text || text === 'UNKNOWN') return 'Unknown Operator'
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase())
}

async function loadDashboard() {
  let data = []
  let from = 0
  let to = 999
  let hasMore = true

  // Looping untuk mengambil data secara bertahap (per 1000 data)
  while (hasMore) {
    const { data: chunk, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, to)

    if (error) {
      console.error("Gagal mengambil data dashboard:", error)
      return
    }

    data = data.concat(chunk)

    if (chunk.length < 1000) {
      hasMore = false
    } else {
      from += 1000
      to += 1000
    }
  }

  // ================= KPI =================
  const total = data.length
  const pending = data.filter(d => (d.Status || 'Pending') === 'Pending')
  const approved = data.filter(d => d.Status === 'Approved')
  const rejected = data.filter(d => d.Status === 'Rejected')

  document.getElementById('totalData').innerText = total
  document.getElementById('pendingData').innerText = pending.length
  document.getElementById('approvedData').innerText = approved.length
  document.getElementById('rejectedData').innerText = rejected.length

  document.getElementById('approvalRate').innerText =
    total ? ((approved.length / total) * 100).toFixed(1) + '%' : '0%'

  document.getElementById('rejectRate').innerText =
    total ? ((rejected.length / total) * 100).toFixed(1) + '%' : '0%'

  // ================= TREND CHART =================
  const trendMap = {}

  data.forEach(d => {
    const date = d.DateRevision?.split('T')[0]
    if (!date) return
    trendMap[date] = (trendMap[date] || 0) + 1
  })

  const labels = Object.keys(trendMap).sort()
  const values = labels.map(l => trendMap[l])

  if (trendChartInstance) trendChartInstance.destroy()

  trendChartInstance = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Request',
        data: values,
        borderColor: softColors.primaryBorder,
        backgroundColor: softColors.background,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: softColors.primaryBorder,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#334155', font: { family: 'sans-serif' } } }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
      }
    }
  })

  // ================= TYPE CHART =================
  const typeMap = {}

  data.forEach(d => {
    const type = d.RevisionType || 'Unknown'
    typeMap[type] = (typeMap[type] || 0) + 1
  })

  if (typeChartInstance) typeChartInstance.destroy()

  typeChartInstance = new Chart(document.getElementById('typeChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(typeMap),
      datasets: [{
        label: 'Jumlah',
        data: Object.values(typeMap),
        backgroundColor: softColors.secondary,
        borderColor: softColors.primaryBorder,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
      }
    }
  })

  // ================= REVISED NAME CHART =================
  const nameMap = {}

  data.forEach(d => {
    const revName = d.RevisedName ? d.RevisedName.trim() : 'Unassigned'
    nameMap[revName] = (nameMap[revName] || 0) + 1
  })

  const sortedNames = Object.entries(nameMap).sort((a, b) => b[1] - a[1])
  const nameLabels = sortedNames.map(item => item[0])
  const nameCounts = sortedNames.map(item => item[1])

  if (revisedNameChartInstance) revisedNameChartInstance.destroy()

  revisedNameChartInstance = new Chart(document.getElementById('revisedNameChart'), {
    type: 'bar',
    data: {
      labels: nameLabels,
      datasets: [{
        label: 'Total Revisi Dikerjakan',
        data: nameCounts,
        backgroundColor: softColors.accent,
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: '#f1f5f9' } },
        y: { grid: { display: false } }
      }
    }
  })

  // ================= TOP 5 OPERATOR REVISION CHART =================
  const operatorSNMap = {}
  const snToNameMap = {}

  data.forEach(d => {
    // Menyesuaikan variabel kolom SN dan Name dari database
    const rawSN = d.SN || d.sn
    const rawName = d.Name || d.name
    
    if (!rawSN) return

    const cleanSN = standardizeText(rawSN)
    const cleanName = formatDisplayName(rawName)

    operatorSNMap[cleanSN] = (operatorSNMap[cleanSN] || 0) + 1

    if (cleanName && cleanName !== 'Unknown Operator') {
      snToNameMap[cleanSN] = cleanName
    }
  })

  const top5Operators = Object.entries(operatorSNMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topSNLabels = top5Operators.map(item => item[0])
  const topCounts = top5Operators.map(item => item[1])
  const topNames = top5Operators.map(item => snToNameMap[item[0]] || 'Unknown Name')

  if (topOperatorChartInstance) topOperatorChartInstance.destroy()

  topOperatorChartInstance = new Chart(document.getElementById('topOperatorChart'), {
    type: 'bar',
    data: {
      labels: topSNLabels,
      datasets: [{
        label: 'Jumlah Revisi',
        data: topCounts,
        backgroundColor: softColors.warning,
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function (context) {
              const index = context[0].dataIndex
              const sn = topSNLabels[index]
              const name = topNames[index]
              return `SN: ${sn} (${name})`
            },
            label: function (context) {
              return ` Total Revisi: ${context.raw}`
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
      }
    }
  })
}

// Disable klik kanan
document.addEventListener('contextmenu', e => e.preventDefault())

// Disable F12 & shortcut devtools
document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
    (e.ctrlKey && e.key.toUpperCase() === 'U')
  ) {
    e.preventDefault()
  }
})

loadDashboard()
