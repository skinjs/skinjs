// @@package @@version
// @@copyrightNotes
// @@licenseNotes
// @@homepage

define('responders/window', ['skin'], function(Skin) {


  // Window Responder Module
  // =======================
  // hooks for window events
  // supports resize, scroll, load, unload, hashchange


  var w = window, d = document, e = d.documentElement, b = d.body, Tools = Skin.Tools, hub = {}, width, height, x, y

    // string keys
    , ON          = 'on'
    , RESIZE      = 'resize'
    , SCROLL      = 'scroll'
    , LOAD        = 'load'
    , UNLOAD      = 'unload'
    , HASH_CHANGE = 'hashchange';


  function on(emitter, name, context) {
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
    hub[name] = { contexts: [context] , old: w[ON + name] };
    w[ON + name] = function(e) {
      handle(e);
      // calling the old handler
      if (Tools.isFunction(hub[name].old)) hub[name].old(e);
    };
  }


  function off(emitter, name, context) {
    // special case, when there's no name it means
    // all listeners for the specified context should be removed
    // this is when something like off(window) is used
    if (!name) {
      Tools.each(hub, function(handler, name) {
        // remove all context references from all handlers
        Tools.reject(handler.contexts, function(which) { return which === context; });
        if (!handler.contexts.length) {
          w[ON + name] = handler.old;
          delete hub[name];
        }
      });
      return;
    }
    if (!hub[name]) return;
    // remove one of the context references, it may have other namespaced listeners
    Tools.remove(hub[name].contexts, context);
    if (!hub[name].contexts.length) {
      w[ON + name] = hub[name].old;
      delete hub[name];
    }
  }


  function handle(e) {
    switch (e.type) {

      case RESIZE:
        width  = w.innerWidth  || e && e.clientWidth  || 0;
        height = w.innerHeight || e && e.clientHeight || 0;
        Skin.trigger(w, RESIZE, { width: width, height: height, event: e });
      break;

      case SCROLL:
        x = w.pageXOffset || e && e.scrollLeft || b && b.scrollLeft || 0;
        y = w.pageYOffset || e && e.scrollTop  || b && b.scrollTop  || 0;
        Skin.trigger(w, SCROLL, { x: x, y: y, event: e });
      break;

      case LOAD:
        Skin.trigger(w, LOAD, { event: e });
      break;

      case UNLOAD:
        Skin.trigger(w, UNLOAD, { event: e });
      break;

      case HASH_CHANGE:
        Skin.trigger(w, HASH_CHANGE, { hash: w.location.hash, event: e });
      break;

    }
  }




  var Window = Tools.extend(Skin.Responders.Window, { on: on, off: off });
  return Window;
});
