$(document).ready(function() {

  module("Data");

  test('instantiation', 3, function() {
    var bareData = new Skin.Data();
    ok (bareData instanceof Object, 'object is instance of class');

    var predefined     = { foo: 'bar' }
      , predefinedData = new Skin.Data(predefined);
    ok (predefinedData instanceof Object, 'object is instance of class');
    equal (predefinedData.get(), predefined, 'data returns its root data object');
  });

  test('sanitize index', 1, function() {
    var index = Skin.Data.sanitize('a', 'b.c', ['d.e', 'f-g-h', ['i', 'j'], 'k'], 'l', 'm', 'n', ['o', 'p'], 'q', 'r', ['s.t.u.v'], 'w x', 'y', ['z']);
    equal (index.length, 26, 'sanitized mixed index path');
  });

  test('access data', 5, function() {
    var root = { foo: { bar: 'baz' }}
      , data = new Skin.Data(root);

    equal (data.get('foo'), root.foo, 'get data by pointer and string index');

    data.set(root.foo, 'bar.baz', { bax: [1, 2, 3] });
    equal (data.get(root.foo, 'bar.baz.bax'), root.foo.bar.baz.bax, 'set data by pointer and string index');

    equal (data.get(['foo']), root.foo, 'get data by pointer and array index');

    data.set(root.foo, ['boo', 'koo'], { goo: 'hello' });
    equal (data.get(root.foo, ['boo', 'koo', 'goo']), root.foo.boo.koo.goo, 'set data by pointer and array index');

    data.set('a.b.c', { d: { e: 'f' }});
    equal (data.get('a-b-c-d-e'), 'f', 'get and set data by string index');
  });

  test('remove, non existing data', 2, function() {
    var data = new Skin.Data();
    data.set('a.b.c', { d: { e: 'f' }});
    equal (data.get('a.b.z'), null, 'null returned for non existing index');
    data.set(['a', 'b'], null);
    ok (!data.get('a').hasOwnProperty('b'), 'set null removes the index');
  });

  test('match data', 14, function() {
    var func = function() {}
      , sub  = { w: { a: 1, b: 2 }, x: true, y: false, z: func }
      , root = { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: sub, f: false };
    ok (Skin.Data.match({ a: 1 }, root), 'simple match');
    ok (!Skin.Data.match({ a: 2 }, root), 'simple mismatch');

    ok (Skin.Data.match({ a: 1, b: 2 }, root), 'all match for any conditions');
    ok (Skin.Data.match({ a: 1, b: 1, s: 3, e: false }, root), 'any match for any conditions');
    ok (!Skin.Data.match({ a: 0, b: 1, s: 3, e: false }, root), 'all mismatch for any conditions');

    ok (Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}}, root, false), 'all match for all conditions');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bax', a: { b: 1 }}}, root, false), 'any mismatch for all conditions');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1, c: true }}}, root, false), 'extra key, value mismatch for all conditions');
    ok (Skin.Data.match({ a: 1, b: 2, e: sub }, root, false), 'referenced match for all conditions');

    ok (Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: { w: { a: 1, b: 2 }, x: true, y: false, z: func }, f: false }, root, true), 'all match for exact method');
    ok (Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: sub, f: false }, root, true), 'referenced match for exact method');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: sub, f: false }, root, true), 'any mismatch for exact method');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, e: sub, f: false }, root, true), 'missing key, value mismatch for exact method');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: sub, f: false, g: { foo: 'bar' }}, root, true), 'extra key, value mismatch for exact method');
  });

  test('find data', 5, function() {
    var root = { a: 1000, z: 0 }
      , sub  = { good: { message: 'hello', foo: 'bar' }, bad: { message: 'goodbye', foo: 'bar' }}
      , data = new Skin.Data(root);
    data.set('z', { a: { b: 1, c: 'foo', p: sub, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}});
    equal (data.find(root.z, 'a.p', { message: 'hello' })[0], 'good', 'found the index of direct child, using pointer, string index and condition');
    equal (data.find(root.z, ['a', 'p'], { message: 'goodbye' })[0], 'bad', 'found the index of direct child, using pointer, array index and condition');
    equal (data.find(root.z.a.p, { foo: 'bar' }).length, 2, 'found the indices of direct children, using pointer and condition');
    equal (data.find(root, 'z-a', { b: 1 }).length, 1, 'found, using pointer, string index and condition');
    equal (data.find(root, 'z-a', { b: 2 }).length, 0, 'not found, using pointer, string index and condition');
  });

});
