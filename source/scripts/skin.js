(function() {
  "use strict";

  // Module properties
  // -----------------
  // caching references
  // existing Skin is kept as oldSkin
  var that    = this,
      oldSkin = that.Skin;

  // Skin class definition
  // ---------------------
  var Skin = that.Skin = function(options) {
    // private
    // -------
    var options = {};
    var recipes = {};
    var initialize = function() {
      // initialize, parse options, load modules
      console.log('initializing..22');
      
    }
    var parseOptionString = function(optionString) {};
    var parseOptions = function(options) {};
    var set = function(key, value) {};

    // execute initialize
    initialize();

    // public interface
    // ----------------
    return {
      // capture ('option'), ('key', value) and ({key: value}) formats
      configure: function(key, value) {
        if (value && typeof(key) === 'string') set(key, value);
      }
    };
  };

  // Skin static properties
  // ----------------------
  Skin.VERSION = '0.0.0';
  Skin.defaults = {
    // plugin name, unique id prefix etc.
    alias: 'skin',
    // include the parser or not
    // parser will scan HTML,
    // detects Skin data and
    // wires up events to states and actions
    parse: true,
    // include the sensor or not
    // sensor will detect browsers supported events
    // and hooks them into more complex ones
    sense: true,
    // default method to load modules
    load: function(name, dependencies, callback) {
      // based on define() method proposed by CommonJS
      // for Asynchronous Module Definition (AMD)
      define(modules);
    },
    // default method mapping to other libraries such as
    // jQuery, Zepto, Backbone, Underscore etc.
    // also can be the module name which implements mapping
    // in this case it will be loaded by loader
    plugin: that.$,
    select: that.$,
    extend: that.$.extend
  };

  // Skin static methods
  // ----------------------
  // assign cached Skin back and return this object
  // should be at the beginning of other codes
  // e.g. var NewSkin = Skin.noConflict();
  //      var newSkin = new NewSkin({alias: 'newSkin'});
  //      var Skin    = { someOtherObject: 'should be defined after Skin.noConflict()' }
  Skin.noConflict = function() {
    that.Skin = oldSkin;
    return this;
  };

  // View class definition
  // ---------------------
  Skin.View = function(options, extras) {
    // private
    // uniqueId
    // reuseClass
    // 
    // $owner
    // $element
    // $target
    // 
    // data:
    // template:
    // 
    // options: {
    //   
    // }
    // 
    // create:
    // initialize:
    // configure:
    // refresh:
    // finalize:
    // 
    // show:
    // hide:
    // enable:
    // disable:
    // activate:
    // inactivate:
    // expose:
    // silent:
    // state: function(state) {}

    // public
    return {
    
    };
  };

}).call(this);