// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

(function() {




  // Private Methods and Properties
  // ==============================
  // existing skin is kept as oldSkin, to be assigned back in noConflict()
  var context = this, oldSkin = context.skin;




  // Skin JavaScript Adapter Module
  // ==============================
  // provides helpers and shortcuts to be used everywhere
  // basic helpers are added here to be used in this context
  // more helpers can be added to adapter later, via AMD or decorators
  // we can also delegate some of these methods to available libraries
  // such as jQuery, Underscore, Zepto etc. via AMD
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

  // basic filter function
  // this can be overridden by a sophisticated version later, via AMD
  adapter.filter = function(array, iterator, context) {
    for (var index = array.length - 1; index >= 0; index--) {
      if (!iterator.call(context || this, array[index], index, array)) array.splice(index, 1);
    }
  };

  // basic reject function
  // this can be overridden by a sophisticated version later, via AMD
  adapter.reject = function(array, iterator, context) {
    for (var index = array.length - 1; index >= 0; index--) {
      if (iterator.call(context || this, array[index], index, array)) array.splice(index, 1);
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

  // basic remove function, removes an item from array
  // this can be overridden by a sophisticated version later, via AMD
  adapter.remove = function(array, item) {
    array.splice(adapter.inArray(array, item), 1);
  };

  // get array of keys in an object
  adapter.keys = Object.keys || function(object) {
    var keys = [];
    for (var key in object) if (adapter.objectHas.call(object, key)) keys.push(key);
    return keys;
  };

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




  // Skin Factory and Namespace
  // ==========================
  // can configure skin's settings
  // or create and return skeleton for skin components
  // which can manage their behaviors, at class level
  // example: skin({ options... })
  //          skin(name)
  //          skin(element)
  //          skin(element, name)
  //          skin(element, name, { options... })
  //          skin(element, name).action()
  var skin = function() {
    var args = adapter.arraySlice.call(arguments, 0), element, name, settings;
    // find out what are the arguments
    if (adapter.isElement(args[0])) { element  = args[0]; args = args.slice(1); }
    if (adapter.isString(args[0]))  { name     = args[0]; args = args.slice(1); }
    if (adapter.isObject(args[0]))  { settings = args[0]; }
    // check if only settings object is available, configure skin itself
    // this way we can configure require, preload and pack before initialize or loading any other module
    if (settings && !element && !name) {
      adapter.extend(skin, settings);
      return skin;
    } else {
      var component  = function() {}
        , components = component.prototype;
      // component's behaviors
      component.behaviors = [];
      // method to add behaviors to the constructor
      component.is = function() {
        var args = arguments, behaviors = adapter.isArray(args[0])? args[0] : adapter.arraySlice.call(args, 0);
        adapter.each(behaviors, function(behavior) {
          if (skin.behaviors[behavior]) { skin.behaviors[behavior].add.call(components); }
          else skin.require(skin.pack, ['behaviors/' + behavior], function() {
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
    }
  };




  // Static Methods and Properties
  // =============================
  // version
  skin.version = '0.1.3';

  // name, used for plugins, unique id prefix etc.
  skin.alias = 'skin';

  // automatically create plugins for jQuery, Zepto etc.
  skin.plugin = true;

  // modules which should be preloaded, for fast invokation
  skin.preload = [];

  // require options, base url, paths
  skin.pack = {};

  // delegate method for asynchronously loading modules
  // using define() module definition, proposed by CommonJS
  // for Asynchronous Module Definition (AMD)
  // require.js or curl.js should be available
  skin.require = context.require || context.curl;

  // assign cached skin back and return this object
  // example: var newSkin = skin.noConflict()
  skin.noConflict = function() { context.skin = oldSkin; return this; };




  // Skin Behaviors Module
  // =====================
  // empty namespace to be decorated by behavior definitions
  skin.behaviors = {};




  // attach adapter to skin, make it available everywhere
  skin.adapter = adapter;

  // export, attach skin to context
  context.skin = skin;
  if (adapter.isFunction(define) && define.amd) define('skin', function() { return skin; });
}).call(this);