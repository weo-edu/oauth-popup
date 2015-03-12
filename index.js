module.exports = function(config) {
  return function(url, done) {
    var wnd = window.open(url, '_blank');
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
        next(new Error('Authorization failed'));
      }
    }, 50);
  };
};