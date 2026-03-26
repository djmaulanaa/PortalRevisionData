import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 🔐 LOGIN
const loginSN = localStorage.getItem('sn')
const loginName = localStorage.getItem('name')

if (!loginSN || !loginName) {
  window.location.href = 'index.html'
}

document.getElementById('userInfo').innerText = `${loginName} (${loginSN})`

window.logout = () => {
  localStorage.clear()
  window.location.href = 'index.html'
}

// 🔥 SUPABASE
const supabase = createClient(
  'https://ounyjjhwbqttjrtsmtjw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bnlqamh3YnF0dGpydHNtdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzE1MzYsImV4cCI6MjA4OTkwNzUzNn0.0wgVlGfJEbDpjyH_eZKJt5OCgyB99WzgO-XGC4BGyl4'
)

const tableName = 'ComplainDataOperator'

let selectedId = null
let allData = []
let filteredData = []

// 🔥 PAGINATION STATE
let currentPage = 1
const rowsPerPage = 10

// 📥 LOAD DATA
async function loadData() {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
    return
  }

  allData = data
  applyFilter()
}

// 🔍 FILTER
function applyFilter() {
  const filter = document.getElementById('filterStatus').value

  if (filter === 'ALL') {
    filteredData = allData
  } else {
    filteredData = allData.filter(d => (d.Status || 'Pending') === filter)
  }

  currentPage = 1
  renderTable()
}

document.getElementById('filterStatus').addEventListener('change', applyFilter)

// 🧱 RENDER TABLE + PAGINATION
function renderTable() {
  const table = document.getElementById('tableBody')
  table.innerHTML = ''

  const start = (currentPage - 1) * rowsPerPage
  const end = start + rowsPerPage
  const pageData = filteredData.slice(start, end)

  pageData.forEach(item => {
    const statusColor =
      item.Status === 'Approved' ? 'bg-green-500' :
      item.Status === 'Rejected' ? 'bg-red-500' :
      'bg-gray-400'

    const row = `
      <tr class="border-b ${item.Status === 'Pending' ? 'bg-yellow-50' : ''}">
        <td class="p-2">${item.DateRevision || '-'}</td>
        <td class="p-2">${item.ShiftID || '-'}</td>
        <td class="p-2">${item.SN || '-'}</td>
        <td class="p-2">${item.Name || '-'}</td>
        <td class="p-2">${item.RevisionType || '-'}</td>
        <td class="p-2">${item.PIT || '-'}</td>
        <td class="p-2">${item.UnitType || '-'}</td>
        <td class="p-2">${item.UnitID || '-'}</td>
        <td class="p-2">${item.RitationAct || '-'}</td>
        <td class="p-2">${item.DistanceAct || '-'}</td>
        <td class="p-2">${item.SMUStart || '-'}</td>
        <td class="p-2">${item.SMUEnd || '-'}</td>
        <td class="p-2">${item.DisposalName || '-'}</td>
        <td class="p-2">${item.NoHP || '-'}</td>
        <td class="p-2">${item.Description || '-'}</td>
        <td class="p-2">
          <span class="text-white px-2 py-1 rounded ${statusColor}">
            ${item.Status || 'Pending'}
          </span>
        </td>
        <td class="p-2">
          <button onclick='openModal(${JSON.stringify({
            id: item.id,
            sn: item.RevisedSN,
            name: item.RevisedName,
            status: item.Status,
            feedback: item.Feedback
          })})'
          class="bg-blue-500 text-white px-2 py-1 rounded">
          Edit
          </button>
        </td>
      </tr>
    `

    table.innerHTML += row
  })

  updatePaginationInfo()
}

// 🔢 PAGINATION INFO
function updatePaginationInfo() {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  document.getElementById('pageInfo').innerText =
    `Page ${currentPage} of ${totalPages || 1}`
}

// ⬅️➡️ NAVIGATION
window.nextPage = () => {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  if (currentPage < totalPages) {
    currentPage++
    renderTable()
  }
}

window.prevPage = () => {
  if (currentPage > 1) {
    currentPage--
    renderTable()
  }
}

// 🪟 MODAL
window.openModal = (data) => {
  selectedId = data.id

  document.getElementById('revisedSN').value = loginSN
  document.getElementById('revisedName').value = loginName

  document.getElementById('status').value = data.status || 'Pending'
  document.getElementById('feedback').value = data.feedback || ''

  document.getElementById('oldRevisedName').innerText = data.name || '-'
  document.getElementById('oldFeedback').innerText = data.feedback || '-'

  document.getElementById('modal').classList.remove('hidden')
  document.getElementById('modal').classList.add('flex')
}

window.closeModal = () => {
  document.getElementById('modal').classList.add('hidden')
}

// 💾 SAVE
window.saveData = async () => {
  const status = document.getElementById('status').value
  const feedback = document.getElementById('feedback').value

  const { error } = await supabase
    .from(tableName)
    .update({
      RevisedSN: loginSN,
      RevisedName: loginName,
      Status: status,
      Feedback: feedback,
      updated_at: new Date()
    })
    .eq('id', selectedId)

  if (error) {
    alert('Update gagal ❌')
  } else {
    alert('Update berhasil ✅')
  }

  closeModal()
  loadData()
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

// INIT
loadData()

