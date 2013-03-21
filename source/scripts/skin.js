(function() {
  "use strict";




  // Module methods and properties
  // =============================
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

  // key strings
  var SETTINGS = 'settings'
    , REQUIRE  = 'require'
    , PRELOAD  = 'preload'
    , PACK     = 'pack';




  // Skin class and namespace
  // ========================
  var Skin = root.Skin = function(options) {
    var that = this
      , data = that.data = new Skin.Data();
    // default settings
    data.set(SETTINGS, { base: Skin.defaults });
    // parse options
    data.set(SETTINGS, options);
    // assign require function implementation
    that.require = data.get(SETTINGS, REQUIRE);
    // load modules which should be preloaded
    that.load(data.get(SETTINGS, PRELOAD));
  }
  var Skins = Skin.prototype;

  // Skin public methods and properties
  // ----------------------------------
  // load modules, and handle the return value
  // if its a function, run it on this instance context
  // if its data, merge it to instance data
  Skins.load = function(modules) {
    var that = this
      , data = that.data
      , count
      , decorator;
    if (!isArray(modules)) modules = slice.call(arguments, 0);
    require(data.get(SETTINGS, PACK), modules, function() {
      for (count in arguments) {
        decorator = arguments[count];
        if (isFunction(decorator)) decorator.call(that);
        else if (isObject(decorator)) data.set(decorator);
      }
    })
  }

  // Skin static methods and properties
  // ----------------------------------
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
  , preload: ['adapter', 'base', 'sense']
    // default paths for modules
    // TODO: when using this file as data-main in requirejs, following is not needed
    // I just kept it for writing the documentation later
  // , pack: {
  //     baseUrl: './'
  //   , paths: {}
  //   }
  }

  // assign cached Skin back and return this object
  // should be at the beginning of other codes
  // e.g. var NewSkin = Skin.noConflict();
  //      var newSkin = new NewSkin({alias: 'newSkin'});
  //      var Skin    = { someOtherObject: 'should be defined after Skin.noConflict()' }
  Skin.noConflict = function() {
    root.Skin = oldSkin;
    return this;
  }




  // Skin.Data class
  // ===============
  Skin.Data = function(data) {
    this.data = data || {};
  }
  var Datas = Skin.Data.prototype;

  // Skin.Data public methods and properties
  // ---------------------------------------
  // set value of an index path, related to the pointer to data objects
  // index path can be an array, or string chunks sliced by . or -
  Datas.set = function() {
    var data     = this.data
      , sanitize = Skin.Data.sanitize
      , splitter = Skin.Data.splitter
      , args     = arguments
      , pointer, index, value, key;
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
        else if (isString(args[0])) {
          if (splitter.test(args[0])) {
            // TODO: parse strings for settings values
          } else {
            // only a single key has been passed in
            // create an empty object for that key if it doesn't exist
            data[args[0]] || (data[args[0]] = {});
          }
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
  Datas.get = function() {
    var data     = this.data
      , sanitize = Skin.Data.sanitize
      , args     = arguments
      , pointer, index, key, flag;
    if (isObject(args[0])) {
      pointer = args[0];
      index   = sanitize(args[1]);
    } else if (args.length) {
      // first argument should be an index anyways,
      // other arguments can be pushed in index array as well
      // this way we can use data.get('a', 'b', 'c', 'd');
      pointer = data;
      index   = sanitize(args[0]).concat(slice.call(args, 1));
    } else return data;
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

  // Skin.Data static methods and properties
  // ---------------------------------------
  // convert string index to array index
  Skin.Data.splitter = /[\s.-]/;
  Skin.Data.sanitize = function(index) { return (isArray(index))? index : (isString(index))? index.split(Skin.Data.splitter) : [] }




  // Skin.View class
  // ===============
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
    
    }
  }

  // View static properties
  // ----------------------
  Skin.View.counter = 0;
  Skin.View.defaults = {
    // plugin name, unique id prefix etc.
    alias: 'view'
  }


}).call(this);