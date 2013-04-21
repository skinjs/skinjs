// @@package @@version
// @@copyrightNotes
// @@licenseNotes
// @@homepage

(function() {




  // Private Methods & Properties
  // ============================
  // existing Skin is kept as oldSkin, to be assigned back in noConflict()
  var context = this, oldSkin = context.Skin, Tools, Index, Events, Behaviors, Responders, Skin;




  // JavaScript Tools Module
  // =======================
  // provides helpers and shortcuts to be used everywhere
  // basic helpers are added here to be used in this context
  // more helpers can be added to tools later, via AMD or decorators
  // we can also delegate some of these methods to available libraries
  // such as jQuery, Underscore, Zepto etc. via AMD
  Tools = {};

  var Arrays      = Tools.Arrays      = Array.prototype
    , Objects     = Tools.Objects     = Object.prototype
    , arraySlice  = Tools.arraySlice  = Arrays.slice
    , objectHas   = Tools.objectHas   = Objects.hasOwnProperty

    , isArray     = Tools.isArray     = function(symbol) { return !!symbol && (symbol.isArray || symbol instanceof Array); }
    , isObject    = Tools.isObject    = function(symbol) { return !!symbol && typeof(symbol) === 'object' && !isArray(symbol); }
    , isElement   = Tools.isElement   = function(symbol) { return !!symbol && (symbol.nodeType == 1 || symbol.nodeType == 9); }
    , isString    = Tools.isString    = function(symbol) { return typeof(symbol) === 'string'; }
    , isFunction  = Tools.isFunction  = function(symbol) { return typeof(symbol) === 'function'; }
    , isBoolean   = Tools.isBoolean   = function(symbol) { return typeof(symbol) === 'boolean'; }
    , isNumber    = Tools.isNumber    = function(symbol) { return typeof(symbol) === 'number'; }
    , isUndefined = Tools.isUndefined = function(symbol) { return symbol === undefined; }

    // iterator, breaks if any iteration returns false
    , each = Tools.each = function(symbol, iterator, context) {
        if (isArray(symbol)) for (var index = 0; index < symbol.length; index++) {
          if (iterator.call(context, symbol[index], index, symbol) === false) return;
        } else if (isObject(symbol)) for (var key in symbol) {
          if (objectHas.call(symbol, key)) {
            if (iterator.call(context, symbol[key], key, symbol) === false) return;
          }
        }
      }

    // basic filter function
    // this can be overridden by a sophisticated version later, via AMD
    , filter = Tools.filter = function(array, iterator, context) {
        for (var index = array.length - 1; index >= 0; index--) {
          if (!iterator.call(context || this, array[index], index, array)) array.splice(index, 1);
        }
      }

    // basic reject function
    // this can be overridden by a sophisticated version later, via AMD
    , reject = Tools.reject = function(array, iterator, context) {
        for (var index = array.length - 1; index >= 0; index--) {
          if (iterator.call(context || this, array[index], index, array)) array.splice(index, 1);
        }
      }

    // check if array, string or object is empty
    , isEmpty = Tools.isEmpty = function(target) {
        if (isArray(target) || isString(target)) return target.length === 0;
        if (isObject(target)) for (var key in target) if (objectHas.call(target, key)) return false;
        return !target;
      }

    // recursive extend, also removes a property from target if it is explicitly set to undefined in source
    , extend = Tools.extend = function(target) {
        each(arraySlice.call(arguments, 1), function(source) {
          for (var key in source) {
            if (isUndefined(source[key]) && target[key]) delete target[key];
            else if (isObject(source[key]) && isObject(target[key])) extend(target[key], source[key]);
            else target[key] = source[key];
          }
        });
        return target;
      }

    // make it easier to support IE8 in future
    , inArray = Tools.inArray = function(array, item, index) { return Arrays.indexOf.call(array, item, index); }

    // basic remove function, removes an item from array
    // this can be overridden by a sophisticated version later, via AMD
    , remove = Tools.remove = function(array, item) {
        array.splice(inArray(array, item), 1);
      }

    // get array of keys in an object
    , keys = Tools.keys = Object.keys || function(object) {
        var keys = [];
        for (var key in object) if (objectHas.call(object, key)) keys.push(key);
        return keys;
      }

    // helper for indexing elements
    // adds item, if not exists, at the first empty index
    // returns the index of item
    , indexFor = Tools.indexFor = function(array, item, insert) {
        var empty = array.length;
        for (var index = 0; index < array.length; index++) {
          if (array[index] === item) return index;
          if (array[index] === undefined) empty = index;
        }
        if (insert || isUndefined(insert)) {
          array[empty] = item;
          return empty;
        } else return -1;
      };




  // Index Module
  // ============
  // simple module for indexing uinique ids for everything
  Index = (function() {
    var namespaces = {}, indices = [], target, empty, index;

    // get index, return -1 if doesn't exist
    function get(item, namespace) {
      target = namespace ? namespaces[namespace] : indices;
      if (target) for (index = 0; index < target.length; index++) if (target[index] === item) return index;
      return -1;
    }

    // set and get index, if exists returns the index,
    // if not, inserts the item and then returns the index
    function set(item, namespace) {
      target = namespace ? namespaces[namespace] || (namespaces[namespace] = []) : indices;
      empty = target.length;
      for (index = 0; index < target.length; index++) {
        if (target[index] === item) return index;
        if (isUndefined(target[index])) empty = index;
      }
      target[empty] = item;
      return empty;
    }

    // remove index
    function remove(item, namespace) {
      target = namespace ? namespaces[namespace] : indices;
      if (target) {
        var flag, result;
        for (index = 0; index < target.length; index++) {
          if (target[index] === item) {
            delete target[index];
            result = index;
            if (flag) break;
          }
          if (!isUndefined(target[index])) {
            flag = true;
            if (!isUndefined(result)) break;
          }
        }
        if (isUndefined(flag)) {
          if (namespace) delete namespaces[namespace];
          else indices = [];
        }
        return result;
      }
      return -1;
    }

    // remove everything
    function reset() { namespaces = {}; indices = []; }

    // public API
    return { get: get, set: set, remove: remove, reset: reset };
  })();




  // Behaviors Module
  // ================
  // empty namespace to hold behavior modules
  // most common behaviors are defined here,
  // others can be loaded and decorate behaviors later
  Behaviors = {};

  // API for adding or removing behaviors for components
  function behave(prototype, name, flag) {
  }




  // Responders Module
  // =================
  // hooks for adding and removing external event listeners
  // such as window, mouse, document or keyboard events
  Responders = {};

  // register default responders
  each({
    Window:   function(emitter, name, context) { return emitter === window && /^(resize|scroll|load|unload|hashchange)$/.test(name); },
    Document: function(emitter, name, context) { return emitter === document && /^(contextmenu|ready)$/.test(name); },
    Keyboard: function(emitter, name, context) { return isElement(emitter) && /^key(press|up|down)/.test(name); },
    Pointer:  function(emitter, name, context) { return isElement(emitter) && /^pointer(up|down|move|cancel|over|out|enter|leave)$/.test(name); },
    Gesture:  function(emitter, name, context) { return isElement(emitter) && /^((double|long|control){0,1}press|drop|drag(start|end|enter|leave|over|out){0,1}|(swipe|rotate|pinch)(start|end){0,1})$/.test(name); }
  }, function(check, name) {
    Responders[name] = { path: 'responders/' + name.toLowerCase(), check: check };
  });

  // API for adding or removing responders for handling external events
  function respond(emitter, name, context, flag) {
    if (!name.length && !flag) {
      // special case, remove form all available responders
      each(Responders, function(Responder) { if (Responder.remove) Responder.remove(emitter, name, context); });
      return;
    }
    // trim namespaced event name
    name = name.split('.')[0];
    each(Responders, function(Responder, responderName) {
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

    // publisher indices, shared handlers hub, cache for fast triggering
    var name = 'Eventable', indices = [], hub = {}, cache = {};

    // figure out emitter, path and callback
    // for on(), once() and off() methods
    // remember, indexFor() will push emitter in indices, if it doesn't exist
    function sanitize(args) {
      var emitter = this, index = 0, name = '', path, callback = args[args.length - 1];
      // last argument can be the callback
      if (isFunction(callback)) args = args.slice(0, -1);
      else callback = null;
      // first argument can be the emitter
      if (!isString(args[0])) { emitter = args[0]; args = args.slice(1); }
      if (isString(args[0])) { name = args[0]; }
      index = indexFor(indices, emitter) + '';
      path = index + (name.length ? '.' + name : '');
      return {
        emitter: emitter,
        index: index,
        name: name,
        path: path,
        callback: callback
      };
    }

    // example: context.on(emitter, name, callback)
    //          context.on(selector, name, callback)
    //          context.on(name, callback)
    function on() {
      var context = this
        , args    = sanitize.call(context, arraySlice.call(arguments, 0))
        , duplicate
        , name;
      // make sure the same handler is not added again
      each(hub[args.path], function(handler) {
        // if duplicate found, return false to break the each iterator
        if (handler.callback === args.callback && handler.context === context) { duplicate = true; return false; }
      });
      if (duplicate) return context;
      if (!objectHas.call(hub, args.path)) hub[args.path] = [];
      hub[args.path].push({ callback: args.callback, context: context });
      // create responders for external events
      respond(args.emitter, args.name, context, true);
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      return context;
    }

    // example: context.once(emitter, name, callback)
    //          context.once(selector, name, callback)
    //          context.once(name, callback)
    function once() {
      var context = this
        , args    = sanitize.call(context, arraySlice.call(arguments, 0))
        , duplicate;
      // make sure the same handler is not added again
      each(hub[args.path], function(handler) {
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

    // example: context.off(emitter, name, callback)
    //          context.off(selector, name, callback)
    //          context.off(name, callback)
    //          context.off(name)
    //          context.off(selector)
    //          context.off(emitter)
    //          context.off()
    function off() {
      var context = this
        , args    = sanitize.call(context, arraySlice.call(arguments, 0))
        , hubKeys = keys(hub)
        , exist
        , name;
      // remember, at this point an index is created for the emitter
      // even if it doesn't have any listeners, but at the end we remove empty indices
      // find all handlers keys starting with path, namespaced keys
      filter(hubKeys, function(key) { return key === args.path || key.indexOf(args.path + '.') === 0; });
      // find all callbacks to be removed
      each(hubKeys, function(key) {
        reject(hub[key], function(handler) { return args.callback ? handler.callback === args.callback : handler.context === context; });
        if (!hub[key].length) delete hub[key];
      });
      // check if cache should be cleared
      if (args.emitter === cache.emitter) cache = {};
      // check if any other handlers available for the emitter
      // if not, remove the emitter from indices
      hubKeys = keys(hub);
      each(hubKeys, function(key) { if (key.indexOf(args.index) === 0) { exist = true; return false; }});
      if (!exist) delete indices[parseInt(args.index, 10)];
      // remove responders for external events
      respond(args.emitter, args.name, context, false);
      return context;
    }

    // example: context.trigger(emitter, name, parameters)
    //          context.trigger(selector, name, parameters)
    //          context.trigger(name, parameters)
    function trigger(emitter, name, parameters) {
      var context = this, handlers, path, hubKeys;
      if (isString(emitter)) { parameters = name; name = emitter; emitter = context; }
      // if its a cached trigger call, no need to find handlers
      if (cache.emitter === emitter && cache.name === name) handlers = cache.handlers;
      else {
        if (inArray(indices, emitter) === -1) return context;
        handlers = [];
        path = indexFor(indices, emitter) + (isString(name) ? '.' + name : '');
        // add handlers for path
        if (objectHas.call(hub, path)) handlers = handlers.concat(hub[path]);
        // find handlers in namespaced paths
        path = path + '.';
        hubKeys = keys(hub);
        filter(hubKeys, function(key) {
          return key.indexOf(path) === 0;
        });
        each(hubKeys, function(key) {
          handlers = handlers.concat(hub[key]);
        });
        cache.emitter = emitter;
        cache.name = name;
        cache.handlers = handlers;
      }
      each(handlers, function(handler) { handler.callback.call(handler.context, parameters); });
      return context;
    }

    // to use the module as a behavior
    Behaviors[name] = {

      add: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (constructor.check(name)) return prototype;
        extend(prototype, { on: on, once: once, off: off, trigger: trigger });
        behaviors.push(name);
        return prototype;
      },

      remove: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (!constructor.check(name)) return prototype;
        prototype.off();
        extend(prototype, { on: undefined, once: undefined, off: undefined, trigger: undefined });
        remove(behaviors, name);
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
    var args = arraySlice.call(arguments, 0), element, name, settings;
    // find out what are the arguments
    if (isElement(args[0])) { element  = args[0]; args = args.slice(1); }
    if (isString(args[0]))  { name     = args[0]; args = args.slice(1); }
    if (isObject(args[0]))  { settings = args[0]; }
    // check if only settings object is available, configure Skin itself
    // this way we can configure require, preload and pack before initialize or loading any other module
    if (settings && !element && !name) {
      extend(Skin, settings);
      return Skin;
    } else {
      var component  = function() {}
        , components = component.prototype;
      // component's behaviors
      component.behaviors = [];
      // method to add behaviors to the constructor
      component.is = function() {
        var args = arguments, behaviors = isArray(args[0])? args[0] : arraySlice.call(args, 0);
        each(behaviors, function(behavior) {
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
      component.check = function(behavior) { return inArray(component.behaviors, behavior) != -1; };
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
         Index:      Index,
         on:         Events.on,
         once:       Events.once,
         off:        Events.off,
         trigger:    Events.trigger });




  // export, attach Skin to context
  context.Skin = Skin;
  if (isFunction(define) && define.amd) define('skin', function() { return Skin; });
}).call(this);