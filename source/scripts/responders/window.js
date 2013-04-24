// @@package @@version
// @@copyrightNotes
// @@licenseNotes
// @@homepage

define('responders/window', ['skin'], function(Skin) {

  // Window Responder Module
  // =======================
  // hooks for window events
  // supports resize, scroll, load, unload, hashchange

  var w = window, d = document, e = d.documentElement, b = d.body, Tools = Skin.Tools, hub = {}, width, height, left, top;

  function add(emitter, name, context) {
    // indices is not needed, because all events are window's
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
    w['on' + name] = function(e) {
      handle(e);
      // calling the old handler
      if (Tools.isFunction(hub[name].old)) hub[name].old(e);
    };
  }

  function remove(emitter, name, context) {
    // special case, when there's no name it means
    // all listeners for the specified context should be removed
    // this is when something like off(window) is used
    if (!name) {
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

  function handle(e) {
    switch (e.type) {

      case 'resize':
        width  = w.innerWidth  || e && e.clientWidth  || 0;
        height = w.innerHeight || e && e.clientHeight || 0;
        Skin.trigger(w, 'resize', { width: width, height: height, event: e });
      break;

      case 'scroll':
        left = w.pageXOffset || e && e.scrollLeft || b && b.scrollLeft || 0;
        top  = w.pageYOffset || e && e.scrollTop  || b && b.scrollTop  || 0;
        Skin.trigger(w, 'scroll', { left: left, top: top, event: e });
      break;

      case 'load':
        Skin.trigger(w, 'load', { event: e });
      break;

      case 'unload':
        Skin.trigger(w, 'unload', { event: e });
      break;

      case 'hashchange':
        Skin.trigger(w, 'hashchange', { hash: w.location.hash, event: e });
      break;

    }
  }


  var Window = Tools.extend(Skin.Responders.Window, { add: add, remove: remove });
  return Window;
});
