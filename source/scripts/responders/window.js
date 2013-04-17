// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/window', ['skin'], function(Skin) {

  // Window Responder Module
  // =======================
  // hooks for window events
  // supports resize, scroll, load, unload, hashchange

  var w = window, d = document, e = d.documentElement, b = d.body, Tools = Skin.Tools, hub = {}, width, height, x, y;

  function add(emitter, name, context) {
    // existing handler
    if (hub[name]) {
      hub[name].contexts.push(context);
      return;
    }
    // new handler, we keep a reference to old handler
    // also keep a count and reference for contexts listening,
    // so we can easily remove all bindings for a context
    // or remove the name from hub when there's no context listening
    hub[name] = { contexts: [context] , old: w['on' + name] };
    w['on' + name] = function(event) {
      handle(name);
      // calling the old handler
      if (Tools.isFunction(hub[name].handler)) hub[name].old();
    };
  }

  function remove(emitter, name, context) {
    // special case, when there's no name it means
    // all listeners for the specified context should be removed
    // this is when something like off(window) is used
    if (!name.length) {
      Tools.each(hub, function(handler, name) {
        // remove all context references from all handlers
        Tools.reject(handler.contexts, function(which) { return which === context; });
        if (!handler.contexts.length) {
          w['on' + name] = handler.old;
          delete hub[name];
        }
      });
      return;
    }
    if (!hub[name]) return;
    // remove one of the context references, it may have other namespaced listeners
    Tools.remove(hub[name].contexts, context);
    if (!hub[name].contexts.length) {
      w['on' + name] = hub[name].old;
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


  var Window = Skin.Responders.Window = { add: add, remove: remove };
  return Window;
});
