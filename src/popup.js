const getXogitoTime = () => {
  var options = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }

  const [ date, time ] = Intl.DateTimeFormat('en-US', options).format(new Date()).split(', ')

  const [ month, day, year ] = date.split('/')
  const [ hour, minute, second ] = time.split(':')
  const ymd = `${year}-${month}-${day}`

  return { ymd, year, month, day, hour, minute, second }
}

const updateXogitoTime = (xogitoTime) => {
  chrome.storage.sync.set({ current_time: xogitoTime })
  document.getElementById('xogito_time').innerText = `${xogitoTime.hour}:${xogitoTime.minute}:${xogitoTime.second}`
}

const xogitoTime = getXogitoTime()
if (Number(xogitoTime.month) === 12 && Number(xogitoTime.day) > 15) {
  document.getElementById('logo').src = 'img/catmas.png'
} else if (Number(xogitoTime.month) === 4 && Number(xogitoTime.day) === 5) {
  document.getElementById('logo').src = 'img/catday.jpg'
}

updateXogitoTime(xogitoTime)
setInterval(() => updateXogitoTime(getXogitoTime()), 1000)

const email = document.getElementById('email')
const password = document.getElementById('password')
const sign_in = document.getElementById('sign_in')
const sign_out = document.getElementById('sign_out')
const sign_in_time = document.getElementById('sign_in_time')
const sign_out_time = document.getElementById('sign_out_time')
const auto_close = document.getElementById('auto_close')
const reset = document.getElementById('reset')
const help = document.getElementById('help')
const tip = document.getElementById('tip')

email.addEventListener('input', () => chrome.storage.sync.set({ login_email: email.value }))
password.addEventListener('input', () => chrome.storage.sync.set({ login_password: password.value }))
auto_close.addEventListener('change', () => chrome.storage.sync.set({ auto_close: auto_close.checked }))

sign_in.addEventListener('click', () => {
  chrome.storage.sync.set({ login_action: 'sign_in', login_attempt: 0 })
  chrome.runtime.sendMessage({ msg: 'sign_in' })
})

sign_out.addEventListener('click', () => {
  chrome.storage.sync.set({ login_action: 'sign_out', login_attempt: 0 })
  chrome.runtime.sendMessage({ msg: 'sign_out' })
})

reset.addEventListener('click', () => chrome.storage.sync.set({ login_action: '' }))

help.addEventListener('click', () => {
  setTimeout(() => {
    alert(`Fill in your email and password. These will be used to automatically log you in to PeopleHR.\n` +
      `Click on "Time in" when you begin work.\n` +
      `Click on "Time out" when you finish working for the day.\n\n` +
      `If this extension breaks PeopleHR's site, click on "Reset".`)
  }, 100)
})

chrome.storage.sync.get([ 'login_email', 'login_password', 'auto_close' ], (items) => {
  email.value = items.login_email || ''
  password.value = items.login_password || ''
  auto_close.checked = (typeof items.auto_close === 'boolean') ? items.auto_close : true
})

chrome.storage.sync.get([ 'last_time_sign_in', 'last_time_sign_out' ], (items) => {
  sign_in_time.innerHTML = '&nbsp;'
  sign_out_time.innerHTML = '&nbsp;'

  if (!items.last_time_sign_in) {
    return
  }

  sign_in_time.innerHTML = `${items.last_time_sign_in.hour}:${items.last_time_sign_in.minute}`

  if (items.last_time_sign_out && items.last_time_sign_in.ymd === items.last_time_sign_out.ymd) {
    sign_out_time.innerHTML = `${items.last_time_sign_out.hour}:${items.last_time_sign_out.minute}`
  }
})

const xhr = new XMLHttpRequest()
xhr.addEventListener('load', function () { tip.innerText = JSON.parse(this.response) })
xhr.open('GET', 'https://anothervps.com/api/fortune/')
xhr.send()
