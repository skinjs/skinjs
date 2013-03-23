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

  test('access by pointer and string index', 2, function() {
    var predefined = { foo: { bar: 'baz' }}
      , data       = new Skin.Data(predefined);
    equal (data.get('foo'), predefined.foo, 'get data by pointer and string index');

    data.set(predefined.foo, 'bar.baz', { bax: [1, 2, 3] });
    equal (data.get(predefined.foo, 'bar.baz.bax'), predefined.foo.bar.baz.bax, 'set data by pointer and string index');
  });

  test('access by pointer and array index', 2, function() {
    var predefined = { foo: { bar: 'baz' }}
      , data       = new Skin.Data(predefined);
    equal (data.get(['foo']), predefined.foo, 'get data by pointer and array index');

    data.set(predefined.foo, ['bar', 'baz'], { bax: [1, 2, 3] });
    equal (data.get(predefined.foo, ['bar', 'baz', 'bax']), predefined.foo.bar.baz.bax, 'set data by pointer and array index');
  });

  test('access by string index', 1, function() {
    var data = new Skin.Data();
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
      , subObject = { w: { a: 1, b: 2 }, x: true, y: false, z: func }
      , object = { a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: subObject, f: false };
    ok (Skin.Data.match({ a: 1 }, object), 'simple match');
    ok (!Skin.Data.match({ a: 2 }, object), 'simple mismatch');

    ok (Skin.Data.match({ a: 1, b: 2 }, object), 'all match for any conditions');
    ok (Skin.Data.match({ a: 1, b: 1, s: 3, e: false }, object), 'any match for any conditions');
    ok (!Skin.Data.match({ a: 0, b: 1, s: 3, e: false }, object), 'all mismatch for any conditions');

    ok (Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}}, object, false), 'all match for all conditions');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bax', a: { b: 1 }}}, object, false), 'any mismatch for all conditions');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1, c: true }}}, object, false), 'extra key, value mismatch for all conditions');
    ok (Skin.Data.match({ a: 1, b: 2, e: subObject }, object, false), 'referenced match for all conditions');

    ok (Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: { w: { a: 1, b: 2 }, x: true, y: false, z: func }, f: false }, object, true), 'all match for exact method');
    ok (Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 1 }}, d: true, e: subObject, f: false }, object, true), 'referenced match for exact method');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: subObject, f: false }, object, true), 'any mismatch for exact method');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, e: subObject, f: false }, object, true), 'missing key, value mismatch for exact method');
    ok (!Skin.Data.match({ a: 1, b: 2, c: { foo: 'bar', a: { b: 2 }}, d: true, e: subObject, f: false, g: { foo: 'bar' }}, object, true), 'extra key, value mismatch for exact method');
  });

  // test('find by pointer, index and condition', 1, function() {
  //   var root       = { a: 1000, z: 0 }
  //     , predefined = { b: { c: 'baz' }}
  //     , data       = new Skin.Data(root);
  //   data.set('z', { a: { b: 1, c: 'foo', p: predefined, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}});
  //   data.find(root.z, 'a.p', { c: 'baz' });
  // });

});
