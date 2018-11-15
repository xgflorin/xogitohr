const handleLogin = (storage) => {
  if (!storage.login_email || !storage.login_password || storage.login_attempt) {
    return
  }

  chrome.storage.sync.set({ 'login_attempt': 1 })

  document.getElementById('txtEmailId').value = storage.login_email
  document.getElementById('txtPassword').value = storage.login_password
  document.getElementById('btnLogin').click()
}

const handleSite = (storage) => {
  const me = document.getElementById('ucLeftSegment_aMyDetails')
  if (!me.className.split(' ').includes('current')) {
    me.click()
    return
  }

  chrome.storage.sync.set({ login_attempt: 0 })

  let iWaitForPlanner
  let iWaitForSpan
  let iWaitForPopup

  const { year, month, day } = storage.current_time

  const waitForPlanner = () => {
    const planner = document.getElementById('contentMain_ucEmployeeLink_hlnPlanner')
    if (!planner) {
      return
    }
    clearInterval(iWaitForPlanner)
    setTimeout(() => {
      planner.click()
      iWaitForSpan = setInterval(waitForSpan, 100)
    }, 100)
  }

  const waitForSpan = () => {
    const todaySpan = document.querySelector(`[data-date="${year}-${month}-${day}"]`)
    if (!todaySpan || todaySpan.getBoundingClientRect().top > window.innerHeight) {
      return
    }
    clearInterval(iWaitForSpan)
    setTimeout(() => {
      todaySpan.click()
      iWaitForPopup = setInterval(waitForPopup, 100)
    }, 100)
  }

  const waitForPopup = () => {
    if (!document.getElementById('txtTimeInHH1')) {
      return
    }
    clearInterval(iWaitForPopup)
    setTimeout(() => handlePopup(storage), 100)
  }

  iWaitForPlanner = setInterval(waitForPlanner, 100)
}

const handlePopup = ({ login_action, auto_close, current_time }) => {
  let iWaitForPopupClose

  const waitForPopupClose = () => {
    if (document.getElementById('txtTimeInHH1')) {
      return
    }
    clearInterval(iWaitForPopupClose)
    if ((typeof auto_close === 'boolean') ? auto_close : true) {
      chrome.runtime.sendMessage({ msg: 'close' })
    }
  }

  chrome.storage.sync.set({ login_action: '' })

  const { hour, minute } = current_time

  switch (login_action) {
    case 'sign_in':
      if (confirm(`Time in at ${hour}:${minute} ?`)) {
        document.getElementById('txtTimeInHH1').value = hour
        document.getElementById('txtTimeInMM1').value = minute
        setTimeout(() => document.getElementById('aSave').click(), 100)
        iWaitForPopupClose = setInterval(waitForPopupClose, 100)
        chrome.storage.sync.set({ last_time_sign_in: current_time })
      }
      break
    case 'sign_out':
      if (confirm(`Time out at ${hour}:${minute} ?`)) {
        document.getElementById('txtTimeOutHH1').value = hour
        document.getElementById('txtTimeOutMM1').value = minute
        setTimeout(() => document.getElementById('aSave').click(), 100)
        iWaitForPopupClose = setInterval(waitForPopupClose, 100)
        chrome.storage.sync.set({ last_time_sign_out: current_time })
      }
      break
  }
}

if (document.getElementById('frmLogin')) {
  chrome.storage.sync.get([ 'login_email', 'login_password', 'login_attempt' ], handleLogin)
} else {
  chrome.storage.sync.get([ 'login_action', 'auto_close', 'current_time' ], (storage) => {
    if (!storage.login_action) {
      return
    }

    if (document.getElementById('frmSite')) {
      handleSite(storage)
    }
  })
}
