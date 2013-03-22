define('adapter', function() {
  return (function() {
    var that = this
      , $    = window.jQuery;
    // create plugin method
    that.plug = function(alias, method, context) {
      $.fn[alias] = (function() {
      });
    }

    // create plugin for skin
    if (that.plugin) that.plug('foo', function(a) { console.log(a) });
  })
})
