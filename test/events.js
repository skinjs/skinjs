describe('Events Module', function () {

  var Events = Skin.Events;

  it('is available', function (){
    expect(Events).to.exist;
  });

  describe('On & Trigger', function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {};

    it('invokes callback on simple event', function() {
      Skin.on('foo', modify);
      Skin.trigger('foo', { modified: true });
      expect(modified).to.be.true;
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes all callbacks on namespaced event', function() {
      Skin.on('foo.bar', sayNo);
      Skin.trigger('foo', { modified: true });
      expect(modified).to.be.false;
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes only namespaced callback on namespaced event', function() {
      Skin.trigger('foo.bar');
      expect(modified).to.be.false;
      expect(counter).to.equal(1);
      reset();
    });

    it('does not invoke callbacks on trimmed event name', function() {
      Skin.trigger('fo', { modified: true });
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
      reset();
    });

    it('does not invoke callbacks on wrong event name', function() {
      Skin.trigger('bar');
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
      reset();
    });

  });

  describe('Once & Trigger', function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {};


    it('invokes callback once on namespaced event', function() {
      Skin.once('runs.once', modify);
      Skin.trigger('runs', { modified: true });
      expect(modified).to.be.true;
      expect(counter).to.equal(1);
    });

    it('does not invoke callback again on namespaced event', function() {
      Skin.trigger('runs', { modified: false });
      expect(modified).to.be.true;
      expect(counter).to.equal(1);
      reset();
    });

    it('does not invoke callback on trimmed namespaced event', function() {
      Skin.once('runs.once.again', modify);
      Skin.trigger('runs.once.a', { modified: 'incomplete path' });
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
    });

    it('invokes callback on correct namespaced event', function() {
      Skin.trigger('runs.once', { modified: 'complete path' });
      expect(modified).to.equal('complete path');
      expect(counter).to.equal(1);
    });

    it('does not invoke callback again after it was invoked', function() {
      Skin.trigger('runs.once', { modified: 'again complete path' })
      expect(modified).to.equal('complete path');
      expect(counter).to.equal(1);
      reset();
    });

  });

  describe('On, Once, Off & Trigger', function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {};

    it('invokes callbacks on simple event', function() {
      Skin.on('foo.bar', modify);
      Skin.trigger('foo.bar', { modified: true });
      expect(modified).to.be.true;
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes callbacks on other event', function() {
      Skin.on('foo.hello', sayHi);
      Skin.trigger('foo.hello');
      expect(modified).to.equal('hi');
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes multiple callbacks on namespaced event', function() {
      Skin.on('foo.goodbye', sayBye);
      Skin.trigger('foo');
      expect(modified).to.equal('bye');
      expect(counter).to.equal(3);
      reset();
    });

    it('invokes multiple callbacks on other namespaced event', function() {
      Skin.on('foo.bar.baz', sayNo);
      Skin.trigger('foo.bar', { modified: 'baz says no' });
      expect(modified).to.be.false;
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes namespaced callbacks after simple ones', function() {
      Skin.on('foo.bar', modify);
      Skin.trigger('foo.bar', { modified: 'baz says no again' });
      expect(modified).to.be.false;
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes namespaced callbacks after simple ones again', function() {
      Skin.on('foo.bar', sayYes);
      Skin.trigger('foo.bar', { modified: 'baz says no again and again' });
      expect(modified).to.be.false;
      expect(counter).to.equal(3);
      reset();
    });

    it('does not invoke callbacks after calling off', function() {
      Skin.off('foo.bar.baz');
      Skin.trigger('foo.bar', { modified: 'killed baz' });
      expect(modified).to.be.true;
      expect(counter).to.equal(2);
      reset();
    });

    it('does not invoke callbacks for unknown emitter', function() {
      Skin.trigger(dummy, 'foo.bar', { modified: 'who is dummy?' });
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
      reset();
    });

    it('invokes callbacks for known emitter', function() {
      Skin.on(dummy, 'foo.bar', modify);
      Skin.trigger(dummy, 'foo', { modified: 'now here is the dummy' });
      expect(modified).to.equal('now here is the dummy');
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes namespaced callbacks for known emitter', function() {
      Skin.on(dummy, 'foo.bar', sayHi);
      Skin.trigger(dummy, 'foo', { modified: 'dummy says hi' });
      expect(modified).to.equal('hi');
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes other namespaced callbacks for known emitter', function() {
      Skin.on(dummy, 'foo.baz', sayBye);
      Skin.trigger(dummy, 'foo', { modified: 'dummy says bye' });
      expect(modified).to.equal('bye');
      expect(counter).to.equal(3);
      reset();
    });

    it('invokes remaining callbacks after off is called for one', function() {
      Skin.off(dummy, sayHi);
      Skin.trigger(dummy, 'foo', { modified: 'dummy does not say hi' });
      expect(modified).to.equal('bye');
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes callbacks on emitter and very long namespace', function() {
      Skin.on(dummy, 'path.to.some.long.topic', modify);
      Skin.trigger(dummy, 'path.to.some.long.topic', { modified: 'came from a long way' });
      expect(modified).to.equal('came from a long way');
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes callbacks on emitter and part of a very long namespace', function() {
      Skin.trigger(dummy, 'path.to.some', { modified: 'came from a...' });
      expect(modified).to.equal('came from a...');
      expect(counter).to.equal(1);
      reset();
    });

    it('does not invoke callbacks on different namespace', function() {
      Skin.trigger(dummy, 'path.to.some.wrong.topic', { modified: 'is it?!' });
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
      reset();
    });

    it('invokes callbacks on other long namespace', function() {
      Skin.on(dummy, 'path.to.some.other.long.topic', sayYes);
      Skin.trigger(dummy, 'path.to.some.other.long');
      expect(modified).to.be.true;
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes callbacks on a part of other long namespace', function() {
      Skin.trigger(dummy, 'path');
      expect(modified).to.be.true;
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes remaining callbacks after an emitter is off', function() {
      Skin.off('path');
      Skin.trigger(dummy, 'path', { modified: 'this will get overriden' });
      expect(modified).to.be.true;
      expect(counter).to.equal(2);
      reset();
    });

    it('invokes remaining callbacks after a namespace is off', function() {
      Skin.off(dummy, 'path.to.some.other');
      Skin.trigger(dummy, 'path', { modified: 'this wont get overriden' });
      expect(modified).to.equal('this wont get overriden');
      expect(counter).to.equal(1);
      reset();
    });

    it('does not invoke callbacks after emitter is off', function() {
      Skin.off(dummy);
      Skin.trigger(dummy, 'path', { modified: 'is there any body out there?' });
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
      reset();
    });

    it('invokes callbacks once, on window', function() {
      Skin.once(window, 'one.time', modify);
      Skin.trigger(window, 'one', { modified: 'first time, modified' });
      expect(modified).to.equal('first time, modified');
      expect(counter).to.equal(1);
    });

    it('does not invoke callbacks again after once', function() {
      Skin.trigger(window, 'one', { modified: 'second time, modified' });
      expect(modified).to.equal('first time, modified');
      expect(counter).to.equal(1);
      reset();
    });

    it('invokes callbacks on DOM elements', function() {
      Skin.on(document, 'load', modify);
      Skin.trigger(document, 'load', { modified: 'on document load' });
      expect(modified).to.equal('on document load');
      expect(counter).to.equal(1);
      reset();
    });

    it('does not duplicate same callbacks after on and once', function() {
      Skin.once(document, 'load', modify);
      Skin.trigger(document, 'load', { modified: 'once document load' });
      expect(modified).to.equal('once document load');
      expect(counter).to.equal(1);
      reset();
    });

    it('duplicates callbacks on different namespaces', function() {
      Skin.once(document, 'load.once', sayNo);
      Skin.trigger(document, 'load', { modified: 'once document load' });
      expect(modified).to.be.false;
      expect(counter).to.equal(2);
      reset();
    });

    it('does not invoke callback which was assigned once but invokes others', function() {
      Skin.trigger(document, 'load', { modified: 'good old modify' });
      expect(modified).to.equal('good old modify');
      expect(counter).to.equal(1);
      reset();
    });

    it('does not invoke callbacks after emitter is off', function() {
      Skin.off(document);
      Skin.trigger(document, 'load', { modified: 'hello?!' });
      expect(modified).to.equal('not modified');
      expect(counter).to.equal(0);
      reset();
    });

  });

});