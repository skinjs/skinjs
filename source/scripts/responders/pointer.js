// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/pointer', ['skin'], function(Skin) {

  // Pointer Responder Module
  // ========================
  // hooks for mouse, pen or touch events
  // supports pointerdown, pointerup, pointermove, pointercancel, pointerover, pointerout, pointerenter, pointerleave

  var w = window, d = document, n = w.navigator, Tools = Skin.Tools, hub = {}, indices = [], events = {}
    , POINTER_DOWN   = 'pointerdown'
    , POINTER_UP     = 'pointerup'
    , POINTER_MOVE   = 'pointermove'
    , POINTER_CANCEL = 'pointercancel'
    , POINTER_OVER   = 'pointerover'
    , POINTER_OUT    = 'pointerout'
    , POINTER_ENTER  = 'pointerenter'
    , POINTER_LEAVE  = 'pointerleave';

  // check if browser supports an event
  var isSupported = function(type) {
    var element = d.createElement('div'), flag;
    type = 'on' + type;
    flag = (type in element);
    if (!flag) {
      element.setAttribute(type, 'return;');
      flag = Tools.isFunction(element[type]);
    }
    element = null;
    return flag;
  };

  // cache browser supported events map to pointer events and vice versa
  var tests = {};
  tests[POINTER_DOWN]   = ['touchstart', 'MSPointerDown', 'mousedown'];
  tests[POINTER_UP]     = ['touchend', 'MSPointerUp', 'mouseup'];
  tests[POINTER_MOVE]   = ['touchmove', 'MSPointerMove', 'mousemove'];
  tests[POINTER_CANCEL] = ['touchcancel', 'MSPointerCancel'];
  tests[POINTER_ENTER]  = ['mouseenter', 'mouseover'];
  tests[POINTER_LEAVE]  = ['mouseleave', 'mouseout'];
  tests[POINTER_OVER]   = ['mouseover'];
  tests[POINTER_OUT]    = ['mouseout'];
  Tools.each(tests, function(types, name) {
    if (isSupported(name)) events[name] = name;
    else {
      events[name] = null;
      Tools.each(types, function(type) {
        if (isSupported(type)) {
          events[name] = type;
          events[type] = name;
          return false;
        }
      });
    }
  });
  tests = isSupported = null;

  // check if a DOM node contains other
  // used for faking pointerenter and pointerleave
  // where they are not supported
  function contains(parent, child) {
    var pointer = child.parentNode;
    while (pointer !== null) {
      if (pointer === parent) return true;
      pointer = pointer.parentNode;
    }
    return false;
  }

  // prevent default browser actions
  function prevent(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.preventManipulation) event.preventManipulation();
    if (event.preventMouseEvent) event.preventMouseEvent();
  }

  // add listener
  function add(element, name, context) {
    var type = events[name];
    if (type) {
      var path = Tools.indexFor(indices, element) + '.' + name;
      if (hub[path]) {
        hub[path].push(context);
      } else {
        hub[path] = [context];
        element.addEventListener(type, handle, false);
      }
    }
  }

  // remove listener
  function remove(element, name, context) {
    if (!name.length) { clear(element, context); return; }
    var type = events[name];
    if (type) {
      var index = Tools.indexFor(indices, element)
        , path  = index + '.' + name;
      if (hub[path]) {
        Tools.remove(hub[path], context);
        if (!hub[path].length) {
          element.removeEventListener(type, handle);
          delete hub[path];
          // check if any other handlers available for the element
          // if not, remove the element from indices
          var keys = Tools.keys(hub), exist;
          Tools.each(keys, function(key) { if (key.indexOf(index) === 0) { exist = true; return false; }});
          if (!exist) delete indices[index];
        }
      }
    }
  }

  // clear off element, all handlers for the specified context should be removed
  // this is when something like context.off(element) was called
  function clear(element, context) {
    Tools.each(hub, function(contexts, path) {
      Tools.reject(contexts, function(which) { return which === context; });
      if (!contexts.length) {
        var type  = events[path.split('.')[1]]
          , index = path.split('.')[0];
        element.removeEventListener(type, handle);
        delete hub[path];
        // check if any other handlers available for the element
        // if not, remove the element from indices
        var keys = Tools.keys(hub), exist;
        Tools.each(keys, function(key) { if (key.indexOf(index) === 0) { exist = true; return false; }});
        if (!exist) delete indices[parseInt(index, 10)];
      }
    });
  }

  // handle pointer events
  function handle(event) {
    var target     = event.currentTarget
      , source     = event.target
      , related    = event.relatedTarget
      , name       = events[event.type]
      , index      = Tools.indexFor(indices, target) + '.';

    // simulate pointerenter and pointerleave using pointerover and pointerout
    if ((name == POINTER_OVER && events[POINTER_OVER] == events[POINTER_ENTER]) && (!related || (related !== target && !contains(target, related))))
      trigger(hub[index + POINTER_ENTER], source, POINTER_ENTER, event);
    if ((name == POINTER_OUT && events[POINTER_OUT] == events[POINTER_LEAVE]) && (!related || (related !== target && !contains(target, related))))
      trigger(hub[index + POINTER_LEAVE], source, POINTER_LEAVE, event);

    if (source === target) {
      trigger(hub[index + name], source, name, event);
    }
  }

  // trigger all listening contexts
  function trigger(contexts, source, name, event) {
    Tools.each(contexts, function(context) { context.trigger(source, name, event); });
  }


  var Pointer = Tools.extend(Skin.Responders.Pointer, { add: add, remove: remove });
  return Pointer;
});