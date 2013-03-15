(function() {
  "use strict";


  // Module properties
  // -----------------
  // caching references
  // existing Skin is kept as oldSkin
  var root    = this
    , oldSkin = root.Skin;

  // key constants, used in data objects as keys
  // these shouldn't conflict with actual data keys
  var INDEX     = '_index'
    , PARENT    = '_parent'
    , BASE      = '_base'
    , ADD       = '_add'
    , REMOVE    = '_remove'
    , OBSERVERS = '_observers';

  // shortcuts
  var Objects   = Object.prototype
    , Functions = Function.prototype
    , Arrays    = Array.prototype
    , slice     = Arrays.slice
    , has       = Objects.hasOwnProperty;

  // helpers
  var isObject = function(object) { return typeof(object) === 'object' }
  var isFunction = function(object) { return typeof(object) === 'function' }
  var isArray = function(object) { return object instanceof Array }


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
      , cache = {}
        // loader method, should be assigned after parsing the options
      , load = null;

    // initialize
    var initialize = function() {
      // initialize data object
      data[INDEX] = '';
      data[PARENT] = null;
      // parse options
      parse(options, key, value);
      // assign loader function for internal use
      // TODO: this should be done in update(key, value) after parsing options automatically
      load = options.load;
      // create the skin plugin
      if (options.plug && isObject(options.plug)) {
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
    // find and return a data object by its index path
    // e.g. var template = get('hint-hidden-template');
    //      var template = get('hint.hidden.template');
    //      var template = get(['hint', 'hidden', 'template']);
    var get = function(key) {
      var pointer = data
        , keys = (isArray(key))? key : key.split(/[.-]/);
      while (keys.length) {
        key = keys.shift();
        if (has.call(pointer, key)) pointer = pointer[key];
        else return;
      }
      return pointer;
    }
    // set data object
    // e.g. set('hint-hidden-template', newTemplate);
    //      set('hint.hidden.template', newTemplate);
    //      set(['hint', 'hidden', 'template'], newTemplate);
    var set = function(key, value) {
      var pointer = data
        , keys = (isArray(key))? key : key.split(/[.-]/)
        , index = [];
      while (keys.length) {
        key = keys.shift();
        index.push(key);
        if (keys.length) {
          // there are still deeper levels
          // existing or non existing keys should point to next level object
          if (!has.call(pointer, key) || isArray(pointer[key])) {
            // we should check if existing key points to an array
            // if so, pretend it doesn't exist and create a new object
            // otherwise the next level object can be pushed in the existing array
            pointer[key] = {};
            pointer[key][INDEX] = index.slice(0);
            pointer[key][PARENT] = pointer;
          }
          pointer = pointer[key];
        } else {
          // no more levels, last key
          pointer[key] = value;
        }
      }
      // return the modified object
      return pointer;
    }
    // chain of responsibility, ask delegates to perform something if they can
    var can = function(object, action) { return has.call(object, action) && isFunction(object[action]) }
    var ask = function(action) {
      if (can(this, action)) return this[action].apply(this, slice.call(arguments, 1));
      else for(var count in options.delegates) {
        var delegate = options.delegates[count];
        if (can(delegate, action)) return delegate[action].apply(this, slice.call(arguments, 1));
      }
      return false;
    }


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