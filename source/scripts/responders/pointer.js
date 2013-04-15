// skin.js 0.1.3
// © 2013 Soheil Jadidian
// skin.js may be freely distributed under the MIT license
// http://skinjs.org

define('responders/pointer', ['skin'], function(skin) {


  // Pointer Responder Module
  // ========================
  // provides hooks for mouse, pen or touch events


  var name    = 'pointer'
    , adapter = skin.adapter
    , hub     = {}
    , indices = []
    , w = window, d = document, e = d.documentElement, b = d.body
    , isMsPointerModel = w.navigator.msPointerEnabled
    , isPointerModel   = 'onpointerdown' in w || 'onpointerup' in e
    , isTouchModel     = 'ontouchstart' in w || 'ontouchend' in e
    , test = {
        support: /^((double|long|control){0,1}press|wheel|pointer(up|down|cancel|move|over|out)|drag(start|end|over|out){0,1}|drop|pan|swipe|rotate|pinch)$/,
        start:   /(down|start)$/i,
        end:     /(up|end|cancel)$/i,
        change:  /(move)$/i
      }
    , pointer = {
        pointerdown:   isPointerModel ? 'pointerdown'   : isMsPointerModel ? 'MSPointerDown'   : isTouchModel ? 'touchstart'  : 'mousedown',
        pointerup:     isPointerModel ? 'pointerup'     : isMsPointerModel ? 'MSPointerUp'     : isTouchModel ? 'touchend'    : 'mouseup',
        pointermove:   isPointerModel ? 'pointermove'   : isMsPointerModel ? 'MSPointerMove'   : isTouchModel ? 'touchmove'   : 'mousemove',
        pointercancel: isPointerModel ? 'pointercancel' : isMsPointerModel ? 'MSPointerCancel' : isTouchModel ? 'touchcancel' : null,
        pointerover:   isPointerModel ? 'pointerover'   : isMsPointerModel ? 'MSPointerOver'   : isTouchModel ? null          : 'mouseover',
        pointerout:    isPointerModel ? 'pointerout'    : isMsPointerModel ? 'MSPointerOut'    : isTouchModel ? null          : 'mouseout'
      };

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

  function add(element, name, context, capture) {
    if (!test.support.test(name)) return;
    var index = adapter.indexFor(indices, element) + '.'
      , paths = [name];
    // find out native events to handle, based on name
    if (!/wheel|pointer/.test(name)) {
      paths.push(pointer.pointerdown, pointer.pointerup);
      if (!/press/.test(name)) paths.push(pointer.pointermove);
    }
    adapter.each(paths, function(name) {
      var path = index + name;
      if (adapter.objectHas.call(hub, path)) {
        hub[path].push(context);
      } else {
        hub[path] = [context];
        element.addEventListener(name, handle, false);
      }
    });
  }

  function remove(element, name, context) {
    if (!test.support.test(name)) return;
  }

  function handle(event) {
    var element = event.currentTarget
      , index   = adapter.indexFor(indices, element) + '.'
      , type    = event.type;

    if (adapter.objectHas.call(hub, index + type) {
      event.stopPropagation();
      skin.trigger()
    }

    if (test.start.test(type)) {
      
    } else if (test.change.test(type)) {
      
    } else if (test.end.test(type)) {
      
    }
  }

  skin.responders[name] = { add: add, remove: remove };




  return skin;
});