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


});