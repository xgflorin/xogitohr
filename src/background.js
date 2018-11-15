let tabId

chrome.runtime.onMessage.addListener((request) => {
  switch (request.msg) {
    case 'sign_in':
    case 'sign_out':
      chrome.tabs.create({ url: 'https://xogito.peoplehr.net/' }, (tab) => tabId = tab.id)
      break
    case 'close':
      chrome.tabs.remove(tabId)
      break
  }
})
