import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://ounyjjhwbqttjrtsmtjw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bnlqamh3YnF0dGpydHNtdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzE1MzYsImV4cCI6MjA4OTkwNzUzNn0.0wgVlGfJEbDpjyH_eZKJt5OCgyB99WzgO-XGC4BGyl4'
)

const tableName = 'ComplainDataOperator'

async function loadDashboard() {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')

  if (error) {
    console.log(error)
    return
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

  new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Request',
        data: values,
        tension: 0.3
      }]
    }
  })

  // ================= TYPE CHART =================
  const typeMap = {}

  data.forEach(d => {
    const type = d.RevisionType || 'Unknown'
    typeMap[type] = (typeMap[type] || 0) + 1
  })

  new Chart(document.getElementById('typeChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(typeMap),
      datasets: [{
        label: 'Jumlah',
        data: Object.values(typeMap)
      }]
    }
  })

  // ================= AGING =================
  let aging1 = 0, aging2 = 0, aging3 = 0
  const now = new Date()

  pending.forEach(d => {
    const created = new Date(d.created_at)
    const diff = (now - created) / (1000 * 60 * 60 * 24)

    if (diff < 1) aging1++
    else if (diff < 3) aging2++
    else aging3++
  })

  document.getElementById('agingList').innerHTML = `
    <li>< 1 Hari: ${aging1}</li>
    <li>1 - 3 Hari: ${aging2}</li>
    <li>> 3 Hari: ${aging3}</li>
  `
}
// disable klik kanan
document.addEventListener('contextmenu', e => e.preventDefault())

// disable F12 & shortcut devtools
document.addEventListener('keydown', function (e) {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault()
  }
})
loadDashboard()