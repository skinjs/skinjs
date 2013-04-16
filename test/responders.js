describe('Responders Module', function () {

  var Responders = Skin.Responders;

  function simulate(element, eventName) {
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    for (var name in eventMatchers) {
      if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType) throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

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
    for (var property in source)
    destination[property] = source[property];
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
    var Foo = Skin('test')
      , foo = new Foo();
    Foo.is('Eventable');

    var Bar = Skin('test')
      , bar = new Bar();
    Bar.is('Eventable');

    it('loads asynchronously', function(done) {
      foo.on(window, 'resize', function(event) {
        expect(event).to.exist;
        done();
      });

      foo.on('respond.window', function() {
        window.onresize();
        foo.off(window);
      });
    });

    it('responds to window resize and returns width and height', function() {
      foo.on(window, 'resize', function(event) {
        expect(event.width).to.equal(window.innerWidth);
        expect(event.height).to.equal(window.innerHeight);
      });

      window.onresize();
      foo.off(window);
    });

    it('can assign multiple namespaced callbacks to window resize', function() {
      var count = 0;
      function check() { count++; }
      bar.on(window, 'resize.bar', function(event) { check(); });
      foo.on(window, 'resize.foo', function(event) { check(); });

      window.onresize();
      foo.off(window);
      bar.off(window);
      expect(count).to.equal(2);
    });

    it('removes callbacks to window resize', function() {
      var count = 0;
      function check() { count++; }
      bar.on(window, 'resize.one', function(event) { check(); });
      foo.on(window, 'resize.two', function(event) { check(); });
      bar.on(window, 'resize.three', function(event) { check(); });
      foo.on(window, 'resize.four', function(event) { check(); });
      foo.off(window, 'resize.two');
      bar.off(window, 'resize.three');

      window.onresize();
      foo.off(window);
      bar.off(window);
      expect(count).to.equal(2);
    });

    it('responds to window scroll and returns x and y', function(done) {
      foo.on(window, 'scroll.namespaced', function(event) {
        expect(event.x).to.be.a('number');
        expect(event.y).to.be.a('number');
        done();
      });

      var timeout = setTimeout(function() {
        window.onscroll();
        clearTimeout(timeout);
        timeout = null;
      }, 100);
    });

  });

  describe('Pointer Responder', function() {
    Skin({ pack: { baseUrl: '../destination/scripts/' }});
    var Foo = Skin('test')
      , foo = new Foo();
    Foo.is('Eventable');

    var Bar = Skin('test')
      , bar = new Bar();
    Bar.is('Eventable');

    var element = document.createElement('div');

    var event = new CustomEvent('mousedown', { detail: { time: new Date() }, bubbles: true, cancelable: true });

    it('loads asynchronously', function(done) {
      foo.on(element, 'pointerdown', function(event) {
        expect(event).to.exist;
        done();
      });

      foo.on('respond.pointer', function() {
        simulate(element, 'mousedown');
      });
    });

  });

});