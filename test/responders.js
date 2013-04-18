describe('Responders Module', function () {

  var Responders = Skin.Responders;

  function simulate(element, eventName) {
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;
    for (var name in eventMatchers) {
      if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }
    if (!eventType) throw new SyntaxError('Only HTML and Mouse Event interfaces are supported for simulation');
    if (document.createEvent) {
      oEvent = document.createEvent(eventType);
      if (eventType == 'HTMLEvents') {
        oEvent.initEvent(eventName, options.bubbles, options.cancelable);
      } else {
        oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
          options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
          options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
      }
      element.dispatchEvent(oEvent);
    } else {
      options.clientX = options.pointerX;
      options.clientY = options.pointerY;
      var evt = document.createEventObject();
      oEvent = extend(evt, options);
      element.fireEvent('on' + eventName, oEvent);
    }
    return element;
  }

  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

  var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^((mouse|pointer|touch)(start|end|down|up|over|move|out))$/
  }

  var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  }




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
      check = false;
      component.on(element, 'pointerdown', function(event) { check = true; });

      component.once('respond.pointer', function() {
        simulate(element, 'mousedown');
        simulate(element, 'touchstart');
        simulate(element, 'pointerdown');
        component.off(element);
        expect(check).to.be.true;
        done();
      });
    });


    it('responds to pointerdown and returns pointer parameters', function(done) {
      component.once(element, 'pointerdown.namespaced', function(event) {
        expect(event).to.exist;
        done();
      });

      component.once('respond.pointer', function() {
        simulate(element, 'mousedown');
        simulate(element, 'touchstart');
        simulate(element, 'pointerdown');
      });
    });


    it('responds to pointerup and returns pointer parameters', function(done) {
      component.once(document.body, 'pointerup', function(event) {
        expect(event).to.exist;
        done();
      });

      component.once('respond.pointer', function() {
        simulate(document.body, 'mouseup');
        simulate(document.body, 'touchend');
        simulate(document.body, 'pointerup');
      });
    });


    it('responds to pointermove and returns pointer parameters', function(done) {
      component.once(element, 'pointermove', function(event) {
        expect(event).to.exist;
        done();
      });

      component.once('respond.pointer', function() {
        simulate(element, 'mousemove');
        simulate(element, 'touchmove');
        simulate(element, 'pointermove');
      });
    });


  });


});