// skin.js 0.1.0
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

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
  var UID       = 'uid'         // used in skin uid
    , CALLBACKS = 'callbacks'   // used in hub subscribe, unsubscribe, publish
    , PUBLISHER = 'publisher'   // used in hub subscribe, unsubscribe, publish
    , BASE      = 'base'        // used in data get, set, settings
    , PARENT    = 'parent'      // used in data
    , ALIAS     = 'alias'       // used in settings
    , SETTINGS  = 'settings'    // used in settings
    , PLUGIN    = 'plugin'      // used in settings
    , REQUIRE   = 'require'     // used in settings
    , PRELOAD   = 'preload'     // used in settings
    , PACK      = 'pack'        // used in settings




  // Skin class and namespace
  // ========================
  var Skin = root.Skin = function(options) {

    // Skin private methods and properties
    // -----------------------------------
    var that = this
      , data = {}
    // default settings
    data[SETTINGS] = {}
    data[SETTINGS][BASE] = Skin.defaults
    // parse options
    configure(options)
    // load modules which should be preloaded
    fetch(Data.get(data, [SETTINGS, PRELOAD]))

    // merge in new options and perform necessary actions
    function configure(options) {
      // merge in new options
      if (options) Data.set(data, [SETTINGS], options)
      // assign to instance
      that.require = Data.get(data, [SETTINGS, REQUIRE])
      that.plugin  = Data.get(data, [SETTINGS, PLUGIN])
    }

    // fetch modules, and handle the return value
    // if its a function, run it on this instance context, decorator
    // if its data, merge it to instance data
    function fetch(modules) {
      var count, module;
      if (!isArray(modules)) modules = slice.call(arguments, 0);
      require(Data.get(data, [SETTINGS, PACK]), modules, function() {
        for (count in arguments) {
          module = arguments[count];
          if (isFunction(module)) module.call(that);
          else if (isObject(module)) Data.set(data, module);
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
  // zero is reserved for null or undefined
  var token = Skin.token = 0
    , uid = Skin.uid = function(symbol) {
      if (!symbol) return '0';
      // TODO: stored uid on dom elements should be removed at some point
      if (isObject(symbol)) return symbol[UID] || (symbol[UID] = ((symbol[ALIAS])? symbol[ALIAS] : '') + ++Skin.token);
      return ((isString(symbol))? symbol : '') + ++Skin.token;
    }




  // Hub class
  // =========
  var Hub = Skin.Hub = (function() {
    // singleton instance
    var instance
    function initialize() {

      // Hub private methods and properties
      // ----------------------------------
      var subscriptions = {}

      return {

        // Hub public methods
        // ------------------
        subscribe: function(publisher, message, callback) {
          var publisherUid = uid(publisher)
            , subscription = subscriptions[publisherUid]     || (subscriptions[publisherUid] = {})
            , subscriber   = Data.get(subscription, message) || Data.set(subscription, message, {})
            , callbacks    = subscriber[CALLBACKS]           || (subscriber[CALLBACKS] = [])
          if (callbacks.indexOf(callback) == -1) callbacks.push(callback);
        }

        // example: unsubscribe(publisher, message, callback)
      , unsubscribe: function() {
          var args        = slice.call(arguments, 0)
            , condition   = {}
            , subscription, subscribers
            , publisher, message, callback
          if (isObject(args[0])) {
            publisher = args[0];
            args = args.slice(1);
          }
          subscription = subscriptions[uid(publisher)];
          if (isString(args[0])) {
            message = args[0];
            args = args.slice(1);
          }
          condition[CALLBACKS] = '*';
          subscribers = Data.find(subscription, message, condition, true);
          if (isFunction(args[0])) {
            callback = args[0];
            condition[CALLBACKS] = callback;
          }
          //subscribers = Data.filter(subscribers, condition);
          // TODO: remove nodes if callbacks are empty
        }

      , publish: function(publisher, message, data) {
          var publisherUid = uid(publisher)
            , subscription = subscriptions[uid(publisher)]
            , condition    = {}
            , subscribers, subscriber, callbacks, callback
          // set condition and finding callbacks in sub branches
          condition[CALLBACKS] = '*';
          subscribers = Data.find(subscription, message, condition, true);
          // calling callbacks
          for (subscriber in subscribers) {
            callbacks = subscribers[subscriber][CALLBACKS];
            for (callback in callbacks) {
              try {
                // TODO: if a callback returns false break the chain
                callbacks[callback](data);
              } catch(exception) {
                throw exception;
              }
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




  // Data module
  // ===========
  var Data = Skin.Data = (function() {

    // Data private methods and properties
    // -----------------------------------
    // sanitize index, convert multi arguments or chunked string to array
    var splitter = /[\s.-]/
    function sanitize() {
      var args  = arguments
      return (isArray(args[0]))? args[0] : (args.length > 1)? slice.call(args, 0) : (isString(args[0]))? args[0].split(splitter) : []
    }

    return {

      // Data public methods
      // -------------------
      // get the pointer to an index path, related to the starting pointer
      // index path can be an array, or string chunks sliced by . or -
      // returns null if the path doesn't exist
      // example: get(pointer, index)
      get: function() {
        var args = slice.call(arguments, 0)
          , pointer, index, key, flag;
        pointer = args[0];
        args = args.slice(1);
        if (args.length) index = sanitize.apply(this, args);
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
      // example: set(metadata, pointer, index, value)
    , set: function() {
        var args = slice.call(arguments, 0)
          , pointer, index, key, value, metadata;
        // last argument is always the value
        value = args.slice(-1)[0];
        args = args.slice(0, -1);
        // store metadata
        metadata = args[0];
        if (isBoolean(metadata)) args = args.slice(1);
        else metadata = false;
        // any object left at the beginning of arguments should be the pointer
        pointer = args[0];
        args = args.slice(1);
        if (args.length) index = sanitize.apply(this, args);
        else index = [];
        if (!index.length) {
          // if value is a single string and there's no pointer or index
          // we parse the string for special cases
          if (isString(value)) {
            if (splitter.test(value)) {
              // TODO: parse strings for some magic!
            } else {
              // only a single key has been passed in, no other arguments
              // create an empty object for that key if it doesn't exist
              pointer[value] || (pointer[value] = {});
              if (metadata) pointer[value][PARENT] = pointer; 
              pointer = pointer[value];
            }
          } else if (isObject(value)) for (key in value) this.set(metadata, pointer, [key], value[key]);
          // handle an empty index with an object as value
          // the value can't be assigned to the pointer directly
          // hence, if the value isn't an object we just ignore it
          // if the value is an object, we call set for each of its keys
        } else while (index.length) {
          key = index.shift();
          if (index.length) {
            // there are stil deeper levels
            if (!has.call(pointer, key) || !isObject(pointer[key])) {
              // isObject() returns false for arrays
              // otherwise the next level object could be pushed in the existing array
              pointer[key] = {};
              if (metadata) pointer[key][PARENT] = pointer;
            }
            pointer = pointer[key];
          } else {
            // no more levels, last key
            // if value is null, we remove the key by convension
            // no one wants a key pointing to null!
            if (value == null) delete pointer[key];
            else if (key != BASE && isObject(value) && isObject(pointer[key])) {
              if (metadata) pointer[key][PARENT] = pointer;
              pointer = pointer[key];
              for (key in value) this.set(metadata, pointer, [key], value[key]);
            } else {
              // replace or create the value
              pointer = pointer[key] = value;
            }
          }
        }
        return pointer;
      }

    , indexify: function(pointer) {
      
      }

      // find { key: value, anotherKey: anotherValue } pairs in given pointer, index
      // and returns array of pointers to containing children
      // first arguments are pointer and index, will be passed to get() method
      // followed by the condition object { key: value }
      // last boolean argument indicates if we should search children recursively, default is false
      // example: data.find(pointer, index, { key: 'value' }, recursive);
    , find: function() {
        var that       = this
          , args       = slice.call(arguments, 0)
          , collection = []
          , pointer, key, condition, recursive;
        // recursive should be the last argument, if its boolean
        recursive = args.slice(-1)[0];
        if (isBoolean(recursive)) args = args.slice(0, -1);
        else recursive = false;
        // then the condition
        condition = args.slice(-1)[0];
        args = args.slice(0, -1);
        // remainings can be passed to get()
        pointer = this.get.apply(this, args);
        // recursive part, results is passed by reference
        var pick = function(collection, pointer, condition, recursive) {
          if (that.match(pointer, condition)) collection.push(pointer);
          if (recursive && isObject(pointer)) for (key in pointer) pick(collection, pointer[key], condition, recursive);
        }
        if (isObject(pointer)) pick(collection, pointer, condition, recursive);
        return collection;
      }

      // filter an array of objects, keep those which match a condition
    , filter: function(collection, condition, method) {
        for (var count = 0; count < collection.length; count++) {
          if (this.match(collection[count], condition, method)) collection = collection.splice(count, 1);
        }
        return collection;
      }

      // check if target object meets a condition, methods can be any, all and exact
      // method undefined (default) means if any of the conditions matched return true
      // method false, means all of the conditions should match
      // method true, means exact match, hence two given objects should contain exactly the same content tree
      // example: Data.match(target, { foo: 'bar', boo: someObject }, false);
      // TODO: implement BASE and MAP
    , match: function(target, condition, method) {
        // speed check
        if (condition === target) return true;
        var key, matched;
        // simple check if all keys exist for exact or all matching methods
        // before going into costly recursive matching
        if (isBoolean(method)) for (key in condition) if (isUndefined(target[key])) return false;

        // now go through every key
        for (key in condition) {
          matched = false;
          if (condition[key]) {
            // wild card, any value
            if (condition[key] == '*' && has.call(target, key)) matched = true;
            // recursive match for arrays and objects
            else if ((isObject(condition[key]) || isArray(condition[key]))
                 && (Data.match(condition[key], target[key], method))) matched = true;
            // filter function, only if object[key] is not a function itself
            // if it is, we simply compare two functions
            else if (isFunction(condition[key]) && !isFunction(target[key])
                 && condition[key](target[key])) matched = true;
            // simple compare
            else if (condition[key] == target[key]) matched = true;
            // if method is any and we have a match
            // or method is all or exact and we don't have a match
            // no need to continue the loop
            if (matched && isUndefined(method)) return true;
            if (!matched && isBoolean(method)) return false;
          } else {
            // if method is exact and object has a key condition doesn't
            if (method == true && target[key]) return false;
          }
        }

        // inverse check, in exact match all target keys should have been covered
        if (method == true) for (key in target) if (isUndefined(condition[key])) return false;
        if (isUndefined(method)) return matched;
        else return true;
      }
    }
  })();





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




}).call(this);