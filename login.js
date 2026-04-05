// 🔥 DATA USER
const users = {
  "11001241": "M. ROLIANOOR",
  "63284": "EFAN DIAN FADILLAH",
  "11006065": "MUHAMMAD RASYID YUDA",
  "11005101": "SENDY PUTRA WIKA",
  "11005877": "MUHAMMAD INSANI RAHMAN",
  "11006753": "ACEP IRAWAN",
  "11006644": "ARI SUSANTO",
  "63224": "TEGUH TRI SANTOSO",
  "63283": "MAHYUDDIN",
  "63282": "TOPAN SAPUTRA",
  "11006645": "IBNU NOR HIDAYAT",
  "11001077": "ROLIE YASMI YANDI",
  "11005852": "MUHAMMAD BURHANUDDIN"
}

// 🔐 LOGIN FUNCTION
function login() {
  const sn = document.getElementById('sn').value.trim()
  const password = document.getElementById('password').value.trim()

  if (users[sn] && password === 'admin') {
    localStorage.setItem('sn', sn)
    localStorage.setItem('name', users[sn])

    window.location.href = 'portal.html'
  } else {
    alert('SN atau password salah ❌')
  }
}

// 🔥 EVENT LISTENER (lebih aman dari onclick)
document.getElementById('loginBtn').addEventListener('click', login)

// 🔥 BONUS: ENTER KEY SUPPORT
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    login()
  }
})

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
