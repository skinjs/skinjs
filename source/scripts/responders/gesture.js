// Skin.js 0.1.4
// © 2013 Soheil Jadidian
// Skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/gesture', ['responders/pointer', 'skin'], function(Pointer, Skin) {

  // Gesture Responder Module
  // ========================
  // hooks for mouse, pen or touch events
  // supports press, doublepress, longpress, controlpress,
  //          drag, dragstart, dragover, dragout, dragend, drop,
  //          swipestart, swipe, swipeend
  //          panstart, pan, panend
  //          rotatestart, rotate, rotateend
  //          pinchstart, pinch, pinchend

  var w = window, Tools = Skin.Tools, hub = {}, indices = [], upTimeout = 500, downTimeout = 1000, timeout = null, gesture = {};

  // prevent default browser actions
  function prevent(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.preventManipulation) event.preventManipulation();
    if (event.preventMouseEvent) event.preventMouseEvent();
  }

  function add(element, name, context) {
    var path = Tools.indexFor(indices, element) + '.' + name;
    if (hub[path]) {
      hub[path].push(context);
    } else {
      hub[path] = [context];
      Pointer.add(element, 'pointerdown', this, down);
      Pointer.add(element, 'pointerup', this, up);
      Pointer.add(element, 'pointercancel', this, cancel);
      if (!/press$/.test(name)) {
        Pointer.add(element, 'pointermove', this, move);
      }
    }
  }

  function remove(element, name, context) {
    // special case, when there's no name it means
    // all handlers for the specified context should be removed
    // this is when something like context.off(element) was used
    if (!name.length) {
      Tools.each(hub, function(contexts, path) {
        Tools.reject(contexts, function(which) { return which === context; });
        if (!contexts.length) {
          Pointer.remove(element, 'pointerdown', this, down);
          Pointer.remove(element, 'pointerup', this, up);
          Pointer.remove(element, 'pointercancel', this, cancel);
          if (!/press$/.test(path)) {
            Pointer.remove(element, 'pointermove', this, move);
          }
          delete hub[path];
        }
      });
      return;
    }

    // normal case, name is specified
    var path = Tools.indexFor(indices, element) + '.' + name;
    if (hub[path]) {
      Tools.remove(hub[path], context);
      if (!hub[path].length) {
        Pointer.remove(element, 'pointerdown', this, down);
        Pointer.remove(element, 'pointerup', this, up);
        Pointer.remove(element, 'pointercancel', this, cancel);
        if (!/press$/.test(name)) {
          Pointer.remove(element, 'pointermove', this, move);
        }
        delete hub[path];
      }
    }

  }

  function down(event) {
    event.stopPropagation();

    var pointers = event.touches || [event]
      , element  = pointers[0].target
      , index    = Tools.indexFor(indices, element) + '.';

    if (element !== gesture.element) gesture = { element: element };

    // single touch and mouse events, press, drag, pan, swipe
    if (pointers.length === 1) {

      if (hub[index + 'doublepress']) {
        gesture.time = Date.now();
        if (!gesture.count) gesture.count = 1;
        else gesture.count++;
      }
      if (hub[index + 'controlpress']) {
        prevent(event);
        gesture.control = event.which ? event.which == 3
                        : event.button ? event.button == 2
                        : (event.ctrlKey || event.altKey) ? true
                        : false;
      }
      if (hub[index + 'longpress']) {
        if (timeout) w.clearTimeout(timeout);
        timeout = w.setTimeout(function() {
          Tools.each(hub[index + 'longpress'], function(context) { context.trigger(element, 'longpress', {}); });
          timeout = null;
        }, downTimeout);
      }
    }
  }

  function move(event) {
  }

  function up(event) {
    event.stopPropagation();

    var pointers = event.touches || [event]
      , element  = pointers[0].target
      , index    = Tools.indexFor(indices, element) + '.';

    if (element === gesture.element) {

      // single touch and mouse events, press, drag, pan, swipe
      if (pointers.length === 1) {

        if (hub[index + 'press']) {
          Tools.each(hub[index + 'press'], function(context) { context.trigger(element, 'press', {}); });
        }
        if (hub[index + 'doublepress']) {
          if (gesture.count === 2 && Date.now() - gesture.time < upTimeout) {
            Tools.each(hub[index + 'doublepress'], function(context) { context.trigger(element, 'doublepress', {}); });
            gesture = {};
          }
        }
        if (hub[index + 'controlpress']) {
          if (gesture.control) {
            var control = event.which ? event.which == 3
                        : event.button ? event.button == 2
                        : (event.ctrlKey || event.altKey) ? true
                        : false;
            if (control) Tools.each(hub[index + 'controlpress'], function(context) { context.trigger(element, 'controlpress', {}); });
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


  var Gesture = Skin.Responders.Gesture = { add: add, remove: remove };
  return Gesture;
});