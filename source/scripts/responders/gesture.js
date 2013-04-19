// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/gesture', ['skin'], function(Skin) {

  // Gesture Responder Module
  // ========================
  // hooks for mouse, pen or touch events
  // supports press, doublepress, longpress, controlpress,
  //          drag, dragstart, dragover, dragout, dragenter, dragleave, dragend, drop,
  //          swipestart, swipe, swipeend
  //          panstart, pan, panend
  //          rotatestart, rotate, rotateend
  //          pinchstart, pinch, pinchend

  var w = window, Tools = Skin.Tools, hub = {}, indices = [], upTimeout = 500, downTimeout = 1000, timeout = null, gesture = {}
    , POINTER_DOWN   = 'pointerdown'
    , POINTER_UP     = 'pointerup'
    , POINTER_MOVE   = 'pointermove'
    , POINTER_CANCEL = 'pointercancel'
    , POINTER_OVER   = 'pointerover'
    , POINTER_OUT    = 'pointerout'
    , POINTER_ENTER  = 'pointerenter'
    , POINTER_LEAVE  = 'pointerleave'

    , PRESS          = 'press'
    , DOUBLE_PRESS   = 'doublepress'
    , LONG_PRESS     = 'longpress'
    , CONTROL_PRESS  = 'controlpress'

    , DRAG           = 'drag'
    , DRAG_START     = 'dragstart'
    , DRAG_OVER      = 'dragover'
    , DRAG_OUT       = 'dragout'
    , DRAG_ENTER     = 'dragenter'
    , DRAG_LEAVE     = 'dragleave'
    , DRAG_END       = 'dragend'
    , DROP           = 'drop'

    , SWIPE          = 'swipe'
    , SWIPE_START    = 'swipestart'
    , SWIPE_END      = 'swipeend'

    , PAN            = 'pan'
    , PAN_START      = 'panstart'
    , PAN_END        = 'panend'

    , ROTATE         = 'rotate'
    , ROTATE_START   = 'rotatestart'
    , ROTATE_END     = 'rotateend'

    , PINCH          = 'pinch'
    , PINCH_START    = 'pinchstart'
    , PINCH_END      = 'pinchend';

  function add(element, name, context) {
    var index = Tools.indexFor(indices, element)
      , path  = hub[index] || (hub[index] = {});
    if (path[name]) {
      path[name].push(context);
    } else {
      path[name] = [context];
      context.on(element, 'pointerdown', start);
      context.on(element, 'pointerup', end);
      context.on(element, 'pointercancel', cancel);
      if (name == 'dragenter') context.on(element, 'pointerenter', enter);
      else if (name == 'dragleave') context.on(element, 'pointerleave', leave);
      else if (name == 'dragover') context.on(element, 'pointerenter', over);
      else if (name == 'dragout') context.on(element, 'pointerenter', out);
      else if (!/press$/.test(name)) context.on(element, 'pointermove', move);
    }
  }

  function remove(element, name, context) {
//    if (!name.length) { clear(element, context); return; }
    var index = Tools.indexFor(indices, element)
      , path  = hub[index][name];
    if (path[name]) {
      Tools.remove(path[name], context);
      if (!path[name].length) {
        context.off(element, 'pointerdown', start);
        context.off(element, 'pointerup', end);
        context.off(element, 'pointercancel', cancel);
        if (name == 'dragenter') context.off(element, 'pointerenter', enter);
        else if (name == 'dragleave') context.off(element, 'pointerleave', leave);
        else if (name == 'dragover') context.off(element, 'pointerenter', over);
        else if (name == 'dragout') context.off(element, 'pointerenter', out);
        else if (!/press$/.test(name)) context.off(element, 'pointermove', move);
        delete path[name];
        // check if any other handlers available for the element
        // if not, remove the element from indices
        if (Tools.isEmpty(path)) {
          delete hub[index];
          delete indices[index];
        }
      }
    }
  }

  function start(event) {
    var pointers = event.changedTouches || [event]
      , source   = pointers[0].target
      , index    = Tools.indexFor(indices, source)
      , path     = hub[index]
      , now      = Date.now()
      , delay;

    // start new gesture, if there's a new source or a big time gap
    if (source !== gesture.source || now - gesture.time > upTimeout) gesture = { source: source, time: now };

    // single touch and mouse events, press, drag, swipe
    if (pointers.length === 1) {

      if (path[DOUBLE_PRESS]) {
        if (!gesture.presses) gesture.presses = 1;
        else gesture.presses++;
      }

      if (path[CONTROL_PRESS]) {
        if (isControlPress(event)) trigger(path[CONTROL_PRESS], source, CONTROL_PRESS, event);
      }

      if (path[LONG_PRESS]) {
        if (!isControlPress(event)) {
          if (timeout) w.clearTimeout(timeout);
          timeout = w.setTimeout(function() {
            trigger(path[LONG_PRESS], source, LONG_PRESS, event);
            timeout = null;
          }, downTimeout);
        }
      }
    }
  }

  function end(event) {
    var pointers = event.changedTouches || [event]
      , source   = pointers[0].target
      , index    = Tools.indexFor(indices, source)
      , path     = hub[index]
      , now      = Date.now()
      , delay;

    if (source === gesture.source) {

      // single touch and mouse events, press, drag, swipe
      if (pointers.length === 1) {

        if (path[PRESS]) trigger(path[PRESS], source, PRESS, event);

        if (path[DOUBLE_PRESS]) {
          if (gesture.presses === 2 && now - gesture.time < upTimeout) {
            trigger(path[DOUBLE_PRESS], source, DOUBLE_PRESS, event);
          }
        }

        if (path[LONG_PRESS] && timeout) {
          w.clearTimeout(timeout);
          timeout = null;
        }
      }
    }
  }

  function enter(event) {
    
  }

  function leave(event) {
    
  }

  function over(event) {
  }

  function out(event) {
  }

  function move(event) {
  }

  function cancel(event) {
    gesture = {};
  }

  // trigger all listening contexts
  function trigger(contexts, source, name, event) {
    Tools.each(contexts, function(context) { context.trigger(source, name, event); });
  }

  // define control press, right-click, control-click
  function isControlPress(event) {
    return event.ctrlKey ? true
         : event.which ? event.which == 3
         : event.button ? event.button == 2
         : false;
  }




  var Gesture = Tools.extend(Skin.Responders.Gesture, { add: add, remove: remove });
  return Gesture;
});