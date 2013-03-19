// $('#foo').skin('hint', { template: '<div></div>', data: whatever.data })
// $('#foo').hint({ template: { base: 'basic' }, data: { map: { foo: 'bar' }}})
// $('#foo').skin('hint', { states: {  }})
// $('#foo').hint().hide();
// $('#foo').hint().addState('flash', { template: { base: 'flashy'}});

(function() {
  "use strict";


  // Module properties
  // -----------------
  // shortcuts and references
  var root      = this
      // existing Skin is kept as oldSkin, to assign back in noConflict()
    , oldSkin   = root.Skin
      // shortcuts
    , Objects   = Object.prototype
    , Arrays    = Array.prototype
    , slice     = Arrays.slice
    , has       = Objects.hasOwnProperty;

  // helpers for internal use
  function isArray(symbol)    { return symbol instanceof Array }
  function isString(symbol)   { return typeof(symbol) === 'string' }
  function isFunction(symbol) { return typeof(symbol) === 'function' }
  function isObject(symbol)   { return symbol != null && typeof(symbol) === 'object' && !isArray(symbol) }


  // Skin class definition
  // ---------------------
  var Skin = root.Skin = function(options) {
    // private
    // -------
    var that = this
        // root data object
      , data = {}
        // data shortcuts
      , settings  = data.settings  = {}
      , recipes   = data.recipes   = {}
      , actions   = data.actions   = {}
      , templates = data.templates = {}
        // references
      , require
      , plug;

    // initialize
    function initialize() {
      // default settings
      set(settings, { base: Skin.defaults });
      // parse options
      set(settings, options);
      // assign require function implementation
      require = get(settings, 'require');
      // load modules which should be preloaded
      load(get(settings, 'preload'));
      // create the skin plugin
      if (plug = get(settings, 'plug')) plug[get(settings, 'alias')] = (function() {
      });
    }

    // load modules, and handle the return value
    // if its a function, run it on this instance context
    // if its data, merge it to instance data
    function load(modules) {
      if (!isArray(modules)) modules = slice.call(arguments, 0);
      require(get(settings, 'pack'), modules, function() {
        for (var count in arguments) {
          var decorator = arguments[count];
          if (isFunction(decorator)) decorator.call(that);
          else if (isObject(decorator)) set(decorator);
        }
      })
    }

    // convert string index to array index
    function sanitize(index) { return (isArray(index))? index : (isString(index))? index.split(/[.-]/) : [] }

    // set value of an index path, related to the pointer to data objects
    // index path can be an array, or string chunks sliced by . or -
    function set() {
      var pointer, index, value, key, args = arguments;
      // find out what are the inputs
      // if there's no pointer, we start from root data
      switch (args.length) {
        case 3:
          // we have pointer, index and value
          pointer = args[0];
          index   = sanitize(args[1]);
          value   = args[2];
          break;
        case 2:
          value   = args[1];
          // we have either pointer or index, along with value for set
          if (isObject(args[0])) {
            pointer = args[0];
            index   = [];
          } else {
            pointer = data;
            index   = sanitize(args[0]);
          }
          break;
        case 1:
          pointer = data;
          index   = [];
          // the only argument, could be an object or string
          if (isObject(args[0])) value = args[0];
          else {
            // TODO: parse strings for settings values
          }
      }
      // handle an empty index with an object as value
      // note that the value can't be assigned to the pointer directly
      // so if the value isn't an object, we just ignore it
      // if the value is an object, we call set for each of its keys
      if (!index.length && isObject(value)) for (key in value) set(pointer, [key], value[key]);
      else while (index.length) {
        key = index.shift();
        if (index.length) {
          // there are still deeper levels
          // existing or non existing keys should point to next level object
          if (!has.call(pointer, key) || !isObject(pointer[key])) {
            // isObject() returns false for arrays
            // otherwise the next level object could be pushed in the existing array
            pointer[key] = {};
          }
          pointer = pointer[key];
        } else {
          // no more levels, last key
          // if value is null, we remove the key by convension
          // no one wants a key pointing to null!
          if (value == null) delete pointer[key];
          else pointer = pointer[key] = value;
        }
      }
      return pointer;
    }

    // get value of an index path, related to the pointer to data objects
    // index path can be an array, or string chunks sliced by . or -
    function get() {
      var pointer, index, key, flag, args = arguments;
      switch (args.length) {
        case 2:
          // we have pointer and index
          pointer = args[0];
          index   = sanitize(args[1]);
          break;
        case 1:
          // only index
          pointer = data;
          index   = sanitize(args[0]);
      }
      while (index.length) {
        key = index.shift();
        flag = false;
        if (has.call(pointer, key)) {
          pointer = pointer[key];
          flag = true;
        } else {
          // check for value in base
          while (isObject(pointer.base)) {
            pointer = pointer.base;
            if (has.call(pointer, key)) {
              pointer = pointer[key];
              flag = true;
              break;
            }
          }
        }
      }
      return (flag)? pointer : null;
    }

    function bind(key, type, action) {
      
    }
    function unbind(key, type, action) {
      
    }
    // chain of responsibility, ask delegates to perform something if they can
    function can(object, action) { return has.call(object, action) && isFunction(object[action]) }
    function ask(action) {
      // apply() lets us pass an array of arguments, unlike call() which requires each argument
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
      // create skin component for elements
      cover: function(elements, alias, recipe) {
        var base;
        // if a recipe exists for the alias, ensure we have a correct base
        // otherwise create a new recipe and use it as base
        if (base = get(recipes, alias)) {}
        else base = set(recipes, alias, recipe);
      }
    }
  }

  // Skin static properties
  // ----------------------
  Skin.VERSION = '0.0.0';
  Skin.defaults = {
    // name, used for plugin, unique id prefix etc.
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
  , require: root.require || root.curl
    // preload frequently used modules to speed up things
  , preload: ['base']
    // default paths for modules
  , pack: {
      baseUrl: './'
    , paths: {}
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