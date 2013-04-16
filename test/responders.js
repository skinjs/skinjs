describe('Responders Module', function () {

  var Responders = Skin.Responders;

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

      foo.on('load.responders.window', function() {
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
      bar.on(window, 'resize.one', function(event) {
        check();
      });
      foo.on(window, 'resize.two', function(event) {
        check();
      });
      bar.on(window, 'resize.three', function(event) {
        check();
      });
      foo.on(window, 'resize.four', function(event) {
        check();
      });
      foo.off(window, 'resize.two');
      bar.off(window, 'resize.three');

      window.onresize();
      foo.off(window);
      bar.off(window);
      expect(count).to.equal(2);
    });

  });

});