var wndFeatures = require('window-features');

module.exports = function(config) {
  var features = wndFeatures(config);

  return function(url, done) {
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
};