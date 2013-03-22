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
  function isBoolean(symbol)  { return typeof(symbol) === 'boolean' }
  function isObject(symbol)   { return symbol != null && typeof(symbol) === 'object' && !isArray(symbol) }
  function isNode(symbol)     { return symbol != null && symbol.nodeType }

  // key strings
  var SETTINGS = 'settings'
    , BASE     = 'base'
    , PLUGIN   = 'plugin'
    , REQUIRE  = 'require'
    , PRELOAD  = 'preload'
    , PACK     = 'pack';




  // Skin class and namespace
  // ========================
  var Skin = root.Skin = function(options) {
    var that = this
      , data = that.data = new Data();
    // default settings
    data.set(SETTINGS, { base: Skin.defaults });
    // parse options
    that.configure(options);
    // load modules which should be preloaded
    that.fetch(data.get(SETTINGS, PRELOAD));
  }
  var Skins = Skin.prototype;

  // Skin public methods
  // -------------------
  // merge in new options and perform necessary actions
  Skins.configure = function(options) {
    var that = this
      , data = that.data;
    // merge in new options
    if (options) data.set(SETTINGS, options);
    // assign to instance
    that.require = data.get(SETTINGS, REQUIRE);
    that.plugin  = data.get(SETTINGS, PLUGIN);
  }

  // fetch modules, and handle the return value
  // if its a function, run it on this instance context
  // if its data, merge it to instance data
  Skins.fetch = function(modules) {
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
  // e.g. var NewSkin = Skin.noConflict();
  //      var newSkin = new NewSkin({alias: 'newSkin'});
  //      var Skin    = { someOtherObject: 'should be defined after Skin.noConflict()' }
  Skin.noConflict = function() {
    root.Skin = oldSkin;
    return this;
  }

  // create unique id for everything
  Skin.token = -1;
  var uniqueId = Skin.uniqueId = function(symbol) {
    if (symbol) {
      if (symbol.uniqueId) return symbol.uniqueId;
      //else if (isNode(symbol)) return Skin.node(symbol).uniqueId || Skin.node(symbol, { uniqueId: ++Skin.token });
      else if (isObject(symbol)) return symbol.uniqueId = ((symbol.alias)? symbol.alias : '') + ++Skin.token;
    }
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
          
          var publisherId = uniqueId(publisher);

          subscriptions[publisherId] || (subscriptions[publisherId] = []);
          var subscription = {
                publisher: publisher
              , message: message
              , callback: callback
              , index: subscriptions[publisherId].length
              };
          subscriptions[publisherId].push(subscription);
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

      , publish: function(message, data) {
          var recipients = subscribers(message)
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
  // set value of an index path, related to the pointer to data objects
  // index path can be an array, or string chunks sliced by . or -
  Datas.set = function() {
    var data     = this.data
      , hub      = Hub.getInstance()
      , sanitize = Data.sanitize
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
          if (Data.splitter.test(args[0])) {
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
    if (!index.length && isObject(value)) for (key in value) this.set(pointer, [key], value[key]);
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
        else if (key != BASE && isObject(value) && isObject(pointer[key])) {
          // merge two objects
          pointer = pointer[key];
          for (key in value) this.set(pointer, [key], value[key]);
        }
        else pointer = pointer[key] = value;
      }
    }
    return pointer;
  }

  // get value of an index path, related to the pointer to data objects
  // index path can be an array, or string chunks sliced by . or -
  Datas.get = function() {
    var data     = this.data
      , sanitize = Data.sanitize
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

  // find { 'key': value } pairs and return their index paths
  // first arguments can be a sub branch pointer and / or index, optional
  // next argument would be the condition { 'key': value }
  // last argument indicates if we should search recursively, boolean, default is false
  Datas.find = function() {
    var that     = this
      , args     = slice.call(arguments, 0)
      , pointer, condition, recursive, result;
    recursive = args.slice(-1)[0];
    if (isBoolean(recursive)) {
      args = args.slice(0, -1);
    } else recursive = false;
    condition = args.slice(-1)[0];
    args = args.slice(0, -1);
    pointer = that.get.apply(that, args);
    
  }

  // Data static methods and properties
  // ----------------------------------
  // convert string index to array index
  Data.splitter = /[\s.-]/;
  Data.sanitize = function(index) { return (isArray(index))? index : (isString(index))? index.split(Data.splitter) : [] }




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