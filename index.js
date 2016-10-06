var wndFeatures = require('window-features')

module.exports = function (url, config, done) {
  var features = wndFeatures(config)
  var wnd = window.open(url, '_blank', features)
  wnd.focus()

  window.addEventListener('message', function handler (evt) {
    if(evt.origin === window.location.origin) {
      handleData(evt.data)
    }
  }, false)

  window.__oauthPopupRedirectFn = handleData

  function handleData (data) {
    wnd.close()
    data.error ? done(data.error) : done(null, data)
    clearTimeout(interval)
    window.removeEventListener('message', handler, false)
  }

  var interval = setInterval(function () {
    if(wnd.closed) {
      clearTimeout(interval)
      done(new Error('Authorization failed'))
    }
  }, 50)
}

function parseQs (str) {
  return str ? str.split('#')[0].split('&').reduce(function(memo, part) {
    var parts = part.split('=')
    memo[parts[0]] = decodeURIComponent(parts[1])
    return memo
  }, {}) : {}
}

try {
  var params = parseQs(window.location.search.substring(1))

  if (window.opener && window.opener.location.origin === window.location.origin) {
    if (params.oauth_token && params.oauth_verifier) {
      passData({oauth_token: params.oauth_token, oauth_verifier: params.oauth_verifier}, window.location.origin)
    } else if (params.code) {
      passData({code: params.code}, window.location.origin)
    } else if (params.error) {
      passData({error: params.error}, window.location.origin)
    }
  }

  function passData (data) {
    (window.opener.__oauthPopupRedirectFn || window.opener.postMessage)(data)
  }
} catch(ex) {

}

