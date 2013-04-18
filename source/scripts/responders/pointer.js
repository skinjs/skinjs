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
  function isSupported(type) {
    var element = d.createElement('div'), flag;
    type = 'on' + type;
    flag = (type in element);
    if (!flag) {
      element.setAttribute(type, 'return;');
      flag = Tools.isFunction(element[type]);
    }
    element = null;
    return flag;
  }

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
  tests = null;

  function contains(parent, child) {
    var pointer = child.parentNode;
    while (pointer !== null) {
      if (pointer === parent) return true;
      pointer = pointer.parentNode;
    }
    return false;
  }

  // get a nested element's offset, according to document
  function offset(element) {
    var x = 0, y = 0, pointer = element;
    while (pointer !== null) {
      x += pointer.offsetLeft;
      y += pointer.offsetTop;
      pointer = pointer.offsetParent;
    }
    return { x: x, y: y };
  }

  // prevent default browser actions
  function prevent(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.preventManipulation) event.preventManipulation();
    if (event.preventMouseEvent) event.preventMouseEvent();
  }

  // ensure coordinate is inside the element
  function sanitizeCoordinate(element, coordinate) {
    var offset = offset(element);
    return {
      x: Math.max(0, Math.min(coordinate.x - offset.x, element.offsetWidth))
    , y: Math.max(0, Math.min(coordinate.y - offset.y, element.offsetHeight))
    };
  }

  // add listener
  // listener is used by more complex responders, gestures
  function add(element, name, context, listener, capture) {
    var type = events[name];
    if (type) {
      if (listener) {
        // handled by other responders
        element.addEventListener(type, listener, capture || false);
      } else {
        var path = Tools.indexFor(indices, element) + '.' + name;
        if (hub[path]) {
          hub[path].push(context);
        } else {
          hub[path] = [context];
          element.addEventListener(type, handle, false);
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
        if (!exist) Tools.remove(indices, element);
      }
    });
  }

  function remove(element, name, context, listener) {
    if (!name.length) { clear(element, context); return; }
    var type = events[name];
    if (type) {
      if (listener) {
        // handled by other responders
        element.removeEventListener(type, listener);
      } else {
        var index = Tools.indexFor(indices, element) + '.'
          , path  = index + name;
        if (hub[path]) {
          Tools.remove(hub[path], context);
          if (!hub[path].length) {
            element.removeEventListener(type, handle);
            delete hub[path];
            // check if any other handlers available for the element
            // if not, remove the element from indices
            var keys = Tools.keys(hub), exist;
            Tools.each(keys, function(key) { if (key.indexOf(index) === 0) { exist = true; return false; }});
            if (!exist) Tools.remove(indices, element);
          }
        }
      }
    }
  }

  function handle(event) {
    var target     = event.currentTarget
      , source     = event.target
      , related    = event.relatedTarget
      , name       = events[event.type]
      , index      = Tools.indexFor(indices, source) + '.';

    if (!related || (related !== target && !contains(target, related))) {
      if (name === POINTER_OVER) {
        trigger(hub[index + POINTER_OVER], source, POINTER_OVER, event);
        trigger(hub[index + POINTER_ENTER], source, POINTER_ENTER, event);
      } else if (name === POINTER_OUT) {
        trigger(hub[index + POINTER_OUT], source, POINTER_OUT, event);
        trigger(hub[index + POINTER_LEAVE], source, POINTER_LEAVE, event);
      }
    } else if (source === target) {
      trigger(hub[index + name], source, name, event);
    }
  }

  function trigger(contexts, source, name, event) {
    Tools.each(contexts, function(context) { context.trigger(source, name, event); });
  }


  var Pointer = Tools.extend(Skin.Responders.Pointer, { add: add, remove: remove });
  return Pointer;
});