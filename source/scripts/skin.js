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
  var _root = this, _oldSkin = _root.skin, _queue = [], _settings, _initialized, _hub

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

  // queue calls until initialize is done, or core or required modules are loaded
  function _enqueue(callback, args, context) { _queue.push([callback, args, context]) }
  // try to execute queued calls
  // TODO: this is LIFO now
  function _dequeue() {
    var count, succeed;
    for (count = _queue.length; count >= 0; count--) {
      succeed = true;
      try { _queue[count][0].apply(_queue[count][2] || this, _queue[count][1]) }
      catch(exception) { succeed = false }
      finally { if (succeed) _queue.splice(count, 1) }
    }
  }

  // initialize skin
  function _initialize() {
    _initialized = false;
    // TODO: implement jQuery, Zepto, Underscore and Backbone versions of adapter
    //       detect which library is available, then load a specific adapter
    //_extend(_settings.pack, { paths: { 'adapter': 'adapter.javascript' }});
    _load(['hub'], function() {
      // assign hub
      _hub = skin.Hub.getInstance();
      // dequeue, if there are standing requests
      _dequeue();
      // TODO: implement skin.ready() using events
      _initialized = true;
    })
  }

  // load modules, invoke callback
  function _load(modules, callback, args, context) {
    var count, module
    _settings.require(_settings.pack, modules, function() {
      for (count in modules) {
        module = modules[count];
      //   if (isFunction(module)) module.call(that);
      //   else if (isObject(module)) Data.set(data, module);
      }
      if (_isFunction(callback)) callback.apply(context || this, args);
    })
  }




  // Main Skin Function and Namespace
  // ================================
  // skin is intentionally not Capitalized
  // example: skin({ options... })
  //          skin(name)
  //          skin(element)
  //          skin(element, name)
  //          skin(element, name, { options... })
  //          skin(element, name).action()
  var skin = _root.skin = function() {
    var args = Array.prototype.slice.call(arguments, 0), element, name, options
    // assign default settings
    _settings || (_settings = skin.defaults);
    // find out what are the arguments
    if (_isElement(args[0])) { element = args[0]; args = args.slice(1) }
    if (_isString(args[0]))  { name    = args[0]; args = args.slice(1) }
    if (_isObject(args[0]))  { options = args[0] }
    // check if only options object is available, configure skin itself
    // this way we can configure require, preload and pack before initialize or loading any other module
    if (options && !element && !name) _extend(_settings, options);
    // if skin hasn't been initialized yet, queue the request and initialize
    else if (!_initialized) {
      _enqueue(skin, args, this);
      // ensure initialize function runs only once
      if (_initialized == undefined) _initialize();
    } else {
      // get or create skin
    }
  }

  // Static Methods and Properties
  // =============================
  // version
  skin.version = '0.1.1';
  // default settings
  skin.defaults = {
    // name, used for plugins, unique id prefix etc.
    alias: 'skin'
    // automatically create plugins for jQuery, Zepto etc.
  , plugin: true
    // modules which should be preloaded, for fast invokation
  , preload: ['base', 'sense']
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
  skin.noConflict = function() { _root.skin = _oldSkin; return this }

  // methods used by modules or users, to modify core data
  skin.configure = function() {}
  skin.template  = function() {}
  skin.action    = function() {}
  skin.recipe    = function() {}




  define('skin', function() { return skin });
}).call(this);