// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/window', ['skin'], function(skin) {


  // Window Responder Module
  // =======================
  // provides hooks for window events


  var name    = 'window'
    , adapter = skin.adapter
    , hub     = {}
    , events  = /^(resize|scroll|load|unload|hashchange)$/
    , w = window, d = document, e = d.documentElement, b = d.body
    , width, height, x, y;

  function add(name, context) {
    if (!events.test(name)) return;
    // existing handler,
    if (adapter.objectHas.call(hub, name)) {
      hub[name].listeners.push(context);
      return;
    }
    // keep a reference to old handler
    hub[name] = { listeners: [context] , oldie: window['on' + name] };
    window['on' + name] = function(event) {
      handle(name);
      // calling the old handler
      if (adapter.isFunction(hub[name].oldie)) hub[name].oldie();
    };
  }

  function remove(name, context) {
    // special case, when there's no name it means
    // all listeners for the specified context should be removed
    // this is when something like off(window) is used
    if (!name.length) {
      adapter.each(hub, function(handler, name) {
        // remove all context references from all handlers
        adapter.reject(handler.listeners, function(listener) { return listener === context; });
        if (!handler.listeners.length) {
          window['on' + name] = handler.oldie;
          delete hub[name];
        }
      });
      return;
    }
    if (!events.test(name) || !adapter.objectHas.call(hub, name)) return;
    // remove one of the context references, it may still have namespaced listeners
    adapter.remove(hub[name].listeners, context);
    if (!hub[name].listeners.length) {
      window['on' + name] = hub[name].oldie;
      delete hub[name];
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
        x = e.scrollLeft || b.scrollLeft || 0;
        y = e.scrollTop  || b.scrollTop  || 0;
        skin.trigger(window, 'scroll', { x: x, y: y });
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
