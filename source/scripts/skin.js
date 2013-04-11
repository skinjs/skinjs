// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

(function() {




  // Private Methods and Properties
  // ==============================
  // existing skin is kept as oldSkin, to be assigned back in noConflict()
  var context = this, oldSkin = context.skin, adapter, events, behaviors, skin;




  // Skin JavaScript Adapter Module
  // ==============================
  // provides helpers and shortcuts to be used everywhere
  // basic helpers are added here to be used in this context
  // more helpers can be added to adapter later, via AMD or decorators
  // we can also delegate some of these methods to available libraries
  // such as jQuery, Underscore, Zepto etc. via AMD
  adapter = {};

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




  // Skin Behaviors Module
  // =====================
  // empty namespace to hold behavior modules
  // most common behaviors are defined here,
  // others can be loaded and decorate behaviors later
  behaviors = {};




  // Events Module & Eventable Behavior
  // ==================================
  // provides event management system based on
  // publish, subscribe and unsubscribe model
  // events are scoped to emitters and paths
  // the module servers as a shared event bus
  // also provides hooks to be added to or removed
  // from component prototypes like other behaviors
  events = (function() {

    // publisher indices, shared handlers hub, cache for fast triggering, reference to adapter helpers
    var name = 'eventable', indices = [], hub = {}, cache = {};

    // figure out emitter, path and callback
    // for on(), once() and off() methods
    function sanitize(args) {
      var emitter = this, path, callback = args[args.length - 1];
      // last argument can be the callback
      if (adapter.isFunction(callback)) args = args.slice(0, -1);
      else callback = null;
      // first argument can be the emitter
      if (!adapter.isString(args[0])) { emitter = args[0]; args = args.slice(1); }
      // the rest is path
      path = adapter.indexFor(indices, emitter) + (adapter.isString(args[0]) ? '.' + args[0] : '');
      return {
        emitter: emitter,
        path: path,
        callback: callback
      };
    }

    function on() {
      var context = this
        , args    = sanitize.call(context, adapter.arraySlice.call(arguments, 0));
      if (!adapter.objectHas.call(hub, args.path)) hub[args.path] = [];
      // make sure the same handler is not added again
      adapter.each(hub[args.path], function(handler) {
        if (handler.callback === args.callback && handler.context === context) return this;
      });
      hub[args.path].push({ callback: args.callback, context: context });
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      return context;
    }

    function once() {
      var context  = this
        , args     = sanitize.call(context, adapter.arraySlice.call(arguments, 0))
        , callback = function() {
          context.off(args.path, callback);
          args.callback.apply(context, arguments);
        };
      on(args.path, callback);
      return context;
    }

    function off() {
      var context = this
        , args    = sanitize.call(context, adapter.arraySlice.call(arguments, 0))
        , keys    = adapter.keys(hub)
        , index   = adapter.indexFor(indices, args.emitter);
      // find all handlers with keys starting with path
      adapter.filter(keys, function(key) { return key.indexOf(args.path) === 0; });
      // find all callbacks to be removed
      adapter.each(keys, function(key) {
        if (args.callback) {
          adapter.reject(hub[key], function(handler) {
            return handler.callback === args.callback;
          });
          if (!hub[key].length) delete hub[key];
        } else {
          delete hub[key];
        }
      });
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      // check if any other handlers available for the emitter
      // if not, remove the emitter from indices
      keys = adapter.keys(hub);
      adapter.each(keys, function(key) {
        if (key.indexOf(index) === 0) return this;
      });
      adapter.remove(indices, args.emitter);
      return this;
    }

    function trigger(emitter, path, parameters) {
      var handlers = [], keys;
      if (adapter.isString(emitter)) { parameters = path; path = emitter; emitter = this; }
      // if its a cached trigger call, no need to find handlers
      if (emitter === cache.emitter && path === cache.path) handlers = cache.handlers;
      else {
        cache.emitter = emitter;
        cache.path = path;
        path = adapter.indexFor(indices, emitter) + (adapter.isString(path) ? '.' + path : '');
        keys = adapter.keys(hub);
        adapter.filter(keys, function(key) {
          return key.indexOf(path) === 0;
        });
        // find all handlers
        adapter.each(keys, function(key) {
          handlers = handlers.concat(hub[key]);
        });
        cache.handlers = handlers;
      }
      adapter.each(handlers, function(handler) { handler.callback.call(handler.context, parameters); });
      return this;
    }

    // to use the module as a behavior
    behaviors.eventable = {

      add: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (constructor.check(name)) return this;
        prototype.on      = on;
        prototype.once    = once;
        prototype.off     = off;
        prototype.trigger = trigger;
        if (behaviors) behaviors.push(name);
        return this;
      },

      remove: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (!constructor.check(name)) return this;
        off();
        delete prototype.on;
        delete prototype.once;
        delete prototype.off;
        delete prototype.trigger;
        adapter.remove(behaviors, name);
        return this;
      }

    };

    // public API
    return { on: on, once: once, off: off, trigger: trigger };

  })();




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
  skin = function() {
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
          if (skin.behaviors[behavior]) {
            skin.behaviors[behavior].add.call(components);
            //skin.trigger('change');
            if (component.behaviors.length == behaviors.length) {
              //skin.trigger('ready');
            }
          }
          else skin.require(skin.pack, ['behaviors/' + behavior], function() {
            skin.behaviors[behavior].add.call(components);
            //skin.trigger('change');
            if (component.behaviors.length == behaviors.length) {
              //skin.trigger('ready');
            }
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

  // make skin eventable
  skin({ on:      events.on,
         once:    events.once,
         off:     events.off,
         trigger: events.trigger });




  // attach modules to skin, make them available everywhere
  skin.events    = events;
  skin.adapter   = adapter;
  skin.behaviors = behaviors;




  // export, attach skin to context
  context.skin = skin;
  if (adapter.isFunction(define) && define.amd) define('skin', skin);
}).call(this);