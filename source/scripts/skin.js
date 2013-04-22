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
      };




  // Index Module
  // ============
  // simple module for indexing uinique ids for everything
  // globally or scoped by namespace
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
    if (!name && !flag) {
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


    // shared handlers hub, cache for fast triggering, temporary register for once calls
    var namespace = 'events', behavior = 'Eventable', hub = {}, cache = {};


    // check if context handles (listens to) to an event from emitter
    function handles(emitter, name) {
      var context = this, index, prefix, result = false;
      if (isUndefined(name)) { name = emitter; emitter = context; }
      index = Index.get(emitter, namespace);
      if (!hub[index]) return result;
      // look for exact name handlers
      each(hub[index][name], function(handler) { if (handler.context === context) { result = true; return false; }});
      if (result) return result;
      // look for namespaced name handlers
      prefix = name + '.';
      each(hub[index], function(handlers, which) {
        if (which.indexOf(prefix) === 0) each(handlers, function(handler) { if (handler.context === context) { result = true; return false; }});
        if (result) return false;
      });
      return result;
    }


    // example: context.on(emitter, name, callback)
    //          context.on(selector, name, callback)
    //          context.on(name, callback)
    function on(emitter, name, callback, temporary) {
      var context = this, index, handlers, handler, duplicate;
      if (isFunction(name)) { callback = name; name = emitter; emitter = context; }
      index = Index.set(emitter, namespace);
      if (!hub[index]) hub[index] = {};
      handlers = hub[index][name] || (hub[index][name] = []);
      // make sure the same handler is not added again
      each(handlers, function(handler) {
        // if duplicate found, return false to break the each iterator
        if (handler.callback === callback && handler.context === context) {
          // override once() if an on() is called
          if (handler.once && !temporary) delete handler.once;
          duplicate = true;
          return false;
        }
      });
      if (duplicate) return context;
      handler = { callback: callback, context: context };
      if (temporary) handler.once = true;
      handlers.push(handler);
      // create responders for external events
      respond(emitter, name, context, true);
      // check if cache should be cleared
      if (emitter === cache.emitter) cache = {};
      return context;
    }


    // example: context.once(emitter, name, callback)
    //          context.once(selector, name, callback)
    //          context.once(name, callback)
    function once(emitter, name, callback) {
      var context = this, index;
      if (isFunction(name)) { callback = name; name = emitter; emitter = context; }
      return context.on(emitter, name, callback, true);
    }


    // example: context.off(emitter, name, callback)
    //          context.off(selector, name, callback)
    //          context.off(name, callback)
    //          context.off(emitter, callback)
    //          context.off(selector, callback)
    //          context.off(name)
    //          context.off(selector)
    //          context.off(emitter)
    //          context.off()
    function off(emitter, name, callback) {
      var context = this, index, prefix, handlers;
      // no arguments
      if (!emitter && !name && !callback) { emitter = context; }
      // single argument, its either selector or name, first check if its being handled by this context
      else if (!name && !callback && isString(emitter) && handles.call(context, emitter)) { name = emitter; emitter = context; }
      // two arguments, name or emitter, and callback
      else if (isFunction(name)) {
        callback = name;
        if (isString(emitter) && handles.call(context, emitter)) { name = emitter; emitter = context; }
        else { name = undefined; }
      }
      index = Index.get(emitter, namespace);
      if (!hub[index]) return context;
      if (name) {
        // look for exact name handlers
        if (hub[index][name]) remove(index, name, context, callback);
        // look for namespaced name handlers
        prefix = name + '.';
        each(hub[index], function(handlers, which) {
          if (which.indexOf(prefix) === 0) remove(index, which, context, callback);
        });
      } else {
        each(hub[index], function(handlers, which) { remove(index, which, context, callback); });
      }
      // check if cache should be cleared
      if (emitter === cache.emitter) cache = {};
      // check if any other handlers available for the emitter
      // if not, remove the emitter from indices
      if (isEmpty(hub[index])) {
        delete hub[index];
        Index.remove(emitter, namespace);
      }
      // remove responders for external events
      respond(emitter, name, context, false);
      return context;
    }

    // refactored helper for off(), internal use only
    function remove(index, name, context, callback) {
      var handlers = hub[index][name];
      reject(handlers, function(handler) { return callback ? handler.callback === callback : handler.context === context; });
      if (!handlers.length) delete hub[index][name];
    }


    // example: context.trigger(emitter, name, parameters)
    //          context.trigger(selector, name, parameters)
    //          context.trigger(name, parameters)
    function trigger(emitter, name, parameters) {
      var context = this, index, triggers, prefix;
      if (isObject(name) || (!name && !parameters)) { parameters = name; name = emitter; emitter = context; }
      // if its a cached trigger call, no need to find handlers
      if (cache.emitter === emitter && cache.name === name) triggers = cache.triggers;
      else {
        index = Index.get(emitter, namespace);
        if (!hub[index]) return context;
        triggers = [];
        // look for exact name handlers
        if (hub[index][name]) triggers = triggers.concat(hub[index][name]);
        // look for exact name handlers
        prefix = name + '.';
        each(hub[index], function(handlers, which) { if (which.indexOf(prefix) === 0) triggers = triggers.concat(handlers); });
        cache.emitter = emitter;
        cache.name = name;
        cache.triggers = triggers;
      }
      each(triggers, function(handler) {
        handler.callback.call(handler.context, parameters);
        if (handler.once) off.call(handler.context, emitter, name, handler.callback);
      });
      return context;
    }


    // to use the module as a behavior
    Behaviors[behavior] = {

      add: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (constructor.check(behavior)) return prototype;
        extend(prototype, { on: on, once: once, off: off, trigger: trigger });
        behaviors.push(behavior);
        return prototype;
      },

      remove: function() {
        var prototype   = this
          , constructor = prototype.constructor
          , behaviors   = constructor.behaviors;
        if (!constructor.check(behavior)) return prototype;
        prototype.off();
        extend(prototype, { on: undefined, once: undefined, off: undefined, trigger: undefined });
        remove(behaviors, behavior);
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