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

  test('get and set by pointer and string index', 2, function() {
    var predefined = { foo: { bar: 'baz' }}
      , data       = new Skin.Data(predefined);
    equal (data.get('foo'), predefined.foo, 'get data by pointer and string index');

    data.set(predefined.foo, 'bar.baz', { bax: [1, 2, 3] });
    equal (data.get(predefined.foo, 'bar.baz.bax'), predefined.foo.bar.baz.bax, 'set data by pointer and string index');
  });

  test('get and set by pointer and array index', 2, function() {
    var predefined = { foo: { bar: 'baz' }}
      , data       = new Skin.Data(predefined);
    equal (data.get(['foo']), predefined.foo, 'get data by pointer and array index');

    data.set(predefined.foo, ['bar', 'baz'], { bax: [1, 2, 3] });
    equal (data.get(predefined.foo, ['bar', 'baz', 'bax']), predefined.foo.bar.baz.bax, 'set data by pointer and array index');
  });

  test('get and set by string index', 1, function() {
    var data = new Skin.Data();
    data.set('a.b.c', { d: { e: 'f' }});
    equal (data.get('a-b-c-d-e'), 'f', 'get and set data by string index');
  });

  test('set null, not found', 2, function() {
    var data = new Skin.Data();
    data.set('a.b.c', { d: { e: 'f' }});
    equal (data.get('a.b.z'), null, 'null returned for non existing index');
    data.set(['a', 'b'], null);
    ok (!data.get('a').hasOwnProperty('b'), 'set null removes the index');
  });

  test('find by pointer, index and condition', 1, function() {
    var root       = { a: 1000, z: 0 }
      , predefined = { b: { c: 'baz' }}
      , data       = new Skin.Data(root);
    data.set('z', { a: { b: 1, c: 'foo', p: predefined, d: { b: 1, c: 'bar', d: { a: true, g: 'foo' }}}});
    data.find(root.z, 'a.p', { c: 'baz' });
  });

});
