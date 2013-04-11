$(document).ready(function() {

  module('skin: adapter')

  var adapter

  test('availability', 1, function() {
    adapter = skin.adapter
    ok(adapter != undefined, 'skin adapter is available')
  })

  test('shortcuts', 4, function() {
    adapter = skin.adapter
    ok(adapter.objects === Object.prototype, 'object prototype')
    ok(adapter.arrays === Array.prototype, 'array prototype')
    ok(adapter.arraySlice === Array.prototype.slice, 'array slice')
    ok(adapter.objectHas === Object.prototype.hasOwnProperty, 'object has own property')
  })

  test('basic helper methods', 33, function() {
    adapter = skin.adapter
    var array = [1, 2, 3], object = { key: 'value' }, string = "string"
    ok(adapter.isArray(array), 'detect array by reference')
    ok(adapter.isArray([]), 'detect empty array on the fly')
    ok(!adapter.isArray(object), 'object is not array')
    ok(!adapter.isArray(string), 'string is not array')
    ok(!adapter.isArray(null), 'null is not array')
    ok(!adapter.isArray(), 'undefined is not array')

    ok(adapter.isString(string), 'detect string by reference')
    ok(adapter.isString(''), 'detect empty string')
    ok(!adapter.isString(array), 'array is not string')
    ok(!adapter.isString(object), 'object is not string')
    ok(!adapter.isString(null), 'null is not string')
    ok(!adapter.isString(), 'undefined is not string')

    ok(adapter.isFunction(function() {}), 'detect function')
    ok(!adapter.isFunction(object), 'object is not function')
    ok(!adapter.isFunction(null), 'null is not function')
    ok(!adapter.isFunction(), 'undefined is not function')

    ok(adapter.isBoolean(true), 'detect boolean')
    ok(!adapter.isBoolean(object), 'object is not boolean')
    ok(!adapter.isBoolean(null), 'null is not boolean')
    ok(!adapter.isBoolean(), 'undefined is not boolean')

    ok(adapter.isUndefined(), 'detect undefined')
    ok(!adapter.isUndefined(null), 'null is not undefined')
    ok(!adapter.isUndefined(object), 'object is not undefined')

    ok(adapter.isObject(object), 'detect object by reference')
    ok(adapter.isObject({}), 'detect empty object on the fly')
    ok(!adapter.isObject(array), 'array is not object')
    ok(!adapter.isObject(string), 'string is not object')
    ok(!adapter.isObject(null), 'null is not object')
    ok(!adapter.isObject(), 'undefined is not object')

    ok(adapter.isElement(document.body), 'detect element')
    ok(!adapter.isElement(object), 'object is not element')
    ok(!adapter.isElement(null), 'null is not element')
    ok(!adapter.isElement(), 'undefined is not element')
  })

  test('each', 2, function() {
    adapter = skin.adapter
    var array  = [1, 2, 3, null, 4]
      , object = { a: 1, b: { c: true }, d: undefined, e: null, f: 'foo', g: [1, 2, 3] }
      , count  = 0
    adapter.each(array, function(item) { if (item) count += item })
    equal(count, 10, 'iterated through array')
    count = 0
    adapter.each(object, function(item) { count++ })
    equal(count, 6, 'iterated through object')
  })

  test('basic filter and reject', 2, function() {
    adapter = skin.adapter
    var array  = [1, 2, 3, 4, 5, 'a', 'b', 'c', 'foo', 'bar', 'z'];
    adapter.filter(array, function(item) { return typeof item === 'string' });
    equal(array.length, 6, 'basic filter function applied to array')
    adapter.reject(array, function(item) { return item.length > 1 });
    equal(array.length, 4, 'basic reject function applied to array')
  })

  test('object keys', 2, function() {
    adapter = skin.adapter
    var full  = { a: 1, b: { c: true }, d: undefined, e: null, f: 'foo', g: [1, 2, 3] }
      , empty = {}
    equal(adapter.keys(full).length, 6, 'got object keys for full object')
    equal(adapter.keys(empty).length, 0, 'did not get object keys for empty object')
  })

});