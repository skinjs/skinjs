$(document).ready(function() {

  module('skin: events')

  var events

  test('availability', 1, function() {
    events = skin.events
    ok(events != undefined, 'skin events module is available')
  })

  test('on and trigger', 10, function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {}

    skin.on('foo', modify)
    skin.trigger('foo', { modified: true })
    equal(modified, true, 'skin on and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.on('foo.bar', sayNo)
    skin.trigger('foo', { modified: true })
    equal(modified, false, 'skin on and trigger, namespaced path, callbacks invoked')
    equal(counter, 2, '2 callbacks invoked, direct and namespaced')
    reset()

    skin.on('foo.bar', sayNo)
    skin.trigger('foo.bar')
    equal(modified, false, 'skin on and trigger, namespaced path, callbacks invoked')
    equal(counter, 1, '1 callback invoked, same handler was not bound twice')
    reset()

    skin.trigger('fo', { modified: true })
    equal(modified, 'not modified', 'skin on and trigger, trimmed path, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    skin.trigger('bar')
    equal(modified, 'not modified', 'skin on and trigger, non existing handler, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()
  })

  test('once and trigger', 12, function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {}

    skin.once('runs.once', modify)
    skin.trigger('runs', { modified: true })
    equal(modified, true, 'skin once and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    skin.trigger('runs', { modified: false })
    equal(modified, true, 'skin once and trigger, callbacks not invoked again')
    equal(counter, 1, '0 callbacks invoked')
    reset()

    skin.once('runs.once.again', modify)
    skin.trigger('runs.once.a', { modified: 'incomplete path' })
    equal(modified, 'not modified', 'skin once and trigger, trimmed path, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    skin.trigger('runs.', { modified: 'incomplete path' })
    equal(modified, 'not modified', 'skin once and trigger, trimmed path, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    skin.trigger('runs.once', { modified: 'complete path' })
    equal(modified, 'complete path', 'skin once and trigger, namespaced path, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    skin.trigger('runs.once', { modified: 'again complete path' })
    equal(modified, 'complete path', 'skin once and trigger, namespaced path, callbacks not invoked again')
    equal(counter, 1, '0 callbacks invoked')
    reset()
  })

  test('on, once, off and trigger', 54, function() {
    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {}

    skin.on('foo.bar', modify)
    skin.trigger('foo.bar', { modified: true })
    equal(modified, true, 'simple on and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.on('foo.hello', sayHi)
    skin.trigger('foo.hello')
    equal(modified, 'hi', 'another simple on and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.on('foo.goodbye', sayBye)
    skin.trigger('foo')
    equal(modified, 'bye', 'multiple on and trigger, callbacks invoked')
    equal(counter, 3, '3 callbacks invoked')
    reset()

    skin.on('foo.bar.baz', sayNo)
    skin.trigger('foo.bar', { modified: 'baz says no' })
    equal(modified, false, 'multiple on and trigger, callbacks invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.on('foo.bar', modify)
    skin.trigger('foo.bar', { modified: 'baz says no again' })
    equal(modified, false, 'multiple on and trigger, callbacks were invoked')
    equal(counter, 2, 'same callback was not invoked twice')
    reset()

    skin.on('foo.bar', sayYes)
    skin.trigger('foo.bar', { modified: 'baz says no again and again' })
    equal(modified, false, 'multiple on and trigger, callbacks invoked')
    equal(counter, 3, 'new callback invoked, and was overriden by namespaced callback')
    reset()

    skin.off('foo.bar.baz')
    skin.trigger('foo.bar', { modified: 'killed baz' })
    equal(modified, true, 'multiple on, off and trigger, callbacks invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.trigger(dummy, 'foo.bar', { modified: 'who is dummy?' })
    equal(modified, 'not modified', 'unknown emitter, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    skin.on(dummy, 'foo.bar', modify)
    skin.trigger(dummy, 'foo', { modified: 'now here is the dummy' })
    equal(modified, 'now here is the dummy', 'emitter on and trigger, callback invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.on(dummy, 'foo.bar', sayHi)
    skin.trigger(dummy, 'foo', { modified: 'dummy says hi' })
    equal(modified, 'hi', 'emitter on and trigger, new callback was invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.on(dummy, 'foo.baz', sayBye)
    skin.trigger(dummy, 'foo', { modified: 'dummy says bye' })
    equal(modified, 'bye', 'emitter on and trigger, new callback on new namespace was invoked')
    equal(counter, 3, '3 callbacks invoked')
    reset()

    skin.off(dummy, sayHi);
    skin.trigger(dummy, 'foo', { modified: 'dummy does not say hi' })
    equal(modified, 'bye', 'emitter off and trigger, remaining callbacks invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.on(dummy, 'path.to.some.long.topic', modify);
    skin.trigger(dummy, 'path.to.some.long.topic', { modified: 'came from a long way' })
    equal(modified, 'came from a long way', 'emitter, full path on and trigger')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.trigger(dummy, 'path.to.some', { modified: 'came from a...' })
    equal(modified, 'came from a...', 'emitter, partial namespaced path trigger')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.trigger(dummy, 'path.to.some.wrong.topic', { modified: 'is it?!' })
    equal(modified, 'not modified', 'non existing namespaced path trigger, nothing invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    skin.on(dummy, 'path.to.some.other.long.topic', sayYes);
    skin.trigger(dummy, 'path.to.some.other.long')
    equal(modified, true, 'another full namespaced path on and trigger')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.trigger(dummy, 'path')
    equal(modified, true, 'another partial namespaced path on and trigger')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.off('path')
    skin.trigger(dummy, 'path', { modified: 'this will get overriden' })
    equal(modified, true, 'different emitter off, existing emitter still works')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.off(dummy, 'path.to.some.other')
    skin.trigger(dummy, 'path', { modified: 'this wont get overriden' })
    equal(modified, 'this wont get overriden', 'emitter off another namespaced path, existing path still works')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.off(dummy)
    skin.trigger(dummy, 'path', { modified: 'is there any body out there?' })
    equal(modified, 'not modified', 'all callbacks for emitter removed')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    skin.once(window, 'one.time', modify)
    skin.trigger(window, 'one', { modified: 'first time, modified' })
    equal(modified, 'first time, modified', 'emitter once and trigger, callback invoked')
    equal(counter, 1, '1 callback invoked')
    skin.trigger(window, 'one', { modified: 'second time, modified' })
    equal(modified, 'first time, modified', 'emitter once and trigger, callback not invoked again')
    equal(counter, 1, '0 callbacks invoked')
    reset()

    skin.on(document, 'load', modify)
    skin.trigger(document, 'load', { modified: 'on document load' })
    equal(modified, 'on document load', 'emitter on and trigger, callback invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.once(document, 'load', modify)
    skin.trigger(document, 'load', { modified: 'once document load' })
    equal(modified, 'once document load', 'emitter once and trigger, existing on callback invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.once(document, 'load.once', sayNo)
    skin.trigger(document, 'load', { modified: 'once document load' })
    equal(modified, false, 'emitter once and trigger, namespaced path, once callback invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    skin.trigger(document, 'load', { modified: 'good old modify' })
    equal(modified, 'good old modify', 'emitter once and trigger, remaining callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    skin.off(document)
    skin.trigger(document, 'load', { modified: 'hello?!' })
    equal(modified, 'not modified', 'emitter off and trigger, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

  })

});