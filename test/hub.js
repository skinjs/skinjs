$(document).ready(function() {

  module("Hub");

  var hub = Skin.Hub.getInstance()

  test('subscribe, unsubscribe and publish', 40, function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {}

    hub.subscribe('foo.bar', modify)
    hub.publish('foo.bar', { modified: true })
    equal(modified, true, 'simple subscription created and published, callback was invoked')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.subscribe('foo.hello', sayHi)
    hub.publish('foo.hello')
    equal(modified, 'hi', 'another simple subscription created and published, callback was invoked')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.subscribe('foo.goodbye', sayBye)
    hub.publish('foo')
    equal(modified, 'bye', 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 3, '3 callbacks were invoked')
    reset()

    hub.subscribe('foo.bar.baz', sayNo)
    hub.publish('foo.bar', { modified: 'baz says no' })
    equal(modified, false, 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.subscribe('foo.bar', modify)
    hub.publish('foo.bar', { modified: 'baz says no again' })
    equal(modified, false, 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 2, 'same callback was not invoked twice')
    reset()

    hub.subscribe('foo.bar', sayYes)
    hub.publish('foo.bar', { modified: 'baz says no again and again' })
    equal(modified, false, 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 3, 'new callback was invoked, and was overriden by sub branch callback')
    reset()

    hub.unsubscribe('foo.bar.baz')
    hub.publish('foo.bar', { modified: 'killed baz' })
    equal(modified, true, 'multiple subscribe, unsubscribe and publish, callbacks were invoked')
    equal(counter, 2, '2 remaining callbacks were invoked')
    reset()

    hub.publish(dummy, 'foo.bar', { modified: 'who is dummy?' })
    equal(modified, 'not modified', 'unknown publisher, no callbacks were invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    hub.subscribe(dummy, 'foo.bar', modify)
    hub.publish(dummy, 'foo', { modified: 'now here is the dummy' })
    equal(modified, 'now here is the dummy', 'publisher subscription and publish, callback was invoked')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.subscribe(dummy, 'foo.bar', sayHi)
    hub.publish(dummy, 'foo', { modified: 'dummy says hi' })
    equal(modified, 'hi', 'publisher subscription and publish, new callback was invoked')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.subscribe(dummy, 'foo.baz', sayBye)
    hub.publish(dummy, 'foo', { modified: 'dummy says bye' })
    equal(modified, 'bye', 'publisher subscription and publish, new callback on new branch was invoked')
    equal(counter, 3, '3 callbacks were invoked')
    reset()
    
    hub.unsubscribe(dummy, sayHi);
    hub.publish(dummy, 'foo', { modified: 'dummy does not say hi' })
    equal(modified, 'bye', 'publisher unsubscription and publish, remaining callback was invoked')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.subscribe(dummy, 'path.to.some.long.topic', modify);
    hub.publish(dummy, 'path.to.some.long.topic', { modified: 'came from a long way' })
    equal(modified, 'came from a long way', 'full message path subscribe and publish')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.publish(dummy, 'path.to.some', { modified: 'came from a...' })
    equal(modified, 'came from a...', 'partial message path publish')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.publish(dummy, 'path.to.some.wrong.topic', { modified: 'is it?!' })
    equal(modified, 'not modified', 'wrong message path published, nothing invoked')
    equal(counter, 0, '0 callbacks were invoked')
    reset()

    hub.subscribe(dummy, 'path.to.some.other.long.topic', sayYes);
    hub.publish(dummy, 'path.to.some.other.long')
    equal(modified, true, 'another full message path subscribe and publish')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.publish(dummy, 'path')
    equal(modified, true, 'another partial message path subscribe and publish')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.unsubscribe('path')
    hub.publish(dummy, 'path', { modified: 'this will get overriden' })
    equal(modified, true, 'anonymous publisher unsubscribed, this publisher still works')
    equal(counter, 2, '2 callbacks were invoked')
    reset()
 
    hub.unsubscribe(dummy, 'path.to.some.other')
    hub.publish(dummy, 'path', { modified: 'this wont get overriden' })
    equal(modified, 'this wont get overriden', 'other path unsubscribed, this path still works')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.unsubscribe(dummy)
    hub.publish(dummy, 'path', { modified: 'is there any body out there?' })
    equal(modified, 'not modified', 'all callbacks for publisher unsubscribed')
    equal(counter, 0, '0 callbacks were invoked')
    reset()

  });

});
