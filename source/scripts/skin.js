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
    , Functions = Function.prototype
    , Arrays    = Array.prototype
    , slice     = Arrays.slice
    , has       = Objects.hasOwnProperty;

  // helpers for internal use
  function isArray(object)    { return object instanceof Array }
  function isString(object)   { return typeof(object) === 'string' }
  function isFunction(object) { return typeof(object) === 'function' }
  function isObject(object)   { return object != null && typeof(object) === 'object' && !isArray(object) }


  // Skin class definition
  // ---------------------
  var Skin = root.Skin = function(alias, options) {
    // private
    // -------
    var that = this
        // main data
      , data = {}
        // loader method, should be assigned after parsing the options
      , require = null

    // initialize
    function initialize() {
      // instance options
      options({ base: Skin.defaults });
      console.log(options());
      // cached recipes for cooking components!
      access(data, 'recipes', {});
      // parse options, we pass array to speed up
      parse([OPTIONS], key, value);
      // assign loader function for internal use
      load = data([OPTIONS, LOAD]);
      // preload required modules
      load(data([OPTIONS, 'pack']), data([OPTIONS, 'preload']), function() {
        for(var count in arguments) {
          var decorator = arguments[count];
          decorator.call(that);
        };
      });
      // create the skin plugin
      if (isObject(data([OPTIONS, PLUG]))) {
        data([OPTIONS, PLUG])[data([OPTIONS, ALIAS])] = function(type, options) {
          // the plugin context
          // most probably this refers to an array of elements
          // wrapped in a jQuery or Zepto function
        };
      }
    }


    // load modules, handle the return value
    // if its a function, run it on this instance
    // if its data, parse and merge it to instance data
    function load(modules) {
      load(options(['pack']), modules, function() {
        for(var count in arguments) {
          var decorator = arguments[count];
          if (isFunction(decorator)) decorator.call(that);
          else if (isObject(decorator)) parse(decorator);
        }
      });
    }


    // parse and update data recursively
    // in each recurse we should try to break down complex inputs
    // so we'd be able to call a simple access() on each value seperately
    // the method captures ('option-a option-b data-c'), (pointer, 'key', value),
    // (pointer, [index], { key: value }), (pointer, value), ('key', value), and
    // nested ({ key: value, otherKey: { someOtherKey: someOtherValue }}) formats
    function parse() {
    }


    // get or set value of an index path, related to the pointer
    // index path can be an array, or string chunks sliced by . or -
    // we should use arrays when its possible, to speed up
    // value should be a primitive string, array, boolean, number etc.
    // however objects can be passed as value too, but this will
    // result in mass assigning values, change observers won't be notified this way
    // objects should be parsed instead
    function access(pointer, index, value) {
      // if there's no pointer, start from root data
      var pointer = pointer || data
        , keys = (isArray(index))? index : index.split(/[.-]/);
      while (keys.length) {
        key = keys.shift();
        // TODO: do we need special keys like 'self', 'parent' etc.?
        if (arguments.length == 3) {
          // set value
          if (keys.length) {
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
        } else {
          // get value
          if (has.call(pointer, key)) pointer = pointer[key];
          else {
            // check for value in base
            while (isObject(pointer.base)) {
              pointer = pointer.base;
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

    // data access shortcuts
    function options(index, value)   { return access.call(that, data.options, index, value) }
    function templates(index, value) { return access.call(that, data.templates, index, value) }
    function actions(index, value)   { return access.call(that, data.actions, index, value) }
    function recipes(index, value)   { return access.call(that, data.recipes, index, value) }


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
  , require: root.require || root.curl
    // preload frequently used modules to speed up things
  , preload: ['base']
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