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
        // main data
      , data = {}
        // loader method, should be assigned after parsing the settings
      , require = null

    // initialize
    function initialize() {
      // default settings
      settings({ base: Skin.defaults });
      // parse options
      settings(options);
      // assign require function for internal use
      
      // preload required modules
      
      // create the skin plugin
    }

    function configure() {
      // assign require function for internal use
      require = settings();
      
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

    // convert string index to array index
    function sanitize(index) { return (isArray(index))? index : (isString(index))? index.split(/[.-]/) : [] }

    // parse and update data recursively
    // in each recurse we should try to break down complex inputs
    // and finally call a simple access() on each value seperately
    // e.g. parse('key-value-a key-value-b data-c');
    //      parse('hint-state-expose-error hint-position-bottom');
    //      parse('hint-hide-on-body-click hint-dont-hide-on-element-focus');
    //      parse({ templates: { a: '<p>{{a}}</p>' }, actions: { jump: function(){}}});
    //      parse({ key: { otherKey: value }});
    //      parse(pointer, 'key.otehrKey-anotherKey', value);
    //      parse(pointer, ['key', 'otherKey'], value);
    //      parse(['key', 'otherKey'], { anotherKey: value});
    //      parse(pointer, value);
    //      parse(pointer, { key: value });
    //      parse('key', value);
    function parse() {
      var pointer, index, key, value;
      switch (arguments.length) {
        case 3:
          // we have pointer, index and value
          pointer = arguments[0];
          index   = sanitize(arguments[1]);
          value   = arguments[2];
          break;
        case 2:
          // we have either pointer or index, and value
          if (isObject(arguments[0])) {
            pointer = arguments[0];
            index   = [];
          } else {
            pointer = null;
            index   = sanitize(arguments[0]);
          }
          value = arguments[1];
          break;
        case 1:
          // the only argument, could be an object or string
          if (isObject(arguments[0])) {
            pointer = null;
            index   = [];
            value   = arguments[0];
          } else {
            // TODO: parse string
          }
      }
      access(pointer, index, value);
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
        , index = sanitize(index)
        , key;
      // first handle an empty index with an object as value
      // note that the value can't be assigned to the pointer directly
      if (!index.length && isObject(value)) for (key in value) access(pointer, [key], value[key]);
      else while (index.length) {
        key = index.shift();
        if (arguments.length == 3) {
          // set value
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
    function settings()  { return parse.apply(that, Array(data.settings  || (data.settings  = {})).concat(slice.call(arguments, 0))) }
    function actions()   { return parse.apply(that, Array(data.actions   || (data.actions   = {})).concat(slice.call(arguments, 0))) }
    function recipes()   { return parse.apply(that, Array(data.recipes   || (data.recipes   = {})).concat(slice.call(arguments, 0))) }
    function templates() { return parse.apply(that, Array(data.templates || (data.templates = {})).concat(slice.call(arguments, 0))) }


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
      paths: {}
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