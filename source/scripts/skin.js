// skin.js 0.1.0
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

(function() {
  "use strict";




  // Module Private Methods and Properties
  // =====================================
  // shortcuts and references
  // existing skin is kept as oldSkin, to assign back in noConflict()
  var _root = this, _oldSkin = _root.skin, _queue = [], _settings, _initialized, _hub, _require

  // helpers for local use
  // most likely the adapter has not been loaded yet, so we need these local helpers
  function _isArray(symbol)    { return symbol instanceof Array }
  function _isString(symbol)   { return typeof(symbol) === 'string' }
  function _isFunction(symbol) { return typeof(symbol) === 'function' }
  function _isObject(symbol)   { return symbol && typeof(symbol) === 'object' && !_isArray(symbol) }
  function _isElement(symbol)  { return symbol && symbol.nodeType == Node.ELEMENT_NODE }

  // recursive extend for merging skin settings
  function _extend(target, source) {
    for (var key in source) {
      if (_isObject(source[key]) || _isArray(source[key])) {
        if (_isArray(source[key]) && !_isArray(target[key])) target[key] = []
        else if (_isObject(source[key]) && !_isObject(target[key])) target[key] = {}
        _extend(target[key], source[key])
      }
      else if (source[key] !== undefined) target[key] = source[key]
      else if (target[key]) delete target[key]
    }
  }

  // queue skin calls until initialize is done and core modules are loaded
  function _enqueue(callback, args, context) { _queue.push([callback, args, context]) }
  function _dequeue() {
    var count, length, succeed
    for (count = 0, length = _queue.length; count < length; count++) {
      succeed = true;
      try { _queue[count][0].apply(_queue[count][2] || skin, _queue[count][1]) }
      catch(exception) { succeed = false }
      finally { if (succeed) _queue = _queue.splice(count, 1) }
    }
  }

  // merge in new options and perform necessary actions
  function _configure(options) {
    _extend(_settings, options);
    // assign to local require
    _require = _settings.require;
  }

  // initialize skin
  function _initialize() {
    // TODO: implement jQuery, Zepto, Underscore and Backbone versions of adapter
    //       detect which library is available, then load a specific adapter
    //_extend(_settings.pack, { paths: { 'adapter': 'adapter.javascript' }});
    _require(_settings.pack, ['hub'], function() {
      // assign hub
      _hub = skin.Hub.getInstance();
      // dequeue, if there are standing requests
      _dequeue();
      // TODO: implement skin.ready() using events
      _initialized = true;
    })
  }




  // Main Skin Method and Namespace
  // ==============================
  // skin is intentionally not Capitalized
  var skin = _root.skin = function() {
    var args = Array.prototype.slice.call(arguments), element, name, options
    // assign default settings
    _settings || (_settings = skin.defaults);
    // find out what are the arguments
    if (_isElement(args[0])) { element = args[0]; args = args.slice(1) }
    if (_isString(args[0]))  { name    = args[0]; args = args.slice(1) }
    if (_isObject(args[0]))  { options = args[0] }
    // check if only options object is available, configure skin itself
    // this way we can configure string keys, require, preload and pack before anything is loaded
    if (options && !element && !name) _configure(options);
    // if skin hasn't been initialized yet, queue the request and initialize
    else if (!_initialized) {
      _enqueue(skin, args, this);
      _initialize();
    } else {
      // get or create skin
    }
  }

  // Skin Static Methods and Properties
  // ==================================
  // version
  skin.VERSION = '0.1.0';
  // default settings
  skin.defaults = {
    // name, used for plugins, unique id prefix etc.
    alias: 'skin'
    // automatically create plugins for jQuery, Zepto etc.
  , plugin: true
    // key strings
  , keys: {
      UID:   'uid'
    , ALIAS: 'alias'
    }
    // modules which should be preloaded, for fast invokation
  , preload: ['base', 'sense']
    // require options, base url, paths
  , pack: {}
    // default method to load other modules
    // based on define(), proposed by CommonJS
    // for Asynchronous Module Definition (AMD)
  , require: _root.require || _root.curl
  }

  // assign cached skin back and return this object
  // example: var newSkin = skin.noConflict()
  skin.noConflict = function() { _root.skin = _oldSkin; return this }

  // create unique id for everything
  // zero is reserved for null or undefined
  // var _token = 0, keys = _settings.keys
  // skin.uid = function(symbol) {
  //   if (!symbol) return '0';
  //   // TODO: stored uid on dom elements should be removed at some point
  //   if (_isObject(symbol)) return symbol[keys.UID] || (symbol[keys.UID] = ((symbol[keys.ALIAS])? symbol[keys.ALIAS] : '') + ++_token);
  //   return ((_isString(symbol))? symbol : '') + ++_token;
  // }




  define('skin', function() { return skin });
}).call(this);