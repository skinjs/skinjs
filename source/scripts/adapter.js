define('adapter', function() {
  return (function() {
    var that = this
      , $    = window.jQuery;
    that.extend = $.extend;
    that.on     = $.on;
    that.off    = $.off;
  })
});
