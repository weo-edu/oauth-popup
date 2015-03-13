var wndFeatures = require('window-features');

module.exports = function(url, config, done) {
  var features = wndFeatures(config);
  var wnd = window.open(url, '_blank', features);
  wnd.focus();

  window.addEventListener('message', function handler(evt) {
    if(evt.origin === window.location.origin) {
      wnd.close();
      if(evt.data.error)
        done(evt.data.error);
      else
        done(null, evt.data);
      window.removeEventListener('message', handler, false);
    }
  }, false);

  var interval = setInterval(function() {
    if(wnd.closed) {
      clearTimeout(interval);
      done(new Error('Authorization failed'));
    }
  }, 50);
};

function parseQs(str) {
  return str ? str.split('#')[0].split('&').reduce(function(memo, part) {
    var parts = part.split('=');
    memo[parts[0]] = decodeURIComponent(parts[1]);
    return memo;
  }, {}) : {};
}

var params = parseQs(window.location.search.substring(1));
try {
  if (window.opener && window.opener.location.origin === window.location.origin) {
    if (params.oauth_token && params.oauth_verifier) {
      window.opener.postMessage({oauth_token: params.oauth_token, oauth_verifier: params.oauth_verifier}, window.location.origin);
    } else if (params.code) {
      window.opener.postMessage({code: params.code}, window.location.origin);
    } else if (params.error) {
      window.opener.postMessage({error: params.error}, window.location.origin);
    }
  }
} catch(ex) {

}