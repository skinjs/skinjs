$(document).ready(function() {

  module("Data");

  var Data = Skin.Data

  test('access data', 10, function() {
    var data = { foo: { bar: 'baz' }}

    equal(Data.get(data.foo, 'bar'), 'baz', 'get data by pointer and string index')

    Data.set(data.foo, 'bar.baz', { boo: [1, 2, 3] });
    equal(Data.get(data.foo, 'bar.baz.boo'), data.foo.bar.baz.boo, 'set data by pointer and string index')

    equal(Data.get(data.foo, ['bar']), data.foo.bar, 'get data by pointer and array index')

    Data.set(data.foo, ['boo', 'koo'], { goo: 'hello' });
    equal(Data.get(data.foo, ['boo', 'koo', 'goo']), data.foo.boo.koo.goo, 'set data by pointer and array index')

    Data.set(data, 'a.b.c', { d: { e: 'f' }});
    equal(Data.get(data, 'a-b-c-d-e'), 'f', 'get and set data by pointer and string index')

    Data.set(data.foo, ['z', ['y.x', 'w'], 'v'], { t: 's' });
    equal(Data.get(data, 'foo z y x', 'w', ['v.t']), 's', 'get and set data by mixed index')

    Data.set(data, 'newData');
    ok(Data.get(data, 'newData') instanceof Object, 'new empty data object was set under root')

    var someData  = { foo: 'barrr', boo: 'bazzz' }
      , otherData = { someData: someData }
    Data.set(data, 'someKey', 'someOtherKey', otherData)
    equal(Data.get(data, 'someKey.someOtherKey', 'someData.foo'), 'barrr', 'mixed access')

    var basedData = { base: someData }
    Data.set(data, 'myBasedData', basedData)
    equal(Data.get(data.myBasedData, 'boo'), 'bazzz', 'access to based on reference data')
    Data.set(data, 'myBasedData', 'foo', 'barr')
    equal(Data.get(data.myBasedData, 'foo'), 'barr', 'modify a value in based on reference data')
  })

  test('remove, non existing data', 2, function() {
    var data = {}
    Data.set(data, 'a.b.c', { d: { e: 'f' }})
    equal(Data.get(data, 'a.b.z'), null, 'null returned for non existing index')
    Data.set(false, data, ['a', 'b'], null)
    ok(!Data.get(data, 'a').hasOwnProperty('b'), 'set null removes the index')
  })

  test('match data', 18, function() {
    var func = function() {}
      , sub  = { w: { a: 1, b: 2 }, x: true, y: false, z: func }
      , root = { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: sub, f: false }
    ok (Data.match(root, { a: 1 }), 'simple match')
    ok (!Data.match(root, { a: 2 }), 'simple mismatch')

    ok (Data.match(root, { a: 1, b: 2 }), 'all match for any conditions')
    ok (Data.match(root, { a: 1, b: 1, s: 3, e: false }), 'any match for any conditions')
    ok (!Data.match(root, { a: 0, b: 1, s: 3, e: false }), 'all mismatch for any conditions')

    ok (Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}}, false), 'all match for all conditions')
    ok (!Data.match(root, { a: 1, b: 2, c: { foo: 'bax', a: { b: 1 }}}, false), 'any mismatch for all conditions')
    ok (!Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1, c: true }}}, false), 'extra key, value mismatch for all conditions')
    ok (Data.match(root, { a: 1, b: 2, e: sub }, root, false), 'referenced match for all conditions')

    ok (Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: { w: { a: 1, b: 2 }, x: true, y: false, z: func }, f: false }, true), 'all match for exact method')
    ok (Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: sub, f: false }, true), 'referenced match for exact method')
    ok (!Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: sub, f: false }, true), 'any mismatch for exact method')
    ok (!Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, e: sub, f: false }, true), 'missing key, value mismatch for exact method')
    ok (!Data.match(root, { a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: sub, f: false, g: { foo: 'bar' }}, true), 'extra key, value mismatch for exact method')

    ok (Data.match(root, { a: 1, b: '*' }, false), 'wild card match for all conditions')
    ok (!Data.match(root, { a: 1, g: '*' }, false), 'wild card mismatch for all conditions')
    ok (Data.match(root, { a: 1, b: function(value) { return value == 2 }}, false), 'filter function match for all conditions')
    ok (!Data.match(root, { a: 1, b: function(value) { return value == 3 }}, false), 'filter function mismatch for all conditions')
  })

  test('find data', 8, function() {
    var root = { a: 1000, z: 0 }
      , sub  = { good: { message: 'hello', foo: 'bar' }, bad: { message: 'goodbye', foo: 'bar' }}

    Data.set(root, 'z', { a: { b: 1, c: 'foo', p: sub, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}})
    equal(Data.find(root.z, 'a.p', 'good', { message: 'hello' })[0], sub.good, 'found the index of containing object, using pointer, string index and condition')
    equal(Data.find(false, root.z, ['a', 'p', 'bad'], { message: 'goodbye' })[0], sub.bad, 'found the index of containing object, using pointer, array index and condition')
    
    equal(Data.find(root, 'z-a', { b: 1 }).length, 1, 'found, using pointer, string index and condition')
    equal(Data.find(root, 'z-a', { b: 2 }).length, 0, 'not found, using pointer, string index and condition')

    equal(Data.find(root.z, 'a', 'p', { bad: '*' }).length, 1, 'found, using pointer, string indices and condition')
    equal(Data.find(root.z, 'a', 'p', { bad: null }).length, 0, 'not found, using pointer, string indices and condition')

    equal(Data.find(root, 'z-a', { foo: 'bar' }, true).length, 2, 'found recursively, using pointer, string index and condition')
    equal(Data.find(root, { b: '*' }, true).length, 2, 'found recursively, using pointer and wild card condition')
  })

  test('filter data', 2, function() {
    var test = { message: 'hi!' }
      , data = [{ a: 1, b: 2 }, { a: 2, b: { c: 3 }}, { b: 5 }, test, { foo: 'bar' }]
      , result
    result = Data.filter(data, { message: 'hi!' })
    equal(result[0], test, 'filtered objects by simple condition')

    var test = { message: 'hi!' }
      , data = [{ a: 1, b: 2 }, { a: 2, b: { c: 3 }}, { b: 5 }, test, { foo: 'bar' }]
      , result
    result = Data.filter(data, { b: function(value) { return value > 4 }})
    equal(result.length, 1, 'filtered objects by filter function')
  })

});
