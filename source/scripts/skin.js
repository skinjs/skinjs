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
  function isArray(symbol)     { return symbol instanceof Array }
  function isString(symbol)    { return typeof(symbol) === 'string' }
  function isFunction(symbol)  { return typeof(symbol) === 'function' }
  function isBoolean(symbol)   { return typeof(symbol) === 'boolean' }
  function isUndefined(symbol) { return typeof(symbol) === 'undefined' }
  function isObject(symbol)    { return symbol != null && typeof(symbol) === 'object' && !isArray(symbol) }
  function isNode(symbol)      { return symbol != null && symbol.nodeType }

  // key strings
  var UID       = 'uid'
    , CALLBACKS = 'callbacks'
    , PUBLISHER = 'publisher'
    , ALIAS     = 'alias'
    , SETTINGS  = 'settings'
    , NODES     = 'nodes'
    , BASE      = 'base'
    , PLUGIN    = 'plugin'
    , REQUIRE   = 'require'
    , PRELOAD   = 'preload'
    , PACK      = 'pack';




  // Skin class and namespace
  // ========================
  var Skin = root.Skin = function(options) {

    // Skin private methods and properties
    // -----------------------------------
    var that     = this
      , data     = new Data()
      , settings = {};
    // default settings
    settings[BASE] = Skin.defaults;
    data.set(SETTINGS, settings);
    // parse options
    configure(options);
    // load modules which should be preloaded
    fetch(data.get(SETTINGS, PRELOAD));

    // merge in new options and perform necessary actions
    function configure(options) {
      // merge in new options
      if (options) data.set(SETTINGS, options);
      // assign to instance
      that.require = data.get(SETTINGS, REQUIRE);
      that.plugin  = data.get(SETTINGS, PLUGIN);
    }

    // fetch modules, and handle the return value
    // if its a function, run it on this instance context, decorator
    // if its data, merge it to instance data
    function fetch(modules) {
      var count, module;
      if (!isArray(modules)) modules = slice.call(arguments, 0);
      require(data.get(SETTINGS, PACK), modules, function() {
        for (count in arguments) {
          module = arguments[count];
          if (isFunction(module)) module.call(that);
          else if (isObject(module)) data.set(module);
        }
      })
    }

    // Skin public methods
    // -------------------
  }

  // Skin static methods and properties
  // ----------------------------------
  Skin.VERSION = '0.1.0';
  Skin.defaults = {
    // name, used for plugins, unique id prefix etc.
    alias: 'skin'
    // automatically create plugins for jQuery, Zepto etc.
  , plugin: true
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
  // example: var NewSkin = Skin.noConflict();
  //          var newSkin = new NewSkin({alias: 'newSkin'});
  //          var Skin    = { someOtherObject: 'should be defined after Skin.noConflict()' }
  Skin.noConflict = function() {
    root.Skin = oldSkin;
    return this;
  }

  // create unique id for everything
  var token = Skin.token = -1
    , uid = Skin.uid = function(symbol) {
      // TODO: stored uid on dom elements should be removed at some point
      if (isObject(symbol)) return symbol[UID] || (symbol[UID] = ((symbol[ALIAS])? symbol[ALIAS] : '') + ++Skin.token);
      return ((isString(symbol))? symbol : '') + ++Skin.token;
    }




  // Hub class
  // =========
  var Hub = Skin.Hub = (function() {
    // singleton instance
    var instance;
    function initialize() {

      // Hub private methods and properties
      // ----------------------------------
      var subscriptions = new Data();

      // find and return an array of all existing subscribers for a message
      // messages are string chunks sliced by . representing a hierarchy
      function subscribers(message) {
        if (!isString(message)) return [];
        var subscribers = subscriptions[message] || []
          , index       = message.lastIndexOf('.');
        while (index !== -1) {
          message = message.substr(0, index);
          if (subscriptions[message]) subscribers.concat(subscriptions[message]);
          index = message.lastIndexOf('.');
        }
        return subscribers;
      }

      return {

        // Hub public methods
        // ------------------
        subscribe: function(publisher, message, callback) {
          var publisherUid = uid(publisher)
            , callbacks    = subscriptions.get(publisherUid, message, CALLBACKS) || subscriptions.set(publisherUid, message, CALLBACKS, []);
          if (!callbacks.indexOf(callback)) callbacks.push(callback);
        }

      , unsubscribe: function(publisher, message, callback) {
          var message, count;
          for (message in subscription) {
            for (count = 0; count < subscription[message].length; count++) {
              if (subscription[message][count].token === token) {
                subscription[message].splice(count, 1);
                if (!subscription[message].length) delete subscription[message];
                return token;
              }
            }
          }
          return false;
        }

      , publish: function(publisher, message) {
          var publisherUid = uid(publisher)
            , callbacks    = subscriptions.get(subscription, message, CALLBACKS)
            , count;
          for (count in recipients) {
            try {
              recipients[count].callback(message, data);
            } catch(exception) {
              throw exception;
            }
          }
        }
      }
    }

    // get or create singleton instance
    return {
      getInstance: function() {
        if (!instance) instance = initialize();
        return instance;
      }
    }
  })();




  // Data class
  // ==========
  var Data = Skin.Data = function(data) {

    // Data private methods and properties
    // -----------------------------------
    this.data = data || {};
  }
  var Datas = Data.prototype;

  // Data public methods
  // -------------------
  // get the pointer to an index path, related to the starting pointer
  // index path can be an array, or string chunks sliced by . or -
  // returns null if the path doesn't exist
  // example: get(sanitize, pointer, index)
  Datas.get = function() {
    var args     = slice.call(arguments, 0)
      , pointer  = this.data
      , sanitize = true
      , index, key, flag;
    // we can disable sanitizing of index, when index is a valid array
    // this can optimize speed for internal use
    if (isBoolean(args[0])) {
      sanitize = args[0];
      args = args.slice(1);
    }
    // any object left at the beginning of arguments should be the pointer
    if (isObject(args[0])) {
      pointer = args[0];
      args = args.slice(1);
    }
    if (!sanitize) index = args[0];
    else if (args.length) index = Data.sanitize(args);
    else return pointer;
    while (index.length) {
      key = index.shift();
      flag = false;
      if (has.call(pointer, key)) {
        pointer = pointer[key];
        flag = true;
      } else {
        // check for value in base
        // TODO: implement MAP
        while (isObject(pointer[BASE])) {
          pointer = pointer[BASE];
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

  // set value for an index path, related to the starting pointer
  // index path can be an array, or string chunks sliced by . or -
  // returns pointer to the last modified object or array
  // example: set(sanitize, pointer, index, value)
  Datas.set = function() {
    var args     = slice.call(arguments, 0)
      , pointer  = this.data
      , sanitize = true
      , index, key, value;
    // last argument is always the value
    value = args.slice(-1)[0];
    args = args.slice(0, -1);
    if (args.length) {
      // we can disable sanitizing of index, when index is a valid array
      // this can optimize speed for internal use
      if (isBoolean(args[0])) {
        sanitize = args[0];
        args = args.slice(1);
      }
      // any object left at the beginning of arguments should be the pointer
      if (isObject(args[0])) {
        pointer = args[0];
        args = args.slice(1);
      }
      if (!sanitize) index = args[0];
      else index = Data.sanitize(args);
    } else {
      // if value is a single string and there's no pointer or index
      // we parse the string for special cases
      index = [];
      if (isString(value)) {
        if (Data.splitter.test(value)) {
          // TODO: parse strings for some magic!
        } else {
          // only a single key has been passed in, no other arguments
          // create an empty object for that key if it doesn't exist
          pointer = pointer[value] || (pointer[value] = {});
        }
      }
    }
    // handle an empty index with an object as value
    // the value can't be assigned to the pointer directly
    // hence, if the value isn't an object we just ignore it
    // if the value is an object, we call set for each of its keys
    if (!index.length && isObject(value)) for (key in value) this.set(false, pointer, [key], value[key]);
    else while (index.length) {
      key = index.shift();
      if (index.length) {
        // there are stil deeper levels
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
        else if (key != BASE && isObject(value) && isObject(pointer[key])) {
          // merge two objects, if the value isn't the base reference
          pointer = pointer[key];
          for (key in value) this.set(false, pointer, [key], value[key]);
        }
        // replace or create the value
        else pointer = pointer[key] = value;
      }
    }
    return pointer;
  }

  // find { key: value, anotherKey: anotherValue } pairs in given pointer, index
  // and return array of keys of containing children
  // first optional arguments can be sub branch pointer, index, just like get() method
  // followed by the condition object { key: value }
  // last boolean argument indicates if we should search recursively, default is false
  // example: data.find(pointer, index, { key: 'value' }, true);
  Datas.find = function() {
    var that     = this
      , args     = slice.call(arguments, 0)
      , result   = []
      , pointer, condition, recursive, key;
    recursive = args.slice(-1)[0];
    if (isBoolean(recursive)) {
      args = args.slice(0, -1);
    } else recursive = false;
    condition = args.slice(-1)[0];
    args = args.slice(0, -1);
    pointer = (args.length == 1)? args[0] : that.get.apply(that, args);
    for (key in pointer) {
      // searching in direct children
      if (Data.match(condition, pointer[key])) result.push(key);
      // search recursively in deeper levels
      // TODO: implement this
    }
    return result;
  }

  // Data static methods and properties
  // ----------------------------------
  // sanitize mixed index
  // example: data.get('a', 'b.c', ['d.x', 'e-z'], 'f');
  Data.splitter = /[\s.-]/;
  Data.sanitize = function() {
    var args = arguments, index = [], count;
    for (count in args)
      index = (isString(args[count]))? index.concat(args[count].split(Data.splitter))
            : (isArray(args[count]))? index.concat(Data.sanitize.apply(this, args[count]))
            : index;
    return index;
  }

  // check if object meets a condition, methods can be any, all and exact
  // method undefined (default) means if any of the conditions matched return true
  // method false, means all of the conditions should match
  // method true, means exact match, hence two given objects should contain exactly the same content tree
  // example: Data.match({ foo: 'bar', boo: someObject }, anotherObject, false);
  // TODO: implement BASE and MAP
  Data.match = function(condition, object, method) {
    // speed check
    if (condition === object) return true;
    var key, matched;
    // simple check if all keys exist for exact or all matching methods
    // before going into costly recursive matching
    if (isBoolean(method)) for (key in condition) if (isUndefined(object[key])) return false;

    // now go through every key
    for (key in condition) {
      matched = false;
      if (condition[key]) {
        // wild card, any value
        if (condition[key] == '*' && has.call(object, key)) matched = true;
        // recursive match for arrays and objects
        else if ((isObject(condition[key]) || isArray(condition[key]))
             && (Data.match(condition[key], object[key], method))) matched = true;
        // filter function
        else if ((isFunction(condition[key]))
             && (condition[key](object[key]))) matched = true;
        // simple compare
        else if (condition[key] == object[key]) matched = true;
        // if method is any and we have a match
        // or method is all or exact and we don't have a match
        // no need to continue the loop
        if (matched && isUndefined(method)) return true;
        if (!matched && isBoolean(method)) return false;
      } else {
        // if method is exact and object has a key condition doesn't
        if (method == true && object[key]) return false;
      }
    }

    // inverse check, in exact match all target keys should have been covered
    if (method == true) for (key in object) if (isUndefined(condition[key])) return false;
    if (isUndefined(method)) return matched;
    else return true;
  }





  // View class
  // ==========
  var View = Skin.View = function(key, value) {
    // private
    // -------

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

  // View static methods and properties
  // ----------------------------------
  View.defaults = {
    // plugin name, unique id prefix etc.
    alias: 'view'
  }




  return Skin;
}).call(this);