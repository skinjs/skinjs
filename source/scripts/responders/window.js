// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/window', ['skin'], function(skin) {


  // Window Responder Module
  // =======================
  // provides hooks for window events


  var name = 'window'
    , adapter = skin.adapter
    , handlers = {}
    , events = ['resize', 'scroll', 'load', 'unload', 'hashchange']
    , w = window, d = document, e = d.documentElement, b = d.body
    , width, height, top, left;

  function add(context, name) {
    if (adapter.inArray(events, name) == -1) return;
    // existing handler,
    if (adapter.objectHas.call(handlers, name)) {
      handlers[name].listeners.push(context);
      return;
    }
    // keep a reference to old handler
    handlers[name] = { listeners: [context] , oldie: window['on' + name] };
    window['on' + name] = function(event) {
      handle(name);
      // calling the old handler
      if (adapter.isFunction(handlers[name].oldie)) handlers[name].oldie();
    };
  }

  function remove(context, name) {
    // special case, when there's no name it means
    // all listeners for the specified context should be removed
    // this is when something like off(window) is used
    if (!name.length) {
      adapter.each(handlers, function(handler, name) {
        // remove all context references from all handlers
        adapter.reject(handler.listeners, function(listener) { return listener === context; });
        if (!handler.listeners.length) {
          window['on' + name] = handler.oldie;
          delete handlers[name];
        }
      });
      return;
    }
    if (adapter.inArray(events, name) == -1 || !adapter.objectHas.call(handlers, name)) return;
    // remove one of the context references, it may still have namespaced listeners
    adapter.remove(handlers[name].listeners, context);
    if (!handlers[name].listeners.length) {
      window['on' + name] = handlers[name].oldie;
      delete handlers[name];
    }
  }

  function handle(name) {
    switch (name) {

      case 'resize':
        width  = w.innerWidth  || e.clientWidth  || 0;
        height = w.innerHeight || e.clientHeight || 0;
        skin.trigger(window, 'resize', { width: width, height: height });
      break;

      case 'scroll':
        left = e.scrollLeft || b.scrollLeft || 0;
        top  = e.scrollTop  || b.scrollTop  || 0;
        skin.trigger(window, 'scroll', { top: top, left: left });
      break;

      case 'load':
        skin.trigger(window, 'load');
      break;

      case 'unload':
        skin.trigger(window, 'unload');
      break;

      case 'hashchange':
        skin.trigger(window, 'hashchange', { hash: w.location.hash });
      break;

    }
  }

  skin.responders[name] = { add: add, remove: remove };




  return skin;
});
