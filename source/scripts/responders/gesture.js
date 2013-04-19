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
    var path = Tools.indexFor(indices, element) + '.' + name;
    if (hub[path]) {
      hub[path].push(context);
    } else {
      hub[path] = [context];
      context.on(element, 'pointerdown', start);
      context.on(element, 'pointerup', end);
      context.on(element, 'pointercancel', cancel);
    }
  }

  function remove(element, name, context) {
//    if (!name.length) { clear(element, context); return; }
    var index = Tools.indexFor(indices, element)
      , path  = index + '.' + name;
    if (hub[path]) {
      Tools.remove(hub[path], context);
      if (!hub[path].length) {
        context.off(element, 'pointerdown', start);
        context.off(element, 'pointerup', end);
        context.off(element, 'pointercancel', cancel);
        delete hub[path];
        // check if any other handlers available for the element
        // if not, remove the element from indices
        var keys = Tools.keys(hub), exist;
        Tools.each(keys, function(key) { if (key.indexOf(index) === 0) { exist = true; return false; }});
        if (!exist) delete indices[index];
      }
    }
  }

  function start(event) {
    var pointers = event.changedTouches || [event]
      , source   = pointers[0].target
      , index    = Tools.indexFor(indices, source) + '.'
      , now      = Date.now()
      , delay;

    // start new gesture, if there's a new source or a big time gap
    if (source !== gesture.source || now - gesture.time > upTimeout) gesture = { source: source, time: now };

    // single touch and mouse events, press, drag, swipe
    if (pointers.length === 1) {

      if (hub[index + 'doublepress']) {
        if (!gesture.press) gesture.press = 1;
        else gesture.press++;
      }

      if (hub[index + 'controlpress']) {
        if (isControlPress(event)) trigger(hub[index + 'controlpress'], source, 'controlpress', event);
      }

      if (hub[index + 'longpress']) {
        if (!isControlPress(event)) {
          if (timeout) w.clearTimeout(timeout);
          timeout = w.setTimeout(function() {
            trigger(hub[index + 'longpress'], source, 'longpress', event);
            timeout = null;
          }, downTimeout);
        }
      }
    }
  }

  function move(event) {
  }

  function end(event) {
    var pointers = event.changedTouches || [event]
      , source   = pointers[0].target
      , index    = Tools.indexFor(indices, source) + '.'
      , now      = Date.now()
      , delay;

    if (source === gesture.source) {

      // single touch and mouse events, press, drag, swipe
      if (pointers.length === 1) {

        if (hub[index + 'press']) trigger(hub[index + 'press'], source, 'press', event);

        if (hub[index + 'doublepress']) {
          if (gesture.press === 2 && now - gesture.time < upTimeout) {
            trigger(hub[index + 'doublepress'], source, 'doublepress', event);
          }
        }

        if (hub[index + 'longpress'] && timeout) {
          w.clearTimeout(timeout);
          timeout = null;
        }

      }
    }
  }

  function cancel(event) {
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