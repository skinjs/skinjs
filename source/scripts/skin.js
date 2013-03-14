(function() {
  "use strict";

  // Module properties
  // -----------------
  // caching references
  // existing Skin is kept as oldSkin
  var root    = this
    , oldSkin = root.Skin;

  // Skin class definition
  // ---------------------
  var Skin = root.Skin = function(key, value) {
    // private
    // -------
    var that = this
        // root data object
      , data = {}
        // instance options
      , options = Skin.defaults
        // cached recipes for cooking components
      , recipes = {}
        // loader method, should be assigned after parsing the options
      , load = null;


    // initialize
    var initialize = function() {
      // parse options
      parse(options, key, value);
      // assign loader function for internal use
      // TODO: this should be done in update(key, value) after parsing options automatically
      load = options.load;
      // create the main skin plugin
      if (options.plug && typeof(options.plug) == 'object') {
        options.plug[options.alias] = function(type, options) {
          // the plugin context
          // most probably this refers to an array of elements
          // wrapped in a jQuery or Zepto function
        };
      }
    };


    // parse and update options recursively
    // the method captures ('option-a option-b'), ('key', value) and ({key: value}) formats
    // target is the root or a sub branch in options
    // key can be the source object, or the key in key, value pair
    // value only matters when it is present and the key is a string
    var parse = function(target, key, value) {
      if (typeof(key) === 'object') {
        // we have an object, try to match target with it, discard value
        var source = key;
        for (key in source) {
          if (typeof(source[key]) === 'object') {
            // if the value is an Array, just assign it in target
            if (source[key] instanceof Array) target[key] = source[key];
            else {
              // we have an object
              var base, method;
              base = source[key]['base'] || source[key];
                // means the branch is based on other branch
                // this should be passed and set in target
                // first, check for update methods
              if (source[key]['method']) {}
              if (!target.hasOwnProperty(key)) target[key] = {}
              parse(target[key], source[key]);
            }
          }
        }
      } else if (typeof(key) === 'string') {
        if (!value) {
          // parse options string
          // TODO: implement this
        } else {
          target[key] = value;
          // TODO: call observers methods
        }
      }
    }


    // helpers for internal use
    // ------------------------
    // key constants, used in data objects
    // these shouldn't conflict with actual data keys
    var INDEX     = '_index_'
      , PARENT    = '_parent_'
      , BASE      = '_base_'
      , ADD       = '_add_'
      , REMOVE    = '_remove_'
      , OBSERVERS = '_observers_';
    // find and return a data object by its path
    // e.g. var template = dataByPath('hint-hidden-template');
    var dataByPath = function(path, pointer) {
      var pointer = pointer || data
        , keys = path.split(/[.-]/)
        , key = null;
      while (keys.length) {
        key = keys.shift();
        if (key in pointer) pointer = pointer[key];
        else return;
      }
      return pointer;
    }
    // create path string for a data object
    // dashes should be used only in HTML markups as classes or data attributes
    // for internal use paths are divided by dots
    var pathOfData = function(pointer, path) {
      var path = path || '';
      if (typeof(pointer) === 'object' && pointer.hasOwnProperty(INDEX)) {}
      
    }

    // check if a delegate can perform an action
    var can = function(delegate, action) {
      if (delegate && delegate.hasOwnProperty(action) && typeof(delegate[action]) === 'function') return true;
      return false;
    }

    // ask chain of delegates to perform an action
    var ask = function(action) {
      if (can(this, action)) return this[action].apply(this, Array.prototype.slice.call(arguments, 1));
      else for(var count in options.delegates) {
        var delegate = options.delegates[count];
        if (can(delegate, action)) return delegate[action].apply(this, Array.prototype.slice.call(arguments, 1));
      }
      return false;
    };


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
    alias: 'skin'
    // include the scanner or not
    // scanner will parse HTML,
    // detects Skin related data and
    // wires up events to states and actions
  , scan: true
    // include the sensor or not
    // sensor will detect browsers supported events
    // and hooks them into more complex ones
  , sense: true
    // array of delegates
    // if a method implementation is not found in skin object
    // it will try to call the delegate's equivalent method
    // if the delegate failed, it will try the next delegate in array
    // most of required actions can be delegated to external libraries
    // such as jQuery, Zepto, Backbone, Underscore etc.
    // we could also load a custom module which extends the skin object
    // with custom method implementations such as
    // extend(), select(), bind(), addClass(), removeClass(), each(), map() etc.
  , delegates: [root.$, root._]
    // the object which should hold the skin plugin
    // plugin name will be same as alias of skin instance
    // null means no plugin creation
  , plug: root.$.fn
    // default method to load modules
    // based on define(), proposed by CommonJS
    // for Asynchronous Module Definition (AMD)
  , load: root.require || root.curl
    // default paths for modules
  , pack: {
      baseUrl: './'
    // TODO: this won't be needed, I kept it only for documentation
    // , paths: {
    //     'plug': 'plug.js'
    //   , 'parse': 'parse.js'
    //   , 'sense': 'sense.js'
    //   }
    }
  };

  // Skin static methods
  // -------------------
  // assign cached Skin back and return this object
  // should be at the beginning of other codes
  // e.g. var NewSkin = Skin.noConflict();
  //      var newSkin = new NewSkin({alias: 'newSkin'});
  //      var Skin    = { someOtherObject: 'should be defined after Skin.noConflict()' }
  Skin.noConflict = function() {
    root.Skin = oldSkin;
    return this;
  };

  // View class definition
  // ---------------------
  Skin.View = function(key, value) {
    Skin.View.counter++;
    // private
    // -------
    uniqueId = options.alias + '-' + Skin.View.counter;
    // reuseClass
    // 
    // $owner
    // $element
    // $target
    // 
    // data:
    // template:
    // map: {}
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

  // View static properties
  // ----------------------
  Skin.View.counter = 0;
  Skin.View.defaults = {
    // plugin name, unique id prefix etc.
    alias: 'view'
  };

}).call(this);