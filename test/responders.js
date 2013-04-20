describe('Responders Module', function () {

  var isSupported = function(type) {
    var element = document.createElement('div'), flag;
    type = 'on' + type;
    flag = (type in element);
    if (!flag) {
      element.setAttribute(type, 'return;');
      flag = typeof element[type] === 'function';
    }
    element = null;
    return flag;
  }

  var events = {}, tests = {};
  tests['pointerdown']   = ['touchstart', 'MSPointerDown', 'mousedown'];
  tests['pointerup']     = ['touchend', 'MSPointerUp', 'mouseup'];
  tests['pointermove']   = ['touchmove', 'MSPointerMove', 'mousemove'];
  tests['pointercancel'] = ['touchcancel', 'MSPointerCancel'];
  tests['pointerover']   = ['mouseenter', 'mouseover'];
  tests['pointerout']    = ['mouseleave', 'mouseout'];
  tests['pointerenter']  = ['mouseover'];
  tests['pointerleave']  = ['mouseout'];

  for (var name in tests) {
    if (isSupported(name)) events[name] = name;
    else {
      events[name] = null;
      for (var count in tests[name]) {
        var type = tests[name][count];
        if (isSupported(type)) {
          events[name] = type;
          events[type] = name;
          break;
        }
      }
    }
  }
  tests = isSupported = null;

  function simulate(element, type) {
    var model = /iPhone|iP[oa]d/.test(navigator.userAgent) ? 'Apple'
              : /Android|Chrome|Phantom/.test(navigator.userAgent) ? 'Android'
              : 'PC';
    var options = extend(defaults, arguments[2] || {});
    var event, eventType = null;
    for (var name in eventTypes) if (eventTypes[name].test(type)) { eventType = name; break; }
    if (eventType) {
      if (document.createEvent) {
        event = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
          event.initEvent(type, options.bubbles, options.cancelable);
        } else if (eventType == 'MouseEvents') {
          event.initMouseEvent(
            type,
            options.bubbles,
            options.cancelable,
            options.view,
            options.button,
            options.screenX,
            options.screenY,
            options.clientX,
            options.clientY,
            options.ctrlKey,
            options.altKey,
            options.shiftKey,
            options.metaKey,
            options.button,
            element
          );
        } else if (eventType == 'TouchEvent') {
          if (model === 'Android') {
            event.initTouchEvent(
              options.touchItem,
              options.touchItem,
              options.touchItem,
              type,
              options.view,
              options.screenX,
              options.screenY,
              options.clientX,
              options.clientY,
              options.ctrlKey,
              options.altKey,
              options.shiftKey,
              options.metaKey
            );
          } else if (model === 'Apple') {
            event.initTouchEvent(
              type,
              options.bubbles,
              options.cancelable,
              options.view,
              options.detail,
              options.screenX,
              options.screenY,
              options.clientX,
              options.clientY,
              options.ctrlKey,
              options.altKey,
              options.shiftKey,
              options.metaKey,
              options.touches,
              options.targetTouches,
              options.changedTouches,
              options.scale,
              options.rotation
            );
          }
        }
        element.dispatchEvent(event);
      } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var event = document.createEventObject();
        extend(event, options);
        element.fireEvent('on' + type, event);
      }
    }
    return element;
  }

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  var eventTypes = {
    'HTMLEvents': /^(load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^mouse(down|up|move|over|out|enter|leave)$/,
    'TouchEvent': /^touch(start|end|move|cancel)$/
  }

  var defaults = {
    view: document.defaultView || window,
    clientX: 0,
    clientY: 0,
    screenX: 0,
    screenY: 0,

    button: 0,
    which: 0,
    detail: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,

    bubbles: true,
    cancelable: true,

    scale: 1,
    rotation: 0,

    touchItem: 0,
    touches: 0,
    targetTouches: 0,
    changedTouches: 0
  };




  var Responders = Skin.Responders;




  it('is available', function (){
    expect(Responders).to.exist;
  });




  describe('Window Responder', function() {


    Skin({ pack: { baseUrl: '../destination/scripts/' }});


    it('loads asynchronously', function(done) {
      Skin.on(window, 'resize', function(event) {
        expect(event).to.exist;
        done();
      });

      Skin.once('respond.window', function() {
        simulate(window, 'resize');
        Skin.off(window);
      });
    });


    it('responds to window resize and returns width and height', function(done) {
      Skin.on(window, 'resize', function(event) {
        expect(event.width).to.equal(window.innerWidth);
        expect(event.height).to.equal(window.innerHeight);
        done();
      });

      Skin.once('respond.window', function() {
        simulate(window, 'resize');
        Skin.off(window);
      });
    });


    it('assigns multiple namespaced callbacks to window resize', function(done) {
      var count = 0;
      function check() { count++; }

      Skin.once(window, 'resize.bar', function(event) { check(); });
      Skin.once(window, 'resize.foo', function(event) { check(); });

      Skin.once('respond.window', function() {
        simulate(window, 'resize');
        expect(count).to.equal(2);
        done();
      });
    });


    it('removes callbacks to window resize', function(done) {
      var count = 0;
      function check() { count++; }

      Skin.once(window, 'resize.one', function(event) { check(); });
      Skin.once(window, 'resize.two', function(event) { check(); });
      Skin.once(window, 'resize.three', function(event) { check(); });
      Skin.once(window, 'resize.four', function(event) { check(); });
      Skin.off(window, 'resize.two');
      Skin.off(window, 'resize.three');

      Skin.once('respond.window', function() {
        simulate(window, 'resize');
        expect(count).to.equal(2);
        done();
      });
    });


    it('responds to window scroll and returns x and y', function(done) {
      Skin.once(window, 'scroll.namespaced', function(event) {
        expect(event.x).to.be.a('number');
        expect(event.y).to.be.a('number');
        done();
      });

      Skin.once('respond.window', function() {
        simulate(window, 'scroll');
      });
    });


  });


  describe('Pointer Responder', function() {


    Skin({ pack: { baseUrl: '../destination/scripts/' }});
    var Component = Skin('test'), component = new Component();
    Component.is('Eventable');
    var element = document.createElement('div');


    it('loads asynchronously', function(done) {
      component.on(element, 'pointerdown', function() {});

      component.once('respond.pointer', function() {
        done();
      });
    });


    it('maps pointerdown to ' + events.pointerdown + ', and returns event parameters', function(done) {
      component.once(element, 'pointerdown.namespaced', function(event) {
        expect(event).to.exist;
        done();
      });

      component.once('respond.pointer', function() {
        simulate(element, events.pointerdown);
      });
    });


    it('maps pointerup to ' + events.pointerup + ', and returns event parameters', function(done) {
      component.once(document.body, 'pointerup', function(event) {
        expect(event).to.exist;
        done();
      });

      component.once('respond.pointer', function() {
        simulate(document.body, events.pointerup);
      });
    });


    it('maps pointermove to ' + events.pointermove + ', and returns event parameters', function(done) {
      component.once(element, 'pointermove', function(event) {
        expect(event).to.exist;
        done();
      });

      component.once('respond.pointer', function() {
        simulate(element, events.pointermove);
      });
    });


    if (events.pointercancel) {
      it('maps pointercancel to ' + events.pointercancel, function(done) {
        component.once(element, 'pointercancel', function() { done(); });

        component.once('respond.pointer', function() {
          simulate(element, events.pointercancel);
        });
      });
    }

  });


});