// skin.js 0.1.1
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

(function() {
  "use strict";




  // Private Methods and Properties
  // ==============================
  // shortcuts and references
  // existing skin is kept as oldSkin, to be assigned back in noConflict()
  var _root = this, _oldSkin = _root.skin, _queue = [], _settings, _initialized, _skin, _adapter, _hub;

  // queue calls until initialize is done, or core or required modules are loaded
  function _enqueue(callback, args, context) { _queue.unshift([callback, args, context]); }

  // try to execute queued calls
  function _dequeue() {
    var count, succeed;
    for (count = _queue.length; count >= 0; count--) {
      succeed = true;
      try { _queue[count][0].apply(_queue[count][2] || this, _queue[count][1]); }
      catch(exception) { succeed = false; }
      finally { if (succeed) _queue.splice(count, 1); }
    }
  }

  // initialize skin
  function _initialize() {
    _initialized = false;
    // TODO: implement jQuery, Zepto, Underscore and Backbone versions of adapter
    //       detect which library is available, then load a specific adapter
    _load(['adapter', 'hub', 'base'], function() {
      // assign hub
      _hub = _skin.hub;
      // TODO: implement skin.ready() using events
      _initialized = true;
    });
  }

  // load modules, invoke callback
  function _load(modules, callback, args, context) {
    var count, module
    _settings.require(_settings.pack, modules, function() {
      for (count in modules) {
        module = modules[count];
      }
      if (_adapter.isFunction(callback)) callback.apply(context || this, args);
      // try dequeue
      _dequeue();
    });
  }




  // Main Skin Function and Namespace
  // ================================
  // example: skin({ options... })
  //          skin(name)
  //          skin(element)
  //          skin(element, name)
  //          skin(element, name, { options... })
  //          skin(element, name).action()
  _skin = _root.skin = function() {
    var args = _adapter.arraySlice.call(arguments, 0), element, name, options;
    // assign default settings
    _settings || (_settings = skin.defaults);
    // find out what are the arguments
    if (_adapter.isElement(args[0])) { element = args[0]; args = args.slice(1) }
    if (_adapter.isString(args[0]))  { name    = args[0]; args = args.slice(1) }
    if (_adapter.isObject(args[0]))  { options = args[0] }
    // check if only options object is available, configure skin itself
    // this way we can configure require, preload and pack before initialize or loading any other module
    if (options && !element && !name) _adapter.extend(true, _settings, options);
    // if skin hasn't been initialized yet, queue the request and initialize
    else if (!_initialized) {
      _enqueue(_skin, args, this);
      // ensure initialize function runs only once
      if (_initialized == undefined) _initialize();
    } else {
      // get or create skin
    }
  }

  // Static Methods and Properties
  // =============================
  // version
  _skin.version = '0.1.1';
  // default settings
  _skin.defaults = {
    // name, used for plugins, unique id prefix etc.
    alias: 'skin'
    // automatically create plugins for jQuery, Zepto etc.
  , plugin: true
    // modules which should be preloaded, for fast invokation
  , preload: []
    // require options, base url, paths
  , pack: {}
    // default method for asynchronously loading modules
    // using define() module definition, proposed by CommonJS
    // for Asynchronous Module Definition (AMD)
    // require.js or curl.js should be available, otherwise users should
    // implement or adapt their own loader and assign it to skin through settings
    // example: skin({ require: function(package, modules, callback) { implementation... }})
  , require: _root.require || _root.curl
  }

  // assign cached skin back and return this object
  // example: var newSkin = skin.noConflict()
  _skin.noConflict = function() { _root.skin = _oldSkin; return this }

  // method used in extension modules to add templates, actions and recipes
  _skin.set = function(data) { if (_hub) _hub.set(data); else _enqueue(_skin.set, [data]); }




  // Skin JavaScript Adapter Module
  // ==============================
  // basic helpers, under adapter namespace
  _adapter = _skin.adapter = {};

  _adapter.Objects     = Object.prototype;
  _adapter.Arrays      = Array.prototype;
  _adapter.arraySlice  = _adapter.Arrays.slice;
  _adapter.objectHas   = _adapter.Objects.hasOwnProperty;
  _adapter.isArray     = function(symbol) { return symbol != null && (symbol.isArray || symbol instanceof Array); }
  _adapter.isString    = function(symbol) { return typeof(symbol) === 'string'; }
  _adapter.isFunction  = function(symbol) { return typeof(symbol) === 'function'; }
  _adapter.isBoolean   = function(symbol) { return typeof(symbol) === 'boolean'; }
  _adapter.isUndefined = function(symbol) { return typeof(symbol) === 'undefined'; }
  _adapter.isObject    = function(symbol) { return symbol != null && typeof(symbol) === 'object' && !_adapter.isArray(symbol); }
  _adapter.isElement   = function(symbol) { return symbol != null && symbol.nodeType == Node.ELEMENT_NODE; }

  // extend an array or object, remove undefined keys
  // we need this for merging skin options, before other adapter methods are loaded
  // example: extend(recursive, target, source)
  //          extend({ adapter... })
  _adapter.extend = function() {
    var args = _adapter.arraySlice.call(arguments, 0), recursive = true, target, source;
    // last argument is always the source
    source = args.slice(-1)[0];
    args = args.slice(0, -1);
    // if first argument is boolean, its recursive flag
    if (_adapter.isBoolean(args[0])) { recursive = args[0]; args = args.slice(1); }
    // if there's no target, extend adapter itself
    target = (args.length)? args[0] : _adapter;
    for (var key in source) {
      if (recursive && (_adapter.isObject(source[key]) || _adapter.isArray(source[key]))) {
        if (_adapter.isObject(source[key]) && !_adapter.isObject(target[key])) target[key] = {};
        if (_adapter.isArray(source[key])  && !_adapter.isArray(target[key]))  target[key] = [];
        _adapter.extend(recursive, target[key], source[key]);
      }
      else if (source[key] !== undefined) target[key] = source[key];
      else if (target[key]) delete target[key];
    }
  }




  define('skin', function() { return _skin; });
}).call(this);