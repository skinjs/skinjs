$(document).ready(function() {

  module('Hub')

  var hub
    , a = { foo: 'bar', array: [1, 2, 3], flag: true }
    , b = { object: a, x: 1, y: 2, z: false }

  test('availability', 1, function() {
    hub = skin.Hub.getInstance()
    ok(hub != undefined, 'skin hub is available')
  })

  test('get data', 6, function() {
    hub = skin.Hub.getInstance()
    equal(hub.get(b.object), a, 'got data by pointer')
    equal(hub.get(b, 'y'), 2, 'got data by pointer and string index')
    equal(hub.get(b, 'object.array'), a.array, 'got data by pointer and string index')
    equal(hub.get(b, 'object', 'array'), a.array, 'got data by pointer and arguments index')
    equal(hub.get(b, ['object', 'array']), a.array, 'got data by pointer and array index')
    equal(hub.get(b.object, 'foo'), 'bar', 'got data by pointer and string index')
  })

  test('set data', 6, function() {
    hub = skin.Hub.getInstance()
    hub.set(b, 'x', 2);
    equal(b.x, 2, 'set data by pointer and index')

    hub.set(b, 'foo.bar', { a: [1, 2, 3] });
    equal(hub.get(b.foo, 'bar.a')[1], 2, 'set data by pointer and string index')

    hub.set(b.foo, ['boo', 'zoo'], { message: 'hello' });
    equal(hub.get(b.foo, ['boo', 'zoo', 'message']), 'hello', 'set data by pointer and array index')

    hub.set(a, 'b.c.d', { e: { f: 'g' }});
    equal(hub.get(a, 'b-c-d-e-f'), 'g', 'set and got data by pointer and string index')

    hub.set(b, 'newData');
    ok(hub.get(b, 'newData') instanceof Object, 'new empty data object was set under root')

    var someData  = { foo: 'bar', boo: 'baz' }
      , otherData = { someData: someData }
    hub.set(b, 'someKey', 'someOtherKey', otherData)
    equal(hub.get(b, 'someKey', 'someOtherKey', 'someData', 'foo'), 'bar', 'mixed access')
  })

  test('based data', 3, function() {
    // assuming that 'base' is the key for base object
    var someData  = { foo: 'bar', boo: 'baz' }
      , basedData = { base: someData }
    hub = skin.Hub.getInstance()
    hub.set(b, 'myBasedData', basedData)
    equal(hub.get(b.myBasedData, 'boo'), 'baz', 'access to based on reference data')
    hub.set(b, 'myBasedData', 'foo', false)
    equal(hub.get(b.myBasedData, 'foo'), false, 'modify a value in based on reference data')
    equal(someData.foo, 'bar', 'base data was not modified')
  })

  test('remove, non existing data', 2, function() {
    var data = {}
    hub = skin.Hub.getInstance()
    hub.set(data, 'a.b.c', { d: { e: 'f' }})
    equal(hub.get(data, 'a.b.z'), null, 'null returned for non existing index')
    hub.set(data, ['a', 'b'], undefined)
    ok(!hub.get(data, 'a').hasOwnProperty('b'), 'setting undefined removes the index')
  })

  test('match data', 52, function() {
    var func  = function() {}
      , sub   = { w: { a: 1, b: 2 }, x: true, y: false, z: func }
      , root  = { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: sub, f: false }
      , array = [1, 2, root, true, { a: 2, b: 3 }]

    hub = skin.Hub.getInstance()

    ok(hub.match(1, 1), 'numeric match')
    ok(!hub.match(1, 2), 'numeric mismatch')

    ok(!hub.match(1, true), 'numeric and true boolean mismatch')
    ok(!hub.match(0, false), 'numeric and false boolean mismatch')

    ok(!hub.match(undefined, null), 'undefined target, null condition mismatch')
    ok(hub.match(null, undefined), 'null target, undefined condition match')

    ok(hub.match(null, null), 'null target, null condition match')
    ok(!hub.match(undefined, undefined), 'undefined target, undefined condition mismatch')

    ok(hub.match('undefined', undefined), 'string target, undefined condition match')
    ok(!hub.match('null', null), 'string target, null condition mismatch')

    ok(hub.match('hello', 'hello'), 'string match')
    ok(!hub.match('hello', 'goodbye'), 'string mismatch')

    ok(hub.match('hello', '*'), 'wild card match string')
    ok(hub.match(0, '*'), 'wild card match number')
    ok(hub.match(false, '*'), 'wild card match false')
    ok(hub.match(true, '*'), 'wild card match true')
    ok(hub.match(null, '*'), 'wild card match null')
    ok(!hub.match(undefined, '*'), 'wild card mismatch undefined')

    ok(hub.match('hello', function(value) { return value.length == 5 }), 'function match string')
    ok(!hub.match('hello', function(value) { return value == 'goodbye' }), 'function mismatch string')

    ok(hub.match(root, { a: 1 }), 'simple object match')
    ok(!hub.match(root, { a: 2 }), 'simple object mismatch')

    ok(hub.match(root, { a: 1, b: 2 }), 'objects all match for any conditions')
    ok(hub.match(root, { a: 1, b: 1, s: 3, e: false }), 'objects any match for any conditions')
    ok(!hub.match(root, { a: 0, b: 1, s: 3, e: false }), 'objects all mismatch for any conditions')

    ok(hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}}, false), 'objects all match for all conditions')
    ok(!hub.match(root, { a: 1, b: 2, c: { foo: 'bax', a: { b: 1 }}}, false), 'objects any mismatch for all conditions')
    ok(!hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1, c: true }}}, false), 'objects extra key, value mismatch for all conditions')
    ok(hub.match(root, { a: 1, b: 2, e: sub }, root, false), 'objects referenced match for all conditions')

    ok(hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: { w: { a: 1, b: 2 }, x: true, y: false, z: func }, f: false }, true), 'objects all match for exact method')
    ok(hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: sub, f: false }, true), 'objects referenced match for exact method')
    ok(!hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: sub, f: false }, true), 'objects any mismatch for exact method')
    ok(!hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, e: sub, f: false }, true), 'objects missing key, value mismatch for exact method')
    ok(!hub.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: sub, f: false, g: { foo: 'bar' }}, true), 'objects extra key, value mismatch for exact method')

    ok(hub.match(root, { a: 1, b: '*' }, false), 'objects wild card match for all conditions')
    ok(!hub.match(root, { a: 1, g: '*' }, false), 'objects wild card mismatch for all conditions')

    ok(hub.match(root, { a: 1, b: function(value) { return value == 2 }}, false), 'objects function match for all conditions')
    ok(!hub.match(root, { a: 1, b: function(value) { return value == 3 }}, false), 'objects function mismatch for all conditions')

    ok(hub.match(array, [ 2 ]), 'simple array match')
    ok(!hub.match(array, [ 4 ]), 'simple array mismatch')

    ok(hub.match(array, [ 2, 4 ]), 'arrays any match for any conditions')
    ok(!hub.match(array, [ 4, 5 ]), 'arrays all mismatch for any conditions')

    ok(hub.match(array, [{ a: 1 }]), 'array object match')
    ok(!hub.match(array, [{ a: 3 }]), 'array object mismatch')

    ok(hub.match(array, [{ a: 1 }, { a: 2 }], false), 'arrays all match for all conditions')
    ok(!hub.match(array, [{ a: 1 }, { a: 3}], false), 'arrays any object mismatch for all conditions')
    ok(!hub.match(array, [ 3, { a: 1 }, { a: 2}], false), 'arrays any item mismatch for all conditions')
    ok(hub.match(array, [ 2, { a: 1 }, { a: 2}], false), 'arrays all items and objects match for all conditions')

    ok(!hub.match(array, [{ a: 1 }, { a: 2 }], true), 'arrays missing conditions for exact matching')
    ok(hub.match(array, [ 2, 1, true, root, { a: 2, b: 3 }], true), 'arrays all match for exact matching')
    ok(!hub.match(array, [ 2, 2, true, root, { a: 2, b: 3 }], true), 'arrays repeating mismatch for exact matching')
    ok(!hub.match(array, [ 2, 1, true, root, { a: 2, b: 3 }, true], true), 'arrays extra item mismatch for exact matching')
  })

  test('find data', 8, function() {
    var root = { a: 1000, z: 0 }
      , sub  = { good: { message: 'hello', foo: 'bar' }, bad: { message: 'goodbye', foo: 'bar' }}

    hub = skin.Hub.getInstance()

    hub.set(root, 'z', { a: { b: 1, c: 'foo', p: sub, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}})
    ok(hub.find(root.z, 'a.p.good', { message: 'hello' }) === sub.good, 'found the index of containing object, using pointer, string index and condition')
    ok(hub.find(root.z, ['a', 'p', 'bad'], { message: 'goodbye' }) === sub.bad, 'found the index of containing object, using pointer, array index and condition')

    ok(hub.find(root, 'z-a', { b: 1 }) === root.z.a , 'found, using pointer, string index and condition')
    ok(hub.find(root, 'z-a', { b: 2 }) === null, 'not found, using pointer, string index and condition')

    ok(hub.find(root.z, 'a', 'p', { bad: '*' }) === root.z.a.p, 'found, using pointer, string indices and condition')
    ok(hub.find(root.z, 'a', 'p', { bad: null }) === null, 'not found, using pointer, string indices and condition')

    ok(hub.find(root, 'z-a', { foo: 'bar' }, true) === root.z.a.p.good, 'found recursively, using pointer, string index and condition')
    ok(hub.find(root, { b: '*' }, true) === root.z.a, 'found recursively, using pointer and wild card condition')
  })

  test('search data', 8, function() {
    var root = { a: 1000, z: 0 }
      , sub  = { good: { message: 'hello', foo: 'bar' }, bad: { message: 'goodbye', foo: 'bar' }}

    hub = skin.Hub.getInstance()

    hub.set(root, 'z', { a: { b: 1, c: 'foo', p: sub, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}})
    ok(hub.search(root.z, 'a.p.good', { message: 'hello' })[0] === sub.good, 'found the index of containing object, using pointer, string index and condition')
    ok(hub.search(root.z, ['a', 'p', 'bad'], { message: 'goodbye' })[0] === sub.bad, 'found the index of containing object, using pointer, array index and condition')
    
    equal(hub.search(root, 'z-a', { b: 1 }).length, 1, 'found, using pointer, string index and condition')
    equal(hub.search(root, 'z-a', { b: 2 }).length, 0, 'not found, using pointer, string index and condition')

    equal(hub.search(root.z, 'a', 'p', { bad: '*' }).length, 1, 'found, using pointer, string indices and condition')
    equal(hub.search(root.z, 'a', 'p', { bad: null }).length, 0, 'not found, using pointer, string indices and condition')

    equal(hub.search(root, 'z-a', { foo: 'bar' }, true).length, 2, 'found recursively, using pointer, string index and condition')
    equal(hub.search(root, { b: '*' }, true).length, 2, 'found recursively, using pointer and wild card condition')
  })

  test('filter and reject data', 3, function() {
    hub = skin.Hub.getInstance()

    var test = { message: 'hi!' }
      , data = [{ a: 1, b: 2 }, { a: 2, b: { c: 3 }}, { b: 5 }, test, { foo: 'bar' }]
      , result
    result = hub.filter(data, { message: 'hi!' })
    equal(result[0], test, 'filtered objects by simple condition')

    var test = { message: 'hi!' }
      , data = [{ a: 1, b: 2 }, { a: 2, b: { c: 3 }}, { b: 5 }, test, { foo: 'bar' }]
      , result
    result = hub.filter(data, { b: function(value) { return value > 4 }})
    equal(result.length, 1, 'filtered objects by filter function')

    var test = { message: 'hi!' }
      , data = [{ a: 1, b: 2 }, { a: 2, b: { c: 3 }}, { b: 5 }, test, { foo: 'bar' }]
      , result
    result = hub.reject(data, { a: '*' })
    equal(result.length, 3, 'rejected objects by wild card condition')
  })

  test('on, off and trigger', 40, function() {
    hub = skin.Hub.getInstance()

    var modified = 'not modified'
      , counter  = 0
      , reset    = function() { modified = 'not modified'; counter = 0 }
      , modify   = function(data) { data && (modified = data.modified); counter++ }
      , sayHi    = function() { modified = 'hi'; counter++ }
      , sayBye   = function() { modified = 'bye'; counter++ }
      , sayYes   = function() { modified = true; counter++ }
      , sayNo    = function() { modified = false; counter++ }
      , dummy    = {}

    hub.on('foo.bar', modify)
    hub.trigger('foo.bar', { modified: true })
    equal(modified, true, 'simple subscription created and published, callback was invoked')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.on('foo.hello', sayHi)
    hub.trigger('foo.hello')
    equal(modified, 'hi', 'another simple subscription created and published, callback was invoked')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.on('foo.goodbye', sayBye)
    hub.trigger('foo')
    equal(modified, 'bye', 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 3, '3 callbacks were invoked')
    reset()

    hub.on('foo.bar.baz', sayNo)
    hub.trigger('foo.bar', { modified: 'baz says no' })
    equal(modified, false, 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.on('foo.bar', modify)
    hub.trigger('foo.bar', { modified: 'baz says no again' })
    equal(modified, false, 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 2, 'same callback was not invoked twice')
    reset()

    hub.on('foo.bar', sayYes)
    hub.trigger('foo.bar', { modified: 'baz says no again and again' })
    equal(modified, false, 'multiple subscription and publish, callbacks were invoked')
    equal(counter, 3, 'new callback was invoked, and was overriden by sub branch callback')
    reset()

    hub.off('foo.bar.baz')
    hub.trigger('foo.bar', { modified: 'killed baz' })
    equal(modified, true, 'multiple subscribe, unsubscribe and publish, callbacks were invoked')
    equal(counter, 2, '2 remaining callbacks were invoked')
    reset()

    hub.trigger(dummy, 'foo.bar', { modified: 'who is dummy?' })
    equal(modified, 'not modified', 'unknown publisher, no callbacks were invoked')
    equal(counter, 0, '0 callbacks invoked')
    reset()

    hub.on(dummy, 'foo.bar', modify)
    hub.trigger(dummy, 'foo', { modified: 'now here is the dummy' })
    equal(modified, 'now here is the dummy', 'publisher subscription and publish, callback was invoked')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.on(dummy, 'foo.bar', sayHi)
    hub.trigger(dummy, 'foo', { modified: 'dummy says hi' })
    equal(modified, 'hi', 'publisher subscription and publish, new callback was invoked')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.on(dummy, 'foo.baz', sayBye)
    hub.trigger(dummy, 'foo', { modified: 'dummy says bye' })
    equal(modified, 'bye', 'publisher subscription and publish, new callback on new branch was invoked')
    equal(counter, 3, '3 callbacks were invoked')
    reset()

    hub.off(dummy, sayHi);
    hub.trigger(dummy, 'foo', { modified: 'dummy does not say hi' })
    equal(modified, 'bye', 'publisher unsubscription and publish, remaining callback was invoked')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.on(dummy, 'path.to.some.long.topic', modify);
    hub.trigger(dummy, 'path.to.some.long.topic', { modified: 'came from a long way' })
    equal(modified, 'came from a long way', 'full message path subscribe and publish')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.trigger(dummy, 'path.to.some', { modified: 'came from a...' })
    equal(modified, 'came from a...', 'partial message path publish')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.trigger(dummy, 'path.to.some.wrong.topic', { modified: 'is it?!' })
    equal(modified, 'not modified', 'wrong message path published, nothing invoked')
    equal(counter, 0, '0 callbacks were invoked')
    reset()

    hub.on(dummy, 'path.to.some.other.long.topic', sayYes);
    hub.trigger(dummy, 'path.to.some.other.long')
    equal(modified, true, 'another full message path subscribe and publish')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.trigger(dummy, 'path')
    equal(modified, true, 'another partial message path subscribe and publish')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.off('path')
    hub.trigger(dummy, 'path', { modified: 'this will get overriden' })
    equal(modified, true, 'anonymous publisher unsubscribed, this publisher still works')
    equal(counter, 2, '2 callbacks were invoked')
    reset()

    hub.off(dummy, 'path.to.some.other')
    hub.trigger(dummy, 'path', { modified: 'this wont get overriden' })
    equal(modified, 'this wont get overriden', 'other path unsubscribed, this path still works')
    equal(counter, 1, '1 callback was invoked')
    reset()

    hub.off(dummy)
    hub.trigger(dummy, 'path', { modified: 'is there any body out there?' })
    equal(modified, 'not modified', 'all callbacks for publisher unsubscribed')
    equal(counter, 0, '0 callbacks were invoked')
    reset()

  })

});