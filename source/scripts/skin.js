(function() {
  // configuring paths for loading libraries
  // either jQuery or Zepto can be used
  require.config({
    paths: {
      '$': '../jquery',
      '_': '../underscore',
      'Backbone': '../backbone'
    }
  });

  // defining skin main module and namespace
  // TODO: Underscore and Backbone might be needed only for data rich components
  define('skin', ['$', '_', 'Backbone'], function() {
    var that = this,
        Skin = that.Skin = {};
    Skin.$ = that.$;

    return Skin;
  });

}).call(this);