$(document).ready(function() {

  module('Events')

  var Events

  test('availability', 1, function() {
    Events = Skin.Events
    ok(Events != undefined, 'Events module is available')
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

    Skin.on('foo', modify)
    Skin.trigger('foo', { modified: true })
    equal(modified, true, 'Skin on and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.on('foo.bar', sayNo)
    Skin.trigger('foo', { modified: true })
    equal(modified, false, 'Skin on and trigger, namespaced path, callbacks invoked')
    equal(counter, 2, '2 callbacks invoked, direct and namespaced')
    reset()

    Skin.on('foo.bar', sayNo)
    Skin.trigger('foo.bar')
    equal(modified, false, 'Skin on and trigger, namespaced path, callbacks invoked')
    equal(counter, 1, '1 callback invoked, same handler was not bound twice')
    reset()

    Skin.trigger('fo', { modified: true })
    equal(modified, 'not modified', 'Skin on and trigger, trimmed path, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    Skin.trigger('bar')
    equal(modified, 'not modified', 'Skin on and trigger, non existing handler, callbacks not invoked')
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

    Skin.once('runs.once', modify)
    Skin.trigger('runs', { modified: true })
    equal(modified, true, 'Skin once and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    Skin.trigger('runs', { modified: false })
    equal(modified, true, 'Skin once and trigger, callbacks not invoked again')
    equal(counter, 1, '0 callbacks invoked')
    reset()

    Skin.once('runs.once.again', modify)
    Skin.trigger('runs.once.a', { modified: 'incomplete path' })
    equal(modified, 'not modified', 'Skin once and trigger, trimmed path, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    Skin.trigger('runs.', { modified: 'incomplete path' })
    equal(modified, 'not modified', 'Skin once and trigger, trimmed path, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    Skin.trigger('runs.once', { modified: 'complete path' })
    equal(modified, 'complete path', 'Skin once and trigger, namespaced path, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    Skin.trigger('runs.once', { modified: 'again complete path' })
    equal(modified, 'complete path', 'Skin once and trigger, namespaced path, callbacks not invoked again')
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

    Skin.on('foo.bar', modify)
    Skin.trigger('foo.bar', { modified: true })
    equal(modified, true, 'simple on and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.on('foo.hello', sayHi)
    Skin.trigger('foo.hello')
    equal(modified, 'hi', 'another simple on and trigger, callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.on('foo.goodbye', sayBye)
    Skin.trigger('foo')
    equal(modified, 'bye', 'multiple on and trigger, callbacks invoked')
    equal(counter, 3, '3 callbacks invoked')
    reset()

    Skin.on('foo.bar.baz', sayNo)
    Skin.trigger('foo.bar', { modified: 'baz says no' })
    equal(modified, false, 'multiple on and trigger, callbacks invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.on('foo.bar', modify)
    Skin.trigger('foo.bar', { modified: 'baz says no again' })
    equal(modified, false, 'multiple on and trigger, callbacks were invoked')
    equal(counter, 2, 'same callback was not invoked twice')
    reset()

    Skin.on('foo.bar', sayYes)
    Skin.trigger('foo.bar', { modified: 'baz says no again and again' })
    equal(modified, false, 'multiple on and trigger, callbacks invoked')
    equal(counter, 3, 'new callback invoked, and was overriden by namespaced callback')
    reset()

    Skin.off('foo.bar.baz')
    Skin.trigger('foo.bar', { modified: 'killed baz' })
    equal(modified, true, 'multiple on, off and trigger, callbacks invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.trigger(dummy, 'foo.bar', { modified: 'who is dummy?' })
    equal(modified, 'not modified', 'unknown emitter, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    Skin.on(dummy, 'foo.bar', modify)
    Skin.trigger(dummy, 'foo', { modified: 'now here is the dummy' })
    equal(modified, 'now here is the dummy', 'emitter on and trigger, callback invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.on(dummy, 'foo.bar', sayHi)
    Skin.trigger(dummy, 'foo', { modified: 'dummy says hi' })
    equal(modified, 'hi', 'emitter on and trigger, new callback was invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.on(dummy, 'foo.baz', sayBye)
    Skin.trigger(dummy, 'foo', { modified: 'dummy says bye' })
    equal(modified, 'bye', 'emitter on and trigger, new callback on new namespace was invoked')
    equal(counter, 3, '3 callbacks invoked')
    reset()

    Skin.off(dummy, sayHi);
    Skin.trigger(dummy, 'foo', { modified: 'dummy does not say hi' })
    equal(modified, 'bye', 'emitter off and trigger, remaining callbacks invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.on(dummy, 'path.to.some.long.topic', modify);
    Skin.trigger(dummy, 'path.to.some.long.topic', { modified: 'came from a long way' })
    equal(modified, 'came from a long way', 'emitter, full path on and trigger')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.trigger(dummy, 'path.to.some', { modified: 'came from a...' })
    equal(modified, 'came from a...', 'emitter, partial namespaced path trigger')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.trigger(dummy, 'path.to.some.wrong.topic', { modified: 'is it?!' })
    equal(modified, 'not modified', 'non existing namespaced path trigger, nothing invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    Skin.on(dummy, 'path.to.some.other.long.topic', sayYes);
    Skin.trigger(dummy, 'path.to.some.other.long')
    equal(modified, true, 'another full namespaced path on and trigger')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.trigger(dummy, 'path')
    equal(modified, true, 'another partial namespaced path on and trigger')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.off('path')
    Skin.trigger(dummy, 'path', { modified: 'this will get overriden' })
    equal(modified, true, 'different emitter off, existing emitter still works')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.off(dummy, 'path.to.some.other')
    Skin.trigger(dummy, 'path', { modified: 'this wont get overriden' })
    equal(modified, 'this wont get overriden', 'emitter off another namespaced path, existing path still works')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.off(dummy)
    Skin.trigger(dummy, 'path', { modified: 'is there any body out there?' })
    equal(modified, 'not modified', 'all callbacks for emitter removed')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    Skin.once(window, 'one.time', modify)
    Skin.trigger(window, 'one', { modified: 'first time, modified' })
    equal(modified, 'first time, modified', 'emitter once and trigger, callback invoked')
    equal(counter, 1, '1 callback invoked')
    Skin.trigger(window, 'one', { modified: 'second time, modified' })
    equal(modified, 'first time, modified', 'emitter once and trigger, callback not invoked again')
    equal(counter, 1, '0 callbacks invoked')
    reset()

    Skin.on(document, 'load', modify)
    Skin.trigger(document, 'load', { modified: 'on document load' })
    equal(modified, 'on document load', 'emitter on and trigger, callback invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.once(document, 'load', modify)
    Skin.trigger(document, 'load', { modified: 'once document load' })
    equal(modified, 'once document load', 'emitter once and trigger, existing on callback invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.once(document, 'load.once', sayNo)
    Skin.trigger(document, 'load', { modified: 'once document load' })
    equal(modified, false, 'emitter once and trigger, namespaced path, once callback invoked')
    equal(counter, 2, '2 callbacks invoked')
    reset()

    Skin.trigger(document, 'load', { modified: 'good old modify' })
    equal(modified, 'good old modify', 'emitter once and trigger, remaining callbacks invoked')
    equal(counter, 1, '1 callback invoked')
    reset()

    Skin.off(document)
    Skin.trigger(document, 'load', { modified: 'hello?!' })
    equal(modified, 'not modified', 'emitter off and trigger, callbacks not invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

  })

});