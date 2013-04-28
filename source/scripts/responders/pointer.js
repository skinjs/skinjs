// @@package @@version
// @@copyrightNotes
// @@licenseNotes
// @@homepage

define('responders/pointer', ['skin'], function(Skin) {


  // Pointer Responder Module
  // ========================
  // hooks for mouse, pen or touch events
  // supports pointerdown, pointerup, pointermove, pointercancel,
  //          pointerover, pointerout, pointerenter, pointerleave,
  //          gotpointercapture, lostpointercapture


  var namespace = 'pointer', w = window, d = document, n = w.navigator
    , Tools = Skin.Tools, Index = Skin.Index, hub = {}, events = {}, tests = {}, pointers = {}, captured

    // string keys
    , MOUSE                   = 'mouse'
    , TOUCH                   = 'touch'
    , PEN                     = 'pen'

    , POINTER_DOWN            = 'pointerdown'
    , POINTER_UP              = 'pointerup'
    , POINTER_MOVE            = 'pointermove'
    , POINTER_CANCEL          = 'pointercancel'
    , POINTER_OVER            = 'pointerover'
    , POINTER_OUT             = 'pointerout'
    , POINTER_ENTER           = 'pointerenter'
    , POINTER_LEAVE           = 'pointerleave'
    , GOT_POINTER_CAPTURE     = 'gotpointercapture'
    , LOST_POINTER_CAPTURE    = 'lostpointercapture'

    , TOUCH_START             = 'touchstart'
    , TOUCH_END               = 'touchend'
    , TOUCH_MOVE              = 'touchmove'
    , TOUCH_CANCEL            = 'touchcancel'

    , MS_POINTER_DOWN         = 'MSPointerDown'
    , MS_POINTER_UP           = 'MSPointerUp'
    , MS_POINTER_MOVE         = 'MSPointerMove'
    , MS_POINTER_CANCEL       = 'MSPointerCancel'
    , MS_POINTER_OVER         = 'MSPointerOver'
    , MS_POINTER_OUT          = 'MSPointerOut'
    , MS_GOT_POINTER_CAPTURE  = 'MSGotPointerCapture'
    , MS_LOST_POINTER_CAPTURE = 'MSLostPointerCapture'

    , MOUSE_DOWN              = 'mousedown'
    , MOUSE_UP                = 'mouseup'
    , MOUSE_MOVE              = 'mousemove'
    , MOUSE_OVER              = 'mouseover'
    , MOUSE_OUT               = 'mouseout'
    , MOUSE_ENTER             = 'mouseenter'
    , MOUSE_LEAVE             = 'mouseleave'

    // test event type for detecting touch events
    , TOUCH_TEST              = /^touch/
    // test for pointerover, pointerout, pointerenter and pointerleave
    // on a touch enabled device we have to simulate these by capturing
    // touchmove on document and detecting the target element
    , CAPTURE_TEST            = /(over|out|enter|leave)$/;

  // cache browser supported events mapped to pointer events and vice versa
  tests[POINTER_DOWN]         = [TOUCH_START,      MS_POINTER_DOWN,    MOUSE_DOWN];
  tests[POINTER_UP]           = [TOUCH_END,        MS_POINTER_UP,      MOUSE_UP];
  tests[POINTER_MOVE]         = [TOUCH_MOVE,       MS_POINTER_MOVE,    MOUSE_MOVE];
  tests[POINTER_CANCEL]       = [TOUCH_CANCEL,     MS_POINTER_CANCEL];
  tests[POINTER_OVER]         = [MS_POINTER_OVER,  MOUSE_OVER];
  tests[POINTER_OUT]          = [MS_POINTER_OUT,   MOUSE_OUT];
  tests[POINTER_ENTER]        = [MOUSE_ENTER];
  tests[POINTER_LEAVE]        = [MOUSE_LEAVE];
  tests[GOT_POINTER_CAPTURE]  = [MS_GOT_POINTER_CAPTURE];
  tests[LOST_POINTER_CAPTURE] = [MS_LOST_POINTER_CAPTURE];

  Tools.each(tests, function(types, name) {
    // I hope someday you'll join us.. standard pointer events
    if (Tools.isSupportedEvent(name)) events[name] = [name];
    else {
      events[name] = [];
      Tools.each(types, function(type) {
        if (Tools.isSupportedEvent(type)) {
          events[name].push(type);
          events[type] = name;
          // Microsoft pointer model supports touch, mouse and pen
          // we don't need separate mouse events (last test arguments)
          // so we can break out here
          if (n.msPointerEnabled) return false;
        }
      });
    }
  });
  tests = null;


  // prevent default browser actions
  function prevent(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.preventManipulation) event.preventManipulation();
    if (event.preventMouseEvent) event.preventMouseEvent();
  }


  // add listener
  function on(element, name, context) {
    var types = events[name];
    if (types) {
      var index    = Index.set(element, namespace)
        , handlers = hub[index] || (hub[index] = {});
      if (handlers[name]) {
        handlers[name].push(context);
      } else {
        handlers[name] = [context];
        // check if we should capture touchmove on document,
        // to figure pointerover, pointerout, pointerenter and pointerleave events
        if (CAPTURE_TEST.test(name) && events[TOUCH_MOVE]) {
          if (!captured) {
            captured = 1;
            d.addEventListener(TOUCH_MOVE, capture, true);
          } else captured++;
        }
        Tools.each(types, function (type) {
          // mouseenter and mouseleave are supported on Firefox and IE, and they don't bubble
          // so we assign them to the element instead of delegating to document
          if (type == MOUSE_ENTER || type == MOUSE_LEAVE) element.addEventListener(type, handle, false);
          else d.addEventListener(type, handle, false);
        });
      }
    }
  }


  // remove listener
  function off(element, name, context) {
    var index = Index.get(element, namespace)
      , handlers = hub[index];
    if (!name && handlers) {
      Tools.each(handlers, function(contexts, name) {
        Tools.reject(contexts, function(which) { return which === context; });
        remove(element, contexts, index, name);
      });
    } else if (events[name] && handlers) {
      Tools.remove(handlers[name], context);
      remove(element, handlers[name], index, name);
    }
  }


  // refactored helper for off(), internal use only
  function remove(element, contexts, index, name) {
    if (!contexts.length) {
      // check if we should remove touchmove from document
      if (CAPTURE_TEST.test(name) && events[TOUCH_MOVE]) {
        captured--;
        if (!captured) d.removeEventListener(TOUCH_MOVE, capture);
      }
      Tools.each(events[name], function (type) {
        if (type == MOUSE_ENTER || type == MOUSE_LEAVE) element.removeEventListener(type, handle);
        else d.removeEventListener(type, handle);
      });
      delete hub[index][name];
      // check if any other handlers available for the element
      // if not, remove the element from indices
      if (Tools.isEmpty(hub[index])) {
        delete hub[index];
        Index.remove(element, namespace);
      }
    }
  }


  // captured touchmove on document
  // find out when pointerover, pointerout, pointerenter or pointerleave happens
  function capture(e) {
    var pointer    = e.changedTouches[e.changedTouches.length - 1]
      , identifier = pointer.identifier;

    if (!pointers[identifier].lock) {
      var from = pointers[identifier].target
        , to   = d.elementFromPoint(pointer.clientX, pointer.clientY);

      if (from !== to) {
        var fromIndex = Index.get(from, namespace)
          , toIndex   = Index.get(to, namespace);

        if (hub[fromIndex] || hub[toIndex]) {
          pointers[identifier].from = from;
          pointers[identifier].to = to;
        }

        if (hub[fromIndex]) {
          Skin.trigger(from, POINTER_OUT, pointers[identifier]);
          if (hub[fromIndex][POINTER_LEAVE] && !Tools.nodeContains(from, to))
            Skin.trigger(from, POINTER_LEAVE, pointers[identifier]);
        }

        if (hub[toIndex]) {
          Skin.trigger(to, POINTER_OVER, pointers[identifier]);
          if (hub[toIndex][POINTER_ENTER] && !Tools.nodeContains(to, from))
            Skin.trigger(to, POINTER_ENTER, pointers[identifier]);
        }

        pointers[identifier].target = to;
      }
    }
  }


  // lock the pointer to an element
  function setPointerCapture(target) {
    
  }


  // unlock the pointer from an element
  function releasePointerCapture(target) {
    
  }


  // handle pointer events
  function handle(e) {
    var pointer, identifier, name, target, index, handlers;

    // touchstart, touchmove, touchend and touchcancel
    if (TOUCH_TEST.test(e.type)) {
      pointer    = e.changedTouches[e.changedTouches.length - 1];
      identifier = pointer.identifier;
      name       = events[e.type];
      target     = pointer.target;
      index      = Index.get(target, namespace);

      // create pointer model on touchstart
      if (name == POINTER_DOWN) {
        pointers[identifier] = Tools.extend({}, pointer, {
          lock: false,
          type: TOUCH,
          pointers: pointers,
          event: e
        });
      }

      pointer = pointers[identifier];
      index   = Index.get(pointer.target, namespace);
      if (hub[index]) {
        target = pointer.target;
        switch (name) {
          case POINTER_DOWN:
            // touchstart
            Skin.trigger(target, POINTER_OVER, pointer);
            Skin.trigger(target, POINTER_ENTER, pointer);
            Skin.trigger(target, POINTER_DOWN, pointer);
            break;
          case POINTER_MOVE:
            // touchmove
            Skin.trigger(target, POINTER_MOVE, pointer);
            break;
          default:
            // touchend, touchcancel
            Skin.trigger(target, POINTER_UP, pointer);
            Skin.trigger(target, POINTER_OUT, pointer);
            Skin.trigger(target, POINTER_LEAVE, pointer);
            delete pointers[identifier];
        }
      }
    }

    // if (handlers) {
    //   prevent(e);
    //   pointer = query(e);
    //   pointer.id = e.pointerId || null;
    //   pointer.lock   = setPointerCapture;
    //   pointer.unlock = releasePointerCapture;
    // 
    //   console.log(e.type);
    //   if (!captured.lock) {
    //     captured.target = target;
    //     captured.handlers = handlers;
    //   }
    // 
    //   trigger(handlers[pointer.name], target, pointer.name, pointer);
    // 
    //   // simulate pointerenter and pointerleave using pointerover and pointerout, if they are not supported
    //   if ((pointer.name == POINTER_OVER && !events[MOUSE_ENTER] && handlers[POINTER_ENTER]) &&
    //       (!e.relatedTarget || (e.relatedTarget !== captured.target && !Tools.nodeContains(captured.target, e.relatedTarget))))
    //         trigger(handlers[POINTER_ENTER], target, POINTER_ENTER, e);
    //   if ((pointer.name == POINTER_OUT && !events[MOUSE_LEAVE] && handlers[POINTER_LEAVE]) &&
    //       (!e.relatedTarget || (e.relatedTarget !== captured.target && !Tools.nodeContains(captured.target, e.relatedTarget))))
    //         trigger(handlers[POINTER_LEAVE], target, POINTER_LEAVE, e);
    // 
    // }


    // if (target === currentTarget) {
    //   // fire pointerover and pointerenter before pointerdown, on touch devices
    //   if (name == POINTER_DOWN && type == TOUCH) {
    //     trigger(handlers, target, POINTER_OVER, e);
    //     trigger(handlers, target, POINTER_ENTER, e);
    //     captured.target   = target;
    //     captured.handlers = handlers;
    //   }
    // 
    //   trigger(handlers, target, name, e);
    // 
    //   // fire pointerout and pointerleave after pointercancel or pointerup, on touch devices
    //   if (name == POINTER_CANCEL || (name == POINTER_UP && type == TOUCH)) {
    //     trigger(handlers, target, POINTER_OUT, e);
    //     trigger(handlers, target, POINTER_LEAVE, e);
    //     captured = {};
    //   }
    // }
    // 
    // // simulate pointerenter and pointerleave using pointerover and pointerout, if they are not supported
    // if ((name == POINTER_OVER && events[POINTER_OVER] == events[POINTER_ENTER]) &&
    //     (!relatedTarget || (relatedTarget !== currentTarget && !Tools.nodeContains(currentTarget, relatedTarget))))
    //       trigger(handlers, target, POINTER_ENTER, e);
    // if ((name == POINTER_OUT && events[POINTER_OUT] == events[POINTER_LEAVE]) &&
    //     (!relatedTarget || (relatedTarget !== currentTarget && !Tools.nodeContains(currentTarget, relatedTarget))))
    //       trigger(handlers, target, POINTER_LEAVE, e);

  }


  // extract useful information from event object
  function query(e) {
    var pointer = {};
    pointer.name = events[e.type];
    if (e.pointerType) switch (e.pointerType) {
      // Microsoft pointer model
      case e.MSPOINTER_TYPE_PEN:
        pointer.type = PEN;
        break;
      case e.MSPOINTER_TYPE_MOUSE:
        pointer.type = MOUSE;
        break;
      case e.MSPOINTER_TYPE_TOUCH:
        pointer.type = TOUCH;
    } else pointer.type = TOUCH_TEST.test(e.type) ? TOUCH : MOUSE;

    pointer.x = pointer.clientX = e.clientX;
    pointer.y = pointer.clientY = e.clientY;
    pointer.offsetX = e.offsetX;
    pointer.offsetY = e.offsetY;

    pointer.data   = e.data;
    return pointer;
  }




  var Pointer = Tools.extend(Skin.Responders.Pointer, { on: on, off: off });
  return Pointer;
});