// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

(function() {




  // Private Methods & Properties
  // ============================
  // existing skin is kept as oldie, to be assigned back in noConflict()
  var context = this, oldie = context.skin, adapter, events, behaviors, responders, skin;




  // JavaScript Adapter Module
  // =========================
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
  adapter.isNumber    = function(symbol) { return typeof(symbol) === 'number'; };
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




  // Behaviors Module
  // ================
  // empty namespace to hold behavior modules
  // most common behaviors are defined here,
  // others can be loaded and decorate behaviors later
  behaviors = {};

  // API for adding or removing behaviors for components
  function behave(prototype, name, flag) {
  }




  // Responders Module
  // =================
  // hooks for adding and removing external event listeners
  // such as window, mouse, document or keyboard events
  // or even other libraries, like Backbone
  responders = {};

  // API for adding or removing responders for external events
  function respond(emitter, name, context, flag) {
    // trim namespaced event name
    name = name.split('.')[0];
    if (emitter === window) skin.require(skin.pack, ['responders/window'], function() {
      if (flag) responders.window.add(context, name);
      else responders.window.remove(context, name);
    });
  }




  // Events Module & Eventable Behavior
  // ==================================
  // provides event management system based on
  // publish, subscribe and unsubscribe model
  // events are scoped to emitters and namespaced paths
  // the module servers as a shared event bus
  // also provides hooks to be added to or removed
  // from component prototypes like other behaviors
  events = (function() {

    // publisher indices, shared handlers hub, cache for fast triggering, reference to adapter helpers
    var name = 'eventable', indices = [], hub = {}, cache = {};

    // figure out emitter, path and callback
    // for on(), once() and off() methods
    // remember, indexFor() will push emitter in indices, if it doesn't exist
    function sanitize(args) {
      var emitter = this, index = 0, name = '', path, callback = args[args.length - 1];
      // last argument can be the callback
      if (adapter.isFunction(callback)) args = args.slice(0, -1);
      else callback = null;
      // first argument can be the emitter
      if (!adapter.isString(args[0])) { emitter = args[0]; args = args.slice(1); }
      if (adapter.isString(args[0])) { name = args[0]; }
      index = adapter.indexFor(indices, emitter) + '';
      path = index + (name.length ? '.' + name : '');
      return {
        emitter: emitter,
        index: index,
        name: name,
        path: path,
        callback: callback
      };
    }

    function on() {
      var context = this
        , args    = sanitize.call(context, adapter.arraySlice.call(arguments, 0))
        , duplicate
        , name;
      // make sure the same handler is not added again
      adapter.each(hub[args.path], function(handler) {
        // if duplicate found, return false to break the each iterator
        if (handler.callback === args.callback && handler.context === context) { duplicate = true; return false; }
      });
      if (duplicate) return context;
      if (!adapter.objectHas.call(hub, args.path)) hub[args.path] = [];
      hub[args.path].push({ callback: args.callback, context: context });
      // create responders for external events
      respond(args.emitter, args.name, context, true);
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      return context;
    }

    function once() {
      var context = this
        , args    = sanitize.call(context, adapter.arraySlice.call(arguments, 0))
        , duplicate;
      // make sure the same handler is not added again
      adapter.each(hub[args.path], function(handler) {
        // if duplicate found, return false to break the each iterator
        if (handler.callback === args.callback && handler.context === context) { duplicate = true; return false; }
      });
      if (duplicate) return context;
      var callback = function() {
        context.off(args.emitter, args.name, callback);
        args.callback.apply(context, arguments);
      };
      context.on(args.emitter, args.name, callback);
      return context;
    }

    function off() {
      var context = this
        , args    = sanitize.call(context, adapter.arraySlice.call(arguments, 0))
        , keys    = adapter.keys(hub)
        , exist
        , name;
      // remember, at this point an index is created for the emitter
      // even if it doesn't have any listeners, but at the end we remove empty indices
      // find all handlers keys starting with path, namespaced keys
      adapter.filter(keys, function(key) { return key === args.path || key.indexOf(args.path + '.') === 0; });
      // find all callbacks to be removed
      adapter.each(keys, function(key) {
        adapter.reject(hub[key], function(handler) { return args.callback ? handler.callback === args.callback : handler.context === context; });
        if (!hub[key].length) delete hub[key];
      });
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      // check if any other handlers available for the emitter
      // if not, remove the emitter from indices
      keys = adapter.keys(hub);
      adapter.each(keys, function(key) { if (key.indexOf(args.index) === 0) { exist = true; return false; }});
      if (!exist) adapter.remove(indices, args.emitter);
      // remove responders for external events
      respond(args.emitter, args.name, context, false);
      return context;
    }

    function trigger(emitter, name, parameters) {
      var context = this, handlers, path, keys;
      if (adapter.isString(emitter)) { parameters = name; name = emitter; emitter = context; }
      // if its a cached trigger call, no need to find handlers
      if (cache.emitter === emitter && cache.name === name) handlers = cache.handlers;
      else {
        if (adapter.inArray(indices, emitter) === -1) return context;
        handlers = [];
        path = adapter.indexFor(indices, emitter) + (adapter.isString(name) ? '.' + name : '');
        // add handlers for path
        if (adapter.objectHas.call(hub, path)) handlers = handlers.concat(hub[path]);
        // find handlers in namespaced paths
        path = path + '.';
        keys = adapter.keys(hub);
        adapter.filter(keys, function(key) {
          return key.indexOf(path) === 0;
        });
        adapter.each(keys, function(key) {
          handlers = handlers.concat(hub[key]);
        });
        cache.emitter = emitter;
        cache.name = name;
        cache.handlers = handlers;
      }
      adapter.each(handlers, function(handler) { handler.callback.call(handler.context, parameters); });
      return context;
    }

    // to use the module as a behavior
    behaviors.eventable = {

      add: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (constructor.check(name)) return prototype;
        adapter.extend(prototype, { on: on, once: once, off: off, trigger: trigger });
        behaviors.push(name);
        return prototype;
      },

      remove: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (!constructor.check(name)) return prototype;
        prototype.off();
        adapter.extend(prototype, { on: undefined, once: undefined, off: undefined, trigger: undefined });
        adapter.remove(behaviors, name);
        return prototype;
      }

    };

    // public API
    return { on: on, once: once, off: off, trigger: trigger };

  })();




  // Skin Factory & Namespace
  // ========================
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
            skin.trigger(component, 'behavior', { type: 'add', name: behavior });
          } else {
            skin.require(skin.pack, ['behaviors/' + behavior], function() {
              skin.behaviors[behavior].add.call(components);
              skin.trigger(component, 'behavior', { type: 'add', name: behavior });
            });
          }
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




  // Static Methods & Properties
  // ===========================
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
  skin.noConflict = function() { context.skin = oldie; return this; };

  // attach modules to skin, make them available everywhere
  // also make skin eventable
  skin({ events:     events,
         adapter:    adapter,
         behaviors:  behaviors,
         responders: responders,
         on:         events.on,
         once:       events.once,
         off:        events.off,
         trigger:    events.trigger });




  // export, attach skin to context
  context.skin = skin;
  if (adapter.isFunction(define) && define.amd) define('skin', function() { return skin; });
}).call(this);