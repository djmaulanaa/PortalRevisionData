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
      console.error("Gagal mengambil data:", error)
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
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
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
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  })

  // ================= REVISED NAME CHART =================
  const nameMap = {}

  data.forEach(d => {
    const name = d.RevisedName ? d.RevisedName.trim() : 'Unassigned'
    nameMap[name] = (nameMap[name] || 0) + 1
  })

  // Sort dari count terbanyak
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
        backgroundColor: '#0284c7',
        borderColor: '#0369a1',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y', // Horizontal Bar Chart agar nama terlihat rapi
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
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
