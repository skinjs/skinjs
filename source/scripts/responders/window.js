// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/window', ['skin'], function(skin) {


  // Window Responder Module
  // =======================
  // provides hooks for window events


  var name = 'window', adapter = skin.adapter, handlers = {}, events = ['resize', 'scroll', 'load', 'unload', 'hashchange'];


  function add(name) {
    if (adapter.inArray(events, name) == -1) return;
    // existing handler, just increase counter
    if (adapter.objectHas.call(handlers, name)) {
      handlers[name].counter++;
      return;
    }
    handlers[name] = { counter: 1, old: window['on' + name] };
    window['on' + name] = function(event) {
      handle(name);
      // calling the old handler
      if (adapter.isFunction(handlers[name].old)) handlers[name].old();
    };
  }

  function remove(name) {
    if (adapter.inArray(events, name) == -1 || !adapter.objectHas.call(handlers, name)) return;
    handlers[name].counter--;
    if (handlers[name].counter === 0) {
      window['on' + name] = handlers[name].old;
      delete handlers[name];
    }
  }

  function handle(name) {
    switch (name) {

      case 'resize':
        var width = 0, height = 0;
        if (adapter.isNumber(window.innerWidth)) {
          width  = window.innerWidth;
          height = window.innerHeight;
        } else if (document.documentElement) {
          width  = document.documentElement.clientWidth;
          height = document.documentElement.clientHeight;
        }
        skin.trigger(window, 'resize', { width: width, height: height });
      break;

      case 'scroll':
        var left = 0, top = 0;
        if (document.body) {
          top  = document.body.scrollTop;
          left = document.body.scrollLeft;
        } else if (document.documentElement) {
          top  = document.documentElement.scrollTop;
          left = document.documentElement.scrollLeft;
        }
        skin.trigger(window, 'scroll', { top: top, left: left });
      break;

      case 'load':
      case 'unload':
      case 'hashchange':
      break;
    }
  }


  skin.responders[name] = { add: add, remove: remove };




  return skin;
});
