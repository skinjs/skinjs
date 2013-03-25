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
  });

  test('remove, non existing data', 2, function() {
    var data = {}
    Data.set(data, 'a.b.c', { d: { e: 'f' }})
    equal(Data.get(data, 'a.b.z'), null, 'null returned for non existing index')
    Data.set(false, data, ['a', 'b'], null)
    ok(!Data.get(data, 'a').hasOwnProperty('b'), 'set null removes the index')
  });

  test('find data', 7, function() {
    var root = { a: 1000, z: 0 }
      , sub  = { good: { message: 'hello', foo: 'bar' }, bad: { message: 'goodbye', foo: 'bar' }}

    Data.set(root, 'z', { a: { b: 1, c: 'foo', p: sub, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}})
    equal(Data.find(root.z, 'a.p', { message: 'hello' })[0], sub.good, 'found the index of direct child, using pointer, string index and condition')
    equal(Data.find(root.z, ['a', 'p'], { message: 'goodbye' })[0], sub.bad, 'found the index of direct child, using pointer, array index and condition')
    equal(Data.find(root.z.a.p, { foo: 'bar' }).length, 2, 'found the indices of direct children, using pointer and condition')

    equal(Data.find(root, 'z-a', { b: 1 }).length, 1, 'found, using pointer, string index and condition')
    equal(Data.find(root, 'z-a', { b: 2 }).length, 0, 'not found, using pointer, string index and condition')

    equal(Data.find(root, 'z-a', { foo: 'bar' }, true).length, 2, 'found recursively, using pointer, string index and condition')
    equal(Data.find(root, { b: '*' }, true).length, 2, 'found recursively, using pointer and wild card condition')
  });

});
