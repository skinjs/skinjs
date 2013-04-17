// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/pointer', ['skin'], function(Skin) {

  // Pointer Responder Module
  // ========================
  // hooks for mouse, pen or touch events
  // supports pointerdown, pointerup, pointermove, pointercancel, pointerover, pointerout, pointerenter, pointerleave

  var w = window, d = document, n = w.navigator, Tools = Skin.Tools, hub = {}, indices = []
    , regexDown      = /(start|down)$/i
    , regexMove      = /move$/i
    , regexUp        = /(up|end)$/i
    , regexCancel    = /cancel$/i
    // TODO: check with MSPointerOver and MSPointerOut
    , regexOver      = /^mouseover$/
    , regexOut       = /^mouseout$/
    , regexEnter     = /^mouseenter$/
    , regexLeave     = /^mouseleave$/
    , POINTER_DOWN   = 'pointerdown'
    , POINTER_UP     = 'pointerup'
    , POINTER_MOVE   = 'pointermove'
    , POINTER_CANCEL = 'pointercancel'
    , POINTER_OVER   = 'pointerover'
    , POINTER_OUT    = 'pointerout'
    , POINTER_ENTER  = 'pointerenter'
    , POINTER_LEAVE  = 'pointerleave'
    , MOUSE_DOWN     = 'mousedown'
    , MOUSE_UP       = 'mouseup'
    , MOUSE_MOVE     = 'mousemove'
    , MOUSE_OVER     = 'mouseover'
    , MOUSE_OUT      = 'mouseout'
    , MOUSE_ENTER    = 'mouseenter'
    , MOUSE_LEAVE    = 'mouseleave'
    , TOUCH_START    = 'touchstart'
    , TOUCH_END      = 'touchend'
    , TOUCH_MOVE     = 'touchmove'
    , TOUCH_CANCEL   = 'touchcancel';

  // check if browser supports an event
  function isSupported(name) {
    var element = d.createElement('div'), cache = {}, flag;
    name = 'on' + name;
    if (cache[name]) return cache[name];
    flag = (name in element);
    if (!flag) {
      element.setAttribute(name, 'return;');
      flag = typeof element[name] === 'function';
    }
    element = null;
    cache[name] = flag;
    return flag;
  }

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

  // find supported event type based on name
  function typeOfName(name) {
    switch (name) {
      case POINTER_DOWN:
        return isSupported(POINTER_DOWN) ? POINTER_DOWN
             : isSupported(TOUCH_START) ? TOUCH_START
             : n.msPointerEnabled ? 'MSPointerDown'
             : MOUSE_DOWN;

      case POINTER_UP:
        return isSupported(POINTER_UP) ? POINTER_UP
             : isSupported(TOUCH_END) ? TOUCH_END
             : n.msPointerEnabled ? 'MSPointerUp'
             : MOUSE_UP;

      case POINTER_MOVE:
        return isSupported(POINTER_MOVE) ? POINTER_MOVE
             : isSupported(TOUCH_MOVE) ? TOUCH_MOVE
             : n.msPointerEnabled ? 'MSPointerMove'
             : MOUSE_MOVE;

      // touch only
      case POINTER_CANCEL:
        return isSupported(POINTER_CANCEL) ? POINTER_CANCEL
             : isSupported(TOUCH_CANCEL) ? TOUCH_CANCEL
             : n.msPointerEnabled ? 'MSPointerCancel'
             : null;

      // mouse only
      case POINTER_ENTER:
        return isSupported(MOUSE_ENTER) ? MOUSE_ENTER
             : MOUSE_OVER;

      case POINTER_LEAVE:
        return isSupported(MOUSE_LEAVE) ? MOUSE_LEAVE
             : MOUSE_OUT;

      case POINTER_OVER:
       return MOUSE_OVER;

      case POINTER_OUT:
       return MOUSE_OUT;

      default:
        return null;
    }
  }

  // find standard event name based on type
  function nameOfType(type) {
    return regexMove.test(type)   ? POINTER_MOVE
         : regexOver.test(type)   ? POINTER_OVER
         : regexOut.test(type)    ? POINTER_OUT
         : regexEnter.test(type)  ? POINTER_ENTER
         : regexLeave.test(type)  ? POINTER_LEAVE
         : regexDown.test(type)   ? POINTER_DOWN
         : regexUp.test(type)     ? POINTER_UP
         : regexCancel.test(type) ? POINTER_CANCEL
         : null;
  }

  // add listener
  // listener is used by more complex responders, gestures
  function add(element, name, context, listener) {
    var type = typeOfName(name);
    if (type) {
      if (listener) {
        // handled by other responders
        element.addEventListener(type, listener, false);
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
        var type  = typeOfName(path.split('.')[1])
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
    var type = typeOfName(name);
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
    var target  = event.currentTarget
      , source  = event.target
      , related = event.relatedTarget
      , name    = nameOfType(event.type)
      , index   = Tools.indexFor(indices, source) + '.';

    // TODO: this needs lots of refactoring
    if (name === POINTER_OVER && !isSupported(MOUSE_ENTER)) {
      if (hub[index + POINTER_ENTER] && (!related || (related !== target && !contains(target, related)))) {
        Tools.each(hub[index + POINTER_ENTER], function(context) {
          context.trigger(source, POINTER_ENTER, { x: event.clientX, y: event.clientY, event: event });
        });
      }
      if (hub[index + POINTER_OVER] && source === target) {
        Tools.each(hub[index + POINTER_OVER], function(context) {
          context.trigger(source, POINTER_OVER, { x: event.clientX, y: event.clientY, event: event });
        });
      }
    } else if (name === POINTER_OUT && !isSupported(MOUSE_LEAVE)) {
      if (hub[index + POINTER_LEAVE] && (!related || (related !== target && !contains(target, related)))) {
        Tools.each(hub[index + POINTER_LEAVE], function(context) {
          context.trigger(source, POINTER_LEAVE, { x: event.clientX, y: event.clientY, event: event });
        });
      }
      if (hub[index + POINTER_OUT] && source === target) {
        Tools.each(hub[index + POINTER_OUT], function(context) {
          context.trigger(source, POINTER_OUT, { x: event.clientX, y: event.clientY, event: event });
        });
      }
    } else if (source === target) {
      Tools.each(hub[index + name], function(context) {
        context.trigger(source, name, { x: event.clientX, y: event.clientY, event: event });
      });
    }
  }


  var Pointer = Skin.Responders.Pointer = { add: add, remove: remove };
  return Pointer;
});