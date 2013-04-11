// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('skin', function() {




  // Skin JavaScript Adapter Module
  // ==============================
  // provides helpers and shortcuts to be used everywhere
  // basic helpers are added here to be used in this context
  // more helpers can be added to adapter later, via AMD or decorators
  // we can also delegate some of these methods to available libraries
  // such as jQuery, Underscore, Zepto etc.
  var adapter = {};

  adapter.arrays      = Array.prototype;
  adapter.objects     = Object.prototype;
  adapter.arraySlice  = adapter.arrays.slice;
  adapter.objectHas   = adapter.objects.hasOwnProperty;

  adapter.isArray     = function(symbol) { return symbol && (symbol.isArray || symbol instanceof Array); };
  adapter.isObject    = function(symbol) { return symbol && typeof(symbol) === 'object' && !adapter.isArray(symbol); };
  adapter.isElement   = function(symbol) { return symbol && symbol.nodeType == 1; };
  adapter.isString    = function(symbol) { return typeof(symbol) === 'string'; };
  adapter.isFunction  = function(symbol) { return typeof(symbol) === 'function'; };
  adapter.isBoolean   = function(symbol) { return typeof(symbol) === 'boolean'; };
  adapter.isUndefined = function(symbol) { return symbol === undefined; };

  // iterator, breaks if any iteration returns false
  adapter.each = function(symbol, iterator, context) {
    if (adapter.isArray(symbol)) for (var index = 0; index < symbol.length; index++) {
      if (iterator.call(context, symbol[index], index, symbol) === false) return;
    } else if (adapter.isObject(symbol)) for (var key in symbol) {
      if (adapter.objectHas.call(symbol, key)) {
        if (iterator.call(context, symbol[key], key, symbol) === false) return;
      }
    }
  };

  // recursive extend, also removes a property from target if it is explicitly set to undefined in source
  adapter.extend = function(target) {
    adapter.each(adapter.arraySlice.call(arguments, 1), function(source) {
      for (var key in source) {
        if (adapter.isUndefined(source[key]) && target[key]) delete target[key];
        else if (adapter.isObject(source[key]) && adapter.isObject(target[key])) adapter.extend(target[key], source[key]);
        else target[key] = source[key];
      }
    });
    return target;
  };

  // make it easier to support IE8 in future
  adapter.inArray = function(array, item, index) { return adapter.arrays.indexOf.call(array, item, index); };

  // helper for indexing elements
  // adds item, if not exists, at the first empty index
  // returns the index of item
  adapter.indexFor = function(array, item) {
    var empty = array.length;
    for (var index = 0; index < array.length; index++) {
      if (array[index] === item) return index;
      if (array[index] === undefined) empty = index;
    }
    array[empty] = item;
    return empty;
  };

  // push item into array if not exists
  adapter.arrayEnsure = function(array, item) {
    if (adapter.inArray(array, item) == -1) array.push(item);
    return item;
  };

  // add default value into object if not exists
  adapter.objectEnsure = function(object, key, value) {
    if (!adapter.objectHas.call(object, key)) object[key] = value;
    return value;
  };




  // Private Methods and Properties
  // ==============================
  // shortcuts and references
  // existing skin is kept as oldSkin, to be assigned back in noConflict()
  var context = this, oldSkin = context.skin, queue = [], settings, initialized, skin, hub;

  // queue calls until initialize is done, or core or required modules are loaded
  function enqueue(callback, args, context) { queue.unshift([callback, args, context]); }

  // try to execute queued calls
  function dequeue() {
    var count, succeed;
    for (count = queue.length; count >= 0; count--) {
      succeed = true;
      try { queue[count][0].apply(queue[count][2] || this, queue[count][1]); }
      catch(exception) { succeed = false; }
      finally { if (succeed) queue.splice(count, 1); }
    }
  }

  // initialize skin
  function initialize() {
    initialized = false;
    // TODO: implement jQuery, Zepto, Underscore and Backbone versions of adapter
    //       detect which library is available, then load a specific adapter
    load(['adapter', 'hub', 'base'], function() {
      // assign hub
      hub = skin.hub;
      // TODO: implement skin.ready() using events
      initialized = true;
    });
  }

  // load modules, invoke callback
  function load(modules, callback, args, context) {
    var module;
    settings.require(settings.pack, modules, function() {
      for (var count in modules) {
        module = modules[count];
      }
      if (adapter.isFunction(callback)) callback.apply(context || this, args);
      // try dequeue
      dequeue();
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
  skin = function() {
    var args = adapter.arraySlice.call(arguments, 0), element, name, options;
    // assign default settings
    if (!settings) settings = skin.defaults;
    // find out what are the arguments
    if (adapter.isElement(args[0])) { element = args[0]; args = args.slice(1); }
    if (adapter.isString(args[0]))  { name    = args[0]; args = args.slice(1); }
    if (adapter.isObject(args[0]))  { options = args[0]; }
    // check if only options object is available, configure skin itself
    // this way we can configure require, preload and pack before initialize or loading any other module
    if (options && !element && !name) adapter.extend(settings, options);
    // if skin hasn't been initialized yet, queue the request and initialize
    else if (!initialized) {
      enqueue(skin, args, this);
      // ensure initialize function runs only once
      if (initialized === undefined) initialize();
    } else {
      // TODO: get or create skin
    }
  };




  // Static Methods and Properties
  // =============================
  // version
  skin.version = '0.1.3';
  // default settings
  skin.defaults = {
    // name, used for plugins, unique id prefix etc.
    alias: 'skin',
    // automatically create plugins for jQuery, Zepto etc.
    plugin: true,
    // modules which should be preloaded, for fast invokation
    preload: [],
    // require options, base url, paths
    pack: {},
    // default method for asynchronously loading modules
    // using define() module definition, proposed by CommonJS
    // for Asynchronous Module Definition (AMD)
    // require.js or curl.js should be available, otherwise users should
    // implement or adapt their own loader and assign it to skin through settings
    // example: skin({ require: function(package, modules, callback) { implementation... }})
    require: context.require || context.curl
  };




  // assign cached skin back and return this object
  // example: var newSkin = skin.noConflict()
  skin.noConflict = function() { context.skin = oldSkin; return this; };

  // method used in extension modules to add templates, actions and recipes
  skin.set = function(data) { if (hub) hub.set(data); else enqueue(skin.set, [data]); };




  // Skin Behaviors Module
  // =====================
  // empty namespace to be decorated by behavior definitions
  skin.behaviors = {};




  // Component Factory
  // =================
  // create and return skeleton for skin components
  // which can manage their behaviors, at class level
  var factory = skin.factory = function() {
    // assign default settings
    if (!settings) settings = skin.defaults;
    var component  = function() {}
      , components = component.prototype;
    // component's behaviors
    component.behaviors = [];
    // method to add behaviors to the constructor
    component.is = function() {
      var args = arguments, behaviors = adapter.isArray(args[0])? args[0] : adapter.arraySlice.call(args, 0);
      adapter.each(behaviors, function(behavior) {
        if (skin.behaviors[behavior]) { skin.behaviors[behavior].add.call(components); }
        else settings.require(settings.pack, ['behaviors/' + behavior], function() {
          skin.behaviors[behavior].add.call(components);
        });
      });
    };
    // method to remove behaviors from the constructor
    component.isnt = function() {};
    // check if constructor has a behavior
    component.check = function(behavior) { return adapter.inArray(component.behaviors, behavior) != -1; };
    // return the product
    return component;
  };




  // attach modules to skin, make them available everywhere
  skin.adapter = adapter;

  // export, attach skin to context, this or window
  context.skin = skin;
  return skin;
});