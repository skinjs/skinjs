$(document).ready(function() {

  module('Tools')

  var Tools

  test('availability', 1, function() {
    Tools = Skin.Tools
    ok(Tools != undefined, 'Tools module is available')
  })

  test('shortcuts', 4, function() {
    Tools = Skin.Tools
    ok(Tools.objects === Object.prototype, 'object prototype')
    ok(Tools.arrays === Array.prototype, 'array prototype')
    ok(Tools.arraySlice === Array.prototype.slice, 'array slice')
    ok(Tools.objectHas === Object.prototype.hasOwnProperty, 'object has own property')
  })

  test('basic helper methods', 33, function() {
    Tools = Skin.Tools
    var array = [1, 2, 3], object = { key: 'value' }, string = "string"
    ok(Tools.isArray(array), 'detect array by reference')
    ok(Tools.isArray([]), 'detect empty array on the fly')
    ok(!Tools.isArray(object), 'object is not array')
    ok(!Tools.isArray(string), 'string is not array')
    ok(!Tools.isArray(null), 'null is not array')
    ok(!Tools.isArray(), 'undefined is not array')

    ok(Tools.isString(string), 'detect string by reference')
    ok(Tools.isString(''), 'detect empty string')
    ok(!Tools.isString(array), 'array is not string')
    ok(!Tools.isString(object), 'object is not string')
    ok(!Tools.isString(null), 'null is not string')
    ok(!Tools.isString(), 'undefined is not string')

    ok(Tools.isFunction(function() {}), 'detect function')
    ok(!Tools.isFunction(object), 'object is not function')
    ok(!Tools.isFunction(null), 'null is not function')
    ok(!Tools.isFunction(), 'undefined is not function')

    ok(Tools.isBoolean(true), 'detect boolean')
    ok(!Tools.isBoolean(object), 'object is not boolean')
    ok(!Tools.isBoolean(null), 'null is not boolean')
    ok(!Tools.isBoolean(), 'undefined is not boolean')

    ok(Tools.isUndefined(), 'detect undefined')
    ok(!Tools.isUndefined(null), 'null is not undefined')
    ok(!Tools.isUndefined(object), 'object is not undefined')

    ok(Tools.isObject(object), 'detect object by reference')
    ok(Tools.isObject({}), 'detect empty object on the fly')
    ok(!Tools.isObject(array), 'array is not object')
    ok(!Tools.isObject(string), 'string is not object')
    ok(!Tools.isObject(null), 'null is not object')
    ok(!Tools.isObject(), 'undefined is not object')

    ok(Tools.isElement(document.body), 'detect element')
    ok(!Tools.isElement(object), 'object is not element')
    ok(!Tools.isElement(null), 'null is not element')
    ok(!Tools.isElement(), 'undefined is not element')
  })

  test('each', 2, function() {
    Tools = Skin.Tools
    var array  = [1, 2, 3, null, 4]
      , object = { a: 1, b: { c: true }, d: undefined, e: null, f: 'foo', g: [1, 2, 3] }
      , count  = 0
    Tools.each(array, function(item) { if (item) count += item })
    equal(count, 10, 'iterated through array')
    count = 0
    Tools.each(object, function(item) { count++ })
    equal(count, 6, 'iterated through object')
  })

  test('basic filter and reject', 2, function() {
    Tools = Skin.Tools
    var array  = [1, 2, 3, 4, 5, 'a', 'b', 'c', 'foo', 'bar', 'z'];
    Tools.filter(array, function(item) { return typeof item === 'string' });
    equal(array.length, 6, 'basic filter function applied to array')
    Tools.reject(array, function(item) { return item.length > 1 });
    equal(array.length, 4, 'basic reject function applied to array')
  })

  test('object keys', 2, function() {
    Tools = Skin.Tools
    var full  = { a: 1, b: { c: true }, d: undefined, e: null, f: 'foo', g: [1, 2, 3] }
      , empty = {}
    equal(Tools.keys(full).length, 6, 'got object keys for full object')
    equal(Tools.keys(empty).length, 0, 'did not get object keys for empty object')
  })

});