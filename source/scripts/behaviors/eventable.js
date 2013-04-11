// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('behaviors/eventable', ['skin'], function(skin) {


  // Eventable Behavior
  // ==================
  // provides event management based on
  // publish, subscribe and unsubscribe model
  // events are scoped to publishers, emitters and namespaces, paths
  // the module servers as a shared event bus

  // publisher indices, shared handlers hub, cache for fast triggering, reference to adapter helpers
  var name = 'eventable', indices = [], hub = {}, cache = {}, adapter = skin.adapter;

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
    path = adapter.indexFor(indices, emitter) + adapter.isString(args[0]) ? '.' + args[0] : '';
    return {
      emitter: emitter,
      path: path,
      callback: callback
    };
  }

  function on() {
    var context = this
      , args    = sanitize.call(context, adapter.arraySlice.call(arguments, 0));
    if (adapter.objectHas.call(hub, args.path)) hub[args.path] = [];
    // make sure the same handler is not added again
    adapter.each(hub[args.path], function(handler) {
      if (handler.callback === args.callback && handler.context === context) return this;
    });
    hub[args.path].push({ callback: args.callback, context: context });
    // check if cache should be cleared
    if (args.emitter == cache.emitter) cache = {};
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
    if (emitter == cache.emitter && path == cache.path) handlers = cache.handlers;
    else {
      cache.emitter = emitter;
      cache.path = path;
      path = adapter.indexFor(indices, emitter) + adapter.isString(path) ? '.' + path : '';
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


  skin.behaviors[name] = {


    add: function() {
      var prototype   = this
        , constructor = prototype.constructor
        , behaviors   = constructor.behaviors;
      if (constructor.check(name)) return this;
      prototype.on      = on;
      prototype.once    = once;
      prototype.off     = off;
      prototype.trigger = trigger;
      behaviors.push(name);
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




  return skin;
});