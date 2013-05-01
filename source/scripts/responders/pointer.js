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
    // test event type for detecting mouse events
    , MOUSE_TEST              = /^mouse/
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
      , identifier = pointer.identifier
      , model      = pointers[identifier];

    if (!model.isLocked()) {
      var from = model.target
        , to   = d.elementFromPoint(pointer.clientX, pointer.clientY);

      if (from !== to) {
        var fromIndex = Index.get(from, namespace)
          , toIndex   = Index.get(to, namespace);

        if (hub[fromIndex] || hub[toIndex]) {
          model.from = from;
          model.to = to;
        }

        if (hub[fromIndex]) {
          Skin.trigger(from, POINTER_OUT, model);
          if (hub[fromIndex][POINTER_LEAVE] && !Tools.nodeContains(from, to))
            Skin.trigger(from, POINTER_LEAVE, model);
        }

        if (hub[toIndex]) {
          Skin.trigger(to, POINTER_OVER, model);
          if (hub[toIndex][POINTER_ENTER] && !Tools.nodeContains(to, from))
            Skin.trigger(to, POINTER_ENTER, model);
        }

        model.target = to;
      }
    }
  }


  // handle pointer events
  function handle(e) {
    var pointer    = e.changedTouches ? e.changedTouches[e.changedTouches.length - 1] : e
      , identifier = pointer.identifier || pointer.pointerId || MOUSE
      , name       = events[e.type]
      , target     = pointer.target
      , model      = pointers[identifier]
      , index;

    // create pointer model if it doesn't exist
    if (!model) {

      // basic information
      model = pointers[identifier] = {
        identifier : identifier,
        pointers   : pointers,
        target     : target
      };

      // find out the pointer type
      if (e.pointerType) switch (e.pointerType) {
        // Microsoft pointer model
        case e.MSPOINTER_TYPE_PEN:
          model.type = PEN;
          break;
        case e.MSPOINTER_TYPE_MOUSE:
          model.type = MOUSE;
          break;
        case e.MSPOINTER_TYPE_TOUCH:
          model.type = TOUCH;
      } else model.type = TOUCH_TEST.test(e.type) ? TOUCH : MOUSE;

      // assign lock() and unlock() methods
      if (n.msPointerEnabled) {
        // Microsoft pointer model already has native methods for this
        model.lock     = function() { model.target.msSetPointerCapture(model.identifier); };
        model.unlock   = function() { model.target.msReleasePointerCapture(model.identifier); };
        model.isLocked = function() { return model.target.msGetPointerCapture(model.identifier) ? true : false; };
      } else {
        // simulate, isLocked() is used in capture() method, captured touchmove on document
        model.locked   = false;
        model.lock     = function() {
          model.locked = true;
          Skin.trigger(model.target, GOT_POINTER_CAPTURE, model);
        };
        model.unlock   = function() {
          model.locked = false;
          Skin.trigger(model.target, LOST_POINTER_CAPTURE, model);
        };
        model.isLocked = function() { return model.locked; };
      }

    }

    // update pointer model
    Tools.extend(model, {
      clientX: pointer.clientX,
      clientY: pointer.clientY,
      offsetX: pointer.offsetX,
      offsetY: pointer.offsetY,
      screenX: pointer.screenX,
      screenY: pointer.screenY
    });
    model.event = e;

    // set correct target for mouse
    if (MOUSE_TEST.test(e.type) && !model.isLocked()) model.target = target;

    index = Index.get(model.target, namespace);
    if (hub[index]) {

      // trigger events
      if (TOUCH_TEST.test(e.type)) {
        // touchstart, touchmove, touchend, touchcancel
        switch (name) {
          case POINTER_DOWN:
            // touchstart
            Skin.trigger(model.target, POINTER_OVER, model);
            Skin.trigger(model.target, POINTER_ENTER, model);
            Skin.trigger(model.target, POINTER_DOWN, model);
            break;
          case POINTER_MOVE:
            // touchmove
            Skin.trigger(model.target, POINTER_MOVE, model);
            break;
          default:
            // touchend, touchcancel
            if (model.isLocked()) Skin.trigger(model.target, LOST_POINTER_CAPTURE, model);
            Skin.trigger(model.target, POINTER_UP, model);
            Skin.trigger(model.target, POINTER_OUT, model);
            Skin.trigger(model.target, POINTER_LEAVE, model);
            delete pointers[identifier];
        }
      } else if (n.msPointerEnabled) {
        // Microsoft pointer model
        // MSPointerDown, MSPointerUp, MSPointerMove, MSPointerCancel,
        // MSPointerOver, MSPointerOut, MSGotPointerCapture, MSLostPointerCapture


      } else {
        // mousedown, mouseup, mousemove,
        // mouseover, mouseout, mouseenter, mouseleave

        if (model.isLocked()) {
          // locked mouse events
          if (name == POINTER_MOVE) {
            Skin.trigger(model.target, POINTER_MOVE, model);
          } else if (name == POINTER_UP) {
            Skin.trigger(model.target, LOST_POINTER_CAPTURE, model);
            Skin.trigger(model.target, POINTER_UP, model);
            delete pointers[MOUSE];
          }
        } else {
          // regular mouse events
          Skin.trigger(target, name, model);
          // simulate pointerenter and pointerleave using pointerover and pointerout, if they are not supported
          if ((name == POINTER_OVER && !events[MOUSE_ENTER]) &&
              (!e.relatedTarget || (e.relatedTarget !== target && !Tools.nodeContains(target, e.relatedTarget))))
                Skin.trigger(target, POINTER_ENTER, model);
          if ((name == POINTER_OUT && !events[MOUSE_LEAVE]) &&
              (!e.relatedTarget || (e.relatedTarget !== target && !Tools.nodeContains(target, e.relatedTarget))))
                Skin.trigger(target, POINTER_LEAVE, model);
        }
      }
    }
  }




  var Pointer = Tools.extend(Skin.Responders.Pointer, { on: on, off: off });
  return Pointer;
});