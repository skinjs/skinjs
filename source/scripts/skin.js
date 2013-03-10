// entry point
(function() {

  // configuring paths for loading other libraries
  // jQuery, Zepto or other libraries can be used
  // TODO: Underscore and Backbone might be needed only for data rich components
  require.config({
    paths: {
      '$': '../jquery',
      '_': '../underscore',
      'backbone': '../backbone'
    }
  });

  // define Skin module when $ is loaded
  require(['$'], function() {
    // setting references
    // also cache the old Skin if exists
    // TODO: return old skin in noConflict mode
    var that    = this,
        oldSkin = that.Skin,
        Skin    = that.Skin   = {},
        $       = Skin.$      = that.$;

    // extend the Skin object with default options and methods
    $.extend(Skin, {
      VERSION: '0.0.0',
      defaults: {
        // include the parser or not
        // parser will scan HTML tags and
        // binds events to create components
        parse: true,
      },
      initialize: function() {
        console.log(that);
      }
    });

    Skin.initialize();
  });

}).call(this);