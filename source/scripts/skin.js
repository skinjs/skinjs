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
  var INDEX     = 'index'
    , PARENT    = 'parent'
    , BASE      = 'base'
    , OBSERVERS = 'observers'
    , OPTIONS   = 'options'
    , RECIPES   = 'recipes'
    , ALIAS     = 'alias'
    , PLUG      = 'plug'
    , LOAD      = 'load';

  // shortcuts
  var Objects   = Object.prototype
    , Functions = Function.prototype
    , Arrays    = Array.prototype
    , slice     = Arrays.slice
    , has       = Objects.hasOwnProperty;

  // helpers
  function isArray(object)    { return object instanceof Array }
  function isObject(object)   { return object != null && typeof(object) === 'object' }
  function isFunction(object) { return typeof(object) === 'function' }
  function isString(object)   { return typeof(object) === 'string' }
  function isCachable(object) { return isObject(object) && !isArray(object) }


  // Skin class definition
  // ---------------------
  var Skin = root.Skin = function(key, value) {
    // private
    // -------
    var that = this
        // cached data object
      , cache = {}
        // loader method, should be assigned after parsing the options
      , load = null;

    // initialize
    function initialize() {
      // instance options
      data(OPTIONS, { base: Skin.defaults });
      // cached recipes for cooking components!
      data(RECIPES, {});
      // parse options, we pass array to speed up
      parse([OPTIONS], key, value);
      // assign loader function for internal use
      load = data([OPTIONS, LOAD]);
      // create the skin plugin
      if (isObject(data([OPTIONS, PLUG]))) {
        data([OPTIONS, PLUG])[data([OPTIONS, ALIAS])] = function(type, options) {
          // the plugin context
          // most probably this refers to an array of elements
          // wrapped in a jQuery or Zepto function
        };
      }
    }


    // parse and update data recursively
    // the method captures ('option-a option-b data-c'), ('key', value) and
    // nested ({key: value, otherKey: { someOtherKey: someOtherValue }}) formats
    // parsing will result in one or several calls to data(), so the observers would be
    // notified if a specific value changes
    function parse(index, key, value) {
      // index path of starting level
      var index = index || [];
      if (isCachable(key)) {
        // we have a data object as key, discard value
        var pointer = key;
        for (key in pointer) {
          index.push(key);
          if (isCachable(pointer[key])) parse (index, pointer[key]);
          else data(index, pointer[key]);
        }
      } else if (isString(key)) {
        if (!value) {
          // parse options string
          // TODO: all the magic goes here!
        } else {
          // simple ('key', value) pair
          data(key, value);
        }
      }
    }


    // helpers for internal use
    // ------------------------
    // get or set a data object by its index path
    // index path (key) can be an array, or string sliced by . or -
    function data(key, value) {
      var pointer = cache
        , keys = (isArray(key))? key : key.split(/[.-]/)
        , index = [];
      while (keys.length) {
        key = keys.shift();
        if (arguments.length == 2) {
          // set value, create, update or delete (set null)
          index.push(key);
          if (keys.length) {
            // there are still deeper levels
            // existing or non existing keys should point to next level object
            if (!has.call(pointer, key) || !isCachable(pointer[key])) {
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
            if (isCachable(value)) {
              // if last value is a data object itself, set index and parent for it
              value[INDEX] = index.slice(0);
              value[PARENT] = pointer;
            }
            pointer = pointer[key];
          }
        } else {
          // get value, read
          if (has.call(pointer, key)) pointer = pointer[key];
          else {
            // check for value in base(s), go back deep!
            while (isCachable(pointer[BASE])) {
              pointer = pointer[BASE];
              if (has.call(pointer, key)) {
                pointer = pointer[key];
                break;
              }
            }
          }
        }
      }
      return pointer;
    }
    function bind(key, type, action) {
      
    }
    function unbind(key, type, action) {
      
    }
    // chain of responsibility, ask delegates to perform something if they can
    function can(object, action) { return has.call(object, action) && isFunction(object[action]) }
    function ask(action) {
      if (can(this, action)) return this[action].apply(this, slice.call(arguments, 1));
      else for(var count in options.delegates) {
        var delegate = options.delegates[count];
        if (delegate && can(delegate, action)) return delegate[action].apply(this, slice.call(arguments, 1));
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