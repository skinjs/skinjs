// @@package @@version
// @@copyrightNotes
// @@licenseNotes
// @@homepage

define('responders/pointer', ['skin'], function(Skin) {


  // Pointer Responder Module
  // ========================
  // hooks for mouse, pen or touch events
  // supports pointerdown, pointerup, pointermove, pointercancel, pointerover, pointerout, pointerenter, pointerleave


  var namespace = 'pointer', w = window, d = document, n = w.navigator, Tools = Skin.Tools, Index = Skin.Index, hub = {}, events = {}, captured = {}

    , POINTER_DOWN         = 'pointerdown'
    , POINTER_UP           = 'pointerup'
    , POINTER_MOVE         = 'pointermove'
    , POINTER_CANCEL       = 'pointercancel'
    , POINTER_OVER         = 'pointerover'
    , POINTER_OUT          = 'pointerout'
    , POINTER_ENTER        = 'pointerenter'
    , POINTER_LEAVE        = 'pointerleave'
    , GOT_POINTER_CAPTURE  = 'gotpointercapture'
    , LOST_POINTER_CAPTURE = 'lostpointercapture'

    , MOUSE = 'mouse'
    , TOUCH = 'touch'
    , PEN   = 'pen';

  // check if browser supports an event
  var isSupported = function(type) {
    var element = d.createElement('div'), flag;
    type = 'on' + type.toLowerCase();
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
  tests[POINTER_DOWN]         = ['touchstart', 'MSPointerDown', 'mousedown'];
  tests[POINTER_UP]           = ['touchend', 'MSPointerUp', 'mouseup'];
  tests[POINTER_MOVE]         = ['touchmove', 'MSPointerMove', 'mousemove'];
  tests[POINTER_CANCEL]       = ['touchcancel', 'MSPointerCancel'];
  tests[POINTER_ENTER]        = ['mouseenter', 'mouseover'];
  tests[POINTER_LEAVE]        = ['mouseleave', 'mouseout'];
  tests[POINTER_OVER]         = ['MSPointerOver', 'mouseover'];
  tests[POINTER_OUT]          = ['MSPointerOut', 'mouseout'];
  tests[GOT_POINTER_CAPTURE]  = ['MSGotPointerCapture'];
  tests[LOST_POINTER_CAPTURE] = ['MSLostPointerCapture'];
  Tools.each(tests, function(types, name) {
    // I hope someday you'll join us..
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
    if (!parent || !child) return false;
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
      var index = Index.set(element, namespace)
        , handlers = hub[index] || (hub[index] = {});
      if (handlers[name]) {
        handlers[name].push(context);
      } else {
        handlers[name] = [context];
        // check if we need to capture move on document, to simulate over, out, enter and leave for touch
        if (/(over|out|enter|leave)$/.test(name) && /^touch/.test(events[POINTER_MOVE])) {
          if (!captured.count) {
            captured.count = 1;
            document.addEventListener(events[POINTER_MOVE], capture, true);
          }
          else captured.count++;
        } else element.addEventListener(type, handle, false);
      }
    }
  }


  // remove listener
  function remove(element, name, context) {
    if (!name) { clear(element, context); return; }
    var type = events[name];
    if (type) {
      var index = Index.get(element, namespace)
        , handlers = hub[index];
      if (handlers && handlers[name]) {
        Tools.remove(handlers[name], context);
        if (!handlers[name].length) {
          // simulated over, out, enter and leave for touch
          if (/(over|out|enter|leave)$/.test(name) && /^touch/.test(events[POINTER_MOVE])) {
            captured.count--;
            if (!captured.count) {
              document.removeEventListener(events[POINTER_MOVE], capture);
            }
          } else element.removeEventListener(type, handle);
          delete handlers[name];
          // check if any other handlers available for the element
          // if not, remove the element from indices
          if (Tools.isEmpty(handlers)) {
            delete hub[index];
            Index.remove(element, namespace);
          }
        }
      }
    }
  }


  // clear off element, all handlers for the specified context should be removed
  // this is when something like context.off(element) was called
  function clear(element, context) {
    var index = Index.get(element, namespace)
      , handlers = hub[index];
    if (handlers) Tools.each(handlers, function(contexts, name) {
      Tools.reject(contexts, function(which) { return which === context; });
      if (!contexts.length) {
        // simulated over, out, enter and leave for touch
        if (/(over|out|enter|leave)$/.test(name) && /^touch/.test(events[POINTER_MOVE])) {
          captured.count--;
          if (!captured.count) {
            document.removeEventListener(events[POINTER_MOVE], capture);
          }
        } else element.removeEventListener(events[name], handle);
        delete handlers[name];
        // check if any other handlers available for the element
        // if not, remove the element from indices
        if (Tools.isEmpty(handlers)) {
          delete hub[index];
          Index.remove(element, namespace);
        }
      }
    });
  }


  // captured move on document, find out when over, out, enter or leave happens
  function capture(e) {
    var pointer = e.changedTouches && e.changedTouches[0] || e
      , target  = d.elementFromPoint(pointer.clientX, pointer.clientY)
      , index   = Index.get(target, namespace);
    if (index !== -1) {
      if (captured.target !== target) {
        var handlers = hub[index];
        if (captured.handlers) {
          trigger(captured.handlers[POINTER_OUT], captured.target, POINTER_OUT, e);
          if (!contains(captured.target, target)) trigger(captured.handlers[POINTER_LEAVE], captured.target, POINTER_LEAVE, e);
        }
        trigger(handlers[POINTER_OVER], target, POINTER_OVER, e);
        if (!contains(target, captured.target)) trigger(handlers[POINTER_ENTER], target, POINTER_ENTER, e);
        captured.target   = target;
        captured.handlers = handlers;
      }
    } else {
      if (captured.handlers) {
        trigger(captured.handlers[POINTER_OUT], captured.target, POINTER_OUT, e);
        trigger(captured.handlers[POINTER_LEAVE], captured.target, POINTER_LEAVE, e);
      }
      captured = {};
    }
  }


  // handle pointer events
  function handle(e) {
    prevent(e);
    var type
      // standard "pointer" event name of the browser supported event
      , name          = events[e.type]
      // target, which dispatched the event
      , target        = e.target
      // current target, which captured the event or, the listener
      , currentTarget = e.currentTarget
      // related target, for over and out
      , relatedTarget = e.relatedTarget
      , index         = Index.get(currentTarget, namespace)
      , handlers      = hub[index][name];

    // Microsoft pointer model
    switch (e.pointerType) {
      case e.MSPOINTER_TYPE_MOUSE:
        type = MOUSE;
        break;
      case e.MSPOINTER_TYPE_TOUCH:
        type = TOUCH;
        break;
      case e.MSPOINTER_TYPE_PEN:
        type = PEN;
        break;
      default:
        type = /^touch/.test(e.type) ? TOUCH : MOUSE;
    }

    // simulate pointerenter and pointerleave using pointerover and pointerout
    if ((name == POINTER_OVER && events[POINTER_OVER] == events[POINTER_ENTER]) && (!relatedTarget || (relatedTarget !== currentTarget && !contains(currentTarget, relatedTarget))))
      trigger(handlers, target, POINTER_ENTER, e);
    if ((name == POINTER_OUT && events[POINTER_OUT] == events[POINTER_LEAVE]) && (!relatedTarget || (relatedTarget !== currentTarget && !contains(currentTarget, relatedTarget))))
      trigger(handlers, target, POINTER_LEAVE, e);
    if (target === currentTarget) {
      trigger(handlers, target, name, e);
    }
  }


  // trigger all listening contexts
  function trigger(handlers, target, name, event) {
    Tools.each(handlers, function(context) { context.trigger(target, name, event); });
  }




  var Pointer = Tools.extend(Skin.Responders.Pointer, { add: add, remove: remove });
  return Pointer;
});