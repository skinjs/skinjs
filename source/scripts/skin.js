// @@package @@version
// @@copyrightNotes
// @@licenseNotes
// @@homepage

(function() {




  // Private Methods & Properties
  // ============================
  // existing Skin is kept as oldSkin, to be assigned back in noConflict()
  var context = this, oldSkin = context.Skin, Tools, Events, Behaviors, Responders, Skin;




  // JavaScript Tools Module
  // =======================
  // provides helpers and shortcuts to be used everywhere
  // basic helpers are added here to be used in this context
  // more helpers can be added to tools later, via AMD or decorators
  // we can also delegate some of these methods to available libraries
  // such as jQuery, Underscore, Zepto etc. via AMD
  Tools = {};

  Tools.arrays      = Array.prototype;
  Tools.objects     = Object.prototype;
  Tools.arraySlice  = Tools.arrays.slice;
  Tools.objectHas   = Tools.objects.hasOwnProperty;

  Tools.isArray     = function(symbol) { return !!symbol && (symbol.isArray || symbol instanceof Array); };
  Tools.isObject    = function(symbol) { return !!symbol && typeof(symbol) === 'object' && !Tools.isArray(symbol); };
  Tools.isElement   = function(symbol) { return !!symbol && (symbol.nodeType == 1 || symbol.nodeType == 9); };
  Tools.isString    = function(symbol) { return typeof(symbol) === 'string'; };
  Tools.isFunction  = function(symbol) { return typeof(symbol) === 'function'; };
  Tools.isBoolean   = function(symbol) { return typeof(symbol) === 'boolean'; };
  Tools.isNumber    = function(symbol) { return typeof(symbol) === 'number'; };
  Tools.isUndefined = function(symbol) { return symbol === undefined; };

  // iterator, breaks if any iteration returns false
  Tools.each = function(symbol, iterator, context) {
    if (Tools.isArray(symbol)) for (var index = 0; index < symbol.length; index++) {
      if (iterator.call(context, symbol[index], index, symbol) === false) return;
    } else if (Tools.isObject(symbol)) for (var key in symbol) {
      if (Tools.objectHas.call(symbol, key)) {
        if (iterator.call(context, symbol[key], key, symbol) === false) return;
      }
    }
  };

  // basic filter function
  // this can be overridden by a sophisticated version later, via AMD
  Tools.filter = function(array, iterator, context) {
    for (var index = array.length - 1; index >= 0; index--) {
      if (!iterator.call(context || this, array[index], index, array)) array.splice(index, 1);
    }
  };

  // basic reject function
  // this can be overridden by a sophisticated version later, via AMD
  Tools.reject = function(array, iterator, context) {
    for (var index = array.length - 1; index >= 0; index--) {
      if (iterator.call(context || this, array[index], index, array)) array.splice(index, 1);
    }
  };

  // check if array, string or object is empty
  Tools.isEmpty = function(target) {
    if (target === null) return true;
    if (Tools.isArray(target) || Tools.isString(target)) return target.length === 0;
    for (var key in target) if (Tools.objectHas(target, key)) return false;
    return true;
  };

  // recursive extend, also removes a property from target if it is explicitly set to undefined in source
  Tools.extend = function(target) {
    Tools.each(Tools.arraySlice.call(arguments, 1), function(source) {
      for (var key in source) {
        if (Tools.isUndefined(source[key]) && target[key]) delete target[key];
        else if (Tools.isObject(source[key]) && Tools.isObject(target[key])) Tools.extend(target[key], source[key]);
        else target[key] = source[key];
      }
    });
    return target;
  };

  // make it easier to support IE8 in future
  Tools.inArray = function(array, item, index) { return Tools.arrays.indexOf.call(array, item, index); };

  // basic remove function, removes an item from array
  // this can be overridden by a sophisticated version later, via AMD
  Tools.remove = function(array, item) {
    array.splice(Tools.inArray(array, item), 1);
  };

  // get array of keys in an object
  Tools.keys = Object.keys || function(object) {
    var keys = [];
    for (var key in object) if (Tools.objectHas.call(object, key)) keys.push(key);
    return keys;
  };

  // helper for indexing elements
  // adds item, if not exists, at the first empty index
  // returns the index of item
  Tools.indexFor = function(array, item) {
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
  Behaviors = {};

  // API for adding or removing behaviors for components
  //function behave(prototype, name, flag) {
  //}




  // Responders Module
  // =================
  // hooks for adding and removing external event listeners
  // such as window, mouse, document or keyboard events
  // TODO: other libraries, like Backbone
  Responders = {};

  // register default responders
  Tools.each({
    Window:   function(emitter, name, context) { return emitter === window && /^(resize|scroll|load|unload|hashchange)$/.test(name); },
    Document: function(emitter, name, context) { return emitter === document && /^(contextmenu|ready)$/.test(name); },
    Keyboard: function(emitter, name, context) { return Tools.isElement(emitter) && /^key(press|up|down)/.test(name); },
    Pointer:  function(emitter, name, context) { return Tools.isElement(emitter) && /^pointer(up|down|move|cancel|over|out|enter|leave)$/.test(name); },
    Gesture:  function(emitter, name, context) { return Tools.isElement(emitter) && /^((double|long|control){0,1}press|drop|drag(start|end|enter|leave|over|out){0,1}|(swipe|rotate|pinch)(start|end){0,1})$/.test(name); }
  }, function(check, name) {
    Responders[name] = { path: 'responders/' + name.toLowerCase(), check: check };
  });

  // API for adding or removing responders for handling external events
  function respond(emitter, name, context, flag) {
    if (!name.length && !flag) {
      // special case, remove form all available responders
      Tools.each(Responders, function(Responder) { if (Responder.remove) Responder.remove(emitter, name, context); });
      return;
    }
    // trim namespaced event name
    name = name.split('.')[0];
    Tools.each(Responders, function(Responder, responderName) {
      if (Responder.check(emitter, name, context)) {
        // matching responder
        Skin.require(Skin.pack, [Responder.path], function() {
          if (flag) {
            Responder.add(emitter, name, context);
            context.trigger('respond.' + responderName.toLowerCase());
          } else Responder.remove(emitter, name, context);
        });
      }
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
  Events = (function() {

    // publisher indices, shared handlers hub, cache for fast triggering, reference to Tools helpers
    var name = 'Eventable', indices = [], hub = {}, cache = {};

    // figure out emitter, path and callback
    // for on(), once() and off() methods
    // remember, indexFor() will push emitter in indices, if it doesn't exist
    function sanitize(args) {
      var emitter = this, index = 0, name = '', path, callback = args[args.length - 1];
      // last argument can be the callback
      if (Tools.isFunction(callback)) args = args.slice(0, -1);
      else callback = null;
      // first argument can be the emitter
      if (!Tools.isString(args[0])) { emitter = args[0]; args = args.slice(1); }
      if (Tools.isString(args[0])) { name = args[0]; }
      index = Tools.indexFor(indices, emitter) + '';
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
        , args    = sanitize.call(context, Tools.arraySlice.call(arguments, 0))
        , duplicate
        , name;
      // make sure the same handler is not added again
      Tools.each(hub[args.path], function(handler) {
        // if duplicate found, return false to break the each iterator
        if (handler.callback === args.callback && handler.context === context) { duplicate = true; return false; }
      });
      if (duplicate) return context;
      if (!Tools.objectHas.call(hub, args.path)) hub[args.path] = [];
      hub[args.path].push({ callback: args.callback, context: context });
      // create responders for external events
      respond(args.emitter, args.name, context, true);
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      return context;
    }

    function once() {
      var context = this
        , args    = sanitize.call(context, Tools.arraySlice.call(arguments, 0))
        , duplicate;
      // make sure the same handler is not added again
      Tools.each(hub[args.path], function(handler) {
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
        , args    = sanitize.call(context, Tools.arraySlice.call(arguments, 0))
        , keys    = Tools.keys(hub)
        , exist
        , name;
      // remember, at this point an index is created for the emitter
      // even if it doesn't have any listeners, but at the end we remove empty indices
      // find all handlers keys starting with path, namespaced keys
      Tools.filter(keys, function(key) { return key === args.path || key.indexOf(args.path + '.') === 0; });
      // find all callbacks to be removed
      Tools.each(keys, function(key) {
        Tools.reject(hub[key], function(handler) { return args.callback ? handler.callback === args.callback : handler.context === context; });
        if (!hub[key].length) delete hub[key];
      });
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      // check if any other handlers available for the emitter
      // if not, remove the emitter from indices
      keys = Tools.keys(hub);
      Tools.each(keys, function(key) { if (key.indexOf(args.index) === 0) { exist = true; return false; }});
      if (!exist) delete indices[parseInt(args.index, 10)];
      // remove responders for external events
      respond(args.emitter, args.name, context, false);
      return context;
    }

    function trigger(emitter, name, parameters) {
      var context = this, handlers, path, keys;
      if (Tools.isString(emitter)) { parameters = name; name = emitter; emitter = context; }
      // if its a cached trigger call, no need to find handlers
      if (cache.emitter === emitter && cache.name === name) handlers = cache.handlers;
      else {
        if (Tools.inArray(indices, emitter) === -1) return context;
        handlers = [];
        path = Tools.indexFor(indices, emitter) + (Tools.isString(name) ? '.' + name : '');
        // add handlers for path
        if (Tools.objectHas.call(hub, path)) handlers = handlers.concat(hub[path]);
        // find handlers in namespaced paths
        path = path + '.';
        keys = Tools.keys(hub);
        Tools.filter(keys, function(key) {
          return key.indexOf(path) === 0;
        });
        Tools.each(keys, function(key) {
          handlers = handlers.concat(hub[key]);
        });
        cache.emitter = emitter;
        cache.name = name;
        cache.handlers = handlers;
      }
      Tools.each(handlers, function(handler) { handler.callback.call(handler.context, parameters); });
      return context;
    }

    // to use the module as a behavior
    Behaviors[name] = {

      add: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (constructor.check(name)) return prototype;
        Tools.extend(prototype, { on: on, once: once, off: off, trigger: trigger });
        behaviors.push(name);
        return prototype;
      },

      remove: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (!constructor.check(name)) return prototype;
        prototype.off();
        Tools.extend(prototype, { on: undefined, once: undefined, off: undefined, trigger: undefined });
        Tools.remove(behaviors, name);
        return prototype;
      }

    };

    // public API
    return { on: on, once: once, off: off, trigger: trigger };

  })();




  // Skin Factory & Namespace
  // ========================
  // can configure Skin's settings
  // or create and return skeleton for Skin components
  // which can manage their behaviors, at class level
  // example: Skin({ options... })
  //          Skin(name)
  //          Skin(element)
  //          Skin(element, name)
  //          Skin(element, name, { options... })
  //          Skin(element, name).action()
  Skin = function() {
    var args = Tools.arraySlice.call(arguments, 0), element, name, settings;
    // find out what are the arguments
    if (Tools.isElement(args[0])) { element  = args[0]; args = args.slice(1); }
    if (Tools.isString(args[0]))  { name     = args[0]; args = args.slice(1); }
    if (Tools.isObject(args[0]))  { settings = args[0]; }
    // check if only settings object is available, configure Skin itself
    // this way we can configure require, preload and pack before initialize or loading any other module
    if (settings && !element && !name) {
      Tools.extend(Skin, settings);
      return Skin;
    } else {
      var component  = function() {}
        , components = component.prototype;
      // component's behaviors
      component.behaviors = [];
      // method to add behaviors to the constructor
      component.is = function() {
        var args = arguments, behaviors = Tools.isArray(args[0])? args[0] : Tools.arraySlice.call(args, 0);
        Tools.each(behaviors, function(behavior) {
          if (Skin.Behaviors[behavior]) {
            Skin.Behaviors[behavior].add.call(components);
            Skin.trigger(component, 'behavior', { type: 'add', name: behavior });
          } else {
            Skin.require(Skin.pack, ['behaviors/' + behavior], function() {
              Skin.Behaviors[behavior].add.call(components);
              Skin.trigger(component, 'behavior', { type: 'add', name: behavior });
            });
          }
        });
      };
      // method to remove behaviors from the constructor
      component.isnt = function() {};
      // check if constructor has a behavior
      component.check = function(behavior) { return Tools.inArray(component.behaviors, behavior) != -1; };
      // return the product
      return component;
    }
  };




  // Static Methods & Properties
  // ===========================
  // version
  Skin.version = '@@version';

  // name, used for plugins, unique id prefix etc.
  Skin.alias = 'skin';

  // automatically create plugins for jQuery, Zepto etc.
  Skin.plugin = true;

  // modules which should be preloaded, for fast invokation
  Skin.preload = [];

  // require options, base url, paths
  Skin.pack = {};

  // delegate method for asynchronously loading modules
  // using define() module definition, proposed by CommonJS
  // for Asynchronous Module Definition (AMD)
  // require.js or curl.js should be available
  Skin.require = context.require || context.curl;

  // assign cached Skin back and return this object
  // example: var NewSkin = Skin.noConflict()
  Skin.noConflict = function() { context.Skin = oldSkin; return this; };




  // attach modules to Skin, make them available everywhere
  // also make Skin eventable
  Skin({ Events:     Events,
         Tools:      Tools,
         Behaviors:  Behaviors,
         Responders: Responders,
         on:         Events.on,
         once:       Events.once,
         off:        Events.off,
         trigger:    Events.trigger });




  // export, attach Skin to context
  context.Skin = Skin;
  if (Tools.isFunction(define) && define.amd) define('skin', function() { return Skin; });
}).call(this);