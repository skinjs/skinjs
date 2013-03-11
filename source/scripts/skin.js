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
  var Skin = that.Skin = function() {
    // private
    // -------
    var options = {};
    var recipes = {};
    var parseOptionString = function(optionString) {};
    var parseOptions = function(options) {};
    var set = function(key, value) {};
    var loadModule = function(module) {};

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
    // default method mapping
    // if null, a default map will be used to jQuery or Zepto methods
    // otherwise it should be the name of the module which implements mapping
    // or provides adapter for required methods such as
    // $(), extend(), addClass(), removeClass(), bind() etc.
    hooks: null
  };

  // Skin static methods
  // ----------------------
  // assign cached Skin back and return this object
  // e.g. var newSkin = Skin.noConflict();
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