// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('behaviors/eventable', ['skin'], function(skin) {


  // Eventable Behavior
  // ==================
  // provides event management based on
  // publish, subscribe and unsubscribe model
  // event are scoped to publishers and namespaces


  // publisher indices, shared handlers data, reference to adapter helpers
  var name = 'eventable', indices = [], handlers = {}, adapter = skin.adapter;

  function sanitize(args) {
    var context = this, name, callback;
    if (!adapter.isString(args[0])) { context = args[0]; args = args.slice(1); }
    name = adapter.indexFor(indices, context) + (!adapter.isString(args[0]))? '.' + args[0] : '';
    callback = (!adapter.isFunction(args[0]))? args[0] : args[1];
    return {
      context: context,
      name: name,
      callback: callback
    };
  }

  function on() {
    var args = sanitize.call(this, adapter.arraySlice.call(arguments, 0));
    adapter.objectEnsure(handlers, args.name, []);
    adapter.arrayEnsure(handlers[args.name], args.callback);
    return this;
  }

  function once() {
    var args = sanitize.call(this, adapter.arraySlice.call(arguments, 0));
    var callback = function() {
      args.context.off(args.name, callback);
      args.callback.apply(args.context, arguments);
    };
    on(args.name, callback);
    return this;
  }

  function off() {
    var args = sanitize.call(this, adapter.arraySlice.call(arguments, 0));
    
  }
  function trigger(object, event) {}


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
    }


  };




  return skin;
});