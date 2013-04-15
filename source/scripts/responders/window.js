// Skin.js 0.1.3
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/window', ['skin'], function(Skin) {

  // Window Responder Module
  // =======================
  // hooks for window events
  // supports resize, scroll, load, unload, hashchange

  var w = window, d = document, e = d.documentElement, b = d.body, name = 'Window', Tools = Skin.Tools, hub = {}, width, height, x, y;

  function add(emitter, name, context) {
    // existing handler
    if (hub[name]) {
      hub[name].listeners.push(context);
      return;
    }
    // new handler, keep a reference to old handler
    // also have a count and reference for listeners
    // so we can easily remove all listeners for a context
    // or remove the name from hub when there's no listeners
    hub[name] = { listeners: [context] , oldie: w['on' + name] };
    w['on' + name] = function(event) {
      handle(name);
      // calling the old handler
      if (Tools.isFunction(hub[name].oldie)) hub[name].oldie();
    };
  }

  function remove(emitter, name, context) {
    // special case, when there's no name it means
    // all listeners for the specified context should be removed
    // this is when something like off(window) is used
    if (!name.length) {
      Tools.each(hub, function(handler, name) {
        // remove all context references from all handlers
        Tools.reject(handler.listeners, function(listener) { return listener === context; });
        if (!handler.listeners.length) {
          w['on' + name] = handler.oldie;
          delete hub[name];
        }
      });
      return;
    }
    if (!Tools.objectHas.call(hub, name)) return;
    // remove one of the context references, it may still have namespaced listeners
    Tools.remove(hub[name].listeners, context);
    if (!hub[name].listeners.length) {
      w['on' + name] = hub[name].oldie;
      delete hub[name];
    }
  }

  function handle(name) {
    switch (name) {

      case 'resize':
        width  = w.innerWidth  || e.clientWidth  || 0;
        height = w.innerHeight || e.clientHeight || 0;
        Skin.trigger(w, 'resize', { width: width, height: height });
      break;

      case 'scroll':
        x = e.scrollLeft || b.scrollLeft || 0;
        y = e.scrollTop  || b.scrollTop  || 0;
        Skin.trigger(w, 'scroll', { x: x, y: y });
      break;

      case 'load':
        Skin.trigger(w, 'load');
      break;

      case 'unload':
        Skin.trigger(w, 'unload');
      break;

      case 'hashchange':
        Skin.trigger(w, 'hashchange', { hash: w.location.hash });
      break;

    }
  }


  Skin.Responders[name] = { add: add, remove: remove };
  return Skin;
});
